package com.example.worksphere.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "project_members", uniqueConstraints = @UniqueConstraint(columnNames = {"project_id", "user_id"}))
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProjectMember {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "project_id", nullable = false)
    private Project project; // The project this member belongs to

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user; // The user who is a member of the project

    @Builder.Default
    @Enumerated(EnumType.STRING)
    @Column(name = "role", nullable = false, columnDefinition = "ENUM('project_manager', 'team_member', 'spectator')")
    private Role role = Role.TEAM_MEMBER;

    @Builder.Default
    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, columnDefinition = "ENUM('active', 'invited', 'removed', 'left')")
    private Status status = Status.ACTIVE;

    @Column(name = "joined_at", updatable = false)
    private LocalDateTime joinedAt;

    @PrePersist
    protected void onJoin() {
        joinedAt = LocalDateTime.now();
    }

    public enum Role {
        project_manager,
        TEAM_MEMBER,
        SPECTATOR
    }

    public enum Status {
        ACTIVE,
        INVITED,
        REMOVED,
        LEFT
    }
}
