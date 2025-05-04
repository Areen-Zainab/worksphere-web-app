package com.example.worksphere.controller;

import com.example.worksphere.dto.NotificationDTO;
import com.example.worksphere.entity.Notification;
import com.example.worksphere.service.NotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/notifications")
@CrossOrigin(origins = "http://localhost:3000") 
public class NotificationController {

    private final NotificationService notificationService;

    @Autowired
    public NotificationController(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    /**
     * Get all notifications for the current user
     */
    @GetMapping
    public ResponseEntity<Map<String, Object>> getUserNotifications(@RequestParam Long userId) {
        // In production, you would verify the authenticated user matches the requested userId
        List<Notification> notifications = notificationService.getUserNotifications(userId);
        List<NotificationDTO> notificationDTOs = notifications.stream()
                .map(NotificationDTO::fromEntity)
                .collect(Collectors.toList());
        
        Map<String, Object> response = new HashMap<>();
        response.put("ok", true);
        response.put("notifications", notificationDTOs);
        response.put("count", notificationDTOs.size());
        
        return ResponseEntity.ok(response);
    }

    /**
     * Get unread notification count for the current user
     */
    @GetMapping("/unread/count")
    public ResponseEntity<Map<String, Object>> getUnreadCount(@RequestParam Long userId) {
        long count = notificationService.countUnreadNotifications(userId);
        
        Map<String, Object> response = new HashMap<>();
        response.put("ok", true);
        response.put("count", count);
        
        return ResponseEntity.ok(response);
    }

    /**
     * Mark a specific notification as read
     */
    @PatchMapping("/{notificationId}/read")
    public ResponseEntity<Map<String, Object>> markAsRead(
            @PathVariable Long notificationId,
            @RequestParam Long userId) {
        
        boolean updated = notificationService.markNotificationAsRead(notificationId, userId);
        
        Map<String, Object> response = new HashMap<>();
        
        if (updated) {
            response.put("ok", true);
            response.put("message", "Notification marked as read");
            response.put("notificationId", notificationId);
            return ResponseEntity.ok(response);
        } else {
            response.put("ok", false);
            response.put("message", "Notification not found or could not be updated");
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        }
    }

    /**
     * Mark all notifications as read for the current user
     */
    @PatchMapping("/mark-all-read")
    public ResponseEntity<Map<String, Object>> markAllAsRead(@RequestParam Long userId) {
        int updatedCount = notificationService.markAllNotificationsAsRead(userId);
        
        Map<String, Object> response = new HashMap<>();
        response.put("ok", true);
        response.put("markedAsRead", updatedCount);
        response.put("message", updatedCount + " notifications marked as read");
        
        return ResponseEntity.ok(response);
    }
    
    
}