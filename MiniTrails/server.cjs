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

// Q1 – Top‑rated trails with ≥ minReviews (default 5)
app.get("/api/analytics/top-rated", async (req, res) => {
  const minReviews = Number(req.query.minReviews) || 5;
  try {
    const pool = await poolPromise;
    const result = await pool
      .request()
      .input("minReviews", sql.Int, minReviews)
      .query(`
        SELECT  T.TrailID       AS trailId,
                T.Name          AS name,
                AVG(R.Rating)   AS avgRating,
                COUNT(*)        AS numReviews
        FROM    dbo.Trail  AS T
        JOIN    dbo.Review AS R ON R.TrailID = T.TrailID
        GROUP BY T.TrailID, T.Name
        HAVING  COUNT(*) >= @minReviews
        ORDER BY avgRating DESC;
      `);
    res.json(result.recordset);
  } catch (err) {
    console.error("SQL error", err);
    res.status(500).send("Error executing top‑rated query");
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

// Recommendations stored proc
app.get("/api/user/:id/recommendations", async (req, res) => {
  const userId = Number(req.params.id);
  const topN = Number(req.query.top || 5);
  try {
    const pool = await poolPromise;
    const result = await pool
      .request()
      .input("userId", sql.BigInt, userId)
      .input("topN", sql.Int, topN)
      .execute("dbo.RecommendTrailsForUser");
    res.json(result.recordset);
  } catch (err) {
    console.error("SQL error", err);
    res.status(500).send("Error executing recommendation proc");
  }
});

// Q2 – Difficulty distribution + % share + avg rating  (Level-3)
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

    /* Example response:
       [
         { difficulty: 'Moderate', numReviews: 18, avgRating: 4.3, pctOfTotal: 45.0 },
         { difficulty: 'Easy',     numReviews: 12, avgRating: 4.1, pctOfTotal: 30.0 },
         { difficulty: 'Hard',      numReviews: 10, avgRating: 4.6, pctOfTotal: 25.0 }
       ]
    */
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

// Q4 – Long (>10 mi) & highly-rated (>4) challenge trails
app.get("/api/analytics/challenge-trails", async (req, res) => {
  const minMiles  = Number(req.query.minMiles)  || 10;
  const minRating = Number(req.query.minRating) || 4.0;
  const minMeters = minMiles * 1609.34;

  try {
    const pool = await poolPromise;
    const rs = await pool
      .request()
      .input("minMeters", sql.Float, minMeters)
      .input("minRating", sql.Float, minRating)
      .query(`
        WITH AvgRatings AS (
          SELECT TrailID, AVG(Rating) AS AvgRating
          FROM   dbo.Review
          GROUP  BY TrailID
        )
        SELECT T.TrailID            AS trailId,
               T.Name               AS name,
               T.Length3D / 1609.34 AS lengthMiles,
               AR.AvgRating
        FROM   dbo.Trail  T
        JOIN   AvgRatings AR ON AR.TrailID = T.TrailID
        WHERE  T.Length3D  > @minMeters
          AND  AR.AvgRating >= @minRating
        ORDER BY AR.AvgRating DESC;
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

// Q6 – pairs of users who shared a hike
app.get("/api/analytics/hiking-buddies", async (_req, res) => {
  try {
    const pool = await poolPromise;
    const rs = await pool.request().query(`
      SELECT
          U1.Name AS hikerA,
          U2.Name AS hikerB,
          HI.TrailID,
          HI.StartTime
      FROM   dbo.Hiker H1
      JOIN   dbo.Hiker H2 ON H1.HikeID = H2.HikeID
                         AND H1.UserID < H2.UserID        -- avoid duplicates
      JOIN   dbo.Users U1 ON U1.UserID = H1.UserID
      JOIN   dbo.Users U2 ON U2.UserID = H2.UserID
      JOIN   dbo.Hike  HI ON HI.HikeID = H1.HikeID
      ORDER  BY HI.StartTime DESC;
    `);
    res.json(rs.recordset);
  } catch (err) {
    console.error("SQL error", err);
    res.status(500).send("Hiking-buddies query failed");
  }
});

//new Q7

// Q7  – monthly hike counts *and* avg rating for the past 12 months  (Level-3)
app.get("/api/analytics/monthly-hikes", async (_req, res) => {
  try {
    const pool = await poolPromise;
    const rs = await pool.request().query(`
      /* ------------------------------------------------------------
         MonthSeries CTE: one row per month, starting 11 months ago
         ------------------------------------------------------------ */
      WITH MonthSeries AS (
          SELECT DATEFROMPARTS(YEAR(SYSUTCDATETIME()), MONTH(SYSUTCDATETIME()), 1) AS MonthStart
          UNION ALL
          SELECT DATEADD(MONTH, -1, MonthStart)
          FROM   MonthSeries
          WHERE  MonthStart > DATEADD(MONTH, -11,
                   DATEFROMPARTS(YEAR(SYSUTCDATETIME()), MONTH(SYSUTCDATETIME()), 1))
      ),
      /* ------------------------------------------------------------
         Aggregate hikes + ratings per month
         ------------------------------------------------------------ */
      HikeAgg AS (
          SELECT FORMAT(H.StartTime, 'yyyy-MM')          AS yearMonth,
                 COUNT(*)                               AS numHikes,
                 ROUND(AVG(R.Rating), 2)                AS avgRating
          FROM   dbo.Hike   H
          JOIN   dbo.Review R ON R.TrailID = H.TrailID   -- join ⇒ Level-2+
          WHERE  H.StartTime >= DATEADD(MONTH, -12, SYSUTCDATETIME())
          GROUP  BY FORMAT(H.StartTime, 'yyyy-MM')
      )
      /* ------------------------------------------------------------
         Bring the two together so even months with 0 hikes appear
         ------------------------------------------------------------ */
      SELECT FORMAT(MS.MonthStart, 'yyyy-MM')            AS yearMonth,
             COALESCE(HA.numHikes, 0)                    AS numHikes,
             COALESCE(HA.avgRating, NULL)                AS avgRating   -- NULL if no reviews
      FROM   MonthSeries MS
      LEFT JOIN HikeAgg   HA
             ON HA.yearMonth = FORMAT(MS.MonthStart, 'yyyy-MM')
      ORDER  BY yearMonth;
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
        /* ------------------------------------------------------------
           RatingAgg CTE – pre-aggregate avg rating & review count
           ------------------------------------------------------------ */
        WITH RatingAgg AS (
          SELECT TrailID,
                 AVG(Rating) AS avgRating,
                 COUNT(*)    AS numReviews
          FROM   dbo.Review
          GROUP  BY TrailID
        )

        SELECT T.TrailID                        AS trailId,
               T.Name                           AS name,
               T.Uphill                         AS totalGain,
               T.Length3D                       AS lengthM,
               ROUND(T.Uphill / NULLIF(T.Length3D,0), 3)
                                               AS gainPerMeter,
               RA.avgRating,
               RA.numReviews
        FROM   dbo.Trail  T
        JOIN   RatingAgg  RA ON RA.TrailID = T.TrailID   -- join ⇒ Level-2+
        WHERE  T.Length3D  > 0
          AND  RA.numReviews >= @minReviews              -- extra filter
        ORDER  BY gainPerMeter DESC;
      `);

    res.json(rs.recordset);
  } catch (err) {
    console.error("Steep-trails query failed", err);
    res.status(500).send("Steep-trails query failed");
  }
});


// Q9 – users without any reviews
app.get("/api/users/no-reviews", async (_req, res) => {
  try {
    const pool = await poolPromise;
    const rs = await pool.request().query(`
      SELECT  U.UserID AS userId,
              U.Name   AS name
      FROM    dbo.Users U
      LEFT JOIN dbo.Review R ON R.UserID = U.UserID
      WHERE   R.UserID IS NULL
      ORDER BY U.Name;
    `);
    res.json(rs.recordset);
  } catch (err) {
    console.error("SQL error", err);
    res.status(500).send("No-review users query failed");
  }
});
// Q10 – popular trails that still have no reviews
app.get("/api/analytics/unreviewed-trails", async (_req, res) => {
  try {
    const pool = await poolPromise;
    const rs = await pool.request().query(`
      SELECT T.TrailID AS trailId,
             T.Name    AS name,
             H.numHikes
      FROM   dbo.Trail T
      JOIN ( SELECT TrailID, COUNT(*) AS numHikes
             FROM   dbo.Hike
             GROUP  BY TrailID
             HAVING COUNT(*) > 3 ) H
           ON H.TrailID = T.TrailID
      WHERE NOT EXISTS (SELECT 1
                        FROM dbo.Review R
                        WHERE R.TrailID = T.TrailID)
      ORDER BY H.numHikes DESC;
    `);
    res.json(rs.recordset);
  } catch (err) {
    console.error("SQL error", err);
    res.status(500).send("Unreviewed-trails query failed");
  }
});

//stored procedure for leaderboard
// GET /api/clubs/leaderboard
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

//stored proc for creating account

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

