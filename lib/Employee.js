const inquirer = require('inquirer');
class Employee {
    constructor(first_name, last_name, role, manager) {
        this.first_name = first_name;
        this.last_name = last_name;
        this.role = role;
        this.manager = manager;
    }

    getFname() { return this.first_name; }
    getLname() { return this.last_name; }
    getRole() { return this.role; }
    getManager() { return this.manager; }
}