import React from 'react';
import EmptyState from '../dashboard/EmptyState';
import styles from '../../css/inbox/notifications.module.css';

const Notifications = ({ 
  notifications,
  darkMode, 
  handleNotificationClick,
  formatMessageDate,
  filteredItems,
  setSelectedFilter
}) => {
  return (
    <div className={`${styles.inboxList} ${darkMode ? styles.darkItem : ''}`}>
      {filteredItems.length > 0 ? (
        <div className={styles.itemsList}>
          {filteredItems.map(notification => (
            <div 
              key={notification.id}
              className={`${styles.notificationItem} ${notification.isRead ? '' : styles.unreadNotification}`}
              onClick={() => handleNotificationClick(notification.id)}
            >
              <div className={`${styles.notificationIcon} ${darkMode ? styles.darkNotificationIcon : ''}`}>
                {notification.icon}
              </div>
              
              <div className={styles.notificationContent}>
                <div className={styles.notificationMeta}>
                  <span className={styles.notificationType}>{notification.title}</span>
                  <span className={`${styles.notificationDate} ${darkMode ? styles.darkText : ''}`}>
                    {formatMessageDate(notification.timestamp)}
                  </span>
                </div>
                
                <div className={`${styles.notificationMessage} ${darkMode ? styles.darkText : ''}`}>
                  {notification.message}
                </div>
                
                {notification.project && (
                  <div className={`${styles.notificationProject} ${darkMode ? styles.darkText : ''}`}
                       onClick={(e) => {
                         e.stopPropagation();
                         setSelectedFilter(notification.project);
                       }}
                  >
                    <span className={styles.projectIcon}>📁</span> {notification.project}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState 
          type="notifications"
          message="No notifications found"
          actionLabel="Check all notifications"
          darkMode={darkMode}
          onAction={() => setSelectedFilter('all')}
        />
      )}
    </div>
  );
};

export default Notifications;