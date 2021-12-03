const inquirer = require('inquirer');
class Department {
    constructor(dept_name, id) {
        this.dept_name = dept_name;
        this.id = id;
    }

    getName() { return this.dept_name; }
    getID() { return this.id; }
}