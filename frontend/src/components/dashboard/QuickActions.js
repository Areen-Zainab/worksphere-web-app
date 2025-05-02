import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MdAdd, MdAssignment, MdFavorite, MdHistory, MdArrowForward } from 'react-icons/md';
import styles from '../../css/dashboard/QuickActions.module.css';

const QuickActions = () => {
  const navigate = useNavigate();
  const [hoveredAction, setHoveredAction] = useState(null);
  const [activeAction, setActiveAction] = useState(null);

  // Navigation functions
  const goToCreateProject = () => {
    navigate('/create/project');
  };

  const actions = [
    { 
      icon: <MdAdd size={24} />, 
      label: 'New Project', 
      color: '#3b82f6',
      onClick: goToCreateProject  // Use the navigation function
    },
    { 
      icon: <MdAssignment size={24} />, 
      label: 'My Work', 
      color: '#10b981',
      onClick: () => navigate('/tasks')
    },
    { 
      icon: <MdFavorite size={24} />, 
      label: 'Inbox', 
      color: '#f59e0b',
      onClick: () => navigate('/inbox')
    },
    { 
      icon: <MdHistory size={24} />, 
      label: 'Deadlines', 
      color: '#8b5cf6',
      onClick: () => navigate('/calendar')
    }
  ];

  const handleActionClick = (action, index) => {
    setActiveAction(index);
    action.onClick();
    
    // Reset active state after animation completes
    setTimeout(() => {
      setActiveAction(null);
    }, 500);
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>Quick Actions</h2>
      </div>
      
      <div className={styles.actionGrid}>
        {actions.map((action, index) => (
          <button 
            key={index} 
            className={`${styles.actionButton} ${activeAction === index ? styles.active : ''}`}
            style={{ '--accent-color': action.color }}
            onClick={() => handleActionClick(action, index)}
            onMouseEnter={() => setHoveredAction(index)}
            onMouseLeave={() => setHoveredAction(null)}
            onFocus={() => setHoveredAction(index)}
            onBlur={() => setHoveredAction(null)}
            aria-label={action.label}
          >
            <div 
              className={`${styles.iconContainer} ${hoveredAction === index ? styles.iconHovered : ''}`}
              style={{ backgroundColor: `${action.color}20` }}
            >
              {React.cloneElement(action.icon, { 
                color: action.color, 
                className: styles.icon 
              })}
            </div>
            <span className={styles.actionLabel}>{action.label}</span>
            <div className={styles.arrowContainer}>
              <MdArrowForward 
                size={16} 
                className={styles.arrowIcon} 
                style={{ color: action.color }}
              />
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default QuickActions;