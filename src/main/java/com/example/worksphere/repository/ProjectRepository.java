package com.example.worksphere.repository;

import com.example.worksphere.entity.Project;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProjectRepository extends JpaRepository<Project, Long> {
    List<Project> findByOwnerId(Long ownerId); // Fetch projects by user ID
    List<Project> findByOwnerIdAndVisibility(Long ownerId, Project.Visibility visibility);
}
