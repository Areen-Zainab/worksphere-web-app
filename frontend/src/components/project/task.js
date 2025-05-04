import React, { useState, useEffect } from 'react';
import styles from '../../css/task.module.css';
import TaskModal from './taskModal';
import { useToast } from '../ui-essentials/toast';
import { X } from 'lucide-react';

const TaskLabels = ({ labels, onRemoveLabel }) => {
  if (!labels || labels.length === 0) {
    return (
      <div style={{ 
        fontSize: '12px', 
        color: '#999', 
        padding: '4px 0', 
        fontStyle: 'italic' 
      }}>
        No labels added yet
      </div>
    );
  }

  return (
    <div style={{ 
      display: 'flex', 
      flexWrap: 'wrap', 
      gap: '8px', 
      marginTop: '8px',
      padding: '4px 0'
    }}>
      {labels.map(label => (
        <div 
          key={label.id} 
          style={{ 
            display: 'flex',
            alignItems: 'center',
            backgroundColor: label.color,
            borderRadius: '4px',
            padding: '3px 8px',
            color: 'white',
            fontSize: '12px',
            fontWeight: '500',
            boxShadow: '0 1px 2px rgba(0,0,0,0.1)'
          }}
        >
          <span style={{ 
            marginRight: '6px', 
            maxWidth: '120px', 
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap'
          }}>
            {label.name}
          </span>
          {onRemoveLabel && (
            <button 
              onClick={() => onRemoveLabel(label.id)}
              aria-label={`Remove ${label.name} label`}
              style={{
                background: 'none',
                border: 'none',
                padding: '0',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '16px',
                height: '16px',
                opacity: '0.7'
              }}
              onMouseOver={(e) => e.currentTarget.style.opacity = '1'}
              onMouseOut={(e) => e.currentTarget.style.opacity = '0.7'}
            >
              <X size={12} stroke="white" />
            </button>
          )}
        </div>
      ))}
    </div>
  );
};

const Task = ({ 
  task, 
  boardId, 
  index, 
  draggingTask, 
  dragTask, 
  handleTaskDragStart, 
  handleTaskDragEnd, 
  handleTaskDragEnter,
  getMemberById,
  teamMembers = [],
  statuses = [],
  updateTask,
}) => {
  const [showModal, setShowModal] = useState(false);
  const [labels, setLabels] = useState([]);
  const [isLoadingLabels, setIsLoadingLabels] = useState(false);
  const { toast, showSuccess, showError, showInfo } = useToast();
  
  // Fetch labels when component mounts or when task changes
  useEffect(() => {
    if (task && task.id) {
      fetchTaskLabels();
    }
  }, [task?.id]);
  
  // Function to fetch task labels
  const fetchTaskLabels = async () => {
    if (!task || !task.id) return;
    
    setIsLoadingLabels(true);
    try {
      // Get the current user ID from your auth context or localStorage
      const userId = localStorage.getItem('userId') || '1'; // Use your actual user ID source
      
      const response = await fetch(`http://localhost:8080/api/tasks/${task.id}/labels?userId=${userId}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch labels');
      }
      
      const data = await response.json();
      setLabels(data);
      task.labels = data;
    } catch (error) {
      console.error('Error fetching task labels:', error);
      showError('Failed to load labels');
    } finally {
      setIsLoadingLabels(false);
    }
  };
  
  // Function to remove a label from a task
  const handleRemoveLabel = async (labelId) => {
    if (!task || !task.id) return;
    
    try {
      const userId = localStorage.getItem('userId') || '1'; // Use your actual user ID source
      
      const response = await fetch(`/api/tasks/${task.id}/labels/remove?userId=${userId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify([{ id: labelId }]),
      });
      
      if (!response.ok) {
        throw new Error('Failed to remove label');
      }
      
      // Update local state - remove the label
      setLabels(labels.filter(label => label.id !== labelId));
      showSuccess('Label removed successfully');
      
      // Optionally refresh the task if needed
      if (updateTask) {
        const updatedTask = await response.json();
        updateTask(boardId, index, updatedTask);
      }
    } catch (error) {
      console.error('Error removing label:', error);
      showError('Failed to remove label');
    }
  };

  const getTaskStyle = () => {
    if (draggingTask && 
        dragTask.current && 
        dragTask.current.boardId === boardId && 
        dragTask.current.taskIndex === index) {
      return styles.taskDragging;
    }
    return "";
  };

  const getPriorityBadgeStyle = (priority) => {
    if (!priority) return styles.priorityDefault;
    
    const priorityUpper = priority.toUpperCase();
    switch (priorityUpper) {
      case 'HIGH':
        return styles.priorityHigh;
      case 'MEDIUM':
        return styles.priorityMedium;
      case 'LOW':
        return styles.priorityLow;
      default:
        return styles.priorityDefault;
    }
  };

  const getMemberInitials = (userId) => {
    const member = getMemberById(userId);
    if (!member) return '';
    
    if (member.firstName && member.lastName) {
      return (member.firstName[0] + member.lastName[0]).toUpperCase();
    } else if (member.fullName) {
      const nameParts = member.fullName.split(' ');
      if (nameParts.length === 1) return nameParts[0][0].toUpperCase();
      return (nameParts[0][0] + nameParts[nameParts.length - 1][0]).toUpperCase();
    } else if (member.name) {
      const nameParts = member.name.split(' ');
      if (nameParts.length === 1) return nameParts[0][0].toUpperCase();
      return (nameParts[0][0] + nameParts[nameParts.length - 1][0]).toUpperCase();
    }
    
    return '';
  };

  const getMemberColor = (userId) => {
    const colors = [
      '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFC43D', '#7768AE', 
      '#1D7874', '#F38181', '#6A0572', '#6F9A8D', '#FB8B24'
    ];
    
    const charSum = userId.toString().split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);
    return colors[charSum % colors.length];
  };

  const openTaskModal = (e) => {
    e.stopPropagation();
    e.preventDefault();
    setShowModal(true);
  };

  const closeTaskModal = () => {
    setShowModal(false);
    // Refresh the labels after modal closes in case they were updated
    fetchTaskLabels();
  };

  return (
    <>
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
        onClick={openTaskModal}
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
        
        {/* Show attachment count if any */}
        {task.attachments && task.attachments.length > 0 && (
          <div className={styles.attachmentCount}>
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48" />
            </svg>
            {task.attachments.length}
          </div>
        )}
        
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

        {/* Show labels with loading state */}
        {isLoadingLabels ? (
          <div style={{ fontSize: '12px', color: '#999', padding: '4px 0' }}>
            Loading labels...
          </div>
        ) : (
          <TaskLabels 
            labels={labels} 
            onRemoveLabel={null} 
          />
        )}
      </div>

      {/* Use the TaskModal component */}
      <TaskModal
        show={showModal}
        onClose={closeTaskModal}
        task={task}
        boardId={boardId}
        index={index}
        teamMembers={teamMembers}
        getMemberById={getMemberById}
        updateTask={updateTask}
        showSuccess={showSuccess}
        showError={showError}
        labels={task.labels}
        refreshLabels={fetchTaskLabels}
        onRemoveLabel={handleRemoveLabel}
      />
    </>
  );
};

export default Task;