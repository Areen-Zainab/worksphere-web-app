package com.example.worksphere.repository;

import com.example.worksphere.entity.TaskActivityLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TaskActivityLogRepository extends JpaRepository<TaskActivityLog, Long> {
    
    List<TaskActivityLog> findByTaskIdOrderByCreatedAtDesc(Long taskId);
    
    @Query("SELECT tal FROM TaskActivityLog tal WHERE tal.taskId IN :taskIds ORDER BY tal.createdAt DESC")
    List<TaskActivityLog> findByTaskIdsOrderByCreatedAtDesc(@Param("taskIds") List<Long> taskIds);
    
    List<TaskActivityLog> findByUserIdOrderByCreatedAtDesc(Long userId);
    
    @Query("SELECT tal FROM TaskActivityLog tal WHERE tal.taskId = :taskId AND tal.action = :action ORDER BY tal.createdAt DESC")
    List<TaskActivityLog> findByTaskIdAndActionOrderByCreatedAtDesc(@Param("taskId") Long taskId, @Param("action") TaskActivityLog.ActivityAction action);
}