package com.example.worksphere.repository;

import com.example.worksphere.entity.Project;
import com.example.worksphere.entity.ProjectMember;
import com.example.worksphere.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProjectMemberRepository extends JpaRepository<ProjectMember, Long> {
    // Basic query methods
    List<ProjectMember> findByProjectId(Long projectId);
    Optional<ProjectMember> findByProjectIdAndUserId(Long projectId, Long userId);
    
    // Existence checks
    boolean existsByProjectAndUserAndRole(Project project, User user, ProjectMember.Role role);
    boolean existsByProjectAndUserAndStatusIn(Project project, User user, List<ProjectMember.Status> statuses);
    boolean existsByProjectIdAndUserIdAndStatus(Long projectId, Long userId, ProjectMember.Status status);
    boolean existsByProjectIdAndUserIdAndRoleAndStatus(Long projectId, Long userId, ProjectMember.Role role, ProjectMember.Status status);
    boolean existsByProjectAndUserAndRoleAndStatus(Project project, User user, ProjectMember.Role role, ProjectMember.Status status);
    boolean existsByUserIdAndProjectId(Long userId, Long projectId);
    boolean existsByProjectAndUser(Project project, User user);
    
    // Counting methods
    long countByProjectIdAndRole(Long projectId, ProjectMember.Role role);
    long countByProjectIdAndStatus(Long projectId, ProjectMember.Status status);
    
    // Finding members by user
    List<ProjectMember> findByUserIdAndStatus(Long userId, ProjectMember.Status status);
    List<ProjectMember> findByUserIdAndRoleAndStatus(Long userId, ProjectMember.Role role, ProjectMember.Status status);
    List<ProjectMember> findByUserId(Long userId);
    
    // Finding members by project and status
    List<ProjectMember> findByProjectIdAndStatus(Long projectId, ProjectMember.Status status);
    
    // Finding members by project and statuses (multiple)
    List<ProjectMember> findAllByProjectIdAndStatusIn(Long projectId, List<ProjectMember.Status> statuses);
    
    // Get projects by user id
    @Query("SELECT pm.project FROM ProjectMember pm WHERE pm.user.id = :userId")
    List<Project> getProjectsByUserId(@Param("userId") Long userId);
    
    // Get projects by user id and status
    @Query("SELECT pm.project FROM ProjectMember pm WHERE pm.user.id = :userId AND pm.status = :status")
    List<Project> getProjectsByUserIdAndStatus(@Param("userId") Long userId, @Param("status") ProjectMember.Status status);
    
    // Get active projects by user id
    @Query("SELECT pm.project FROM ProjectMember pm WHERE pm.user.id = :userId AND pm.status = com.example.worksphere.entity.ProjectMember.Status.ACTIVE")
    List<Project> getActiveProjectsByUserId(@Param("userId") Long userId);
    
    // Custom queries for role-based access
    @Query("SELECT COUNT(pm) > 0 FROM ProjectMember pm " +
           "WHERE pm.project.id = :projectId " +
           "AND pm.user.id = :userId " +
           "AND pm.role IN ('PROJECT_MANAGER', 'TEAM_MEMBER') " +
           "AND pm.status = 'ACTIVE'")
    boolean hasEditAccessToProject(@Param("projectId") Long projectId, @Param("userId") Long userId);
    
    @Query("SELECT COUNT(pm) > 0 FROM ProjectMember pm " +
           "WHERE pm.project.id = :projectId " +
           "AND pm.user.id = :userId " +
           "AND pm.role = 'PROJECT_MANAGER' " +
           "AND pm.status = 'ACTIVE'")
    boolean isProjectManager(@Param("projectId") Long projectId, @Param("userId") Long userId);
}