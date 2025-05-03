package com.example.worksphere.repository;

import com.example.worksphere.entity.KanbanColumn;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface KanbanColumnRepository extends JpaRepository<KanbanColumn, Long> {
    
    List<KanbanColumn> findByBoardId(Long kanbanBoardId);
    
    List<KanbanColumn> findByBoardIdOrderByPosition(Long kanbanBoardId);
    
    Long countByBoardId(Long kanbanBoardId);
    
    void deleteByBoardId(Long kanbanBoardId);
    
    List<KanbanColumn> findByBoardIdAndPositionGreaterThan(Long kanbanBoardId, Integer position);
    
}