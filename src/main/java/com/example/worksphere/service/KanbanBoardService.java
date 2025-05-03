package com.example.worksphere.service;

import com.example.worksphere.dto.KanbanBoardDTO;
import com.example.worksphere.dto.KanbanColumnDTO;
import com.example.worksphere.dto.KanbanTaskDTO;
import com.example.worksphere.entity.KanbanBoard;
import com.example.worksphere.entity.KanbanColumn;
import com.example.worksphere.entity.KanbanTask;
import com.example.worksphere.entity.Project;
import com.example.worksphere.entity.ProjectMember;
import com.example.worksphere.entity.Task;
import com.example.worksphere.entity.User;
import com.example.worksphere.exception.ResourceNotFoundException;
import com.example.worksphere.repository.KanbanBoardRepository;
import com.example.worksphere.repository.KanbanColumnRepository;
import com.example.worksphere.repository.KanbanTaskRepository;
import com.example.worksphere.repository.ProjectRepository;
import com.example.worksphere.repository.TaskRepository;
import com.example.worksphere.repository.UserRepository;
import com.example.worksphere.repository.ProjectMemberRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class KanbanBoardService {

    @Autowired
    private KanbanBoardRepository kanbanBoardRepository;

    @Autowired
    private KanbanColumnRepository kanbanColumnRepository;

    @Autowired
    private KanbanTaskRepository kanbanTaskRepository;
    
    @Autowired
    private ProjectRepository projectRepository;
    
    @Autowired
    private TaskRepository taskRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private ProjectMemberRepository projectMemberRepository;

    /**
     * Get a kanban board by its ID
     */
    public KanbanBoardDTO getKanbanBoardById(Long id, Long userId) {
        KanbanBoard board = findBoardById(id);
        checkBoardPermission(userId, id, "view this kanban board");
        return convertBoardToDTO(board);
    }

    /**
     * Get all kanban boards for a project
     */
    public KanbanBoardDTO getKanbanBoardByProjectId(Long projectId, Long userId) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Project not found"));
        
        checkProjectPermission(userId, projectId, "view kanban board in this project");
        
        List<KanbanBoard> boards = kanbanBoardRepository.findByProjectId(projectId);
        if (boards.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND,
                "No Kanban boards found for project: " + projectId);
        }

