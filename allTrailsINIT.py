import csv
import sys
import pyodbc

from datetime import datetime

# forces the data into datetime2 sql format or None
def safe_datetime(s):
    if not s:
        return None
    try:
        return datetime.strptime(s, '%Y-%m-%d %H:%M:%S')
    except ValueError:
        return None

# checks if the table should be created
def tableExists(tableName,cursor):
    cursor.execute("""
        SELECT 1
        FROM INFORMATION_SCHEMA.TABLES
        WHERE TABLE_NAME = ?
        """,
        tableName)
    
    exists = cursor.fetchone()
    return exists

# only ODBC Driver 17 for SQL Server seems to work for the large gpx column
conn = pyodbc.connect("Driver={ODBC Driver 17 for SQL Server};Server=ALEX;Database=allTrails;Trusted_Connection=yes;")
cursor = conn.cursor()

# create tables if they don't exist. in a specific order for foreign key dependencies
if not tableExists("Users",cursor):
    cursor.execute("CREATE TABLE Users (UserID bigint PRIMARY KEY, Name varchar(255), Gender varchar(255), Nationality varchar(255), Age int, Experience varchar(255));")

if not tableExists("Trail",cursor):
    cursor.execute("CREATE TABLE Trail(TrailID bigint PRIMARY KEY, GeoBoundary varchar(4000), MinElevation float, Downhill float, Name varchar(255), Length2D float, Uphill float, Length3D float, gpx nvarchar(MAX));")

if not tableExists("Review",cursor):
    cursor.execute("CREATE TABLE Review(ReviewID bigint PRIMARY KEY, Comments varchar(4000), Difficulty varchar(255), Rating int, UserID bigint, foreign key (UserID) references Users(UserID), TrailID bigint, foreign key (TrailID) references Trail(TrailID));")

if not tableExists("Hike",cursor):
    cursor.execute("CREATE TABLE Hike(HikeID bigint PRIMARY KEY, MaxSpeed float, EndTime DATETIME2, StartTime DATETIME2, MovingTime float, TrailID bigint, foreign key (TrailID) references Trail(TrailID));")

if not tableExists("HikingClub",cursor):
    cursor.execute("CREATE TABLE HikingClub(ClubID bigint PRIMARY KEY, Name varchar(255));")

if not tableExists("Member",cursor):
    cursor.execute("CREATE TABLE Member(UserID bigint, ClubID bigint, PRIMARY KEY (USERID, ClubID), foreign key (UserID) references Users(UserID), foreign key (ClubID) references HikingClub(ClubID));")

if not tableExists("Hiker",cursor):
    cursor.execute("CREATE TABLE Hiker(UserID bigint, HikeID bigint, PRIMARY KEY (UserID, HikeID), foreign key (UserID) references Users(UserID), foreign key (HikeID) references Hike(HikeID));")

if not tableExists("kaggleTable",cursor):
    cursor.execute("CREATE TABLE kaggleTable (_id varchar(255), length_3d float,username varchar(255),start_time datetime2, max_elevation float, bounds varchar(4000), uphill float, moving_time float, end_time datetime2, max_speed float, gpx nvarchar(MAX), difficulty varchar(255), min_elevation float, url varchar(255), downhill float, name varchar(255), length_2d float);")

# Increase the CSV parser's field size limit to the max allowed (gpx is too large)
csv.field_size_limit(sys.maxsize)

csvFile = "gpx-tracks-from-hikr.org.csv"

# Load the initial staging Kaggle file into the sql server reading csv line by line
with open(csvFile, newline='', encoding='utf-8') as f:
    reader = csv.DictReader(f)
    for i, row in enumerate(reader):

        # skip header row
        if i==0:
            continue

        cursor.execute("""
            INSERT INTO dbo.kaggleTable (_id, length_3d, username, start_time, max_elevation, bounds, uphill, moving_time, end_time, max_speed, gpx, difficulty, min_elevation, url, downhill, name, length_2d)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, 
        row['_id'],
        float(row['length_3d']),
        row['user'],
        safe_datetime(row['start_time']),
        row['max_elevation'],
        row['bounds'],
        float(row['uphill']),
        float(row['moving_time']),
        safe_datetime(row['end_time']),
        float(row['max_speed']),
        row['gpx'],
        row['difficulty'],
        row['min_elevation'],
        row['url'],
        row['downhill'],
        row['name'],
        row['length_2d']
        )

    conn.commit()

