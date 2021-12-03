const inquirer = require('inquirer');
class Role {
    constructor(role, salary, department_id) {
        this.role = role;
        this.salary = salary;
        this.department_id = department_id;
    }

    getRoleName() { return this.name; }
    getSalary() { return this.salary; }
    getAssocDept() { return this.department_id; }
}