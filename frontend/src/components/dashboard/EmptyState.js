import React from 'react';
import { 
  MdAddTask, 
  MdCreateNewFolder
} from 'react-icons/md';
import styles from '../../css/dashboard/EmptyState.module.css';

const EmptyState = ({ type, message, actionLabel }) => {
  const getIcon = () => {
    switch (type) {
      case 'projects':
        return <MdCreateNewFolder size={48} />;
      case 'tasks':
        return <MdAddTask size={48} />;
      default:
        return <MdAddTask size={48} />;
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.iconContainer}>
        {getIcon()}
      </div>
      <h3 className={styles.message}>{message}</h3>
      <button className={styles.actionButton}>
        {actionLabel}
      </button>
    </div>
  );
};

export default EmptyState;