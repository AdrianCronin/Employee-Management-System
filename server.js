const inquirer = require('inquirer');
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
    console.log(`Connected to the books_db database.`)
  );

const query = util.promisify(db.query).bind(db);

// how to do async delete later
// const selectAllEmployees = async () => {
//     const results = await query("SELECT * FROM employees");
//     await console.log("async function");
//     await console.table(results);
// };


const nextActionList = [
    {
        type: 'list',
        message:'What would you like to do?',
        name:'choice',
        choices: [
            "View All Employees",
            "Add an Employee",
            "Update Employee Role",
            "View All Roles",
            "Add a Role",
            "View All Departments",
            "Add a Department",
            "Quit"
        ]
    }
];

const askNextAction = async () => {
    const nextActionAnswer = await inquirer.prompt(nextActionList);

    await console.log(nextActionAnswer.choice);

    switch (nextActionAnswer.choice) {
        case "View All Employees":

            break;
        case "Add an Employee":

            break;
        case "Update Employee Role":

            break;
        case "View All Roles":

            break;
        case "Add a Role":

            break;
        case "View All Departments":

            break;
        case "Add a Department":

            break;
        case "Quit":

            break;
    };
};



// stand-in init function
askNextAction();