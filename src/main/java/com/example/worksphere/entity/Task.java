package com.example.worksphere.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonManagedReference;

@Entity
@Table(name = "tasks", indexes = {
    @Index(name = "idx_task_title", columnList = "title"),
    @Index(name = "idx_task_priority", columnList = "priority"),
    @Index(name = "idx_task_status", columnList = "status"),
    @Index(name = "idx_task_assigned_to", columnList = "assigned_to"),
    @Index(name = "idx_task_created_by", columnList = "created_by")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Task {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne
    @JoinColumn(name = "project_id", nullable = false)
    private Project project; // Reference to the Project entity
    
    @ManyToOne
    @JoinColumn(name = "assigned_to", nullable = true)
    private User assignedTo; // Task can be unassigned initially
    
    @Column(name = "title", nullable = false, length = 255)
    private String title;
    
    @Column(name = "description", columnDefinition = "TEXT")
    private String description;
    
    @Builder.Default
    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, columnDefinition = "ENUM('not_started', 'pending', 'in_progress', 'completed', 'on_hold', 'canceled')")
    private Status status = Status.PENDING;
    
    @Builder.Default
    @Enumerated(EnumType.STRING)
    @Column(name = "priority", nullable = false, columnDefinition = "ENUM('low', 'medium', 'high', 'critical')")
    private Priority priority = Priority.MEDIUM;
    
    @Column(name = "deadline")
    private LocalDate deadline;
    
    @ManyToOne
    @JoinColumn(name = "created_by", nullable = false)
    private User createdBy;
    
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    // Apply JsonManagedReference to break the circular reference
    @JsonManagedReference
    @OneToMany(mappedBy = "task", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<Label> labels = new HashSet<>();
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
    
    public enum Status {
        NOT_STARTED,
        PENDING,
        IN_PROGRESS,
        COMPLETED,
        ON_HOLD,
        CANCELED
    }
    
    public enum Priority {
        LOW,
        MEDIUM,
        HIGH,
        CRITICAL;
        
        @JsonCreator
        public static Priority fromValue(String value) {
            return Priority.valueOf(value.toUpperCase());
        }
    }
}