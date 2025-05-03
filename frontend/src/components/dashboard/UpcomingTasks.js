import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MdCheckCircle, MdFlag, MdError } from 'react-icons/md';
import styles from '../../css/dashboard/UpcomingTasks.module.css';
import { useDarkMode } from '../../contexts/DarkModeContext';

const UpcomingTasks = () => {
  const { darkMode } = useDarkMode();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        setLoading(true);
        // Get the user ID from localStorage
        const userId = localStorage.getItem("loggedInUserID");
        
        if (!userId) {
          throw new Error("User not authenticated");
        }
        
        // Fetch user's tasks with priority sorting
        const response = await fetch(`http://localhost:8080/api/tasks/my-tasks?userId=${userId}&sortBy=deadline&sortDir=asc`);
        
        if (!response.ok) {
          throw new Error(`Error: ${response.status}`);
        }
        
        const data = await response.json();
        setTasks(data);
      } catch (err) {
        setError(err.message);
        console.error('Failed to fetch tasks:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchTasks();
  }, []);

  // Calculate task urgency based on deadline and priority
  const calculateUrgency = (task) => {
    // Get days until deadline
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const deadline = new Date(task.deadline);
    const daysUntil = Math.ceil((deadline - today) / (1000 * 60 * 60 * 24));
    
    // Priority weights
    const priorityWeight = {
      'HIGH': 10,
      'MEDIUM': 5,
      'LOW': 1
    };
    
    // Higher urgency score = more urgent
    // Negative days means task is overdue
    const urgencyScore = (daysUntil <= 0) 
      ? 1000 + Math.abs(daysUntil) * 10 + (priorityWeight[task.priority] || 0) 
      : (100 - Math.min(daysUntil, 30) * 3) + (priorityWeight[task.priority] || 0);
      
    return urgencyScore;
  };
  
  // Sort tasks by urgency and get 4 most urgent
  const getMostUrgentTasks = () => {
    // Only include non-completed tasks
    const activeTasks = tasks.filter(task => task.status !== 'COMPLETED');
    
    // Sort by urgency score (highest first)
    return [...activeTasks]
      .map(task => ({
        ...task,
        urgencyScore: calculateUrgency(task)
      }))
      .sort((a, b) => b.urgencyScore - a.urgencyScore)
      .slice(0, 4);
  };

  const urgentTasks = getMostUrgentTasks();

  const formatDate = (dateString) => {
    if (!dateString) return 'No deadline';
    
    const date = new Date(dateString);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const daysDiff = Math.ceil((date - today) / (1000 * 60 * 60 * 24));
    
    if (daysDiff < 0) {
      return `${Math.abs(daysDiff)} ${Math.abs(daysDiff) === 1 ? 'day' : 'days'} overdue`;
    } else if (date.getTime() === today.getTime()) {
      return 'Today';
    } else if (date.getTime() === tomorrow.getTime()) {
      return 'Tomorrow';
    } else if (daysDiff <= 7) {
      return `${daysDiff} ${daysDiff === 1 ? 'day' : 'days'} left`;
    } else {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
      });
    }
  };

  const getPriorityClass = (priority) => {
    switch (priority) {
      case 'HIGH':
        return styles.priorityHigh;
      case 'MEDIUM':
        return styles.priorityMedium;
      case 'LOW':
        return styles.priorityLow;
      default:
        return '';
    }
  };

  const handleMarkAsDone = async (taskId) => {
    try {
      const userId = localStorage.getItem("loggedInUserID");
      
      if (!userId) {
        throw new Error("User not authenticated");
      }
      
      // Update task status to COMPLETED
      const response = await fetch(
        `http://localhost:8080/api/tasks/${taskId}/status?status=COMPLETED&userId=${userId}`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
      
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      
      const updatedTask = await response.json();
      
      // Update the local state to reflect the change
      setTasks(prevTasks => 
        prevTasks.map(task => 
          task.id === taskId ? updatedTask : task
        )
      );
    } catch (err) {
      console.error('Failed to update task:', err);
      // Could show a toast/notification here
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'not_started':
        return '#6366F1'; // indigo
      case 'in_progress':
        return '#3B82F6'; // blue
      case 'completed':
        return '#10B981'; // green
      case 'on_hold':
        return '#F59E0B'; // amber
      case 'cancelled':
        return '#9CA3AF'; // gray
      default:
        return '#6B7280'; // gray
    }
  };

  const formatStatusLabel = (status) => {
    if (!status) return '';
    return status
      .toLowerCase()
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  if (loading) {
    return (
      <div className={`${styles.container} ${darkMode ? styles.darkMode : ''}`}>
        <div className={styles.header}>
          <h2 className={`${styles.title} ${darkMode ? styles.darkModeText : ''}`}>
            Urgent Tasks
          </h2>
        </div>
        <div className={styles.loadingState}>
          <p className={darkMode ? styles.darkModeText : ''}>Loading tasks...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`${styles.container} ${darkMode ? styles.darkMode : ''}`}>
        <div className={styles.header}>
          <h2 className={`${styles.title} ${darkMode ? styles.darkModeText : ''}`}>
            Urgent Tasks
          </h2>
        </div>
        <div className={styles.errorState}>
          <MdError size={24} className={darkMode ? styles.darkModeErrorIcon : styles.errorIcon} />
          <p className={darkMode ? styles.darkModeText : ''}>Error loading tasks: {error}</p>
          <button 
            className={styles.retryButton}
            onClick={() => window.location.reload()}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`${styles.container} ${darkMode ? styles.darkMode : ''}`}>
      <div className={styles.header}>
        <h2 className={`${styles.title} ${darkMode ? styles.darkModeText : ''}`}>
          Urgent Tasks
        </h2>
        <button 
          className={`${styles.viewAllButton} ${darkMode ? styles.darkModeButton : ''}`}
          onClick={() => window.location.href = '/tasks'}
        >
          View All Tasks
        </button>
      </div>
      
      <div className={styles.taskList}>
        {urgentTasks.length > 0 ? (
          urgentTasks.map((task, index) => (
            <motion.div 
              key={task.id || index}
              className={`${styles.taskItem} ${task.status === 'COMPLETED' ? styles.completed : ''} ${darkMode ? styles.darkModeTaskItem : ''}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <div className={styles.checkboxContainer}>
                <input 
                  type="checkbox"
                  id={`task-${task.id}`}
                  className={styles.checkbox}
                  checked={task.status === 'COMPLETED'}
                  onChange={() => handleMarkAsDone(task.id)}
                />
                <label 
                  htmlFor={`task-${task.id}`} 
                  className={`${styles.checkboxLabel} ${darkMode ? styles.darkModeCheckbox : ''}`}
                >
                  <MdCheckCircle className={`${styles.checkIcon} ${darkMode ? styles.darkModeIcon : ''}`} />
                </label>
              </div>
              
              <div className={styles.taskContent}>
                <h3 className={`${styles.taskTitle} ${darkMode ? styles.darkModeText : ''}`}>
                  {task.title}
                </h3>
                <div className={styles.taskMeta}>
                  <span 
                    className={styles.statusIndicator}
                    style={{
                      backgroundColor: `${getStatusColor(task.status)}20`,
                      color: getStatusColor(task.status),
                      padding: '2px 6px',
                      borderRadius: '4px',
                      fontSize: '0.7rem',
                      fontWeight: '500',
                      marginRight: '8px'
                    }}
                  >
                    {formatStatusLabel(task.status)}
                  </span>
                  <span className={`${styles.dueDate} ${darkMode ? styles.darkModeSecondaryText : ''}`}>
                    {formatDate(task.deadline)}
                  </span>
                  <span className={`${styles.priorityBadge} ${getPriorityClass(task.priority)} ${darkMode ? styles.darkModeBadge : ''}`}>
                    {task.priority}
                  </span>
                </div>
              </div>
            </motion.div>
          ))
        ) : (
          <div className={`${styles.emptyState} ${darkMode ? styles.darkModeEmptyState : ''}`}>
            <p className={darkMode ? styles.darkModeText : ''}>No urgent tasks</p>
            <p className={darkMode ? styles.darkModeSecondaryText : ''}>Great job! You're all caught up</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default UpcomingTasks;