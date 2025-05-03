import React, { useState, useRef, useContext, useEffect } from 'react';
import styles from '../../css/project/kanban.module.css';
import axios from 'axios';
import { useToast, Toast } from '../ui-essentials/toast';
import ProjectContext from '../../contexts/ProjectContext';

// Import your Task component
import Task from '../task';

const KanbanBoard = () => {
  const { project } = useContext(ProjectContext);
  const userId = localStorage.getItem("loggedInUserID");
  const projectId = parseInt(project.id, 10);

  // Set up toast notifications
  const { toast, showSuccess, showError, showInfo } = useToast();
  const [columns, setColumns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // References for drag operations
  const dragTask = useRef(null);
  const dragTaskNode = useRef(null);
  const dragColumn = useRef(null);
  const dragColumnNode = useRef(null);

  const [draggingTask, setDraggingTask] = useState(false);
  const [draggingColumn, setDraggingColumn] = useState(false);
  const [newColumnTitle, setNewColumnTitle] = useState("");
  const [showAddColumnForm, setShowAddColumnForm] = useState(false);
  const [showAddTaskForm, setShowAddTaskForm] = useState(false);
  const [selectedColumnId, setSelectedColumnId] = useState(null);
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    priority: "Medium",
    dueDate: "",
    assignedTo: []
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
              
        // Fetch columns with tasks
        const columnsResponse = await axios.get(`http://localhost:8080/api/kanban/board/${projectId}/columns-with-tasks?userId=${userId}`);
        setColumns(columnsResponse.data);
        
        setLoading(false);
        
        if (columnsResponse.data.length > 0) {
          showInfo("Kanban Board Loaded", `Loaded ${columnsResponse.data.length} columns successfully`);
        } else {
          showInfo("New Kanban Board", "Create your first column to get started");
        }
        
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to load project data. Please try again.");
        setLoading(false);
        showError("Loading Error", "Failed to load kanban data. Please refresh the page.");
      }
    };
    
    fetchData();
  }, [projectId, userId]);

  // Handle task drag operations
  const handleTaskDragStart = (e, taskIndex, boardId) => {
    dragTaskNode.current = e.target;
    dragTask.current = { taskIndex, boardId };
    
    setTimeout(() => {
      setDraggingTask(true);
    }, 0);
    
    e.dataTransfer.effectAllowed = "move";
  };

  const handleTaskDragEnd = () => {
    setDraggingTask(false);
    dragTask.current = null;
    dragTaskNode.current = null;
  };

  const handleTaskDragEnter = async (e, targetTaskIndex, targetBoardId) => {
    if (!draggingTask || !dragTask.current) return;
    
    const { taskIndex: sourceTaskIndex, boardId: sourceBoardId } = dragTask.current;

    // Skip if hovering over the same task
    if (sourceBoardId === targetBoardId && sourceTaskIndex === targetTaskIndex) return;
    
    // Find source and target column indices
    const sourceColumnIndex = columns.findIndex(column => column.id === sourceBoardId);
    const targetColumnIndex = columns.findIndex(column => column.id === targetBoardId);
    
    // Exit if columns not found
    if (sourceColumnIndex < 0 || targetColumnIndex < 0) {
      console.error("Column not found", { sourceBoardId, targetBoardId });
      return;
    }

    try {
      // Get the task being dragged
      const taskId = columns[sourceColumnIndex].tasks[sourceTaskIndex].id;
      const taskTitle = columns[sourceColumnIndex].tasks[sourceTaskIndex].taskTitle;
      const sourceColumnName = columns[sourceColumnIndex].title;
      const targetColumnName = columns[targetColumnIndex].title;
      
      // Clone columns for optimistic UI update
      const newColumns = [...columns];
      const sourceTasks = [...newColumns[sourceColumnIndex].tasks];
      const targetTasks = sourceColumnIndex === targetColumnIndex ? 
        sourceTasks : [...newColumns[targetColumnIndex].tasks];
      
      const draggedTask = sourceTasks[sourceTaskIndex];
      
      // Remove from source
      sourceTasks.splice(sourceTaskIndex, 1);
      
      // Add to target position
      if (sourceColumnIndex === targetColumnIndex) {
        sourceTasks.splice(targetTaskIndex, 0, draggedTask);
        newColumns[sourceColumnIndex].tasks = sourceTasks;
      } else {
        targetTasks.splice(targetTaskIndex, 0, draggedTask);
        newColumns[sourceColumnIndex].tasks = sourceTasks;
        newColumns[targetColumnIndex].tasks = targetTasks;
      }
      
      // Update UI optimistically
      setColumns(newColumns);
      
      // Update the API
      await axios.put(`http://localhost:8080/api/kanban/task/${taskId}/position?userId=${userId}`, {
        columnId: targetBoardId,
        position: targetTaskIndex
      });
      
      // Show success notification only when moving between columns
      if (sourceColumnIndex !== targetColumnIndex) {
        showInfo("Task Moved", `"${taskTitle}" moved from "${sourceColumnName}" to "${targetColumnName}"`);
      }
      
      // Update the current drag reference
      dragTask.current = { taskIndex: targetTaskIndex, boardId: targetBoardId };
      
    } catch (err) {
      console.error("Error updating task position:", err);
      showError("Failed to Move Task", "Please try again. " + (err.response?.data?.message || ""));
    }
  };

  // Handle column drag operations
  const handleColumnDragStart = (e, columnIndex) => {
    dragColumnNode.current = e.target.closest(`.${styles.boardContainer}`);
    dragColumn.current = { columnIndex };
    
    setTimeout(() => {
      setDraggingColumn(true);
    }, 0);
    
    e.dataTransfer.effectAllowed = "move";
  };

  const handleColumnDragEnd = () => {
    setDraggingColumn(false);
    dragColumn.current = null;
    dragColumnNode.current = null;
  };

  const handleColumnDragEnter = async (e, targetColumnIndex) => {
    if (!draggingColumn || !dragColumn.current) return;
    
    const { columnIndex: sourceColumnIndex } = dragColumn.current;
    
    // Skip if hovering over the same column
    if (sourceColumnIndex === targetColumnIndex) return;
    
    try {
      // Clone columns for optimistic UI update
      const newColumns = [...columns];
      const draggedColumn = newColumns[sourceColumnIndex];
      
      // Remove from source position
      newColumns.splice(sourceColumnIndex, 1);
      
      // Insert at target position
      newColumns.splice(targetColumnIndex, 0, draggedColumn);
      
      // Update the UI optimistically
      setColumns(newColumns);
      
      // Create the column order array (array of column IDs in the new order)
      const columnOrder = newColumns.map(column => column.id);
      
      // Update the API
      await axios.put(`http://localhost:8080/api/kanban/board/${projectId}/columns/order?userId=${userId}`, {
        columnOrder: columnOrder
      });
      
      // Show info toast for column reordering
      showInfo("Column Order Updated", "The column order has been updated successfully");
      
      // Update current drag position
      dragColumn.current = { columnIndex: targetColumnIndex };
      
    } catch (err) {
      console.error("Error updating column order:", err);
      showError("Failed to Update Column Order", "Please try again. " + (err.response?.data?.message || ""));
    }
  };

  // Handle adding new task to specific column
  const handleAddTask = async (e) => {
    e.preventDefault();
    if (newTask.title.trim() && selectedColumnId) {
      try {
        // First create a task in the backend
        const taskResponse = await axios.post(`http://localhost:8080/api/tasks?userId=${userId}`, {
          title: newTask.title,
          description: newTask.description || "",
          priority: newTask.priority,
          dueDate: newTask.dueDate || "",
          assignedTo: newTask.assignedTo,
          projectId: projectId
        });
        
        const createdTask = taskResponse.data;
        
        // Then add it to the kanban column
        const columnNumber = columns.findIndex(column => column.id === selectedColumnId);
        const position = columns[columnNumber].tasks.length; // Add to the end
        
        const kanbanTaskResponse = await axios.post(
          `http://localhost:8080/api/kanban/column/${selectedColumnId}/task/${createdTask.id}?position=${position}&userId=${userId}`
        );
        
        // Update local state
        const updatedColumns = [...columns];
        updatedColumns[columnNumber].tasks.push(kanbanTaskResponse.data);
        setColumns(updatedColumns);
        
        // Show success notification
        showSuccess("Task Created", `"${newTask.title}" has been added to the column`);
        
        // Reset form
        setNewTask({
          title: "",
          description: "",
          priority: "Medium",
          dueDate: "",
          assignedTo: []
        });
        
        setShowAddTaskForm(false);
        setSelectedColumnId(null);
        
      } catch (err) {
        console.error("Error adding task:", err);
        showError("Failed to Add Task", "Please try again. " + (err.response?.data?.message || ""));
      }
    }
  };

  // Add new column
  const handleAddColumn = async (e) => {
    e.preventDefault();
    if (newColumnTitle.trim()) {
      try {
        // Create a new column via API
        const response = await axios.post(
          `http://localhost:8080/api/kanban/project/${projectId}?userId=${userId}`
        );
        
        const newColumn = response.data;
        
        // Update column title 
        await axios.put(
          `http://localhost:8080/api/kanban/column/${newColumn.id}?userId=${userId}`,
          { title: newColumnTitle }
        );
        
        // Update in local state
        newColumn.title = newColumnTitle;
        newColumn.tasks = []; // Initialize with empty tasks array
        
        // Update the UI with the new column
        setColumns([...columns, newColumn]);
        setNewColumnTitle("");
        setShowAddColumnForm(false);
        
        // Show success notification
        showSuccess("Column Created", `"${newColumnTitle}" column has been added`);
        
      } catch (err) {
        console.error("Error adding column:", err);
        showError("Failed to Add Column", "Please try again. " + (err.response?.data?.message || ""));
      }
    }
  };

  // Show the add task form for a specific column
  const handleShowAddTaskForm = (columnId) => {
    setSelectedColumnId(columnId);
    setShowAddTaskForm(true);
  };
  
  // Handle delete column
  const handleDeleteColumn = async (columnId) => {
    if (window.confirm("Are you sure you want to delete this column? All tasks in this column will be deleted.")) {
      try {
        // Get column title before deletion for the notification
        const columnToDelete = columns.find(column => column.id === columnId);
        const columnTitle = columnToDelete ? columnToDelete.title : "Column";
        
        // Delete column via API
        await axios.delete(`http://localhost:8080/api/kanban/column/${columnId}?userId=${userId}`);
        
        // Update local state
        const updatedColumns = columns.filter(column => column.id !== columnId);
        setColumns(updatedColumns);
        
        // Show success notification
        showSuccess("Column Deleted", `"${columnTitle}" column has been removed`);
        
      } catch (err) {
        console.error("Error deleting column:", err);
        showError("Failed to Delete Column", "Please try again. " + (err.response?.data?.message || ""));
      }
    }
  };

  // Transform task data to match what the Task component expects
  const adaptTaskForComponent = (task) => {
    return {
      id: task.id,
      title: task.taskTitle,
      description: task.taskDescription,
      priority: task.taskPriority === "HIGH" ? "High" : 
                task.taskPriority === "MEDIUM" ? "Medium" : "Low",
      dueDate: task.deadline,
      assignedTo: task.assigneeId ? [task.assigneeId.toString()] : []
    };
  };
  
  // Helper function to get member by id - adapted for your specific data structure
  const getMemberById = (userId) => {
    // Find the task with this assigneeId
    for (const column of columns) {
      for (const task of column.tasks) {
        if (task.assigneeId && task.assigneeId.toString() === userId) {
          // Return an object with name property to prevent split() errors
          return { 
            id: userId,
            name: task.assigneeName || "Unknown"
          };
        }
      }
    }
    return { id: userId, name: "Unknown" }; // Fallback to prevent null/undefined
  };

  if (loading) {
    return <div className={styles.loading}>Loading kanban board...</div>;
  }

  if (error) {
    return <div className={styles.error}>{error}</div>;
  }

  return (
    <div className={styles.kanbanContainer}>
      {/* Toast notification component */}
      <Toast 
        visible={toast.visible}
        type={toast.type}
        title={toast.title}
        message={toast.message}
      />
      
      <div className={styles.boardsWrapper}>
        {/* Render columns */}
        {columns.map((column, columnIndex) => (
          <div
            key={column.id}
            className={`${styles.boardContainer} ${
              draggingColumn && 
              dragColumn.current && 
              dragColumn.current.columnIndex === columnIndex ? styles.boardDragging : ""
            }`}
            onDragOver={(e) => e.preventDefault()}
            onDragEnter={(e) => {
              e.preventDefault();
              if (draggingColumn) {
                handleColumnDragEnter(e, columnIndex);
              }
            }}
          >
            {/* Column header */}
            <div
              className={`${styles.boardHeader} ${
                draggingColumn && 
                dragColumn.current && 
                dragColumn.current.columnIndex === columnIndex ? styles.boardHeaderDragging : ""
              }`}
              draggable
              onDragStart={(e) => handleColumnDragStart(e, columnIndex)}
              onDragEnd={handleColumnDragEnd}
            >
              <h3 className={styles.boardTitle}>
                {column.title}
              </h3>
              <div className={styles.boardActions}>
                <span className={styles.taskCount}>
                  {column.tasks.length} {column.tasks.length === 1 ? 'task' : 'tasks'}
                </span>
                <button
                  className={styles.deleteButton}
                  onClick={() => handleDeleteColumn(column.id)}
                  title="Delete board"
                >
                  ×
                </button>
              </div>
            </div>
            
            {/* Column content */}
            <div
              className={styles.boardContent}
              onDragOver={(e) => e.preventDefault()}
              onDragEnter={(e) => {
                e.preventDefault();
                if (draggingTask && column.tasks.length === 0) {
                  // Handle dropping on empty board
                  handleTaskDragEnter(e, 0, column.id);
                }
              }}
              onDrop={(e) => {
                // Ensure drop events are handled properly
                e.preventDefault();
                if (draggingTask && column.tasks.length === 0) {
                  handleTaskDragEnter(e, 0, column.id);
                }
              }}
            >
              {/* Empty state message when no tasks */}
              {column.tasks.length === 0 && (
                <div
                  className={styles.emptyBoard}
                  onDragOver={(e) => e.preventDefault()}
                  onDragEnter={(e) => {
                    e.preventDefault();
                    if (draggingTask) {
                      handleTaskDragEnter(e, 0, column.id);
                    }
                  }}
                >
                  <p>No tasks yet</p>
                  <p>Drag tasks here or add a new one</p>
                </div>
              )}
              
              {/* Map through tasks and render them using the Task component */}
              {column.tasks.map((taskData, index) => {
                // Adapt the task data to match what Task component expects
                const adaptedTask = adaptTaskForComponent(taskData);
                
                return (
                  <Task
                    key={taskData.id}
                    task={adaptedTask}
                    boardId={column.id}
                    index={index}
                    draggingTask={draggingTask}
                    dragTask={dragTask}
                    handleTaskDragStart={handleTaskDragStart}
                    handleTaskDragEnd={handleTaskDragEnd}
                    handleTaskDragEnter={handleTaskDragEnter}
                    getMemberById={getMemberById}
                  />
                );
              })}
            </div>
            
            {/* Column footer */}
            <div className={styles.boardFooter}>
              <button
                className={styles.addTaskButton}
                onClick={() => handleShowAddTaskForm(column.id)}
              >
                <span className={styles.addIcon}>+</span> Add Task
              </button>
            </div>
          </div>
        ))}
        
        {/* Add New Column Button */}
        <div className={styles.addBoardContainer}>
          {!showAddColumnForm ? (
            <button
              onClick={() => setShowAddColumnForm(true)}
              className={styles.addBoardBtn}
            >
              <div className={styles.plusIcon}>+</div>
              Add Column
            </button>
          ) : (
            <div className={styles.addBoardForm}>
              <form onSubmit={handleAddColumn}>
                <input
                  type="text"
                  value={newColumnTitle}
                  onChange={(e) => setNewColumnTitle(e.target.value)}
                  placeholder="Column name"
                  className={styles.boardTitleInput}
                  autoFocus
                />
                <div className={styles.formActions}>
                  <button
                    type="button"
                    onClick={() => setShowAddColumnForm(false)}
                    className={styles.cancelBtn}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className={styles.confirmBtn}
                  >
                    Add
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
      
      {/* Add Task Modal */}
      {showAddTaskForm && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <h2 className={styles.modalTitle}>Add New Task</h2>
            <form onSubmit={handleAddTask}>
              <div className={styles.formGroup}>
                <label>Title</label>
                <input
                  type="text"
                  value={newTask.title}
                  onChange={(e) => setNewTask({...newTask, title: e.target.value})}
                  className={styles.formInput}
                  placeholder="Task title"
                />
              </div>
              <div className={styles.formGroup}>
                <label>Description</label>
                <textarea
                  value={newTask.description}
                  onChange={(e) => setNewTask({...newTask, description: e.target.value})}
                  className={styles.formTextarea}
                  placeholder="Task description"
                  rows={3}
                />
              </div>
              <div className={styles.formGroup}>
                <label>Priority</label>
                <select
                  value={newTask.priority}
                  onChange={(e) => setNewTask({...newTask, priority: e.target.value})}
                  className={styles.formSelect}
                >
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                </select>
              </div>
              <div className={styles.formGroup}>
                <label>Due Date</label>
                <input
                  type="date"
                  value={newTask.dueDate}
                  onChange={(e) => setNewTask({...newTask, dueDate: e.target.value})}
                  className={styles.formInput}
                />
              </div>
              <div className={styles.formActions}>
                <button
                  type="button"
                  onClick={() => {
                    setShowAddTaskForm(false);
                    setSelectedColumnId(null);
                  }}
                  className={styles.cancelBtn}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={styles.confirmBtn}
                >
                  Add Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default KanbanBoard;