import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import EmptyState from '../dashboard/EmptyState';
import styles from '../../css/inbox/messages.module.css';

const Messages = ({ 
  messages, 
  selectedMessage, 
  darkMode, 
  handleMessageSelect, 
  toggleMessageStar, 
  archiveMessage, 
  handleReply, 
  handleForward,
  setSelectedMessage,
  formatMessageDate,
  isMobile,
  filteredItems,
  handleCompose,
  messageListRef,
  messageDetailRef, 
  showComposeModal,
  handleCloseComposeModal
}) => {
  // State to track if attachments are expanded or collapsed
  const [attachmentsExpanded, setAttachmentsExpanded] = useState(false);

  // Toggle attachments visibility
  const toggleAttachments = () => {
    setAttachmentsExpanded(prev => !prev);
  };

  return (
    <>
      {/* Middle - Message List */}
      <div 
        ref={messageListRef} 
        className={`${styles.inboxList} ${darkMode ? styles.darkItem : ''}`}
      >
        {filteredItems.length > 0 ? (
          <div className={styles.itemsList}>
            {filteredItems.map(message => (
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
                    aria-label={message.isStarred ? "Unstar message" : "Star message"}
                  >
                    {message.isStarred ? '★' : '☆'}
                  </button>
                  <button 
                    className={styles.archiveButton}
                    onClick={(e) => archiveMessage(message.id, e)}
                    aria-label="Archive message"
                  >
                    🗃️
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState 
            type="messages"
            message="No messages found"
            actionLabel="Compose a message"
            darkMode={darkMode}
            onAction={handleCompose}
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
                    aria-label={selectedMessage.isStarred ? "Unstar message" : "Star message"}
                  >
                    {selectedMessage.isStarred ? '★' : '☆'}
                  </button>
                  <button 
                    className={styles.detailActionButton}
                    onClick={handleReply}
                    aria-label="Reply to message"
                  >
                    ↩️ Reply
                  </button>
                  <button 
                    className={styles.detailActionButton}
                    onClick={handleForward}
                    aria-label="Forward message"
                  >
                    ↪️ Forward
                  </button>
                  <button 
                    className={styles.detailActionButton}
                    onClick={(e) => archiveMessage(selectedMessage.id, e)}
                    aria-label="Archive message"
                  >
                    🗃️ Archive
                  </button>
                </div>
              </div>
              
              {isMobile && (
                <button 
                  className={styles.backButton}
                  onClick={() => setSelectedMessage(null)}
                  aria-label="Back to message list"
                >
                  ← Back to list
                </button>
              )}
            </div>

            {/* Collapsible Attachments Section */}
            {selectedMessage.attachments && selectedMessage.attachments.length > 0 && (
              <div className={`${styles.collapsibleAttachments} ${darkMode ? styles.darkAttachments : ''}`}>
                <button 
                  className={styles.attachmentsToggle}
                  onClick={toggleAttachments}
                  aria-expanded={attachmentsExpanded}
                  aria-controls="attachments-panel"
                >
                  <span>Attachments ({selectedMessage.attachments.length})</span>
                  <span className={styles.toggleIcon}>
                    {attachmentsExpanded ? '▼' : '▶'}
                  </span>
                </button>
                
                <AnimatePresence>
                  {attachmentsExpanded && (
                    <motion.div 
                      id="attachments-panel"
                      className={styles.attachmentsList}
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                    >
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
                          <button 
                            className={styles.downloadButton}
                            aria-label={`Download ${attachment.name}`}
                          >
                            ⬇️
                          </button>
                        </div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
            
            {/* Message Body */}
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
            
            {/* Reply Section */}
            <div className={styles.replySection}>
              <textarea 
                className={styles.replyInput}
                placeholder="Write a reply..."
              />
              <div className={styles.replyActions}>
                <button 
                  className={styles.attachButton}
                  aria-label="Attach file"
                >
                  📎
                </button>
                <button 
                  className={styles.sendButton}
                  aria-label="Send reply"
                >
                  Send
                </button>
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
      
      {/* Compose Modal */}
      {showComposeModal && (
        <div className={styles.modalOverlay}>
          <div className={`${styles.modalContent} ${darkMode ? styles.darkModal : ''}`}>
            <div className={styles.modalHeader}>
              <h2>New Message</h2>
              <button 
                className={styles.closeModalButton}
                onClick={handleCloseComposeModal}
                aria-label="Close compose modal"
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
                  <button 
                    className={styles.attachButton}
                    aria-label="Attach file to new message"
                  >
                    📎 Attach File
                  </button>
                </div>
                
                <div className={styles.composeSendActions}>
                  <button 
                    className={styles.discardButton} 
                    onClick={handleCloseComposeModal}
                    aria-label="Discard message"
                  >
                    Discard
                  </button>
                  <button 
                    className={styles.sendButton}
                    aria-label="Send message"
                  >
                    Send
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Messages;