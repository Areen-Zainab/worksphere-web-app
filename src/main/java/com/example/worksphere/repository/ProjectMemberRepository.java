package com.example.worksphere.repository;

import com.example.worksphere.entity.Project;
import com.example.worksphere.entity.ProjectMember;
import com.example.worksphere.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProjectMemberRepository extends JpaRepository<ProjectMember, Long> {
    List<ProjectMember> findByProjectId(Long projectId);
    Optional<ProjectMember> findByProjectIdAndUserId(Long projectId, Long userId);
    boolean existsByProjectAndUserAndRole(Project project, User user, ProjectMember.Role role);
    boolean existsByProjectAndUserAndStatusIn(Project project, User user, List<ProjectMember.Status> statuses);
    long countByProjectIdAndRole(Long projectId, ProjectMember.Role role);
    
    // New methods for getting projects by member
    List<ProjectMember> findByUserId(Long userId);
    List<ProjectMember> findByUserIdAndRole(Long userId, ProjectMember.Role role);
    List<ProjectMember> findByUserIdAndStatus(Long userId, ProjectMember.Status status);
    List<ProjectMember> findByUserIdAndRoleAndStatus(Long userId, ProjectMember.Role role, ProjectMember.Status status);
    
    // Method for getting members with a specific status
    List<ProjectMember> findByProjectIdAndStatus(Long projectId, ProjectMember.Status status);
    
    // Added methods
    List<Project> getProjectsByUserId(Long userId);
    boolean existsByUserIdAndProjectId(Long userId, Long projectId);
}