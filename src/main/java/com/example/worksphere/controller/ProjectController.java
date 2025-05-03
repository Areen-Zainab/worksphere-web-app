// Updated ProjectController.java
package com.example.worksphere.controller;

import com.example.worksphere.dto.ProjectDTO;
import com.example.worksphere.entity.Project;
import com.example.worksphere.entity.User;
import com.example.worksphere.entity.ProjectMember;
import com.example.worksphere.service.ProjectMemberService;
import com.example.worksphere.service.ProjectService;
import com.example.worksphere.service.UserService;

import java.util.stream.Stream;
import java.util.stream.Collectors;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/projects")
public class ProjectController {

    private final ProjectService projectService;
    private final UserService userService;
    private final ProjectMemberService projectMemberService;

    public ProjectController(ProjectService projectService, UserService userService, ProjectMemberService projectMemberService) {
        this.projectService = projectService;
        this.userService = userService;
        this.projectMemberService = projectMemberService;
    }

    @GetMapping
    public List<Project> getAllProjects(@RequestParam Long userId) {
        return projectService.getAllProjects(userId);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProjectDTO> getProjectById(@PathVariable Long id, @RequestParam Long userId) {
        Optional<Project> project = projectService.getProjectById(id, userId);
        return project.map(p -> ResponseEntity.ok(p.toDTO())) 
                      .orElseGet(() -> ResponseEntity.notFound().build());
    }    

    @GetMapping("/owner/{ownerId}")
    public List<Project> getProjectsByOwner(@PathVariable Long ownerId, @RequestParam Long userId) {
        return projectService.getProjectsByOwner(ownerId, userId);
    }
    
    /**
     * Get all projects a user is a member of (regardless of role)
     */
    @GetMapping("/member/{memberId}")
    public List<Project> getProjectsByMembership(@PathVariable Long memberId, @RequestParam Long userId) {
        return projectMemberService.getProjectsByMemberId(memberId, userId);
    }
    
    /**
     * Get all projects a user is a member of with a specific role
     */
    @GetMapping("/member/{memberId}/role/{role}")
    public List<Project> getProjectsByMembershipAndRole(
            @PathVariable Long memberId,
            @PathVariable ProjectMember.Role role,
            @RequestParam Long userId) {
        return projectMemberService.getProjectsByMemberIdAndRole(memberId, role, userId);
    }
    
    /**
     * Get all projects a user is associated with (both as owner and member)
     */
    @GetMapping("/user/{targetUserId}")
    public List<Project> getAllUserProjects(@PathVariable Long targetUserId, @RequestParam Long userId) {
        // Get projects owned by the user
        List<Project> ownedProjects = projectService.getProjectsByOwner(targetUserId, userId);
        
        // Get projects where the user is a member
        List<Project> memberProjects = projectMemberService.getProjectsByMemberId(targetUserId, userId);
        
        // Combine the lists and remove duplicates (in case user is both owner and member)
        return Stream.concat(ownedProjects.stream(), memberProjects.stream())
                .distinct()
                .collect(Collectors.toList());
    }

    @PostMapping
    public ResponseEntity<Project> createProject(@RequestBody ProjectDTO projectDTO, @RequestParam Long userId) {
        Project createdProject = projectService.createProject(projectDTO, userId);
        User owner = userService.getUserById(projectDTO.getOwnerId())
            .orElseThrow(() -> new RuntimeException("User not found"));

        // Create a new ProjectMember with the owner as project_manager
        ProjectMember projectMember = ProjectMember.builder()
                .project(createdProject)
                .user(owner)
                .role(ProjectMember.Role.PROJECT_MANAGER)
                .status(ProjectMember.Status.ACTIVE)
                .build();

        // Save the project member to the repository
        projectMemberService.addProjectMember(projectMember, userId);
        return ResponseEntity.ok(createdProject);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Project> updateProject(
            @PathVariable Long id, 
            @RequestBody ProjectDTO projectDTO,
            @RequestParam Long userId) {
        try {
            Project updatedProject = projectService.updateProject(id, projectDTO, userId);
            return ResponseEntity.ok(updatedProject);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProject(@PathVariable Long id, @RequestParam Long userId) {
        projectService.deleteProject(id, userId);
        return ResponseEntity.noContent().build();
    }
}
