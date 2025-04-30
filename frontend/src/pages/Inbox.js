import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Component imports
import Header from '../components/header';
import Layout from '../components/ui-essentials/Layout';
import { useDarkMode } from '../contexts/DarkModeContext';
import EmptyState from '../components/dashboard/EmptyState';

import styles from '../css/inbox.module.css';

const InboxContent = () => {
  const { darkMode, toggleDarkMode } = useDarkMode();

  const [messages, setMessages] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState('Alex');
  const [isMobile, setIsMobile] = useState(false);
  const [isContentVisible, setIsContentVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('messages');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showComposeModal, setShowComposeModal] = useState(false);

  const messageListRef = useRef(null);
  const messageDetailRef = useRef(null);

  useEffect(() => {
    if (messageListRef.current && !loading) {
      messageListRef.current.classList.add(styles.fadeIn);
    }
  }, [loading]);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);

      if (window.innerWidth <= 768) {
        const event = new CustomEvent('sidebarToggled', { detail: { expanded: false } });
        window.dispatchEvent(event);
        localStorage.setItem('sidebarExpanded', 'false');
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize();

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const fetchData = () => {
      setTimeout(() => {
        setMessages([
          {
            id: 1,
            sender: 'Jane Doe',
            senderInitials: 'JD',
            senderAvatar: '#3F51B5',
            subject: 'Website Redesign Updates',
            preview: "I've uploaded the new mockups for the homepage redesign. Can you please review them and provide feedback by tomorrow?",
            body: "Hi Alex,\n\nI've uploaded the new mockups for the homepage redesign to our shared project folder. The main updates include:\n\n1. Redesigned hero section with animated transitions\n2. New feature showcase with interactive elements\n3. Testimonial carousel with improved mobile responsiveness\n4. Updated footer with expanded sitemap\n\nCan you please review them and provide feedback by tomorrow? We need to finalize these designs by the end of the week to stay on schedule.\n\nLet me know if you need anything else from me.\n\nThanks,\nJane",
            timestamp: '2025-04-28T10:30:00',
            isRead: false,
            isStarred: true,
            isArchived: false,
            folder: 'inbox',
            project: 'Website Redesign',
            attachments: [
              { name: 'homepage_mockup_v2.png', size: '4.2 MB' },
              { name: 'design_notes.pdf', size: '420 KB' }
            ]
          },
          {
            id: 2,
            sender: 'Mike Chen',
            senderInitials: 'MC',
            senderAvatar: '#00BCD4',
            subject: 'API Integration Questions',
            preview: 'I have a few questions about the API integration for the mobile app. When would be a good time to discuss?',
            body: "Hey Alex,\n\nI'm working on the API integration for our mobile app and have run into a few questions:\n\n1. What authentication method should we use for the API calls?\n2. Do we have rate limiting configured, and if so, what are the limits?\n3. Is there a staging environment where we can test the integration before going live?\n\nWhen would be a good time to discuss these? I'm available most of this week except for Wednesday afternoon.\n\nThanks,\nMike",
            timestamp: '2025-04-27T16:45:00',
            isRead: true,
            isStarred: false,
            isArchived: false,
            folder: 'inbox',
            project: 'Mobile App Development',
            attachments: []
          },
          {
            id: 3,
            sender: 'Sarah Lin',
            senderInitials: 'SL',
            senderAvatar: '#FF5722',
            subject: 'Marketing Campaign Timeline',
            preview: 'Here\'s the updated timeline for our Q2 marketing campaign. Please review the key dates and deliverables.',
            body: "Hi Alex,\n\nI've attached the updated timeline for our Q2 marketing campaign. The key dates and deliverables are as follows:\n\n- May 10: Finalize campaign messaging and creative direction\n- May 15: Complete all design assets and copy\n- May 20: Set up tracking and analytics\n- May 25: Launch social media teasers\n- June 1: Full campaign launch\n\nPlease review and let me know if these dates work with your schedule. I've also included the budget breakdown in the attached spreadsheet.\n\nBest,\nSarah",
            timestamp: '2025-04-26T09:15:00',
            isRead: true,
            isStarred: true,
            isArchived: false,
            folder: 'inbox',
            project: 'Marketing Campaign',
            attachments: [
              { name: 'q2_campaign_timeline.xlsx', size: '1.8 MB' },
              { name: 'campaign_budget.pdf', size: '320 KB' }
            ]
          }
        ]);

        setNotifications([
          {
            id: 1,
            type: 'task',
            icon: '📋',
            title: 'Task Assigned',
            message: 'Jane Doe assigned you to "Finalize wireframes"',
            timestamp: '2025-04-28T11:30:00',
            isRead: false,
            project: 'Website Redesign',
            actionUrl: '/tasks/123'
          },
          {
            id: 2,
            type: 'mention',
            icon: '@',
            title: 'Mentioned in Comment',
            message: 'Mike Chen mentioned you in a comment on "API Integration"',
            timestamp: '2025-04-28T09:15:00',
            isRead: false,
            project: 'Mobile App Development',
            actionUrl: '/projects/456/tasks/789'
          },
          {
            id: 3,
            type: 'deadline',
            icon: '⏰',
            title: 'Upcoming Deadline',
            message: 'Task "Content strategy meeting" is due tomorrow',
            timestamp: '2025-04-27T15:45:00',
            isRead: true,
            project: 'Marketing Campaign',
            actionUrl: '/tasks/321'
          }
        ]);

        setLoading(false);
        setIsContentVisible(true);
        setRefreshing(false);
      }, 1000);
    };

    fetchData();
  }, [refreshing]);

  const toggleSidebar = () => {
    const currentState = localStorage.getItem('sidebarExpanded') !== 'false';
    const newState = !currentState;
    localStorage.setItem('sidebarExpanded', newState.toString());

    const event = new CustomEvent('sidebarToggled', { detail: { expanded: newState } });
    window.dispatchEvent(event);
  };

  const refreshInbox = () => {
    setRefreshing(true);
    setLoading(true);
    setIsContentVisible(false);
  };

  const handleMessageSelect = (messageId) => {
    const message = messages.find(m => m.id === messageId);

    if (message && !message.isRead) {
      const updatedMessages = messages.map(m =>
        m.id === messageId ? { ...m, isRead: true } : m
      );
      setMessages(updatedMessages);
    }

    setSelectedMessage(message);

    if (isMobile && messageDetailRef.current) {
      messageDetailRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleNotificationClick = (notificationId) => {
    const updatedNotifications = notifications.map(n =>
      n.id === notificationId ? { ...n, isRead: true } : n
    );
    setNotifications(updatedNotifications);

    console.log(`Navigate to notification ${notificationId}`);
  };

  const formatMessageDate = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return date.toLocaleDateString([], { weekday: 'short' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  const toggleMessageStar = (messageId, e) => {
    e.stopPropagation();
    const updatedMessages = messages.map(message =>
      message.id === messageId
        ? { ...message, isStarred: !message.isStarred }
        : message
    );
    setMessages(updatedMessages);
  };

  const archiveMessage = (messageId, e) => {
    e.stopPropagation();
    const updatedMessages = messages.map(message =>
      message.id === messageId
        ? { ...message, isArchived: true, folder: 'archive' }
        : message
    );
    setMessages(updatedMessages);

    if (selectedMessage && selectedMessage.id === messageId) {
      setSelectedMessage(null);
    }
  };

  const handleReply = () => {
    alert('Reply functionality would be implemented here');
  };

  const handleForward = () => {
    alert('Forward functionality would be implemented here');
  };

  const handleCompose = () => {
    setShowComposeModal(true);
  };

  const handleCloseComposeModal = () => {
    setShowComposeModal(false);
  };

  const isSidebarExpanded = localStorage.getItem('sidebarExpanded') !== 'false';

  // Get filtered items based on current selections
  const getFilteredItems = () => {
    if (activeTab === 'messages') {
      return messages.filter(message => {
        // Basic filter criteria
        const folderMatch = selectedFilter === 'all' 
          || (selectedFilter === 'starred' && message.isStarred)
          || (selectedFilter === 'archived' && message.isArchived)
          || (selectedFilter === 'unread' && !message.isRead)
          || message.project === selectedFilter;
        
        // Search query filter
        const searchMatch = searchQuery === '' 
          || message.subject.toLowerCase().includes(searchQuery.toLowerCase())
          || message.sender.toLowerCase().includes(searchQuery.toLowerCase())
          || message.preview.toLowerCase().includes(searchQuery.toLowerCase());
        
        return folderMatch && searchMatch;
      });
    } else {
      return notifications.filter(notification => {
        // Basic filter criteria for notifications
        const filterMatch = selectedFilter === 'all' 
          || (selectedFilter === 'unread' && !notification.isRead)
          || notification.project === selectedFilter;
        
        // Search query filter
        const searchMatch = searchQuery === '' 
          || notification.title.toLowerCase().includes(searchQuery.toLowerCase())
          || notification.message.toLowerCase().includes(searchQuery.toLowerCase());
        
        return filterMatch && searchMatch;
      });
    }
  };

  const filteredItems = getFilteredItems();

  // Get unique projects for the filter sidebar
  const getUniqueProjects = () => {
    const projectsFromMessages = messages.map(m => m.project);
    const projectsFromNotifications = notifications.map(n => n.project).filter(p => p !== null);
    
    return [...new Set([...projectsFromMessages, ...projectsFromNotifications])];
  };

  return (
    <div className={`${styles.inboxContainer} ${darkMode ? styles.darkMode : styles.lightMode}`}>
      {/* Header */}
      <Header 
        greeting={"Inbox"} 
        toggleSidebar={toggleSidebar}
      />

      {/* Inbox Layout */}
      {loading ? (
        <div className={styles.loading}>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            Loading inbox...
          </motion.div>
        </div>
      ) : (
        <AnimatePresence>
          {isContentVisible && (
            <motion.div 
              className={styles.inboxLayout}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              {/* Inbox Toolbar */}
              <div className={`${styles.inboxToolbar} ${darkMode ? styles.darkItem : ''}`}>
                <div className={styles.tabsContainer}>
                  <button 
                    className={`${styles.tabButton} ${activeTab === 'messages' ? styles.activeTab : ''}`}
                    onClick={() => setActiveTab('messages')}
                  >
                    Messages
                    {messages.filter(m => !m.isRead).length > 0 && (
                      <span className={styles.unreadBadge}>
                        {messages.filter(m => !m.isRead).length}
                      </span>
                    )}
                  </button>
                  <button 
                    className={`${styles.tabButton} ${activeTab === 'notifications' ? styles.activeTab : ''}`}
                    onClick={() => setActiveTab('notifications')}
                  >
                    Notifications
                    {notifications.filter(n => !n.isRead).length > 0 && (
                      <span className={styles.unreadBadge}>
                        {notifications.filter(n => !n.isRead).length}
                      </span>
                    )}
                  </button>
                </div>
                
                <div className={styles.toolbarActions}>
                  <div className={styles.searchContainer}>
                    <input
                      type="text"
                      placeholder="Search inbox..."
                      className={styles.searchInput}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <button className={styles.searchButton}>🔍</button>
                  </div>
                  
                  <button 
                    className={styles.composeButton}
                    onClick={handleCompose}
                  >
                    {isMobile ? '✏️' : 'Compose'}
                  </button>
                </div>
              </div>
              
              {/* Main Content */}
              <div className={styles.inboxContent}>
                {/* Left Sidebar - Filters */}
                <div className={`${styles.inboxSidebar} ${darkMode ? styles.darkItem : ''}`}>
                  <div className={styles.filterSection}>
                    <h3>Filters</h3>
                    <ul className={styles.filterList}>
                      <li 
                        className={`${styles.filterItem} ${selectedFilter === 'all' ? styles.activeFilter : ''}`}
                        onClick={() => setSelectedFilter('all')}
                      >
                        <span className={styles.filterIcon}>📥</span>
                        <span className={styles.filterName}>All</span>
                      </li>
                      
                      {activeTab === 'messages' && (
                        <>
                          <li 
                            className={`${styles.filterItem} ${selectedFilter === 'unread' ? styles.activeFilter : ''}`}
                            onClick={() => setSelectedFilter('unread')}
                          >
                            <span className={styles.filterIcon}>📩</span>
                            <span className={styles.filterName}>Unread</span>
                            {messages.filter(m => !m.isRead).length > 0 && (
                              <span className={styles.filterCount}>
                                {messages.filter(m => !m.isRead).length}
                              </span>
                            )}
                          </li>
                          <li 
                            className={`${styles.filterItem} ${selectedFilter === 'starred' ? styles.activeFilter : ''}`}
                            onClick={() => setSelectedFilter('starred')}
                          >
                            <span className={styles.filterIcon}>⭐</span>
                            <span className={styles.filterName}>Starred</span>
                            {messages.filter(m => m.isStarred).length > 0 && (
                              <span className={styles.filterCount}>
                                {messages.filter(m => m.isStarred).length}
                              </span>
                            )}
                          </li>
                          <li 
                            className={`${styles.filterItem} ${selectedFilter === 'archived' ? styles.activeFilter : ''}`}
                            onClick={() => setSelectedFilter('archived')}
                          >
                            <span className={styles.filterIcon}>🗃️</span>
                            <span className={styles.filterName}>Archived</span>
                          </li>
                        </>
                      )}
                      
                      {activeTab === 'notifications' && (
                        <li 
                          className={`${styles.filterItem} ${selectedFilter === 'unread' ? styles.activeFilter : ''}`}
                          onClick={() => setSelectedFilter('unread')}
                        >
                          <span className={styles.filterIcon}>🔔</span>
                          <span className={styles.filterName}>Unread</span>
                          {notifications.filter(n => !n.isRead).length > 0 && (
                            <span className={styles.filterCount}>
                              {notifications.filter(n => !n.isRead).length}
                            </span>
                          )}
                        </li>
                      )}
                    </ul>
                  </div>
                  
                  {/* Projects filter section */}
                  <div className={styles.filterSection}>
                    <h3>Projects</h3>
                    <ul className={styles.filterList}>
                      {getUniqueProjects().map(project => (
                        <li 
                          key={project}
                          className={`${styles.filterItem} ${selectedFilter === project ? styles.activeFilter : ''}`}
                          onClick={() => setSelectedFilter(project)}
                        >
                          <span className={styles.filterIcon}>📁</span>
                          <span className={styles.filterName}>{project}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
                
                {/* Middle - Message/Notification List */}
                <div 
                  ref={messageListRef} 
                  className={`${styles.inboxList} ${darkMode ? styles.darkItem : ''}`}
                >
                  {filteredItems.length > 0 ? (
                    <div className={styles.itemsList}>
                      {activeTab === 'messages' ? (
                        // Messages list
                        filteredItems.map(message => (
                          <div 
                            key={message.id}
                            className={`${styles.messageItem} ${message.isRead ? '' : styles.unreadMessage} ${selectedMessage?.id === message.id ? styles.selectedMessage : ''}`}
                            onClick={() => handleMessageSelect(message.id)}
                          >
                            <div className={styles.messageRow}>
                              <div 
                                className={styles.senderAvatar}
                                style={{ backgroundColor: message.senderAvatar }}
                              >
                                {message.senderInitials}
                              </div>
                              
                              <div className={styles.messageContent}>
                                <div className={styles.messageMeta}>
                                  <span className={styles.messageSender}>{message.sender}</span>
                                  <span className={styles.messageDate}>{formatMessageDate(message.timestamp)}</span>
                                </div>
                                
                                <div className={styles.messageSubject}>
                                  {message.subject}
                                  {message.attachments && message.attachments.length > 0 && (
                                    <span className={styles.attachmentIndicator}>📎</span>
                                  )}
                                </div>
                                
                                <div className={styles.messagePreview}>
                                  {message.preview}
                                </div>
                              </div>
                            </div>
                            
                            <div className={styles.messageActions}>
                              <button 
                                className={`${styles.starButton} ${message.isStarred ? styles.starred : ''}`}
                                onClick={(e) => toggleMessageStar(message.id, e)}
                              >
                                {message.isStarred ? '★' : '☆'}
                              </button>
                              <button 
                                className={styles.archiveButton}
                                onClick={(e) => archiveMessage(message.id, e)}
                              >
                                🗃️
                              </button>
                            </div>
                          </div>
                        ))
                      ) : (
                        // Notifications list
                        filteredItems.map(notification => (
                          <div 
                            key={notification.id}
                            className={`${styles.notificationItem} ${notification.isRead ? '' : styles.unreadNotification}`}
                            onClick={() => handleNotificationClick(notification.id)}
                          >
                            <div className={styles.notificationIcon}>
                              {notification.icon}
                            </div>
                            
                            <div className={styles.notificationContent}>
                              <div className={styles.notificationMeta}>
                                <span className={styles.notificationType}>{notification.title}</span>
                                <span className={styles.notificationDate}>{formatMessageDate(notification.timestamp)}</span>
                              </div>
                              
                              <div className={styles.notificationMessage}>
                                {notification.message}
                              </div>
                              
                              {notification.project && (
                                <div className={styles.notificationProject}>
                                  Project: {notification.project}
                                </div>
                              )}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  ) : (
                    <EmptyState 
                      type={activeTab}
                      message={`No ${activeTab} found`}
                      actionLabel={activeTab === 'messages' ? 'Compose a message' : 'Check all notifications'}
                      darkMode={darkMode}
                      onAction={activeTab === 'messages' ? handleCompose : () => setSelectedFilter('all')}
                    />
                  )}
                </div>
                
                {/* Right - Message Detail */}
                <div 
                  ref={messageDetailRef}
                  className={`${styles.messageDetail} ${darkMode ? styles.darkItem : ''} ${!selectedMessage && !isMobile ? styles.emptyState : ''} ${!selectedMessage && isMobile ? styles.hidden : ''}`}
                >
                  {selectedMessage ? (
                    <div className={styles.messageDetailContent}>
                      <div className={styles.messageDetailHeader}>
                        <div className={styles.messageDetailSubject}>
                          {selectedMessage.subject}
                        </div>
                        
                        <div className={styles.messageDetailMeta}>
                          <div className={styles.senderInfo}>
                            <div 
                              className={styles.detailSenderAvatar}
                              style={{ backgroundColor: selectedMessage.senderAvatar }}
                            >
                              {selectedMessage.senderInitials}
                            </div>
                            
                            <div className={styles.senderDetails}>
                              <div className={styles.detailSenderName}>{selectedMessage.sender}</div>
                              <div className={styles.detailDate}>
                                {new Date(selectedMessage.timestamp).toLocaleString([], {
                                  month: 'short',
                                  day: 'numeric',
                                  year: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </div>
                            </div>
                          </div>
                          
                          <div className={styles.messageDetailActions}>
                            <button 
                              className={`${styles.detailActionButton} ${selectedMessage.isStarred ? styles.starred : ''}`}
                              onClick={() => toggleMessageStar(selectedMessage.id, { stopPropagation: () => {} })}
                            >
                              {selectedMessage.isStarred ? '★' : '☆'}
                            </button>
                            <button 
                              className={styles.detailActionButton}
                              onClick={handleReply}
                            >
                              ↩️ Reply
                            </button>
                            <button 
                              className={styles.detailActionButton}
                              onClick={handleForward}
                            >
                              ↪️ Forward
                            </button>
                            <button 
                              className={styles.detailActionButton}
                              onClick={(e) => archiveMessage(selectedMessage.id, e)}
                            >
                              🗃️ Archive
                            </button>
                          </div>
                        </div>
                        
                        {isMobile && (
                          <button 
                            className={styles.backButton}
                            onClick={() => setSelectedMessage(null)}
                          >
                            ← Back to list
                          </button>
                        )}
                      </div>
                      
                      <div className={styles.messageBody}>
                        {selectedMessage.body.split('\n\n').map((paragraph, index) => (
                          <p key={index}>
                            {paragraph.split('\n').map((line, lineIndex) => (
                              <React.Fragment key={lineIndex}>
                                {line}
                                {lineIndex < paragraph.split('\n').length - 1 && <br />}
                              </React.Fragment>
                            ))}
                          </p>
                        ))}
                      </div>
                      
                      {selectedMessage.attachments && selectedMessage.attachments.length > 0 && (
                        <div className={styles.attachmentsSection}>
                          <h3>Attachments ({selectedMessage.attachments.length})</h3>
                          <div className={styles.attachmentsList}>
                            {selectedMessage.attachments.map((attachment, index) => (
                              <div key={index} className={styles.attachmentItem}>
                                <div className={styles.attachmentIcon}>
                                  {attachment.name.endsWith('.pdf') ? '📄' : 
                                   attachment.name.endsWith('.xlsx') || attachment.name.endsWith('.csv') ? '📊' :
                                   attachment.name.endsWith('.png') || attachment.name.endsWith('.jpg') ? '🖼️' : 
                                   '📁'}
                                </div>
                                <div className={styles.attachmentInfo}>
                                  <div className={styles.attachmentName}>{attachment.name}</div>
                                  <div className={styles.attachmentSize}>{attachment.size}</div>
                                </div>
                                <button className={styles.downloadButton}>⬇️</button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      <div className={styles.replySection}>
                        <textarea 
                          className={styles.replyInput}
                          placeholder="Write a reply..."
                        />
                        <div className={styles.replyActions}>
                          <button className={styles.attachButton}>📎</button>
                          <button className={styles.sendButton}>Send</button>
                        </div>
                      </div>
                    </div>
                  ) : !isMobile ? (
                    <div className={styles.noMessageSelected}>
                      <div className={styles.emptyStateIcon}>📩</div>
                      <h3>No message selected</h3>
                      <p>Select a message from the list to view it here.</p>
                    </div>
                  ) : null}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      )}
      
      {/* Compose Modal */}
      {showComposeModal && (
        <div className={styles.modalOverlay}>
          <div className={`${styles.modalContent} ${darkMode ? styles.darkModal : ''}`}>
            <div className={styles.modalHeader}>
              <h2>New Message</h2>
              <button 
                className={styles.closeModalButton}
                onClick={handleCloseComposeModal}
              >
                ×
              </button>
            </div>
            
            <div className={styles.composeForm}>
              <div className={styles.composeField}>
                <label htmlFor="recipientInput">To:</label>
                <input 
                  id="recipientInput"
                  type="text" 
                  className={styles.composeInput}
                  placeholder="Enter recipients"
                />
              </div>
              
              <div className={styles.composeField}>
                <label htmlFor="subjectInput">Subject:</label>
                <input 
                  id="subjectInput"
                  type="text" 
                  className={styles.composeInput}
                  placeholder="Enter subject"
                />
              </div>
              
              <div className={styles.composeField}>
                <label htmlFor="messageInput">Message:</label>
                <textarea 
                  id="messageInput"
                  className={styles.composeTextarea}
                  placeholder="Write your message here..."
                  rows={8}
                />
              </div>
              
              <div className={styles.composeActions}>
                <div className={styles.composeAttachments}>
                  <button className={styles.attachButton}>
                    📎 Attach File
                  </button>
                </div>
                
                <div className={styles.composeSendActions}>
                  <button className={styles.discardButton} onClick={handleCloseComposeModal}>
                    Discard
                  </button>
                  <button className={styles.sendButton}>
                    Send
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Wrapper component that provides the DarkModeContext
const Inbox = () => {
  return (
    <Layout>
      <InboxContent />
    </Layout>
  );
};

export default Inbox;