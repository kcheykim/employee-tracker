const inquirer = require('inquirer');
class Role {
    constructor(role_name, salary, assoc_dept) {
        this.role_name = role_name;
        this.salary = salary;
        this.assoc_dept = assoc_dept;
    }

    getRoleName() { return this.role_name; }
    getSalary() { return this.salary; }
    getAssocDept() { return this.assoc_dept; }
}