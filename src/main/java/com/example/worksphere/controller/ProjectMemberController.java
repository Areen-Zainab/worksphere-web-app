package com.example.worksphere.controller;

import com.example.worksphere.dto.InviteRequest;
import com.example.worksphere.entity.ProjectMember;
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

    /**
     * Invite a user to the project.
     */
    @PostMapping("/invite")
    public ResponseEntity<ProjectMember> inviteUser(
            @PathVariable Long projectId,                      // projectId comes from the URL
            @RequestBody InviteRequest inviteRequest) {        // inviteRequest comes from the request body

        // Assuming projectMemberService has a method to invite a user
        ProjectMember member = projectMemberService.inviteUser(
                projectId,
                inviteRequest.getInviterId(),
                inviteRequest.getUserId(),
                inviteRequest.getRole()
        );

        return ResponseEntity.ok(member);   // Return the ProjectMember object in the response
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
     */
    @GetMapping
    public ResponseEntity<List<ProjectMember>> getProjectMembers(@PathVariable Long projectId) {
        List<ProjectMember> members = projectMemberService.getProjectMembers(projectId);
        return ResponseEntity.ok(members);
    }
}
