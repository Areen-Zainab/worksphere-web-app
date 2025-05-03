package com.example.worksphere.controller;

import com.example.worksphere.dto.KanbanBoardDTO;
import com.example.worksphere.dto.KanbanColumnDTO;
import com.example.worksphere.dto.KanbanColumnOrderDTO;
import com.example.worksphere.dto.KanbanTaskDTO;
import com.example.worksphere.service.KanbanBoardService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@CrossOrigin(origins = "http://localhost:3000") 
@RequestMapping("/api/kanban")
public class KanbanBoardController {

    @Autowired
    private KanbanBoardService kanbanBoardService;

    /* ============== PROJECT-SPECIFIC KANBAN OPERATIONS ============== */
    
    /**
     * Get all kanban columns for a specific project
     */
    @GetMapping("/project/{projectId}")
    public ResponseEntity<List<KanbanColumnDTO>> getKanbanColumnsByProjectId(
            @PathVariable Long projectId,
            @RequestParam Long userId) {
        return ResponseEntity.ok(kanbanBoardService.getColumnsByProjectId(projectId, userId));
    }
    
    /**
     * Create a new kanban column for a project
     */
    @PostMapping("/project/{projectId}")
    public ResponseEntity<KanbanColumnDTO> createKanbanColumnForProject(
            @PathVariable Long projectId,
            @RequestParam Long userId) {
        return new ResponseEntity<>(kanbanBoardService.createKanbanColumnForProject(projectId, userId), HttpStatus.CREATED);
    }

    /* ============== KANBAN BOARD OPERATIONS ============== */

    /**
     * Get a kanban board by id
     */
    @GetMapping("/board/{id}")
    public ResponseEntity<KanbanBoardDTO> getKanbanBoardById(
            @PathVariable Long id,
            @RequestParam Long userId) {
        return ResponseEntity.ok(kanbanBoardService.getKanbanBoardById(id, userId));
    }

    /* ============== KANBAN COLUMN OPERATIONS ============== */
    
    /**
     * Get all columns for a kanban board
     */
    @GetMapping("/board/{boardId}/columns")
    public ResponseEntity<List<KanbanColumnDTO>> getColumnsByBoardId(
            @PathVariable Long boardId,
            @RequestParam Long userId) {
        return ResponseEntity.ok(kanbanBoardService.getColumnsByBoardId(boardId, userId));
    }
    
    /**
     * Create a new column in a kanban board
     */
    @PostMapping("/board/{boardId}/column")
    public ResponseEntity<KanbanColumnDTO> createKanbanColumn(
            @PathVariable Long boardId,
            @RequestBody KanbanColumnDTO columnDTO,
            @RequestParam Long userId) {
        return new ResponseEntity<>(kanbanBoardService.createKanbanColumn(boardId, columnDTO, userId), HttpStatus.CREATED);
    }
    
    /**
     * Update a column's title
     */
    @PutMapping("/column/{columnId}")
    public ResponseEntity<KanbanColumnDTO> updateColumnTitle(
            @PathVariable Long columnId,
            @RequestBody Map<String, String> titleData,
            @RequestParam Long userId) {
        
        String title = titleData.get("title");
        return ResponseEntity.ok(kanbanBoardService.updateColumnTitle(columnId, title, userId));
    }
    
    /**
     * Delete a column from a kanban board
     */
    @DeleteMapping("/column/{columnId}")
    public ResponseEntity<Void> deleteKanbanColumn(
            @PathVariable Long columnId,
            @RequestParam Long userId) {
        kanbanBoardService.deleteKanbanColumn(columnId, userId);
        return ResponseEntity.noContent().build();
    }
    
    /**
     * Update column order (for drag and drop of columns)
     */
    @PutMapping("/board/{boardId}/columns/order")
    public ResponseEntity<KanbanBoardDTO> updateColumnOrder(
            @PathVariable Long boardId,
            @RequestBody KanbanColumnOrderDTO orderDTO,
            @RequestParam Long userId) {
        return ResponseEntity.ok(kanbanBoardService.updateColumnOrder(boardId, orderDTO.getColumnOrder(), userId));
    }

    /* ============== KANBAN TASK OPERATIONS ============== */

    /**
     * Add a task to a kanban column
     */
    @PostMapping("/column/{columnId}/task/{taskId}")
    public ResponseEntity<KanbanTaskDTO> addTaskToColumn(
            @PathVariable Long columnId,
            @PathVariable Long taskId,
            @RequestParam(required = false) Integer position,
            @RequestParam Long userId) {
        return ResponseEntity.ok(kanbanBoardService.addTaskToColumn(columnId, taskId, position, userId));
    }

    /**
     * Remove a task from a kanban board
     */
    @DeleteMapping("/task/{kanbanTaskId}")
    public ResponseEntity<Void> removeKanbanTask(
            @PathVariable Long kanbanTaskId,
            @RequestParam Long userId) {
        kanbanBoardService.removeKanbanTask(kanbanTaskId, userId);
        return ResponseEntity.noContent().build();
    }

    /**
     * Move a task to a different column or change its position
     */
    @PutMapping("/task/{kanbanTaskId}/position")
    public ResponseEntity<KanbanTaskDTO> updateTaskPosition(
            @PathVariable Long kanbanTaskId,
            @RequestBody Map<String, Object> positionData,
            @RequestParam Long userId) {
        
        Long columnId = Long.valueOf(String.valueOf(positionData.get("columnId")));
        Integer position = (Integer) positionData.get("position");
        
        return ResponseEntity.ok(kanbanBoardService.updateTaskPosition(kanbanTaskId, columnId, position, userId));
    }

    /**
     * Get all tasks in a kanban board
     */
    @GetMapping("/board/{boardId}/tasks")
    public ResponseEntity<List<KanbanTaskDTO>> getTasksByBoardId(
            @PathVariable Long boardId,
            @RequestParam Long userId) {
        return ResponseEntity.ok(kanbanBoardService.getTasksByBoardId(boardId, userId));
    }

    /**
 * Get all columns with their tasks for a kanban board
 */
    @GetMapping("/board/{boardId}/columns-with-tasks")
    public ResponseEntity<List<KanbanColumnDTO>> getColumnsWithTasksByBoardId(
            @PathVariable Long boardId,
            @RequestParam Long userId) {
        return ResponseEntity.ok(kanbanBoardService.getColumnsWithTasksByBoardId(boardId, userId));
    }
}