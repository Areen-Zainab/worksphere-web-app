package com.example.worksphere.controller;

import com.example.worksphere.entity.TaskAttachment;
import com.example.worksphere.service.TaskAttachmentService;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * REST controller for task attachment operations.
 */
@RestController
@RequestMapping("/api/attachments")
@CrossOrigin(origins = "http://localhost:3000") 
@RequiredArgsConstructor
public class TaskAttachmentController {
    
    private final TaskAttachmentService taskAttachmentService;
    
    /**
     * Get all attachments for a task.
     */
    @GetMapping("/task/{taskId}")
    public ResponseEntity<List<TaskAttachment>> getTaskAttachments(
            @PathVariable Long taskId,
            @RequestParam Long userId) {
        
        List<TaskAttachment> attachments = taskAttachmentService.getTaskAttachments(taskId, userId);
        return ResponseEntity.ok(attachments);
    }
    
    /**
     * Upload an attachment for a task.
     */
    @PostMapping("/task/{taskId}/upload")
    public ResponseEntity<TaskAttachment> uploadAttachment(
            @PathVariable Long taskId,
            @RequestParam("file") MultipartFile file,
            @RequestParam Long userId) throws IOException {
        
        TaskAttachment attachment = taskAttachmentService.uploadAttachment(taskId, file, userId);
        return ResponseEntity.ok(attachment);
    }
    
    /**
     * Download an attachment.
     */
    @GetMapping("/download/{attachmentId}")
    public ResponseEntity<Resource> downloadAttachment(
            @PathVariable Long attachmentId,
            @RequestParam Long userId) 
            throws MalformedURLException {
        
        TaskAttachment attachment = taskAttachmentService.findById(attachmentId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Attachment not found"));
        
        Path filePath = Paths.get(attachment.getFilePath());
        Resource resource = new UrlResource(filePath.toUri());
        
        if (!resource.exists() || !resource.isReadable()) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Could not read file");
        }
        
        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                .header(HttpHeaders.CONTENT_DISPOSITION, 
                        "attachment; filename=\"" + attachment.getFileName() + "\"")
                .body(resource);
    }
    
    /**
     * Delete an attachment.
     */
    @DeleteMapping("/{attachmentId}")
    public ResponseEntity<Map<String, Object>> deleteAttachment(
            @PathVariable Long attachmentId,
            @RequestParam Long userId) {
        
        boolean deleted = taskAttachmentService.deleteAttachment(attachmentId, userId);
        
        Map<String, Object> response = new HashMap<>();
        response.put("deleted", deleted);
        response.put("message", deleted ? "Attachment deleted successfully" : "Failed to delete attachment");
        
        return ResponseEntity.ok(response);
    }
}