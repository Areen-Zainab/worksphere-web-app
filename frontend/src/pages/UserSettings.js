import { useState, useRef, useEffect } from 'react';
import { Bell, User, Lock, Palette, Moon, Sun, Monitor, ChevronRight, Upload, Save, X } from 'lucide-react';
import Layout from '../components/ui-essentials/Layout';
import Header from '../components/header';
import styles from "../css/settings.module.css";
import { useLocation } from 'react-router-dom';
import { useDarkMode } from '../contexts/DarkModeContext'; // Import the context hook

export default function UserSettings() {
  const [activeTab, setActiveTab] = useState('security');
  const { darkMode, theme, setThemePreference, toggleDarkMode } = useDarkMode();
  
  // Handle theme selection in appearance tab
  const handleThemeChange = (selectedTheme) => {
    setThemePreference(selectedTheme);
  };
  
  // Add avatar state
  const [avatar, setAvatar] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  // Create a ref for the file input
  const fileInputRef = useRef(null);
  const [isMobile, setIsMobile] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Get location to access hash
  const location = useLocation();
  // Get sidebar state from localStorage
  const isSidebarExpanded = localStorage.getItem('sidebarExpanded') !== 'false';
  
  // Handle hash changes for tab navigation
  useEffect(() => {
    // Get hash from location (including the # symbol)
    const hash = location.hash;
    
    // Map hash to tab names
    if (hash === '#profile') {
      setActiveTab('profile');
    } else if (hash === '#notifications') {
      setActiveTab('notifications');
    } else if (hash === '#appearance') {
      setActiveTab('appearance');
    } else if (hash === '#settings') {
      setActiveTab('security');
    }
    
  }, [location.hash]);
  
  // Handle theme changes
  useEffect(() => {
    // Store the current theme preference
    localStorage.setItem('theme', theme);
    
    // Apply theme based on selection
    if (theme === 'dark') {
      // Force dark mode
      if (!darkMode) toggleDarkMode();
    } else if (theme === 'light') {
      // Force light mode
      if (darkMode) toggleDarkMode();
    } else if (theme === 'system') {
      // Use system preference
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (prefersDark !== darkMode) {
        toggleDarkMode();
      }
      
      // Listen for system preference changes
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = (e) => {
        if (theme === 'system' && e.matches !== darkMode) {
          toggleDarkMode();
        }
      };
      
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
  }, [theme, darkMode, toggleDarkMode]);
  
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    pushNotifications: true,
    taskReminders: true,
    weeklyDigest: false,
    mentions: true
  });
  const [profileData, setProfileData] = useState({
    name: 'Alex Johnson',
    email: 'alex@example.com',
    jobTitle: 'Product Manager',
    bio: 'Passionate about productivity and collaboration tools.',
    gender: 'Non-binary',
    dob: '1990-05-15'
  });
  const [isEditing, setIsEditing] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleNotificationChange = (setting) => {
    setNotificationSettings({
      ...notificationSettings,
      [setting]: !notificationSettings[setting]
    });
  };

  const handleProfileChange = (field, value) => {
    setProfileData({
      ...profileData,
      [field]: value
    });
  };

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

  // Handle file selection
  const handleAvatarChange = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Store the file in state
    setAvatar(file);
    
    // Create a preview URL
    const reader = new FileReader();
    reader.onloadend = () => {
      setAvatarPreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  // Trigger the hidden file input
  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  const handleSaveProfile = () => {
    setIsEditing(false);
    // Here you would typically send the data to your backend
    console.log("Profile saved:", profileData);
    
    // Handle avatar upload
    if (avatar) {
      // In a real app, you would upload the avatar file to your server
      console.log("Avatar to upload:", avatar);
      
      // Example of FormData for file upload:
      const formData = new FormData();
      formData.append('avatar', avatar);
      formData.append('userId', 'user-id-here');
      
      // Simulate successful upload in this example
      console.log("Avatar upload formData created:", formData);
      
      // Reset the file input
      fileInputRef.current.value = '';
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    // Reset any unsaved changes if needed
    // Also reset avatar if it was changed but not saved
    if (avatar && !isEditing) {
      setAvatar(null);
      setAvatarPreview(null);
      fileInputRef.current.value = '';
    }
  };

  const handleUpdateEmail = () => {
    if (newEmail && currentPassword) {
      setProfileData({
        ...profileData,
        email: newEmail
      });
      setNewEmail('');
      setCurrentPassword('');
      // Here you would typically send the data to your backend
      console.log("Email updated to:", newEmail);
    }
  };

  const handleUpdatePassword = () => {
    if (currentPassword && newPassword && confirmPassword && newPassword === confirmPassword) {
      // Here you would typically send the data to your backend
      console.log("Password updated");
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'profile':
        return (
          <div>
            <div className={styles.sectionHeader}>
              <User size={20} className={styles.sectionIcon} />
              <h2 className={styles.sectionTitle}>Profile Settings</h2>
            </div>
            
            <div className={styles.profileLayout}>
              <div className={styles.avatarContainer}>
                {/* Hidden file input */}
                <input 
                  type="file" 
                  ref={fileInputRef}
                  onChange={handleAvatarChange}
                  accept="image/*"
                  style={{ display: 'none' }}
                />
                
                {/* Avatar preview or placeholder */}
                <div 
                  className={styles.avatarPlaceholder}
                  onClick={triggerFileInput}
                  style={{
                    backgroundImage: avatarPreview ? `url(${avatarPreview})` : 'none',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    cursor: 'pointer',
                  }}
                >
                  {!avatarPreview && (
                    <Upload size={48} className={styles.avatarUploadIcon} />
                  )}
                </div>
                <button 
                  className={styles.avatarUploadButton}
                  onClick={triggerFileInput}
                >
                  <Upload size={14} style={{ marginRight: '0.25rem' }} /> Change photo
                </button>
              </div>
              <div className={styles.profileDetails}>
                {!isEditing ? (
                  <>
                    <div className={styles.profileCard}>
                      <h3 className={styles.profileName}>{profileData.name}</h3>
                      <p className={styles.profileEmail}>{profileData.email}</p>
                      <div className={styles.profileJobTitle}>
                        {profileData.jobTitle}
                      </div>
                    </div>
                    <div className={styles.aboutCard}>
                      <h4 className={styles.aboutLabel}>About</h4>
                      <p className={styles.aboutText}>{profileData.bio}</p>
                    </div>
                    <div className={styles.aboutCard}>
                      <h4 className={styles.aboutLabel}>Personal Information</h4>
                      <div className={styles.personalInfoGrid}>
                        <div className={styles.infoItem}>
                          <span className={styles.infoLabel}>Gender</span>
                          <span className={styles.infoValue}>{profileData.gender}</span>
                        </div>
                        <div className={styles.infoItem}>
                          <span className={styles.infoLabel}>Date of Birth</span>
                          <span className={styles.infoValue}>{new Date(profileData.dob).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                    <button 
                      className={styles.editProfileButton}
                      onClick={() => setIsEditing(true)}
                    >
                      Edit Profile
                      <ChevronRight size={16} className={styles.buttonIconRight} />
                    </button>
                  </>
                ) : (
                  <div className={styles.editForm}>
                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>Full Name</label>
                      <input 
                        type="text" 
                        value={profileData.name} 
                        onChange={(e) => handleProfileChange('name', e.target.value)}
                        className={styles.formInput}
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>Job Title</label>
                      <input 
                        type="text" 
                        value={profileData.jobTitle} 
                        onChange={(e) => handleProfileChange('jobTitle', e.target.value)}
                        className={styles.formInput}
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>Bio</label>
                      <textarea 
                        value={profileData.bio} 
                        onChange={(e) => handleProfileChange('bio', e.target.value)}
                        className={`${styles.formInput} ${styles.formTextarea}`}
                        rows="3"
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>Gender</label>
                      <select 
                        value={profileData.gender} 
                        onChange={(e) => handleProfileChange('gender', e.target.value)}
                        className={styles.formSelect}
                      >
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Non-binary">Non-binary</option>
                        <option value="Prefer not to say">Prefer not to say</option>
                      </select>
                    </div>
                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>Date of Birth</label>
                      <input 
                        type="date" 
                        value={profileData.dob} 
                        onChange={(e) => handleProfileChange('dob', e.target.value)}
                        className={styles.formInput}
                      />
                    </div>
                    <div className={styles.formActions}>
                      <button 
                        className={styles.cancelButton}
                        onClick={handleCancelEdit}
                      >
                        <X size={16} className={styles.buttonIconLeft} /> Cancel
                      </button>
                      <button 
                        className={styles.saveButton}
                        onClick={handleSaveProfile}
                      >
                        <Save size={16} className={styles.buttonIconLeft} /> Save Changes
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        );

      case 'notifications':
        return (
          <div>
            <div className={styles.sectionHeader}>
              <Bell size={20} className={styles.sectionIcon} />
              <h2 className={styles.sectionTitle}>Notification Preferences</h2>
            </div>
            
            <div className={styles.notificationsList}>
              {Object.entries(notificationSettings).map(([setting, value]) => {
                const settingName = setting === 'emailNotifications' ? 'Email Notifications' :
                                  setting === 'pushNotifications' ? 'Push Notifications' :
                                  setting === 'taskReminders' ? 'Task Reminders' :
                                  setting === 'weeklyDigest' ? 'Weekly Digest' : 'Mentions';
                
                return (
                  <div key={setting} className={styles.notificationItem}>
                    <span className={styles.notificationLabel}>{settingName}</span>
                    <div className={styles.toggleContainer}>
                      <input
                        type="checkbox"
                        id={setting}
                        checked={value}
                        onChange={() => handleNotificationChange(setting)}
                        className={styles.toggleInput}
                      />
                      <label htmlFor={setting} className={styles.toggleSlider}>
                        <span className={styles.toggleHandle}></span>
                      </label>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );

      case 'appearance':
        return (
          <div>
          <div className={styles.sectionHeader}>
            <Palette size={20} className={styles.sectionIcon} />
            <h2 className={styles.sectionTitle}>Appearance</h2>
          </div>
          
          <div>
            <h3 className={styles.sectionTitle} style={{ fontSize: '1.125rem', marginBottom: '1rem' }}>Theme Selection</h3>
            <div className={styles.themesContainer}>
              {[{ name: 'light', icon: Sun }, { name: 'dark', icon: Moon }, { name: 'system', icon: Monitor }].map((option) => (
                <div
                  key={option.name}
                  onClick={() => handleThemeChange(option.name)}
                  className={`${styles.themeOption} ${
                    theme === option.name ? styles.themeOptionActive : styles.themeOptionInactive
                  }`}
                >
                  <option.icon 
                    size={32} 
                    className={theme === option.name ? styles.themeIconActive : styles.themeIconInactive} 
                  />
                  <span className={`${styles.themeLabel} ${
                    theme === option.name ? styles.themeLabelActive : styles.themeLabelInactive
                  }`}>
                    {option.name.charAt(0).toUpperCase() + option.name.slice(1)}
                  </span>
                </div>
              ))}
            </div>
            <div className={styles.themeDescription} style={{ marginTop: '1rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
              {theme === 'light' && "Light theme uses a bright background with dark text for high contrast."}
              {theme === 'dark' && "Dark theme uses a dark background with light text to reduce eye strain."}
              {theme === 'system' && "System theme automatically matches your device's appearance settings."}
            </div>
          </div>
        </div>
          );

      case 'security':
        return (
          <div>
            <div className={styles.sectionHeader}>
              <Lock size={20} className={styles.sectionIcon} />
              <h2 className={styles.sectionTitle}>Security</h2>
            </div>
            
            <div className={styles.securitySections}>
              {/* Email Change Section */}
              <div className={styles.securitySection}>
                <h3 className={styles.securitySectionTitle}>Change Email Address</h3>
                <div className={styles.passwordForm}>
                  <input 
                    type="email" 
                    placeholder="Current email address" 
                    value={profileData.email}
                    disabled
                    className={styles.passwordInput} 
                  />
                  <input 
                    type="email" 
                    placeholder="New email address" 
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    className={styles.passwordInput} 
                  />
                  <input 
                    type="password" 
                    placeholder="Current password (for verification)" 
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className={styles.passwordInput} 
                  />
                  <button 
                    className={styles.updateButton}
                    onClick={handleUpdateEmail}
                  >
                    Update Email
                  </button>
                </div>
              </div>
              
              {/* Password Change Section */}
              <div className={styles.securitySection}>
                <h3 className={styles.securitySectionTitle}>Change Password</h3>
                <div className={styles.passwordForm}>
                  <input 
                    type="password" 
                    placeholder="Current password" 
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className={styles.passwordInput} 
                  />
                  <input 
                    type="password" 
                    placeholder="New password" 
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className={styles.passwordInput} 
                  />
                  <input 
                    type="password" 
                    placeholder="Confirm new password" 
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className={styles.passwordInput} 
                  />
                  <button 
                    className={styles.updateButton}
                    onClick={handleUpdatePassword}
                  >
                    Update Password
                  </button>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Layout>
      <div className={styles.settingsPageContainer}>
        {/* Header */}
        <Header 
          greeting={"Account Settings"} 
          toggleSidebar={toggleSidebar}
          isMobile={isMobile}
          sidebarOpen={isSidebarExpanded} // Change this line
        />
        {/* Settings Container */}
        <div className={styles.settingsContainer}>
          <div className={styles.settingsPanel}>
            <div className={styles.panelLayout}>
              {/* Sidebar */}
              <div className={styles.sidebar}>
                <div className={styles.sidebarNav}>
                  <button 
                    onClick={() => setActiveTab('profile')} 
                    className={`${styles.sidebarNavButton} ${
                      activeTab === 'profile' ? styles.sidebarNavButtonActive : ''
                    }`}
                  >
                    <User className={styles.sidebarIcon} size={18} /> Profile
                  </button>
                  <button 
                    onClick={() => setActiveTab('notifications')} 
                    className={`${styles.sidebarNavButton} ${
                      activeTab === 'notifications' ? styles.sidebarNavButtonActive : ''
                    }`}
                  >
                    <Bell className={styles.sidebarIcon} size={18} /> Notifications
                  </button>
                  <button 
                    onClick={() => setActiveTab('appearance')} 
                    className={`${styles.sidebarNavButton} ${
                      activeTab === 'appearance' ? styles.sidebarNavButtonActive : ''
                    }`}
                  >
                    <Palette className={styles.sidebarIcon} size={18} /> Appearance
                  </button>
                  <button 
                    onClick={() => setActiveTab('security')} 
                    className={`${styles.sidebarNavButton} ${
                      activeTab === 'security' ? styles.sidebarNavButtonActive : ''
                    }`}
                  >
                    <Lock className={styles.sidebarIcon} size={18} /> Security
                  </button>
                </div>
              </div>
              
              {/* Content Area */}
              <div className={styles.contentArea}>
                {renderTabContent()}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}