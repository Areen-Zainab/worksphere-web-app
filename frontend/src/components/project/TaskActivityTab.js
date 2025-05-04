import React, { useState, useEffect } from 'react';
import { 
  FilePlus, 
  RefreshCw, 
  Trash2, 
  RotateCw, 
  UserPlus, 
  UserX, 
  ListTodo, 
  Calendar, 
  MessageCircle, 
  Bookmark, 
  BookmarkX, 
  Upload, 
  CloudOff,
  Info,
  Clock
} from 'lucide-react';

// Component with inline styles to ensure it works regardless of CSS module issues
const ActivityTab = ({ taskId, theme = 'light', showRelativeTime = false }) => {
  const [activities, setActivities] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [dateTimeFormat, setDateTimeFormat] = useState('absolute'); // 'absolute' or 'relative'

  // Toggle date/time format
  const toggleDateTimeFormat = () => {
    setDateTimeFormat(dateTimeFormat === 'absolute' ? 'relative' : 'absolute');
  };

  // Inline styles for different themes
  const getContainerStyle = () => {
    const baseStyle = {
      height: '100%',
      overflowY: 'auto',
      padding: '1.5rem',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif',
      borderRadius: '4px',
      transition: 'all 0.3s ease'
    };

    switch(theme) {
      case 'dark':
        return {
          ...baseStyle,
          backgroundColor: '#212529',
          color: '#f8f9fa'
        };
      case 'highContrastDark':
        return {
          ...baseStyle,
          backgroundColor: '#000000',
          color: '#ffffff'
        };
      default:
        return {
          ...baseStyle,
          backgroundColor: '#f8f9fa',
          color: '#212529'
        };
    }
  };

  // Timeline styles
  const timelineStyle = {
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem',
    paddingLeft: '0.5rem'
  };

  useEffect(() => {
    if (taskId) {
      fetchActivities();
    }
  }, [taskId]);

  const fetchActivities = async () => {
    if (!taskId) return;
    
    setIsLoading(true);
    try {
      const userId = localStorage.getItem("loggedInUserID");
      
      if (!userId) {
        throw new Error('User ID not found');
      }
      
      const response = await fetch(`http://localhost:8080/api/task-activities/task/${taskId}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch activities: ${response.statusText}`);
      }
      
      const data = await response.json();
      setActivities(data);
    } catch (error) {
      console.error('Error fetching task activities:', error);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div style={getContainerStyle()}>
        <div style={{
          padding: '2rem',
          textAlign: 'center',
          borderRadius: '12px',
          marginTop: '1.5rem',
          fontWeight: 500,
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: theme === 'light' ? '#e9ecef' : theme === 'dark' ? '#343a40' : '#1a1a1a',
          color: theme === 'light' ? '#495057' : theme === 'dark' ? '#adb5bd' : '#ffffff'
        }}>
          <RotateCw 
            size={18} 
            style={{ 
              marginRight: '8px',
              animation: 'spin 1.5s linear infinite'
            }} 
          /> 
          Loading activities...
        </div>
        <style jsx>{`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  if (error) {
    return (
      <div style={getContainerStyle()}>
        <div style={{
          padding: '2rem',
          textAlign: 'center',
          borderRadius: '12px',
          marginTop: '1.5rem',
          fontWeight: 500,
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: theme === 'light' ? '#f8d7da' : theme === 'dark' ? '#2c1215' : '#300000',
          color: theme === 'light' ? '#842029' : theme === 'dark' ? '#ea868f' : '#ff6666',
          border: `1px solid ${theme === 'light' ? '#f5c2c7' : theme === 'dark' ? '#451419' : '#660000'}`
        }}>
          <Info size={18} style={{ marginRight: '8px' }} />
          Error loading activities: {error}
        </div>
      </div>
    );
  }

  // Format date/time for display
  const formatDateTime = (timestamp) => {
    if (!timestamp) return "Unknown date";
    
    const date = new Date(timestamp);
    
    // Format date: May 1, 2025 at 2:30 PM
    const options = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      hour12: true
    };
    
    return date.toLocaleString('en-US', options);
  };

  const formatTimeAgo = (timestamp) => {
    const now = new Date();
    const activityDate = new Date(timestamp);
    const diffInSeconds = Math.floor((now - activityDate) / 1000);
    
    if (diffInSeconds < 60) {
      return 'just now';
    }
    
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) {
      return `${diffInMinutes} ${diffInMinutes === 1 ? 'minute' : 'minutes'} ago`;
    }
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) {
      return `${diffInHours} ${diffInHours === 1 ? 'hour' : 'hours'} ago`;
    }
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) {
      return `${diffInDays} ${diffInDays === 1 ? 'day' : 'days'} ago`;
    }
    
    const diffInWeeks = Math.floor(diffInDays / 7);
    if (diffInWeeks < 4) {
      return `${diffInWeeks} ${diffInWeeks === 1 ? 'week' : 'weeks'} ago`;
    }
    
    const diffInMonths = Math.floor(diffInDays / 30);
    if (diffInMonths < 12) {
      return `${diffInMonths} ${diffInMonths === 1 ? 'month' : 'months'} ago`;
    }
    
    const diffInYears = Math.floor(diffInDays / 365);
    return `${diffInYears} ${diffInYears === 1 ? 'year' : 'years'} ago`;
  };

  // Function to get appropriate icon for each action type
  const getActionIcon = (action, iconColor) => {
    const iconStyle = { color: iconColor || '#FFFFFF' };
    const size = 18;
    
    switch(action) {
      case 'CREATED':
        return <FilePlus size={size} style={iconStyle} />;
      case 'UPDATED':
        return <RefreshCw size={size} style={iconStyle} />;
      case 'DELETED':
        return <Trash2 size={size} style={iconStyle} />;
      case 'STATUS_CHANGED':
        return <RotateCw size={size} style={iconStyle} />;
      case 'ASSIGNED':
        return <UserPlus size={size} style={iconStyle} />;
      case 'UNASSIGNED':
        return <UserX size={size} style={iconStyle} />;
      case 'PRIORITY_CHANGED':
        return <ListTodo size={size} style={iconStyle} />;
      case 'DEADLINE_CHANGED':
        return <Calendar size={size} style={iconStyle} />;
      case 'COMMENTED':
        return <MessageCircle size={size} style={iconStyle} />;
      case 'LABEL_ADDED':
        return <Bookmark size={size} style={iconStyle} />;
      case 'LABEL_REMOVED':
        return <BookmarkX size={size} style={iconStyle} />;
      case 'ATTACHMENT_ADDED':
        return <Upload size={size} style={iconStyle} />;
      case 'ATTACHMENT_REMOVED':
        return <CloudOff size={size} style={iconStyle} />;
      default:
        return <Info size={size} style={iconStyle} />;
    }
  };

  // Function to format the action message based on the action type and changed data
  const formatActionMessage = (activity) => {
    const { action, changedData } = activity;
    let parsedData = {};
    
    try {
      if (changedData) {
        parsedData = JSON.parse(changedData);
      }
    } catch (e) {
      console.error('Error parsing changed data:', e);
    }
    
    switch (action) {
      case 'CREATED':
        return 'Created this task';
      
      case 'UPDATED':
        let updates = [];
        if (parsedData.title) {
          updates.push(`title from "${parsedData.title.old}" to "${parsedData.title.new}"`);
        }
        if (parsedData.description) {
          updates.push('description');
        }
        return `Updated ${updates.join(' and ')}`;
      
      case 'STATUS_CHANGED':
        return `Changed status from ${parsedData.old_status} to ${parsedData.new_status}`;
      
      case 'ASSIGNED':
        if (parsedData.previous_assignee) {
          return `Reassigned task from ${parsedData.previous_assignee_name || 'someone'} to ${parsedData.new_assignee_name || 'someone else'}`;
        }
        return `Assigned task to ${parsedData.assigned_to_name || parsedData.new_assignee_name || 'someone'}`;
      
      case 'UNASSIGNED':
        return `Unassigned task from ${parsedData.previous_assignee_name || 'someone'}`;
      
      case 'PRIORITY_CHANGED':
        return `Changed priority from ${parsedData.old_priority} to ${parsedData.new_priority}`;
      
      case 'DEADLINE_CHANGED':
        const oldDate = parsedData.old_deadline ? new Date(parsedData.old_deadline).toLocaleDateString() : 'none';
        const newDate = parsedData.new_deadline ? new Date(parsedData.new_deadline).toLocaleDateString() : 'none';
        return `Changed deadline from ${oldDate} to ${newDate}`;
      
      case 'COMMENTED':
        return `Added a comment: "${parsedData.comment_text || ''}"...`;
      
      case 'LABEL_ADDED':
        return `Added label "${parsedData.label_name}"`;
      
      case 'LABEL_REMOVED':
        return `Removed label "${parsedData.label_name}"`;
      
      case 'ATTACHMENT_ADDED':
        return `Added attachment "${parsedData.file_name}"`;
      
      case 'ATTACHMENT_REMOVED':
        return `Removed attachment "${parsedData.file_name}"`;
      
      case 'DELETED':
        return `Deleted this task`;
      
      default:
        return action.replace(/_/g, ' ').toLowerCase();
    }
  };

  // Get color based on action type - adjust colors based on theme
  const getActionColor = (action) => {
    // Standard colors with enhanced vibrancy
    let colors = {
      creation: '#2CBE77', // vibrant green
      deletion: '#FF5252', // bright red
      status: '#448AFF',   // bright blue
      update: '#9C27B0',   // purple
      priority: '#FF9800'  // orange
    };
    
    // High contrast colors for dark mode
    if (theme === 'highContrastDark') {
      colors = {
        creation: '#00ff7f', // bright spring green
        deletion: '#ff3333', // bright red
        status: '#40c4ff',   // bright blue
        update: '#ea80fc',   // bright purple
        priority: '#ffab40'  // bright orange
      };
    }
    
    switch(action) {
      case 'CREATED':
        return colors.creation;
      case 'ASSIGNED':
        return colors.status;
      case 'LABEL_ADDED':
        return '#26A69A'; // teal
      case 'ATTACHMENT_ADDED':
        return '#7986CB'; // indigo
      case 'DELETED':
        return colors.deletion;
      case 'UNASSIGNED':
        return '#E57373'; // light red
      case 'LABEL_REMOVED':
        return '#EF5350'; // red
      case 'ATTACHMENT_REMOVED':
        return '#FF7043'; // deep orange
      case 'STATUS_CHANGED':
        return colors.status;
      case 'COMMENTED':
        return '#42A5F5'; // light blue
      case 'PRIORITY_CHANGED':
        return colors.priority;
      case 'DEADLINE_CHANGED':
        return '#FFA726'; // amber
      case 'UPDATED':
        return colors.update;
      default:
        return theme === 'highContrastDark' ? '#ffffff' : '#757575';
    }
  };

  // Generate pseudo-timeline element with CSS
  const TimelineConnector = () => (
    <div style={{
      position: 'absolute',
      left: '18px',
      top: 0,
      bottom: 0,
      width: '2px',
      backgroundColor: theme === 'light' ? '#dee2e6' : theme === 'dark' ? '#495057' : '#666666',
      zIndex: 0
    }} />
  );

  // Controls for date/time format toggle
  const DateTimeToggle = () => (
    <div style={{
      display: 'flex',
      justifyContent: 'flex-end',
      marginBottom: '15px',
      alignItems: 'center'
    }}>
      <button onClick={toggleDateTimeFormat} style={{
        display: 'flex',
        alignItems: 'center',
        padding: '6px 12px',
        backgroundColor: theme === 'light' ? '#f1f3f5' : theme === 'dark' ? '#343a40' : '#333333',
        color: theme === 'light' ? '#495057' : '#e9ecef',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        fontSize: '0.875rem',
        transition: 'background-color 0.2s',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
      }}>
        <Clock size={14} style={{ marginRight: '6px' }} />
        {dateTimeFormat === 'absolute' ? 'Show Relative Time' : 'Show Exact Date & Time'}
      </button>
    </div>
  );

  // Filter and sort activities
  const sortedActivities = [...activities].sort((a, b) => {
    const dateA = new Date(a.createdAt);
    const dateB = new Date(b.createdAt);
    return dateB - dateA; // Most recent first
  });

  return (
    <div style={getContainerStyle()}>
      <DateTimeToggle />
      <div style={timelineStyle}>
        <TimelineConnector />
        
        {sortedActivities.length > 0 ? (
          sortedActivities.map(activity => {
            const actionColor = getActionColor(activity.action);
            const actionMessage = formatActionMessage(activity);
            
            return (
              <div key={activity.id} style={{
                display: 'flex',
                position: 'relative',
                paddingLeft: '24px',
                marginLeft: '12px',
                animation: 'fadeIn 0.4s ease-in-out'
              }}>
                <div style={{
                  position: 'absolute',
                  left: 0,
                  top: '18px',
                  zIndex: 2,
                  borderRadius: '50%',
                  width: '36px',
                  height: '36px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
                  color: 'white',
                  backgroundColor: actionColor,
                  transition: 'transform 0.2s ease, box-shadow 0.2s ease'
                }}>
                  {getActionIcon(activity.action, '#fff')}
                </div>
                
                <div style={{
                  backgroundColor: theme === 'light' ? '#ffffff' : theme === 'dark' ? '#343a40' : '#1a1a1a',
                  borderRadius: '12px',
                  padding: '14px 18px',
                  flexGrow: 1,
                  boxShadow: '0 2px 10px rgba(0, 0, 0, 0.05)',
                  position: 'relative',
                  border: `1px solid ${theme === 'light' ? '#e9ecef' : theme === 'dark' ? '#495057' : '#666666'}`,
                  transition: 'all 0.2s ease',
                  marginLeft: '20px',
                  maxWidth: 'calc(100% - 60px)'
                }}>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginBottom: '8px',
                    alignItems: 'center',
                    flexWrap: 'wrap'
                  }}>
                    <span style={{
                      fontWeight: 700,
                      color: theme === 'light' ? '#212529' : '#f8f9fa',
                      fontSize: '1rem',
                      marginRight: '10px'
                    }}>
                      {activity.userName}
                    </span>
                    <span style={{
                      fontSize: '0.85rem',
                      color: theme === 'light' ? '#6c757d' : theme === 'dark' ? '#adb5bd' : '#cccccc',
                      fontWeight: 500
                    }}>
                      {dateTimeFormat === 'absolute' 
                        ? formatDateTime(activity.createdAt)
                        : formatTimeAgo(activity.createdAt)}
                    </span>
                  </div>
                  <div style={{
                    color: theme === 'light' ? '#495057' : theme === 'dark' ? '#dee2e6' : '#f0f0f0',
                    lineHeight: 1.5,
                    fontSize: '0.95rem',
                    wordBreak: 'break-word'
                  }}>
                    {actionMessage}
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div style={{
            padding: '2rem',
            textAlign: 'center',
            borderRadius: '12px',
            marginTop: '1.5rem',
            fontWeight: 500,
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: theme === 'light' ? '#e9ecef' : theme === 'dark' ? '#343a40' : '#1a1a1a',
            color: theme === 'light' ? '#6c757d' : theme === 'dark' ? '#adb5bd' : '#ffffff',
            fontStyle: 'italic'
          }}>
            <Info size={18} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
            No activity recorded for this task yet.
          </div>
        )}
      </div>
      
      {/* Keyframe animations */}
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default ActivityTab;