import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, Moon, Sun, Bell, Search, Settings, User, LogOut, ChevronDown } from 'lucide-react';
import styles from '../css/header.module.css';
import { useDarkMode } from '../contexts/DarkModeContext';
import defaultpfp from '../assets/profile-pfp/default-pfp.jpeg';
import { useNavigate } from 'react-router-dom';

const API_BASE_URL = 'http://localhost:8080';

const Header = ({ 
  greeting, 
  toggleSidebar, 
  isMobile, 
  sidebarOpen 
}) => {
  const { darkMode, toggleDarkMode } = useDarkMode();
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [userData, setUserData] = useState(null);
  const [profilePicture, setProfilePicture] = useState(defaultpfp);
  const dropdownRef = useRef(null);

  const navigate = useNavigate();

  // Fetch user data from localStorage on component mount
  useEffect(() => {
    const storedUserData = localStorage.getItem("userData");
    if (storedUserData) {
      try {
        const parsedUserData = JSON.parse(storedUserData);
        setUserData(parsedUserData);
        
        // Process profile picture URL
        if (parsedUserData.profilePicture) {
          setProfilePicture(`${API_BASE_URL}${parsedUserData.profilePicture}`);
        } else {
          setProfilePicture(defaultpfp);
        }
      } catch (error) {
        console.error("Error parsing user data from localStorage:", error);
      }
    }
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setProfileDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Listen for changes to the userData in localStorage
  useEffect(() => {
    const handleStorageChange = () => {
      const storedUserData = localStorage.getItem("userData");
      if (storedUserData) {
        try {
          const parsedUserData = JSON.parse(storedUserData);
          setUserData(parsedUserData);
          
          // Update profile picture when userData changes
          if (parsedUserData.profilePicture) {
            setProfilePicture(`${API_BASE_URL}${parsedUserData.profilePicture}`);
          } else {
            setProfilePicture(defaultpfp);
          }
        } catch (error) {
          console.error("Error parsing user data from localStorage:", error);
        }
      }
    };
    
    // Custom event listener for profile updates
    window.addEventListener('userDataUpdated', handleStorageChange);
    
    return () => {
      window.removeEventListener('userDataUpdated', handleStorageChange);
    };
  }, []);

  const toggleProfileDropdown = () => {
    setProfileDropdownOpen(!profileDropdownOpen);
  };

  // Navigation handlers
  const handleNavigateToProfile = () => {
    navigate('/profile#profile');
    setProfileDropdownOpen(false);
  };

  const handleNavigateToSettings = () => {
    // Modified to work both in dropdown and as direct button
    navigate('/profile#settings');
    setProfileDropdownOpen(false);
  };

  const handleNavigateToInbox = () => {
    navigate('/inbox');
  };

  // Mock logout function
  const handleLogout = () => {
    alert('Logging out...');
    // You could also clear the userData from localStorage here
    // localStorage.removeItem("userData");
    setProfileDropdownOpen(false);
  };

  const handleToggleDarkMode = (e) => {
    e.stopPropagation(); // Prevent event bubbling
    toggleDarkMode();
  };

  // Use user data from localStorage if available, or fallback to default values
  const displayName = userData ? 
    `${userData.firstName || ''} ${userData.lastName || ''}`.trim() || "Guest User" 
    : "Guest User";
  const userEmail = userData?.email || "guest@example.com";

  return (
    <motion.header 
      className={`${styles.header} ${darkMode ? styles.darkHeader : styles.lightHeader}`}
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className={styles.headerLeft}>
        {isMobile && (
          <button 
            className={styles.sidebarToggle} 
            onClick={toggleSidebar}
            aria-label="Toggle sidebar"
          >
            <Menu size={20} color={darkMode ? "#ffffff" : "#333333"} />
          </button>
        )}
        
        <h1 className={styles.greeting}>{greeting}</h1>
      </div>
      
      <div className={styles.headerRight}>
        {/* Search */}
        <div className={styles.searchContainer}>
          <Search size={18} className={styles.searchIcon} />
          <input 
            type="text" 
            placeholder="Search..." 
            className={styles.searchInput}
            aria-label="Search"
          />
        </div>
        
        {/* Notifications */}
        <button 
          className={styles.iconButton} 
          aria-label="Notifications" 
          onClick={handleNavigateToInbox}
          style={{ cursor: 'pointer' }} // Ensure pointer cursor
        >
          <div className={styles.notificationIndicator}></div>
          <Bell size={20} />
        </button>
        
        {/* Settings - Fixed onClick handler */}
        <button 
          className={styles.iconButton} 
          aria-label="Settings" 
          onClick={handleNavigateToSettings}
          style={{ cursor: 'pointer' }} // Ensure pointer cursor
        >
          <Settings size={20} />
        </button>
        
        {/* Theme Toggle - Fixed onClick handler */}
        <button 
          onClick={handleToggleDarkMode} 
          className={`${styles.themeToggle} ${darkMode ? styles.darkToggle : styles.lightToggle}`}
          aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
          style={{ cursor: 'pointer', position: 'relative', zIndex: 10 }} // Ensure pointer cursor and proper z-index
        >
          {darkMode ? (
            <Sun size={20} className={styles.themeIcon} />
          ) : (
            <Moon size={20} className={styles.themeIcon} />
          )}
        </button>
        
        {/* User Profile with Dropdown */}
        <div className={styles.userProfileContainer} ref={dropdownRef}>
          <div 
            className={styles.userProfile}
            onClick={toggleProfileDropdown}
          >
            <img 
              src={profilePicture} 
              alt="User profile" 
              className={styles.avatar}
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = defaultpfp;
              }}
            />
            <ChevronDown size={16} className={`${styles.dropdownIcon} ${profileDropdownOpen ? styles.dropdownIconOpen : ''}`} />
          </div>
          
          <AnimatePresence>
            {profileDropdownOpen && (
              <motion.div 
                className={`${styles.profileDropdown} ${darkMode ? styles.darkDropdown : ''}`}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                <div className={styles.dropdownHeader}>
                  <img 
                    src={profilePicture}
                    alt="User profile" 
                    className={styles.dropdownAvatar}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = defaultpfp;
                    }}
                  />
                  <div className={styles.dropdownUserInfo}>
                    <p className={styles.dropdownUserName}>{displayName}</p>
                    <p className={styles.dropdownUserEmail}>{userEmail}</p>
                  </div>
                </div>
                
                <div className={styles.dropdownDivider}></div>
                
                <ul className={styles.dropdownMenu}>
                  <li>
                    <button className={styles.dropdownItem} onClick={handleNavigateToProfile}>
                      <User size={16} />
                      <span>My Profile</span>
                    </button>
                  </li>
                  <li>
                    <button className={styles.dropdownItem} onClick={handleNavigateToSettings}>
                      <Settings size={16} />
                      <span>Account Settings</span>
                    </button>
                  </li>
                  <li>
                    <button className={styles.dropdownItem} onClick={handleLogout}>
                      <LogOut size={16} />
                      <span>Log Out</span>
                    </button>
                  </li>
                </ul>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.header>
  );
};

export default Header;