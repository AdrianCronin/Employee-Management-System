const query = require("./connect");
const inquirer = require('inquirer');

const nextActionList = [
    {
        type: 'list',
        message:'What would you like to do?',
        name:'choice',
        choices: [
            "View All Departments",
            "View All Roles",
            "View All Employees",
            "Add a Department",
            "Add a Role",
            "Add an Employee",
            "Update an Employee Role",
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
            return addEmployee();

        case "Update an Employee Role":
            return updateEmployeeRole();

        case "View All Roles":
            return viewAllRoles();

        case "Add a Role":
            return addRole();

        case "View All Departments":
            return viewAllDepartments();

        case "Add a Department":
            return addDepartment();

        case "Quit":
            return quitApp();
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
    SELECT
        e1.id, e1.first_name, e1.last_name, roles.title, departments.name AS department, roles.salary,
        IFNULL(NULL, CONCAT(e2.first_name, " ", e2.last_name)) AS manager

    FROM employees e1
    
    JOIN roles ON e1.role_id = roles.id

    JOIN departments ON roles.department_id = departments.id

    LEFT JOIN employees e2 ON e2.id = e1.manager_id
    
    ORDER BY e1.id;`);
    console.table(results);
    return askNextAction();
};

const addDepartment = async () => {
    try {
        const department = await inquirer.prompt([
            {
                type: 'input',
                message: 'What is the name of the Department?',
                name: "name",
                validate: function (input) {
                    return input.length > 0;
                }
            }
        ]);
    
        await query(`INSERT INTO departments (name) VALUES (?)`, department.name.trim());
        await viewAllDepartments();
        return askNextAction();

    } catch (err) {
        console.error(err);
        return askNextAction();
    };
};

const addRole = async () => {
    try {
        const choices = await createAddRoleDepartmentChoices();
        
        const newRoleQuestions = [
            {
                type: 'input',
                message: "What is the role's title?",
                name: 'title',
                validate: function (input) {
                    return input.length > 0;
                }
            },
            {
                type: 'number',
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
    } catch (err) {
        console.error("\nInvalid Salary input\n");
        return addRole();
    }
};

const createAddRoleDepartmentChoices = async () => {
    const results = await query("SELECT id, name AS department FROM departments;");
    const choices = [];

    for (const element of results) {
        choices.push(element.department)
    };

    return choices
};

const addEmployee = async () => {
    
    const rolesArr = await createRoleChoices();
    const employeesArr = await createEmployeeChoices();
    const roleChoices = [];
    const managerChoices = [];
    
    for (const element of rolesArr) {
        roleChoices.push(element.title);
    };
    
    for (const element of employeesArr) {
        managerChoices.push(element.fullName);
    };

    managerChoices.push("None");
    
    const newEmployeeQuestions = [
        {
            type: 'input',
            message: "What is the employee's first name?",
            name: 'firstName',
        },
        {
            type: 'input',
            message: "What is the employee's Last name?",
            name: 'lastName',
        },
        {
            type: 'list',
            message: "What is the employee's role?",
            name: 'role',
            choices: roleChoices
        },
        {
            type: 'list',
            message: "Who is the employee's manager?",
            name: 'manager',
            choices: managerChoices
        },
        
    ];
    
    const {firstName, lastName, role, manager} = await inquirer.prompt(newEmployeeQuestions);
    
    let managerId;
    let roleId;
    
    for (const element of rolesArr) {
        if (role === element.title) {
            roleId = element.id
        }
    };
    
    for (const element of employeesArr) {
        if (manager === element.fullName) {
            managerId = element.id
        } else if (manager === "None") {
            managerId = null;
        }
    };
    
    await query(`INSERT INTO employees (first_name, last_name, role_id, manager_id) VALUES (?, ?, ?, ?)`, [firstName.trim(), lastName.trim(), roleId, managerId]);
    await viewAllEmployees();
    return askNextAction();
};

const createRoleChoices = async () => {
    const results = await query("SELECT id, title FROM roles;");
    const rolesArr = [];
    
    for (const element of results) {
        const role = {};
        role.id = element.id;
        role.title = element.title;
        rolesArr.push(role);
    };
    
    return rolesArr
};

const createEmployeeChoices = async () => {

    const results = await query("SELECT * FROM employees");
    const employeesArr = [];

    for (const element of results) {

        const employee = {};
        employee.id = element.id;
        employee.fullName = `${element.first_name} ${element.last_name}`;
        employeesArr.push(employee)

    };

   return employeesArr;
};

const updateEmployeeRole = async () => {

    const rolesArr = await createRoleChoices();
    const employeesArr = await createEmployeeChoices();
    const roleChoices = [];
    const employeeChoices = [];

    for (const element of rolesArr) {
        roleChoices.push(element.title);
    };

    for (const element of employeesArr) {
        employeeChoices.push(element.fullName);
    };

    const updateEmployeeQuestions = [
        {
            type: 'list',
            message: "Which employee would you like to update?",
            name: 'employee',
            choices: employeeChoices
        },
        {
            type: 'list',
            message: "What is the employee's new role?",
            name: 'role',
            choices: roleChoices
        },
        
    ];

    const {employee, role} = await inquirer.prompt(updateEmployeeQuestions);
    let employeeId;
    let roleId;

    for (const element of employeesArr) {
        if (employee === element.fullName) {
            employeeId = element.id
        }
    };

    for (const element of rolesArr) {
        if (role === element.title) {
            roleId = element.id
        }
    };

    await query(`UPDATE employees SET role_id = (?) WHERE id = (?)`, [roleId, employeeId]);
    await viewAllEmployees();
    return askNextAction();
};

const quitApp = () => {
    console.log("Goodbye");
    process.exit();
};

module.exports = {
    askNextAction
};