package com.example.worksphere.repository;

import com.example.worksphere.entity.TaskAttachment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Repository for Task Attachment entities.
 */
@Repository
public interface TaskAttachmentRepository extends JpaRepository<TaskAttachment, Long> {
    
    /**
     * Find all attachments for a specific task.
     * 
     * @param taskId the task ID
     * @return list of task attachments
     */
    List<TaskAttachment> findByTaskId(Long taskId);
    
    /**
     * Find all attachments uploaded by a specific user.
     * 
     * @param userId the user ID
     * @return list of task attachments
     */
    List<TaskAttachment> findByUploadedById(Long userId);

    /**
     * Delete all attachments for a task.
     * 
     * @param taskId the task ID
     */
    void deleteByTaskId(Long taskId);
}