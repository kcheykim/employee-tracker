INSERT INTO department (name)
VALUES 
    ('Developers'),
    ('Human Resources'),
    ('Business');

INSERT INTO role (title, salary, department_id)
VALUES 
    ('Full Stack Developer', 120000, 1),
    ('Administrative Assistant', 85000, 2),
    ('Attorney', 350000, 3),
    ('Resource Specialist', 100000, 2),
    ('Analyst', 150000, 1);

INSERT INTO employee (first_name, last_name, role_id, manager_id)
VALUES 
    ('Billy', 'Blabber', 4, NULL),
    ('Sue', 'Silly', 5, NULL),
    ('Elle', 'Excited', 3, NULL),
    ('John', 'Joke', 1, 2),
    ('Henry', 'Humor', 2, 4),
    ('Terry', 'Talkative', 1, 2),
    ('Rose', 'Rumor', 1, 2);