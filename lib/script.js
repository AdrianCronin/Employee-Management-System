const query = require("./connect");
const inquirer = require('inquirer');

const nextActionList = [
    {
        type: 'list',
        message: 'What would you like to do?',
        name: 'choice',
        choices: [
            "View All Departments",
            "View All Roles",
            "View All Employees",
            "Add a Department",
            "Add a Role",
            "Add an Employee",
            "Update an Employee Role",
            "Update an Employee's Manager",
            "Quit"
        ]
    }
];

const askNextAction = async () => {
    const nextActionAnswer = await inquirer.prompt(nextActionList);

    if (!nextActionAnswer.choice === "Quit") { console.log(nextActionAnswer.choice) };

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

        case "Update an Employee's Manager":
            return updateEmployeeManager();

        case "Quit":
            return quitApp();
    };
};

const viewAllRoles = async () => {
    const results = await query("SELECT roles.id, roles.title, departments.name AS department, roles.salary FROM roles JOIN departments ON roles.department_id = departments.id ORDER BY roles.id");
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
        console.error("\nSomething went wrong, please try again\n");
        return askNextAction();
    };
};

const addRole = async () => {
    try {
        const choices = await createAddRoleDepartmentChoices();

        const { title, salary, department } = await inquirer.prompt([
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
        ]);

        const departmentQuery = await query(`SELECT id FROM departments WHERE name = (?)`, department);
        const departmentId = departmentQuery[0].id

        await query(`INSERT INTO roles (title, salary, department_id) VALUES (?, ?, ?)`, [title, parseInt(salary), departmentId]);
        await viewAllRoles();
        return askNextAction();

    } catch (err) {
        console.error("\nSomething went wrong, please try again\n");
        return askNextAction();
    }
};

const createAddRoleDepartmentChoices = async () => {
    try {
        const results = await query("SELECT id, name AS department FROM departments;");
        const choices = [];

        for (const element of results) {
            choices.push(element.department)
        };

        return choices

    } catch (err) {
        console.error(err);
    }
};

const addEmployee = async () => {
    try {
        const rolesArr = await createRoleChoices();
        const employeesArr = await createEmployeeChoices();
        const roleChoices = [];
        const managerChoices = [];
        let managerId;
        let roleId;

        for (const element of rolesArr) {
            roleChoices.push(element.title);
        };

        for (const element of employeesArr) {
            managerChoices.push(element.fullName);
        };

        managerChoices.push("None");

        const { firstName, lastName, role, manager } = await inquirer.prompt([
            {
                type: 'input',
                message: "What is the employee's first name?",
                name: 'firstName',
                validate: function (input) {
                    return input.length > 0;
                }
            },
            {
                type: 'input',
                message: "What is the employee's Last name?",
                name: 'lastName',
                validate: function (input) {
                    return input.length > 0;
                }
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

        ]);

        for (const element of rolesArr) {
            if (role === element.title) {
                roleId = element.id;
                break;
            }
        };

        for (const element of employeesArr) {
            if (manager === element.fullName) {
                managerId = element.id;
                break;
            } else if (manager === "None") {
                managerId = null;
            }
        };

        await query(`INSERT INTO employees (first_name, last_name, role_id, manager_id) VALUES (?, ?, ?, ?)`, [firstName.trim(), lastName.trim(), roleId, managerId]);
        await viewAllEmployees();
        return askNextAction();

    } catch (err) {
        console.error("\nSomething went wrong, please try again\n");
        return askNextAction();
    };
};

const createRoleChoices = async () => {
    try {
        const results = await query("SELECT id, title FROM roles;");
        const rolesArr = [];

        for (const element of results) {
            const role = {};
            role.id = element.id;
            role.title = element.title;
            rolesArr.push(role);
        };

        return rolesArr

    } catch (err) {
        console.error("\nSomething went wrong, please try again\n");
        return askNextAction();
    };
};

const createEmployeeChoices = async () => {
    try {
        const results = await query("SELECT * FROM employees");
        const employeesArr = [];

        for (const element of results) {

            const employee = {};
            employee.id = element.id;
            employee.fullName = `${element.first_name} ${element.last_name}`;
            employeesArr.push(employee)

        };

        return employeesArr;

    } catch {
        console.error("\nSomething went wrong, please try again\n");
        return askNextAction();
    };
};

const updateEmployeeRole = async () => {
    try {
        const rolesArr = await createRoleChoices();
        const employeesArr = await createEmployeeChoices();
        const roleChoices = [];
        const employeeChoices = [];
        let employeeId;
        let roleId;

        for (const element of rolesArr) {
            roleChoices.push(element.title);
        };

        for (const element of employeesArr) {
            employeeChoices.push(element.fullName);
        };

        const { employee, role } = await inquirer.prompt([
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

        ]);

        for (const element of employeesArr) {
            if (employee === element.fullName) {
                employeeId = element.id;
                break;
            }
        };

        for (const element of rolesArr) {
            if (role === element.title) {
                roleId = element.id;
                break;
            }
        };

        await query(`UPDATE employees SET role_id = (?) WHERE id = (?)`, [roleId, employeeId]);
        await viewAllEmployees();
        return askNextAction();

    } catch (err) {
        console.error("\nSomething went wrong, please try again\n");
        return askNextAction();
    };
};

const updateEmployeeManager = async () => {
    const employeesArr = await createEmployeeChoices();
    const employeeChoices = [];
    let employeeId;
    let managerId;

    for (const element of employeesArr) {
        employeeChoices.push(element.fullName);
    };

    const { employee } = await inquirer.prompt([
        {
            type: 'list',
            message: "Which employee would you like to update?",
            name: 'employee',
            choices: employeeChoices
        },
    ]);

    const managerChoices = employeeChoices;
    for (let i = 0; i < managerChoices.length; i++) {
        if (employee === managerChoices[i]) {
            managerChoices.splice(i, 1);
            break;
        };
    };
    managerChoices.push("None");

    const { manager } = await inquirer.prompt([
        {
            type: 'list',
            message: "Who is the employee's new manager?",
            name: 'manager',
            choices: managerChoices
        },
    ]);

    for (const element of employeesArr) {
        if (employee === element.fullName) {
            employeeId = element.id;
            break;
        };
    };

    if (manager === "None") {
        managerId = null;
    } else {
        for (const element of employeesArr) {
            if (manager === element.fullName) {
                managerId = element.id;
                break;
            }
        }
    };

    await query(`UPDATE employees SET manager_id = (?) WHERE id = (?)`, [managerId, employeeId]);
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