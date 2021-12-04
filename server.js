const inquirer = require('inquirer');
const fs = require('fs');
const { inherits } = require('util');

const db = require('mysql2').createConnection({
    host: 'localhost',
    user: 'root',
    password: 'MyNewPass',
    database: 'business_db'
});

function viewAll(table) {
    db.query((`SELECT * FROM ${table}`), (err, res) => {
        res ? console.table(res) : console.log(err);
    });
    init();
}

function addDept() { //add a new department (name)
    inquirer.prompt([{
        type: 'input',
        name: 'addDept',
        message: 'What is the name of the department?',
        validate: deptInput => { if (deptInput) { return true; } else { return false; } }
    }]).then(({ addDept }) => {
        db.query(`INSERT INTO department (name) VALUES ('${addDept}')`), (err, res) => {
            res ? console.log(`Added: ${Sales}`) : console.log(err);
        }
        viewAll(`department`);
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
            name: 'deptID',
            message: 'What department does the role belong to?',
            validate: deptIDInput => { if (deptIDInput) { return true; } else { return false; } }
        },
    ]).then(({ role, salary, deptID }) => {
        console.log(role, salary, deptID);
        db.query(`INSERT INTO role (title, salary, department_id ) VALUES ('${role}', ${salary}, ${deptID})`),
            (err, res) => { res ? console.log(`Added: ${Sales}`) : console.log(err); }
        viewAll(`role`);
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
        console.log(first_name, last_name, eRole, eManager);
        db.query(`INSERT INTO employee (first_name, last_name, role_id, manager_id ) 
                VALUES ('${first_name}', '${last_name}', ${eRole}, ${eManager})`),
            (err, res) => { res ? console.log(`Added: ${first_name} ${last_name}`) : console.log(err); }
        viewAll(`employee`);
    })
}

// function updateRole() { //update an employee
//     db.query((`SELECT id, last_name, first_name FROM employee ORDER BY last_name`), (err, res) => {
//         if (err) { throw err; } else {
//             inquirer.prompt([{
//                 type: 'list',
//                 name: 'employee',
//                 message: 'Which employee do you want to update thier role?',
//                 choices: res.map(res => res.id, res.first_name, res.last_name),
//                 validate: eInput => { if (eInput) { return true; } else { return false; } }
//             }]).then(({ employee }) => {
//                 console.log(`${employee.first_name + ' ' + employee.last_name} is being updated`);
//             })
//         }
//     });

// }



function init() { //prompt user to with choices they would like to preform
    inquirer.prompt([{
        type: 'list',
        name: 'options',
        message: 'What would you like to do?',
        choices: ['View All Department', 'View All Roles', 'View All Employees', 'Add A Department',
            'Add A Role', 'Add An Employee', 'Update An Employee Role', 'EXIT'
        ]
    }]).then(({ options }) => {
        switch (options) { //selecting from the different choices
            case 'View All Department':
                viewAll(`department`);
                break;
            case 'View All Roles':
                viewAll(`role`);
                break;
            case 'View All Employees':
                viewAll(`employee`);
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
                updateRole();
                break;
            default:
                break;
        }
    })
}

init(); //initialize