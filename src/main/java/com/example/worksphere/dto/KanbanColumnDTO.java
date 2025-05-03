package com.example.worksphere.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

import com.example.worksphere.entity.KanbanColumn;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class KanbanColumnDTO {
    private Long id;
    private Long boardId;
    private String title;
    private Integer position;
    private LocalDateTime createdAt;
    private List<KanbanTaskDTO> tasks;

    public static KanbanColumnDTO fromEntity(KanbanColumn column) {
        return KanbanColumnDTO.builder()
                .id(column.getId())
                .boardId(column.getBoard().getId())
                .title(column.getTitle())
                .position(column.getPosition())
                .createdAt(column.getCreatedAt())
                .tasks(column.getTasks() != null
                        ? column.getTasks().stream()
                            .map(KanbanTaskDTO::fromEntity)
                            .collect(Collectors.toList())
                        : null)
                .build();
    }
}