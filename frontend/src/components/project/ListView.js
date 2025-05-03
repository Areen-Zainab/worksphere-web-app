import React, { useState, useContext, useMemo } from 'react';
import ProjectContext from '../../contexts/ProjectContext';
import styles from '../../css/project/list-view.module.css';

const ListView = () => {
  const { project, members, getMemberById, getMemberInitials, getMemberColor } = useContext(ProjectContext);
  const [sortField, setSortField] = useState('deadline');
  const [sortDirection, setSortDirection] = useState('asc');
  const [filterPriority, setFilterPriority] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterAssignee, setFilterAssignee] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Get all tasks from all boards
  const allTasks = useMemo(() => {
    return project.boards.flatMap(board => 
      board.tasks.map(task => ({
        ...task,
        status: board.title // Add status based on board title
      }))
    );
  }, [project]);

  // Filter and sort tasks
  const filteredAndSortedTasks = useMemo(() => {
    // First apply filters
    let filtered = [...allTasks];
    
    // Filter by priority
    if (filterPriority !== 'ALL' && filterPriority !== 'all') {
      filtered = filtered.filter(task => task.priority === filterPriority);
    }
    
    // Filter by status
    if (filterStatus !== 'all') {
      filtered = filtered.filter(task => task.status === filterStatus);
    }
    
    // Filter by assignee
    if (filterAssignee !== 'all') {
      filtered = filtered.filter(task => 
        task.assignedTo && 
        task.assignedTo.id && 
        task.assignedTo.id.toString() === filterAssignee.toString()
      );
    }
    
    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(task => 
        (task.title && task.title.toLowerCase().includes(query)) || 
        (task.description && task.description.toLowerCase().includes(query))
      );
    }
    
    // Then sort
    return filtered.sort((a, b) => {
      let comparison = 0;
      
      switch (sortField) {
        case 'title':
          comparison = (a.title || '').localeCompare(b.title || '');
          break;
        case 'priority': 
        {
          const priorityValues = {
            URGENT: 4,
            HIGH: 3,
            MEDIUM: 2,
            LOW: 1
          };
        
          const getPriorityValue = (priority) => 
            priorityValues[(priority || '').toUpperCase()] || 0;
        
          comparison = getPriorityValue(a.priority) - getPriorityValue(b.priority);
          break;
        }
        case 'deadline':
          // Handle null dates - null values should appear last when sorting
          if (!a.deadline && !b.deadline) comparison = 0;
          else if (!a.deadline) comparison = 1;
          else if (!b.deadline) comparison = -1;
          else comparison = new Date(a.deadline) - new Date(b.deadline);
          break;
        case 'status':
          comparison = (a.status || '').localeCompare(b.status || '');
          break;
        default:
          comparison = 0;
      }
      
      return sortDirection === 'asc' ? comparison : -comparison;
    });
  }, [allTasks, sortField, sortDirection, filterPriority, filterStatus, filterAssignee, searchQuery]);
  
  // Handle sort change
  const handleSort = (field) => {
    if (field === sortField) {
      // Toggle direction if already sorting by this field
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // Set new field and default to ascending
      setSortField(field);
      setSortDirection('asc');
    }
  };
  
  // Format the deadline
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };
  
  // Calculate days left for task
  const getDaysLeft = (deadline) => {
    if (!deadline) return null;
    
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

  return (
    <div className={styles.listViewContainer}>
      {/* Search and filters */}
      <div className={styles.filtersContainer}>
        <div className={styles.searchContainer}>
          <input
            type="text"
            placeholder="Search tasks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={styles.searchInput}
          />
        </div>
        
        <div className={styles.filterControls}>
          <div className={styles.filterGroup}>
            <label>Priority:</label>
            <select 
              value={filterPriority} 
              onChange={(e) => setFilterPriority(e.target.value)}
              className={styles.filterSelect}
            >
              <option value="ALL">All</option>
              <option value="URGENT">Urgent</option>
              <option value="HIGH">High</option>
              <option value="MEDIUM">Medium</option>
              <option value="LOW">Low</option>
            </select>
          </div>
          
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
            <label>Assignee:</label>
            <select 
              value={filterAssignee} 
              onChange={(e) => setFilterAssignee(e.target.value)}
              className={styles.filterSelect}
            >
              <option value="all">All</option>
              {members.map(member => (
                <option key={member.id || (member.user && member.user.id)} value={member.id || (member.user && member.user.id)}>
                  {member.name || (member.user && `${member.user.firstName} ${member.user.lastName || ''}`.trim())}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
      
      {/* Task list table */}
      <div className={styles.tableContainer}>
        <table className={styles.taskTable}>
          <thead>
            <tr>
              <th onClick={() => handleSort('title')} className={styles.sortableHeader}>
                Title
                {sortField === 'title' && (
                  <span className={styles.sortIndicator}>
                    {sortDirection === 'asc' ? '↑' : '↓'}
                  </span>
                )}
              </th>
              <th onClick={() => handleSort('priority')} className={styles.sortableHeader}>
                Priority
                {sortField === 'priority' && (
                  <span className={styles.sortIndicator}>
                    {sortDirection === 'asc' ? '↑' : '↓'}
                  </span>
                )}
              </th>
              <th onClick={() => handleSort('status')} className={styles.sortableHeader}>
                Status
                {sortField === 'status' && (
                  <span className={styles.sortIndicator}>
                    {sortDirection === 'asc' ? '↑' : '↓'}
                  </span>
                )}
              </th>
              <th onClick={() => handleSort('deadline')} className={styles.sortableHeader}>
                Due Date
                {sortField === 'deadline' && (
                  <span className={styles.sortIndicator}>
                    {sortDirection === 'asc' ? '↑' : '↓'}
                  </span>
                )}
              </th>
              <th>Assignee</th>
            </tr>
          </thead>
          <tbody>
            {filteredAndSortedTasks.map(task => {
              const daysLeft = task.deadline ? getDaysLeft(task.deadline) : null;
              
              return (
                <tr key={task.id} className={styles.taskRow}>
                  <td className={styles.taskTitleCell}>
                    <div className={styles.taskTitleContainer}>
                      <div className={styles.taskTitle}>{task.title}</div>
                      <div className={styles.taskDescription}>{task.description}</div>
                    </div>
                  </td>
                  <td>
                    <div className={`${styles.priorityBadge} ${styles[(task.priority ? task.priority.toLowerCase() : 'medium') + 'Priority']}`}>
                      {task.priority || 'Medium'}
                    </div>
                  </td>
                  <td>
                    <div className={styles.statusBadge}>
                      {task.status}
                    </div>
                  </td>
                  <td>
                    {task.deadline ? (
                      <div className={styles.dueDateContainer}>
                        <div className={styles.dueDate}>{formatDate(task.deadline)}</div>
                        {daysLeft && (
                          <div className={`${styles.daysLeft} ${daysLeft.className}`}>
                            {typeof daysLeft.value === 'number' ? `${daysLeft.value} ${daysLeft.label}` : daysLeft.value}
                          </div>
                        )}
                      </div>
                    ) : (
                      <span className={styles.noDueDate}>No due date</span>
                    )}
                  </td>
                  <td>
                    <div className={styles.assigneesList}>
                      {task.assignedTo ? (
                        <div className={styles.assigneesContainer}>
                          <div
                            className={styles.assigneeInitial}
                            style={{ backgroundColor: getMemberColor(task.assignedTo.id) }}
                            title={`${task.assignedTo.firstName} ${task.assignedTo.lastName || ''}`.trim()}
                          >
                            {task.assignedTo.firstName[0] + (task.assignedTo.lastName ? task.assignedTo.lastName[0] : '')}
                          </div>
                        </div>
                      ) : (
                        <span className={styles.unassigned}>Unassigned</span>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
            
            {filteredAndSortedTasks.length === 0 && (
              <tr>
                <td colSpan="5" className={styles.emptyState}>
                  <div className={styles.emptyStateMessage}>
                    {searchQuery || filterPriority !== 'all' || filterStatus !== 'all' || filterAssignee !== 'all'
                      ? 'No tasks match your filters. Try adjusting your criteria.'
                      : 'No tasks found. Start by adding tasks in the Kanban view.'}
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ListView;