import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { MdCheckCircle, MdFlag } from 'react-icons/md';
import styles from '../../css/dashboard/UpcomingTasks.module.css';
import { useDarkMode } from '../../contexts/DarkModeContext';

const UpcomingTasks = ({ tasks: initialTasks }) => {
  const { darkMode } = useDarkMode();
  const [tasks, setTasks] = useState(initialTasks);

  // Sort tasks by due date (earliest first)
  const sortedTasks = [...tasks].sort((a, b) =>
    new Date(a.dueDate) - new Date(b.dueDate)
  );

  // Limit to 4 tasks
  const limitedSortedTasks = sortedTasks.slice(0, 4);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    if (date.getTime() === today.getTime()) {
      return 'Today';
    } else if (date.getTime() === tomorrow.getTime()) {
      return 'Tomorrow';
    } else {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
      });
    }
  };

  const getPriorityClass = (priority) => {
    switch (priority) {
      case 'High':
        return styles.priorityHigh;
      case 'Medium':
        return styles.priorityMedium;
      case 'Low':
        return styles.priorityLow;
      default:
        return '';
    }
  };

  const handleMarkAsDone = (taskId) => {
    setTasks(prevTasks => 
      prevTasks.map(task => 
        task.id === taskId ? { ...task, completed: !task.completed } : task
      )
    );
  };

  return (
    <div className={`${styles.container} ${darkMode ? styles.darkMode : ''}`}>
      <div className={styles.header}>
        <h2 className={`${styles.title} ${darkMode ? styles.darkModeText : ''}`}>
          Upcoming Tasks
        </h2>
        <button className={`${styles.viewAllButton} ${darkMode ? styles.darkModeButton : ''}`}>
          View All Tasks
        </button>
      </div>
      
      <div className={styles.taskList}>
        {limitedSortedTasks.length > 0 ? (
          limitedSortedTasks.map((task, index) => (
            <motion.div 
              key={task.id || index}
              className={`${styles.taskItem} ${task.completed ? styles.completed : ''} ${darkMode ? styles.darkModeTaskItem : ''}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <div className={styles.checkboxContainer}>
                <input 
                  type="checkbox"
                  id={`task-${task.id}`}
                  className={styles.checkbox}
                  checked={task.completed || false}
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
                  <span className={`${styles.dueDate} ${darkMode ? styles.darkModeSecondaryText : ''}`}>
                    {formatDate(task.dueDate)}
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
            <p className={darkMode ? styles.darkModeText : ''}>No upcoming tasks</p>
            <p className={darkMode ? styles.darkModeSecondaryText : ''}>Add tasks to see them here</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default UpcomingTasks;