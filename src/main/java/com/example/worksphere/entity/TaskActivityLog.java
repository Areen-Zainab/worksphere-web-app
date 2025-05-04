package com.example.worksphere.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "task_activity_log")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class TaskActivityLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "task_id", nullable = false)
    private Long taskId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "task_id", insertable = false, updatable = false)
    private Task task;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", insertable = false, updatable = false)
    private User user;

    @Column(name = "user_name", nullable = false, length = 101)
    private String userName;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ActivityAction action;

    @Column(name = "changed_data", columnDefinition = "TEXT")
    private String changedData;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    // Enum for activity actions
    public enum ActivityAction {
        CREATED,
        UPDATED,
        DELETED,
        STATUS_CHANGED,
        ASSIGNED,
        UNASSIGNED,
        PRIORITY_CHANGED,
        DEADLINE_CHANGED,
        COMMENTED,
        LABEL_ADDED,
        LABEL_REMOVED,
        ATTACHMENT_ADDED,
        ATTACHMENT_REMOVED
    }
}