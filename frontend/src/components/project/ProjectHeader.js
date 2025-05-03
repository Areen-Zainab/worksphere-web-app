import React, { useContext, useState, useEffect } from 'react';
import ProjectContext from '../../contexts/ProjectContext';
import styles from '../../css/project/project.module.css';

const ProjectHeader = ({ stats, setShowAddMemberForm }) => {
  const { 
    project, 
    members, 
    getMemberInitials, 
    getMemberColor, 
    handleShowEditProjectForm 
  } = useContext(ProjectContext);
  
  const [isAuthorized, setIsAuthorized] = useState(false);
  
  // Check if current user can add members (PROJECT_MANAGER or project owner)
  useEffect(() => {
    const userId = localStorage.getItem('loggedInUserID');
    
    if (userId && members && project) {
      // Check if user is PROJECT_MANAGER
      const currentUserMember = members.find(member => {
        // Get member ID from the correct structure
        const memberId = member.user && member.user.id;
        return memberId && memberId.toString() === userId;
      });
      
      // Check if user is project owner
      const isOwner = project.owner && 
                      project.owner.id && 
                      project.owner.id.toString() === userId;
      
      setIsAuthorized(
        (currentUserMember && currentUserMember.role === 'PROJECT_MANAGER') || isOwner
      );
    }
  }, [members, project]);

  return (
    <div className={styles.projectHeader}>
      <div className={styles.projectInfo}>
        <div className={styles.titleSection}>
          <h1 className={styles.projectTitle}>{project.name}</h1>
          {isAuthorized && (
            <button 
              className={styles.editButton} 
              onClick={handleShowEditProjectForm}
              aria-label="Edit project"
            >
              <span className={styles.editIcon}>✎</span>
            </button>
          )}
        </div>
        <p className={styles.projectDescription}>{project.description}</p>
      </div>

      {/* Project Stats Summary */}
      <div className={styles.statsContainer}>
        <div className={styles.statItem}>
          <span className={styles.statValue}>{stats.completionPercentage}%</span>
          <span className={styles.statLabel}>Complete</span>
        </div>
        <div className={styles.statItem}>
          <span className={styles.statValue}>{stats.totalTasks}</span>
          <span className={styles.statLabel}>Total Tasks</span>
        </div>
        <div className={styles.statItem}>
          <span className={styles.statValue}>{stats.highPriorityTasks}</span>
          <span className={styles.statLabel}>High Priority</span>
        </div>
        <div className={styles.statItem}>
          <span className={styles.statValue}>{stats.tasksWithDueDateSoon}</span>
          <span className={styles.statLabel}>Due Soon</span>
        </div>
      </div>

      {/* Team Members */}
      <div className={styles.teamSection}>
        <div className={styles.memberCircles}>
          {members.slice(0, 5).map((member) => (
            <div 
              key={member.user.id} 
              className={styles.memberCircle}
              style={{ backgroundColor: getMemberColor(member.user.id) }}
              title={`${member.user.firstName} ${member.user.lastName}`}
            >
              {member.user.profilePicture ? (
                <img 
                  src={member.user.profilePicture} 
                  alt={`${member.user.firstName} ${member.user.lastName}`} 
                  className={styles.memberImage}
                />
              ) : (
                <span className={styles.memberInitials}>
                  {`${member.user.firstName[0]}${member.user.lastName ? member.user.lastName[0] : ''}`}
                </span>
              )}
            </div>
          ))}
          {members.length > 5 && (
            <div className={styles.memberCircle}>
              <span className={styles.memberInitials}>+{members.length - 5}</span>
            </div>
          )}
        </div>
        
        {/* Only show Add Member button for authorized users (PROJECT_MANAGER or owner) */}
        {isAuthorized && (
          <button
            onClick={() => setShowAddMemberForm(true)}
            className={styles.addMemberBtn}
          >
            Add Member
            <span className={styles.addIcon}>+</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default ProjectHeader;