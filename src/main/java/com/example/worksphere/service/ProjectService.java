package com.example.worksphere.service;

import com.example.worksphere.dto.ProjectDTO;
import com.example.worksphere.entity.Project;
import com.example.worksphere.entity.User;
import com.example.worksphere.repository.ProjectRepository;
import com.example.worksphere.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class ProjectService {

    private final ProjectRepository projectRepository;
    private final UserRepository userRepository; // Needed to fetch User by ownerId

    public ProjectService(ProjectRepository projectRepository, UserRepository userRepository) {
        this.projectRepository = projectRepository;
        this.userRepository = userRepository;
    }

    public List<Project> getAllProjects() {
        return projectRepository.findAll();
    }

    public Optional<Project> getProjectById(Long id) {
        return projectRepository.findById(id);
    }

    public List<Project> getProjectsByOwner(Long ownerId) {
        return projectRepository.findByOwnerId(ownerId);
    }

    public Project createProject(ProjectDTO projectDTO) {
        User owner = userRepository.findById(projectDTO.getOwnerId())
                .orElseThrow(() -> new RuntimeException("User not found"));

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

    public Project updateProject(Long id, ProjectDTO projectDTO) {
        return projectRepository.findById(id)
                .map(existingProject -> {
                    User owner = userRepository.findById(projectDTO.getOwnerId())
                            .orElseThrow(() -> new RuntimeException("User not found"));

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
                .orElseThrow(() -> new RuntimeException("Project not found"));
    }

    public void deleteProject(Long id) {
        projectRepository.deleteById(id);
    }
}
