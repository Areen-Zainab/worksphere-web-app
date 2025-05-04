package com.example.worksphere.dto;

import com.example.worksphere.entity.Notification;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class NotificationDTO {
    private Long id;
    private String message;
    private Boolean isRead;
    private Long inviteId;
    private Long projectId;
    private LocalDateTime createdAt;
    
    public static NotificationDTO fromEntity(Notification notification) {
        NotificationDTO dto = new NotificationDTO();
        dto.setId(notification.getId());
        dto.setMessage(notification.getMessage());
        dto.setIsRead(notification.getIsRead());
        dto.setInviteId(notification.getInviteId());
        dto.setProjectId(notification.getProjectId());
        dto.setCreatedAt(notification.getCreatedAt());
        return dto;
    }
}