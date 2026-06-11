-- ==========================================
-- Database Schema for Task Management System
-- Database name: task_manager_db
-- Target Platform: MySQL 8.x + / MariaDB
-- ==========================================

-- Create Database if not exists
CREATE DATABASE IF NOT EXISTS task_manager_db;
USE task_manager_db;

-- Drop tables if they exist to facilitate fresh installs
DROP TABLE IF EXISTS tasks;
DROP TABLE IF EXISTS users;

-- 1. Create User table
CREATE TABLE users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    CONSTRAINT chk_name_length CHECK (CHAR_LENGTH(name) >= 2)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Index on user email for fast lookups during security authentication
CREATE UNIQUE INDEX idx_user_email ON users(email);

-- 2. Create Task table
CREATE TABLE tasks (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(150) NOT NULL,
    description TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    due_date DATE,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    user_id BIGINT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT chk_status VALUE (status IN ('PENDING', 'IN_PROGRESS', 'COMPLETED'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Index on foreign key user_id and task status to optimize dashboards
CREATE INDEX idx_task_user_id ON tasks(user_id);
CREATE INDEX idx_task_status ON tasks(status);

-- ==========================================
-- SAMPLE SEED DATA
-- Note: Password is BCrypt encrypted representation of 'password123'
-- ==========================================

-- Insert sample users
INSERT INTO users (id, name, email, password) VALUES 
(1, 'Alice Smith', 'alice@example.com', '$2a$10$v0a9sF8P0y.N6i2fG76G1OmgByB0fRTeuC1T2G.uPe2I56p69TfFe'),
(2, 'Bob Johnson', 'bob@example.com', '$2a$10$v0a9sF8P0y.N6i2fG76G1OmgByB0fRTeuC1T2G.uPe2I56p69TfFe');

-- Insert tasks for Alice
INSERT INTO tasks (title, description, status, due_date, created_at, user_id) VALUES 
('Setup Spring Boot Architecture', 'Initialize Maven imports, wire Spring Security configurations, and declare JPA domain mapping entities.', 'COMPLETED', '2026-06-15', '2026-06-11 08:30:00', 1),
('Build Secure JWT Validation Filter', 'Write Token Provider and create OncePerRequest filter to intercept and authenticate requests.', 'IN_PROGRESS', '2026-06-18', '2026-06-11 09:00:00', 1),
('Draft Frontend Interface Wireframes', 'Design modern Bootstrap and Tailwind UI dashboards and login screens.', 'PENDING', '2026-06-25', '2026-06-11 09:15:00', 1);

-- Insert tasks for Bob
INSERT INTO tasks (title, description, status, due_date, created_at, user_id) VALUES 
('Establish Cloud Service Pipelines', 'Deploy microservices containers to Cloud Run, bind ingress routes, and setup MySQL databases.', 'PENDING', '2026-07-01', '2026-06-11 10:00:00', 2);
