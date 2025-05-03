import React, { useState, useContext, useEffect } from 'react';
import styles from '../../css/dashboard/ProjectOverview.module.css';
import { MoreHorizontal, CheckCircle, Plus, Users } from 'lucide-react';
import { useDarkMode } from '../../contexts/DarkModeContext';


const userId = localStorage.getItem("loggedInUserID");

const ProjectsSection = () => {
  const { darkMode } = useDarkMode();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [displayCount, setDisplayCount] = useState(4);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [projectMembersLoading, setProjectMembersLoading] = useState({});

  // Fetch detailed project members for a specific project
  const fetchProjectMembers = async (projectId) => {
    try {
      setProjectMembersLoading(prev => ({ ...prev, [projectId]: true }));
      
      const response = await fetch(
        `http://localhost:8080/api/projects/${projectId}/members?userId=${userId}`
      );
      
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      
      const membersData = await response.json();
      
      // Update the projects state with the new members data
      setProjects(currentProjects => {
        return currentProjects.map(project => {
          if (project.id === projectId) {
            // Get owner information from the project
            const ownerInfo = { id: project.ownerId, name: project.ownerName || 'Project Owner' };
            
            // Process member data from the API
            let teamMembers = membersData || [];
            
            // Make sure owner is included in the team display
            const ownerInTeam = teamMembers.find(member => 
              member.user?.id === project.ownerId || member.userId === project.ownerId
            );
            
            // If owner is not in team members list, add them
            if (!ownerInTeam && project.ownerId) {
              teamMembers.push({
                user: ownerInfo,
                userId: project.ownerId,
                isOwner: true,
                firstName: ownerInfo.firstName,
                lastName: ownerInfo.lastName
              });
            }
            
            // Process team members data
            const team = teamMembers.map(member => {
              // Check for various name property formats
              let memberName = '';
              if (member.user?.firstName && member.user?.lastName) {
                memberName = `${member.user.firstName} ${member.user.lastName}`;
              } else if (member.firstName && member.lastName) {
                memberName = `${member.firstName} ${member.lastName}`;
              } else {
                memberName = member.user?.name || member.name || '';
              }
              
              const memberId = member.user?.id || member.userId || '';
              const isOwner = memberId === project.ownerId;
              const memberRole = member.role || '';
              
              return {
                id: memberId,
                initials: getInitials(memberName),
                name: memberName,
                isOwner: isOwner,
                role: memberRole,
                color: generateRandomColor(memberId || Math.random()),
              };
            });
            
            return {
              ...project,
              team,
              membersLoaded: true
            };
          }
          return project;
        });
      });
      
    } catch (err) {
      console.error(`Failed to fetch members for project ${projectId}:`, err);
    } finally {
      setProjectMembersLoading(prev => ({ ...prev, [projectId]: false }));
    }
  };

  // Fetch projects from the backend that are owned by or assigned to the specified user
  useEffect(() => {
    const fetchUserProjects = async () => {
      if (!userId) {
        setError('User ID is required');
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        // Use the endpoint that returns all projects associated with a user (both owned and member)
        const response = await fetch(`http://localhost:8080/api/projects/user/${userId}?userId=${userId}`);
        
        if (!response.ok) {
          throw new Error(`Error: ${response.status}`);
        }
        
        const data = await response.json();
        
        // Process the data to ensure it has all required properties
        const processedProjects = data.map(project => {
          // Get owner information from the API response
          const ownerInfo = project.owner || { id: project.ownerId };
          
          // Format owner name based on API response structure
          const ownerName = ownerInfo.firstName && ownerInfo.lastName 
            ? `${ownerInfo.firstName} ${ownerInfo.lastName}`
            : ownerInfo.name || 'Project Owner';
          
          // Create initial team array with just the owner
          // We'll load the full team separately with fetchProjectMembers
          const team = [{
            id: project.ownerId,
            initials: getInitials(ownerName),
            name: ownerName,
            isOwner: true,
            color: generateRandomColor(project.ownerId || Math.random()),
          }];
          
          return {
            ...project,
            statusColor: getStatusColor(project.status),
            statusColorRgb: getStatusColorRgb(project.status),
            team,
            completedTasks: project.completedTaskCount || 0,
            totalTasks: project.totalTaskCount || 0,
            progress: project.progress || calculateProgress(project),
            isOwner: project.ownerId === userId,
            membersLoaded: false
          };
        });
        
        setProjects(processedProjects);
        
        // For each project, fetch the detailed members list
        processedProjects.forEach(project => {
          fetchProjectMembers(project.id);
        });
        
      } catch (err) {
        setError(err.message);
        console.error('Failed to fetch user projects:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserProjects();
  }, [userId]);

  // Helper function to get initials from name
  const getInitials = (name) => {
    if (!name || typeof name !== 'string') return 'NA';
    
    // Trim whitespace and handle empty strings
    const trimmedName = name.trim();
    if (trimmedName === '') return 'NA';
    
    // Get first letter of each word in the name (up to 2 initials)
    return trimmedName
      .split(' ')
      .filter(part => part.length > 0) // Filter out empty parts
      .map(part => part.charAt(0))
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  // Helper function to generate consistent colors
  const generateRandomColor = (seed) => {
    const colors = [
      '#F87171', '#FB923C', '#FBBF24', '#A3E635', 
      '#34D399', '#22D3EE', '#60A5FA', '#A78BFA', 
      '#E879F9', '#FB7185'
    ];
    
    if (typeof seed !== 'string' && typeof seed !== 'number') {
      // Handle edge case with invalid seed
      seed = Math.random().toString();
    }
    
    const seedString = seed.toString();
    const seedValue = seedString.split('').reduce((a, b) => {
      return a + b.charCodeAt(0);
    }, 0);
    
    return colors[Math.abs(seedValue % colors.length)];
  };

  // Helper to determine status color
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
  
  // Helper to determine status color in RGB format
  const getStatusColorRgb = (status) => {
    switch (status?.toLowerCase()) {
      case 'not_started':
        return '99, 102, 241'; // indigo
      case 'in_progress':
        return '59, 130, 246'; // blue
      case 'completed':
        return '16, 185, 129'; // green
      case 'on_hold':
        return '245, 158, 11'; // amber
      case 'cancelled':
        return '156, 163, 175'; // gray
      default:
        return '107, 114, 128'; // gray
    }
  };
  
  // Helper to refresh project members
  const refreshProjectMembers = (projectId) => {
    fetchProjectMembers(projectId);
  };
  
  // Calculate progress from tasks
  const calculateProgress = (project) => {
    if (!project.totalTaskCount || project.totalTaskCount === 0) {
      return 0;
    }
    return Math.round((project.completedTaskCount / project.totalTaskCount) * 100);
  };

  // Handle View All click
  const handleViewAll = () => {
    if (displayCount === 4) {
      setDisplayCount(projects.length);
    } else {
      setDisplayCount(4);
    }
  };

  // Toggle dropdown menu for a specific project
  const toggleDropdown = (projectId) => {
    setActiveDropdown(activeDropdown === projectId ? null : projectId);
  };

  // Dynamic class to apply dark mode styling
  const containerClass = `${styles.container} ${darkMode ? styles.darkMode : ''}`;

  if (loading) {
    return (
      <div className={containerClass}>
        <div className={styles.header}>
          <h2 className={styles.title}>Projects</h2>
        </div>
        <div className={styles.loading}>Loading projects...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={containerClass}>
        <div className={styles.header}>
          <h2 className={styles.title}>Projects</h2>
        </div>
        <div className={styles.error}>
          Error loading projects: {error}
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

  // Format status label for display (convert not_started to Not Started)
  const formatStatusLabel = (status) => {
    if (!status) return '';
    return status
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  // Group projects by status for legend
  const statusCount = {};
  projects.forEach(project => {
    const status = project.status?.toLowerCase() || 'unknown';
    statusCount[status] = (statusCount[status] || 0) + 1;
  });

  // Sort statuses by predefined order
  const statusOrder = ['not_started', 'in_progress', 'on_hold', 'completed', 'cancelled'];
  const sortedStatuses = Object.keys(statusCount).sort(
    (a, b) => statusOrder.indexOf(a) - statusOrder.indexOf(b)
  );

  return (
    <div className={containerClass}>
      <div className={styles.header}>
        <h2 className={styles.title}>My Projects</h2>
        <div className={styles.headerControls}>
          {projects.length > 0 && (
            <div className={styles.projectStats}>
              <span className={styles.ownedProjects}>
                {projects.filter(p => p.isOwner).length} Owned
              </span>
              <span className={styles.assignedProjects}>
                {projects.filter(p => !p.isOwner).length} Assigned
              </span>
            </div>
          )}
          {projects.length > 4 && (
            <button 
              className={styles.viewAllButton} 
              onClick={handleViewAll}
            >
              {displayCount === 4 ? 'View All' : 'Show Less'}
            </button>
          )}
        </div>
      </div>
      
      {/* Status Legend */}
      {projects.length > 0 && (
        <div className={styles.statusLegend} style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '16px' }}>
          {sortedStatuses.map(status => (
            <div 
              key={status} 
              style={{ 
                display: 'inline-flex', 
                alignItems: 'center',
                fontSize: '0.75rem',
                color: darkMode ? '#D1D5DB' : '#4B5563'
              }}
            >
              <span 
                style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  backgroundColor: getStatusColor(status),
                  marginRight: '4px',
                  display: 'inline-block'
                }}
              ></span>
              <span style={{ textTransform: 'capitalize' }}>{formatStatusLabel(status)}</span>
              <span style={{ marginLeft: '4px', opacity: 0.7 }}>({statusCount[status]})</span>
            </div>
          ))}
        </div>
      )}
      
      {projects.length === 0 ? (
        <div className={styles.noProjects}>No projects found.</div>
      ) : (
        <>
          <div className={styles.projectGrid}>
            {projects.slice(0, displayCount).map((project) => (
              <div 
                key={project.id} 
                className={styles.projectCard}
                tabIndex="0"
                aria-label={`Project: ${project.name}`}
              >
                <div className={styles.projectHeader}>
                  <div className={styles.projectNameContainer}>
                    <h3 className={styles.projectName}>{project.name}</h3>
                    {project.isOwner && (
                      <span className={styles.ownerBadge} title="You are the owner of this project">
                        Owner
                      </span>
                    )}
                  </div>
                  <div className={styles.cardActions}>
                    <span
                      className={styles.statusIndicator}
                      style={{
                        '--status-color': project.statusColor,
                        '--status-color-rgb': project.statusColorRgb,
                        backgroundColor: `rgba(${project.statusColorRgb}, 0.15)`,
                        color: project.statusColor,
                        padding: '4px 8px',
                        borderRadius: '4px',
                        fontWeight: '500',
                        fontSize: '0.75rem',
                        display: 'inline-flex',
                        alignItems: 'center'
                      }}
                    >
                      <span 
                        style={{
                          width: '8px',
                          height: '8px',
                          borderRadius: '50%',
                          backgroundColor: project.statusColor,
                          marginRight: '4px',
                          display: 'inline-block'
                        }}
                      ></span>
                      {formatStatusLabel(project.status)}
                    </span>
                    <div className={styles.dropdownContainer}>
                      <button 
                        className={styles.moreButton} 
                        aria-label="More options"
                        onClick={() => toggleDropdown(project.id)}
                      >
                        <MoreHorizontal size={16} />
                      </button>
                      
                      {activeDropdown === project.id && (
                        <div className={styles.dropdownMenu}>
                          {project.isOwner ? (
                            <>
                              <button>Edit Project</button>
                              <button>Manage Team</button>
                              <button onClick={() => refreshProjectMembers(project.id)}>Refresh Members</button>
                              <button>Archive</button>
                            </>
                          ) : (
                            <>
                              <button>View Details</button>
                              <button>View Tasks</button>
                              <button onClick={() => refreshProjectMembers(project.id)}>Refresh Members</button>
                              <button>Leave Project</button>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className={styles.progressContainer}>
                  <div className={styles.progressInfo}>
                    <span>Progress</span>
                    <span className={styles.percentage}>{project.progress}%</span>
                  </div>
                  <div className={styles.progressBarContainer}>
                    <div
                      className={styles.progressBar}
                      style={{ width: `${project.progress}%` }}
                    />
                  </div>
                </div>
                
                <div className={styles.projectFooter}>
                  <div className={styles.teamMembers}>
                    {project.team.slice(0, 5).map((member, index) => (
                      <div
                        key={`${project.id}-member-${member.id}-${index}`}
                        className={styles.memberAvatar}
                        style={{
                          backgroundColor: member.color,
                          zIndex: project.team.length - index,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: '600',
                          fontSize: '0.75rem'
                        }}
                        title={`${member.name}${member.isOwner ? ' (Owner)' : ''}${member.role ? ` - ${member.role}` : ''}`}
                      >
                        {member.initials || 'NA'}
                        {member.isOwner && (
                          <span className={styles.ownerIndicator}></span>
                        )}
                      </div>
                    ))}
                    
                    {/* Show the remaining members count if there are more than 5 members */}
                    {project.team.length > 5 && (
                      <div
                        className={styles.memberAvatar}
                        style={{
                          backgroundColor: darkMode ? '#374151' : '#e5e7eb',
                          color: darkMode ? '#d1d5db' : '#4b5563',
                          zIndex: 0,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: '600',
                          fontSize: '0.75rem'
                        }}
                        title={`${project.team.length - 5} more team members`}
                      >
                        +{project.team.length - 5}
                      </div>
                    )}
                    
                    {/* Show loading indicator while fetching members */}
                    {projectMembersLoading[project.id] && (
                      <div
                        className={`${styles.memberAvatar} ${styles.loadingAvatar}`}
                        style={{
                          backgroundColor: darkMode ? '#374151' : '#e5e7eb',
                          color: darkMode ? '#d1d5db' : '#4b5563',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        <div className={styles.loadingSpinner}></div>
                      </div>
                    )}
                    
                    {/* Add member button */}
                    <button 
                      className={`${styles.memberAvatar} ${styles.addMember}`}
                      style={{ 
                        backgroundColor: darkMode ? '#2d3748' : '#e2e8f0',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                      title="Add team member"
                      aria-label="Add team member"
                    >
                      <Plus size={12} />
                    </button>
                    
                    {/* View all members button */}
                    {project.team.length > 1 && (
                      <button 
                        className={`${styles.memberAvatar} ${styles.viewAllMembers}`}
                        style={{ 
                          backgroundColor: 'transparent',
                          border: `1px dashed ${darkMode ? '#4b5563' : '#d1d5db'}`,
                          marginLeft: '4px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                        title="View all team members"
                        aria-label="View all team members"
                      >
                        <Users size={12} />
                      </button>
                    )}
                  </div>
                  
                  <div className={styles.completedTasks}>
                    <CheckCircle size={14} />
                    <span>{project.completedTasks}/{project.totalTasks} tasks</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {projects.length > displayCount && (
            <button 
              className={styles.loadMoreButton}
              onClick={() => setDisplayCount(displayCount + 4)}
            >
              Load More
            </button>
          )}
        </>
      )}
    </div>
  );
};

export default ProjectsSection;