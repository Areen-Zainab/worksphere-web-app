package com.example.worksphere.repository;

import com.example.worksphere.entity.KanbanTask;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface KanbanTaskRepository extends JpaRepository<KanbanTask, Long> {
    
    List<KanbanTask> findByKanbanColumnIdOrderByPosition(Long columnId);
    
    List<KanbanTask> findByKanbanColumnIdAndPositionGreaterThan(Long columnId, Integer position);
    
    List<KanbanTask> findByKanbanColumnIdAndPositionGreaterThanEqual(Long columnId, Integer position);
    
    List<KanbanTask> findByKanbanColumnIdAndPositionBetween(Long columnId, Integer startPosition, Integer endPosition);
    
    Long countByKanbanColumnId(Long columnId);
    
    @Query("SELECT CASE WHEN COUNT(kt) > 0 THEN true ELSE false END FROM KanbanTask kt WHERE kt.task.id = :taskId AND kt.kanbanColumn.board.id = :boardId")
    boolean existsByTaskIdAndKanbanColumnBoardId(@Param("taskId") Long taskId, @Param("boardId") Long boardId);
}