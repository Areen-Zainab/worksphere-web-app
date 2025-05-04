package com.example.worksphere.controller;

import com.example.worksphere.entity.Task;
import com.example.worksphere.entity.Task.Status;
import com.example.worksphere.entity.Task.Priority;
import com.example.worksphere.entity.Label;
import com.example.worksphere.service.TaskService;
import com.example.worksphere.dto.*;
import com.example.worksphere.repository.*;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.Optional;

@RestController
@CrossOrigin(origins = "http://localhost:3000") 
@RequestMapping("/api/tasks")
public class TaskController {

    @Autowired
    private TaskService taskService;

    @Autowired
    private LabelRepository labelRepository;

    /**
     * Create a new task
     */
    @PostMapping
    public ResponseEntity<Task> createTask(@Valid @RequestBody Task task, @RequestParam Long userId) {
        Task createdTask = taskService.createTask(task, userId);
        return new ResponseEntity<>(createdTask, HttpStatus.CREATED);
    }

    /**
     * Get all tasks with filtering options
     */
    @GetMapping
    public ResponseEntity<List<Task>> getTasks(
            @RequestParam(required = false) Long projectId,
            @RequestParam(required = false) Status status,
            @RequestParam(required = false) Priority priority,
            @RequestParam(required = false) Long assignedToId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "asc") String sortDir,
            @RequestParam Long userId) { // Accept userId as a request parameter
        
        List<Task> tasks = taskService.getAllTasks(projectId, status, priority, assignedToId, 
                                        page, size, sortBy, sortDir, userId);
        return ResponseEntity.ok(tasks);
    }

    /**
     * Get task by ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<Task> getTaskById(@PathVariable Long id, @RequestParam Long userId) {
        Optional<Task> task = taskService.getTaskById(id, userId);
        return task.map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Update task
     */
    @PutMapping("/{id}")
    public ResponseEntity<Task> updateTask(@PathVariable Long id, 
                                          @Valid @RequestBody Task taskDetails,
                                          @RequestParam Long userId) {
        Task updatedTask = taskService.updateTask(id, taskDetails, userId);
        return ResponseEntity.ok(updatedTask);
    }

    /**
     * Delete task
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, Boolean>> deleteTask(@PathVariable Long id, @RequestParam Long userId) {
        boolean deleted = taskService.deleteTask(id, userId);
        Map<String, Boolean> response = Map.of("deleted", deleted);
        return ResponseEntity.ok(response);
    }

    /**
     * Get tasks by project ID
     */
    @GetMapping("/project/{projectId}")
    public ResponseEntity<List<Task>> getTasksByProject(@PathVariable Long projectId, @RequestParam Long userId) {
        List<Task> tasks = taskService.getTasksByProject(projectId, userId);
        return ResponseEntity.ok(tasks);
    }

    /**
     * Get tasks assigned to a specific user
     */
    @GetMapping("/my-tasks")
    public ResponseEntity<List<Task>> getMyTasks(
            @RequestParam Long userId,
            @RequestParam(required = false) Status status,
            @RequestParam(required = false) Priority priority,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "asc") String sortDir)
             { // Accept userId as a request parameter
            
        List<Task> tasks = taskService.getTasksAssignedToUser(userId, status, priority, page, size, sortBy, sortDir);
        return ResponseEntity.ok(tasks);
    }

    /**
     * Get tasks created by the current user
     */
    @GetMapping("/created-by-me")
    public ResponseEntity<List<Task>> getTasksCreatedByMe(
            @RequestParam(required = false) Status status,
            @RequestParam(required = false) Priority priority,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "asc") String sortDir,
            @RequestParam Long userId) {  // Accept userId as a request parameter
        
        List<Task> tasks = taskService.getTasksCreatedByUser(userId, status, priority, page, size, sortBy, sortDir);
        return ResponseEntity.ok(tasks);
    }

    /**
     * Update task status
     */
    @PatchMapping("/{id}/status")
    public ResponseEntity<Task> updateTaskStatus(
            @PathVariable Long id,
            @RequestParam Status status,
            @RequestParam Long userId) {
        
        Task updatedTask = taskService.updateTaskStatus(id, status, userId);
        return ResponseEntity.ok(updatedTask);
    }

    /**
     * Assign task to a user
     */
    @PatchMapping("/{id}/assign")
    public ResponseEntity<Task> assignTask(
            @PathVariable Long id,
            @RequestParam Long userId,
            @RequestParam Long assigneeId) {
        
        Task updatedTask = taskService.assignTask(id, userId, assigneeId);
        return ResponseEntity.ok(updatedTask);
    }

    /**
     * Unassign task (set assigned_to to null)
     */
    @PatchMapping("/{id}/unassign")
    public ResponseEntity<Task> unassignTask(
            @PathVariable Long id,
            @RequestParam Long userId) {
        
        Task updatedTask = taskService.unassignTask(id, userId);
        return ResponseEntity.ok(updatedTask);
    }

    /**
     * Update task priority
     */
    @PatchMapping("/{id}/priority")
    public ResponseEntity<Task> updateTaskPriority(
            @PathVariable Long id,
            @RequestParam Priority priority,
            @RequestParam Long userId) {
        
        Task updatedTask = taskService.updateTaskPriority(id, priority, userId);
        return ResponseEntity.ok(updatedTask);
    }

    /**
     * Add labels to a task
     */
    @PatchMapping("/{id}/labels/add")
    public ResponseEntity<Task> addLabelsToTask(
            @PathVariable Long id,
            @RequestBody Set<Label> labels,
            @RequestParam Long userId) {
        
        Task updatedTask = taskService.addLabelsToTask(id, labels, userId);
        return ResponseEntity.ok(updatedTask);
    }

    /**
     * Remove labels from a task
     */
    @PatchMapping("/{id}/labels/remove")
    public ResponseEntity<Task> removeLabelsFromTask(
            @PathVariable Long id,
            @RequestBody Set<Label> labels,
            @RequestParam Long userId) {
        
        Task updatedTask = taskService.removeLabelsFromTask(id, labels, userId);
        return ResponseEntity.ok(updatedTask);
    }

    /**
     * Set task deadline
     */
    @PatchMapping("/{id}/deadline")
    public ResponseEntity<Task> setTaskDeadline(
            @PathVariable Long id,
            @RequestParam String deadline,
            @RequestParam Long userId) {
        
        Task updatedTask = taskService.setTaskDeadline(id, deadline, userId);
        return ResponseEntity.ok(updatedTask);
    }

        /**
     * Get labels by task ID
     */
    @GetMapping("/{id}/labels")
    public ResponseEntity<List<Label>> getLabelsByTaskId(@PathVariable Long id, @RequestParam Long userId) {
        List<Label> labels = labelRepository.findByTaskId(id);
        return ResponseEntity.ok(labels);
    }

}
