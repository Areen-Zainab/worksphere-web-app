import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Bell, User, Lock, Palette, Moon, Sun, Monitor, ChevronRight, Upload } from 'lucide-react';

export default function UserSettings() {
  const API_URL = "http://localhost:8080/api/users";
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('profile');
  const [theme, setTheme] = useState('system');
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    pushNotifications: true,
    taskReminders: true,
    weeklyDigest: false,
    mentions: true
  });
  
  // User profile state
  const [userId, setUserId] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [profileData, setProfileData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    dob: '',
    gender: 'OTHER',
    bio: '',
    profilePicture: null
  });
  
  // Password state
  const [passwordData, setPasswordData] = useState({
    newPassword: '',
    confirmPassword: ''
  });
  
  // Profile picture state
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  
  // Create a toast notification function
  const showToast = (type, title, message) => {
    // You could use a toast library or implement your own toast component
    alert(`${type}: ${title} - ${message}`);
  };
  
  // Handle loading user data on component mount
  useEffect(() => {
    const storedUserId = localStorage.getItem("loggedInUserID") || "";
    const storedUserEmail = localStorage.getItem("loggedInUser") || "";
    
    if (!storedUserId) {
      showToast("error", "User not found!", "Redirecting to login.");
      setTimeout(() => {
        navigate('/login');
      }, 2000);
      return;
    }
    
    setUserId(storedUserId);
    setUserEmail(storedUserEmail);
    
    // Set email from local storage
    setProfileData(prev => ({
      ...prev,
      email: storedUserEmail
    }));
    
    // Fetch user data
    fetchUserData(storedUserId);
    
    // Fetch notification settings
    fetchNotificationSettings(storedUserId);
    
    // Fetch appearance settings
    fetchAppearanceSettings(storedUserId);
  }, [navigate]);
  
  // Function to fetch user data from API
  const fetchUserData = async (id) => {
    try {
      const response = await fetch(`${API_URL}/${id}`);
      
      console.log(response);
      if (!response.ok) throw new Error("Failed to fetch user data");

      const userData = await response.json();
      console.log("User data received:", userData);
      
      setProfileData({
        firstName: userData.firstName || '',
        lastName: userData.lastName || '',
        email: userEmail || userData.email || '',
        dob: userData.dob || '',
        gender: userData.gender || 'OTHER',
        bio: userData.bio || '',
        profilePicture: userData.profilePicture || null
      });
      
      // Set preview URL if profile picture exists
      if (userData.profilePicture) {
        setPreviewUrl(userData.profilePicture);
      }
    } catch (error) {
      console.error("Error loading user data:", error);
      showToast("error", "Error", "Failed to load user data");
    }
  };
  
  // Function to fetch notification settings
  const fetchNotificationSettings = async (id) => {
    try {
      const response = await fetch(`${API_URL}/${id}/notifications`);
      if (!response.ok) throw new Error("Failed to fetch notification settings");

      const notificationData = await response.json();
      setNotificationSettings({
        emailNotifications: notificationData.emailNotifications ?? true,
        pushNotifications: notificationData.pushNotifications ?? true,
        taskReminders: notificationData.taskReminders ?? true,
        weeklyDigest: notificationData.weeklyDigest ?? false,
        mentions: notificationData.mentions ?? true
      });
    } catch (error) {
      console.error("Error loading notification settings:", error);
      // If API endpoint doesn't exist yet, continue with default settings
    }
  };
  
  // Function to fetch appearance settings
  const fetchAppearanceSettings = async (id) => {
    try {
      const response = await fetch(`${API_URL}/${id}/appearance`);
      if (!response.ok) throw new Error("Failed to fetch appearance settings");

      const appearanceData = await response.json();
      setTheme(appearanceData.theme || 'system');
    } catch (error) {
      console.error("Error loading appearance settings:", error);
      // If API endpoint doesn't exist yet, continue with default settings
    }
  };
  
  // Function to update user profile data
  const updateUserData = async () => {
    const updatedData = {
      firstName: profileData.firstName.trim(),
      lastName: profileData.lastName.trim(),
      dob: profileData.dob,
      gender: profileData.gender,
      bio: profileData.bio,
    };

    try {
      const response = await fetch(`${API_URL}/${userId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedData),
      });

      if (!response.ok) throw new Error("Failed to update profile");

      alert("Profile updated successfully!");
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("Failed to update profile.");
    }
  };
  
  // Function to update user password
  const updateUserPassword = async () => {
    const { newPassword, confirmPassword } = passwordData;

    // Validate password inputs
    if (!newPassword || !confirmPassword) {
      alert("Please fill in both password fields.");
      return;
    }
    if (newPassword.length < 6) {
      alert("Password must be at least 6 characters long.");
      return;
    }
    if (newPassword !== confirmPassword) {
      alert("Passwords do not match.");
      return;
    }

    try {
      const response = await fetch(`${API_URL}/${userId}/password`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: newPassword }),
      });

      if (!response.ok) throw new Error("Failed to update password");

      alert("Password updated successfully!");
      setPasswordData({ newPassword: '', confirmPassword: '' });
    } catch (error) {
      console.error("Error updating password:", error);
      alert("Failed to update password.");
    }
  };
  
  // Handle file selection for profile picture
  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      
      // Create preview URL
      const reader = new FileReader();
      reader.onload = (event) => {
        setPreviewUrl(event.target.result);
      };
      reader.readAsDataURL(file);
    }
  };
  
  // Upload profile picture
  const uploadProfilePicture = async () => {
    if (!selectedFile) {
      alert("Please select an image first.");
      return;
    }

    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      const response = await fetch(`${API_URL}/${userId}/upload-pfp`, {
        method: "PUT",
        body: formData,
      });

      const imagePath = await response.text();
      if (response.ok) {
        setPreviewUrl(imagePath);
        setProfileData(prev => ({
          ...prev,
          profilePicture: imagePath
        }));
        alert("Profile picture updated successfully!");
      } else {
        alert("Error: " + imagePath);
      }
    } catch (error) {
      console.error("Error uploading profile picture:", error);
      alert("Failed to upload profile picture.");
    }
  };
  
  // Handle profile data change
  const handleProfileChange = (field, value) => {
    setProfileData({
      ...profileData,
      [field]: value
    });
  };
  
  // Handle password field changes
  const handlePasswordChange = (field, value) => {
    setPasswordData({
      ...passwordData,
      [field]: value
    });
  };

  // Handle notification preferences change
  const handleNotificationChange = (setting) => {
    setNotificationSettings({
      ...notificationSettings,
      [setting]: !notificationSettings[setting]
    });
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'profile':
        return (
          <div>
            <div className="section-header">
              <User size={20} className="section-icon" />
              <h2 className="section-title">Profile Settings</h2>
            </div>
            
            <div className="profile-layout">
              <div className="avatar-container">
                <div className="avatar-placeholder">
                  {previewUrl ? (
                    <img 
                      src={previewUrl} 
                      alt="Profile" 
                      className="profile-image" 
                      style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} 
                    />
                  ) : (
                    <Upload size={48} className="avatar-upload-icon" />
                  )}
                </div>
                <input
                  type="file"
                  id="image-upload"
                  accept="image/*"
                  style={{ display: 'none' }}
                  onChange={handleFileSelect}
                />
                <button 
                  className="avatar-upload-button"
                  onClick={() => document.getElementById('image-upload').click()}
                >
                  <Upload size={14} style={{ marginRight: '0.25rem' }} /> Choose photo
                </button>
                <button 
                  className="avatar-save-button"
                  onClick={uploadProfilePicture}
                  disabled={!selectedFile}
                >
                  Save Picture
                </button>
              </div>
              
              <div className="profile-details">
                <div className="profile-card">
                  <div className="form-group">
                    <label htmlFor="first-name">First Name</label>
                    <input
                      id="first-name"
                      type="text"
                      className="form-input"
                      value={profileData.firstName}
                      onChange={(e) => handleProfileChange('firstName', e.target.value)}
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="last-name">Last Name</label>
                    <input
                      id="last-name"
                      type="text"
                      className="form-input"
                      value={profileData.lastName}
                      onChange={(e) => handleProfileChange('lastName', e.target.value)}
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="email">Email</label>
                    <input
                      id="email"
                      type="email"
                      className="form-input"
                      value={profileData.email}
                      readOnly
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="dob">Date of Birth</label>
                    <input
                      id="dob"
                      type="date"
                      className="form-input"
                      value={profileData.dob}
                      onChange={(e) => handleProfileChange('dob', e.target.value)}
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="gender">Gender</label>
                    <select
                      id="gender"
                      className="form-select"
                      value={profileData.gender}
                      onChange={(e) => handleProfileChange('gender', e.target.value)}
                    >
                      <option value="MALE">Male</option>
                      <option value="FEMALE">Female</option>
                      <option value="OTHER">Other</option>
                    </select>
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="bio">Biography</label>
                    <textarea
                      id="bio"
                      className="form-textarea"
                      value={profileData.bio}
                      onChange={(e) => handleProfileChange('bio', e.target.value)}
                      rows={4}
                    />
                  </div>
                  
                  <button 
                    className="update-button"
                    onClick={updateUserData}
                  >
                    Save Profile
                  </button>
                </div>
              </div>
            </div>
          </div>
        );

      case 'notifications':
        return (
          <div>
            <div className="section-header">
              <Bell size={20} className="section-icon" />
              <h2 className="section-title">Notification Preferences</h2>
            </div>
            
            <div className="notifications-list">
              {Object.entries(notificationSettings).map(([setting, value]) => {
                const settingName = setting === 'emailNotifications' ? 'Email Notifications' :
                                  setting === 'pushNotifications' ? 'Push Notifications' :
                                  setting === 'taskReminders' ? 'Task Reminders' :
                                  setting === 'weeklyDigest' ? 'Weekly Digest' : 'Mentions';
                
                return (
                  <div key={setting} className="notification-item">
                    <span className="notification-label">{settingName}</span>
                    <div className="toggle-container">
                      <input
                        type="checkbox"
                        id={setting}
                        checked={value}
                        onChange={() => handleNotificationChange(setting)}
                        className="toggle-input"
                      />
                      <label htmlFor={setting} className="toggle-slider">
                        <span className="toggle-handle"></span>
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
            <div className="section-header">
              <Palette size={20} className="section-icon" />
              <h2 className="section-title">Appearance</h2>
            </div>
            
            <div>
              <h3 className="section-title" style={{ fontSize: '1.125rem', marginBottom: '1rem' }}>Theme Selection</h3>
              <div className="themes-container">
                {[{ name: 'light', icon: Sun }, { name: 'dark', icon: Moon }, { name: 'system', icon: Monitor }].map((option) => (
                  <div
                    key={option.name}
                    onClick={() => setTheme(option.name)}
                    className={`theme-option ${
                      theme === option.name ? 'theme-option-active' : 'theme-option-inactive'
                    }`}
                  >
                    <option.icon 
                      size={32} 
                      className={theme === option.name ? 'theme-icon-active' : 'theme-icon-inactive'} 
                    />
                    <span className={`theme-label ${
                      theme === option.name ? 'theme-label-active' : 'theme-label-inactive'
                    }`}>
                      {option.name}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 'security':
        return (
          <div>
            <div className="section-header">
              <Lock size={20} className="section-icon" />
              <h2 className="section-title">Security</h2>
            </div>
            
            <div>
              <h3 className="section-title" style={{ fontSize: '1.125rem', marginBottom: '1.5rem' }}>Change Password</h3>
              <div className="password-form">
                <input 
                  type="password" 
                  placeholder="New password" 
                  className="password-input"
                  value={passwordData.newPassword}
                  onChange={(e) => handlePasswordChange('newPassword', e.target.value)}
                />
                <input 
                  type="password" 
                  placeholder="Confirm new password" 
                  className="password-input" 
                  value={passwordData.confirmPassword}
                  onChange={(e) => handlePasswordChange('confirmPassword', e.target.value)}
                />
                <button 
                  className="update-button"
                  onClick={updateUserPassword}
                >
                  Update Password
                </button>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="app-container">
      {/* Header */}
      <header className="app-header">
        <div className="app-logo">
          <Link to="/" className="logo-link">WorkSphere</Link>
        </div>
      </header>

      {/* Main Content */}
      <div className="main-content">
        {/* Settings Header */}
        <div className="settings-header">
          <div className="header-icon-container">
            <div className="header-icon">
              <Palette size={24} />
            </div>
            <h1 className="settings-title">Settings</h1>
          </div>
          <p className="settings-subtitle">Manage your account preferences and settings</p>
        </div>

        {/* Settings Container */}
        <div className="settings-container">
          <div className="settings-panel">
            <div className="panel-layout">
              {/* Sidebar */}
              <div className="sidebar">
                <div className="sidebar-nav">
                  <button 
                    onClick={() => setActiveTab('profile')} 
                    className={`sidebar-nav-button ${
                      activeTab === 'profile' ? 'sidebar-nav-button-active' : 'sidebar-nav-button-inactive'
                    }`}
                  >
                    <User className="sidebar-icon" size={18} /> Profile
                  </button>
                  <button 
                    onClick={() => setActiveTab('notifications')} 
                    className={`sidebar-nav-button ${
                      activeTab === 'notifications' ? 'sidebar-nav-button-active' : 'sidebar-nav-button-inactive'
                    }`}
                  >
                    <Bell className="sidebar-icon" size={18} /> Notifications
                  </button>
                  <button 
                    onClick={() => setActiveTab('appearance')} 
                    className={`sidebar-nav-button ${
                      activeTab === 'appearance' ? 'sidebar-nav-button-active' : 'sidebar-nav-button-inactive'
                    }`}
                  >
                    <Palette className="sidebar-icon" size={18} /> Appearance
                  </button>
                  <button 
                    onClick={() => setActiveTab('security')} 
                    className={`sidebar-nav-button ${
                      activeTab === 'security' ? 'sidebar-nav-button-active' : 'sidebar-nav-button-inactive'
                    }`}
                  >
                    <Lock className="sidebar-icon" size={18} /> Security
                  </button>
                </div>
              </div>
              
              {/* Content Area */}
              <div className="content-area">
                {renderTabContent()}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="app-footer">
        <div className="footer-content">
          &copy; 2025 WorkSphere. All rights reserved.
        </div>
      </footer>
    </div>
  );
}