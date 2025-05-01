drop database worksphere_db;
CREATE database worksphere_db; 
USE worksphere_db;

CREATE TABLE users (
    id              BIGINT AUTO_INCREMENT PRIMARY KEY,
    first_name      VARCHAR(50) NOT NULL,
    last_name       VARCHAR(50) NOT NULL,
    email           VARCHAR(100) COLLATE utf8mb4_unicode_ci NOT NULL UNIQUE,
    password_hash   VARCHAR(255) NOT NULL,
    profile_picture VARCHAR(255) DEFAULT NULL, -- Stores the file path or URL
    dob             DATE DEFAULT NULL,
    gender          ENUM('MALE', 'FEMALE', 'OTHER') DEFAULT NULL,
    -- phone_number    VARCHAR(20) DEFAULT NULL UNIQUE,
    role            ENUM('ADMIN', 'USER') NOT NULL DEFAULT 'USER', -- Global system role
    -- status          ENUM('active', 'inactive', 'banned') NOT NULL DEFAULT 'active',
    bio             varchar(512) DEFAULT NULL,
    title           VARCHAR(50) DEFAULT NULL,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE projects (
    id             BIGINT AUTO_INCREMENT PRIMARY KEY,
    name           VARCHAR(255) NOT NULL,
    description    TEXT DEFAULT NULL,
    owner_id       BIGINT NOT NULL,  -- The user who created the project
    status         ENUM('not_started', 'pending', 'in_progress', 'completed', 'on_hold', 'canceled') NOT NULL DEFAULT 'in_progress',
    visibility     ENUM('PRIVATE', 'PUBLIC') NOT NULL DEFAULT 'PRIVATE', -- Private = invite-only, Public = visible to all
    progress       TINYINT UNSIGNED DEFAULT 0 CHECK (progress BETWEEN 0 AND 100), 
    start_date     DATE DEFAULT NULL,
    end_date       DATE DEFAULT NULL,
    created_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE project_members (
    id           BIGINT AUTO_INCREMENT PRIMARY KEY,
    project_id   BIGINT NOT NULL,
    user_id      BIGINT NOT NULL,
	role         ENUM('PROJECT_MANAGER', 'TEAM_MEMBER', 'SPECTATOR') NOT NULL DEFAULT 'TEAM_MEMBER',
	status       ENUM('ACTIVE', 'INVITED', 'REMOVED', 'LEFT') NOT NULL DEFAULT 'ACTIVE',
    joined_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE (project_id, user_id) -- Prevents duplicate user-project entries
);

CREATE TABLE tasks (
    id           BIGINT AUTO_INCREMENT PRIMARY KEY,
    project_id   BIGINT NOT NULL,
    assigned_to  BIGINT NULL,  -- Can be unassigned initially
    title        VARCHAR(255) NOT NULL,
    description  TEXT NULL,
    status       ENUM('NOT_STARTED', 'PENDING', 'IN_PROGRESS', 'COMPLETED', 'ON_HOLD', 'CANCELED') NOT NULL DEFAULT 'PENDING',
    priority     ENUM('LOW', 'MEDIUM', 'HIGH', 'CRITICAL') NOT NULL DEFAULT 'MEDIUM',
    deadline     DATE DEFAULT NULL,
    created_by     BIGINT NOT NULL,
    created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    FOREIGN KEY (assigned_to) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_task_title ON tasks(title);
CREATE INDEX idx_task_priority ON tasks(priority);
CREATE INDEX idx_task_status ON tasks(status);
CREATE INDEX idx_task_assigned_to ON tasks(assigned_to);
CREATE INDEX idx_task_created_by ON tasks(created_by);

CREATE TABLE labels (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(50) NOT NULL UNIQUE,
    color VARCHAR(20) DEFAULT '#cccccc', -- Optional: store color for visual representation
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    task_id BIGINT NOT NULL,  -- Foreign key to the tasks table
    FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE
);

CREATE TABLE task_attachments (
    id           BIGINT AUTO_INCREMENT PRIMARY KEY,
    task_id      BIGINT NOT NULL,
    file_name    VARCHAR(255) NOT NULL,
    file_path    VARCHAR(255) NOT NULL,  -- Stores URL or file path
    uploaded_by  BIGINT NOT NULL,
    created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE,
    FOREIGN KEY (uploaded_by) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE task_activity_log (
    id           BIGINT AUTO_INCREMENT PRIMARY KEY,
    task_id      BIGINT NOT NULL,
    user_id      BIGINT NOT NULL,
    action       ENUM('CREATED', 'UPDATED', 'STATUS_CHANGED', 'COMMENTED') NOT NULL,
    changed_data TEXT,
    created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE notifications (
    id           BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id      BIGINT NOT NULL,
    message      TEXT NOT NULL,
    is_read      BOOLEAN DEFAULT FALSE,
    created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE task_comments (
    id           BIGINT AUTO_INCREMENT PRIMARY KEY,
    task_id      BIGINT NOT NULL,
    user_id      BIGINT NOT NULL,
    comment      TEXT NOT NULL,
    -- mentioned_users JSON DEFAULT NULL, -- JSON Array of mentioned user IDs
    created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE kanban_boards (
    id           BIGINT AUTO_INCREMENT PRIMARY KEY,
    project_id   BIGINT NOT NULL,
    created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
);

CREATE TABLE kanban_columns (
    id           BIGINT AUTO_INCREMENT PRIMARY KEY,
    board_id     BIGINT NOT NULL,
    title        VARCHAR(255) NOT NULL,
    -- position     INT NOT NULL,
    created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (board_id) REFERENCES kanban_boards(id) ON DELETE CASCADE
);

CREATE TABLE kanban_tasks (
    id           BIGINT AUTO_INCREMENT PRIMARY KEY,
    column_id    BIGINT NOT NULL,
    task_id      BIGINT NOT NULL,
	-- position     INT NOT NULL,
    FOREIGN KEY (column_id) REFERENCES kanban_columns(id) ON DELETE CASCADE,
    FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE
);

CREATE TABLE system_logs (
    id            BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id       BIGINT NULL,  -- NULL if action is system-generated
    action        ENUM('LOGIN', 'LOGOUT', 'USER_CREATED', 'USER_DELETED', 'PROJECT_CREATED', 'PROJECT_UPDATED', 'PROJECT_DELETED', 'TASK_CREATED', 'TASK_UPDATED', 'TASK_DELETED', 'PERMISSION_CHANGED') NOT NULL,
    description   TEXT NOT NULL,  -- Details of the action performed
    created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);


-- Password admin123
-- USERS
INSERT INTO users (first_name, last_name, email, password_hash, profile_picture, dob, gender, role)
VALUES 
('admin', 'admin', 'admin@worksphere.com', '$2a$10$gRPwOXWy.5vZRNTFt.46ceu3i7JKW6fnE5QA3Js2.8090TTblew1y', NULL, '2000-03-23', 'FEMALE', 'ADMIN'),
('Hafsa', 'Imtiaz', 'hafsa@ws.com', '$2a$10$gRPwOXWy.5vZRNTFt.46ceu3i7JKW6fnE5QA3Js2.8090TTblew1y', NULL, '2000-07-06', 'FEMALE', 'USER'),
('Areen', 'Zainab', 'areen@ws.com', '$2a$10$gRPwOXWy.5vZRNTFt.46ceu3i7JKW6fnE5QA3Js2.8090TTblew1y', NULL, '2000-03-25', 'FEMALE', 'USER'),
('Mahum', 'Hamid', 'mahum@ws.com', '$2a$10$gRPwOXWy.5vZRNTFt.46ceu3i7JKW6fnE5QA3Js2.8090TTblew1y', NULL, '2000-07-01', 'FEMALE', 'USER');
-- admin123 
-- PROJECTS
INSERT INTO projects (name, description, owner_id, status, visibility, progress, start_date, end_date)
VALUES 
('Marketing Campaign', 'Launch new social media campaign for summer.', 2, 'in_progress', 'PUBLIC', 45, '2025-04-01', '2025-06-30'),
('Website Revamp', 'Redesign and deploy the new corporate website.', 3, 'not_started', 'PRIVATE', 0, '2025-05-10', '2025-08-10'),
('Mobile App Launch', 'Build and launch the beta version of the app.', 4, 'in_progress', 'PUBLIC', 30, '2025-04-15', '2025-07-15');

-- PROJECT MEMBERS
INSERT INTO project_members (project_id, user_id, role)
VALUES 
(1, 2, 'project_manager'),
(1, 3, 'team_member'),
(1, 4, 'team_member'),
(2, 2, 'team_member'),
(2, 3, 'project_manager'),
(3, 4, 'project_manager'),
(3, 2, 'team_member'),
(3, 3, 'team_member');

-- TASKS
INSERT INTO tasks (project_id, assigned_to, title, description, status, priority, deadline, created_by)
VALUES 
-- Project 1
(1, 2, 'Design Social Media Ads', 'Create banner and carousel images for campaign.', 'IN_PROGRESS', 'HIGH', '2025-05-15', 2),
(1, 2, 'Draft Campaign Copy', 'Write captions and ad copy for each post.', 'PENDING', 'MEDIUM', '2025-05-10', 2),

-- Project 2
(2, 2, 'Review Wireframes', 'Review website wireframes shared by UX team.', 'NOT_STARTED', 'MEDIUM', '2025-05-20', 3),
(2, 2, 'Migrate Content', 'Move content from old site to new CMS.', 'PENDING', 'HIGH', '2025-06-01', 3),

-- Project 3
(3, 4, 'Setup CI/CD Pipeline', 'Configure GitHub Actions for build & deploy.', 'IN_PROGRESS', 'HIGH', '2025-05-20', 4),
(3, 3, 'Create Landing Page', 'Design and code the marketing landing page.', 'PENDING', 'MEDIUM', '2025-05-25', 4),
(3, 2, 'User Testing', 'Coordinate beta testing with selected users.', 'NOT_STARTED', 'LOW', '2025-06-05', 4);

-- LABELS
-- Task 1
INSERT INTO labels (name, color, task_id) VALUES 
('Urgent', '#ff4d4d', 1),
('UI/UX', '#0099ff', 1);

-- Task 2
INSERT INTO labels (name, color, task_id) VALUES 
('Copywriting', '#ffcc00', 2);

-- Task 3
INSERT INTO labels (name, color, task_id) VALUES 
('QA', '#33cc33', 3);

-- Task 5
INSERT INTO labels (name, color, task_id) VALUES 
('DevOps', '#800080', 5),
('Backend', '#8B0000', 5);

-- Task 6
INSERT INTO labels (name, color, task_id) VALUES 
('Frontend', '#1E90FF', 6),
('Design', '#FF69B4', 6);

-- Task 7
INSERT INTO labels (name, color, task_id) VALUES 
('Testing', '#32CD32', 7),
('Feedback', '#FFD700', 7);