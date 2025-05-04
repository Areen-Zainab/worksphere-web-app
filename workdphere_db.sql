DROP DATABASE IF EXISTS worksphere_db;
CREATE DATABASE worksphere_db; 
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
    bio             VARCHAR(512) DEFAULT NULL,
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
    id               BIGINT AUTO_INCREMENT PRIMARY KEY,
    project_id       BIGINT NOT NULL,
    assigned_to      BIGINT NULL,  -- Can be unassigned initially
    title            VARCHAR(255) NOT NULL,
    description      TEXT NULL,
    status           ENUM('NOT_STARTED', 'PENDING', 'IN_PROGRESS', 'COMPLETED', 'ON_HOLD', 'CANCELED') NOT NULL DEFAULT 'PENDING',
    priority         ENUM('LOW', 'MEDIUM', 'HIGH', 'CRITICAL') NOT NULL DEFAULT 'MEDIUM',
    deadline         DATE DEFAULT NULL,
    created_by       BIGINT NOT NULL,
    last_updated_by  BIGINT DEFAULT NULL,  -- Added field to track who last updated the task
    created_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    FOREIGN KEY (assigned_to) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (last_updated_by) REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX idx_task_title ON tasks(title);
CREATE INDEX idx_task_priority ON tasks(priority);
CREATE INDEX idx_task_status ON tasks(status);
CREATE INDEX idx_task_assigned_to ON tasks(assigned_to);
CREATE INDEX idx_task_created_by ON tasks(created_by);

