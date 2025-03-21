package com.example.worksphere.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "projects")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Project {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "name", nullable = false, length = 255)
    private String name;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @ManyToOne
    @JoinColumn(name = "owner_id", nullable = false)
    private User owner; // Reference to the User entity

    @Builder.Default
    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, columnDefinition = "ENUM('not_started', 'in_progress', 'completed', 'on_hold', 'cancelled')")
    private Status status = Status.NOT_STARTED;

    @Builder.Default
    @Enumerated(EnumType.STRING)
    @Column(name = "visibility", nullable = false, columnDefinition = "ENUM('private', 'public')")
    private Visibility visibility = Visibility.PRIVATE;

    @Column(name = "progress", columnDefinition = "TINYINT UNSIGNED DEFAULT 0")
    private int progress;

    @Column(name = "start_date")
    private LocalDate startDate;

    @Column(name = "end_date")
    private LocalDate endDate;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

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
        IN_PROGRESS,
        COMPLETED,
        ON_HOLD,
        CANCELLED
    }

    public enum Visibility {
        PRIVATE,
        PUBLIC
    }
}
