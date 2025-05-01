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
    public List<Project> getAllProjects() {
        return projectService.getAllProjects();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Project> getProjectById(@PathVariable Long id) {
        Optional<Project> project = projectService.getProjectById(id);
        return project.map(ResponseEntity::ok)
                      .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @GetMapping("/owner/{ownerId}")
    public List<Project> getProjectsByOwner(@PathVariable Long ownerId) {
        return projectService.getProjectsByOwner(ownerId);
    }
    
    /**
     * Get all projects a user is a member of (regardless of role)
     */
    @GetMapping("/member/{userId}")
    public List<Project> getProjectsByMembership(@PathVariable Long userId) {
        return projectMemberService.getProjectsByMemberId(userId);
    }
    
    /**
     * Get all projects a user is a member of with a specific role
     */
    @GetMapping("/member/{userId}/role/{role}")
    public List<Project> getProjectsByMembershipAndRole(
            @PathVariable Long userId,
            @PathVariable ProjectMember.Role role) {
        return projectMemberService.getProjectsByMemberIdAndRole(userId, role);
    }
    
    /**
     * Get all projects a user is associated with (both as owner and member)
     */
    @GetMapping("/user/{userId}")
    public List<Project> getAllUserProjects(@PathVariable Long userId) {
        // Get projects owned by the user
        List<Project> ownedProjects = projectService.getProjectsByOwner(userId);
        
        // Get projects where the user is a member
        List<Project> memberProjects = projectMemberService.getProjectsByMemberId(userId);
        
        // Combine the lists and remove duplicates (in case user is both owner and member)
        return Stream.concat(ownedProjects.stream(), memberProjects.stream())
                .distinct()
                .collect(Collectors.toList());
    }

    @PostMapping
    public ResponseEntity<Project> createProject(@RequestBody ProjectDTO projectDTO) {
        Project createdProject = projectService.createProject(projectDTO);
        User owner = userService.getUserById(projectDTO.getOwnerId())  // Assuming a UserService to get the User entity
            .orElseThrow(() -> new RuntimeException("User not found"));

    // Step 4: Create a new ProjectMember with the owner as project_manager
    ProjectMember projectMember = ProjectMember.builder()
            .project(createdProject)
            .user(owner)
            .role(ProjectMember.Role.PROJECT_MANAGER)  // Set the owner as project_manager
            .status(ProjectMember.Status.ACTIVE)
            .build();

        // Step 5: Save the project member to the repository
        projectMemberService.addProjectMember(projectMember);
        return ResponseEntity.ok(createdProject);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Project> updateProject(@PathVariable Long id, @RequestBody ProjectDTO projectDTO) {
        try {
            Project updatedProject = projectService.updateProject(id, projectDTO);
            return ResponseEntity.ok(updatedProject);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProject(@PathVariable Long id) {
        projectService.deleteProject(id);
        return ResponseEntity.noContent().build();
    }
}