import React, { useContext, useMemo, useState } from 'react';
import ProjectContext from '../../contexts/ProjectContext';
import styles from '../../css/project/timeline-view.module.css';

const TimelineView = () => {
  const { project, getMemberById, getMemberInitials, getMemberColor } = useContext(ProjectContext);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [filterAssignee, setFilterAssignee] = useState('all');

  // Get all tasks with deadlines from all boards
  const tasksWithDeadlines = useMemo(() => {
    return project.boards
      .flatMap(board => 
        board.tasks
          .filter(task => task.deadline) // Only include tasks with deadlines
          .map(task => ({
            ...task,
            status: board.title // Add status based on board title
          }))
      )
      .sort((a, b) => new Date(a.deadline) - new Date(b.deadline)); // Sort by deadline
  }, [project]);

  // Apply filters
  const filteredTasks = useMemo(() => {
    let filtered = [...tasksWithDeadlines];
    
    // Filter by status
    if (filterStatus !== 'all') {
      filtered = filtered.filter(task => task.status === filterStatus);
    }
    
    // Filter by priority
    if (filterPriority !== 'all') {
      filtered = filtered.filter(task => task.priority === filterPriority);
    }
    
    // Filter by assignee - handle the assignedTo as an object with an id property
    if (filterAssignee !== 'all') {
      filtered = filtered.filter(task => 
        task.assignedTo && 
        task.assignedTo.id && 
        task.assignedTo.id.toString() === filterAssignee.toString()
      );
    }
    
    return filtered;
  }, [tasksWithDeadlines, filterStatus, filterPriority, filterAssignee]);

  // Group tasks by month and year
  const tasksByMonthYear = useMemo(() => {
    const groupedTasks = {};
    
    filteredTasks.forEach(task => {
      const date = new Date(task.deadline);
      const monthYear = `${date.toLocaleString('default', { month: 'long' })} ${date.getFullYear()}`;
      
      if (!groupedTasks[monthYear]) {
        groupedTasks[monthYear] = [];
      }
      
      groupedTasks[monthYear].push(task);
    });
    
    return groupedTasks;
  }, [filteredTasks]);
  
  // Get unique months in chronological order
  const monthsInOrder = useMemo(() => {
    const months = Object.keys(tasksByMonthYear).map(monthYear => {
      const [month, year] = monthYear.split(' ');
      return { monthYear, date: new Date(Date.parse(`${month} 1, ${year}`)) };
    });
    
    return months.sort((a, b) => a.date - b.date).map(item => item.monthYear);
  }, [tasksByMonthYear]);
  
  // Calculate days left for task
  const getDaysLeft = (deadline) => {
    const today = new Date();
    const taskDeadline = new Date(deadline);
    const diffTime = taskDeadline - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) {
      return { value: Math.abs(diffDays), label: 'overdue', className: styles.overdue };
    } else if (diffDays === 0) {
      return { value: 'Today', label: 'due', className: styles.dueToday };
    } else {
      return { value: diffDays, label: 'days left', className: styles.upcoming };
    }
  };
  
  // Format the deadline
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  };

  return (
    <div className={styles.timelineContainer}>
      {/* Filters */}
      <div className={styles.timelineFilters}>
        <div className={styles.filterGroup}>
          <label>Status:</label>
          <select 
            value={filterStatus} 
            onChange={(e) => setFilterStatus(e.target.value)}
            className={styles.filterSelect}
          >
            <option value="all">All</option>
            {project.boards.map(board => (
              <option key={board.id} value={board.title}>
                {board.title}
              </option>
            ))}
          </select>
        </div>
        
        <div className={styles.filterGroup}>
          <label>Priority:</label>
          <select 
            value={filterPriority} 
            onChange={(e) => setFilterPriority(e.target.value)}
            className={styles.filterSelect}
          >
            <option value="all">All</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>
        </div>
        
        <div className={styles.filterGroup}>
          <label>Assignee:</label>
          <select 
            value={filterAssignee} 
            onChange={(e) => setFilterAssignee(e.target.value)}
            className={styles.filterSelect}
          >
            <option value="all">All</option>
            {project.members && project.members.map(member => (
              <option key={member.id} value={member.id}>
                {member.name || (member.user && `${member.user.firstName} ${member.user.lastName}`)}
              </option>
            ))}
          </select>
        </div>
      </div>
      
      {/* Timeline content */}
      <div className={styles.timelineContent}>
        {monthsInOrder.length > 0 ? (
          monthsInOrder.map(monthYear => (
            <div key={monthYear} className={styles.timelineMonth}>
              <h3 className={styles.monthHeader}>{monthYear}</h3>
              <div className={styles.monthTasks}>
                {tasksByMonthYear[monthYear].map(task => {
                  const daysLeft = getDaysLeft(task.deadline);
                  
                  return (
                    <div key={task.id} className={styles.timelineTaskCard}>
                      <div className={styles.timelineDate}>
                        <div className={styles.dateValue}>{formatDate(task.deadline)}</div>
                        <div className={`${styles.daysLeft} ${daysLeft.className}`}>
                          {typeof daysLeft.value === 'number' ? `${daysLeft.value} ${daysLeft.label}` : daysLeft.value}
                        </div>
                      </div>
                      
                      <div className={styles.timelineTaskInfo}>
                        <h4 className={styles.timelineTaskTitle}>{task.title}</h4>
                        <p className={styles.timelineTaskDescription}>{task.description}</p>
                        
                        <div className={styles.timelineTaskMeta}>
                          <div className={`${styles.priorityBadge} ${styles[task.priority ? task.priority.toLowerCase() + 'Priority' : 'mediumPriority']}`}>
                            {task.priority || 'Medium'}
                          </div>
                          <div className={styles.statusBadge}>
                            {task.status}
                          </div>
                        </div>
                        
                        {task.assignedTo && (
                          <div className={styles.timelineTaskAssignees}>
                            <div
                              key={task.assignedTo.id}
                              className={styles.assigneeInitial}
                              style={{ backgroundColor: getMemberColor(task.assignedTo.id) }}
                              title={`${task.assignedTo.firstName} ${task.assignedTo.lastName}`}
                            >
                              {task.assignedTo.firstName[0] + (task.assignedTo.lastName ? task.assignedTo.lastName[0] : '')}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))
        ) : (
          <div className={styles.emptyTimeline}>
            <div className={styles.emptyStateMessage}>
              {filterStatus !== 'all' || filterPriority !== 'all' || filterAssignee !== 'all'
                ? 'No tasks match your filters. Try adjusting your criteria.'
                : 'No tasks with deadlines found. Add deadlines to your tasks to see them on the timeline.'}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TimelineView;