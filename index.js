const inquirer = require('inquirer');
const fs = require('fs');
const { inherits } = require('util');

const mysql = require('mysql2');

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'MyNewPass',
    database: 'business_db'
});

function addDept() { //add a new department (name)
    inquirer.prompt([{
        type: 'input',
        name: 'addDept',
        message: 'What is the name of the department?',
        validate: deptInput => { if (deptInput) { return true; } else { return false; } }
    }]).then(({ addDept }) => {
        console.log('Add a new department to the database.');
    })
}

function addRole() { //add a new role (role, salary, which department)
    inquirer.prompt([{
            type: 'input',
            name: 'role',
            message: 'What is the name of the role?',
            validate: roleInput => { if (roleInput) { return true; } else { return false; } }
        },
        {
            type: 'input',
            name: 'salary',
            message: 'What is the salary of the role?',
            validate: salaryInput => { if (salaryInput) { return true; } else { return false; } }
        },
        {
            type: 'input',
            name: 'deptBelong',
            message: 'What department does the role belong to?',
            validate: belongInput => { if (belongInput) { return true; } else { return false; } }
        },
    ]).then(({ addDept }) => {
        console.log('Add a new role to the database.');
    })
}

function addEmployee() { //add a new employee (first and last name, role, and manager)
    inquirer.prompt([{
            type: 'input',
            name: 'first_name',
            message: 'What is the first name of the employee?',
            validate: fNameInput => { if (fNameInput) { return true; } else { return false; } }
        },
        {
            type: 'input',
            name: 'last_name',
            message: 'What is the last name of the employee?',
            validate: lNameInput => { if (lNameInput) { return true; } else { return false; } }
        },
        {
            type: 'input',
            name: 'eRole',
            message: 'What the role of the employee?',
            validate: eRoleInput => { if (eRoleInput) { return true; } else { return false; } }
        },
        {
            type: 'input',
            name: 'eManager',
            message: 'Who is the manager of the employee?',
            validate: eManagerInput => { if (eManagerInput) { return true; } else { return false; } }
        }
    ]).then(({ first_name, last_name, eRole, eManager }) => {
        console.log('Add a new employee to the database.');
    })
}

function updatEmployee() { //update an employee
    inquirer.prompt([{
        type: 'list',
        name: 'employee',
        message: 'Which employee do you want to update thier role?',
        choices: ['grabbing from database', 'list2'],
        validate: eInput => { if (eInput) { return true; } else { return false; } }
    }]).then(({ employee }) => {
        console.log('Update the role of an employee to the database.');
    })
}

function init() { //prompt user to with choices they would like to preform
    inquirer.prompt([{
        type: 'list',
        name: 'options',
        message: 'What would you like to do?',
        choices: ['View All Department', 'View All Roles', 'View All Employees', 'Add A Department',
            'Add A Role', 'Add An Employee', 'Update An Employee Role', 'Nothing'
        ]
    }]).then(({ options }) => {
        console.log(options);
        switch (options) { //selecting from the different choices
            case 'View All Department':
                console.log('Testing: view all department');
                break;
            case 'View All Roles':
                console.log('Testing: view all roles');
                break;
            case 'View All Employees':
                console.log('Testing: view all employees');
                break;
            case 'Add A Department':
                addDept();
                break;
            case 'Add A Role':
                addRole();
                break;
            case 'Add An Employee':
                addEmployee();
                break;
            case 'Update An Employee Role':
                updatEmployee();
                break;
            default:
                break;
        }
    })
}

init(); //initialize