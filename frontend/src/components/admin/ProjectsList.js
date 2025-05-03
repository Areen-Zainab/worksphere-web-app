import React, { useState } from 'react';
import styles from '../../css/admin/projectsList.module.css';

// SVG Icon Components
const SearchIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"></circle>
    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
  </svg>
);

const AddIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19"></line>
    <line x1="5" y1="12" x2="19" y2="12"></line>
  </svg>
);

const FolderIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
  </svg>
);

const EditIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
  </svg>
);

const DeleteIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6"></polyline>
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
  </svg>
);

const ViewIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
    <circle cx="12" cy="12" r="3"></circle>
  </svg>
);

const FolderOffIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2z"></path>
    <line x1="2" y1="2" x2="22" y2="22"></line>
  </svg>
);

const ChevronLeftIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="15 18 9 12 15 6"></polyline>
  </svg>
);

const ChevronRightIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="9 18 15 12 9 6"></polyline>
  </svg>
);

const ProjectsList = ({ projects, darkMode, title, compact }) => {
  const [searchTerm, setSearchTerm] = useState('');
  
  // Filter projects based on search term
  const filteredProjects = projects.filter(project => 
    project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    project.status.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className={`${styles.projectsContainer} ${darkMode ? styles.darkMode : ''}`}>
      <div className={styles.projectsHeader}>
        <h2>{title}</h2>
        
        {!compact && (
          <div className={styles.projectControls}>
            <div className={styles.searchBox}>
              <SearchIcon />
              <input
                type="text"
                placeholder="Search projects..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <button className={styles.addProjectBtn}>
              <AddIcon />
              New Project
            </button>
          </div>
        )}
      </div>
      
      {filteredProjects.length > 0 ? (
        <div className={styles.projectsList}>
          <table className={styles.projectsTable}>
            <thead>
              <tr>
                <th>Project Name</th>
                <th>Status</th>
                <th>Progress</th>
                {!compact && <th>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {filteredProjects.map(project => (
                <tr key={project.id}>
                  <td className={styles.projectName}>
                    <div className={styles.projectIcon}>
                      <FolderIcon />
                    </div>
                    <span>{project.name}</span>
                  </td>
                  
                  <td>
                    <span 
                      className={`${styles.projectStatus} ${
                        project.status === 'Active' ? styles.statusActive : 
                        project.status === 'At Risk' ? styles.statusRisk : 
                        project.status === 'Completed' ? styles.statusComplete : 
                        styles.statusDefault
                      }`}
                    >
                      {project.status}
                    </span>
                  </td>
                  
                  <td>
                    <div className={styles.progressWrapper}>
                      <div 
                        className={styles.progressBar}
                        style={{ width: `${project.progress}%` }}
                      ></div>
                      <span className={styles.progressText}>{project.progress}%</span>
                    </div>
                  </td>
                  
                  {!compact && (
                    <td className={styles.projectActions}>
                      <button className={styles.actionBtn} title="Edit Project">
                        <EditIcon />
                      </button>
                      <button className={styles.actionBtn} title="Delete Project">
                        <DeleteIcon />
                      </button>
                      <button className={styles.actionBtn} title="View Details">
                        <ViewIcon />
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className={styles.noResults}>
          <FolderOffIcon />
          <p>No projects found</p>
        </div>
      )}
      
      {!compact && (
        <div className={styles.projectsPagination}>
          <button className={styles.paginationBtn} disabled>
            <ChevronLeftIcon />
          </button>
          <span className={styles.paginationInfo}>Page 1 of 1</span>
          <button className={styles.paginationBtn} disabled>
            <ChevronRightIcon />
          </button>
        </div>
      )}
    </div>
  );
};

export default ProjectsList;