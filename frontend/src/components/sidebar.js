import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import styles from '../css/sidebar.module.css';
import { useDarkMode } from '../contexts/DarkModeContext';
import defaultpfp from '../assets/profile-pfp/default-pfp.jpeg';

const API_BASE_URL = 'http://localhost:8080';

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { darkMode, toggleDarkMode, theme, setThemePreference } = useDarkMode();
  const [expanded, setExpanded] = useState(localStorage.getItem('sidebarExpanded') !== 'false');
  const [projects, setProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState({
    name: 'John Doe',
    avatar: defaultpfp
  });

  useEffect(() => {
    // Try to load user data from userData JSON in localStorage first
    const userDataStr = localStorage.getItem('userData');
    if (userDataStr) {
      try {
        const userData = JSON.parse(userDataStr);
        const fullName = `${userData.firstName || ''} ${userData.lastName || ''}`.trim() || 'User';
        const profilePicture = userData.profilePicture 
          ? `${API_BASE_URL}${userData.profilePicture}` 
          : defaultpfp;
        
        setUser({
          name: fullName,
          avatar: profilePicture
        });
      } catch (error) {
        console.error('Error parsing user data from localStorage:', error);
        // Fallback to legacy approach
        loadUserFromLegacyStorage();
      }
    } else {
      // Fallback to legacy approach if userData is not available
      loadUserFromLegacyStorage();
    }
    
    // Load user projects
    const userId = localStorage.getItem('loggedInUserID');
    if (userId) {
      // Try to load projects from localStorage first
      const cachedProjectsStr = localStorage.getItem('userProjects');
      if (cachedProjectsStr) {
        try {
          const cachedProjects = JSON.parse(cachedProjectsStr);
          setProjects(cachedProjects);
          setIsLoading(false);
        } catch (error) {
          console.error('Error parsing cached projects:', error);
          // Fallback to fetching from API
          fetchProjects(userId);
        }
      } else {
        // No cached projects, fetch from API
        fetchProjects(userId);
      }
    } else {
      setIsLoading(false);
    }

    // Listen for sidebar toggle events from Layout or other components
    const handleSidebarToggle = (event) => {
      if (event.detail && typeof event.detail.expanded === 'boolean') {
        setExpanded(event.detail.expanded);
      }
    };

    window.addEventListener('sidebarToggled', handleSidebarToggle);

    return () => {
      window.removeEventListener('sidebarToggled', handleSidebarToggle);
    };
  }, []);

  // Helper function to load user from legacy localStorage keys
  const loadUserFromLegacyStorage = () => {
    const firstName = localStorage.getItem('UserFName') || '';
    const lastName = localStorage.getItem('UserLName') || '';
    const fullName = `${firstName} ${lastName}`.trim() || 'John Doe';
    setUser(prev => ({ ...prev, name: fullName }));
    
    // Load user profile picture if needed
    const userId = localStorage.getItem('loggedInUserID');
    if (userId) {
      fetchUserData(userId);
    }
  };

  // Update expanded state when it changes
  useEffect(() => {
    localStorage.setItem('sidebarExpanded', String(expanded));
  }, [expanded]);

  const fetchUserData = async (userId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/users/${userId}`);
      if (response.ok) {
        const data = await response.json();
        const userInfo = {
          name: `${data.firstName} ${data.lastName}`.trim(),
          avatar: data.profilePicture ? `${API_BASE_URL}${data.profilePicture}` : defaultpfp
        };
        
        // Update localStorage with fresh user data
        localStorage.setItem('UserFName', data.firstName || '');
        localStorage.setItem('UserLName', data.lastName || '');
        
        // Also store the complete user data
        localStorage.setItem('userData', JSON.stringify(data));
        
        setUser(userInfo);
      } else {
        console.error('Failed to fetch user data, server responded with:', response.status);
      }
    } catch (error) {
      console.error('Failed to fetch user data:', error);
    }
  };

  const fetchProjects = async (userId) => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/projects/user/${userId}`);
      if (response.ok) {
        const data = await response.json();
        // Cache the projects in localStorage
        localStorage.setItem('userProjects', JSON.stringify(data || []));
        setProjects(data || []);
      } else {
        console.error('Failed to fetch projects, server responded with:', response.status);
        setProjects([]);
      }
    } catch (error) {
      console.error('Failed to fetch projects:', error);
      setProjects([]);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleSidebar = () => {
    const newState = !expanded;
    setExpanded(newState);
    localStorage.setItem('sidebarExpanded', String(newState));
    
    // Dispatch event for Layout to listen for
    window.dispatchEvent(new CustomEvent('sidebarToggled', { 
      detail: { expanded: newState } 
    }));
  };

  const handleLogout = () => {
    ['loggedInUser', 'loggedInUserID', 'UserFName', 'UserLName', 'userToken', 'userData', 'userProjects'].forEach(
      item => localStorage.removeItem(item)
    );
    navigate('/login');
  };

  const isActive = (path) => {
    if (path.startsWith('/project/') && location.pathname.startsWith('/project/')) {
      return path === location.pathname;
    }
    return location.pathname === path;
  };

  // Handle theme cycling
  const cycleTheme = () => {
    if (theme === 'light') {
      setThemePreference('dark');
    } else if (theme === 'dark') {
      setThemePreference('system');
    } else {
      setThemePreference('light');
    }
  };

  // Get appropriate theme icon
  const getThemeIcon = () => {
    if (theme === 'dark' || (theme === 'system' && darkMode)) {
      return (
        <svg className={styles.icon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      );
    } else if (theme === 'light') {
      return (
        <svg className={styles.icon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
        </svg>
      );
    } else {
      return (
        <svg className={styles.icon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
        </svg>
      );
    }
  };

  // Get theme tooltip text
  const getThemeTooltip = () => {
    if (theme === 'light') {
      return "Switch to dark mode";
    } else if (theme === 'dark') {
      return "Switch to system preference";
    } else {
      return `Switch to light mode (currently using ${darkMode ? 'dark' : 'light'} system preference)`;
    }
  };

  return (
    <div className={`${styles.sidebar} ${expanded ? styles.expanded : styles.collapsed} ${darkMode ? styles.darkMode : styles.lightMode}`}>
      {/* Logo and Toggle */}
      <div className={styles.header}>
        {expanded ? (
          <h1 className={styles.logo}>WorkSphere</h1>
        ) : (
          <div className={styles.logoIcon}>
            <span>W</span>
          </div>
        )}
        <button 
          onClick={toggleSidebar}
          className={styles.toggleButton}
          aria-label="Toggle sidebar"
        >
          {expanded ? (
            <svg className={styles.icon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          ) : (
            <svg className={styles.icon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          )}
        </button>
      </div>

      {/* User Profile */}
      <div className={`${styles.userProfile} ${expanded ? styles.userProfileExpanded : ''}`}>
        <div className={styles.avatar}>
          <img src={user.avatar} alt="User" />
        </div>
        {expanded && (
          <div className={styles.userInfo}>
            <p className={styles.userName}>{user.name}</p>
            <p className={styles.userWorkspace}>My Workspace</p>
          </div>
        )}
      </div>

      {/* Main Navigation */}
      <nav className={styles.navigation}>
        <NavItem 
          icon={<svg className={styles.icon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>}
          label="Dashboard"
          active={isActive('/dashboard')}
          expanded={expanded}
          onClick={() => navigate('/dashboard')}
        />
        <NavItem 
          icon={<svg className={styles.icon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>}
          label="My Tasks"
          active={isActive('/tasks')}
          expanded={expanded}
          onClick={() => navigate('/tasks')}
        />
        <NavItem 
          icon={<svg className={styles.icon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>}
          label="Calendar"
          active={isActive('/calendar')}
          expanded={expanded}
          onClick={() => navigate('/calendar')}
        />
        <NavItem 
          icon={<svg className={styles.icon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
          </svg>}
          label="Inbox"
          active={isActive('/inbox')}
          expanded={expanded}
          onClick={() => navigate('/inbox')}
        />

        {/* Projects Section */}
        <div className={styles.projectsSection}>
          <div className={styles.projectsHeader}>
            {expanded && <h2 className={styles.sectionTitle}>Projects</h2>}
            <button 
              onClick={() => navigate('/create/project')}
              className={`${styles.addProjectButton} ${expanded ? '' : styles.centerIcon}`}
              title="Add new project"
            >
              <svg className={styles.icon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </button>
          </div>

          <div className={styles.projectsList}>
            {isLoading ? (
              <div className={`${styles.loadingState} ${expanded ? '' : styles.centerIcon}`}>
                <svg className={styles.spinIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <circle className={styles.spinnerTrack} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className={styles.spinnerHead} fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {expanded && <span className={styles.loadingText}>Loading...</span>}
              </div>
            ) : projects.length === 0 ? (
              <div className={`${styles.emptyState} ${expanded ? '' : styles.centerIcon}`}>
                {expanded ? (
                  <span className={styles.emptyText}>No projects yet</span>
                ) : (
                  <svg className={styles.icon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                  </svg>
                )}
              </div>
            ) : (
              projects.map(project => (
                <ProjectItem
                  key={project.id}
                  project={project}
                  active={isActive(`/project/${project.id}`)}
                  expanded={expanded}
                  onClick={() => navigate(`/project/${project.id}`)}
                />
              ))
            )}
          </div>
        </div>
      </nav>

      {/* Footer / Settings */}
      <div className={styles.footer}>
        <NavItem 
          icon={<svg className={styles.icon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>}
          label="Profile"
          active={isActive('/profile')}
          expanded={expanded}
          onClick={() => navigate('/profile#profile')}
        />
        <NavItem 
          icon={<svg className={styles.icon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>}
          label="Logout"
          active={false}
          expanded={expanded}
          onClick={handleLogout}
          customClass={styles.logoutButton}
        />
      </div>

      {/* Dark Mode Toggle - Updated to support theme cycling */}
      <button 
        className={styles.darkModeToggle}
        onClick={cycleTheme}
        title={getThemeTooltip()}
        aria-label="Toggle theme"
      >
        {getThemeIcon()}
        {expanded && theme === 'system' && (
          <span className={styles.themeIndicator}>
          </span>
        )}
      </button>
    </div>
  );
};

// Helper components
const NavItem = ({ icon, label, active, expanded, onClick, customClass = '' }) => (
  <button
    onClick={onClick}
    className={`${styles.navItem} ${active ? styles.active : ''} ${expanded ? '' : styles.centered} ${customClass}`}
  >
    <span className={styles.navIcon}>{icon}</span>
    {expanded && <span className={styles.navLabel}>{label}</span>}
  </button>
);

const ProjectItem = ({ project, active, expanded, onClick }) => (
  <button
    onClick={onClick}
    className={`${styles.projectItem} ${active ? styles.active : ''} ${expanded ? '' : styles.centered}`}
  >
    <svg className={styles.icon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
    </svg>
    {expanded && (
      <span className={styles.projectName} title={project.name}>
        {project.name}
      </span>
    )}
  </button>
);

export default Sidebar;