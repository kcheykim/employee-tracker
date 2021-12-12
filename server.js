const inquirer = require('inquirer');
const fs = require('fs');
require('console.table');

const db = require('mysql2').createConnection({ //database connection
    host: 'localhost',
    user: 'root',
    password: 'MyNewPass',
    database: 'business_db'
});

function viewAll(table, indicator) { //view tables
    switch (table) { //selecting from the different choices
        case `department`: //view all department
            db.query((`SELECT * FROM department`), (err, res) => {
                err ? console.log(err) : console.table(res);
                init();
            });
            break;
        case `role`: //view all roles
            db.query((`SELECT role.id, role.title, role.salary, department.name AS department 
                FROM ${table} LEFT JOIN department ON role.department_id = department.id`), (err, res) => {
                err ? console.log(err) : console.table(res);
                init();
            });
            break;
        case `employee`:
            if (indicator != 1) { //view employees by manager or department
                let orderBy = `department`;
                if (indicator === 2) { orderBy = `manager`; }
                db.query((`SELECT e.id, e.first_name, e.last_name, department.name AS department, 
                role.title, role.salary, CONCAT(m.first_name, ' ', m.last_name) AS manager
                    FROM ${table} e LEFT JOIN ${table} m ON m.id = e.manager_id
                    JOIN role ON e.role_id = role.id
                    JOIN department ON role.department_id = department.id
                    ORDER BY ${orderBy}`), (err, res) => {
                    console.log('\n');
                    err ? console.log(err) : console.table(res);
                    init();
                });
            } else { //view all employees
                db.query((`SELECT e.id, e.first_name, e.last_name, department.name AS department, 
                role.title, role.salary, CONCAT(m.first_name, ' ', m.last_name) AS manager
                    FROM ${table} e LEFT JOIN ${table} m ON m.id = e.manager_id
                    JOIN role ON e.role_id = role.id
                    JOIN department ON role.department_id = department.id
                    ORDER BY e.id`), (err, res) => {
                    console.log('\n');
                    err ? console.log(err) : console.table(res);
                    init();
                });
            }
            break;
        default:
            init();
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
            err ? console.log(err) : console.log(`Added Department: ${addDept}`);
        }
        viewAll(`department`, 1);
    })
}

function addRole() { //add a new role (role, salary, department_id it belongs to)
    db.query((`SELECT id, name FROM department`), (err, res) => {
        res = res.map(function(item) { return item.id + ' ' + item.name; })
        err ? console.log(err) : console.log('Adding A New Role');
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
                (err, res) => { err ? console.log(err) : console.log(`Added Role: ${role}`); }
            viewAll(`role`, 1);
        });
    });
}

