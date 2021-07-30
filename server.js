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
            return viewAllRoles();

        case "Add a Role":
            break;

        case "View All Departments":
            return viewAllDepartments();

        case "Add a Department":
            break;

        case "Quit":
            break;
    };
};

const viewAllRoles = async () => {
    const results = await query("SELECT roles.id, roles.title, departments.name AS department, roles.salary FROM roles JOIN departments ON roles.department_id = departments.id");
    return console.table(results);
};

const viewAllDepartments = async () => {
    const results = await query("SELECT id, name AS deparment FROM departments;");
    return console.table(results);
};

// stand-in init function
askNextAction();