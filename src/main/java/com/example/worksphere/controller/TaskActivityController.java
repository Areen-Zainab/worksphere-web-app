package com.example.worksphere.controller;

import com.example.worksphere.dto.TaskActivityDTO;
import com.example.worksphere.entity.TaskActivityLog;
import com.example.worksphere.service.TaskActivityService;
import com.example.worksphere.service.TaskService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/task-activities")
public class TaskActivityController {

    private final TaskActivityService taskActivityService;
    private final TaskService taskService;

    @Autowired
    public TaskActivityController(TaskActivityService taskActivityService, TaskService taskService) {
        this.taskActivityService = taskActivityService;
        this.taskService = taskService;
    }

    @GetMapping("/task/{taskId}")
    public ResponseEntity<List<TaskActivityDTO>> getTaskActivities(@PathVariable Long taskId) {
        List<TaskActivityLog> activities = taskActivityService.getTaskActivities(taskId);
        List<TaskActivityDTO> activityDTOs = convertToDTO(activities);
        return ResponseEntity.ok(activityDTOs);
    }

    @GetMapping("/project/{projectId}")
    public ResponseEntity<List<TaskActivityDTO>> getProjectActivities(@PathVariable Long projectId) {
        // Get all task IDs for the project
        List<Long> taskIds = taskService.getTaskIdsByProjectId(projectId);
        if (taskIds.isEmpty()) {
            return ResponseEntity.ok(List.of());
        }
        
        List<TaskActivityLog> activities = taskActivityService.getActivitiesForTasks(taskIds);
        List<TaskActivityDTO> activityDTOs = convertToDTO(activities);
        return ResponseEntity.ok(activityDTOs);
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<TaskActivityDTO>> getUserActivities(@PathVariable Long userId) {
        List<TaskActivityLog> activities = taskActivityService.getUserActivities(userId);
        List<TaskActivityDTO> activityDTOs = convertToDTO(activities);
        return ResponseEntity.ok(activityDTOs);
    }

    // Helper method to convert entity to DTO with display properties
    private List<TaskActivityDTO> convertToDTO(List<TaskActivityLog> activities) {
        return activities.stream().map(activity -> {
            TaskActivityDTO dto = new TaskActivityDTO();
            dto.setId(activity.getId());
            dto.setTaskId(activity.getTaskId());
            
            // Get task title if task is loaded
            if (activity.getTask() != null) {
                dto.setTaskTitle(activity.getTask().getTitle());
            }
            
            dto.setUserId(activity.getUserId());
            dto.setUserName(activity.getUserName());
            dto.setAction(activity.getAction().name());
            dto.setChangedData(activity.getChangedData());
            dto.setCreatedAt(activity.getCreatedAt());
            
            // Set display properties for frontend
            dto.setDisplayProperties();
            
            return dto;
        }).collect(Collectors.toList());
    }
}