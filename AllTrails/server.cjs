// ---------------------------------------------------------------------------
// server.cjs – Express API for AllTrails (SQL Server)
// ---------------------------------------------------------------------------
// Endpoints
//   • GET  /api/trails                         → list
//   • GET  /api/trails/:id                     → single trail
//   • GET  /api/analytics/top-rated            →  Q1 (avg rating ≥ minReviews)
//   • GET  /api/user/:id/recommendations       →  stored proc RecommendTrailsForUser
// ---------------------------------------------------------------------------

const express = require("express");
const sql = require("mssql/msnodesqlv8");
const cors = require("cors");

const app = express();
app.use(
  cors({
    origin: "http://localhost:5173",   
    credentials: false               
  })
);

app.use(express.json());

// SQL Server connection
const sqlConfig = {
  server: "DESKTOP-BJDG4CK\\SQLEXPRESS",
  database: "allTrails",
  driver: "msnodesqlv8",
  options: { trustedConnection: true, trustServerCertificate: true },
  authentication: {
    type: "ntlm",
    options: { domain: "", userName: "", password: "" },
  },
};

// Share one global pool
let poolPromise = sql.connect(sqlConfig);

// ---------------------------------------------------------------------------
// Routes
// ---------------------------------------------------------------------------

// GET all trails (lightweight list)
app.get("/api/trails", async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query(`
      SELECT  T.TrailID,
              T.Name,
              T.Length2D,
              T.Uphill,
              T.Downhill,
              T.MinElevation,
              T.GeoBoundary,
              (SELECT AVG(Rating) FROM Review R WHERE R.TrailID = T.TrailID) AS AvgRating
      FROM    dbo.Trail AS T;
    `);
    res.json(result.recordset);
  } catch (err) {
    console.error("SQL error", err);
    res.status(500).send("Error querying database");
  }
});

// Q1 – Top-rated trails (≥ minReviews reviews AND ≥ minRating average)
app.get("/api/analytics/top-rated", async (req, res) => {
  const minReviews = Number(req.query.minReviews) || 5;
  const minRating  = Number(req.query.minRating)  || 3.9;

  try {
    const pool = await poolPromise;
    const result = await pool
      .request()
      .input("minReviews", sql.Int,   minReviews)
      .input("minRating",  sql.Float, minRating)
      .query(`
        WITH Ratings AS (
            SELECT  T.TrailID,
                    T.Name,
                    CAST(AVG(CAST(R.Rating AS DECIMAL(4,2))) AS DECIMAL(4,2)) AS avgRating,
                    COUNT(*) AS numReviews
            FROM    dbo.Trail  T
            JOIN    dbo.Review R ON R.TrailID = T.TrailID
            GROUP BY T.TrailID, T.Name
            HAVING  COUNT(*) >= @minReviews
               AND  AVG(R.Rating) >= @minRating
        ),
        Ranked AS (
            SELECT *,
                   ROW_NUMBER() OVER (
                       PARTITION BY Name
                       ORDER BY avgRating DESC,
                                numReviews DESC,
                                TrailID
                   ) AS rn
            FROM Ratings
        )
        SELECT  TrailID AS trailId,
                Name    AS name,
                avgRating,
                numReviews
        FROM    Ranked
        WHERE   rn = 1
        ORDER BY avgRating DESC;
      `);

    res.json(result.recordset);
  } catch (err) {
    console.error("SQL error", err);
    res.status(500).send("Error executing top-rated query");
  }
});



