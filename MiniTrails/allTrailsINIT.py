import csv
import sys
import pyodbc
import os

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

def initDatabase(server,database):
    conn = pyodbc.connect("Driver={ODBC Driver 17 for SQL Server};Server=" + server + ";Database=master;Trusted_Connection=yes;",autocommit=True)
    cursor = conn.cursor()

    cursor.execute("""
                   SELECT database_id
                   FROM sys.databases
                   WHERE name = ?
                   """,
                   database)

    exists = cursor.fetchone()

    if exists:
        cursor.execute("DROP DATABASE allTrails")
    
    cursor.execute("CREATE DATABASE allTrails")

    cursor.close()
    conn.close()

    conn = pyodbc.connect("Driver={ODBC Driver 17 for SQL Server};Server=" + server + ";Database=" + database + ";Trusted_Connection=yes;")
    cursor = conn.cursor()

    return conn, cursor

def main():

    csvFile = "gpx-tracks-from-hikr.org.csv"
    server = "DESKTOP-BJDG4CK\\SQLEXPRESS" 
    database = "allTrails"

    # only ODBC Driver 17 for SQL Server seems to work for the large gpx column

    conn, cursor = initDatabase(server,database)

    # create tables if they don't exist. in a specific order for foreign key dependencies
    if not tableExists("Users",cursor):
        cursor.execute("CREATE TABLE Users (UserID bigint IDENTITY(1,1) PRIMARY KEY, Name varchar(255), Gender varchar(255), Nationality varchar(255), Age int, Experience varchar(255));")

    if not tableExists("Trail",cursor):
        cursor.execute("CREATE TABLE Trail(TrailID bigint IDENTITY(1,1) PRIMARY KEY, GeoBoundary varchar(4000), MinElevation float, Downhill float, Name varchar(255), Length2D float, Uphill float, Length3D float, gpx nvarchar(MAX));")

    if not tableExists("Review",cursor):
        cursor.execute("CREATE TABLE Review(ReviewID bigint IDENTITY(1,1) PRIMARY KEY, Comments varchar(4000), Difficulty varchar(255), Rating int, UserID bigint, foreign key (UserID) references Users(UserID), TrailID bigint, foreign key (TrailID) references Trail(TrailID));")

    if not tableExists("Hike",cursor):
        cursor.execute("CREATE TABLE Hike(HikeID bigint IDENTITY(1,1) PRIMARY KEY, MaxSpeed float, EndTime DATETIME2, StartTime DATETIME2, MovingTime float, TrailID bigint, foreign key (TrailID) references Trail(TrailID));")

    if not tableExists("HikingClub",cursor):
        cursor.execute("CREATE TABLE HikingClub(ClubID bigint IDENTITY(1,1) PRIMARY KEY, Name varchar(255));")

    if not tableExists("Member",cursor):
        cursor.execute("CREATE TABLE Member(UserID bigint, ClubID bigint, PRIMARY KEY (USERID, ClubID), foreign key (UserID) references Users(UserID), foreign key (ClubID) references HikingClub(ClubID));")

    if not tableExists("Hiker",cursor):
        cursor.execute("CREATE TABLE Hiker(UserID bigint, HikeID bigint, PRIMARY KEY (UserID, HikeID), foreign key (UserID) references Users(UserID), foreign key (HikeID) references Hike(HikeID));")

    if not tableExists("kaggleTable",cursor):
        cursor.execute("CREATE TABLE kaggleTable (_id varchar(255) PRIMARY KEY, length_3d float,username varchar(255),start_time datetime2, max_elevation float, bounds varchar(4000), uphill float, moving_time float, end_time datetime2, max_speed float, gpx nvarchar(MAX), difficulty varchar(255), min_elevation float, url varchar(255), downhill float, name varchar(255), length_2d float);")

    # Increase the CSV parser's field size limit to the max allowed (gpx is too large)
    csv.field_size_limit(2**31 - 1)


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
    
    cursor.execute("""
                INSERT INTO Users (Name)
                SELECT DISTINCT username
                FROM dbo.kaggleTable
                """)
    conn.commit()

    cursor.execute("""
                INSERT INTO Trail (GeoBoundary, MinElevation, Downhill, Name, Length2D, Uphill, Length3D, gpx)
                SELECT DISTINCT bounds, min_elevation, downhill, name, length_2d, uphill, length_3d, gpx
                FROM dbo.kaggleTable
                """)
    conn.commit()

    cursor.execute("""
                INSERT INTO Review (Difficulty, UserID, TrailID)
                SELECT kaggleTable.difficulty, users.UserID, trail.TrailID
                FROM kaggleTable
                   JOIN Users ON Users.Name = kaggleTable.username
                   JOIN Trail ON Trail.Name = kaggleTable.name
                """)
    conn.commit()

    cursor.execute("""
                INSERT INTO Hike (MaxSpeed, EndTime, StartTime, MovingTime, TrailID)
                SELECT kaggleTable.max_speed, kaggleTable.end_time, kaggleTable.start_time, kaggleTable.moving_time, trail.TrailID
                FROM kaggleTable
                   JOIN Trail ON Trail.Name = kaggleTable.name
                """)
    conn.commit()

    cursor.execute("""
                INSERT INTO Hiker(UserID, HikeID)
                SELECT DISTINCT Users.UserID, Hike.HikeID
                FROM kaggleTable
                   JOIN Users ON Users.Name = kaggleTable.username
                   JOIN Trail ON Trail.Name = kaggleTable.name
                   JOIN Hike ON Hike.TrailID = Trail.TrailID
                """)
    conn.commit()

    cursor.execute("DROP TABLE kaggleTable;")
    conn.commit()

    cursor.close()
    conn.close()

if __name__ == "__main__":
    main()

