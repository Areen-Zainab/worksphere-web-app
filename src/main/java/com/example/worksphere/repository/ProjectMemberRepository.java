package com.example.worksphere.repository;

import com.example.worksphere.entity.ProjectMember;
import com.example.worksphere.entity.User;
import com.example.worksphere.entity.Project;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.List;

public interface ProjectMemberRepository extends JpaRepository<ProjectMember, Long> {
    
    // Check if a user is already a member of a project
    boolean existsByProjectAndUser(Project project, User user);

    // Find an invitation for a user
    Optional<ProjectMember> findByProjectAndUser(Project project, User user);

    // Remove a user from the project
    void deleteByProjectAndUser(Project project, User user);

    Optional<ProjectMember> findByProjectIdAndUserId(Long projectId, Long userId);

    long countByProjectIdAndRole(Long projectId, ProjectMember.Role role);

    /* Get all members of a specific project. */
    List<ProjectMember> findByProjectId(Long projectId);

    /* Check if a user is a project manager in a project. */
    boolean existsByProjectAndUserAndRole(Project project, User user, ProjectMember.Role role);

    boolean existsByProjectAndUserAndStatusIn(Project project, User user, List<ProjectMember.Status> statuses);
}