// GET single trail by ID
app.get("/api/trails/:id", async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool
      .request()
      .input("id", sql.BigInt, req.params.id)
      .query("SELECT * FROM dbo.Trail WHERE TrailID = @id");
    if (!result.recordset.length) return res.status(404).send("Trail not found");
    res.json(result.recordset[0]);
  } catch (err) {
    console.error("SQL error", err);
    res.status(500).send("Database error");
  }
});
// GET /api/recommendations?userId=1&top=5&minReviews=0&lat=..&lng=..&radiusKm=300
app.get("/api/recommendations", async (req, res) => {
  try {
    const userId     = Number.parseInt(req.query.userId, 10);
    const top        = Number.isFinite(Number(req.query.top)) ? Number(req.query.top) : 5;
    const minReviews = Number.isFinite(Number(req.query.minReviews)) ? Number(req.query.minReviews) : 0;

    const norm = (v) => (v == null ? null : Number.parseFloat(String(v).replace(",", ".")));
    const lat = norm(req.query.lat);
    const lng = norm(req.query.lng);

    // keep radius as km (float), clamp to sane bounds
    let radiusKm = Number.parseFloat(req.query.radiusKm);
    if (!Number.isFinite(radiusKm)) radiusKm = 300;
    radiusKm = Math.min(Math.max(radiusKm, 0), 20000); // 0..20,000 km

    if (!Number.isFinite(userId) || userId <= 0) return res.status(400).json({ error: "userId is required" });
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) return res.status(400).json({ error: "lat and lng are required" });

    const pool = await poolPromise;

    const rs = await pool.request()
      .input("Lat",        sql.Float,  lat)
      .input("Lng",        sql.Float,  lng)
      .input("Top",        sql.Int,    top)
      .input("MinReviews", sql.Int,    minReviews)
      .input("RadiusKm",   sql.Float,  radiusKm)  // << float km, not int meters
      .query(`
        DECLARE @pt geography = geography::Point(@Lat, @Lng, 4326);

        WITH RatingAgg AS (
          SELECT R.TrailID,
                 AVG(CAST(R.Rating AS float)) AS avgRating,
                 COUNT(*)                     AS numReviews
          FROM dbo.Review AS R
          GROUP BY R.TrailID
        ),
        Qualified AS (
          SELECT
            T.TrailID,
            T.Name,
            COALESCE(RA.avgRating, 0)  AS avgRating,
            COALESCE(RA.numReviews, 0) AS numReviews,
            T.Geog.STDistance(@pt) / 1000.0 AS kmAway  -- distance in KM
          FROM dbo.Trail AS T
          LEFT JOIN RatingAgg AS RA
            ON RA.TrailID = T.TrailID
          WHERE T.Geog IS NOT NULL
            AND COALESCE(RA.numReviews, 0) >= @MinReviews
        ),
        Dedup AS (
          SELECT *,
                 ROW_NUMBER() OVER (
                   PARTITION BY LTRIM(RTRIM(LOWER(Name)))
                   ORDER BY avgRating DESC, numReviews DESC, kmAway ASC, TrailID
                 ) AS rn
          FROM Qualified
        )
        SELECT TOP (@Top)
               TrailID   AS trailId,
               Name      AS name,
               CAST(ROUND(avgRating,2) AS DECIMAL(4,2))  AS avgRating,
               CAST(ROUND(kmAway,1)    AS DECIMAL(10,1)) AS kmAway
        FROM Dedup
        WHERE rn = 1
        ORDER BY
          CASE WHEN kmAway <= @RadiusKm THEN 0 ELSE 1 END,  -- inside radius first
          kmAway ASC,
          avgRating DESC,
          numReviews DESC,
          trailId;
      `);

    res.json(rs.recordset);
  } catch (err) {
    console.error("Recommendations error", err);
    res.status(500).send("Failed to compute recommendations");
  }
});




