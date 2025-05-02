package com.example.worksphere.repository;

import com.example.worksphere.entity.Task;
import com.example.worksphere.entity.Task.Status;
import com.example.worksphere.entity.Task.Priority;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TaskRepository extends JpaRepository<Task, Long> {
    // Find by project
    List<Task> findByProjectId(Long projectId);
    Page<Task> findByProjectId(Long projectId, Pageable pageable);
    
    // Find by project with filters
    Page<Task> findByProjectIdAndStatus(Long projectId, Status status, Pageable pageable);
    Page<Task> findByProjectIdAndPriority(Long projectId, Priority priority, Pageable pageable);
    Page<Task> findByProjectIdAndAssignedToId(Long projectId, Long assignedToId, Pageable pageable);
    Page<Task> findByProjectIdAndStatusAndPriority(Long projectId, Status status, Priority priority, Pageable pageable);
    Page<Task> findByProjectIdAndStatusAndAssignedToId(Long projectId, Status status, Long assignedToId, Pageable pageable);
    Page<Task> findByProjectIdAndPriorityAndAssignedToId(Long projectId, Priority priority, Long assignedToId, Pageable pageable);
    Page<Task> findByProjectIdAndStatusAndPriorityAndAssignedToId(Long projectId, Status status, Priority priority, Long assignedToId, Pageable pageable);
    
    // Find by multiple projects
    Page<Task> findByProjectIdIn(List<Long> projectIds, Pageable pageable);
    
    // Find by multiple projects with filters
    Page<Task> findByProjectIdInAndStatus(List<Long> projectIds, Status status, Pageable pageable);
    Page<Task> findByProjectIdInAndPriority(List<Long> projectIds, Priority priority, Pageable pageable);
    Page<Task> findByProjectIdInAndAssignedToId(List<Long> projectIds, Long assignedToId, Pageable pageable);
    Page<Task> findByProjectIdInAndStatusAndPriority(List<Long> projectIds, Status status, Priority priority, Pageable pageable);
    Page<Task> findByProjectIdInAndStatusAndAssignedToId(List<Long> projectIds, Status status, Long assignedToId, Pageable pageable);
    Page<Task> findByProjectIdInAndPriorityAndAssignedToId(List<Long> projectIds, Priority priority, Long assignedToId, Pageable pageable);
    Page<Task> findByProjectIdInAndStatusAndPriorityAndAssignedToId(List<Long> projectIds, Status status, Priority priority, Long assignedToId, Pageable pageable);
    
    // Find by assigned user
    Page<Task> findByAssignedToId(Long userId, Pageable pageable);
    Page<Task> findByAssignedToIdAndStatus(Long userId, Status status, Pageable pageable);
    Page<Task> findByAssignedToIdAndPriority(Long userId, Priority priority, Pageable pageable);
    Page<Task> findByAssignedToIdAndStatusAndPriority(Long userId, Status status, Priority priority, Pageable pageable);
    
    // Find by created by user
    Page<Task> findByCreatedById(Long userId, Pageable pageable);
    Page<Task> findByCreatedByIdAndStatus(Long userId, Status status, Pageable pageable);
    Page<Task> findByCreatedByIdAndPriority(Long userId, Priority priority, Pageable pageable);
    Page<Task> findByCreatedByIdAndStatusAndPriority(Long userId, Status status, Priority priority, Pageable pageable);
}