-- Enhanced task_activity_log to include user_name directly
CREATE TABLE task_activity_log (
    id           BIGINT AUTO_INCREMENT PRIMARY KEY,
    task_id      BIGINT NOT NULL,
    user_id      BIGINT NOT NULL,
    user_name    VARCHAR(101) NOT NULL, -- Stores the full name of the user directly
    action       ENUM('CREATED', 'UPDATED', 'DELETED', 'STATUS_CHANGED', 'ASSIGNED', 'UNASSIGNED', 'PRIORITY_CHANGED', 'DEADLINE_CHANGED', 'COMMENTED', 'LABEL_ADDED', 'LABEL_REMOVED', 'ATTACHMENT_ADDED', 'ATTACHMENT_REMOVED') NOT NULL,
    changed_data TEXT,
    created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

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

CREATE TABLE notifications (
    id           BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id      BIGINT NOT NULL,
    message      TEXT NOT NULL,
    is_read      BOOLEAN DEFAULT FALSE,
    invite_id	 BIGINT DEFAULT NULL,
    project_id 	 BIGINT NOT NULL,
    created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY(invite_id) REFERENCES project_members(id) ON DELETE CASCADE,
    FOREIGN KEY(project_id) REFERENCES projects(id) ON DELETE CASCADE
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
    position     INT NOT NULL,
    created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (board_id) REFERENCES kanban_boards(id) ON DELETE CASCADE
);

CREATE TABLE kanban_tasks (
    id           BIGINT AUTO_INCREMENT PRIMARY KEY,
    column_id    BIGINT NOT NULL,
    task_id      BIGINT NOT NULL,
    position     INT NOT NULL,
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

-- Create a view for easier querying of task activity logs with user details
CREATE OR REPLACE VIEW task_activity_view AS
SELECT 
    tal.id,
    tal.task_id,
    t.title AS task_title,
    tal.user_id,
    tal.user_name,
    tal.action,
    tal.changed_data,
    tal.created_at
FROM 
    task_activity_log tal
JOIN 
    tasks t ON tal.task_id = t.id
ORDER BY 
    tal.created_at DESC;

-- Triggers for automatic task activity logging
DELIMITER //

-- Procedure to add project owner as member
CREATE PROCEDURE add_project_owner_as_member()
BEGIN
    -- This procedure will be triggered after a new project is inserted
    -- It will automatically add the project owner as a PROJECT_MANAGER in the project_members table
    
    DECLARE done INT DEFAULT FALSE;
    DECLARE project_id_var BIGINT;
    DECLARE owner_id_var BIGINT;
    
    -- Cursor to get newly created projects where the owner isn't already a member
    DECLARE project_cursor CURSOR FOR
        SELECT p.id, p.owner_id
        FROM projects p
        LEFT JOIN project_members pm ON p.id = pm.project_id AND p.owner_id = pm.user_id
        WHERE pm.id IS NULL;
    
    -- Continue handler for when no more rows exist
    DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = TRUE;
    OPEN project_cursor;
    
    read_loop: LOOP
        -- Get next project
        FETCH project_cursor INTO project_id_var, owner_id_var;
        
        -- Exit loop if no more projects
        IF done THEN
            LEAVE read_loop;
        END IF;
        
        -- Insert the owner as a project manager
        INSERT INTO project_members (project_id, user_id, role, status)
        VALUES (project_id_var, owner_id_var, 'ADMIN', 'ACTIVE');
    END LOOP;
    
    -- Close the cursor
    CLOSE project_cursor;
END//

-- TRIGGER FOR TASK CREATION
CREATE TRIGGER after_task_insert
AFTER INSERT ON tasks
FOR EACH ROW
BEGIN
    DECLARE user_fullname VARCHAR(101);
    DECLARE assigned_user_name VARCHAR(101);
    
    -- Get the full name of the user who created the task
    SELECT CONCAT(first_name, ' ', last_name) INTO user_fullname
    FROM users WHERE id = NEW.created_by;
    
    -- Log task creation with user name
    INSERT INTO task_activity_log (task_id, user_id, user_name, action, changed_data)
    VALUES (NEW.id, NEW.created_by, user_fullname, 'CREATED', 
        JSON_OBJECT(
            'title', NEW.title,
            'description', NEW.description,
            'status', NEW.status,
            'priority', NEW.priority,
            'deadline', NEW.deadline,
            'assigned_to', NEW.assigned_to
        )
    );
    
    -- Log assignment if task was assigned during creation
    IF NEW.assigned_to IS NOT NULL THEN
        -- Get the full name of the assigned user
        SELECT CONCAT(first_name, ' ', last_name) INTO assigned_user_name
        FROM users WHERE id = NEW.assigned_to;
        
        INSERT INTO task_activity_log (task_id, user_id, user_name, action, changed_data)
        VALUES (NEW.id, NEW.created_by, user_fullname, 'ASSIGNED', 
            JSON_OBJECT(
                'assigned_to', NEW.assigned_to,
                'assigned_to_name', assigned_user_name
            )
        );
    END IF;
END//

-- TRIGGER FOR TASK UPDATES
CREATE TRIGGER after_task_update
AFTER UPDATE ON tasks
FOR EACH ROW
BEGIN
    DECLARE changes JSON DEFAULT JSON_OBJECT();
    DECLARE logging_user_id BIGINT;
    DECLARE user_fullname VARCHAR(101);
    DECLARE old_assignee_name VARCHAR(101) DEFAULT NULL;
    DECLARE new_assignee_name VARCHAR(101) DEFAULT NULL;
    
    -- Use last_updated_by if available, otherwise fall back to created_by
    SET logging_user_id = COALESCE(NEW.last_updated_by, NEW.created_by);
    
    -- Get the full name of the user who updated the task
    SELECT CONCAT(first_name, ' ', last_name) INTO user_fullname
    FROM users WHERE id = logging_user_id;
    
    -- Check and log status change
    IF NEW.status != OLD.status THEN
        INSERT INTO task_activity_log (task_id, user_id, user_name, action, changed_data)
        VALUES (NEW.id, logging_user_id, user_fullname, 'STATUS_CHANGED', 
            JSON_OBJECT(
                'old_status', OLD.status,
                'new_status', NEW.status
            )
        );
    END IF;
    
    -- Check and log assignment change
    IF COALESCE(NEW.assigned_to, 0) != COALESCE(OLD.assigned_to, 0) THEN
        -- Get old assignee name if exists
        IF OLD.assigned_to IS NOT NULL THEN
            SELECT CONCAT(first_name, ' ', last_name) INTO old_assignee_name
            FROM users WHERE id = OLD.assigned_to;
        END IF;
        
        -- Get new assignee name if exists
        IF NEW.assigned_to IS NOT NULL THEN
            SELECT CONCAT(first_name, ' ', last_name) INTO new_assignee_name
            FROM users WHERE id = NEW.assigned_to;
        END IF;
        
        IF NEW.assigned_to IS NULL THEN
            -- Task was unassigned
            INSERT INTO task_activity_log (task_id, user_id, user_name, action, changed_data)
            VALUES (NEW.id, logging_user_id, user_fullname, 'UNASSIGNED', 
                JSON_OBJECT(
                    'previous_assignee', OLD.assigned_to,
                    'previous_assignee_name', old_assignee_name
                )
            );
        ELSE
            -- Task was assigned or reassigned
            INSERT INTO task_activity_log (task_id, user_id, user_name, action, changed_data)
            VALUES (NEW.id, logging_user_id, user_fullname, 'ASSIGNED', 
                JSON_OBJECT(
                    'previous_assignee', OLD.assigned_to,
                    'previous_assignee_name', old_assignee_name,
                    'new_assignee', NEW.assigned_to,
                    'new_assignee_name', new_assignee_name
                )
            );
        END IF;
    END IF;
    
    -- Check and log priority change
    IF NEW.priority != OLD.priority THEN
        INSERT INTO task_activity_log (task_id, user_id, user_name, action, changed_data)
        VALUES (NEW.id, logging_user_id, user_fullname, 'PRIORITY_CHANGED', 
            JSON_OBJECT(
                'old_priority', OLD.priority,
                'new_priority', NEW.priority
            )
        );
    END IF;
    
    -- Check and log deadline change
    IF COALESCE(NEW.deadline, '1900-01-01') != COALESCE(OLD.deadline, '1900-01-01') THEN
        INSERT INTO task_activity_log (task_id, user_id, user_name, action, changed_data)
        VALUES (NEW.id, logging_user_id, user_fullname, 'DEADLINE_CHANGED', 
            JSON_OBJECT(
                'old_deadline', OLD.deadline,
                'new_deadline', NEW.deadline
            )
        );
    END IF;
    
    -- Check and log title or description change
    IF NEW.title != OLD.title OR COALESCE(NEW.description, '') != COALESCE(OLD.description, '') THEN
        -- Build changes JSON
        IF NEW.title != OLD.title THEN
            SET changes = JSON_SET(changes, '$.title', JSON_OBJECT('old', OLD.title, 'new', NEW.title));
        END IF;
        
        IF COALESCE(NEW.description, '') != COALESCE(OLD.description, '') THEN
            SET changes = JSON_SET(changes, '$.description', JSON_OBJECT('old', OLD.description, 'new', NEW.description));
        END IF;
        
        INSERT INTO task_activity_log (task_id, user_id, user_name, action, changed_data)
        VALUES (NEW.id, logging_user_id, user_fullname, 'UPDATED', changes);
    END IF;
END//

-- TRIGGER FOR TASK DELETION
CREATE TRIGGER before_task_delete
BEFORE DELETE ON tasks
FOR EACH ROW
BEGIN
    DECLARE delete_user_id BIGINT;
    DECLARE user_fullname VARCHAR(101);
    
    -- Try to get the value from a user-defined variable (needs to be set before deletion)
    SET delete_user_id = @current_user_id;
    
    -- If not set, default to the last updater or creator of the task
    IF delete_user_id IS NULL THEN
        SET delete_user_id = COALESCE(OLD.last_updated_by, OLD.created_by);
    END IF;
    
    -- Default to a system user if we still don't have a user ID
    IF delete_user_id IS NULL THEN
        SET delete_user_id = 1; -- Assuming user ID 1 is a system user
        SET user_fullname = 'System User';
    ELSE
        -- Get the full name of the user who is deleting the task
        SELECT CONCAT(first_name, ' ', last_name) INTO user_fullname
        FROM users WHERE id = delete_user_id;
    END IF;
    
    -- Log task deletion with user name
    INSERT INTO task_activity_log (task_id, user_id, user_name, action, changed_data)
    VALUES (OLD.id, delete_user_id, user_fullname, 'DELETED', 
        JSON_OBJECT(
            'title', OLD.title,
            'description', OLD.description,
            'status', OLD.status,
            'priority', OLD.priority,
            'deadline', OLD.deadline,
            'assigned_to', OLD.assigned_to
        )
    );
END//

-- TRIGGER FOR COMMENT CREATION
CREATE TRIGGER after_comment_insert
AFTER INSERT ON task_comments
FOR EACH ROW
BEGIN
    DECLARE user_fullname VARCHAR(101);
    
    -- Get the full name of the user who commented
    SELECT CONCAT(first_name, ' ', last_name) INTO user_fullname
    FROM users WHERE id = NEW.user_id;
    
    -- Log comment activity with user name
    INSERT INTO task_activity_log (task_id, user_id, user_name, action, changed_data)
    VALUES (NEW.task_id, NEW.user_id, user_fullname, 'COMMENTED', 
        JSON_OBJECT(
            'comment_id', NEW.id,
            'comment_text', LEFT(NEW.comment, 50) -- Include first 50 chars of comment
        )
    );
END//

-- Adding triggers for Labels
CREATE TRIGGER after_label_insert
AFTER INSERT ON labels
FOR EACH ROW
BEGIN
    DECLARE task_creator_id BIGINT;
    DECLARE user_fullname VARCHAR(101);
    
    -- Since we don't have created_by in labels, use the task's created_by
    SELECT created_by INTO task_creator_id
    FROM tasks
    WHERE id = NEW.task_id;
    
    -- Get the user's name
    SELECT CONCAT(first_name, ' ', last_name) INTO user_fullname
    FROM users
    WHERE id = task_creator_id;
    
    -- Log label addition with user name
    INSERT INTO task_activity_log (task_id, user_id, user_name, action, changed_data)
    VALUES (NEW.task_id, task_creator_id, user_fullname, 'LABEL_ADDED', 
        JSON_OBJECT(
            'label_id', NEW.id,
            'label_name', NEW.name,
            'label_color', NEW.color
        )
    );
END//

-- TRIGGER FOR LABEL DELETION
CREATE TRIGGER before_label_delete
BEFORE DELETE ON labels
FOR EACH ROW
BEGIN
    DECLARE delete_user_id BIGINT;
    DECLARE user_fullname VARCHAR(101);
    
    -- Try to get the value from a user-defined variable (should be set before deletion)
    SET delete_user_id = @current_user_id;
    
    -- If not set, use the task's last_updated_by or created_by
    IF delete_user_id IS NULL THEN
        SELECT COALESCE(last_updated_by, created_by) INTO delete_user_id
        FROM tasks
        WHERE id = OLD.task_id;
    END IF;
    
    -- Default to a system user if we still don't have a user ID
    IF delete_user_id IS NULL THEN
        SET delete_user_id = 1; -- Assuming user ID 1 is a system user
        SET user_fullname = 'System User';
    ELSE
        -- Get the full name of the user who is deleting the label
        SELECT CONCAT(first_name, ' ', last_name) INTO user_fullname
        FROM users WHERE id = delete_user_id;
    END IF;
    
    -- Log label removal with user name
    INSERT INTO task_activity_log (task_id, user_id, user_name, action, changed_data)
    VALUES (OLD.task_id, delete_user_id, user_fullname, 'LABEL_REMOVED', 
        JSON_OBJECT(
            'label_id', OLD.id,
            'label_name', OLD.name,
            'label_color', OLD.color
        )
    );
END//

-- TRIGGER FOR ATTACHMENT CREATION
CREATE TRIGGER after_attachment_insert
AFTER INSERT ON task_attachments
FOR EACH ROW
BEGIN
    DECLARE user_fullname VARCHAR(101);
    
    -- Get the full name of the user who added the attachment
    SELECT CONCAT(first_name, ' ', last_name) INTO user_fullname
    FROM users WHERE id = NEW.uploaded_by;
    
    -- Log attachment addition with user name
    INSERT INTO task_activity_log (task_id, user_id, user_name, action, changed_data)
    VALUES (NEW.task_id, NEW.uploaded_by, user_fullname, 'ATTACHMENT_ADDED', 
        JSON_OBJECT(
            'attachment_id', NEW.id,
            'file_name', NEW.file_name
        )
    );
END//

-- TRIGGER FOR ATTACHMENT DELETION
CREATE TRIGGER before_attachment_delete
BEFORE DELETE ON task_attachments
FOR EACH ROW
BEGIN
    DECLARE delete_user_id BIGINT;
    DECLARE user_fullname VARCHAR(101);
    
    -- Try to get the value from a user-defined variable (needs to be set before deletion)
    SET delete_user_id = @current_user_id;
    
    -- If not set, default to the uploader of the attachment
    IF delete_user_id IS NULL THEN
        SET delete_user_id = OLD.uploaded_by;
    END IF;
    
    -- Default to a system user if we still don't have a user ID
    IF delete_user_id IS NULL THEN
        SET delete_user_id = 1; -- Assuming user ID 1 is a system user
        SET user_fullname = 'System User';
    ELSE
        -- Get the full name of the user who is deleting the attachment
        SELECT CONCAT(first_name, ' ', last_name) INTO user_fullname
        FROM users WHERE id = delete_user_id;
    END IF;
    
    -- Log attachment removal with user name
    INSERT INTO task_activity_log (task_id, user_id, user_name, action, changed_data)
    VALUES (OLD.task_id, delete_user_id, user_fullname, 'ATTACHMENT_REMOVED', 
        JSON_OBJECT(
            'attachment_id', OLD.id,
            'file_name', OLD.file_name
        )
    );
END//

DELIMITER ;

-- Set the DELIMITER to allow for complex trigger definitions
DELIMITER //

-- Trigger for project invitations
-- This trigger fires when a new user is added to a project with INVITED status
CREATE TRIGGER after_project_member_invitation
AFTER INSERT ON project_members
FOR EACH ROW
BEGIN
    DECLARE project_name VARCHAR(255) DEFAULT 'Unnamed Project';
    DECLARE inviter_name VARCHAR(101) DEFAULT 'a team member';
    DECLARE owner_id BIGINT;
    
    -- Only create notification if the status is INVITED
    IF NEW.status = 'INVITED' THEN
        -- Get project name and owner_id (handle potential NULL values)
        SELECT name, owner_id INTO project_name, owner_id
        FROM projects
        WHERE id = NEW.project_id;
        
        -- Set default project name if NULL
        IF project_name IS NULL THEN
            SET project_name = 'Unnamed Project';
        END IF;
        
        -- Get inviter name (using project owner if we don't have specific inviter info)
        IF owner_id IS NOT NULL THEN
            SELECT CONCAT(COALESCE(first_name, 'Unknown'), ' ', COALESCE(last_name, 'User')) INTO inviter_name
            FROM users
            WHERE id = owner_id;
        END IF;
        
        -- Create notification for the invited user with safe values
        INSERT INTO notifications (user_id, message, is_read, created_at, invite_id, project_id)
        VALUES (
            NEW.user_id, 
            CONCAT('You have been invited to join the project "', project_name, '" by ', inviter_name, '.'),
            FALSE,
            CURRENT_TIMESTAMP,
            NEW.id,
            NEW.project_id
        );
    END IF;
END//

-- Trigger for task assignments
-- This trigger fires when a task is created with an assigned user
CREATE TRIGGER after_task_assignment_insert
AFTER INSERT ON tasks
FOR EACH ROW
BEGIN
    DECLARE project_name VARCHAR(255) DEFAULT 'Unnamed Project';
    DECLARE assigner_name VARCHAR(101) DEFAULT 'Unknown User';
    
    -- Only create notification if the task is assigned to someone
    IF NEW.assigned_to IS NOT NULL THEN
        -- Get project name with NULL handling
        SELECT COALESCE(name, 'Unnamed Project') INTO project_name
        FROM projects
        WHERE id = NEW.project_id;
        
        -- Get assigner name with NULL handling
        SELECT CONCAT(COALESCE(first_name, 'Unknown'), ' ', COALESCE(last_name, 'User')) INTO assigner_name
        FROM users
        WHERE id = NEW.created_by;
        
        -- Create notification for the assigned user
        INSERT INTO notifications (user_id, message, is_read, created_at, project_id)
        VALUES (
            NEW.assigned_to, 
            CONCAT('You have been assigned a new task "', COALESCE(NEW.title, 'Untitled Task'), '" in project "', project_name, '" by ', assigner_name, '.'),
            FALSE,
            CURRENT_TIMESTAMP,
            NEW.project_id
        );
    END IF;
END//

-- Trigger for task reassignments
-- This trigger fires when a task is updated and the assigned user changes
CREATE TRIGGER after_task_assignment_update
AFTER UPDATE ON tasks
FOR EACH ROW
BEGIN
    DECLARE project_name VARCHAR(255) DEFAULT 'Unnamed Project';
    DECLARE assigner_name VARCHAR(101) DEFAULT 'Unknown User';
    DECLARE assigner_id BIGINT;
    
    -- Only create notification if the assigned user has changed and the new assigned user is not NULL
    IF COALESCE(NEW.assigned_to, 0) != COALESCE(OLD.assigned_to, 0) AND NEW.assigned_to IS NOT NULL THEN
        -- Get project name with NULL handling
        SELECT COALESCE(name, 'Unnamed Project') INTO project_name
        FROM projects
        WHERE id = NEW.project_id;
        
        -- Determine who made the assignment change
        SET assigner_id = COALESCE(NEW.last_updated_by, NEW.created_by);
        
        -- Get assigner name with NULL handling
        IF assigner_id IS NOT NULL THEN
            SELECT CONCAT(COALESCE(first_name, 'Unknown'), ' ', COALESCE(last_name, 'User')) INTO assigner_name
            FROM users
            WHERE id = assigner_id;
        END IF;
        
        -- Create notification for the newly assigned user
        INSERT INTO notifications (user_id, message, is_read, created_at, project_id)
        VALUES (
            NEW.assigned_to, 
            CONCAT('You have been assigned task "', COALESCE(NEW.title, 'Untitled Task'), '" in project "', project_name, '" by ', assigner_name, '.'),
            FALSE,
            CURRENT_TIMESTAMP,
            NEW.project_id
        );
    END IF;
END//

-- When a project member status is changed from INVITED to ACTIVE
CREATE TRIGGER after_project_member_status_update
AFTER UPDATE ON project_members
FOR EACH ROW
BEGIN
    DECLARE member_name VARCHAR(101) DEFAULT 'A team member';
    DECLARE project_name VARCHAR(255) DEFAULT 'Unnamed Project';
    DECLARE owner_id BIGINT;
    
    -- If status changed from INVITED to ACTIVE, notify project owner
    IF OLD.status = 'INVITED' AND NEW.status = 'ACTIVE' THEN
        -- Get project name and owner ID with NULL handling
        SELECT COALESCE(name, 'Unnamed Project'), owner_id INTO project_name, owner_id
        FROM projects
        WHERE id = NEW.project_id;
        
        -- Only proceed if we have an owner to notify
        IF owner_id IS NOT NULL THEN
            -- Get member name with NULL handling
            SELECT CONCAT(COALESCE(first_name, 'Unknown'), ' ', COALESCE(last_name, 'User')) INTO member_name
            FROM users
            WHERE id = NEW.user_id;
            
            -- Create notification for the project owner
            INSERT INTO notifications (user_id, message, is_read, created_at, invite_id, project_id)
            VALUES (
                owner_id, 
                CONCAT(member_name, ' has accepted your invitation to join the project "', project_name, '".'),
                FALSE,
                CURRENT_TIMESTAMP,
                NEW.id,
                NEW.project_id
            );
        END IF;
    END IF;
END//

-- Reset DELIMITER
DELIMITER ;

-- USERS
INSERT INTO users (first_name, last_name, email, password_hash, profile_picture, dob, gender, role)
VALUES 
('admin', 'admin', 'admin@worksphere.com', '$2a$10$gRPwOXWy.5vZRNTFt.46ceu3i7JKW6fnE5QA3Js2.8090TTblew1y', NULL, '2000-03-23', 'FEMALE', 'ADMIN'),
('Hafsa', 'Imtiaz', 'hafsa@ws.com', '$2a$10$gRPwOXWy.5vZRNTFt.46ceu3i7JKW6fnE5QA3Js2.8090TTblew1y', NULL, '2000-07-06', 'FEMALE', 'USER'),
('Areen', 'Zainab', 'areen@ws.com', '$2a$10$gRPwOXWy.5vZRNTFt.46ceu3i7JKW6fnE5QA3Js2.8090TTblew1y', NULL, '2000-03-25', 'FEMALE', 'USER'),
('Mahum', 'Hamid', 'mahum@ws.com', '$2a$10$gRPwOXWy.5vZRNTFt.46ceu3i7JKW6fnE5QA3Js2.8090TTblew1y', NULL, '2000-07-01', 'FEMALE', 'USER');

-- PROJECTS
INSERT INTO projects (name, description, owner_id, status, visibility, progress, start_date, end_date)
VALUES 
('Marketing Campaign', 'Launch new social media campaign for summer.', 2, 'in_progress', 'PUBLIC', 45, '2025-04-01', '2025-06-30'),
('Website Revamp', 'Redesign and deploy the new corporate website.', 3, 'not_started', 'PRIVATE', 0, '2025-05-10', '2025-08-10'),
('Mobile App Launch', 'Build and launch the beta version of the app.', 4, 'in_progress', 'PUBLIC', 30, '2025-04-15', '2025-07-15');

-- PROJECT MEMBERS
INSERT INTO project_members (project_id, user_id, role)
VALUES 
(1, 2, 'PROJECT_MANAGER'),
(1, 3, 'TEAM_MEMBER'),
(1, 4, 'TEAM_MEMBER'),
(2, 3, 'PROJECT_MANAGER'),
(3, 4, 'PROJECT_MANAGER'),
(3, 2, 'TEAM_MEMBER'),
(3, 3, 'TEAM_MEMBER');

INSERT INTO project_members (project_id, user_id, role, status)
VALUES 
(2, 2, 'PROJECT_MANAGER', 'INVITED');

-- TASKS (10 total)
INSERT INTO tasks (project_id, assigned_to, title, description, status, priority, deadline, created_by)
VALUES 
-- Project 1
(1, 2, 'Design Social Media Ads', 'Create banner and carousel images for campaign.', 'IN_PROGRESS', 'HIGH', '2025-05-15', 2),
(1, 2, 'Draft Campaign Copy', 'Write captions and ad copy for each post.', 'PENDING', 'MEDIUM', '2025-05-10', 2),
(1, 3, 'Schedule Post Calendar', 'Plan weekly post schedule and timings.', 'PENDING', 'MEDIUM', '2025-05-12', 2),

-- Project 2
(2, 2, 'Review Wireframes', 'Review website wireframes shared by UX team.', 'NOT_STARTED', 'MEDIUM', '2025-05-20', 3),
(2, 2, 'Migrate Content', 'Move content from old site to new CMS.', 'PENDING', 'HIGH', '2025-06-01', 3),
(2, 3, 'SEO Optimization', 'Optimize metadata and structure for SEO.', 'NOT_STARTED', 'HIGH', '2025-06-10', 3),

-- Project 3
(3, 4, 'Setup CI/CD Pipeline', 'Configure GitHub Actions for build & deploy.', 'IN_PROGRESS', 'HIGH', '2025-05-20', 4),
(3, 3, 'Create Landing Page', 'Design and code the marketing landing page.', 'PENDING', 'MEDIUM', '2025-05-25', 4),
(3, 2, 'User Testing', 'Coordinate beta testing with selected users.', 'NOT_STARTED', 'LOW', '2025-06-05', 4),
(3, 4, 'Fix Login Bugs', 'Resolve login issues on Android.', 'IN_PROGRESS', 'HIGH', '2025-05-30', 4);

-- LABELS
INSERT INTO labels (name, color, task_id) VALUES 
('Urgent', '#ff4d4d', 1),
('UI/UX', '#0099ff', 1),
('Copywriting', '#ffcc00', 2),
('QA', '#33cc33', 4),
('DevOps', '#800080', 7),
('Backend', '#8B0000', 7),
('Frontend', '#1E90FF', 8),
('Design', '#FF69B4', 8),
('Testing', '#32CD32', 9),
('Feedback', '#FFD700', 9);

-- KANBAN BOARDS
INSERT INTO kanban_boards (project_id) VALUES
(1), (2), (3);

-- KANBAN COLUMNS
-- Project 1
INSERT INTO kanban_columns (board_id, title, position) VALUES
(1, 'To Do', 1),
(1, 'In Progress', 2),
(1, 'Done', 3);
-- Project 2
INSERT INTO kanban_columns (board_id, title, position) VALUES
(2, 'To Do', 2),
(2, 'In Progress', 1),
(2, 'Done', 3);
-- Project 3
INSERT INTO kanban_columns (board_id, title, position) VALUES
(3, 'To Do', 3),
(3, 'In Progress', 2),
(3, 'Done', 1);

-- KANBAN TASKS
-- Project 1: Columns 1–3
INSERT INTO kanban_tasks (column_id, task_id, position) VALUES
(2, 1, 2), -- 'Design Social Media Ads'
(1, 2, 1), -- 'Draft Campaign Copy'
(1, 3, 3); -- 'Schedule Post Calendar'

-- Project 2: Columns 4–6
INSERT INTO kanban_tasks (column_id, task_id, position) VALUES
(4, 4, 1), -- 'Review Wireframes'
(4, 5, 2), -- 'Migrate Content'
(4, 6, 3); -- 'SEO Optimization'

-- Project 3: Columns 7–9
INSERT INTO kanban_tasks (column_id, task_id, position) VALUES
(8, 7, 1), -- 'Setup CI/CD Pipeline'
(7, 8, 2), -- 'Create Landing Page'
(7, 9, 3), -- 'User Testing'
(8, 10, 4); -- 'Fix Login Bugs'