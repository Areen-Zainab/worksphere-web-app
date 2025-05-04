package com.example.worksphere.service;

import com.example.worksphere.entity.Task;
import com.example.worksphere.entity.TaskAttachment;
import com.example.worksphere.entity.User;
import com.example.worksphere.repository.TaskAttachmentRepository;
import com.example.worksphere.repository.TaskRepository;
import com.example.worksphere.repository.UserRepository;
import com.example.worksphere.repository.*;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Service for managing task attachments.
 */
@Service
@RequiredArgsConstructor
public class TaskAttachmentService {
    
    private final TaskAttachmentRepository taskAttachmentRepository;
    private final TaskRepository taskRepository;
    private final UserRepository userRepository;
    private final ProjectMemberRepository projectMemberRepository;
    
    // Configure this based on your storage solution
    private final String UPLOAD_DIRECTORY = "uploads/attachments/";
    
    /**
     * Get all attachments for a task.
     */
    public List<TaskAttachment> getTaskAttachments(Long taskId, Long userId) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Task not found"));
        
        if (!hasTaskAccess(task, userId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access denied");
        }
        
        return taskAttachmentRepository.findByTaskId(taskId);
    }
    
    /**
     * Upload a new attachment for a task.
     */
    @Transactional
    public TaskAttachment uploadAttachment(Long taskId, MultipartFile file, Long userId) throws IOException {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Task not found"));
        
        if (!hasTaskAccess(task, userId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access denied");
        }
        
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
        
        // Create directory if it doesn't exist
        Path uploadPath = Paths.get(UPLOAD_DIRECTORY);
        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }
        
        // Generate a unique file name to avoid conflicts
        String originalFilename = file.getOriginalFilename();
        String fileExtension = originalFilename.substring(originalFilename.lastIndexOf("."));
        String uniqueFilename = UUID.randomUUID() + fileExtension;
        
        // Save the file
        Path filePath = uploadPath.resolve(uniqueFilename);
        Files.copy(file.getInputStream(), filePath);
        
        // Create and save the attachment record
        TaskAttachment attachment = TaskAttachment.builder()
                .fileName(originalFilename)
                .filePath(UPLOAD_DIRECTORY + uniqueFilename)
                .task(task)
                .uploadedBy(user)
                .build();
        
        return taskAttachmentRepository.save(attachment);
    }
    
    /**
     * Delete an attachment.
     */
    @Transactional
    public boolean deleteAttachment(Long attachmentId, Long userId) {
        TaskAttachment attachment = taskAttachmentRepository.findById(attachmentId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Attachment not found"));
        
        try {
            // Delete the physical file
            Path filePath = Paths.get(attachment.getFilePath());
            Files.deleteIfExists(filePath);
            
            // Delete the database record
            taskAttachmentRepository.delete(attachment);
            return true;
        } catch (IOException e) {
            return false;
        }
    }
    
    /**
     * Find an attachment by its ID.
     */
    public Optional<TaskAttachment> findById(Long attachmentId) {
        return taskAttachmentRepository.findById(attachmentId);
    }
    
    /**
     * Check if a user has access to a task.
     */
    private boolean hasTaskAccess(Task task, Long userId) {
        if (task.getCreatedBy() != null && task.getCreatedBy().getId().equals(userId)) {
            return true;
        }
        
        if (task.getAssignedTo() != null && task.getAssignedTo().getId().equals(userId)) {
            return true;
        }
        
        if (!isUserMemberOfProject(userId, task.getProject().getId())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, 
                "User is not a member of this project");
        }
        
        return false;
    }

    private boolean isUserMemberOfProject(Long userId, Long projectId) {
        return projectMemberRepository.existsByUserIdAndProjectId(userId, projectId);
    }
}