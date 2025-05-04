package com.example.worksphere.service;

import com.example.worksphere.entity.Project;
import com.example.worksphere.entity.ProjectMember;
import com.example.worksphere.entity.User;
import com.example.worksphere.exception.NotFoundException;
import com.example.worksphere.exception.ForbiddenActionException;
import com.example.worksphere.repository.ProjectMemberRepository;
import com.example.worksphere.repository.ProjectRepository;
import com.example.worksphere.repository.UserRepository;
import lombok.RequiredArgsConstructor;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProjectMemberService {

    private final ProjectMemberRepository projectMemberRepository;
    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;

    /**
     * Find a member by project and user IDs
     */
    public Optional<ProjectMember> findMemberByProjectAndUser(Long projectId, Long userId) {
        return projectMemberRepository.findByProjectIdAndUserId(projectId, userId);
    }

    /**
     * Update a member's status and role
     */
    @Transactional
    public ProjectMember updateMemberStatus(Long projectId, Long userId, Long updaterId, 
                                           ProjectMember.Status newStatus, String roleStr) {
        
        // Find the existing member
        ProjectMember member = projectMemberRepository.findByProjectIdAndUserId(projectId, userId)
                .orElseThrow(() -> new NotFoundException("Member not found"));
        
        // Update the status
        member.setStatus(newStatus);
        
        // Convert role string to enum if provided
        if (roleStr != null && !roleStr.isEmpty()) {
            try {
                ProjectMember.Role memberRole = ProjectMember.Role.valueOf(roleStr);
                member.setRole(memberRole);
            } catch (IllegalArgumentException e) {
                // Invalid role, keep existing
            }
        }
        
        // Save the updated member
        return projectMemberRepository.save(member);
    }

    @Transactional
    public ProjectMember updateMemberStatus(Long projectId, Long userId, Long updaterId, 
                                           ProjectMember.Status newStatus, ProjectMember.Role role) {
        
        // Find the existing member
        ProjectMember member = projectMemberRepository.findByProjectIdAndUserId(projectId, userId)
                .orElseThrow(() -> new NotFoundException("Member not found"));
        
        // Update the status
        member.setStatus(newStatus);
        
        // Convert role string to enum if provided
        if (role != null) {
            try {
                member.setRole(role);
            } catch (IllegalArgumentException e) {
                // Invalid role, keep existing
            }
        }
        
        // Save the updated member
        return projectMemberRepository.save(member);
    }

    /**
     * Invite a user to a project.
     * @param projectId The project to invite to
     * @param inviterId The user doing the inviting
     * @param targetUserId The user being invited
     * @param role The role for the invited user
     * @param requestUserId The user making the request (for authorization)
     * @return The created ProjectMember entity
     */
    @Transactional
    public ProjectMember inviteUser(Long projectId, Long inviterId, Long targetUserId, 
                                   ProjectMember.Role role, Long requestUserId) {
        
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new NotFoundException("Project not found"));

        User inviter = userRepository.findById(inviterId)
                .orElseThrow(() -> new NotFoundException("Inviter not found"));

        User targetUser = userRepository.findById(targetUserId)
                .orElseThrow(() -> new NotFoundException("User not found"));

        if (!isProjectManager(project, inviter)) {
            throw new ForbiddenActionException("Only project managers can invite users.");
        }

        // Check if the user was previously a member and has REMOVED or LEFT status
        Optional<ProjectMember> existingMember = findMemberByProjectAndUser(projectId, targetUserId);
        
        if (existingMember.isPresent() && 
            (existingMember.get().getStatus() == ProjectMember.Status.REMOVED || 
             existingMember.get().getStatus() == ProjectMember.Status.LEFT)) {
            
            // Update the existing member's status to INVITED and update the role
            ProjectMember updatedMember = existingMember.get();
            updatedMember.setStatus(ProjectMember.Status.INVITED);
            updatedMember.setRole(role);
            
            return projectMemberRepository.save(updatedMember);
        }

        if (projectMemberRepository.existsByProjectAndUserAndStatusIn(project, targetUser, 
                List.of(ProjectMember.Status.ACTIVE, ProjectMember.Status.INVITED))) {
            throw new ForbiddenActionException("User is already a member or invited.");
        }

        ProjectMember projectMember = ProjectMember.builder()
                .project(project)
                .user(targetUser)
                .role(role)
                .status(ProjectMember.Status.INVITED)
                .build();

        return projectMemberRepository.save(projectMember);
    }

    /**
     * Simplified invite method for controller usage.
     * @param projectId The project ID
     * @param inviterId The inviter's user ID
     * @param targetUserId The ID of the user being invited
     * @param roleStr The role as a string
     * @return The created or updated ProjectMember
     */
    @Transactional
    public ProjectMember inviteUser(Long projectId, Long inviterId, Long targetUserId, String roleStr) {
        // Convert string role to enum
        ProjectMember.Role role;
        try {
            role = ProjectMember.Role.valueOf(roleStr);
        } catch (IllegalArgumentException e) {
            role = ProjectMember.Role.TEAM_MEMBER; // Default role
        }
        
        // Check if the user was previously a member and has REMOVED or LEFT status
        Optional<ProjectMember> existingMember = findMemberByProjectAndUser(projectId, targetUserId);
        
        if (existingMember.isPresent() && 
            (existingMember.get().getStatus() == ProjectMember.Status.REMOVED || 
             existingMember.get().getStatus() == ProjectMember.Status.LEFT)) {
            
            // Update the existing member's status to INVITED and update the role
            ProjectMember updatedMember = existingMember.get();
            updatedMember.setStatus(ProjectMember.Status.INVITED);
            updatedMember.setRole(role);
            
            return projectMemberRepository.save(updatedMember);
        }
        
        // Validate inviter permissions (optional, based on your logic)
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new RuntimeException("Project not found"));

        User inviter = userRepository.findById(inviterId)
                .orElseThrow(() -> new RuntimeException("Inviter not found"));

        User invitee = userRepository.findById(targetUserId)
                .orElseThrow(() -> new RuntimeException("Invitee not found"));

        // Check if they're an active member
        boolean alreadyActiveMember = projectMemberRepository.existsByProjectIdAndUserIdAndStatus(
                projectId, targetUserId, ProjectMember.Status.ACTIVE);
        if (alreadyActiveMember) {
            throw new RuntimeException("User is already an active member of the project");
        }

        ProjectMember member = ProjectMember.builder()
                .project(project)
                .user(invitee)
                .role(role)
                .status(ProjectMember.Status.INVITED)
                .build();

        return projectMemberRepository.save(member);
    }

    /**
     * Accept or decline an invitation.
     * @param projectId The project id
     * @param targetUserId The user responding to the invitation
     * @param accept Whether to accept the invitation
     * @return The updated ProjectMember entity
     */
    @Transactional
    public ProjectMember respondToInvitation(Long projectId, Long targetUserId, boolean accept) {
        // Use the target user's ID as the request user ID
        return respondToInvitation(projectId, targetUserId, accept, targetUserId);
    }
    
    /**
     * Accept or decline an invitation.
     * @param projectId The project id
     * @param targetUserId The user responding to the invitation
     * @param accept Whether to accept the invitation
     * @param requestUserId The user making the request (for authorization)
     * @return The updated ProjectMember entity
     */
    @Transactional
    public ProjectMember respondToInvitation(Long projectId, Long targetUserId, 
                                           boolean accept, Long requestUserId) {
        
        ProjectMember projectMember = projectMemberRepository.findByProjectIdAndUserId(projectId, targetUserId)
                .orElseThrow(() -> new NotFoundException("Invitation not found"));

        if (projectMember.getStatus() != ProjectMember.Status.INVITED) {
            throw new ForbiddenActionException("Invalid action. You can only respond to an invitation.");
        }

        projectMember.setStatus(accept ? ProjectMember.Status.ACTIVE : ProjectMember.Status.REMOVED);
        return projectMemberRepository.save(projectMember);
    }

    /**
     * Remove a member from a project.
     * @param projectId The project id
     * @param targetUserId The user to remove
     * @param removerId The user removing the member
     */
    @Transactional
    public Boolean removeMember(Long projectId, Long targetUserId, Long removerId) {
        // Use the remover's ID as the request user ID
        removeMember(projectId, targetUserId, removerId, removerId);
        return true;
    }
    
    /**
     * Remove a member from a project.
     * @param projectId The project id
     * @param targetUserId The user to remove
     * @param removerId The user removing the member
     * @param requestUserId The user making the request (for authorization)
     */
    @Transactional
    public void removeMember(Long projectId, Long targetUserId, Long removerId, Long requestUserId) {
        // Verify that the request user exists
        User requestUser = getUserOrThrow(requestUserId);
        
        // Verify that the requesting user is the same as the remover
        if (!requestUserId.equals(removerId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, 
                "You can only remove members as yourself");
        }
        
        ProjectMember remover = projectMemberRepository.findByProjectIdAndUserId(projectId, removerId)
                .orElseThrow(() -> new NotFoundException("You are not part of this project."));

        if (remover.getRole() != ProjectMember.Role.PROJECT_MANAGER) {
            throw new ForbiddenActionException("Only project managers can remove members.");
        }

        ProjectMember member = projectMemberRepository.findByProjectIdAndUserId(projectId, targetUserId)
                .orElseThrow(() -> new NotFoundException("User is not a member of this project."));

        if (member.getRole() == ProjectMember.Role.PROJECT_MANAGER) {
            throw new ForbiddenActionException("You cannot remove another project manager.");
        }

        member.setStatus(ProjectMember.Status.REMOVED);
        projectMemberRepository.save(member);
    }

    /**
     * User leaves the project (except if they are the only project manager).
     * @param projectId The project id
     * @param targetUserId The user leaving the project
     */
    @Transactional
    public void leaveProject(Long projectId, Long targetUserId) {
        // Use the target user's ID as the request user ID
        leaveProject(projectId, targetUserId, targetUserId);
    }
    
    /**
     * User leaves the project (except if they are the only project manager).
     * @param projectId The project id
     * @param targetUserId The user leaving the project
     * @param requestUserId The user making the request (for authorization)
     */
    @Transactional
    public void leaveProject(Long projectId, Long targetUserId, Long requestUserId) {
        // Verify that the request user exists
        User requestUser = getUserOrThrow(requestUserId);
        
        // Verify that the requesting user is the same as the target user
        if (!requestUserId.equals(targetUserId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, 
                "You can only leave a project as yourself");
        }
        
        ProjectMember member = projectMemberRepository.findByProjectIdAndUserId(projectId, targetUserId)
                .orElseThrow(() -> new NotFoundException("User is not a member of this project."));

        if (member.getRole() == ProjectMember.Role.PROJECT_MANAGER) {
            long managersCount = projectMemberRepository.countByProjectIdAndRole(projectId, ProjectMember.Role.PROJECT_MANAGER);
            if (managersCount <= 1) {
                throw new ForbiddenActionException("A project must have at least one project manager.");
            }
        }

        member.setStatus(ProjectMember.Status.LEFT);
        projectMemberRepository.save(member);
    }

    /**
     * Get all members of a project.
     * @param projectId The project id
     * @param userId The ID of the user making the request (passed from frontend)
     * @return List of project members
     */
    public List<ProjectMember> getProjectMembers(Long projectId, Long userId) {
        // Verify that the user exists
        User user = getUserOrThrow(userId);
        
        // Verify that the user has access to the project
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new NotFoundException("Project not found"));
        
        boolean isOwner = project.getOwner().getId().equals(userId);
        boolean isMember = isUserProjectMember(userId, projectId);
        
        if (!isOwner && !isMember && project.getVisibility() != Project.Visibility.PUBLIC) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, 
                "You don't have permission to view members of this project");
        }
        
        // Return all members with ACTIVE or INVITED status
        return projectMemberRepository.findAllByProjectIdAndStatusIn(
            projectId, 
            List.of(ProjectMember.Status.ACTIVE, ProjectMember.Status.INVITED)
        );
    }

    /**
     * Add a project member.
     * @param projectMember The project member to add
     * @param requestUserId The user making the request (for authorization)
     * @return The saved ProjectMember entity
     */
    public ProjectMember addProjectMember(ProjectMember projectMember, Long requestUserId) {
        // Verify that the request user exists
        User requestUser = getUserOrThrow(requestUserId);
        
        // Verify that the requesting user is the project owner or a project manager
        Project project = projectMember.getProject();
        boolean isOwner = project.getOwner().getId().equals(requestUserId);
        boolean isManager = isUserProjectManager(requestUserId, project.getId());
        
        if (!isOwner && !isManager) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, 
                "Only project owners or managers can add members");
        }
        
        // Save the ProjectMember entity in the database
        return projectMemberRepository.save(projectMember);
    }
    
    /**
     * Get all projects where user is a member with ACTIVE status.
     * @param targetUserId The user whose projects to get
     * @param requestUserId The user making the request (for authorization)
     * @return List of projects
     */
    public List<Project> getProjectsByMemberId(Long targetUserId, Long requestUserId) {
        // unless they're an admin (which would need additional logic)
        if (!requestUserId.equals(targetUserId)) {
            // Return only public projects where the target user is a member
            return projectMemberRepository.findByUserIdAndStatus(targetUserId, ProjectMember.Status.ACTIVE)
                    .stream()
                    .map(ProjectMember::getProject)
                    .filter(project -> project.getVisibility() == Project.Visibility.PUBLIC)
                    .collect(Collectors.toList());
        }
        
        // If requesting their own projects, return all
        return projectMemberRepository.findByUserIdAndStatus(targetUserId, ProjectMember.Status.ACTIVE)
                .stream()
                .map(ProjectMember::getProject)
                .collect(Collectors.toList());
    }
    
    /**
     * Get all projects where user is a member with specific role and ACTIVE status.
     * @param targetUserId The user whose projects to get
     * @param role The role to filter by
     * @param requestUserId The user making the request (for authorization)
     * @return List of projects
     */
    public List<Project> getProjectsByMemberIdAndRole(Long targetUserId, 
                                                    ProjectMember.Role role, Long requestUserId) {

        // unless they're an admin (which would need additional logic)
        if (!requestUserId.equals(targetUserId)) {
            // Return only public projects where the target user is a member with the specified role
            return projectMemberRepository.findByUserIdAndRoleAndStatus(
                    targetUserId, role, ProjectMember.Status.ACTIVE)
                    .stream()
                    .map(ProjectMember::getProject)
                    .filter(project -> project.getVisibility() == Project.Visibility.PUBLIC)
                    .collect(Collectors.toList());
        }
        
        // If requesting their own projects, return all
        return projectMemberRepository.findByUserIdAndRoleAndStatus(
                targetUserId, role, ProjectMember.Status.ACTIVE)
                .stream()
                .map(ProjectMember::getProject)
                .collect(Collectors.toList());
    }
    
    /**
     * Get a specific project membership.
     * @param projectId The project id
     * @param targetUserId The user id
     * @param requestUserId The user making the request (for authorization)
     * @return Optional ProjectMember
     */
    public Optional<ProjectMember> getProjectMembership(Long projectId, Long targetUserId, Long requestUserId) {
        if (!requestUserId.equals(targetUserId)) {
            Project project = projectRepository.findById(projectId)
                    .orElseThrow(() -> new NotFoundException("Project not found"));
            
            boolean isOwner = project.getOwner().getId().equals(requestUserId);
            boolean isManager = isUserProjectManager(requestUserId, projectId);
            
            if (!isOwner && !isManager) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, 
                    "You don't have permission to view this membership");
            }
        }
        
        return projectMemberRepository.findByProjectIdAndUserId(projectId, targetUserId);
    }
    
    /**
     * Get all users who are members of a project with ACTIVE status.
     * @param projectId The project id
     * @param requestUserId The user making the request (for authorization)
     * @return List of users
     */
    public List<User> getActiveProjectMembers(Long projectId, Long requestUserId) {     
        // Verify that the requesting user has access to the project
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new NotFoundException("Project not found"));
        
        boolean isOwner = project.getOwner().getId().equals(requestUserId);
        boolean isMember = isUserProjectMember(requestUserId, projectId);
        
        if (!isOwner && !isMember && project.getVisibility() != Project.Visibility.PUBLIC) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, 
                "You don't have permission to view members of this project");
        }
        
        return projectMemberRepository.findByProjectIdAndStatus(projectId, ProjectMember.Status.ACTIVE)
                .stream()
                .map(ProjectMember::getUser)
                .collect(Collectors.toList());
    }
    
    /**
     * Check if a user is a project manager.
     * @param project The project
     * @param user The user
     * @return True if the user is a project manager
     */
    private boolean isProjectManager(Project project, User user) {
        return projectMemberRepository.existsByProjectAndUserAndRole(
            project, user, ProjectMember.Role.PROJECT_MANAGER);
    }
    
    /**
     * Check if a user is a member of a project.
     * @param userId The user id
     * @param projectId The project id
     * @return True if the user is a member
     */
    public boolean isUserProjectMember(Long userId, Long projectId) {
        return projectMemberRepository.existsByProjectIdAndUserIdAndStatus(
            projectId, userId, ProjectMember.Status.ACTIVE);
    }
    
    /**
     * Check if a user is a project manager of a project.
     * @param userId The user id
     * @param projectId The project id
     * @return True if the user is a project manager
     */
    public boolean isUserProjectManager(Long userId, Long projectId) {
        return projectMemberRepository.existsByProjectIdAndUserIdAndRoleAndStatus(
            projectId, userId, ProjectMember.Role.PROJECT_MANAGER, ProjectMember.Status.ACTIVE);
    }
    
    /**
     * Helper method to get user or throw exception
     */
    private User getUserOrThrow(Long userId) {
        return userRepository.findById(userId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
    }
}