// Q2 – Difficulty distribution + % share + avg rating  (Level-3) // on trail detail
app.get("/api/trails/:id/difficulty-dist", async (req, res) => {
  const trailId = Number(req.params.id);

  try {
    const pool = await poolPromise;
    const result = await pool
      .request()
      .input("trailId", sql.BigInt, trailId)
      .query(`
        /* Pre-compute total # reviews for this trail */
        WITH Totals AS (
          SELECT TrailID, COUNT(*) AS totalReviews
          FROM   dbo.Review
          WHERE  TrailID = @trailId
          GROUP  BY TrailID
        )
        SELECT  COALESCE(R.Difficulty,'Unrated')  AS difficulty,
                COUNT(*)                          AS numReviews,
                AVG(R.Rating)                     AS avgRating,
                ROUND(
                  100.0 * COUNT(*) / NULLIF(T.totalReviews,0), 2
                )                                 AS pctOfTotal
        FROM        dbo.Review R
        JOIN        Totals       T ON T.TrailID = R.TrailID   -- CTE join → Level 3
        WHERE       R.TrailID = @trailId
        GROUP BY    COALESCE(R.Difficulty,'Unrated'), T.totalReviews
        ORDER BY    numReviews DESC;
      `);

    res.json(result.recordset);
  } catch (err) {
    console.error("SQL error", err);
    res.status(500).send("Error executing difficulty distribution query");
  }
});

// Q3 – Most-active hikers (total 3-D distance)
app.get("/api/analytics/top-hikers", async (_req, res) => {
  try {
    const pool = await poolPromise;
    const rs = await pool.request().query(`
      SELECT  U.UserID      AS userId,
              U.Name        AS name,
              SUM(T.Length3D) AS totalDistance
      FROM    dbo.Hiker  H
      JOIN    dbo.Users  U  ON U.UserID  = H.UserID
      JOIN    dbo.Hike   HI ON HI.HikeID = H.HikeID
      JOIN    dbo.Trail  T  ON T.TrailID = HI.TrailID
      GROUP BY U.UserID, U.Name
      HAVING   SUM(T.Length3D) > 0
      ORDER  BY totalDistance DESC;
    `);
    res.json(rs.recordset);
  } catch (err) {
    console.error("SQL error", err);
    res.status(500).send("Top-hikers query failed");
  }
});

// Q4 – Long (>10 mi) & highly-rated (>3.5) challenge trails
app.get("/api/analytics/challenge-trails", async (req, res) => {
  const minMiles = Number(req.query.minMiles) || 10;
  const minRating = Number(req.query.minRating) || 3.5;
  const minMeters = minMiles * 1609.34;

  try {
    const pool = await poolPromise;
    const rs = await pool
      .request()
      .input("minMeters", sql.Float, minMeters)
      .input("minRating", sql.Float, minRating)
      .query(`
        WITH AvgRatings AS (
          SELECT TrailID, AVG(CAST(Rating AS FLOAT)) AS AvgRating
          FROM   dbo.Review
          GROUP  BY TrailID
        ),
        Qualified AS (
          SELECT T.TrailID,
                 T.Name,
                 T.Length3D,
                 ROUND(T.Length3D / 1609.34, 2) AS LengthMiles,
                 ROUND(AR.AvgRating, 2)        AS AvgRating
          FROM   dbo.Trail T
          JOIN   AvgRatings AR ON AR.TrailID = T.TrailID
          WHERE  T.Length3D > @minMeters
            AND  AR.AvgRating >= @minRating
        ),
        Ranked AS (
          SELECT *,
                 ROW_NUMBER() OVER (
                   PARTITION BY Name
                   ORDER BY AvgRating DESC, Length3D DESC, TrailID
                 ) AS rn
          FROM Qualified
        )
        SELECT TrailID      AS trailId,
               Name         AS name,
               LengthMiles  AS lengthMiles,
               AvgRating    AS avgRating
        FROM   Ranked
        WHERE  rn = 1
        ORDER  BY avgRating DESC;
      `);

    res.json(rs.recordset);
  } catch (err) {
    console.error("SQL error", err);
    res.status(500).send("Challenge-trails query failed");
  }
});


