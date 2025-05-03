package com.example.worksphere.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Data Transfer Object (DTO) for a Kanban Board column.
 * Represents a single column within a Kanban board, with a title, tasks, and timestamps.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class KanbanBoardDTO {

    private Long id;               // Unique identifier for the Kanban Column
    private Long projectId;        // The associated project ID
    private LocalDateTime createdAt; // Timestamp when the column was created
    private LocalDateTime updatedAt; // Timestamp when the column was last updated

    /**
     * List of tasks within this Kanban column.
     */
    private List<KanbanColumnDTO> kanbanColumns;  // List of tasks in this column
}
