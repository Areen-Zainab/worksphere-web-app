import React from 'react';
import styles from '../css/project-anaytics.module.css';

const ProjectAnalytics = ({ project, members }) => {
  // Calculate project stats
  const totalTasks = project.boards.reduce((sum, board) => sum + board.tasks.length, 0);
  const completedTasks = project.boards.find(board => board.title === "Done")?.tasks.length || 0;
  const completionPercentage = totalTasks ? Math.round((completedTasks / totalTasks) * 100) : 0;
  
  // Calculate the project deadline (assuming the farthest due date is the project deadline)
  const allDueDates = project.boards
    .flatMap(board => board.tasks)
    .map(task => task.dueDate)
    .filter(date => date);
  
  const deadline = allDueDates.length > 0 
    ? new Date(Math.max(...allDueDates.map(date => new Date(date)))) 
    : null;
  
  // Calculate days remaining
  const daysRemaining = deadline 
    ? Math.ceil((new Date(deadline) - new Date()) / (1000 * 60 * 60 * 24))
    : null;
  
  // Get priority counts
  const priorityCounts = project.boards
    .flatMap(board => board.tasks)
    .reduce((counts, task) => {
      counts[task.priority] = (counts[task.priority] || 0) + 1;
      return counts;
    }, {});
  
  return (
    <div className={styles.analyticsContainer}>
      <div className={styles.analyticsHeader}>
        <h2 className={styles.analyticsTitle}>Project Analytics</h2>
        <div className={styles.dateInfo}>
          {deadline && (
            <div className={styles.deadlineWrapper}>
              <span className={styles.deadlineLabel}>Deadline:</span>
              <span className={styles.deadlineDate}>
                {new Date(deadline).toLocaleDateString('en-US', { 
                  year: 'numeric', 
                  month: 'short', 
                  day: 'numeric' 
                })}
              </span>
              <span className={`${styles.daysRemaining} ${daysRemaining < 7 ? styles.urgent : ''}`}>
                {daysRemaining} days remaining
              </span>
            </div>
          )}
        </div>
      </div>
      
      <div className={styles.metricsGrid}>
        <div className={styles.metricCard}>
          <h3 className={styles.metricTitle}>Completion</h3>
          <div className={styles.progressWrapper}>
            <div className={styles.progressBar}>
              <div 
                className={styles.progressFill} 
                style={{ width: `${completionPercentage}%` }}
              />
            </div>
            <span className={styles.progressText}>{completionPercentage}%</span>
          </div>
          <div className={styles.taskCount}>
            <span className={styles.completedTasks}>{completedTasks}</span>
            <span> / </span>
            <span className={styles.totalTasks}>{totalTasks} tasks</span>
          </div>
        </div>
        
        <div className={styles.metricCard}>
          <h3 className={styles.metricTitle}>Team</h3>
          <div className={styles.memberStats}>
            <div className={styles.statValue}>{members.length}</div>
            <div className={styles.statLabel}>Team Members</div>
          </div>
          <div className={styles.miniMembersList}>
            {members.slice(0, 3).map(member => (
              <div 
                key={member.id} 
                className={styles.miniMemberInitial}
                style={{ backgroundColor: getMemberColor(member.id) }}
                title={member.name}
              >
                {getMemberInitials(member)}
              </div>
            ))}
            {members.length > 3 && (
              <div className={styles.moreMembersCount}>+{members.length - 3}</div>
            )}
          </div>
        </div>
        
        <div className={styles.metricCard}>
          <h3 className={styles.metricTitle}>Status</h3>
          <div className={styles.statusGrids}>
            {project.boards.map(board => (
              <div key={board.id} className={styles.statusItem}>
                <div className={styles.statusLabel}>{board.title}</div>
                <div className={styles.statusValue}>{board.tasks.length}</div>
              </div>
            ))}
          </div>
        </div>
        
        <div className={styles.metricCard}>
          <h3 className={styles.metricTitle}>Priority</h3>
          <div className={styles.priorityBars}>
            <div className={styles.priorityItem}>
              <div className={styles.priorityLabel}>
                <span className={`${styles.priorityDot} ${styles.highPriority}`}></span>
                High
              </div>
              <div className={styles.priorityCount}>{priorityCounts.High || 0}</div>
            </div>
            <div className={styles.priorityItem}>
              <div className={styles.priorityLabel}>
                <span className={`${styles.priorityDot} ${styles.mediumPriority}`}></span>
                Medium
              </div>
              <div className={styles.priorityCount}>{priorityCounts.Medium || 0}</div>
            </div>
            <div className={styles.priorityItem}>
              <div className={styles.priorityLabel}>
                <span className={`${styles.priorityDot} ${styles.lowPriority}`}></span>
                Low
              </div>
              <div className={styles.priorityCount}>{priorityCounts.Low || 0}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper functions for member initials and colors
const getMemberInitials = (member) => {
  const nameParts = member.name.split(' ');
  if (nameParts.length === 1) return nameParts[0][0].toUpperCase();
  return (nameParts[0][0] + nameParts[nameParts.length - 1][0]).toUpperCase();
};

const getMemberColor = (userId) => {
  const colors = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFC43D', '#7768AE', 
    '#1D7874', '#F38181', '#6A0572', '#6F9A8D', '#FB8B24'
  ];
  
  const charSum = userId.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);
  return colors[charSum % colors.length];
};

export default ProjectAnalytics;