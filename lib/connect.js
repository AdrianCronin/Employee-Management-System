const mysql = require('mysql2');
const util = require('util');
require('dotenv').config();

// Connect to database
const db = mysql.createConnection(
    {
      host: 'localhost',
      // MySQL username,
      user: 'root',
      // MySQL password
      password: process.env.DB_PASS,
      database: 'employees_db'
    },
    console.log(`Connected to the employees_db database.`)
  );

const query = util.promisify(db.query).bind(db);

module.exports = query;