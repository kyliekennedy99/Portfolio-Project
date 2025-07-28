const express = require('express');
const sql = require('mssql/msnodesqlv8');
const cors = require('cors');

const app = express();
app.use(cors());

// SQL Server config (must be defined before any queries)
const sqlConfig = {
  server: 'DESKTOP-BJDG4CK\\SQLEXPRESS',
  database: 'allTrails',
  driver: 'msnodesqlv8',
  options: {
    trustedConnection: true,
    trustServerCertificate: true,
  },
  authentication: {
    type: 'ntlm',
    options: {
      domain: '',
      userName: '',
      password: '',
    },
  },
};

// GET all trails
app.get('/api/trails', async (req, res) => {
  try {
    await sql.connect(sqlConfig);
    const result = await sql.query`SELECT TrailID, Name, Length2D, Uphill, Downhill, MinElevation, GeoBoundary FROM Trail`;
    res.json(result.recordset);
  } catch (err) {
    console.error('SQL error', err);
    res.status(500).send('Error querying database');
  }
});

// GET one trail by ID
app.get('/api/trails/:id', async (req, res) => {
  try {
    await sql.connect(sqlConfig);
    const result = await sql.query`SELECT * FROM Trail WHERE TrailID = ${req.params.id}`;
    if (result.recordset.length === 0) {
      return res.status(404).send('Trail not found');
    }
    res.json(result.recordset[0]);
  } catch (err) {
    console.error('SQL error', err);
    res.status(500).send('Database error');
  }
});

app.listen(3001, () => {
  console.log('API server running at http://localhost:3001');
});