// Q5 – Club membership counts
app.get("/api/clubs/sizes", async (_req, res) => {
  try {
    const pool = await poolPromise;
    const rs = await pool.request().query(`
      SELECT  HC.ClubID AS clubId,
              HC.Name   AS name,
              COUNT(*)  AS numMembers
      FROM    dbo.HikingClub HC
      JOIN    dbo.Member     M  ON M.ClubID = HC.ClubID
      GROUP   BY HC.ClubID, HC.Name
      ORDER   BY numMembers DESC;
    `);
    res.json(rs.recordset);
  } catch (err) {
    console.error("SQL error", err);
    res.status(500).send("Club sizes query failed");
  }
});



// Q6 – one most recent hike per user pair (no duplicates)
app.get("/api/analytics/hiking-buddies", async (_req, res) => {
  try {
    const pool = await poolPromise;
    const rs = await pool.request().query(`
      WITH Pairings AS (
        SELECT
          -- Normalize user ID pair
          CASE WHEN H1.UserID < H2.UserID THEN H1.UserID ELSE H2.UserID END AS User1,
          CASE WHEN H1.UserID > H2.UserID THEN H1.UserID ELSE H2.UserID END AS User2
        FROM dbo.Hiker H1
        JOIN dbo.Hiker H2
          ON H1.HikeID = H2.HikeID
         AND H1.UserID <> H2.UserID
      )
      SELECT
        U1.Name AS hikerA,
        U2.Name AS hikerB,
        COUNT(*) AS sharedHikes
      FROM Pairings
      JOIN dbo.Users U1 ON U1.UserID = Pairings.User1
      JOIN dbo.Users U2 ON U2.UserID = Pairings.User2
      GROUP BY U1.Name, U2.Name
      ORDER BY sharedHikes DESC;
    `);
    res.json(rs.recordset);
  } catch (err) {
    console.error("SQL error", err);
    res.status(500).send("Hiking-buddies query failed");
  }
});




// Q7 – Top 5 months with most hikes since Jan 2017
app.get("/api/analytics/monthly-hikes", async (_req, res) => {
  try {
    const pool = await poolPromise;
    const rs = await pool.request().query(`
      WITH MonthSeries AS (
          SELECT CAST('2017-01-01' AS DATE) AS MonthStart
          UNION ALL
          SELECT DATEADD(MONTH, 1, MonthStart)
          FROM MonthSeries
          WHERE MonthStart < DATEFROMPARTS(YEAR(SYSUTCDATETIME()), MONTH(SYSUTCDATETIME()), 1)
      ),
      HikeAgg AS (
          SELECT FORMAT(H.StartTime, 'yyyy-MM') AS yearMonth,
                 COUNT(*)                       AS numHikes,
                 ROUND(AVG(R.Rating), 2)        AS avgRating
          FROM   dbo.Hike H
          JOIN   dbo.Review R ON R.TrailID = H.TrailID
          WHERE  H.StartTime >= '2017-01-01'
          GROUP  BY FORMAT(H.StartTime, 'yyyy-MM')
      )
      SELECT TOP 5
             FORMAT(MS.MonthStart, 'yyyy-MM') AS yearMonth,
             COALESCE(HA.numHikes, 0)         AS numHikes,
             COALESCE(HA.avgRating, NULL)     AS avgRating
      FROM   MonthSeries MS
      LEFT JOIN HikeAgg HA
             ON HA.yearMonth = FORMAT(MS.MonthStart, 'yyyy-MM')
      ORDER BY numHikes DESC
      OPTION (MAXRECURSION 1000);
    `);
    res.json(rs.recordset);
  } catch (err) {
    console.error("SQL error", err);
    res.status(500).send("Monthly-hikes query failed");
  }
});



