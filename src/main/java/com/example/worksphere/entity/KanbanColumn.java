package com.example.worksphere.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "kanban_columns")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Getter
@Setter
public class KanbanColumn {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "board_id", nullable = false)
    private KanbanBoard board;

    @Column(nullable = false, length = 255)
    private String title;

    @Column(nullable = false)
    private Integer position;

    @Column(name = "created_at", updatable = false, columnDefinition = "TIMESTAMP DEFAULT CURRENT_TIMESTAMP")
    private LocalDateTime createdAt;

    @OneToMany(mappedBy = "kanbanColumn", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<KanbanTask> tasks;


    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}