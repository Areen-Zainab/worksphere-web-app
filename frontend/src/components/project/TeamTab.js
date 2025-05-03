import React, { useContext, useMemo, useEffect, useState } from 'react';
import ProjectContext from '../../contexts/ProjectContext';
import styles from '../../css/project/team-tab.module.css';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

const TeamTab = ({ setShowAddMemberForm }) => {
  const { project, members, getMemberInitials, getMemberColor, removeMemberFromProject } = useContext(ProjectContext);
  const [isProjectManager, setIsProjectManager] = useState(false);
  const [loggedInUserId, setLoggedInUserId] = useState(null);
  const [showOptionsForUser, setShowOptionsForUser] = useState(null);
  
  const allTasks = useMemo(() => {
    return project.boards.flatMap(board => 
      board.tasks.map(task => ({
        ...task,
        status: board.title // Add status based on board title
      }))
    );
  }, [project]);

  // Check if current user can remove other users (PROJECT_MANAGER or project owner)
  useEffect(() => {
    const userId = localStorage.getItem('loggedInUserID');
    setLoggedInUserId(userId);
    
    // User can remove others if they are a PROJECT_MANAGER or the project owner
    if (userId && members && project) {
      // Check if user is PROJECT_MANAGER
      const currentUserMember = members.find(member => {
        // Try to get user ID from all possible structures
        let memberId;
        if (member.user && member.user.id) {
          memberId = member.user.id;
        } else if (member.id) {
          memberId = member.id;
        }
        
        return memberId && memberId.toString() === userId;
      });
      
      // Check if user is project owner
      const isOwner = project.owner && 
                      project.owner.id && 
                      project.owner.id.toString() === userId;
      
      setIsProjectManager(
        (currentUserMember && currentUserMember.role === 'PROJECT_MANAGER') || isOwner
      );
    }
  }, [members, project]);

  // Debug log to check task and member structure
  useEffect(() => {
  }, [allTasks, members]);

  // Determine the correct property path for assignedTo.id
  const getAssignedToId = (task) => {
    if (!task.assignedTo) return null;
    
    // If assignedTo is a number, convert to string
    if (typeof task.assignedTo === 'number') {
      return task.assignedTo.toString();
    }
    
    // If assignedTo is an object with an id property (as seen in the sample data)
    if (typeof task.assignedTo === 'object') {
      // Direct id property (most common case)
      if (task.assignedTo.id) {
        return task.assignedTo.id.toString();
      }
      
      // Object with user property containing id (alternative structure)
      if (task.assignedTo.user && task.assignedTo.user.id) {
        return task.assignedTo.user.id.toString();
      }
    }
    
    // If assignedTo is a string
    if (typeof task.assignedTo === 'string') {
      return task.assignedTo;
    }
    
    return null;
  };

  // Handle remove user from project
  const handleRemoveUser = (userId) => {
    if (window.confirm('Are you sure you want to remove this user from the project?')) {
      // Convert userId to string if it's a number
      const userIdStr = userId.toString();
      removeMemberFromProject(userIdStr);
      setShowOptionsForUser(null);
    }
  };
  
  // Toggle options menu for a user
  const toggleOptionsMenu = (userId) => {
    setShowOptionsForUser(showOptionsForUser === userId ? null : userId);
  };

  // Calculate member workload and stats
  const memberStats = useMemo(() => {
    return members.map(member => {
      // Get member ID considering different possible structures
      let memberId;
      
      // If member has a user object with id
      if (member.user && member.user.id) {
        memberId = member.user.id;
      }
      
      if (!memberId) return null;
      
      const memberIdStr = memberId.toString();
      
      // Debug log
      //console.log(`Processing member: ${memberIdStr}, name: ${member.name || (member.user && member.user.firstName)}`);
      
      // Get tasks assigned to this member
      const assignedTasks = allTasks.filter(task => {
        const taskAssigneeId = getAssignedToId(task);
        const isAssigned = taskAssigneeId === memberIdStr;
        
        // Debug log for each task assignment check
        if (taskAssigneeId) {
          //console.log(`Task ${task.id} (${task.title}) assigned to ${taskAssigneeId}, matching member ${memberIdStr}: ${isAssigned}`);
        }
        
        return isAssigned;
      });
      
      console.log(`Member ${memberIdStr} has ${assignedTasks.length} assigned tasks`);
      
      // Count tasks by status
      const tasksByStatus = {};
      project.boards.forEach(board => {
        tasksByStatus[board.title] = assignedTasks.filter(task => task.status === board.title).length;
      });
      
      // Count tasks by priority
      const tasksByPriority = {
        High: assignedTasks.filter(task => task.priority === 'HIGH').length,
        Medium: assignedTasks.filter(task => task.priority === 'MEDIUM').length,
        Low: assignedTasks.filter(task => task.priority === 'LOW').length
      };
      
      // In case the priorities are stored as "High", "Medium", "Low" instead of "HIGH", "MEDIUM", "LOW"
      if (tasksByPriority.High === 0 && tasksByPriority.Medium === 0 && tasksByPriority.Low === 0) {
        tasksByPriority.High = assignedTasks.filter(task => task.priority === 'High').length;
        tasksByPriority.Medium = assignedTasks.filter(task => task.priority === 'Medium').length;
        tasksByPriority.Low = assignedTasks.filter(task => task.priority === 'Low').length;
      }
      
      // Calculate completion rate
      const completedTasks = assignedTasks.filter(task => 
        task.status === 'COMPLETED'
      ).length;
      
      const completionRate = assignedTasks.length > 0 
        ? Math.round((completedTasks / assignedTasks.length) * 100) 
        : 0;
      
      // Find nearest upcoming task
      const upcomingTasks = assignedTasks
        .filter(task => {
          if (!task.deadline) return false;
          const deadline = new Date(task.deadline);
          const today = new Date();
          return deadline >= today && task.status.toUpperCase() !== 'COMPLETED';
        })
        .sort((a, b) => new Date(a.deadline) - new Date(b.deadline));
      
      const nextDueTask = upcomingTasks.length > 0 ? upcomingTasks[0] : null;
      
      // Find overdue tasks
      const overdueTasks = assignedTasks.filter(task => {
        if (!task.deadline) return false;
        const deadline = new Date(task.deadline);
        const today = new Date();
        return deadline < today && task.status.toUpperCase() !== 'COMPLETED';
      });
      
      // Get member name from appropriate source
      const memberName = member.name || 
        (member.user ? `${member.user.firstName} ${member.user.lastName || ''}`.trim() : 'Unknown');
      
      const memberRole = member.role || 
        (member.projectRole ? member.projectRole : 'Team Member');
      
      return {
        id: memberId,
        name: memberName,
        role: memberRole,
        assignedTasks,
        tasksByStatus,
        tasksByPriority,
        completionRate,
        nextDueTask,
        overdueTasks,
        totalTasks: assignedTasks.length
      };
    }).filter(Boolean); // Remove any null entries
  }, [allTasks, members, project.boards]);

  // Colors for the charts
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#A28BFC', '#FF6B6B'];
  
  // Priority colors
  const PRIORITY_COLORS = {
    High: '#FF6B6B',
    Medium: '#FFC43D',
    Low: '#4ECDC4'
  };
  
  // Format the due date
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <div className={styles.teamTabContainer}>
      <div className={styles.teamHeader}>
        <h2 className={styles.teamTitle}>Team Members</h2>
        {isProjectManager && (
          <button
            onClick={() => setShowAddMemberForm(true)}
            className={styles.addMemberBtn}
          >
            + Add Member
          </button>
        )}
      </div>
      
      <div className={styles.teamMembersGrid}>
        {memberStats.map(member => (
          <div key={member.id} className={styles.memberCard}>
            <div className={styles.memberCardHeader}>
              <div 
                className={styles.memberAvatar}
                style={{ backgroundColor: getMemberColor(member.id) }}
              >
                {getMemberInitials(member)}
              </div>
              <div className={styles.memberInfo}>
                <h3 className={styles.memberName}>{member.name}</h3>
                <p className={styles.memberRole}>{member.role}</p>
              </div>
              
              {/* Options menu for PROJECT_MANAGER or project owner to manage TEAM_MEMBER and SPECTATOR users */}
              {isProjectManager && 
               loggedInUserId !== member.id.toString() && 
               (member.role === 'TEAM_MEMBER' || member.role === 'SPECTATOR') && (
                <div className={styles.memberOptions}>
                  <button 
                    className={styles.optionsButton}
                    onClick={() => toggleOptionsMenu(member.id)}
                    aria-label="Member options"
                  >
                    ...
                  </button>
                  
                  {showOptionsForUser === member.id && (
                    <div className={styles.optionsMenu}>
                      <button 
                        className={styles.optionMenuItem}
                        onClick={() => handleRemoveUser(member.id)}
                      >
                        Remove from project
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
            
            <div className={styles.memberStatsSummary}>
              <div className={styles.memberStatItem}>
                <span className={styles.statNumber}>{member.totalTasks}</span>
                <span className={styles.statLabel}>Total Tasks</span>
              </div>
              <div className={styles.memberStatItem}>
                <span className={styles.statNumber}>{member.completionRate}%</span>
                <span className={styles.statLabel}>Completion</span>
              </div>
              <div className={styles.memberStatItem}>
                <span className={styles.statNumber}>{member.overdueTasks.length}</span>
                <span className={styles.statLabel}>Overdue</span>
              </div>
            </div>
            
            {/* Priority distribution chart */}
            <div className={styles.memberChartSection}>
              <h4 className={styles.memberChartTitle}>Task Priorities</h4>
              <div className={styles.memberChart}>
                {member.totalTasks > 0 ? (
                  <ResponsiveContainer width="100%" height={120}>
                    <PieChart>
                      <Pie
                        data={[  
                          { name: 'High', value: member.tasksByPriority.High },
                          { name: 'Medium', value: member.tasksByPriority.Medium },
                          { name: 'Low', value: member.tasksByPriority.Low }
                        ]}
                        cx="50%"
                        cy="50%"
                        innerRadius={25}
                        outerRadius={40}
                        fill="#8884d8"
                        dataKey="value"
                        nameKey="name"
                      >
                        <Cell key="cell-high" fill={PRIORITY_COLORS.High} />
                        <Cell key="cell-medium" fill={PRIORITY_COLORS.Medium} />
                        <Cell key="cell-low" fill={PRIORITY_COLORS.Low} />
                      </Pie>
                      <Tooltip formatter={(value) => [`${value} tasks`, 'Count']} />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className={styles.noDataMessage}>No tasks assigned</div>
                )}
              </div>
              
              {/* Priority legend */}
              {member.totalTasks > 0 && (
                <div className={styles.priorityLegend}>
                  <div className={styles.legendItem}>
                    <div className={styles.legendColor} style={{ backgroundColor: PRIORITY_COLORS.High }}></div>
                    <span>High: {member.tasksByPriority.High}</span>
                  </div>
                  <div className={styles.legendItem}>
                    <div className={styles.legendColor} style={{ backgroundColor: PRIORITY_COLORS.Medium }}></div>
                    <span>Medium: {member.tasksByPriority.Medium}</span>
                  </div>
                  <div className={styles.legendItem}>
                    <div className={styles.legendColor} style={{ backgroundColor: PRIORITY_COLORS.Low }}></div>
                    <span>Low: {member.tasksByPriority.Low}</span>
                  </div>
                </div>
              )}
            </div>
            
            {/* Next due task */}
            <div className={styles.memberTaskSection}>
              <h4 className={styles.memberSectionTitle}>Next Due Task</h4>
              {member.nextDueTask ? (
                <div className={styles.nextDueTask}>
                  <div className={styles.taskTitleRow}>
                    <div className={styles.taskTitle}>{member.nextDueTask.title}</div>
                    <div className={`${styles.priorityBadge} ${styles[(member.nextDueTask.priority || 'Medium').toLowerCase() + 'Priority']}`}>
                      {member.nextDueTask.priority || 'Medium'}
                    </div>
                  </div>
                  <div className={styles.taskDescription}>{member.nextDueTask.description}</div>
                  <div className={styles.taskDueDate}>
                    Due: {formatDate(member.nextDueTask.deadline)}
                  </div>
                </div>
              ) : (
                <div className={styles.noTaskMessage}>No upcoming tasks</div>
              )}
            </div>
            
            {/* Status breakdown */}
            <div className={styles.memberTaskSection}>
              <h4 className={styles.memberSectionTitle}>Task Status</h4>
              <div className={styles.statusBreakdown}>
                {Object.entries(member.tasksByStatus).map(([status, count]) => (
                  <div key={status} className={styles.statusItem}>
                    <div className={styles.statusLabel}>{status}</div>
                    <div className={styles.statusCount}>{count}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {memberStats.length === 0 && (
        <div className={styles.emptyTeamState}>
          <p>No team members yet. Add team members to track their workload and performance.</p>
          <button
            onClick={() => setShowAddMemberForm(true)}
            className={styles.addMemberBtnLarge}
          >
            Add First Team Member
          </button>
        </div>
      )}
    </div>
  );
};

export default TeamTab;