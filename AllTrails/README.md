# AllTrails (React + Vite)

A starter web front-end for the AllTrails concept.

## Quick start
```bash
pnpm i      # or npm install / yarn
pnpm dev    # vite dev server
pnpm build  # production bundle

## To run on browser: npm install -> npm run dev
## To run server: node server.cjs

I've been doing small queries in SSMS, using the version ({ODBC Driver 17 for SQL Server}) specified in allTrailsINIT.py, which is how I added extra columns to tables like dbo.User
- I was using allTrailsINIT.py to setup database but switched to SSMS for quicker queries
- You can still use allTrailsINIT.py, but you need to change server and database info to whatever it is on your computer 

For queries that actually interact with frontend I edited them in server.cjs and called them in api.js

The current level 2-3 queries we are using for Checkpoint 4 are: 

1. Top‑rated trails with ≥ minReviews (default 5)
2. Difficulty distribution + % share + avg rating  (Level-3)
3. Most-active hikers (total 3-D distance)
4. Long (>10 mi) & highly-rated (>4) challenge trails
5. Club membership counts
6. pairs of users who shared a hike
7. monthly hike counts *and* avg rating for the past 12 months  (Level-3)
8. Steep trails (Level-3): Uphill ÷ Length, with ratings filter
9. users without any reviews
10. popular trails that still have no reviews

Stored Procedures

1. Recommended Trails
2. leaderboard
3. reviews
4. monthly-trail-stats
5. creating account
6. user profile

AKA 

dbo.RecommendTrailsForUser
dbo.AddReview
dbo.GetClubLeaderboard
dbo.MonthlyTrailStats
dbo.CreateUserAccount
dbo.UpdateUserProfile

In summary if you want to look at queries look at server.cjs

Here are random dependencies I installed to make start-up faster:
npm install react-leaflet-cluster
npm install @headlessui/react    
npm install @heroicons/react     
npm install msnodesqlv8          
npm install express mssql cors
npm install recharts 
npm i @tanstack/react-query


FOR EASY SETUP IN SSMS;
- I included db.bacpac which is what I did in SSMS
- Copy it locally and you can use SSMS Import Wizard to open it on your computer
