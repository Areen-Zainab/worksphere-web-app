import React, { useState, useEffect } from 'react';
import Layout from '../components/ui-essentials/Layout';
import AdminSidebar from '../components/admin/AdminSidebar';
import { useDarkMode } from '../contexts/DarkModeContext';

// Simplified component imports
import AdminHeader from '../components/admin/AdminHeader';
import UsersList from '../components/admin/UsersList';
import ProjectsList from '../components/admin/ProjectsList';
import AdminStats from '../components/admin/AdminStats';

import styles from '../css/adminDashboard.module.css';

const AdminDashboard = () => {
  // Access dark mode from context
  const { darkMode, toggleDarkMode } = useDarkMode();
  
  // Local state for dashboard data
  const [users, setUsers] = useState([]);
  const [projects, setProjects] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  
  // Fetch data on component mount
  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Simulate data fetching
  const fetchDashboardData = () => {
    // Show loading state
    setLoading(true);
    
    // Simulate API call delay
    setTimeout(() => {
      // Sample users data
      setUsers([
        { id: 1, name: 'John Doe', email: 'john@example.com', role: 'Designer', active: true },
        { id: 2, name: 'Alice Kim', email: 'alice@example.com', role: 'Developer', active: true },
        { id: 3, name: 'Robert Brown', email: 'robert@example.com', role: 'Project Manager', active: false },
        { id: 4, name: 'Maria Chen', email: 'maria@example.com', role: 'Developer', active: true },
      ]);

      // Sample projects data
      setProjects([
        { 
          id: 1, 
          name: 'Website Redesign', 
          status: 'Active',
          progress: 65
        },
        { 
          id: 2, 
          name: 'Mobile App Development', 
          status: 'At Risk',
          progress: 30
        },
        { 
          id: 3, 
          name: 'Marketing Campaign', 
          status: 'Active',
          progress: 80
        }
      ]);
      
      // Sample system stats
      setStats({
        totalUsers: 15,
        activeProjects: 5,
        tasksCompleted: 87,
        tasksPending: 43
      });

      setLoading(false);
    }, 800);
  };

  // Admin sidebar menu items - different from regular user sidebar
  const adminMenuItems = [
    { id: 'overview', label: 'Dashboard', icon: 'dashboard' },
    { id: 'users', label: 'User Management', icon: 'people' },
    { id: 'projects', label: 'Projects', icon: 'folder' },
    { id: 'settings', label: 'Settings', icon: 'settings' }
  ];

  // Handle tab changes
  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
  };

  // Refresh dashboard data
  const handleRefresh = () => {
    fetchDashboardData();
  };

  // Render the active content based on selected tab
  const renderContent = () => {
    if (loading) {
      return <div className={styles.loadingIndicator}>Loading...</div>;
    }

    switch (activeTab) {
      case 'overview':
        return (
          <div className={styles.overviewContainer}>
            <AdminStats stats={stats} darkMode={darkMode} />
            <div className={styles.dashboardRow}>
              <UsersList 
                users={users.slice(0, 4)} 
                darkMode={darkMode} 
                title="Recent Users" 
                compact={true} 
              />
              <ProjectsList 
                projects={projects} 
                darkMode={darkMode} 
                title="Recent Projects" 
                compact={true} 
              />
            </div>
          </div>
        );
      case 'users':
        return (
          <UsersList 
            users={users} 
            darkMode={darkMode} 
            title="User Management" 
            compact={false} 
          />
        );
      case 'projects':
        return (
          <ProjectsList 
            projects={projects} 
            darkMode={darkMode} 
            title="Projects Management" 
            compact={false} 
          />
        );
      case 'settings':
        return (
          <div className={styles.settingsContainer}>
            <h2>Admin Settings</h2>
            <p>Admin settings panel will be implemented here.</p>
          </div>
        );
      default:
        return <div>Select a tab to view content</div>;
    }
  };

  return (
    <div className={`${styles.adminDashboardContainer} ${darkMode ? styles.darkMode : ''}`}>
      <AdminSidebar 
        menuItems={adminMenuItems}
        activeItem={activeTab}
        onItemClick={handleTabChange}
        darkMode={darkMode}
      />
      
      <div className={styles.mainContent}>
        <AdminHeader 
          title="Admin Dashboard" 
          onRefresh={handleRefresh} 
          toggleDarkMode={toggleDarkMode} 
          isDarkMode={darkMode} 
        />
        
        <div className={styles.contentArea}>
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;