// Q8 – Steep trails (Level-3): Uphill ÷ Length, with ratings filter
app.get("/api/analytics/steep-trails", async (req, res) => {
  const minReviews = Number(req.query.minReviews) || 3;   // default: 3

  try {
    const pool = await poolPromise;
    const rs = await pool
      .request()
      .input("minReviews", sql.Int, minReviews)
      .query(`
        WITH RatingAgg AS (
  SELECT
      R.TrailID,
      AVG(CAST(R.Rating AS DECIMAL(5,2))) AS avgRating,
      COUNT(*)                             AS numReviews
  FROM dbo.Review AS R
  GROUP BY R.TrailID
)
SELECT
    T.TrailID AS trailId,
    T.Name    AS name,
    T.Uphill  AS totalGain,
    T.Length3D AS lengthM,
    CAST(ROUND(
      CAST(T.Uphill  AS FLOAT) /
      NULLIF(CAST(T.Length3D AS FLOAT), 0), 3
    ) AS DECIMAL(10,3))       AS gainPerMeter,
    RA.avgRating,
    RA.numReviews
FROM dbo.Trail AS T
JOIN RatingAgg AS RA
  ON RA.TrailID = T.TrailID
WHERE
    T.Length3D > 0
    AND RA.numReviews >= @minReviews
ORDER BY gainPerMeter DESC, RA.avgRating DESC;

      `);

    res.json(rs.recordset);
  } catch (err) {
    console.error("Steep-trails query failed", err);
    res.status(500).send("Steep-trails query failed");
  }
});


// Q9 – users with the most reviews (Level-3)
app.get("/api/users/most-reviews", async (_req, res) => {
  try {
    const pool = await poolPromise;
    const rs = await pool.request().query(`
      WITH UserReviewAgg AS (
        SELECT 
          U.UserID,
          U.Name,
          COUNT(R.ReviewID) AS numReviews,
          COUNT(DISTINCT R.TrailID) AS distinctTrailsReviewed,
          ROUND(AVG(CAST(R.Rating AS DECIMAL(5,2))), 2) AS avgRating
        FROM dbo.Users U
        JOIN dbo.Review R
          ON R.UserID = U.UserID
        GROUP BY U.UserID, U.Name
      )
      SELECT
        *,
        RANK() OVER (ORDER BY numReviews DESC) AS reviewRank
      FROM UserReviewAgg
      ORDER BY reviewRank, Name;
    `);
    res.json(rs.recordset);
  } catch (err) {
    console.error("SQL error", err);
    res.status(500).send("Most-reviews users query failed");
  }
});


// Q10 – most-reviewed trails (dedup by trail name)
app.get("/api/analytics/most-reviewed-trails", async (_req, res) => {
  try {
    const pool = await poolPromise;
    const rs = await pool.request().query(`
      WITH TrailReviewAgg AS (
        SELECT
          T.TrailID,
          T.Name,
          COUNT(R.ReviewID)                            AS numReviews,
          COUNT(DISTINCT R.UserID)                     AS distinctReviewers,
          ROUND(AVG(CAST(R.Rating AS DECIMAL(5,2))),2) AS avgRating,
          CAST(100.0 * SUM(CASE WHEN R.Rating = 5 THEN 1 ELSE 0 END)
               / NULLIF(COUNT(*),0) AS DECIMAL(5,2))   AS pctFiveStars
        FROM dbo.Trail T
        JOIN dbo.Review R
          ON R.TrailID = T.TrailID
        GROUP BY T.TrailID, T.Name
      ),
      Dedup AS (
        SELECT
          *,
          ROW_NUMBER() OVER (
            PARTITION BY Name
            ORDER BY numReviews DESC, avgRating DESC, TrailID ASC
          ) AS rn
        FROM TrailReviewAgg
      )
      SELECT
        TrailID     AS trailId,
        Name        AS name,
        numReviews,
        distinctReviewers,
        avgRating,
        pctFiveStars,
        DENSE_RANK() OVER (ORDER BY numReviews DESC) AS reviewRank
      FROM Dedup
      WHERE rn = 1
      ORDER BY reviewRank, avgRating DESC, name;
    `);
    res.json(rs.recordset);
  } catch (err) {
    console.error("SQL error", err);
    res.status(500).send("Most-reviewed trails query failed");
  }
});