// Example: get the first board (or handle all as needed)
KanbanBoard board = boards.get(0);

        
        return convertBoardToDTO(board);
    }

    /**
     * Find a board by ID
     */
    public KanbanBoard findBoardById(Long id) {
        return kanbanBoardRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, 
                    "KanbanBoard not found with id: " + id));
    }
    
    /**
     * Get columns for a board
     */
    public List<KanbanColumnDTO> getColumnsByBoardId(Long boardId, Long userId) {
        //KanbanBoard board = findBoardById(boardId);
        checkBoardPermission(userId, boardId, "view columns on this board");
        
        return kanbanColumnRepository.findByBoardIdOrderByPosition(boardId).stream()
                .map(this::convertColumnToDTO)
                .collect(Collectors.toList());
    }
    
    public List<KanbanColumnDTO> getColumnsByProjectId(Long projectId, Long userId) {
        // Validate that user has access to the project
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new RuntimeException("Project not found"));

        if (!project.getOwner().getId().equals(userId)) {
            throw new RuntimeException("Unauthorized access");
        }

        List<KanbanBoard> boards = kanbanBoardRepository.findByProjectId(projectId);

        return boards.stream()
                .flatMap(board -> kanbanColumnRepository.findByBoardIdOrderByPosition(board.getId()).stream())
                .map(KanbanColumnDTO::fromEntity)
                .collect(Collectors.toList());
    }

    public KanbanColumnDTO createKanbanColumnForProject(Long projectId, Long userId) {
        // Validate that user has access
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new RuntimeException("Project not found"));

        if (!project.getOwner().getId().equals(userId)) {
            throw new RuntimeException("Unauthorized access");
        }

        KanbanBoard board = kanbanBoardRepository.findFirstByProjectId(projectId)
                .orElseThrow(() -> new RuntimeException("No board found for project"));

        int position = kanbanColumnRepository.countByBoardId(board.getId()).intValue();

        KanbanColumn newColumn = new KanbanColumn();
        newColumn.setBoard(board);
        newColumn.setTitle("New Column");
        newColumn.setPosition(position);

        KanbanColumn saved = kanbanColumnRepository.save(newColumn);
        return KanbanColumnDTO.fromEntity(saved);
    }

    
    /**
     * Create a new column in a board
     */
    @Transactional
    public KanbanColumnDTO createKanbanColumn(Long boardId, KanbanColumnDTO columnDTO, Long userId) {
        KanbanBoard board = findBoardById(boardId);
        checkBoardPermission(userId, boardId, "create columns on this board");
        
        KanbanColumn column = KanbanColumn.builder()
                .board(board)
                .title(columnDTO.getTitle())
                .position(getNextColumnPosition(boardId))
                .build();
        
        return convertColumnToDTO(kanbanColumnRepository.save(column));
    }
    
    /**
     * Update a column's title
     */
    @Transactional
    public KanbanColumnDTO updateColumnTitle(Long columnId, String title, Long userId) {
        KanbanColumn column = findColumnById(columnId);
        checkBoardPermission(userId, column.getBoard().getId(), "update columns on this board");
        
        column.setTitle(title);
        return convertColumnToDTO(kanbanColumnRepository.save(column));
    }
    
    /**
     * Delete a column
     */
    @Transactional
    public void deleteKanbanColumn(Long columnId, Long userId) {
        KanbanColumn column = findColumnById(columnId);
        checkBoardPermission(userId, column.getBoard().getId(), "delete columns on this board");
        
        long columnCount = kanbanColumnRepository.countByBoardId(column.getBoard().getId());
        if (columnCount <= 1) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, 
                "Cannot delete the last column from a board");
        }
        
        // Let cascading delete handle the tasks
        kanbanColumnRepository.delete(column);
        
        reorderColumnsAfterDeletion(column.getBoard().getId(), column.getPosition());
    }
    
    /**
     * Update the order of columns in a board
     */
    @Transactional
    public KanbanBoardDTO updateColumnOrder(Long boardId, List<Long> newColumnOrder, Long userId) {
        //KanbanBoard board = findBoardById(boardId);
        checkBoardPermission(userId, boardId, "update column order on this board");
        
        List<KanbanColumn> columns = kanbanColumnRepository.findByBoardId(boardId);
        Set<Long> boardColumnIds = columns.stream()
                .map(KanbanColumn::getId)
                .collect(Collectors.toSet());

        if (newColumnOrder.size() != boardColumnIds.size() || !new HashSet<>(newColumnOrder).containsAll(boardColumnIds)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, 
                "The new column order must contain all existing columns");
        }
        
        for (int i = 0; i < newColumnOrder.size(); i++) {
            Long columnId = newColumnOrder.get(i);
            KanbanColumn column = kanbanColumnRepository.findById(columnId)
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, 
                        "Column not found with id: " + columnId));
            
            column.setPosition(i);
            kanbanColumnRepository.save(column);
        }
        
        return getKanbanBoardById(boardId, userId);
    }

    /**
     * Find a column by ID
     */
    public KanbanColumn findColumnById(Long id) {
        return kanbanColumnRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, 
                    "KanbanColumn not found with id: " + id));
    }

    /**
     * Add a task to a column
     */
    @Transactional
    public KanbanTaskDTO addTaskToColumn(Long columnId, Long taskId, Integer position, Long userId) {
        KanbanColumn column = findColumnById(columnId);
        checkBoardPermission(userId, column.getBoard().getId(), "add tasks to this board");
        
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Task not found"));
        
        if (!task.getProject().getId().equals(column.getBoard().getProject().getId())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, 
                "Task must belong to the same project as the board");
        }
        
        // Check if task is already on this board
        if (kanbanTaskRepository.existsByTaskIdAndKanbanColumnBoardId(taskId, column.getBoard().getId())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                "Task is already on this board");
        }
        
        // Set position at the end if not specified
        if (position == null) {
            position = kanbanTaskRepository.countByKanbanColumnId(columnId).intValue();
        } else {
            shiftTaskPositionsInColumn(columnId, position, null);
        }
        
        KanbanTask kanbanTask = KanbanTask.builder()
                .kanbanColumn(column)
                .task(task)
                .position(position)
                .build();
        
        kanbanTask = kanbanTaskRepository.save(kanbanTask);
        return convertKanbanTaskToDTO(kanbanTask);
    }

    /**
     * Remove a task from a board
     */
    @Transactional
    public void removeKanbanTask(Long kanbanTaskId, Long userId) {
        KanbanTask kanbanTask = findKanbanTaskById(kanbanTaskId);
        checkBoardPermission(userId, kanbanTask.getKanbanColumn().getBoard().getId(), "remove tasks from this board");
        
        Long columnId = kanbanTask.getKanbanColumn().getId();
        Integer position = kanbanTask.getPosition();
        
        kanbanTaskRepository.delete(kanbanTask);
        
        reorderTasksAfterRemoval(columnId, position);
    }

    /**
     * Update a task's position or move it to a different column
     */
    @Transactional
    public KanbanTaskDTO updateTaskPosition(Long kanbanTaskId, Long columnId, Integer position, Long userId) {
        KanbanTask kanbanTask = findKanbanTaskById(kanbanTaskId);
        KanbanColumn column = findColumnById(columnId);
        
        checkBoardPermission(userId, kanbanTask.getKanbanColumn().getBoard().getId(), "move tasks on this board");
        
        if (!column.getBoard().getId().equals(kanbanTask.getKanbanColumn().getBoard().getId())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, 
                "Cannot move task to a column on a different board");
        }
        
        Long oldColumnId = kanbanTask.getKanbanColumn().getId();
        Integer oldPosition = kanbanTask.getPosition();
        
        boolean columnChanged = !oldColumnId.equals(columnId);
        
        if (columnChanged) {
            reorderTasksAfterRemoval(oldColumnId, oldPosition);
            
            shiftTaskPositionsInColumn(columnId, position, null);
            
            kanbanTask.setKanbanColumn(column);
        } else if (!oldPosition.equals(position)) {
            shiftTaskPositionsInSameColumn(columnId, oldPosition, position);
        } else {
            // No change needed
            return convertKanbanTaskToDTO(kanbanTask);
        }
        
        kanbanTask.setPosition(position);
        
        return convertKanbanTaskToDTO(kanbanTaskRepository.save(kanbanTask));
    }

    /**
     * Get all tasks on a board
     */
    public List<KanbanTaskDTO> getTasksByBoardId(Long boardId, Long userId) {
        //KanbanBoard board = findBoardById(boardId);
        checkBoardPermission(userId, boardId, "view tasks on this board");
        
        List<KanbanColumn> columns = kanbanColumnRepository.findByBoardId(boardId);
        List<KanbanTask> tasks = new ArrayList<>();
        
        columns.forEach(column -> {
            tasks.addAll(kanbanTaskRepository.findByKanbanColumnIdOrderByPosition(column.getId()));
        });
        
        return tasks.stream()
                .map(this::convertKanbanTaskToDTO)
                .collect(Collectors.toList());
    }

    public List<KanbanTaskDTO> getTasksByColumnId(Long columnId, Long userId) {
        // First validate the column exists and user has permission
        KanbanColumn column = kanbanColumnRepository.findById(columnId)
                .orElseThrow(() -> new ResourceNotFoundException("Column not found with id: " + columnId));
        
        // Get the board ID from the column to check permissions
        Long boardId = column.getBoard().getId();
        checkBoardPermission(userId, boardId, "view tasks in this column");
        
        // Get all tasks for the specific column
        List<KanbanTask> tasks = kanbanTaskRepository.findByKanbanColumnIdOrderByPosition(columnId);
        
        // Convert tasks to DTOs and return
        return tasks.stream()
                .map(this::convertKanbanTaskToDTO)
                .collect(Collectors.toList());
    }
    
    /**
     * Find a kanban task by ID
     */
    public KanbanTask findKanbanTaskById(Long id) {
        return kanbanTaskRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, 
                    "KanbanTask not found with id: " + id));
    }
    
    /**
     * Check if a user has permission to perform an action on a project
     */
    private void checkProjectPermission(Long userId, Long projectId, String action) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
        
        if (!isProjectOwnerOrManager(userId, projectId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, 
                "You don't have permission to " + action);
        }
    }
    
    /**
     * Check if a user has permission to perform an action on a board
     */
    private void checkBoardPermission(Long userId, Long boardId, String action) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
        
        KanbanBoard board = findBoardById(boardId);
        
        if (!isProjectOwnerOrManager(user.getId(), board.getProject().getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, 
                "You don't have permission to " + action);
        }
    }
    
    /**
     * Convert a KanbanBoard entity to DTO
     */
    private KanbanBoardDTO convertBoardToDTO(KanbanBoard board) {
        List<KanbanColumnDTO> columns = kanbanColumnRepository.findByBoardIdOrderByPosition(board.getId())
                .stream()
                .map(this::convertColumnToDTO)
                .collect(Collectors.toList());
        
        return KanbanBoardDTO.builder()
                .id(board.getId())
                .projectId(board.getProject().getId())
                .kanbanColumns(columns)
                .createdAt(board.getCreatedAt())
                .updatedAt(board.getUpdatedAt())
                .build();
    }
    
    /**
     * Convert a KanbanColumn entity to DTO
     */
    private KanbanColumnDTO convertColumnToDTO(KanbanColumn column) {
        List<KanbanTaskDTO> tasks = kanbanTaskRepository.findByKanbanColumnIdOrderByPosition(column.getId())
                .stream()
                .map(this::convertKanbanTaskToDTO)
                .collect(Collectors.toList());
        
        return KanbanColumnDTO.builder()
                .id(column.getId())
                .boardId(column.getBoard().getId())
                .title(column.getTitle())
                .position(column.getPosition())
                .tasks(tasks)
                .createdAt(column.getCreatedAt())
                .build();
    }
    
    /**
     * Convert a KanbanTask entity to DTO
     */
    private KanbanTaskDTO convertKanbanTaskToDTO(KanbanTask kanbanTask) {
        Task task = kanbanTask.getTask();
        
        return KanbanTaskDTO.builder()
                .id(kanbanTask.getId())
                .kanbanColumnId(kanbanTask.getKanbanColumn().getId())
                .taskId(task.getId())
                .taskTitle(task.getTitle())
                .taskDescription(task.getDescription())
                .taskStatus(task.getStatus())
                .taskPriority(task.getPriority())
                .deadline(task.getDeadline())
                .assigneeId(task.getAssignedTo().getId() != null ? task.getAssignedTo().getId() : null)
                .assigneeName(task.getAssignedTo().getFullName() != null ? task.getAssignedTo().getFullName() : null)
                .position(kanbanTask.getPosition())
                .build();
    }
    
    /**
     * Get the next available position for a column in a board
     */
    private Integer getNextColumnPosition(Long boardId) {
        return kanbanColumnRepository.countByBoardId(boardId).intValue();
    }
    
    /**
     * Reorder columns after a column is deleted
     */
    private void reorderColumnsAfterDeletion(Long boardId, Integer deletedPosition) {
        List<KanbanColumn> columns = kanbanColumnRepository.findByBoardIdAndPositionGreaterThan(boardId, deletedPosition);
        columns.forEach(column -> {
            column.setPosition(column.getPosition() - 1);
            kanbanColumnRepository.save(column);
        });
    }
    
    /**
     * Reorder tasks after a task is removed
     */
    private void reorderTasksAfterRemoval(Long columnId, Integer deletedPosition) {
        List<KanbanTask> tasks = kanbanTaskRepository.findByKanbanColumnIdAndPositionGreaterThan(columnId, deletedPosition);
        tasks.forEach(task -> {
            task.setPosition(task.getPosition() - 1);
            kanbanTaskRepository.save(task);
        });
    }
    
    /**
     * Shift task positions in a column when adding a new task
     */
    private void shiftTaskPositionsInColumn(Long columnId, Integer startPosition, Integer endPosition) {
        if (endPosition == null) {
            List<KanbanTask> tasks = kanbanTaskRepository.findByKanbanColumnIdAndPositionGreaterThanEqual(columnId, startPosition);
            tasks.forEach(task -> {
                task.setPosition(task.getPosition() + 1);
                kanbanTaskRepository.save(task);
            });
        }
    }
    
    /**
     * Shift task positions in the same column when moving a task
     */
    private void shiftTaskPositionsInSameColumn(Long columnId, Integer oldPosition, Integer newPosition) {
        if (oldPosition < newPosition) {
            List<KanbanTask> tasks = kanbanTaskRepository.findByKanbanColumnIdAndPositionBetween(
                    columnId, oldPosition + 1, newPosition);
            tasks.forEach(task -> {
                task.setPosition(task.getPosition() - 1);
                kanbanTaskRepository.save(task);
            });
        } else {
            List<KanbanTask> tasks = kanbanTaskRepository.findByKanbanColumnIdAndPositionBetween(
                    columnId, newPosition, oldPosition - 1);
            tasks.forEach(task -> {
                task.setPosition(task.getPosition() + 1);
                kanbanTaskRepository.save(task);
            });
        }
    }
    
    /**
     * Create default columns for a board
     */
    @Transactional
    public void createDefaultColumns(KanbanBoard board) {
        KanbanColumn toDoColumn = KanbanColumn.builder()
                .board(board)
                .title("To Do")
                .position(0)
                .build();
        kanbanColumnRepository.save(toDoColumn);
        
        KanbanColumn inProgressColumn = KanbanColumn.builder()
                .board(board)
                .title("In Progress")
                .position(1)
                .build();
        kanbanColumnRepository.save(inProgressColumn);
        
        KanbanColumn doneColumn = KanbanColumn.builder()
                .board(board)
                .title("Done")
                .position(2)
                .build();
        kanbanColumnRepository.save(doneColumn);
    }
    
    /**
     * Check if a user is a member of a project
     */
    private boolean isUserMemberOfProject(Long userId, Long projectId) {
        return projectMemberRepository.existsByUserIdAndProjectId(userId, projectId);
    }
    
    /**
     * Check if a user is a project owner or manager
     */
    private boolean isProjectOwnerOrManager(Long userId, Long projectId) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Project not found"));
        
        if (project.getOwner().getId().equals(userId)) {
            return true;
        }
        
        Optional<ProjectMember> membership = projectMemberRepository.findByProjectIdAndUserId(userId, projectId);
        return membership.isPresent() && (ProjectMember.Role.PROJECT_MANAGER.equals(membership.get().getRole()));
    }

    /**
 * Get all columns with their tasks for a kanban board
 */
public List<KanbanColumnDTO> getColumnsWithTasksByBoardId(Long boardId, Long userId) {
    // Check board permission
    //checkBoardPermission(userId, boardId, "view this board");
    
    // Get all columns for this board
    List<KanbanColumn> columns = kanbanColumnRepository.findByBoardId(boardId);
    List<KanbanColumnDTO> columnDTOs = new ArrayList<>();
    
    // For each column, get its tasks and convert to DTO
    for (KanbanColumn column : columns) {
        KanbanColumnDTO columnDTO = KanbanColumnDTO.fromEntity(column);
        
        // Get tasks for this column
        List<KanbanTask> tasks = kanbanTaskRepository.findByKanbanColumnIdOrderByPosition(column.getId());
        List<KanbanTaskDTO> taskDTOs = tasks.stream()
                .map(this::convertKanbanTaskToDTO)
                .collect(Collectors.toList());
        
        // Set tasks on the column DTO
        columnDTO.setTasks(taskDTOs);
        columnDTOs.add(columnDTO);
    }
    
    return columnDTOs;
}
}