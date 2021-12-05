const inquirer = require('inquirer');
const fs = require('fs');
require('console.table');

// database connection
const db = require('mysql2').createConnection({
    host: 'localhost',
    user: 'root',
    password: 'MyNewPass',
    database: 'business_db'
});

function viewAll(table) { //select all from a table
    db.query((`SELECT * FROM ${table}`), (err, res) => {
        console.log('\n');
        res ? console.table(res) : console.log(err);
        console.log('\n');
        init();
    });
}

function getRole() {
    db.query((`SELECT id, title, salary FROM role`), (err, res) => {
        res ? console.log('List of Roles') : console.log(err);
        res = res.map(function(element) {
            return element.id + ' ' + element.title + ' ' + element.salary;
        })
    });
}

function getManager() {
    db.query((`SELECT id, first_name, last_name FROM employee`), (err, res) => {
        res ? console.log('List of Managers') : console.log(err);
        res = res.map(function(element) {
            return element.id + ' ' + element.first_name + ' ' + element.last_name;
        })
    });
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

function addRole() { //add a new role (role, salary, department_id it belongs to)
    inquirer.prompt([{ //inquirer prompts for role inputs
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
    ]).then(({ role, salary, deptID }) => { //inserting the input to the role table
        console.log(role, salary, deptID);
        db.query(`INSERT INTO role (title, salary, department_id ) VALUES ('${role}', ${salary}, ${deptID})`),
            (err, res) => { res ? console.log(`Added: ${Sales}`) : console.log(err); }
        viewAll(`role`);
    })
}

function addEmployee() {
    let managerList = getManager();
    let roleList = getRole();
    console.log(managerList);
    //update an employee
    // db.query((`SELECT title FROM role`), (err, res) => {
    //     console.log(res);
    //     res ? console.log(res) : console.log(err);
    //     res = res.map(function(element) { return element.title; })
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
                type: 'list',
                name: 'eRole',
                message: 'Select their role:',
                choices: db.query((`SELECT title FROM role`), (err, res) => {
                    console.log(res);
                    res ? console.log(res) : console.log(err);
                    res = res.map(function(element) { return element.id + element.title; })
                }),
                validate: eInput => { if (eInput) { return true; } else { return false; } }
            },
            {
                type: 'list',
                name: 'eManager',
                message: 'Select their manager: ',
                choices: managerList,
                validate: eManagerInput => { if (eManagerInput) { return true; } else { return false; } }
            }
        ]).then(({ first_name, last_name, eRole, eManager }) => {
            console.log(`${first_name, last_name, eRole, eManager} is being updated`);
            init();
        })
        //  });
}

function updateRole() { //update an employee
    let employeeID, roleID;
    db.query((`SELECT id, first_name, last_name FROM employee`), (err, res) => {
        res ? console.table(res) : console.log(err);
        res = res.map(function(element) {
            return element.id + ' ' + element.first_name + ' ' + element.last_name;
        })
        inquirer.prompt([{
            type: 'list',
            name: 'updateEmployee',
            message: 'Select an employee to update their role:',
            choices: res,
            validate: eInput => { if (eInput) { return true; } else { return false; } }
        }]).then(({ updateEmployee }) => {
            employeeID = updateEmployee[0];
            console.log(employeeID);
            db.query((`SELECT id, title FROM role`), (err, res) => {
                res ? console.table(res) : console.log(err);
                res = res.map(function(element) {
                    return element.id + ' ' + element.title;
                })
                inquirer.prompt([{
                    type: 'list',
                    name: 'newRole',
                    message: 'Select their new role:',
                    choices: res,
                    validate: eInput => { if (eInput) { return true; } else { return false; } }
                }]).then(({ newRole }) => {
                    console.log(newRole)
                    db.query(`UPDATE INTO employee (role_id) VALUES ('${newRole}' WHERE id = ${employeeID}`),
                        (err, res) => { res ? viewAll(`employee`) : console.log(err); }
                });
                console.log(`${updateEmployee} is being updated`);
            });
        })
    });
    init();
}

function init() { //prompt user to with choices they would like to preform
    inquirer.prompt([{
        type: 'list',
        name: 'options',
        message: 'What would you like to do?',
        choices: ['View All Department', 'View All Roles', 'View All Employees', 'Add A Department', 'Add A Role', 'Add An Employee', 'Update An Employee Role', 'EXIT']
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
                console.log('END');
                process.exit();
        }
    })
}

init(); //initialize