//stored procedure for leaderboard
app.get("/api/clubs/leaderboard", async (req, res) => {
  const topN = Number(req.query.top || 10);

  try {
    const pool = await poolPromise;
    const result = await pool
      .request()
      .input("topN", sql.Int, topN)
      .execute("dbo.GetClubLeaderboard");

    res.json(result.recordset);
  } catch (err) {
    console.error("Club leaderboard proc failed:", err);
    res.status(500).send("Leaderboard query failed");
  }
});

//stored procedure for reviews
app.post("/api/reviews", async (req, res) => {
  const { userId, trailId, rating, difficulty, comments } = req.body;
  if (!userId || !trailId || rating == null)
    return res.status(400).send("userId, trailId, and rating are required");

  try {
    const pool = await poolPromise;
    await pool.request()
      .input("userId",     sql.BigInt,       userId)
      .input("trailId",    sql.BigInt,       trailId)
      .input("rating",     sql.Int,          rating)
      .input("difficulty", sql.VarChar(255), difficulty || null)
      .input("comments",   sql.VarChar(4000),comments   || null)
      .execute("dbo.AddReview");

    res.sendStatus(201);      // Created
  } catch (err) {
    console.error("AddReview proc error:", err);
    res.status(500).send("Failed to add review");
  }
});

// GET /api/analytics/monthly-trail-stats stored proc 3
app.get("/api/analytics/monthly-trail-stats", async (_req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().execute("dbo.MonthlyTrailStats");
    res.json(result.recordset);
  } catch (err) {
    console.error("MonthlyTrailStats proc failed:", err);
    res.status(500).send("Failed to get monthly trail stats");
  }
});

//stored proc 4 for creating account

app.post("/api/register", async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password)
    return res.status(400).send("All fields required");

  try {
    const pool = await poolPromise;

    await pool.request()
      .input("Name",     sql.NVarChar(255), name)
      .input("Email",    sql.NVarChar(255), email)
      .input("Password", sql.NVarChar(255), password)  
      .execute("dbo.CreateUserAccount");

    res.sendStatus(201);
  } catch (err) {
    if (/Email already/.test(err.message))
      return res.status(409).send("Email already in use.");
    console.error("Registration error:", err);
    res.status(500).send("Registration failed");
  }
});

//stored proc for user profile
app.post('/api/users/update-profile', async (req, res) => {
  const { userId, name, photoURL, age, nationality, gender, experienceLevel } = req.body;


  if (!userId) return res.status(400).send("Missing userId");

  try {
    const pool = await poolPromise;
    await pool.request()
      .input("UserId",          sql.BigInt,       userId)
      .input("Name",           sql.NVarChar(100), name || null)
      .input("PhotoURL",       sql.VarChar(500),  photoURL || null)
      .input("Age",            sql.Int,           age || null)
      .input("Nationality",    sql.NVarChar(100), nationality || null)
      .input("Gender",         sql.NVarChar(20),  gender || null)
      .input("ExperienceLevel",sql.NVarChar(100), experienceLevel || null)  
      .execute("dbo.UpdateUserProfile");

    res.sendStatus(200);
  } catch (err) {
    console.error("UpdateUserProfile error:", err);
    res.status(500).send("Failed to update profile");
  }
});


app.get("/api/users/:id", async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool
      .request()
      .input("UserId", sql.BigInt, req.params.id)
      .query("SELECT * FROM dbo.Users WHERE UserID = @UserId");

    if (!result.recordset.length) return res.sendStatus(404);
    res.json(result.recordset[0]);
  } catch (err) {
    console.error("GetUser error:", err);
    res.status(500).send("Server error");
  }
});


// ---------------------------------------------------------------------------
// Boot
// ---------------------------------------------------------------------------
const PORT = 3001;
app.listen(PORT, () => console.log(`API server running at http://localhost:${PORT}`));
