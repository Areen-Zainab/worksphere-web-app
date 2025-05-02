package com.example.worksphere.dto;

import lombok.Data;
import java.time.LocalDate;

import com.example.worksphere.entity.Project;

@Data
public class ProjectDTO {
    private String name;
    private String description;
    private Long ownerId;  // Accept owner ID instead of the User object
    private Project.Status status = Project.Status.in_progress;
    private Project.Visibility visibility;
    private int progress;
    private LocalDate startDate;
    private LocalDate endDate;
}
