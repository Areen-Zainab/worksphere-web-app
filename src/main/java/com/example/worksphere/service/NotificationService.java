package com.example.worksphere.service;

import com.example.worksphere.entity.Notification;
import com.example.worksphere.repository.NotificationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class NotificationService {

    private final NotificationRepository notificationRepository;

    @Autowired
    public NotificationService(NotificationRepository notificationRepository) {
        this.notificationRepository = notificationRepository;
    }

    /**
     * Get all notifications for a specific user
     */
    public List<Notification> getUserNotifications(Long userId) {
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    /**
     * Count unread notifications for a user
     */
    public long countUnreadNotifications(Long userId) {
        return notificationRepository.countByUserIdAndIsReadFalse(userId);
    }

    /**
     * Mark a specific notification as read
     * @return true if the notification was marked as read, false otherwise
     */
    @Transactional
    public boolean markNotificationAsRead(Long notificationId, Long userId) {
        return notificationRepository.markAsRead(notificationId, userId) > 0;
    }

    /**
     * Mark all notifications as read for a specific user
     * @return number of notifications marked as read
     */
    @Transactional
    public int markAllNotificationsAsRead(Long userId) {
        return notificationRepository.markAllAsReadForUser(userId);
    }

    /**
     * Create a new notification
     */
    @Transactional
    public Notification createNotification(Notification notification) {
        return notificationRepository.save(notification);
    }

    /**
     * Create a new notification with basic info
     */
    @Transactional
    public Notification createNotification(Long userId, String message, Long inviteId) {
        Notification notification = new Notification();
        notification.setUserId(userId);
        notification.setMessage(message);
        notification.setInviteId(inviteId);
        notification.setIsRead(false);
        
        return notificationRepository.save(notification);
    }
}