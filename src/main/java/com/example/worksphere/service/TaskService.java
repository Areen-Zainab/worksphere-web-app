package com.example.worksphere.service;

import com.example.worksphere.entity.Task;
import com.example.worksphere.entity.Task.Status;
import com.example.worksphere.entity.Task.Priority;
import com.example.worksphere.entity.User;
import com.example.worksphere.entity.Project;
import com.example.worksphere.entity.Label;
import com.example.worksphere.repository.TaskRepository;
import com.example.worksphere.repository.UserRepository;
import com.example.worksphere.repository.ProjectRepository;
import com.example.worksphere.repository.ProjectMemberRepository;
import com.example.worksphere.repository.LabelRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class TaskService {

    @Autowired
    private TaskRepository taskRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ProjectRepository projectRepository;
    
    @Autowired
    private ProjectMemberRepository projectMemberRepository;
    
    @Autowired
    private LabelRepository labelRepository;

    /**
     * Create a new task
     */
    @Transactional
    public Task createTask(Task task, Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        Project project = projectRepository.findById(task.getProject().getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Project not found"));

        // Check if user has access to this project
        if (!isUserMemberOfProject(user.getId(), project.getId()) && 
            !project.getOwner().getId().equals(user.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, 
                "You don't have permission to create tasks in this project");
        }
        // Set the created_by field
        task.setCreatedBy(user);
        
        if (task.getAssignedTo() != null && task.getAssignedTo().getId() != null) {
            User assignedUser = userRepository.findById(task.getAssignedTo().getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Assigned user not found"));
        
            if (!isUserMemberOfProject(assignedUser.getId(), project.getId()) &&
                !project.getOwner().getId().equals(assignedUser.getId())) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, 
                    "Assigned user is not a member of this project");
            }
        } else if (task.getAssignedTo() != null) {
            //throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Assigned user ID must not be null");
        }
        

        // Set default values if not provided
        if (task.getStatus() == null) {
            task.setStatus(Status.PENDING);
        }
        
        if (task.getPriority() == null) {
            task.setPriority(Priority.MEDIUM);
        }
        
        // Initialize labels if needed
        if (task.getLabels() == null) {
            task.setLabels(new HashSet<>());
        }
        
        // Set timestamps
        LocalDateTime now = LocalDateTime.now();
        task.setCreatedAt(now);
        task.setUpdatedAt(now);

        return taskRepository.save(task);
    }

    /**
     * Get all tasks with filtering options
     */
    public List<Task> getAllTasks(
            Long projectId, 
            Status status,
            Priority priority,
            Long assignedToId,
            int page, 
            int size, 
            String sortBy, 
            String sortDir,
            Long userId) {
        
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
        
        // Create pageable object
        Sort sort = sortDir.equalsIgnoreCase("desc") ? 
                Sort.by(sortBy).descending() : Sort.by(sortBy).ascending();
        Pageable pageable = PageRequest.of(page, size, sort);
        
        // Apply filters
        if (projectId != null) {
            // Check if user has access to the project
            Project project = projectRepository.findById(projectId)
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Project not found"));
            
            if (!isUserMemberOfProject(user.getId(), project.getId()) && 
                !project.getOwner().getId().equals(user.getId())) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, 
                    "You don't have permission to view tasks in this project");
            }
            
            // Apply all filters
            if (status != null && priority != null && assignedToId != null) {
                return taskRepository.findByProjectIdAndStatusAndPriorityAndAssignedToId(
                    projectId, status, priority, assignedToId, pageable).getContent();
            } else if (status != null && priority != null) {
                return taskRepository.findByProjectIdAndStatusAndPriority(
                    projectId, status, priority, pageable).getContent();
            } else if (status != null && assignedToId != null) {
                return taskRepository.findByProjectIdAndStatusAndAssignedToId(
                    projectId, status, assignedToId, pageable).getContent();
            } else if (priority != null && assignedToId != null) {
                return taskRepository.findByProjectIdAndPriorityAndAssignedToId(
                    projectId, priority, assignedToId, pageable).getContent();
            } else if (status != null) {
                return taskRepository.findByProjectIdAndStatus(projectId, status, pageable).getContent();
            } else if (priority != null) {
                return taskRepository.findByProjectIdAndPriority(projectId, priority, pageable).getContent();
            } else if (assignedToId != null) {
                return taskRepository.findByProjectIdAndAssignedToId(projectId, assignedToId, pageable).getContent();
            } else {
                return taskRepository.findByProjectId(projectId, pageable).getContent();
            }
        }
        
        // If no project filter, return only tasks from projects the user is a member of
        List<Long> accessibleProjectIds = getAccessibleProjectIds(user.getId());
        
        // Apply remaining filters to accessible projects
        if (status != null && priority != null && assignedToId != null) {
            return taskRepository.findByProjectIdInAndStatusAndPriorityAndAssignedToId(
                accessibleProjectIds, status, priority, assignedToId, pageable).getContent();
        } else if (status != null && priority != null) {
            return taskRepository.findByProjectIdInAndStatusAndPriority(
                accessibleProjectIds, status, priority, pageable).getContent();
        } else if (status != null && assignedToId != null) {
            return taskRepository.findByProjectIdInAndStatusAndAssignedToId(
                accessibleProjectIds, status, assignedToId, pageable).getContent();
        } else if (priority != null && assignedToId != null) {
            return taskRepository.findByProjectIdInAndPriorityAndAssignedToId(
                accessibleProjectIds, priority, assignedToId, pageable).getContent();
        } else if (status != null) {
            return taskRepository.findByProjectIdInAndStatus(accessibleProjectIds, status, pageable).getContent();
        } else if (priority != null) {
            return taskRepository.findByProjectIdInAndPriority(accessibleProjectIds, priority, pageable).getContent();
        } else if (assignedToId != null) {
            return taskRepository.findByProjectIdInAndAssignedToId(accessibleProjectIds, assignedToId, pageable).getContent();
        } else {
            return taskRepository.findByProjectIdIn(accessibleProjectIds, pageable).getContent();
        }
    }

    /**
     * Get task by ID if user has access
     */
    public Optional<Task> getTaskById(Long id, Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
        
        Optional<Task> taskOpt = taskRepository.findById(id);
        
        if (taskOpt.isPresent()) {
            Task task = taskOpt.get();
            Project project = task.getProject();
            
            // Check if user has access to this project
            if (!isUserMemberOfProject(user.getId(), project.getId()) && 
                !project.getOwner().getId().equals(user.getId())) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, 
                    "You don't have permission to view this task");
            }
            
            return taskOpt;
        }
        
        return Optional.empty();
    }

    /**
     * Update task if user has access
     */
    @Transactional
    public Task updateTask(Long id, Task taskDetails, Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
        
        Task task = taskRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Task not found"));
        
        Project project = task.getProject();
        
        // Check if user has permission to update the task
        if (!task.getCreatedBy().getId().equals(user.getId()) && 
            (task.getAssignedTo() == null || task.getAssignedTo().getId() == null || !task.getAssignedTo().getId().equals(user.getId())) &&
            !project.getOwner().getId().equals(user.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, 
                "You don't have permission to update this task");
        }
        
        // If assigned_to is provided, verify the user exists and is a project member
        if (taskDetails.getAssignedTo() != null && taskDetails.getAssignedTo().getId() != null) {
            User assignedUser = userRepository.findById(taskDetails.getAssignedTo().getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Assigned user not found"));
            
            // Check if assignee is a member of project
            if (!isUserMemberOfProject(assignedUser.getId(), project.getId()) && 
                !project.getOwner().getId().equals(assignedUser.getId())) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, 
                    "Assigned user is not a member of this project");
            }
        }
        
        // Update task fields
        task.setTitle(taskDetails.getTitle());
        task.setDescription(taskDetails.getDescription());
        if (taskDetails.getStatus() != null) {
            task.setStatus(taskDetails.getStatus());
        }
        if (taskDetails.getPriority() != null) {
            task.setPriority(taskDetails.getPriority());
        }
        task.setAssignedTo(taskDetails.getAssignedTo());
        task.setDeadline(taskDetails.getDeadline());
        task.setUpdatedAt(LocalDateTime.now());
        
        // Handle labels if provided
        if (taskDetails.getLabels() != null && !taskDetails.getLabels().isEmpty()) {
            task.setLabels(taskDetails.getLabels());
        }
        
        return taskRepository.save(task);
    }

    /**
     * Delete task if user has access
     */
    @Transactional
    public boolean deleteTask(Long id, Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
        
        Task task = taskRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Task not found"));
        
        Project project = task.getProject();
        
        // Check if user has permission to delete the task
        if (!task.getCreatedBy().getId().equals(user.getId()) && 
            !project.getOwner().getId().equals(user.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, 
                "You don't have permission to delete this task");
        }
        
        taskRepository.delete(task);
        return true;
    }

    /**
     * Get tasks by project ID
     */
    public List<Task> getTasksByProject(Long projectId, Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
        
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Project not found"));
        
        // Check if user has access to this project
        if (!isUserMemberOfProject(user.getId(), project.getId()) && 
            !project.getOwner().getId().equals(user.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, 
                "You don't have permission to view tasks in this project");
        }
        
        return taskRepository.findByProjectId(projectId);
    }

    /**
     * Get tasks assigned to a user
     */
    public List<Task> getTasksAssignedToUser(Long userId, 
                                          Status status,
                                          Priority priority,
                                          int page, 
                                          int size, 
                                          String sortBy, 
                                          String sortDir) {
        // Fetch the user by userId
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
        
        // Create pageable object with sorting direction
        Sort sort = sortDir.equalsIgnoreCase("desc") ? 
                    Sort.by(sortBy).descending() : Sort.by(sortBy).ascending();
        Pageable pageable = PageRequest.of(page, size, sort);
        
        // Apply filters based on status and priority
        if (status != null && priority != null) {
            // Both status and priority filters
            return taskRepository.findByAssignedToIdAndStatusAndPriority(user.getId(), status, priority, pageable).getContent();
        } else if (status != null) {
            // Only status filter
            return taskRepository.findByAssignedToIdAndStatus(user.getId(), status, pageable).getContent();
        } else if (priority != null) {
            // Only priority filter
            return taskRepository.findByAssignedToIdAndPriority(user.getId(), priority, pageable).getContent();
        } else {
            // No filters, just userId-based query
            return taskRepository.findByAssignedToId(user.getId(), pageable).getContent();
        }
    }


    /**
     * Get tasks created by a user
     */
    public List<Task> getTasksCreatedByUser(Long userId, 
                                         Status status,
                                         Priority priority,
                                         int page, 
                                         int size, 
                                         String sortBy, 
                                         String sortDir) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
        
        // Create pageable object
        Sort sort = sortDir.equalsIgnoreCase("desc") ? 
                Sort.by(sortBy).descending() : Sort.by(sortBy).ascending();
        Pageable pageable = PageRequest.of(page, size, sort);
        
        // Apply filters
        if (status != null && priority != null) {
            return taskRepository.findByCreatedByIdAndStatusAndPriority(
                user.getId(), status, priority, pageable).getContent();
        } else if (status != null) {
            return taskRepository.findByCreatedByIdAndStatus(user.getId(), status, pageable).getContent();
        } else if (priority != null) {
            return taskRepository.findByCreatedByIdAndPriority(user.getId(), priority, pageable).getContent();
        } else {
            return taskRepository.findByCreatedById(user.getId(), pageable).getContent();
        }
    }

    /**
     * Update task status
     */
    @Transactional
    public Task updateTaskStatus(Long taskId, Status status, Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Task not found"));

        Project project = task.getProject();

        // Only the project owner or the user assigned to the task can update its status
        boolean isProjectOwner = project.getOwner().getId().equals(user.getId());
        boolean isAssignedUser = task.getAssignedTo() != null && task.getAssignedTo().getId().equals(user.getId());

        if (!isProjectOwner && !isAssignedUser) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN,
                    "Only the project owner or the assigned user can update this task");
        }

        task.setStatus(status);
        task.setUpdatedAt(LocalDateTime.now());

        return taskRepository.save(task);
    }


    /**
     * Assign task to a user
     */
    @Transactional
    public Task assignTask(Long id, Long assigneeId, Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
        
        Task task = taskRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Task not found"));
        
        Project project = task.getProject();
        
        // Check if user has permission to assign the task
        if (!task.getCreatedBy().getId().equals(user.getId()) && 
            !project.getOwner().getId().equals(user.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, 
                "You don't have permission to assign this task");
        }
        
        // Verify assignee exists
        User assignee = userRepository.findById(assigneeId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Assigned user not found"));
        
        
        
        // Update assignee
        task.setAssignedTo(assignee);
        task.setUpdatedAt(LocalDateTime.now());
        return taskRepository.save(task);
    }

    /**
     * Unassign task (set assigned_to to null)
     */
    @Transactional
    public Task unassignTask(Long id, Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
        
        Task task = taskRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Task not found"));
        
        Project project = task.getProject();
        
        // Check if user has permission to unassign the task
        if (!task.getCreatedBy().getId().equals(user.getId()) && 
            !project.getOwner().getId().equals(user.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, 
                "You don't have permission to unassign this task");
        }
        
        // Unassign
        task.setAssignedTo(null);
        task.setUpdatedAt(LocalDateTime.now());
        return taskRepository.save(task);
    }

    /**
     * Update task priority
     */
    @Transactional
    public Task updateTaskPriority(Long id, Priority priority, Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
        
        Task task = taskRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Task not found"));
        
        Project project = task.getProject();
        
        // Check if user has permission to update the task
        if (!task.getCreatedBy().getId().equals(user.getId()) && 
            (task.getAssignedTo() == null || !task.getAssignedTo().getId().equals(user.getId())) &&
            !project.getOwner().getId().equals(user.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, 
                "You don't have permission to update this task");
        }
        
        // Update priority
        task.setPriority(priority);
        task.setUpdatedAt(LocalDateTime.now());
        return taskRepository.save(task);
    }

    /**
     * Add labels to a task
     */
    @Transactional
    public Task addLabelsToTask(Long taskId, Set<Label> labels, Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
    
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Task not found"));
    
        Project project = task.getProject();
        if (!task.getCreatedBy().getId().equals(user.getId()) &&
            (task.getAssignedTo() == null || !task.getAssignedTo().getId().equals(user.getId())) &&
            !project.getOwner().getId().equals(user.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You don't have permission to update this task");
        }
    
        Set<Label> validLabels = new HashSet<>();
    
        for (Label label : labels) {
            Optional<Label> existingLabel = labelRepository.findByNameIgnoreCase(label.getName())
                    .filter(l -> l.getColor().equalsIgnoreCase(label.getColor()));
    
            if (existingLabel.isPresent()) {
                return task;
            } else {
                Label newLabel = Label.builder()
                        .name(label.getName())
                        .color(label.getColor())
                        .createdAt(LocalDateTime.now())
                        .task(task)
                        .build();
                validLabels.add(labelRepository.save(newLabel));
            }
        }
    
        // Attach valid labels to task
        if (task.getLabels() == null) {
            task.setLabels(new HashSet<>());
        }
        task.getLabels().addAll(validLabels);
        task.setUpdatedAt(LocalDateTime.now());
    
        return taskRepository.save(task);
    }
    

    /**
     * Remove labels from a task
     */
    @Transactional
    public Task removeLabelsFromTask(Long id, Set<Label> labels, Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
        
        Task task = taskRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Task not found"));

        Project project = task.getProject();
        if (!task.getCreatedBy().getId().equals(user.getId()) && 
            (task.getAssignedTo() == null || !task.getAssignedTo().getId().equals(user.getId())) &&
            !project.getOwner().getId().equals(user.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, 
                "You don't have permission to update this task");
        }

        Set<Long> labelIdsToRemove = labels.stream()
            .map(label -> label.getId())
            .collect(Collectors.toSet());
        task.getLabels().removeIf(label -> labelIdsToRemove.contains(label.getId()));
        task.setUpdatedAt(LocalDateTime.now());

        return taskRepository.save(task);
    }

    /**
     * Set task deadline
     */
    @Transactional
    public Task setTaskDeadline(Long id, String deadlineStr, Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
        
        Task task = taskRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Task not found"));
        
        Project project = task.getProject();
        
        // Check if user has permission to update the task
        if (!task.getCreatedBy().getId().equals(user.getId()) && 
            (task.getAssignedTo() == null || !task.getAssignedTo().getId().equals(user.getId())) &&
            !project.getOwner().getId().equals(user.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, 
                "You don't have permission to update this task");
        }
        
        // Parse deadline string to LocalDate
        LocalDate deadline;
        try {
            deadline = LocalDate.parse(deadlineStr);
        } catch (DateTimeParseException e) {
            try {
                // Try with formatter (assuming format like "yyyy-MM-dd")
                DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd");
                deadline = LocalDate.parse(deadlineStr, formatter);
            } catch (DateTimeParseException ex) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, 
                    "Invalid date format. Please use yyyy-MM-dd format");
            }
        }
        
        // Update deadline
        task.setDeadline(deadline);
        task.setUpdatedAt(LocalDateTime.now());
        
        return taskRepository.save(task);
    }

    /**
     * Helper method to check if a user is a member of a project
     */
    private boolean isUserMemberOfProject(Long userId, Long projectId) {
        return projectMemberRepository.existsByUserIdAndProjectId(userId, projectId);
    }
    
    /**
     * Helper method to get IDs of all projects a user has access to
     */
    private List<Long> getAccessibleProjectIds(Long userId) {
        // Projects the user is a member of
        List<Project> memberProjects = projectMemberRepository.getProjectsByUserId(userId);
        List<Long> memberProjectIds = memberProjects.stream()
            .map(Project::getId)
            .toList();

        // Projects the user owns
        List<Long> ownedProjectIds = projectRepository.findByOwnerId(userId)
            .stream()
            .map(Project::getId)
            .toList();

        // Combine both lists
        List<Long> accessibleProjectIds = new ArrayList<>(memberProjectIds);
        accessibleProjectIds.addAll(ownedProjectIds);
        return accessibleProjectIds;
    }

    public List<Long> getTaskIdsByProjectId(Long projectId) {
        // Option 1: If you want to fetch complete task entities and extract IDs
        List<Task> tasks = taskRepository.findByProjectId(projectId);
        return tasks.stream()
                .map(Task::getId)
                .collect(Collectors.toList());
        
        /* 
        // Option 2: More efficient query that only fetches IDs
        // Uncomment this and comment out the above code if you add this method to your repository
        // return taskRepository.findTaskIdsByProjectId(projectId);
        */
    }
}