import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useDarkMode } from '../contexts/DarkModeContext';
import Layout from '../components/ui-essentials/Layout';
import Header from '../components/header';
import axios from 'axios';
import { useToast, Toast } from '../components/ui-essentials/toast'; // Import the Toast component

// CSS module import
import styles from '../css/create-project.module.css';

const API_BASE_URL = 'http://localhost:8080/api';

const CreateProject = () => {
  const navigate = useNavigate();
  const { darkMode, toggleDarkMode } = useDarkMode();
  const [isMobile, setIsMobile] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [availableUsers, setAvailableUsers] = useState([]);
  
  // Initialize toast hook
  const { toast, showSuccess, showError } = useToast();
  
  // Form state
  const [projectName, setProjectName] = useState('');
  const [description, setDescription] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  const [status, setStatus] = useState('PLANNING'); // Default status
  const [members, setMembers] = useState([]);
  const [newMember, setNewMember] = useState('');
  const [errors, setErrors] = useState({});

  // Fetch available users to add as project members
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        // Replace with your actual users endpoint
        const response = await axios.get(`${API_BASE_URL}/users`);
        setAvailableUsers(response.data);
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };

    fetchUsers();
  }, []);

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
    
    // Find user from available users or create a placeholder
    const user = availableUsers.find(u => u.email === newMember || u.name === newMember) || {
      id: -1, // Will be replaced with real ID from backend when creating project
      name: newMember,
      email: newMember.includes('@') ? newMember : `${newMember.toLowerCase().replace(/\s/g, '.')}@example.com`
    };
    
    const newMemberObj = {
      userId: user.id,
      name: user.name || newMember,
      email: user.email,
      initials,
      color: randomColor,
      role: 'CONTRIBUTOR' // Default role from ProjectMember.Role enum
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
    
    if (!status) {
      newErrors.status = 'Project status is required';
    }
    
    if (isPublic && members.length === 0) {
      newErrors.members = 'Public projects require at least one team member';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsLoading(true);
    
    try {
      // Get current user ID from auth context or localStorage
      // For demo purposes, using a hardcoded value - replace with actual user ID
      const currentUserId = localStorage.getItem("loggedInUserID"); // Replace with actual logged-in user ID
      
      const projectDTO = {
        name: projectName,
        description: description,
        startDate: null,
        endDate: null,
        visibility: isPublic? "PUBLIC" : "PRIVATE",
        ownerId: currentUserId,
        progress: 0,
        status: "not_started"
      };
      
      // Submit project to backend
      const projectResponse = await axios.post(`${API_BASE_URL}/projects`, projectDTO);
      const createdProject = projectResponse.data;
      
      // Add members to project (if any)
      if (members.length > 0) {
        const addMemberPromises = members.map(member => {
          const projectMember = {
            projectId: createdProject.id,
            userId: member.userId,
            role: member.role || 'CONTRIBUTOR',
            status: 'ACTIVE'
          };
          
          return axios.post(`${API_BASE_URL}/projects/${createdProject.id}/members`, projectMember);
        });
        
        await Promise.all(addMemberPromises);
      }
      
      console.log('Project created successfully:', createdProject);

      const cachedProjectsStr = localStorage.getItem('userProjects');
      let cachedProjects = [];
      
      // 2. Parse existing projects if available
      if (cachedProjectsStr) {
        try {
          cachedProjects = JSON.parse(cachedProjectsStr);
        } catch (error) {
          console.error('Error parsing cached projects:', error);
        }
      }
      
      cachedProjects.push(createdProject);
      localStorage.setItem('userProjects', JSON.stringify(cachedProjects));
      
      // Show success toast notification
      showSuccess('Success', 'Project created successfully!');
      
      // Navigate after a short delay to allow toast to be seen
      setTimeout(() => {
        navigate(`/project/${createdProject.id}`);
      }, 1000);

    } catch (error) {
      console.error('Error creating project:', error);
      setErrors({
        form: 'Failed to create project. Please try again.'
      });
      
      // Show error toast notification
      showError('Error', 'Failed to create project. Please try again.');
      setIsLoading(false);
    } finally {
      setIsLoading(false);
    }
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

        {/* Toast component */}
        <Toast 
          visible={toast.visible}
          type={toast.type}
          title={toast.title}
          message={toast.message}
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
                    placeholder="Enter member email or name"
                    list="availableUsers"
                  />
                  <datalist id="availableUsers">
                    {availableUsers.map(user => (
                      <option key={user.id} value={user.email} />
                    ))}
                  </datalist>
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
            
            {errors.form && <div className={styles.errorMessage}>{errors.form}</div>}
            
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