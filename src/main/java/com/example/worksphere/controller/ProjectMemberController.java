package com.example.worksphere.controller;

import com.example.worksphere.dto.InviteRequest;
import com.example.worksphere.entity.ProjectMember;
import com.example.worksphere.entity.User;
import com.example.worksphere.repository.UserRepository;
import com.example.worksphere.service.ProjectMemberService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/projects/{projectId}/members")
@RequiredArgsConstructor
public class ProjectMemberController {
    
    private final ProjectMemberService projectMemberService;
    private final UserRepository userRepository;
    
/**
 * Invite a user to the project by their email.
 */
    @PostMapping("/invite")
    public ResponseEntity<ProjectMember> inviteUser(
            @PathVariable Long projectId,
            @RequestBody InviteRequest inviteRequest) {
        
        // Get the user ID from the email using UserRepository
        User user = userRepository.findByEmail(inviteRequest.getUserEmail())
                          .orElseThrow(() -> new RuntimeException("User not found"));

        
        // Now that we have the user ID, invite the user to the project
        ProjectMember member = projectMemberService.inviteUser(
                projectId,
                inviteRequest.getInviterId(),
                user.getId(),
                inviteRequest.getRole()
        );
        
        return ResponseEntity.ok(member);
    }
    
    /**
     * Accept or decline an invitation.
     */
    @PostMapping("/respond")
    public ResponseEntity<ProjectMember> respondToInvitation(
            @PathVariable Long projectId,
            @RequestParam Long userId,
            @RequestParam boolean accept) {
        ProjectMember member = projectMemberService.respondToInvitation(projectId, userId, accept);
        return ResponseEntity.ok(member);
    }
    
    /**
     * Remove a member from the project.
     */
    @DeleteMapping("/remove/{userId}")
    public ResponseEntity<Void> removeMember(
            @PathVariable Long projectId,
            @PathVariable Long userId,
            @RequestParam Long removerId) {
        projectMemberService.removeMember(projectId, userId, removerId);
        return ResponseEntity.noContent().build();
    }
    
    /**
     * Leave the project.
     */
    @DeleteMapping("/leave")
    public ResponseEntity<Void> leaveProject(
            @PathVariable Long projectId,
            @RequestParam Long userId) {
        projectMemberService.leaveProject(projectId, userId);
        return ResponseEntity.noContent().build();
    }
    
    /**
     * Get all members of a project.
     * Requires userId as a query parameter for authorization
     */
    @GetMapping
    public ResponseEntity<List<ProjectMember>> getProjectMembers(
            @PathVariable Long projectId,
            @RequestParam Long userId) {
        List<ProjectMember> members = projectMemberService.getProjectMembers(projectId, userId);
        return ResponseEntity.ok(members);
    }
}