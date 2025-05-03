package com.example.worksphere.repository;

import com.example.worksphere.entity.KanbanBoard;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface KanbanBoardRepository extends JpaRepository<KanbanBoard, Long> {
    
    /**
     * Find all kanban boards for a project
     */
    List<KanbanBoard> findByProjectId(Long projectId);
    Optional<KanbanBoard> findFirstByProjectId(Long projectId); // for simplicity

}