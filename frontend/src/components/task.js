import React from 'react';
import styles from '../css/task.module.css';

const Task = ({ 
  task, 
  boardId, 
  index, 
  draggingTask, 
  dragTask, 
  handleTaskDragStart, 
  handleTaskDragEnd, 
  handleTaskDragEnter,
  getMemberById 
}) => {
  // Dynamically get task style based on dragging state
  const getTaskStyle = () => {
    if (draggingTask && 
        dragTask.current && 
        dragTask.current.boardId === boardId && 
        dragTask.current.taskIndex === index) {
      return styles.taskDragging;
    }
    return "";
  };

  // Priority badge styles
  const getPriorityBadgeStyle = (priority) => {
    switch (priority) {
      case 'High':
        return styles.priorityHigh;
      case 'Medium':
        return styles.priorityMedium;
      case 'Low':
        return styles.priorityLow;
      default:
        return styles.priorityDefault;
    }
  };

  // Function to get member initials
  const getMemberInitials = (userId) => {
    const member = getMemberById(userId);
    if (!member) return '';
    
    // Get first letter of first name and last name
    const nameParts = member.name.split(' ');
    if (nameParts.length === 1) return nameParts[0][0].toUpperCase();
    return (nameParts[0][0] + nameParts[nameParts.length - 1][0]).toUpperCase();
  };

  // Get color based on user ID (consistent color for each user)
  const getMemberColor = (userId) => {
    const colors = [
      '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFC43D', '#7768AE', 
      '#1D7874', '#F38181', '#6A0572', '#6F9A8D', '#FB8B24'
    ];
    
    // Generate consistent index based on userId
    const charSum = userId.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);
    return colors[charSum % colors.length];
  };

  return (
    <div
      className={`${styles.task} ${getTaskStyle()}`}
      draggable
      onDragStart={(e) => handleTaskDragStart(e, index, boardId)}
      onDragEnd={handleTaskDragEnd}
      onDragOver={(e) => e.preventDefault()}
      onDragEnter={(e) => {
        e.preventDefault();
        handleTaskDragEnter(e, index, boardId);
      }}
    >
      <h4 className={styles.taskTitle}>{task.title}</h4>
      
      <p className={styles.taskDescription}>
        {task.description}
      </p>
      
      <div className={styles.taskMetadata}>
        <span className={`${styles.priorityBadge} ${getPriorityBadgeStyle(task.priority)}`}>
          {task.priority}
        </span>
        
        {task.dueDate && (
          <span className={styles.dueDate}>
            Due: {new Date(task.dueDate).toLocaleDateString()}
          </span>
        )}
      </div>
      
      {task.assignedTo && task.assignedTo.length > 0 && (
        <div className={styles.taskAssignees}>
          {task.assignedTo.map(userId => {
            const member = getMemberById(userId);
            return member ? (
              <div
                key={userId}
                className={styles.initialsCircle}
                style={{ backgroundColor: getMemberColor(userId) }}
                title={member.name}
              >
                {getMemberInitials(userId)}
              </div>
            ) : null;
          })}
        </div>
      )}
    </div>
  );
};

export default Task;