import React from 'react';
import Task from './task';
import styles from '../css/kanban.module.css';

const KanbanBoard = ({
  board,
  boardIndex,
  draggingTask,
  draggingBoard,
  dragTask,
  dragBoard,
  handleTaskDragStart,
  handleTaskDragEnd,
  handleTaskDragEnter,
  handleBoardDragStart,
  handleBoardDragEnd,
  handleBoardDragEnter,
  onAddTask,
  getMemberById,
  onDeleteBoard
}) => {
  // Get board header style based on dragging state
  const getBoardHeaderStyle = () => {
    if (draggingBoard && 
        dragBoard.current && 
        dragBoard.current.boardIndex === boardIndex) {
      return styles.boardHeaderDragging;
    }
    return "";
  };

  // Get board style based on dragging state
  const getBoardStyle = () => {
    if (draggingBoard && 
        dragBoard.current && 
        dragBoard.current.boardIndex === boardIndex) {
      return styles.boardDragging;
    }
    return "";
  };

  return (
    <div 
      className={`${styles.boardContainer} ${getBoardStyle()}`}
      onDragOver={(e) => e.preventDefault()}
      onDragEnter={(e) => {
        e.preventDefault();
        if (draggingBoard) {
          handleBoardDragEnter(e, boardIndex);
        }
      }}
    >
      <div 
        className={`${styles.boardHeader} ${getBoardHeaderStyle()}`}
        draggable
        onDragStart={(e) => handleBoardDragStart(e, boardIndex)}
        onDragEnd={handleBoardDragEnd}
      >
        <h3 className={styles.boardTitle}>
          {board.title}
        </h3>
        <div className={styles.boardActions}>
          <span className={styles.taskCount}>
            {board.tasks.length} {board.tasks.length === 1 ? 'task' : 'tasks'}
          </span>
          <button 
            className={styles.deleteButton}
            onClick={() => onDeleteBoard(board.id)}
            title="Delete board"
          >
            ×
          </button>
        </div>
      </div>

      <div 
        className={styles.boardContent}
        onDragOver={(e) => e.preventDefault()}
        onDragEnter={(e) => {
          e.preventDefault();
          if (draggingTask && board.tasks.length === 0) {
            // Handle dropping on empty board
            handleTaskDragEnter(e, 0, board.id);
          }
        }}
        onDrop={(e) => {
          // Ensure drop events are handled properly
          e.preventDefault();
          if (draggingTask && board.tasks.length === 0) {
            handleTaskDragEnter(e, 0, board.id);
          }
        }}
      >
        {/* Empty state message when no tasks */}
        {board.tasks.length === 0 && (
          <div 
            className={styles.emptyBoard}
            onDragOver={(e) => e.preventDefault()}
            onDragEnter={(e) => {
              e.preventDefault();
              if (draggingTask) {
                handleTaskDragEnter(e, 0, board.id);
              }
            }}
          >
            <p>No tasks yet</p>
            <p>Drag tasks here or add a new one</p>
          </div>
        )}

        {/* Tasks */}
        {board.tasks.map((task, index) => (
          <Task
            key={task.id}
            task={task}
            boardId={board.id}
            index={index}
            draggingTask={draggingTask}
            dragTask={dragTask}
            handleTaskDragStart={handleTaskDragStart}
            handleTaskDragEnd={handleTaskDragEnd}
            handleTaskDragEnter={handleTaskDragEnter}
            getMemberById={getMemberById}
          />
        ))}
      </div>

      <div className={styles.boardFooter}>
        <button 
          className={styles.addTaskButton}
          onClick={() => onAddTask(board.id)}
        >
          <span className={styles.addIcon}>+</span> Add Task
        </button>
      </div>
    </div>
  );
};

export default KanbanBoard;
