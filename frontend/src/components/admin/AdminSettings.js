import React, { useState, useEffect } from 'react';
import styles from '../../css/admin/adminSettings.module.css';

// SVG Icon Components
const GeneralIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3"></circle>
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
  </svg>
);

const UserIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
    <circle cx="12" cy="7" r="4"></circle>
  </svg>
);

const BrushIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 19l7-7 3 3-7 7-3-3z"></path>
    <path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"></path>
    <path d="M2 2l7.586 7.586"></path>
    <circle cx="11" cy="11" r="2"></circle>
  </svg>
);

const SaveIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
    <polyline points="17 21 17 13 7 13 7 21"></polyline>
    <polyline points="7 3 7 8 15 8"></polyline>
  </svg>
);

const AdminSettings = ({ darkMode }) => {
  // Simplified settings state
  const [settings, setSettings] = useState({
    // General settings
    siteName: 'Admin Dashboard',
    adminEmail: 'admin@example.com',
    timeZone: 'UTC',
    
    // User settings
    defaultUserRole: 'user',
    allowRegistration: true,
    emailVerification: true,
    maxLoginAttempts: 5,
    
    // Appearance settings
    primaryColor: '#4285F4',
    accentColor: '#34A853',
    fontSize: '14px',
  });
  
  const [activeTab, setActiveTab] = useState('general');
  const [successMessage, setSuccessMessage] = useState('');
  const [saveLoading, setSaveLoading] = useState(false);
  
  // Time zone options
  const timeZones = [
    { value: 'UTC', label: 'UTC (Coordinated Universal Time)' },
    { value: 'EST', label: 'EST (Eastern Standard Time)' },
    { value: 'CST', label: 'CST (Central Standard Time)' },
    { value: 'MST', label: 'MST (Mountain Standard Time)' },
    { value: 'PST', label: 'PST (Pacific Standard Time)' },
    { value: 'IST', label: 'IST (Indian Standard Time)' },
    { value: 'JST', label: 'JST (Japan Standard Time)' }
  ];
  
  // Handle all input changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSettings(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };
  
  // Simple form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    setSaveLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      console.log('Settings to save:', settings);
      setSaveLoading(false);
      setSuccessMessage('Settings saved successfully!');
      
      // Hide success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
    }, 800);
    
    // For backend implementation:
    // fetch('/api/settings', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(settings)
    // })
  };
  
  return (
    <div className={`${styles.settingsContainer} ${darkMode ? styles.darkMode : ''}`}>
      <div className={styles.settingsSidebar}>
        <h3>Settings</h3>
        <ul className={styles.settingsNav}>
          <li 
            className={`${styles.settingsNavItem} ${activeTab === 'general' ? styles.active : ''}`}
            onClick={() => setActiveTab('general')}
          >
            <span className={styles.icon}><GeneralIcon /></span>
            <span className={styles.label}>General</span>
          </li>
          <li 
            className={`${styles.settingsNavItem} ${activeTab === 'users' ? styles.active : ''}`}
            onClick={() => setActiveTab('users')}
          >
            <span className={styles.icon}><UserIcon /></span>
            <span className={styles.label}>Users</span>
          </li>
          <li 
            className={`${styles.settingsNavItem} ${activeTab === 'appearance' ? styles.active : ''}`}
            onClick={() => setActiveTab('appearance')}
          >
            <span className={styles.icon}><BrushIcon /></span>
            <span className={styles.label}>Appearance</span>
          </li>
        </ul>
      </div>
      
      <div className={styles.settingsContent}>
        {successMessage && (
          <div className={styles.successMessage}>
            <div className={styles.successIcon}>
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                <polyline points="22 4 12 14.01 9 11.01"></polyline>
              </svg>
            </div>
            <span>{successMessage}</span>
          </div>
        )}
        
        {activeTab === 'general' && (
          <div className={styles.settingsPanel}>
            <h3>General Settings</h3>
            <form onSubmit={handleSubmit}>
              <div className={styles.formGroup}>
                <label htmlFor="siteName">Site Name</label>
                <input
                  type="text"
                  id="siteName"
                  name="siteName"
                  value={settings.siteName}
                  onChange={handleChange}
                  className={styles.input}
                />
              </div>
              
              <div className={styles.formGroup}>
                <label htmlFor="adminEmail">Admin Email</label>
                <input
                  type="email"
                  id="adminEmail"
                  name="adminEmail"
                  value={settings.adminEmail}
                  onChange={handleChange}
                  className={styles.input}
                />
              </div>
              
              <div className={styles.formGroup}>
                <label htmlFor="timeZone">Time Zone</label>
                <select
                  id="timeZone"
                  name="timeZone"
                  value={settings.timeZone}
                  onChange={handleChange}
                  className={styles.select}
                >
                  {timeZones.map(zone => (
                    <option key={zone.value} value={zone.value}>
                      {zone.label}
                    </option>
                  ))}
                </select>
              </div>
              
              <button type="submit" className={styles.saveButton} disabled={saveLoading}>
                {saveLoading ? (
                  <span className={styles.loadingSpinner}></span>
                ) : (
                  <>
                    <SaveIcon />
                    <span>Save Changes</span>
                  </>
                )}
              </button>
            </form>
          </div>
        )}
        
        {activeTab === 'users' && (
          <div className={styles.settingsPanel}>
            <h3>User Settings</h3>
            <form onSubmit={handleSubmit}>
              <div className={styles.toggleGroup}>
                <label className={styles.toggleSwitch}>
                  <input
                    type="checkbox"
                    id="allowRegistration"
                    name="allowRegistration"
                    checked={settings.allowRegistration}
                    onChange={handleChange}
                  />
                  <span className={styles.toggleSlider}></span>
                </label>
                <span className={styles.toggleLabel}>Allow User Registration</span>
              </div>
              
              <div className={styles.toggleGroup}>
                <label className={styles.toggleSwitch}>
                  <input
                    type="checkbox"
                    id="emailVerification"
                    name="emailVerification"
                    checked={settings.emailVerification}
                    onChange={handleChange}
                  />
                  <span className={styles.toggleSlider}></span>
                </label>
                <span className={styles.toggleLabel}>Require Email Verification</span>
              </div>
              
              <div className={styles.formGroup}>
                <label htmlFor="defaultUserRole">Default User Role</label>
                <select
                  id="defaultUserRole"
                  name="defaultUserRole"
                  value={settings.defaultUserRole}
                  onChange={handleChange}
                  className={styles.select}
                >
                  <option value="admin">Admin</option>
                  <option value="manager">Manager</option>
                  <option value="user">User</option>
                </select>
              </div>
              
              <div className={styles.formGroup}>
                <label htmlFor="maxLoginAttempts">
                  Max Failed Login Attempts Before Lockout
                </label>
                <input
                  type="number"
                  id="maxLoginAttempts"
                  name="maxLoginAttempts"
                  value={settings.maxLoginAttempts}
                  onChange={handleChange}
                  min="1"
                  max="10"
                  className={styles.input}
                />
              </div>
              
              <button type="submit" className={styles.saveButton} disabled={saveLoading}>
                {saveLoading ? (
                  <span className={styles.loadingSpinner}></span>
                ) : (
                  <>
                    <SaveIcon />
                    <span>Save Changes</span>
                  </>
                )}
              </button>
            </form>
          </div>
        )}
        
        {activeTab === 'appearance' && (
          <div className={styles.settingsPanel}>
            <h3>Appearance Settings</h3>
            <form onSubmit={handleSubmit}>
              <div className={styles.colorGroup}>
                <label htmlFor="primaryColor">Primary Color</label>
                <div className={styles.colorInput}>
                  <input
                    type="color"
                    id="primaryColor"
                    name="primaryColor"
                    value={settings.primaryColor}
                    onChange={handleChange}
                    className={styles.colorPicker}
                  />
                  <span className={styles.colorValue}>{settings.primaryColor}</span>
                </div>
              </div>
              
              <div className={styles.colorGroup}>
                <label htmlFor="accentColor">Accent Color</label>
                <div className={styles.colorInput}>
                  <input
                    type="color"
                    id="accentColor"
                    name="accentColor"
                    value={settings.accentColor}
                    onChange={handleChange}
                    className={styles.colorPicker}
                  />
                  <span className={styles.colorValue}>{settings.accentColor}</span>
                </div>
              </div>
              
              <div className={styles.formGroup}>
                <label htmlFor="fontSize">Base Font Size</label>
                <div className={styles.rangeContainer}>
                  <input
                    type="range"
                    id="fontSize"
                    name="fontSize"
                    min="12"
                    max="18"
                    step="1"
                    value={parseInt(settings.fontSize)}
                    onChange={(e) => setSettings(prev => ({
                      ...prev,
                      fontSize: e.target.value + 'px'
                    }))}
                    className={styles.rangeInput}
                  />
                  <span className={styles.rangeValue}>{settings.fontSize}</span>
                </div>
              </div>
              
              <div className={styles.previewBox} style={{
                '--primary-color': settings.primaryColor,
                '--accent-color': settings.accentColor,
                fontSize: settings.fontSize
              }}>
                <h4 className={styles.previewTitle}>Preview</h4>
                <div className={styles.previewContent}>
                  <div className={styles.previewButton}>Primary Button</div>
                  <div className={styles.previewAccent}>Accent Element</div>
                  <p className={styles.previewText}>
                    This is how your text will appear with the selected font size. The quick brown fox jumps over the lazy dog.
                  </p>
                </div>
              </div>
              
              <button type="submit" className={styles.saveButton} disabled={saveLoading}>
                {saveLoading ? (
                  <span className={styles.loadingSpinner}></span>
                ) : (
                  <>
                    <SaveIcon />
                    <span>Save Changes</span>
                  </>
                )}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminSettings;