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

function viewAll(table, indicator) { //select all from a table
    let new_table;
    if (indicator === 1) {
        db.query((`SELECT * FROM ${table}`), (err, res) => {
            console.log('\n');
            res ? console.table(res) : console.log(err);
            init();
        });
    } else {
        switch (table) { //selecting from the different choices
            case `role`:
                db.query((`SELECT role.id, role.title, role.salary, department.name AS department 
                FROM ${table} LEFT JOIN department ON role.department_id = department.id`), (err, res) => {
                    console.log('\n');
                    res ? console.table(res) : console.log(err);
                    init();
                });
                break;
            case `employee`:
                db.query((`SELECT e.id, e.first_name, e.last_name, department.name AS department, 
                role.title, role.salary, CONCAT(m.first_name, ' ', m.last_name) AS manager
                    FROM ${table} e JOIN role ON e.role_id = role.id
                    JOIN department ON role.department_id = department.id
                    LEFT JOIN ${table} m ON m.id = e.manager_id ORDER BY e.id`), (err, res) => {
                    console.log('\n');
                    res ? console.table(res) : console.log(err);
                    init();
                });
                break;
            default:
                init();
        }
    }
}

function addDept() { //add a new department (name)
    inquirer.prompt([{
        type: 'input',
        name: 'addDept',
        message: 'What is the name of the department?',
        validate: deptInput => { if (deptInput) { return true; } else { return false; } }
    }]).then(({ addDept }) => {
        db.query(`INSERT INTO department (name) VALUES ('${addDept}')`), (err, res) => {
            res ? console.log(`Added Department: ${addDept}`) : console.log(err);
        }
        viewAll(`department`, 1);
    })
}

function addRole() { //add a new role (role, salary, department_id it belongs to)
    db.query((`SELECT id, name FROM department`), (err, res) => {
        res = res.map(function(element) { return element.id + ' ' + element.name; })
        res ? console.log('Add ') : console.log(err);
        return inquirer.prompt([{ //inquirer prompts for role inputs
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
                type: 'list',
                name: 'deptID',
                choices: res,
                message: 'What department does the role belong to?',
                validate: deptIDInput => { if (deptIDInput) { return true; } else { return false; } }
            },
        ]).then(({ role, salary, deptID }) => { //inserting the input to the role table
            let dID = deptID.split(' ')[0];
            db.query(`INSERT INTO role (title, salary, department_id ) VALUES ('${role}', ${salary}, ${dID})`),
                (err, res) => { res ? console.log(`Added Role: ${role}`) : console.log(err); }
            viewAll(`role`, 2);
        });
    });
}

function addEmployee() { //update an employee
    db.query((`SELECT id, title FROM role`), (err, res) => {
        res = res.map(function(element) { return element.id + ' ' + element.title; })
        res ? console.log('To Add Employee') : console.log(err);
        return inquirer.prompt([{
                type: 'input',
                name: 'fName',
                message: 'What is the first name of the employee?',
                validate: fNameInput => { if (fNameInput) { return true; } else { return false; } }
            },
            {
                type: 'input',
                name: 'lName',
                message: 'What is the last name of the employee?',
                validate: lNameInput => { if (lNameInput) { return true; } else { return false; } }
            },
            {
                type: 'list',
                name: 'eRole',
                message: 'Select their role:',
                choices: res,
            }
        ]).then(({ fName, lName, eRole }) => {
            let roleID = eRole.split(' ')[0];
            db.query((`SELECT id, first_name, last_name FROM employee`), (err, res2) => {
                res2 ? console.log('Select Manager') : console.log(err);
                res2 = res2.map(function(element) { return element.id + ' ' + element.first_name + ' ' + element.last_name; })
                return inquirer.prompt([{
                    type: 'list',
                    name: 'eManager',
                    message: 'Select their manager: ',
                    choices: res2,
                }]).then(({ first_name, last_name, eRole, eManager }) => {
                    let managerID = eManager.split(' ')[0];
                    db.query(`INSERT INTO employee (first_name, last_name, role_id, manager_id ) VALUES ('${fName}', '${lName}', ${roleID}, ${managerID})`),
                        (err, res3) => { res3 ? viewAll(`employee`, 1) : console.log(err); }
                    viewAll(`employee`, 2);
                    init();
                });
            });
        })
    });
}

function updateRole() { //update an employee
    db.query((`SELECT id, first_name, last_name FROM employee`), (err, res1) => {
        res1 ? console.log('Selecting Employee') : console.log(err);
        res1 = res1.map(function(element) { return element.id + ' ' + element.first_name + ' ' + element.last_name; })
        return inquirer.prompt([{
            type: 'list',
            name: 'updateEmployee',
            message: 'Select an employee to update their role:',
            choices: res1,
        }]).then(({ updateEmployee }) => {
            let employeeID = updateEmployee.split(' ')[0];
            db.query((`SELECT id, title FROM role`), (err, res2) => {
                res2 ? console.log('Choose New Role') : console.log(err);
                res2 = res2.map(function(element) { return element.id + ' ' + element.title; })
                return inquirer.prompt([{
                    type: 'list',
                    name: 'newRole',
                    message: 'Select their new role:',
                    choices: res2,
                    validate: eInput => { if (eInput) { return true; } else { return false; } }
                }]).then(({ newRole }) => {
                    let roleID = newRole.split(' ')[0];
                    db.query(`UPDATE employee set role_id = '${roleID}' WHERE id = ${employeeID}`),
                        (err, res3) => { res3 ? console.log(`Updating Employee Role`) : console.log(err); }
                    viewAll(`employee`, 2)
                    init();
                });
            });
        })
    });
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
                viewAll(`department`, 1);
                break;
            case 'View All Roles':
                viewAll(`role`, 2);
                break;
            case 'View All Employees':
                viewAll(`employee`, 2);
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