import React, { useState, useEffect } from 'react';
import axios from 'axios';
import styles from '../../css/project/attachmentstab.module.css';
import { Paperclip, X, Upload, File, Download, Loader, FileText, Image } from 'lucide-react';

const TaskAttachmentsTab = ({ taskId }) => {
  const [attachments, setAttachments] = useState([]);
  const [newAttachments, setNewAttachments] = useState([]);
  const [uploadingFiles, setUploadingFiles] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (taskId) {
      fetchAttachments();
    }
  }, [taskId]);

  const fetchAttachments = async () => {
    try {
      const userId = localStorage.getItem('loggedInUserID');
      if (!userId) {
        setError('User ID not found. Please log in again.');
        return;
      }

      const response = await axios.get(`http://localhost:8080/api/attachments/task/${taskId}?userId=${userId}`);
      setAttachments(response.data);
    } catch (err) {
      console.error('Error fetching attachments:', err);
      setError('Failed to load attachments. Please try again later.');
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files.length > 0) {
      // Convert FileList to Array and add to newAttachments
      const filesArray = Array.from(e.target.files);
      setNewAttachments([...newAttachments, ...filesArray]);

      // Upload files immediately
      uploadFiles(filesArray);
    }
  };

  const uploadFiles = async (files) => {
    setUploadingFiles(true);
    setError(null);

    const userId = localStorage.getItem('loggedInUserID');
    if (!userId) {
      setError('User ID not found. Please log in again.');
      setUploadingFiles(false);
      return;
    }

    try {
      // Upload each file and collect responses
      const uploadPromises = files.map(file => {
        const formData = new FormData();
        formData.append('file', file);
        
        return axios.post(
          `http://localhost:8080/api/attachments/task/${taskId}/upload?userId=${userId}`,
          formData,
          {
            headers: {
              'Content-Type': 'multipart/form-data'
            }
          }
        );
      });

      // Wait for all uploads to complete
      const responses = await Promise.all(uploadPromises);
      
      // Update attachments with newly uploaded files
      const newUploadedAttachments = responses.map(response => response.data);
      setAttachments(prev => [...prev, ...newUploadedAttachments]);
      
      // Clear the newAttachments since they're now uploaded
      setNewAttachments([]);
      
    } catch (err) {
      console.error('Error uploading files:', err);
      setError('Failed to upload one or more files. Please try again.');
    } finally {
      setUploadingFiles(false);
    }
  };

  const handleDownload = async (attachmentId, fileName) => {
    const userId = localStorage.getItem('loggedInUserID');
    if (!userId) {
      setError('User ID not found. Please log in again.');
      return;
    }

    try {
      const response = await axios.get(
        `http://localhost:8080/api/attachments/download/${attachmentId}?userId=${userId}`,
        { responseType: 'blob' }
      );

      // Create a temporary URL for the blob
      const url = window.URL.createObjectURL(new Blob([response.data]));
      
      // Create a temporary link element and trigger download
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      
      // Clean up
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error downloading file:', err);
      setError('Failed to download the file. Please try again.');
    }
  };

  const handleRemoveExistingAttachment = async (attachmentId) => {
    const userId = localStorage.getItem('loggedInUserID');
    if (!userId) {
      setError('User ID not found. Please log in again.');
      return;
    }

    if (!window.confirm('Are you sure you want to delete this attachment?')) {
      return;
    }

    try {
      await axios.delete(`http://localhost:8080/api/attachments/${attachmentId}?userId=${userId}`);
      
      // Remove the deleted attachment from state
      setAttachments(prev => prev.filter(attachment => attachment.id !== attachmentId));
    } catch (err) {
      console.error('Error removing attachment:', err);
      setError('Failed to remove the attachment. Please try again.');
    }
  };

  const handleRemovePendingAttachment = (index) => {
    setNewAttachments(prev => {
      const updated = [...prev];
      updated.splice(index, 1);
      return updated;
    });
  };

  const formatFileSize = (bytes) => {
    if (!bytes || isNaN(bytes)) return '';
    
    if (bytes < 1024) return bytes + ' B';
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    else return (bytes / 1048576).toFixed(1) + ' MB';
  };

  const getFileIcon = (fileName) => {
    if (!fileName) return <File size={20} />;
    
    const extension = fileName.split('.').pop().toLowerCase();
    
    if (['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp'].includes(extension)) {
      return <Image size={20} />;
    } else if (['pdf', 'doc', 'docx', 'txt', 'md'].includes(extension)) {
      return <FileText size={20} />;
    } else {
      return <File size={20} />;
    }
  };

  return (
    <div className={styles.attachmentsTabContent}>
      <div className={styles.attachmentsHeader}>
        <h4 className={styles.attachmentsTitle}>
          <Paperclip size={16} />
          Attachments ({(attachments?.length || 0) + newAttachments.length})
        </h4>
        
        <label className={styles.uploadButton} htmlFor="file-upload">
          <input
            id="file-upload"
            type="file"
            multiple
            onChange={handleFileChange}
            style={{ display: 'none' }}
            disabled={uploadingFiles}
          />
          {uploadingFiles ? (
            <>
              <Loader size={16} className={styles.spinnerIcon} />
              Uploading...
            </>
          ) : (
            <>
              <Upload size={16} />
              Upload Files
            </>
          )}
        </label>
      </div>
      
      {error && (
        <div className={styles.errorMessage}>
          {error}
        </div>
      )}
      
      <div className={styles.attachmentsList}>
        {/* New attachments that are pending upload */}
        {newAttachments.map((file, index) => (
          <div key={`new-${index}`} className={styles.attachmentItem}>
            <div className={styles.attachmentIcon}>
              {getFileIcon(file.name)}
            </div>
            
            <div className={styles.attachmentDetails}>
              <div className={styles.attachmentName}>{file.name}</div>
              <div className={styles.attachmentMeta}>
                {formatFileSize(file.size)} • Pending upload
              </div>
            </div>
            
            <button
              className={styles.removeAttachmentButton}
              onClick={() => handleRemovePendingAttachment(index)}
              aria-label={`Remove ${file.name}`}
              title="Remove attachment"
            >
              <X size={16} />
            </button>
          </div>
        ))}
        
        {/* Existing attachments from the server */}
        {attachments && attachments.map(attachment => (
          <div key={attachment.id} className={styles.attachmentItem}>
            <div className={styles.attachmentIcon}>
              {getFileIcon(attachment.fileName)}
            </div>
            
            <div className={styles.attachmentDetails}>
              <div 
                className={styles.attachmentName}
                onClick={() => handleDownload(attachment.id, attachment.fileName)}
                style={{ cursor: 'pointer' }}
              >
                {attachment.fileName}
              </div>
              <div className={styles.attachmentMeta}>
                {formatFileSize(attachment.fileSize)} • 
                Added {new Date(attachment.createdAt).toLocaleDateString()}
              </div>
            </div>
            
            <div className={styles.attachmentActions}>
              <button
                className={styles.downloadButton}
                onClick={() => handleDownload(attachment.id, attachment.fileName)}
                aria-label={`Download ${attachment.fileName}`}
                title="Download attachment"
              >
                <Download size={16} />
              </button>
              
              <button
                className={styles.removeAttachmentButton}
                onClick={() => handleRemoveExistingAttachment(attachment.id)}
                aria-label={`Remove ${attachment.fileName}`}
                title="Remove attachment"
              >
                <X size={16} />
              </button>
            </div>
          </div>
        ))}
        
        {/* Empty state */}
        {!uploadingFiles && attachments?.length === 0 && newAttachments.length === 0 && (
          <div className={styles.emptyAttachments}>
            <Paperclip size={24} />
            <p>No attachments yet</p>
            <label className={styles.uploadButtonSmall} htmlFor="file-upload-empty">
              <input
                id="file-upload-empty"
                type="file"
                multiple
                onChange={handleFileChange}
                style={{ display: 'none' }}
              />
              Add files
            </label>
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskAttachmentsTab;