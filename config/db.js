const mysql = require('mysql2');

// Cấu hình kết nối
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'tables'
});

// Kết nối database
db.connect((err) => {
    if (err) {
        console.error('Database connection failed: ', err);
        return;
    }
    console.log('Connected to MySQL database.');
});

module.exports = db;
