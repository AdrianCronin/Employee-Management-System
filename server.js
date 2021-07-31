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
    console.log(`Connected to the employees_db database.`)
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

    console.log(nextActionAnswer.choice);

    switch (nextActionAnswer.choice) {
        case "View All Employees":
            return viewAllEmployees();

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
            return;
    };
};

const viewAllRoles = async () => {
    const results = await query("SELECT roles.id, roles.title, departments.name AS department, roles.salary FROM roles JOIN departments ON roles.department_id = departments.id");
    console.table(results);
    return askNextAction();
};

const viewAllDepartments = async () => {
    const results = await query("SELECT id, name AS deparment FROM departments;");
    console.table(results);
    return askNextAction();
};

const viewAllEmployees = async () => {
    const results = await query(`
    SELECT employees.id, employees.first_name, employees.last_name, roles.title, departments.name AS department, roles.salary, employees.manager_id AS manager

    FROM employees
    JOIN roles ON employees.role_id = roles.id
    INNER JOIN departments ON roles.department_id = departments.id`);
    console.table(results);
    return askNextAction();
};

// stand-in init function
askNextAction();