package com.example.worksphere.service;

import com.example.worksphere.dto.ProjectDTO;
import com.example.worksphere.entity.Project;
import com.example.worksphere.entity.User;
import com.example.worksphere.repository.ProjectRepository;
import com.example.worksphere.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;

import java.util.List;
import java.util.Optional;

@Service
public class ProjectService {

    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;
    private final ProjectMemberService projectMemberService;  // Add this service

    public ProjectService(
            ProjectRepository projectRepository, 
            UserRepository userRepository,
            ProjectMemberService projectMemberService) {  // Update constructor
        this.projectRepository = projectRepository;
        this.userRepository = userRepository;
        this.projectMemberService = projectMemberService;
    }

    public List<Project> getAllProjects(Long userId) {
        return projectRepository.findAll();
    }

    public Optional<Project> getProjectById(Long id, Long userId) {
        User user = getUserOrThrow(userId);
        Optional<Project> projectOpt = projectRepository.findById(id);
        
        if (projectOpt.isPresent()) {
            Project project = projectOpt.get();
            
            // Check if user is owner or member of the project
            boolean isOwner = project.getOwner().getId().equals(userId);
            boolean isMember = projectMemberService.isUserProjectMember(userId, id);
            
            if (isOwner || isMember || project.getVisibility() == Project.Visibility.PUBLIC) {
                return projectOpt;
            } else {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, 
                    "You don't have permission to view this project");
            }
        }
        
        return projectOpt;
    }

    public List<Project> getProjectsByOwner(Long ownerId, Long userId) {
        User user = getUserOrThrow(userId);
        
        // Check if the requesting user is the owner or has admin privileges
        if (userId.equals(ownerId)) {
            return projectRepository.findByOwnerId(ownerId);
        } else {
            // Return only public projects owned by the specified owner
            // Or implement more complex permission logic here
            return projectRepository.findByOwnerIdAndVisibility(ownerId, Project.Visibility.PUBLIC);
        }
    }

    public Project createProject(ProjectDTO projectDTO, Long userId) {
        // Verify that the user exists
        User user = getUserOrThrow(userId);
        
        // Verify that the requesting user is the same as the owner or has admin privileges
        if (!userId.equals(projectDTO.getOwnerId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, 
                "You can only create projects for yourself");
        }
        
        User owner = userRepository.findById(projectDTO.getOwnerId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        Project project = Project.builder()
                .name(projectDTO.getName())
                .description(projectDTO.getDescription())
                .owner(owner)
                .status(projectDTO.getStatus())
                .visibility(projectDTO.getVisibility())
                .progress(projectDTO.getProgress())
                .startDate(projectDTO.getStartDate())
                .endDate(projectDTO.getEndDate())
                .build();

        return projectRepository.save(project);
    }

    public Project updateProject(Long id, ProjectDTO projectDTO, Long userId) {
        User user = getUserOrThrow(userId);
        
        return projectRepository.findById(id)
                .map(existingProject -> {
                    // Check if user is the project owner or a project manager
                    boolean isOwner = existingProject.getOwner().getId().equals(userId);
                    boolean isManager = projectMemberService.isUserProjectManager(userId, id);
                    
                    if (!isOwner && !isManager) {
                        throw new ResponseStatusException(HttpStatus.FORBIDDEN, 
                            "You don't have permission to update this project");
                    }
                    
                    User owner = userRepository.findById(projectDTO.getOwnerId())
                            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

                    // Additional permission check: only the current owner can change ownership
                    if (!existingProject.getOwner().getId().equals(owner.getId()) && !isOwner) {
                        throw new ResponseStatusException(HttpStatus.FORBIDDEN, 
                            "Only the current project owner can transfer ownership");
                    }
                    
                    existingProject.setName(projectDTO.getName());
                    existingProject.setDescription(projectDTO.getDescription());
                    existingProject.setOwner(owner);
                    existingProject.setStatus(projectDTO.getStatus());
                    existingProject.setVisibility(projectDTO.getVisibility());
                    existingProject.setProgress(projectDTO.getProgress());
                    existingProject.setStartDate(projectDTO.getStartDate());
                    existingProject.setEndDate(projectDTO.getEndDate());

                    return projectRepository.save(existingProject);
                })
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Project not found"));
    }

    public void deleteProject(Long id, Long userId) {
        Project project = projectRepository.findById(id)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Project not found"));
        
        // Check if user is the project owner or has admin privileges
        if (!project.getOwner().getId().equals(userId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, 
                "Only the project owner can delete this project");
        }
        
        projectRepository.deleteById(id);
    }
    
    // Helper method to get user or throw exception
    private User getUserOrThrow(Long userId) {
        return userRepository.findById(userId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
    }
}