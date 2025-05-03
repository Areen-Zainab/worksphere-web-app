package com.example.worksphere.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

import com.example.worksphere.dto.ProjectDTO;

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
    private Status status = Status.not_started;

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
        not_started,
        in_progress,
        completed,
        on_hold,
        cancelled
    }

    public enum Visibility {
        PRIVATE,
        PUBLIC
    }

    @Override
    public String toString() {
        return "Project{" +
                "id=" + id +
                ", name='" + name + '\'' +
                ", description='" + description + '\'' +
                ", owner=" + owner.getId() + // Assuming 'User' has a getId() method to get the owner's ID
                ", status=" + status +
                ", visibility=" + visibility +
                ", progress=" + progress +
                ", startDate=" + startDate +
                ", endDate=" + endDate +
                ", createdAt=" + createdAt +
                ", updatedAt=" + updatedAt +
                '}';
    }

    public ProjectDTO toDTO() {
        ProjectDTO dto = new ProjectDTO();
        dto.setName(this.name);
        dto.setDescription(this.description);
        dto.setOwnerId(this.owner.getId());  // Get the owner's ID
        dto.setStatus(this.status);
        dto.setVisibility(this.visibility);
        dto.setProgress(this.progress);
        dto.setStartDate(this.startDate);
        dto.setEndDate(this.endDate);
        return dto;
    }

}
