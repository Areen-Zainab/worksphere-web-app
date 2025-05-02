import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Component imports
import Header from '../components/header';
import QuickActions from '../components/dashboard/QuickActions';
import ProjectsSection from '../components/dashboard/ProjectsSection';
import UpcomingTasks from '../components/dashboard/UpcomingTasks';
import CalendarView from '../components/dashboard/CalendarView';
import FocusTimer from '../components/dashboard/FocusTimer';
import EmptyState from '../components/dashboard/EmptyState';
import { DarkModeProvider, useDarkMode } from '../contexts/DarkModeContext';

import styles from '../css/dashboard.module.css';
import Layout from '../components/ui-essentials/Layout';

const DashboardContent = () => {
  // Access dark mode from context
  const { darkMode, toggleDarkMode } = useDarkMode();
  
  // Local state for dashboard data
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  const [isContentVisible, setIsContentVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Refs for intersection observer
  const sectionRefs = {
    quickActions: useRef(null),
    projects: useRef(null),
    tasks: useRef(null),
    focusTimer: useRef(null),
    calendar: useRef(null)
  };

  // Fetch user data from localStorage on component mount
  useEffect(() => {
    const storedUserData = localStorage.getItem("userData");
    if (storedUserData) {
      try {
        const parsedUserData = JSON.parse(storedUserData);
        // Ensure we have at least the firstName field
        setUserData({
          firstName: parsedUserData.firstName || "Guest",
          lastName: parsedUserData.lastName || "",
          email: parsedUserData.email || "guest@example.com",
          profilePicture: parsedUserData.profilePicture || null,
          ...parsedUserData
        });
      } catch (error) {
        console.error("Error parsing user data from localStorage:", error);
        // Set default user data if parsing fails
        setUserData({ 
          firstName: "Guest", 
          lastName: "", 
          email: "guest@example.com" 
        });
      }
    } else {
      // Set default user data if none exists in localStorage
      setUserData({ 
        firstName: "Guest", 
        lastName: "", 
        email: "guest@example.com" 
      });
    }
  }, []);

  // Set up intersection observer to animate sections as they come into view
  useEffect(() => {
    const observerOptions = {
      root: null,
      rootMargin: '0px',
      threshold: 0.1
    };

    const observerCallback = (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add(styles.fadeIn);
        }
      });
    };

    const observer = new IntersectionObserver(observerCallback, observerOptions);
    
    // Observe all section refs
    Object.values(sectionRefs).forEach(ref => {
      if (ref.current) {
        observer.observe(ref.current);
      }
    });

    return () => {
      Object.values(sectionRefs).forEach(ref => {
        if (ref.current) {
          observer.unobserve(ref.current);
        }
      });
    };
  }, [loading]); // Re-run when loading state changes

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

  // Simulate data fetching
  useEffect(() => {
    const fetchData = () => {
      setTimeout(() => {
        setProjects([
          { 
            id: 1, 
            name: 'Website Redesign', 
            status: 'On Track', 
            statusColor: '#4CAF50',
            statusColorRgb: '76, 175, 80',
            progress: 65, 
            team: [
              { initials: 'JD', color: '#3F51B5' },
              { initials: 'AK', color: '#E91E63' }
            ],
            completedTasks: 8,
            totalTasks: 12
          },
          { 
            id: 2, 
            name: 'Mobile App Development', 
            status: 'At Risk', 
            statusColor: '#FF9800',
            statusColorRgb: '255, 152, 0',
            progress: 30, 
            team: [
              { initials: 'RB', color: '#9C27B0' },
              { initials: 'MC', color: '#00BCD4' },
              { initials: 'TK', color: '#4CAF50' }
            ],
            completedTasks: 3,
            totalTasks: 10
          },
          { 
            id: 3, 
            name: 'Marketing Campaign', 
            status: 'On Track', 
            statusColor: '#4CAF50',
            statusColorRgb: '76, 175, 80',
            progress: 80, 
            team: [
              { initials: 'SL', color: '#FF5722' },
              { initials: 'KP', color: '#2196F3' }
            ],
            completedTasks: 12,
            totalTasks: 15
          }
        ]);
        
        setTasks([
          { id: 1, title: 'Finalize homepage design', dueDate: '2025-04-30', priority: 'High', projectId: 1 },
          { id: 2, title: 'API integration', dueDate: '2025-05-02', priority: 'Medium', projectId: 2 },
          { id: 3, title: 'User testing feedback review', dueDate: '2025-05-05', priority: 'Low', projectId: 1 },
          { id: 4, title: 'Content strategy meeting', dueDate: '2025-04-29', priority: 'High', projectId: 3 }
        ]);

        setLoading(false);
        setIsContentVisible(true);
        setRefreshing(false);
      }, 1000);
    };

    fetchData();
  }, [refreshing]);

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

  // Refresh dashboard data
  const refreshDashboard = () => {
    setRefreshing(true);
    setLoading(true);
    setIsContentVisible(false);
  };

  // Get appropriate greeting based on time of day
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 18) return "Good Afternoon";
    return "Good Evening";
  };

  // Get firstName from userData with fallback
  const firstName = userData?.firstName || "Guest";

  // Get sidebar state from localStorage
  const isSidebarExpanded = localStorage.getItem('sidebarExpanded') !== 'false';

  return (
    <div className={`${styles.dashboardContainer} ${darkMode ? styles.darkMode : styles.lightMode}`}>
      {/* Header */}
      <Header 
        greeting={`${getGreeting()}, ${firstName} 👋`} 
        toggleDarkMode={toggleDarkMode} 
        isDarkMode={darkMode}
        toggleSidebar={toggleSidebar}
        isMobile={isMobile}
        sidebarOpen={isSidebarExpanded}
        onRefresh={refreshDashboard}
        isRefreshing={refreshing}
      />

      {/* Dashboard Layout */}
      {loading ? (
        <div className={styles.loading}>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            Loading your workspace...
          </motion.div>
        </div>
      ) : (
        <AnimatePresence>
          {isContentVisible && (
            <motion.div 
              className={styles.dashboardLayout}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              {/* Row 1: Full Width - Quick Actions */}
              <div 
                ref={sectionRefs.quickActions}
                className={`${styles.fullWidthRow} ${darkMode ? styles.darkItem : ''} ${styles.interactiveElement}`}
              >
                <QuickActions darkMode={darkMode} />
              </div>

              {/* Row 2: Two Equal Columns */}
              <div className={styles.twoColumnRow}>
                <div 
                  ref={sectionRefs.projects}
                  className={`${styles.columnItem} ${darkMode ? styles.darkItem : ''}`}
                >
                  {projects && projects.length > 0 ? (
                    <ProjectsSection projects={projects} darkMode={darkMode} />
                  ) : (
                    <EmptyState 
                      type="projects"
                      message="No projects yet" 
                      actionLabel="Create your first project"
                      darkMode={darkMode}
                    />
                  )}
                </div>

                <div 
                  ref={sectionRefs.tasks}
                  className={`${styles.columnItem} ${darkMode ? styles.darkItem : ''}`}
                >
                  {tasks && tasks.length > 0 ? (
                    <UpcomingTasks tasks={tasks} darkMode={darkMode} />
                  ) : (
                    <EmptyState 
                      type="tasks"
                      message="No upcoming tasks" 
                      actionLabel="Add a task"
                      darkMode={darkMode}
                    />
                  )}
                </div>
              </div>

              {/* Row 3: Focus Timer (2/3) and Calendar (1/3) */}
              <div className={styles.twoColumnRow}>
                <div 
                  ref={sectionRefs.focusTimer}
                  className={`${styles.columnItem} ${styles.timerContainer} ${darkMode ? styles.darkItem : ''}`}
                  style={{ flex: 2 }} /* Give focus timer 2x the space */
                >
                  <FocusTimer />
                </div>

                <div 
                  ref={sectionRefs.calendar}
                  className={`${styles.columnItem} ${styles.calendarContainer} ${darkMode ? styles.darkItem : ''}`}
                  style={{ flex: 1 }} /* Give calendar 1x the space */
                >
                  <CalendarView tasks={tasks || []} darkMode={darkMode} />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      )}
    </div>
  );
};

// Wrapper component that provides the DarkModeContext
const Dashboard = () => {
  return (
    <Layout>
      <DashboardContent />
    </Layout>
  );
};

export default Dashboard;