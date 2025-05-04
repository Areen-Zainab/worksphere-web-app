package com.example.worksphere.repository;

import com.example.worksphere.entity.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {
    
    /**
     * Find all notifications for a specific user, ordered by creation date (newest first)
     */
    List<Notification> findByUserIdOrderByCreatedAtDesc(Long userId);
    
    /**
     * Count unread notifications for a specific user
     */
    long countByUserIdAndIsReadFalse(Long userId);
    
    /**
     * Update all unread notifications for a user to read status
     */
    @Modifying
    @Query("UPDATE Notification n SET n.isRead = true WHERE n.userId = :userId AND n.isRead = false")
    int markAllAsReadForUser(@Param("userId") Long userId);
    
    /**
     * Mark a specific notification as read
     */
    @Modifying
    @Query("UPDATE Notification n SET n.isRead = true WHERE n.id = :notificationId AND n.userId = :userId")
    int markAsRead(@Param("notificationId") Long notificationId, @Param("userId") Long userId);
}