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
            return addRole();

        case "View All Departments":
            return viewAllDepartments();

        case "Add a Department":
            return addDepartment();

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
    const results = await query("SELECT id, name AS department FROM departments;");
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

const addDepartment = async () => {

    const department = await inquirer.prompt([
        {
            type: 'input',
            message: 'What is the name of the Department?',
            name: "name"
        }
    ]);

    await query(`INSERT INTO departments (name) VALUES (?)`, department.name.trim());
    await viewAllDepartments();
    return askNextAction;
};

const createAddRoleChoices = async () => {
    const results = await query("SELECT id, name AS department FROM departments;");
    const choices = [];

    for (const element of results) {
        choices.push(element.department)
    };

    return choices
};

const addRole = async () => {

    const choices = await createAddRoleChoices();

    const newRoleQuestions = [
        {
            type: 'input',
            message: "What is the role's title?",
            name: 'title',
        },
        {
            type: 'input',
            message: "What is this role's salary?",
            name: 'salary',
        },
        {
            type: 'list',
            message: "Which department does this role belong to?",
            name: 'department',
            choices: choices
        },
    ];

    const {title, salary, department} = await inquirer.prompt(newRoleQuestions);

    const departmentQuery = await query(`SELECT id FROM departments WHERE name = (?)`, department );
    const departmentId = departmentQuery[0].id

    await query(`INSERT INTO roles (title, salary, department_id) VALUES (?, ?, ?)`, [title, parseInt(salary), departmentId]);
    await viewAllRoles();
    return askNextAction();
};

// stand-in init function
askNextAction();
