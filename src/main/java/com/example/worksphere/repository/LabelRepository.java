package com.example.worksphere.repository;

import com.example.worksphere.entity.Label;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface LabelRepository extends JpaRepository<Label, Long> {
    // Basic CRUD operations are inherited from JpaRepository
    
    // Find label by name
    Optional<Label> findByName(String name);
    
    // Find label by name (case insensitive)
    Optional<Label> findByNameIgnoreCase(String name);
    
    // Find labels containing specific text
    List<Label> findByNameContainingIgnoreCase(String text);
    
    // Find labels by color
    List<Label> findByColor(String color);
    
    // Find labels by task
    List<Label> findByTaskId(Long taskId);
}