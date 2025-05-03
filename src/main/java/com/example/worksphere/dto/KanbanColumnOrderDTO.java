package com.example.worksphere.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class KanbanColumnOrderDTO {
    // List of column IDs in the new order
    private List<Long> columnOrder;
}