import React from 'react';
import EmptyState from '../dashboard/EmptyState';
import styles from '../../css/inbox/notifications.module.css';
import { AlertCircle, Bell, CheckCircle, FileText, MessageSquare, Users, Loader, RefreshCw, CheckCircle2, X, Check } from 'lucide-react';

const Notifications = ({ 
  darkMode,
  handleNotificationClick,
  formatMessageDate,
  filteredItems,
  setSelectedFilter,
  loading,
  error,
  handleRefresh,
  markAllAsRead,
  invitePopup,
  setInvitePopup,
  handleInviteResponse,
  unreadCount
}) => {
  if (loading) {
    return (
      <div className={`${styles.inboxList} ${darkMode ? styles.darkItem : ''}`}>
        <div className={styles.loadingState}>
          <Loader size={24} className="animate-spin mr-2" /> Loading notifications...
        </div>
      </div>
    );
  }

  // Render error state
  if (error) {
    return (
      <div className={`${styles.inboxList} ${darkMode ? styles.darkItem : ''}`}>
        <div className={styles.errorState}>
          <AlertCircle size={24} className="text-red-500 mr-2" /> {error}
        </div>
      </div>
    );
  }

  return (
    <div className={`${styles.inboxList} ${darkMode ? styles.darkItem : ''}`}>
      {/* Header with actions */}
      <div className={styles.notificationHeader}>
        <div className={styles.notificationHeaderTitle}>
          Notifications {unreadCount > 0 && <span>({unreadCount})</span>}
        </div>
        <div className={styles.notificationActions}>
          <button 
            className={styles.notificationAction}
            onClick={markAllAsRead}
            disabled={unreadCount === 0}
          >
            <CheckCircle2 size={18} /> Mark all read
          </button>
          <button 
            className={styles.notificationAction}
            onClick={handleRefresh}
          >
            <RefreshCw size={18} /> Refresh
          </button>
        </div>
      </div>

      {filteredItems.length > 0 ? (
        <div className={styles.itemsList}>
          {filteredItems.map(notification => (
            <div 
              key={notification.id}
              className={`${styles.notificationItem} ${notification.isRead ? '' : styles.unreadNotification}`}
              onClick={() => handleNotificationClick(notification)}
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
                         setSelectedFilter(notification.projectId);
                       }}
                  >
                    <span className={styles.projectIcon}>📁</span> {notification.projectId}
                  </div>
                )}
                
                {notification.invite_id && (
                  <div className={styles.inviteBadge}>
                    Project Invitation
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

      {/* Invitation Popup */}
      {invitePopup && (
        <div className={`${styles.invitePopupOverlay} ${darkMode ? styles.darkPopup : ''}`}>
          <div className={styles.invitePopup}>
            <div className={styles.invitePopupHeader}>
              <h3>Project Invitation</h3>
              <button 
                className={styles.closePopup}
                onClick={() => setInvitePopup(null)}
              >
                <X size={18} />
              </button>
            </div>
            
            <div className={styles.invitePopupContent}>
              <p className={styles.inviteMessage}>{invitePopup.message}</p>
            </div>
            
            <div className={styles.invitePopupActions}>
              <button 
                className={`${styles.inviteAction} ${styles.rejectBtn}`}
                onClick={() => handleInviteResponse(invitePopup, false)}
              >
                <X size={18} /> Reject
              </button>
              <button 
                className={`${styles.inviteAction} ${styles.acceptBtn}`}
                onClick={() => handleInviteResponse(invitePopup, true)}
              >
                <Check size={18} /> Accept
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Notifications;