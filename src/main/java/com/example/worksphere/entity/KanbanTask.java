package com.example.worksphere.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "kanban_tasks")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class KanbanTask {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "column_id", nullable = false)
    private KanbanColumn kanbanColumn;

    @ManyToOne
    @JoinColumn(name = "task_id", nullable = false)
    private Task task;

    @Column(nullable = false)
    private Integer position;
}