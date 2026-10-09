CREATE DATABASE IF NOT EXISTS helpdesk;
USE helpdesk;

CREATE TABLE IF NOT EXISTS tickets (
  ticket_id VARCHAR(30) PRIMARY KEY,
  employee_name VARCHAR(100) NOT NULL,
  title VARCHAR(200) NOT NULL,
  description TEXT NOT NULL,
  priority ENUM('Critical','High','Medium','Low') NOT NULL DEFAULT 'Medium',
  assigned_to VARCHAR(100),
  status ENUM('Open','Assigned','In Progress','Resolved') NOT NULL DEFAULT 'Open',
  resolution TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS employees (
  employee_id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL,
  role VARCHAR(100) DEFAULT 'IT Support Engineer'
);

INSERT INTO employees(name) VALUES
('Rahul'),('Priya'),('Arun'),('Divya');