function addEmployee() { //add an employee
    db.query((`SELECT id, title FROM role`), (err, res) => {
        err ? console.log(err) : console.log('To Add Employee');
        res = res.map(function(element) { return element.id + ' ' + element.title; })
        return inquirer.prompt([{ //prompt for employee info
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
        ]).then(({ fName, lName, eRole }) => { //select manager for new employee
            let roleID = eRole.split(' ')[0];
            db.query((`SELECT id, first_name, last_name FROM employee`), (err, res2) => {
                err ? console.log(err) : console.log('Select Manager');
                res2 = res2.map(function(element) { return element.id + ' ' + element.first_name + ' ' + element.last_name; })
                return inquirer.prompt([{
                    type: 'list',
                    name: 'eManager',
                    message: 'Select their manager: ',
                    choices: res2,
                }]).then(({ eManager }) => { //insert new employee info into database
                    let managerID = eManager.split(' ')[0];
                    db.query(`INSERT INTO employee (first_name, last_name, role_id, manager_id ) 
                            VALUES ('${fName}', '${lName}', ${roleID}, ${managerID})`),
                        (err, res3) => { err ? console.log(err) : console.log('Finish Adding Employee'); }
                    viewAll(`employee`, 1); //output table with new employee
                });
            });
        })
    });
}

function update(request) { //update an employee's role or manager
    let selectStmt, updateItem = ``;
    if (request === `role`) {
        selectStmt = `SELECT id, title FROM role`;
        updateItem = `role_id`;
    } else {
        selectStmt = `SELECT id, first_name, last_name FROM employee`;
        updateItem = `manager_id`;
    }
    db.query((`SELECT id, first_name, last_name FROM employee`), (err, res1) => {
        err ? console.log(err) : console.log('Selecting Employee');
        res1 = res1.map(function(item) { return item.id + ' ' + item.first_name + ' ' + item.last_name; })
        return inquirer.prompt([{ //prompt for employee to be updated
            type: 'list',
            name: 'updateEmployee',
            message: 'Select an employee to update their role:',
            choices: res1,
        }]).then(({ updateEmployee }) => { //query the new manager or role
            let employeeID = updateEmployee.split(' ')[0];
            db.query((selectStmt), (err, res2) => {
                err ? console.log(err) : console.log(`Choose A New ${request}`);
                res2 = res2.map(function(item) {
                    if (request === `role`) {
                        return item.id + ' ' + item.title;
                    } else {
                        return item.id + ' ' + item.first_name + ' ' + item.last_name;
                    }
                })
                return inquirer.prompt([{ //prompt for the updated manager or role
                    type: 'list',
                    name: 'newUpdate',
                    message: 'Select their new role or manager:',
                    choices: res2,
                    validate: eInput => { if (eInput) { return true; } else { return false; } }
                }]).then(({ newUpdate }) => { //update the new role or manager to the employee
                    let updateID = newUpdate.split(' ')[0];
                    db.query(`UPDATE employee set ${updateItem} = '${updateID}' WHERE id = ${employeeID}`),
                        (err, res3) => { err ? console.log(err) : console.log(`Updating Employee`); }
                    viewAll(`employee`, 1)
                });
            });
        })
    });
}

function deleteOpt(table) { //delete a role, department or employee from the database
    let selection = ``;
    if (table === `role`) { selection = `id, title`; }
    if (table === `department`) { selection = `id, name`; }
    if (table === `employee`) { selection = `id, first_name, last_name`; }
    db.query((`SELECT ${selection} FROM ${table}`), (err, res1) => {
        err ? console.log(err) : console.log('Delete From This List');
        res1 = res1.map(function(item) {
            if (table === `role`) { return item.id + ' ' + item.title; }
            if (table === `department`) { return item.id + ' ' + item.name; }
            if (table === `employee`) { return item.id + ' ' + item.first_name + ' ' + item.last_name; }
        })
        return inquirer.prompt([{
            type: 'list',
            name: 'delOpt',
            message: `Delete your ${table}`,
            choices: res1,
        }]).then(({ delOpt }) => {
            let deleteID = delOpt.split(' ')[0];
            db.query(`DELETE FROM ${table} WHERE id =${deleteID}`),
                (err, res2) => { err ? console.log(err) : console.log(`${table} has been deleted`); }
            viewAll(`${table}`, 1);
        });
    });
}

function deptBudget() { //view total budget for each department
    db.query((`SELECT department.id, department.name AS department, 
    SUM(role.salary) AS total_budget 
        FROM employee e LEFT JOIN employee m ON m.id = e.manager_id
        JOIN role ON e.role_id = role.id
        JOIN department ON role.department_id = department.id group by department`),
        (err, res) => {
            err ? console.log(err) : console.table(res);
            init();
        });
}

function init() { //prompt user to with choices they would like to preform
    inquirer.prompt([{
        type: 'list',
        name: 'options',
        message: 'What would you like to do?',
        choices: ['View All Department', 'View All Roles', 'View All Employees', 'Add A Department',
            'Add A Role', 'Add An Employee', 'Update An Employee Role', 'Update An Employee Manager',
            'View Employee By Manager', 'View Employee By Department', 'Delete A Department',
            'Delete A Role', 'Delete An Employee', 'View Department Budget', 'EXIT'
        ]
    }]).then(({ options }) => {
        switch (options) { //selecting from the different choices
            case 'View All Department':
                viewAll(`department`, 0);
                break;
            case 'View All Roles':
                viewAll(`role`, 0);
                break;
            case 'View All Employees':
                viewAll(`employee`, 1);
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
                update(`role`);
                break;
            case 'Update An Employee Manager':
                update(`manager`);
                break;
            case 'View Employee By Manager':
                viewAll(`employee`, 2);
                break;
            case 'View Employee By Department':
                viewAll(`employee`, 3);
                break;
            case 'Delete A Department':
                deleteOpt(`department`);
                break;
            case 'Delete A Role':
                deleteOpt(`role`);
                break;
            case 'Delete An Employee':
                deleteOpt(`employee`);
                break;
            case 'View Department Budget':
                deptBudget();
                break;
            default:
                console.log('END');
                process.exit();
        }
    })
}

init(); //initialize