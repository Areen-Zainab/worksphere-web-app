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
import java.util.Map;
import java.util.Optional;

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

        // Check if the user was previously a member and has REMOVED or LEFT status
        Optional<ProjectMember> existingMember = projectMemberService
                .findMemberByProjectAndUser(projectId, user.getId());
        
        if (existingMember.isPresent() && 
            (existingMember.get().getStatus() == ProjectMember.Status.REMOVED || 
            existingMember.get().getStatus() == ProjectMember.Status.LEFT)) {
            
            // Update the existing member's status to INVITED and update the role
            ProjectMember updatedMember = projectMemberService.updateMemberStatus(
                    projectId,
                    user.getId(),
                    inviteRequest.getInviterId(),
                    ProjectMember.Status.INVITED,
                    inviteRequest.getRole()
            );
            
            return ResponseEntity.ok(updatedMember);
        }
        
        // If the user was never a member or has another status, proceed with the regular invitation
        ProjectMember member = projectMemberService.inviteUser(
                projectId,
                inviteRequest.getInviterId(),
                user.getId(),
                inviteRequest.getRole().toString()
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
    public ResponseEntity<Map<String, Boolean>> removeMember(
            @PathVariable Long projectId,
            @PathVariable Long userId,
            @RequestParam Long removerId) {
        boolean deleted = projectMemberService.removeMember(projectId, userId, removerId);
        Map<String, Boolean> response = Map.of("deleted", deleted);
        return ResponseEntity.ok(response);
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