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

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ProjectMemberService {

    private final ProjectMemberRepository projectMemberRepository;
    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;

    /* Invite a user to a project. */
    @Transactional
    public ProjectMember inviteUser(Long projectId, Long inviterId, Long userId, ProjectMember.Role role) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new NotFoundException("Project not found"));

        User inviter = userRepository.findById(inviterId)
                .orElseThrow(() -> new NotFoundException("Inviter not found"));

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new NotFoundException("User not found"));

        if (!isProjectManager(project, inviter)) {
            throw new ForbiddenActionException("Only project managers can invite users.");
        }

        if (projectMemberRepository.existsByProjectAndUserAndStatusIn(project, user, List.of(ProjectMember.Status.ACTIVE, ProjectMember.Status.INVITED))) {
            throw new ForbiddenActionException("User is already a member or invited.");
        }

        ProjectMember projectMember = ProjectMember.builder()
                .project(project)
                .user(user)
                .role(role)
                .status(ProjectMember.Status.INVITED)
                .build();

        return projectMemberRepository.save(projectMember);
    }

    /* Accept or decline an invitation. */
    @Transactional
    public ProjectMember respondToInvitation(Long projectId, Long userId, boolean accept) {
        ProjectMember projectMember = projectMemberRepository.findByProjectIdAndUserId(projectId, userId)
                .orElseThrow(() -> new NotFoundException("Invitation not found"));

        if (projectMember.getStatus() != ProjectMember.Status.INVITED) {
            throw new ForbiddenActionException("Invalid action. You can only respond to an invitation.");
        }

        projectMember.setStatus(accept ? ProjectMember.Status.ACTIVE : ProjectMember.Status.REMOVED);
        return projectMemberRepository.save(projectMember);
    }

    /**
     * Remove a member from a project.
     */
    @Transactional
    public void removeMember(Long projectId, Long userId, Long removerId) {
        ProjectMember remover = projectMemberRepository.findByProjectIdAndUserId(projectId, removerId)
                .orElseThrow(() -> new NotFoundException("You are not part of this project."));

        if (remover.getRole() != ProjectMember.Role.project_manager) {
            throw new ForbiddenActionException("Only project managers can remove members.");
        }

        ProjectMember member = projectMemberRepository.findByProjectIdAndUserId(projectId, userId)
                .orElseThrow(() -> new NotFoundException("User is not a member of this project."));

        if (member.getRole() == ProjectMember.Role.project_manager) {
            throw new ForbiddenActionException("You cannot remove another project manager.");
        }

        member.setStatus(ProjectMember.Status.REMOVED);
        projectMemberRepository.save(member);
    }

    /* User leaves the project (except if they are the only project manager). */
    @Transactional
    public void leaveProject(Long projectId, Long userId) {
        ProjectMember member = projectMemberRepository.findByProjectIdAndUserId(projectId, userId)
                .orElseThrow(() -> new NotFoundException("User is not a member of this project."));

        if (member.getRole() == ProjectMember.Role.project_manager) {
            long managersCount = projectMemberRepository.countByProjectIdAndRole(projectId, ProjectMember.Role.project_manager);
            if (managersCount <= 1) {
                throw new ForbiddenActionException("A project must have at least one project manager.");
            }
        }

        member.setStatus(ProjectMember.Status.LEFT);
        projectMemberRepository.save(member);
    }

    /* Get all members of a project. */
    public List<ProjectMember> getProjectMembers(Long projectId) {
        return projectMemberRepository.findByProjectId(projectId);
    }

    /* Check if a user is a project manager.*/
    private boolean isProjectManager(Project project, User user) {
        return projectMemberRepository.existsByProjectAndUserAndRole(project, user, ProjectMember.Role.project_manager);
    }

    public ProjectMember addProjectMember(ProjectMember projectMember) {
        // Save the ProjectMember entity in the database
        return projectMemberRepository.save(projectMember);
    }
}
