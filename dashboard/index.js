const express = require('express');
const mysql = require('mysql');
const fs = require('fs');
const https = require('https');
const app = express();
const port = 9000;

const key = fs.readFileSync('/etc/letsencrypt/live/test.findnewcars.com/privkey.pem');
const cert = fs.readFileSync('/etc/letsencrypt/live/test.findnewcars.com/fullchain.pem');
const sslOptions = { key, cert };

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'password',
    database: 'TeleMedicine'
});

connection.connect((err) => {
    if (err) {
        console.error('Error connecting to MySQL: ' + err.stack);
        return;
    }
    console.log('Connected to MySQL as id ' + connection.threadId);
});

app.use(express.static('public'));

app.get('/admin', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

app.get('/view', (req, res) => {
    res.sendFile(__dirname + '/view.html');
});

app.get('/admin/roomIDs', (req, res) => {
    const selectSQL = `SELECT Room_ID, creator_name, start_datetime FROM RoomLIST`;

    connection.query(selectSQL, (selectErr, selectResults) => {
        if (selectErr) {
            console.error('Error retrieving Room_IDs: ' + selectErr.stack);
            res.status(500).send('Error retrieving Room_IDs');
        } else {
            res.json(selectResults);
        }
    });
});

app.get('/roomDetails', (req, res) => {
    const tableName = req.query.q;
    const selectSQL = `SELECT id,creator_name,start_datetime,Sub_table_d FROM ??`; 

    connection.query(selectSQL, [tableName], (selectErr, selectResults) => {
        if (selectErr) {
            console.error('Error retrieving room details: ' + selectErr.stack);
            res.status(500).send('Error retrieving room details');
            return;
        }

        if (selectResults.length === 0) {
            res.json({ mainTable: [], subTables: [] });
            return;
        }

        let subTablesData = [];

        const fetchSubTableData = (index) => {
            if (index >= selectResults.length) {
                res.json({
                    mainTable: selectResults,
                    subTables: subTablesData
                });
                return;
            }

            const subTableD = selectResults[index].Sub_table_d;

            connection.query(`SELECT * FROM ??`, [subTableD], (subTableDErr, subTableDResults) => {
                if (subTableDErr) {
                    console.error('Error retrieving sub-table details: ' + subTableDErr.stack);
                    res.status(500).send('Error retrieving sub-table details');
                    return;
                }

                subTablesData.push({
                    subTableDName: subTableD,
                    subTableDData: subTableDResults
                });

                fetchSubTableData(index + 1);
            });
        };

        fetchSubTableData(0);
    });
});

const server = https.createServer(sslOptions, app);

server.listen(port, () => {
    console.log(`Server is running on ${port}`);
});

// End the mysql connection when the app is closed
process.on('exit', () => {
    connection.end();
});
