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
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE projects (
    id             BIGINT AUTO_INCREMENT PRIMARY KEY,
    name           VARCHAR(255) NOT NULL,
    description    TEXT DEFAULT NULL,
    owner_id       BIGINT NOT NULL,  -- The user who created the project
    status         ENUM('not_started', 'in_progress', 'completed', 'on_hold', 'cancelled') NOT NULL DEFAULT 'not_started',
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
    role         ENUM('project_manager', 'team_member', 'spectator') NOT NULL DEFAULT 'team_member',
    status       ENUM('active', 'invited', 'removed', 'left') NOT NULL DEFAULT 'active',
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
    status       ENUM('not_started', 'pending', 'in_progress', 'completed', 'on_hold', 'canceled') NOT NULL DEFAULT 'pending',
    priority     ENUM('low', 'medium', 'high', 'critical') NOT NULL DEFAULT 'medium',
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
    action       ENUM('created', 'updated', 'status_changed', 'commented') NOT NULL,
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
    action        ENUM('login', 'logout', 'user_created', 'user_deleted', 'project_created', 'project_updated', 'project_deleted', 'task_created', 'task_updated', 'task_deleted', 'permission_changed') NOT NULL,
    description   TEXT NOT NULL,  -- Details of the action performed
    created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);


-- Password admin123
INSERT INTO users (first_name, last_name, email, password_hash, profile_picture, dob, gender, role)
VALUES 
('admin', 'admin', 'admin@worksphere.com', '$2a$10$gRPwOXWy.5vZRNTFt.46ceu3i7JKW6fnE5QA3Js2.8090TTblew1y', NULL, '2000-03-23', 'FEMALE', 'ADMIN');
select * from users;
select * from projects;