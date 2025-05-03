package com.example.worksphere.dto;

import com.example.worksphere.entity.KanbanTask;
import com.example.worksphere.entity.Task;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class KanbanTaskDTO {
    private Long id;
    private Long kanbanBoardId;
    private Long kanbanColumnId;
    private Long taskId;
    private String taskTitle;
    private String taskDescription;
    private Task.Status taskStatus;
    private Task.Priority taskPriority;
    private String assigneeName;
    private Long assigneeId;
    private Integer columnNumber;
    private Integer position;
    private LocalDate deadline;

    public static KanbanTaskDTO fromEntity(KanbanTask kanbanTask) {
        Task task = kanbanTask.getTask();

        return KanbanTaskDTO.builder()
                .id(kanbanTask.getId())
                .kanbanBoardId(kanbanTask.getKanbanColumn().getBoard().getId())
                .kanbanColumnId(kanbanTask.getKanbanColumn().getId())
                .taskId(task.getId())
                .taskTitle(task.getTitle())
                .taskDescription(task.getDescription())
                .taskStatus(task.getStatus())
                .taskPriority(task.getPriority())
                .assigneeName(task.getAssignedTo() != null ? task.getAssignedTo().getFullName() : null)
                .assigneeId(task.getAssignedTo() != null ? task.getAssignedTo().getId() : null)
                .columnNumber(kanbanTask.getKanbanColumn().getPosition())
                .position(kanbanTask.getPosition())
                .deadline(task.getDeadline())
                .build();
    }
}
