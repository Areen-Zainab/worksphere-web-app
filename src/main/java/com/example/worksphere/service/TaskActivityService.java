package com.example.worksphere.service;

import com.example.worksphere.entity.TaskActivityLog;
import com.example.worksphere.entity.User;
import com.example.worksphere.repository.TaskActivityLogRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class TaskActivityService {

    private final TaskActivityLogRepository taskActivityLogRepository;
    
    @Autowired
    public TaskActivityService(TaskActivityLogRepository taskActivityLogRepository) {
        this.taskActivityLogRepository = taskActivityLogRepository;
    }
    
    /**
     * Get all activities for a specific task
     */
    public List<TaskActivityLog> getTaskActivities(Long taskId) {
        return taskActivityLogRepository.findByTaskIdOrderByCreatedAtDesc(taskId);
    }
    
    /**
     * Get all activities for multiple tasks
     */
    public List<TaskActivityLog> getActivitiesForTasks(List<Long> taskIds) {
        return taskActivityLogRepository.findByTaskIdsOrderByCreatedAtDesc(taskIds);
    }
    
    /**
     * Get all activities performed by a specific user
     */
    public List<TaskActivityLog> getUserActivities(Long userId) {
        return taskActivityLogRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }
    
    /**
     * Get specific type of activities for a task
     */
    public List<TaskActivityLog> getTaskActivitiesByAction(Long taskId, TaskActivityLog.ActivityAction action) {
        return taskActivityLogRepository.findByTaskIdAndActionOrderByCreatedAtDesc(taskId, action);
    }
    
    /**
     * Create manual activity log entry
     * Note: Most logs are created by database triggers, but this method can be used
     * for activities that don't have triggers (e.g., custom actions)
     */
    public TaskActivityLog createActivityLog(Long taskId, User user, TaskActivityLog.ActivityAction action, String changedData) {
        TaskActivityLog activityLog = new TaskActivityLog();
        activityLog.setTaskId(taskId);
        activityLog.setUserId(user.getId());
        activityLog.setUserName(user.getFirstName() + " " + user.getLastName());
        activityLog.setAction(action);
        activityLog.setChangedData(changedData);
        
        return taskActivityLogRepository.save(activityLog);
    }
} 