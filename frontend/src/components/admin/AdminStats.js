import React from 'react';
import styles from '../../css/admin/adminStats.module.css';

const AdminStats = ({ stats, darkMode }) => {
  const statItems = [
    {
      id: 'users',
      label: 'Total Users',
      value: stats.totalUsers || 0,
      icon: 'people',
      color: '#4285F4'  // Blue
    },
    {
      id: 'projects',
      label: 'Active Projects',
      value: stats.activeProjects || 0,
      icon: 'folder',
      color: '#34A853'  // Green
    },
    {
      id: 'completed',
      label: 'Tasks Completed',
      value: stats.tasksCompleted || 0,
      icon: 'check_circle',
      color: '#FBBC05'  // Yellow
    },
    {
      id: 'pending',
      label: 'Tasks Pending',
      value: stats.tasksPending || 0,
      icon: 'pending',
      color: '#EA4335'  // Red
    }
  ];
  
  return (
    <div className={`${styles.statsContainer} ${darkMode ? styles.darkMode : ''}`}>
      <h2 className={styles.statsTitle}>System Overview</h2>
      
      <div className={styles.statsGrid}>
        {statItems.map((item) => (
          <div 
            key={item.id}
            className={styles.statCard}
            style={{ 
              '--stat-color': item.color 
            }}  // CSS variable for styling
          >
            <div className={styles.statIcon}>
              {renderStatIcon(item.icon)}
            </div>
            
            <div className={styles.statContent}>
              <div className={styles.statValue}>{item.value}</div>
              <div className={styles.statLabel}>{item.label}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Helper function to render SVG icons based on the icon name
function renderStatIcon(iconName) {
  switch (iconName) {
    case 'people':
      return (
        <svg className={styles.icon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      );
    case 'folder':
      return (
        <svg className={styles.icon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
        </svg>
      );
    case 'check_circle':
      return (
        <svg className={styles.icon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      );
    case 'pending':
      return (
        <svg className={styles.icon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      );
    default:
      return (
        <svg className={styles.icon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      );
  }
}

export default AdminStats;