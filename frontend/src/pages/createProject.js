import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useDarkMode } from '../contexts/DarkModeContext';
import Layout from '../components/ui-essentials/Layout';
import Header from '../components/header';

// CSS module import
import styles from '../css/create-project.module.css';

const CreateProject = () => {
  const navigate = useNavigate();
  const { darkMode, toggleDarkMode } = useDarkMode();
  const [isMobile, setIsMobile] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // Form state
  const [projectName, setProjectName] = useState('');
  const [description, setDescription] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  const [members, setMembers] = useState([]);
  const [newMember, setNewMember] = useState('');
  const [errors, setErrors] = useState({});

  // Check for mobile view
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
      
      // If mobile, collapse sidebar
      if (window.innerWidth <= 768) {
        const event = new CustomEvent('sidebarToggled', { 
          detail: { expanded: false } 
        });
        window.dispatchEvent(event);
        localStorage.setItem('sidebarExpanded', 'false');
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize(); // Initialize on load

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Toggle sidebar function for mobile
  const toggleSidebar = () => {
    const currentState = localStorage.getItem('sidebarExpanded') !== 'false';
    const newState = !currentState;
    localStorage.setItem('sidebarExpanded', newState.toString());
    
    // Dispatch event that Layout will listen for
    const event = new CustomEvent('sidebarToggled', { 
      detail: { expanded: newState } 
    });
    window.dispatchEvent(event);
  };

  // Add member to project
  const addMember = () => {
    if (newMember.trim() === '') return;
    
    // Create new member object with random color
    const colors = ['#3F51B5', '#E91E63', '#9C27B0', '#00BCD4', '#4CAF50', '#FF5722', '#2196F3'];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    
    // Get initials from name
    const nameParts = newMember.split(' ');
    let initials = '';
    if (nameParts.length === 1) {
      initials = nameParts[0].substring(0, 2).toUpperCase();
    } else {
      initials = nameParts[0].charAt(0).toUpperCase() + nameParts[nameParts.length - 1].charAt(0).toUpperCase();
    }
    
    const newMemberObj = {
      name: newMember,
      initials,
      color: randomColor
    };
    
    setMembers([...members, newMemberObj]);
    setNewMember('');
  };

  // Remove member from project
  const removeMember = (index) => {
    const updatedMembers = [...members];
    updatedMembers.splice(index, 1);
    setMembers(updatedMembers);
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};
    
    if (!projectName.trim()) {
      newErrors.projectName = 'Project name is required';
    }
    
    if (!description.trim()) {
      newErrors.description = 'Project description is required';
    }
    
    if (isPublic && members.length === 0) {
      newErrors.members = 'Public projects require at least one team member';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsLoading(true);
    
    // Simulate API call to create project
    setTimeout(() => {
      // Create new project object
      const newProject = {
        id: Date.now(), // Temporary ID
        name: projectName,
        status: 'On Track',
        statusColor: '#4CAF50',
        statusColorRgb: '76, 175, 80',
        progress: 0,
        team: isPublic ? members.map(m => ({ initials: m.initials, color: m.color })) : [],
        completedTasks: 0,
        totalTasks: 0,
        isPublic
      };
      
      // In a real app, you would send this to your API
      console.log('Creating project:', newProject);
      
      // Navigate back to dashboard
      setIsLoading(false);
      navigate('/dashboard');
    }, 1500);
  };

  // Get appropriate greeting based on time of day
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Create a New Project";
    if (hour < 18) return "Start a New Project";
    return "Begin a New Project";
  };

  // Get sidebar state from localStorage
  const isSidebarExpanded = localStorage.getItem('sidebarExpanded') !== 'false';

  return (
    <Layout>
      <div className={`${styles.createProjectContainer} ${darkMode ? styles.darkMode : styles.lightMode}`}>
        {/* Header */}
        <Header 
          greeting={getGreeting()} 
          toggleDarkMode={toggleDarkMode} 
          isDarkMode={darkMode}
          toggleSidebar={toggleSidebar}
          isMobile={isMobile}
          sidebarOpen={isSidebarExpanded}
          showBackButton={true}
          backButtonUrl="/dashboard"
        />

        {/* Main Content */}
        <motion.div 
          className={styles.formContainer}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <form onSubmit={handleSubmit} className={`${styles.createProjectForm} ${darkMode ? styles.darkForm : ''}`}>
            <div className={styles.formGroup}>
              <label htmlFor="projectName">Project Name *</label>
              <input
                type="text"
                id="projectName"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                className={errors.projectName ? styles.inputError : ''}
                placeholder="Enter project name"
              />
              {errors.projectName && <span className={styles.errorMessage}>{errors.projectName}</span>}
            </div>
            
            <div className={styles.formGroup}>
              <label htmlFor="description">Description *</label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className={errors.description ? styles.inputError : ''}
                placeholder="What is this project about?"
                rows={4}
              />
              {errors.description && <span className={styles.errorMessage}>{errors.description}</span>}
            </div>
            
            <div className={styles.formGroup}>
              <label>Project Visibility</label>
              <div className={styles.toggleContainer}>
                <span className={!isPublic ? styles.activeOption : ''}>Private</span>
                <div 
                  className={`${styles.toggle} ${isPublic ? styles.toggleActive : ''}`}
                  onClick={() => setIsPublic(!isPublic)}
                >
                  <div className={styles.toggleHandle}></div>
                </div>
                <span className={isPublic ? styles.activeOption : ''}>Public</span>
              </div>
              <p className={styles.visibilityInfo}>
                {isPublic 
                  ? "Public projects can be accessed by team members you invite." 
                  : "Private projects are visible only to you."}
              </p>
            </div>
            
            {isPublic && (
              <div className={`${styles.formGroup} ${styles.membersSection}`}>
                <label>Team Members</label>
                
                <div className={styles.addMemberInput}>
                  <input
                    type="text"
                    value={newMember}
                    onChange={(e) => setNewMember(e.target.value)}
                    placeholder="Enter member name"
                  />
                  <button 
                    type="button" 
                    onClick={addMember}
                    className={styles.addButton}
                  >
                    Add
                  </button>
                </div>
                
                {errors.members && <span className={styles.errorMessage}>{errors.members}</span>}
                
                {members.length > 0 && (
                  <div className={styles.membersList}>
                    {members.map((member, index) => (
                      <div key={index} className={styles.memberItem}>
                        <div 
                          className={styles.memberAvatar}
                          style={{ backgroundColor: member.color }}
                        >
                          {member.initials}
                        </div>
                        <span className={styles.memberName}>{member.name}</span>
                        <button 
                          type="button" 
                          className={styles.removeMemberBtn}
                          onClick={() => removeMember(index)}
                        >
                          &times;
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
            
            <div className={styles.formActions}>
              <button 
                type="button" 
                className={styles.cancelButton}
                onClick={() => navigate('/dashboard')}
              >
                Cancel
              </button>
              
              <button 
                type="submit" 
                className={styles.createButton}
                disabled={isLoading}
              >
                {isLoading ? 'Creating...' : 'Create Project'}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </Layout>
  );
};

export default CreateProject;