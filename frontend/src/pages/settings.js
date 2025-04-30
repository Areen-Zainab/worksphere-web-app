import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Bell, User, Lock, Palette, Moon, Sun, Monitor, ChevronRight, Upload } from 'lucide-react';


export default function UserSettings() {
  const [activeTab, setActiveTab] = useState('security');
  const [theme, setTheme] = useState('system');
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
    bio: 'Passionate about productivity and collaboration tools.'
  });
  const [isEditing, setIsEditing] = useState(false);

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

  const handleSaveProfile = () => {
    setIsEditing(false);
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
                  <Upload size={48} className="avatar-upload-icon" />
                </div>
                <button className="avatar-upload-button">
                  <Upload size={14} style={{ marginRight: '0.25rem' }} /> Change photo
                </button>
              </div>
              <div className="profile-details">
                <div className="profile-card">
                  <h3 className="profile-name">{profileData.name}</h3>
                  <p className="profile-email">{profileData.email}</p>
                  <div className="profile-job-title">
                    {profileData.jobTitle}
                  </div>
                </div>
                <div className="about-card">
                  <h4 className="about-label">About</h4>
                  <p className="about-text">{profileData.bio}</p>
                </div>
                <button 
                  className="edit-profile-button"
                  onClick={() => setIsEditing(true)}
                >
                  Edit Profile
                  <ChevronRight size={16} className="button-icon-right" />
                </button>
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
                  placeholder="Current password" 
                  className="password-input" 
                />
                <input 
                  type="password" 
                  placeholder="New password" 
                  className="password-input" 
                />
                <input 
                  type="password" 
                  placeholder="Confirm new password" 
                  className="password-input" 
                />
                <button className="update-button">
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