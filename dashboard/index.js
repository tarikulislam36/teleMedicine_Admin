const express = require('express');
const mysql = require('mysql');
const app = express();
const port = 9000;

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

// Serve static files from the "public" directory
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
    const selectSQL = `SELECT * FROM ??`;

    connection.query(selectSQL, [tableName], (selectErr, selectResults) => {
        if (selectErr) {
            console.error('Error retrieving room details: ' + selectErr.stack);
            res.status(500).send('Error retrieving room details');
        } else {
            res.json(selectResults);
        }
    });
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
