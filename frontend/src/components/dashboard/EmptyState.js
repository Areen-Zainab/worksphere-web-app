import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  MdAddTask, 
  MdCreateNewFolder
} from 'react-icons/md';
import styles from '../../css/dashboard/EmptyState.module.css';

const EmptyState = ({ type, message, actionLabel, onAction, darkMode }) => {
  const navigate = useNavigate();

  const getIcon = () => {
    switch (type) {
      case 'projects':
        return <MdCreateNewFolder size={48} className={styles.icon} />;
      case 'tasks':
        return <MdAddTask size={48} className={styles.icon} />;
      default:
        return <MdAddTask size={48} className={styles.icon} />;
    }
  };

  // Handle action button click
  const handleActionClick = () => {
    if (onAction) {
      // If a callback was provided, use it
      onAction();
    } else if (type === 'projects') {
      // Default behavior for projects empty state
      navigate('/createProject');
    } else if (type === 'tasks') {
      // Default behavior for tasks empty state
      console.log('Add task clicked');
      // You can add navigation to task creation page here
    }
  };

  return (
    <div className={`${styles.container} ${darkMode ? styles.darkMode : ''}`}>
      <div className={styles.iconContainer}>
        {getIcon()}
      </div>
      <h3 className={styles.message}>{message}</h3>
      <button 
        className={styles.actionButton}
        onClick={handleActionClick}
      >
        {actionLabel}
      </button>
    </div>
  );
};

export default EmptyState;