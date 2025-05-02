import { useState, useRef, useEffect } from 'react';
import { Bell, User, Lock, Palette, Moon, Sun, Monitor, ChevronRight, Upload, Save, X } from 'lucide-react';
import Layout from '../components/ui-essentials/Layout';
import Header from '../components/header';
import styles from "../css/settings.module.css";
import { useLocation } from 'react-router-dom';
import { useDarkMode } from '../contexts/DarkModeContext';
import Toast, { useToast } from '../components/ui-essentials/toast'; // Import the Toast component
import defaultpfp from '../assets/profile-pfp/default-pfp.jpeg';

const API_BASE_URL = 'http://localhost:8080';

export default function UserSettings() {
  // Use toast hook
  const { toast, showSuccess, showError } = useToast();
  
  const [activeTab, setActiveTab] = useState('security');
  const { darkMode, theme, setThemePreference, toggleDarkMode } = useDarkMode();
  
  // Add state for UI-related items
  const [isLoading, setIsLoading] = useState(false);
  const [userId, setUserId] = useState(null);

  // Handle theme selection in appearance tab
  const handleThemeChange = (selectedTheme) => {
    setThemePreference(selectedTheme);
  };
  
  // Add avatar state
  const [avatar, setAvatar] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [isAvatarChanged, setIsAvatarChanged] = useState(false);
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

    if (location.hash) {
      window.history.replaceState(null, '', window.location.pathname + window.location.search);
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
    firstName: '',
    lastName: '',
    name: '',
    email: '',
    jobTitle: '',
    bio: '',
    gender: 'PREFER_NOT_TO_SAY',
    dob: '',
    profilePicture: ''
  });
  
  const [isEditing, setIsEditing] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Load user data from localStorage on component mount
  useEffect(() => {
    loadUserData();
  }, []);

  // Load user data from localStorage
  const loadUserData = () => {
    try {
      // Get user data from localStorage
      const userData = JSON.parse(localStorage.getItem('userData'));
      
      if (!userData) {
        showError("Error", "No user data found. Please log in again.");
        return;
      }
      
      // Set user ID
      setUserId(userData.id || userData.userId);
      
      // Process profile picture URL
      const profilePicture = userData.profilePicture 
                ? `${API_BASE_URL}${userData.profilePicture}` 
                : defaultpfp;
      
      // Update profile data
      setProfileData({
        firstName: userData.firstName || '',
        lastName: userData.lastName || '',
        name: `${userData.firstName || ''} ${userData.lastName || ''}`.trim() || userData.name || '',
        email: userData.email || '',
        jobTitle: userData.jobTitle || 'Not specified',
        bio: userData.bio || 'No bio provided',
        gender: userData.gender || 'PREFER_NOT_TO_SAY',
        dob: userData.dob || '',
        profilePicture: profilePicture
      });
      
      // Set avatar preview if available
      setAvatarPreview(profilePicture);
      
      // Load notification settings if available
      if (userData.notificationSettings) {
        setNotificationSettings(userData.notificationSettings);
      }
    } catch (err) {
      console.error("Error loading user data from localStorage:", err);
      showError("Error", "Failed to load user data. Please try logging in again.");
    }
  };

  const handleNotificationChange = (setting) => {
    // Update local state immediately for responsiveness
    const updatedSettings = {
      ...notificationSettings,
      [setting]: !notificationSettings[setting]
    };
    setNotificationSettings(updatedSettings);
    
    // Save to localStorage
    try {
      const userData = JSON.parse(localStorage.getItem('userData'));
      userData.notificationSettings = updatedSettings;
      localStorage.setItem('userData', JSON.stringify(userData));
      showSuccess("Success", "Notification preferences updated");
    } catch (err) {
      console.error("Error saving notification settings to localStorage:", err);
      showError("Error", "Failed to save notification settings");
    }
  };

  const handleProfileChange = (field, value) => {
    setProfileData({
      ...profileData,
      [field]: value
    });
    
    // If changing first or last name, update the full name
    if (field === 'firstName' || field === 'lastName') {
      const firstName = field === 'firstName' ? value : profileData.firstName;
      const lastName = field === 'lastName' ? value : profileData.lastName;
      setProfileData(prev => ({
        ...prev,
        firstName,
        lastName,
        name: `${firstName} ${lastName}`.trim()
      }));
    }
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
    setIsAvatarChanged(true);
    
    // Create a preview URL
    const reader = new FileReader();
    reader.onloadend = () => {
      setAvatarPreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  // Handle saving only the avatar
  const handleSaveAvatar = async () => {
    if (!avatar) return;
    
    setIsLoading(true);
    
    try {
      // Get current user data
      const userData = JSON.parse(localStorage.getItem('userData'));
      const userId = userData.id;
      
      // Handle profile picture upload
      const formData = new FormData();
      formData.append('file', avatar);
      
      const uploadResponse = await fetch(`${API_BASE_URL}/api/users/${userId}/upload-pfp`, {
        method: 'PUT',
        body: formData
      });
      
      if (!uploadResponse.ok) {
        throw new Error(`Failed to upload profile picture: ${uploadResponse.statusText}`);
      }
      
      // Get the profile picture path from the response
      const profilePicturePath = await uploadResponse.text();
      
      // Update userData in localStorage
      userData.profilePicture = profilePicturePath;
      localStorage.setItem('userData', JSON.stringify(userData));
      
      // Update the preview with the proper URL
      const fullProfilePicUrl = `${API_BASE_URL}${profilePicturePath}`;
      setAvatarPreview(fullProfilePicUrl);
      setProfileData(prev => ({
        ...prev,
        profilePicture: fullProfilePicUrl
      }));
      
      setIsAvatarChanged(false);
      setAvatar(null);
      window.dispatchEvent(new Event('userDataUpdated'));
      
      showSuccess("Success", "Profile picture updated successfully!");
    } catch (err) {
      console.error("Error updating profile picture:", err);
      showError("Error", "Failed to save profile picture. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Trigger the hidden file input
  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  // Handle saving profile data to database and then localStorage
  const handleSaveProfile = async () => {
    setIsLoading(true);
    
    try {
      // Get current user data
      const userData = JSON.parse(localStorage.getItem('userData'));
      const userId = userData.id;
      
      // Prepare user data to send to API
      const userUpdateData = {
        firstName: profileData.firstName,
        lastName: profileData.lastName,
        bio: profileData.bio,
        dob: profileData.dob,
        gender: profileData.gender,
        title: profileData.jobTitle
      };
      
      // First, update user profile in the database
      const response = await fetch(`${API_BASE_URL}/api/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(userUpdateData)
      });
      
      if (!response.ok) {
        throw new Error(`Failed to update profile: ${response.statusText}`);
      }
      
      // Handle profile picture upload if available
      if (avatar) {
        const formData = new FormData();
        formData.append('file', avatar);
        
        const uploadResponse = await fetch(`${API_BASE_URL}/api/users/${userId}/upload-pfp`, {
          method: 'PUT',
          body: formData
        });
        
        if (!uploadResponse.ok) {
          throw new Error(`Failed to upload profile picture: ${uploadResponse.statusText}`);
        }
        
        // Get the profile picture path from the response
        const profilePicturePath = await uploadResponse.text();
        userUpdateData.profilePicture = profilePicturePath;
        
        // Update the avatar preview with the proper URL
        const fullProfilePicUrl = `${API_BASE_URL}${profilePicturePath}`;
        setAvatarPreview(fullProfilePicUrl);
        setIsAvatarChanged(false);
      }
      
      // If database updates are successful, update localStorage
      const updatedUserData = {
        ...userData,
        ...userUpdateData,
        name: `${profileData.firstName} ${profileData.lastName}`, // Update combined name field if needed
        jobTitle: profileData.jobTitle // This field isn't in the API but keeping it for frontend use
      };
      
      // Save updated user data to localStorage
      localStorage.setItem('userData', JSON.stringify(updatedUserData));
      
      showSuccess("Success", "Profile updated successfully!");
      setIsEditing(false);
      
      // Reset avatar state after successful upload
      if (avatar) {
        setAvatar(null);
      }
    } catch (err) {
      console.error("Error updating profile:", err);
      showError("Error", "Failed to save profile changes. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    // Reset unsaved changes by reloading user data
    loadUserData();
    // Reset avatar if it was changed but not saved
    if (avatar) {
      setAvatar(null);
      setIsAvatarChanged(false);
      // Restore previous avatar preview
      const userData = JSON.parse(localStorage.getItem('userData'));
      const profilePicture = userData.profilePicture 
                ? `${API_BASE_URL}${userData.profilePicture}` 
                : defaultpfp;
      setAvatarPreview(profilePicture);
      fileInputRef.current.value = '';
    }
  };

  const handleCancelAvatarChange = () => {
    setAvatar(null);
    setIsAvatarChanged(false);
    // Restore previous avatar preview
    const userData = JSON.parse(localStorage.getItem('userData'));
    const profilePicture = userData.profilePicture 
              ? `${API_BASE_URL}${userData.profilePicture}` 
              : defaultpfp;
    setAvatarPreview(profilePicture);
    fileInputRef.current.value = '';
  };

  // Handle email update
  const handleUpdateEmail = async () => {
    if (!newEmail || !currentPassword) {
      showError("Error", "Both new email and current password are required");
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Get current user data
      const userData = JSON.parse(localStorage.getItem('userData'));
      const userId = userData.id;
      
      // Prepare email update payload
      const emailUpdateData = {
        newEmail: newEmail,
        password: currentPassword
      };
      
      // Update email in the database first
      const response = await fetch(`${API_BASE_URL}/api/users/${userId}/email`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(emailUpdateData)
      });
      
      if (!response.ok) {
        // Extract error message from response if available
        const errorText = await response.text();
        throw new Error(errorText || `Failed to update email: ${response.statusText}`);
      }
      
      // If database update successful, update in localStorage
      userData.email = newEmail;
      localStorage.setItem('userData', JSON.stringify(userData));
      
      // Update profile data state
      setProfileData(prev => ({
        ...prev,
        email: newEmail
      }));
      
      // Clear input fields
      setNewEmail('');
      setCurrentPassword('');
      
      showSuccess("Success", "Email updated successfully!");
    } catch (err) {
      console.error("Error updating email:", err);
      // Display more specific error if available
      showError("Error", err.message || "Failed to update email. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle password update
  const handleUpdatePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      showError("Error", "All password fields are required");
      return;
    }
    
    if (newPassword !== confirmPassword) {
      showError("Error", "New passwords do not match");
      return;
    }
    
    if (newPassword.length < 6) {
      showError("Error", "Password must be at least 6 characters long");
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Get current user data
      const userData = JSON.parse(localStorage.getItem('userData'));
      const userId = userData.id;
      
      // Prepare password update payload
      const passwordUpdateData = {
        currentPassword: currentPassword,
        newPassword: newPassword
      };
      
      // Update password in the database first
      const response = await fetch(`${API_BASE_URL}/api/users/${userId}/password`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(passwordUpdateData)
      });
      
      if (!response.ok) {
        // Extract error message from response if available
        const errorText = await response.text();
        throw new Error(errorText || `Failed to update password: ${response.statusText}`);
      }
      
      // If database update successful, update in localStorage
      // Note: We don't actually store the raw password in localStorage for security
      // but we keep the userData object updated to maintain consistency
      
      // Clear input fields
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      
      showSuccess("Success", "Password updated successfully!");
    } catch (err) {
      console.error("Error updating password:", err);
      // Display more specific error if available
      showError("Error", err.message || "Failed to update password. Please try again.");
    } finally {
      setIsLoading(false);
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
            
            {isLoading ? (
              <div className={styles.loadingSpinner}>Loading...</div>
            ) : (
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
                      backgroundImage: `url(${avatarPreview})`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      cursor: 'pointer',
                    }}
                  >
                    {!avatarPreview && (
                      <Upload size={48} className={styles.avatarUploadIcon} />
                    )}
                  </div>
                  
                  {isAvatarChanged ? (
                    <div className={styles.avatarButtonGroup}>
                      <button 
                        className={styles.avatarSaveButton}
                        onClick={handleSaveAvatar}
                        disabled={isLoading}
                      >
                        <Save size={14} style={{ marginRight: '0.25rem' }} /> 
                        {isLoading ? 'Saving...' : 'Save Photo'}
                      </button>
                      <button 
                        className={styles.avatarCancelButton}
                        onClick={handleCancelAvatarChange}
                        disabled={isLoading}
                      >
                        <X size={14} style={{ marginRight: '0.25rem' }} /> Cancel
                      </button>
                    </div>
                  ) : (
                    <button 
                      className={styles.avatarUploadButton}
                      onClick={triggerFileInput}
                    >
                      <Upload size={14} style={{ marginRight: '0.25rem' }} /> Change photo
                    </button>
                  )}
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
                            <span className={styles.infoValue}>
                              {profileData.gender === 'MALE' ? 'Male' : 
                               profileData.gender === 'FEMALE' ? 'Female' : 
                               profileData.gender === 'NON_BINARY' ? 'Non-binary' : 'Prefer not to say'}
                            </span>
                          </div>
                          <div className={styles.infoItem}>
                            <span className={styles.infoLabel}>Date of Birth</span>
                            <span className={styles.infoValue}>
                              {profileData.dob ? new Date(profileData.dob).toLocaleDateString() : 'Not specified'}
                            </span>
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
                        <label className={styles.formLabel}>First Name</label>
                        <input 
                          type="text" 
                          value={profileData.firstName} 
                          onChange={(e) => handleProfileChange('firstName', e.target.value)}
                          className={styles.formInput}
                        />
                      </div>
                      <div className={styles.formGroup}>
                        <label className={styles.formLabel}>Last Name</label>
                        <input 
                          type="text" 
                          value={profileData.lastName} 
                          onChange={(e) => handleProfileChange('lastName', e.target.value)}
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
                          <option value="MALE">Male</option>
                          <option value="FEMALE">Female</option>
                          <option value="NON_BINARY">Non-binary</option>
                          <option value="PREFER_NOT_TO_SAY">Prefer not to say</option>
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
                          disabled={isLoading}
                        >
                          <X size={16} className={styles.buttonIconLeft} /> Cancel
                        </button>
                        <button 
                          className={styles.saveButton}
                          onClick={handleSaveProfile}
                          disabled={isLoading}
                        >
                          <Save size={16} className={styles.buttonIconLeft} /> 
                          {isLoading ? 'Saving...' : 'Save Changes'}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
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
                    disabled={isLoading}
                  >
                    {isLoading ? 'Updating...' : 'Update Email'}
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
                    disabled={isLoading}
                  >
                    {isLoading ? 'Updating...' : 'Update Password'}
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
      {/* Render Toast component */}
      <Toast
        visible={toast.visible}
        type={toast.type}
        title={toast.title}
        message={toast.message}
      />
      
      <div className={styles.settingsPageContainer}>
        {/* Header */}
        <Header 
          greeting={"Account Settings"} 
          toggleSidebar={toggleSidebar}
          isMobile={isMobile}
          sidebarOpen={isSidebarExpanded}
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