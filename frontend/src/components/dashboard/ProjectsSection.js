import React, { useState, useContext } from 'react';
import styles from '../../css/dashboard/ProjectOverview.module.css';
import { MoreHorizontal, CheckCircle, Plus } from 'lucide-react';
import { useDarkMode } from '../../contexts/DarkModeContext';

const ProjectsSection = ({ projects }) => {
  const { darkMode } = useDarkMode();
  const [displayCount, setDisplayCount] = useState(4);
  const [activeDropdown, setActiveDropdown] = useState(null);

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

  return (
    <div className={containerClass}>
      <div className={styles.header}>
        <h2 className={styles.title}>Projects</h2>
        <button 
          className={styles.viewAllButton} 
          onClick={handleViewAll}
        >
          {displayCount === 4 ? 'View All' : 'Show Less'}
        </button>
      </div>
      
      <div className={styles.projectGrid}>
        {projects.slice(0, displayCount).map((project) => (
          <div 
            key={project.id} 
            className={styles.projectCard}
            tabIndex="0"
            aria-label={`Project: ${project.name}`}
          >
            <div className={styles.projectHeader}>
              <h3 className={styles.projectName}>{project.name}</h3>
              <div className={styles.cardActions}>
                <span
                  className={styles.statusIndicator}
                  style={{
                    '--status-color': project.statusColor,
                    '--status-color-rgb': project.statusColorRgb
                  }}
                >
                  {project.status}
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
                      <button>Edit Project</button>
                      <button>View Details</button>
                      <button>Archive</button>
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
                {project.team.map((member, index) => (
                  <div
                    key={index}
                    className={styles.memberAvatar}
                    style={{
                      backgroundColor: member.color,
                      zIndex: project.team.length - index
                    }}
                    title={member.name || member.initials}
                  >
                    {member.initials}
                  </div>
                ))}
                <button 
                  className={`${styles.memberAvatar} ${styles.addMember}`}
                  style={{ backgroundColor: darkMode ? '#2d3748' : '#e2e8f0' }}
                >
                  <Plus size={12} />
                </button>
              </div>
              
              <div className={styles.completedTasks}>
                <CheckCircle size={14} />
                <span>{project.completedTasks}/{project.totalTasks} tasks</span>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {displayCount < projects.length && (
        <button 
          className={styles.loadMoreButton}
          onClick={() => setDisplayCount(displayCount + 4)}
        >
          Load More
        </button>
      )}
    </div>
  );
};

export default ProjectsSection;