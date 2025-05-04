import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Component imports
import Header from '../components/header';
import Layout from '../components/ui-essentials/Layout';
import { useDarkMode } from '../contexts/DarkModeContext';
import Messages from '../components/inbox/messages';
import Notifications from '../components/inbox/notifications';
import styles from '../css/inbox.module.css';
import { AlertCircle, Bell, CheckCircle, FileText, MessageSquare, Users, Loader, RefreshCw } from 'lucide-react';

const InboxContent = () => {
 const { darkMode, toggleDarkMode } = useDarkMode();

 const [messages, setMessages] = useState([]);
 const [notifications, setNotifications] = useState([]);
 const [selectedMessage, setSelectedMessage] = useState(null);
 const [loading, setLoading] = useState(true);
 const [notificationsLoading, setNotificationsLoading] = useState(true);
 const [notificationsError, setNotificationsError] = useState(null);
 const [userName, setUserName] = useState(localStorage.getItem("UserFName"));
 const [isMobile, setIsMobile] = useState(false);
 const [isContentVisible, setIsContentVisible] = useState(false);
 const [refreshing, setRefreshing] = useState(false);
 const [activeTab, setActiveTab] = useState('messages');
 const [selectedFilter, setSelectedFilter] = useState('all');
 const [searchQuery, setSearchQuery] = useState('');
 const [showComposeModal, setShowComposeModal] = useState(false);
 const [userProjects, setUserProjects] = useState([]);
 const [invitePopup, setInvitePopup] = useState(null);

 const messageListRef = useRef(null);
 const messageDetailRef = useRef(null);

 // Get the logged in user ID from localStorage
 const loggedInUserId = localStorage.getItem('loggedInUserID');

 // Function to get icon based on notification type
 const getNotificationIcon = (type) => {
   switch (type) {
     case 'TASK_ASSIGNED':
       return <FileText size={20} />;
     case 'MESSAGE':
       return <MessageSquare size={20} />;
     case 'MENTION':
       return <Users size={20} />;
     case 'ALERT':
       return <AlertCircle size={20} />;
     case 'COMPLETED':
       return <CheckCircle size={20} />;
     case 'INVITE':
       return <Users size={20} />;
     default:
       return <Bell size={20} />;
   }
 };

 // Load projects from localStorage
 useEffect(() => {
   try {
     const projectsData = localStorage.getItem('userProjects');
     if (projectsData) {
       const parsedProjects = JSON.parse(projectsData);
       // Extract project names and IDs from the projects object
       const projectsList = Object.values(parsedProjects).map(project => ({
         id: project.id || project.name,
         name: project.name
       }));
       setUserProjects(projectsList);
     }
   } catch (error) {
     console.error('Error loading projects from localStorage:', error);
   }
 }, []);

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

 // Fetch notifications from API
 const fetchNotifications = async () => {
   if (!loggedInUserId) {
     setNotificationsError('No user ID found. Please log in again.');
     setNotificationsLoading(false);
     return;
   }

   try {
     const response = await fetch(`http://localhost:8080/api/notifications?userId=${loggedInUserId}`);
     
     if (!response.ok) {
       throw new Error('Failed to fetch notifications');
     }
     
     const data = await response.json();
     console.log("API response:", data);
     
     // Check for the new response structure
     const notificationsData = data.notifications || data;
     
     // Transform the data to match our component's expected format
     const formattedNotifications = notificationsData.map(notification => ({
       id: notification.id,
       title: notification.type,
       message: notification.message,
       timestamp: new Date(notification.createdAt),
       isRead: notification.isRead,
       projectId: notification.projectId,
       icon: getNotificationIcon(notification.type),
       invite_id: notification.inviteId, // Adding invite_id field
       type: notification.type // Add the type field to identify INVITE notifications
     }));
     
     setNotifications(formattedNotifications);
     setNotificationsLoading(false);
   } catch (err) {
     console.error('Error fetching notifications:', err);
     setNotificationsError('Failed to load notifications. Please try again later.');
     setNotificationsLoading(false);
   }
 };

 useEffect(() => {
   const fetchData = () => {
     setTimeout(() => {
       setMessages([
         {
           id: 1,
           sender: 'Fatima Malik',
           senderInitials: 'FM',
           senderAvatar: '#3F51B5',
           subject: 'Website Redesign Updates',
           preview: "I've uploaded the new mockups for the homepage redesign. Can you please review them and provide feedback by tomorrow?",
           body: "Hi " + userName +",\n\nI've uploaded the new mockups for the homepage redesign to our shared project folder. The main updates include:\n\n1. Redesigned hero section with animated transitions\n2. New feature showcase with interactive elements\n3. Testimonial carousel with improved mobile responsiveness\n4. Updated footer with expanded sitemap\n\nCan you please review them and provide feedback by tomorrow? We need to finalize these designs by the end of the week to stay on schedule.\n\nLet me know if you need anything else from me.\n\nThanks,\nFatima",
           timestamp: '2025-04-28T10:30:00',
           isRead: false,
           isStarred: true,
           isArchived: false,
           folder: 'inbox',
           attachments: [
             { name: 'homepage_mockup_v2.png', size: '4.2 MB' },
             { name: 'design_notes.pdf', size: '420 KB' }
           ]
         },
         {
           id: 2,
           sender: 'Ahmed Khan',
           senderInitials: 'AK',
           senderAvatar: '#00BCD4',
           subject: 'API Integration Questions',
           preview: 'I have a few questions about the API integration for the mobile app. When would be a good time to discuss?',
           body: "Hey " + userName +",\n\nI'm working on the API integration for our mobile app and have run into a few questions:\n\n1. What authentication method should we use for the API calls?\n2. Do we have rate limiting configured, and if so, what are the limits?\n3. Is there a staging environment where we can test the integration before going live?\n\nWhen would be a good time to discuss these? I'm available most of this week except for Wednesday afternoon.\n\nThanks,\nAhmed",
           timestamp: '2025-04-27T16:45:00',
           isRead: true,
           isStarred: false,
           isArchived: false,
           folder: 'inbox',
           attachments: []
         },
         {
           id: 3,
           sender: 'Ayesha Rahman',
           senderInitials: 'AR',
           senderAvatar: '#FF5722',
           subject: 'Marketing Campaign Timeline',
           preview: 'Here\'s the updated timeline for our Q2 marketing campaign. Please review the key dates and deliverables.',
           body: "Hi " + userName +",\n\nI've attached the updated timeline for our Q2 marketing campaign. The key dates and deliverables are as follows:\n\n- May 10: Finalize campaign messaging and creative direction\n- May 15: Complete all design assets and copy\n- May 20: Set up tracking and analytics\n- May 25: Launch social media teasers\n- June 1: Full campaign launch\n\nPlease review and let me know if these dates work with your schedule. I've also included the budget breakdown in the attached spreadsheet.\n\nBest,\nAyesha",
           timestamp: '2025-04-26T09:15:00',
           isRead: true,
           isStarred: true,
           isArchived: false,
           folder: 'inbox',
           attachments: [
             { name: 'q2_campaign_timeline.xlsx', size: '1.8 MB' },
             { name: 'campaign_budget.pdf', size: '320 KB' }
           ]
         }
       ]);

       setLoading(false);
       setIsContentVisible(true);
       setRefreshing(false);
       
       // Fetch notifications
       fetchNotifications();
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
   setNotificationsLoading(true);
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

 // Mark notification as read
 const handleNotificationClick = async (notification) => {
   if (notification.invite_id || notification.type === 'INVITE') {
     setInvitePopup({
       id: notification.id,
       invite_id: notification.invite_id,
       project: notification.projectId,
       message: notification.message
     });
     return;
   }

   try {
     const response = await fetch(
       `http://localhost:8080/api/notifications/${notification.id}/read?userId=${loggedInUserId}`, 
       {
         method: 'PATCH',
         headers: {
           'Content-Type': 'application/json'
         }
       }
     );
     
     if (!response.ok) {
       throw new Error('Failed to mark notification as read');
     }
     
     const data = await response.json();
     
     if (data.ok) {
       // Update the local state to mark the notification as read
       setNotifications(prevNotifications => 
         prevNotifications.map(notif => 
           notif.id === notification.id 
             ? { ...notif, isRead: true } 
             : notif
         )
       );
     } else {
       console.error('API returned error:', data.message);
     }
   } catch (err) {
     console.error('Error marking notification as read:', err);
   }
 };

 // Mark all notifications as read (except project invitations)
 const markAllAsRead = async () => {
   try {
     setNotifications(prevNotifications => 
       prevNotifications.map(notification => 
         notification.invite_id || notification.type === 'INVITE' 
           ? notification 
           : { ...notification, isRead: true }
       )
     );
     
     // Then, send batch update to API - only for non-invitation notifications
     // Get IDs of all non-invitation notifications
     const nonInviteNotificationIds = notifications
       .filter(n => !n.invite_id && n.type !== 'INVITE' && !n.isRead)
       .map(n => n.id);
     
     // Only make API call if there are non-invite notifications to update
     if (nonInviteNotificationIds.length > 0) {
       const response = await fetch(
         `http://localhost:8080/api/notifications/batch-mark-read?userId=${loggedInUserId}`,
         {
           method: 'PATCH',
           headers: {
             'Content-Type': 'application/json'
           },
           body: JSON.stringify({ notificationIds: nonInviteNotificationIds })
         }
       );
       
       if (!response.ok) {
         throw new Error('Failed to mark non-invitation notifications as read');
       }
       
       const data = await response.json();
       if (!data.ok) {
         console.error('API batch update returned error:', data.message);
       }
     }
   } catch (err) {
     console.error('Error marking non-invitation notifications as read:', err);
   }
 };

 // Handle invite response
 const handleInviteResponse = async (notification, accept) => {
   if (!invitePopup) return;

   try {
     // API call to accept or reject invitation
     const response = await fetch(
       `http://localhost:8080/api/projects/${Number(notification.project)}/members/respond?userId=${loggedInUserId}&accept=${accept}`,
       {
         method: 'POST'
       }
     );
     
     if (!response.ok) {
       throw new Error(`Failed to ${accept ? 'accept' : 'reject'} invitation`);
     }

     if(accept) {
       try {
         const API_BASE_URL = 'http://localhost:8080';
         const response = await fetch(`${API_BASE_URL}/api/projects/user/${loggedInUserId}?userId=${loggedInUserId}`);
         if (response.ok) {
           const data = await response.json();
           localStorage.setItem('userProjects', JSON.stringify(data || []));
         } else {
           console.error('Failed to fetch projects, server responded with:', response.status);
         }
       } catch (error) {
         console.error('Failed to fetch projects:', error);
       }
     }
     
     // Mark notification as read (ONLY after responding to invitation)
     const markReadResponse = await fetch(
       `http://localhost:8080/api/notifications/${notification.id}/read?userId=${loggedInUserId}`, 
       {
         method: 'PATCH',
         headers: {
           'Content-Type': 'application/json'
         }
       }
     );
     
     if (markReadResponse.ok) {
       const data = await markReadResponse.json();
       if (data.ok) {
         // Update local state
         setNotifications(prevNotifications => 
           prevNotifications.map(notif => 
             notif.id === notification.id 
               ? { ...notif, isRead: true } 
               : notif
           )
         );
       }
     }
     
     setInvitePopup(null);
     fetchNotifications();
     window.location.reload();
   } catch (err) {
     console.error(`Error ${accept ? 'accepting' : 'rejecting'} invitation:`, err);
   }
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

 // Check if the selectedFilter is a project ID
 const isProjectFilter = (filter) => {
   return userProjects.some(project => project.id === filter);
 };

 // Get filtered items based on current selections
 const getFilteredItems = () => {
   if (activeTab === 'messages') {
     return messages.filter(message => {
       // Basic filter criteria
       const folderMatch = selectedFilter === 'all' 
         || (selectedFilter === 'starred' && message.isStarred)
         || (selectedFilter === 'archived' && message.isArchived)
         || (selectedFilter === 'unread' && !message.isRead);
       
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
       let filterMatch = selectedFilter === 'all' 
         || (selectedFilter === 'unread' && !notification.isRead);
       
       // Project filter - now check if the selected filter is a project ID that matches notification's projectId
       if (isProjectFilter(selectedFilter)) {
         filterMatch = notification.projectId === selectedFilter;
       }
       
       // Search query filter
       const searchMatch = searchQuery === '' 
         || notification.title.toLowerCase().includes(searchQuery.toLowerCase())
         || notification.message.toLowerCase().includes(searchQuery.toLowerCase());
       
       return filterMatch && searchMatch;
     });
   }
 };

 const filteredItems = getFilteredItems();

 // Helper function to find project name by id
 const getProjectNameById = (projectId) => {
   const project = userProjects.find(p => p.id === projectId);
   return project ? project.name : projectId;
 };

 // Count unread notifications
 const unreadNotificationsCount = notifications.filter(notification => !notification.isRead).length;

 return (
   <div className={`${styles.inboxContainer} ${darkMode ? styles.darkMode : styles.lightMode}`}>
     {/* Header with Dark Mode Toggle */}
     <Header 
       greeting={"Inbox"} 
       toggleSidebar={toggleSidebar}
       darkMode={darkMode}
       toggleDarkMode={toggleDarkMode}
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
                   {unreadNotificationsCount > 0 && (
                     <span className={styles.unreadBadge}>
                       {unreadNotificationsCount}
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
                         {unreadNotificationsCount > 0 && (
                           <span className={styles.filterCount}>
                             {unreadNotificationsCount}
                           </span>
                         )}
                       </li>
                     )}
                   </ul>
                 </div>
                 
                 {/* Projects filter section - showing userProjects using IDs for filters */}
                 {userProjects.length > 0 && (
                   <div className={styles.filterSection}>
                     <h3>Projects</h3>
                     <ul className={styles.filterList}>
                       {userProjects.map(project => (
                         <li 
                           key={project.id}
                           className={`${styles.filterItem} ${selectedFilter === project.id ? styles.activeFilter : ''}`}
                           onClick={() => setSelectedFilter(project.id)}
                         >
                           <span className={styles.filterIcon}>📁</span>
                           <span className={styles.filterName}>{project.name}</span>
                           {/* Count notifications per project */}
                           {activeTab === 'notifications' && notifications.filter(n => n.projectId === project.id).length > 0 && (
                             <span className={styles.filterCount}>
                               {notifications.filter(n => n.projectId === project.id).length}
                             </span>
                           )}
                         </li>
                       ))}
                     </ul>
                   </div>
                 )}
               </div>
               
               {/* Content based on active tab */}
               {activeTab === 'messages' ? (
                 <Messages 
                   messages={messages}
                   selectedMessage={selectedMessage}
                   darkMode={darkMode}
                   handleMessageSelect={handleMessageSelect}
                   toggleMessageStar={toggleMessageStar}
                   archiveMessage={archiveMessage}
                   handleReply={handleReply}
                   handleForward={handleForward}
                   setSelectedMessage={setSelectedMessage}
                   formatMessageDate={formatMessageDate}
                   isMobile={isMobile}
                   filteredItems={filteredItems}
                   handleCompose={handleCompose}
                   messageListRef={messageListRef}
                   messageDetailRef={messageDetailRef}
                   showComposeModal={showComposeModal}
                   handleCloseComposeModal={handleCloseComposeModal}
                 />
               ) : (
                 <Notifications 
                   darkMode={darkMode}
                   handleNotificationClick={handleNotificationClick}
                   formatMessageDate={formatMessageDate}
                   filteredItems={filteredItems}
                   setSelectedFilter={setSelectedFilter}
                   loading={notificationsLoading}
                   error={notificationsError}
                   handleRefresh={fetchNotifications}
                   markAllAsRead={markAllAsRead}
                   invitePopup={invitePopup}
                   setInvitePopup={setInvitePopup}
                   handleInviteResponse={handleInviteResponse}
                   unreadCount={unreadNotificationsCount}
                   getProjectNameById={getProjectNameById}
                 />
               )}
             </div>
           </motion.div>
         )}
       </AnimatePresence>
     )}
   </div>
 );
};

const Inbox = () => {
 return (
   <Layout>
     <InboxContent />
   </Layout>
 );
};

export default Inbox;