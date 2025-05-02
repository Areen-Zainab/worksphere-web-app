import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, Calendar, Clock, User, CheckCircle, Circle, MoreHorizontal, 
  Briefcase, Tag, X, Upload, AlertTriangle, Check, Edit, Trash, 
  FileText, Paperclip, ArrowRight
} from 'lucide-react';
import Layout from '../components/ui-essentials/Layout';
import styles from '../css/mytask.module.css';
import Header from '../components/header';
import { useDarkMode } from '../contexts/DarkModeContext';
import axios from 'axios';

// Task Popup Modal Component
const TaskModal = ({ 
  task, 
  isOpen, 
  onClose, 
  updateTaskStatus, 
  uploadTaskAttachments, 
  onSave 
}) => {
  const [currentTask, setCurrentTask] = useState(task);
  const [files, setFiles] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const modalRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    setCurrentTask(task);
  }, [task]);

  useEffect(() => {
    // Close modal on escape key
    const handleEscKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    
    // Close modal when clicking outside
    const handleClickOutside = (e) => {
      if (modalRef.current && !modalRef.current.contains(e.target)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscKey);
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('keydown', handleEscKey);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleFileChange = (e) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setFiles([...files, ...newFiles]);
    }
  };

  const handleRemoveFile = (index) => {
    const newFiles = [...files];
    newFiles.splice(index, 1);
    setFiles(newFiles);
  };

  const triggerFileUpload = () => {
    fileInputRef.current.click();
  };

  const handleStatusChange = (newStatus) => {
    setCurrentTask({...currentTask, status: newStatus});
  };

  const handleSave = async () => {
    try {
      setIsLoading(true);

      // First, update the task status if it changed
      if (task.status !== currentTask.status) {
        await updateTaskStatus(task.id, currentTask.status);
      }
      
      // Then, upload files if there are any
      if (files.length > 0) {
        await uploadTaskAttachments(task.id, files);
      }
      
      // Call the parent component's onSave function
      onSave(currentTask);
      onClose();
    } catch (error) {
      console.error('Error saving task:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent} ref={modalRef}>
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>Task Details</h2>
          <button className={styles.closeButton} onClick={onClose}>
            <X size={20} />
          </button>
        </div>
        
        <div className={styles.modalBody}>
          <h3 className={styles.taskTitle}>{currentTask.title}</h3>
          
          <div className={styles.statusChangeSection}>
            <h4 className={styles.sectionTitle}>Status</h4>
            <div className={styles.statusButtons}>
              <button 
                className={`${styles.statusButton} ${currentTask.status === 'PENDING' ? styles.statusActive : ''}`}
                onClick={() => handleStatusChange('PENDING')}
              >
                <Circle size={16} />
                <span>Pending</span>
              </button>
              <button 
                className={`${styles.statusButton} ${currentTask.status === 'IN_PROGRESS' ? styles.statusActive : ''}`}
                onClick={() => handleStatusChange('IN_PROGRESS')}
              >
                <ArrowRight size={16} />
                <span>In Progress</span>
              </button>
              <button 
                className={`${styles.statusButton} ${currentTask.status === 'COMPLETED' ? styles.statusActive : ''}`}
                onClick={() => handleStatusChange('COMPLETED')}
              >
                <CheckCircle size={16} />
                <span>Completed</span>
              </button>
            </div>
          </div>
          
          <div className={styles.detailsSection}>
            <div className={styles.detailItem}>
              <Calendar size={16} className={styles.detailIcon} />
              <span>Due: {currentTask.deadline ? new Date(currentTask.deadline).toLocaleDateString() : 'No deadline'}</span>
            </div>
            
            {currentTask.assignedTo && (
              <div className={styles.detailItem}>
                <User size={16} className={styles.detailIcon} />
                <span>Assigned to: {`${currentTask.assignedTo.firstName} ${currentTask.assignedTo.lastName}`}</span>
              </div>
            )}
            
            {currentTask.project && (
              <div className={styles.detailItem}>
                <Briefcase size={16} className={styles.detailIcon} />
                <span>Project: {currentTask.project.name}</span>
              </div>
            )}
          </div>
          
          {currentTask.description && (
            <div className={styles.descriptionSection}>
              <h4 className={styles.sectionTitle}>Description</h4>
              <p className={styles.descriptionText}>{currentTask.description}</p>
            </div>
          )}
          
          <div className={styles.attachmentsSection}>
            <h4 className={styles.sectionTitle}>Attachments</h4>
            
            <div className={styles.fileUploadArea}>
              <input 
                type="file" 
                multiple 
                ref={fileInputRef} 
                style={{ display: 'none' }} 
                onChange={handleFileChange}
              />
              
              <button 
                className={styles.uploadButton}
                onClick={triggerFileUpload}
                disabled={isLoading}
              >
                <Upload size={16} />
                <span>Add Files</span>
              </button>
              
              {files.length > 0 && (
                <div className={styles.filesList}>
                  {files.map((file, index) => (
                    <div key={index} className={styles.fileItem}>
                      <div className={styles.fileInfo}>
                        <FileText size={14} />
                        <span className={styles.fileName}>{file.name}</span>
                      </div>
                      <button 
                        className={styles.removeFileButton}
                        onClick={() => handleRemoveFile(index)}
                        disabled={isLoading}
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          
          {currentTask.labels && currentTask.labels.length > 0 && (
            <div className={styles.labelsSection}>
              <h4 className={styles.sectionTitle}>Labels</h4>
              <div className={styles.labelsContainer}>
                {currentTask.labels.map(label => (
                  <span 
                    key={label.id} 
                    className={styles.label}
                    style={{ backgroundColor: label.color || '#cccccc' }}
                  >
                    <Tag size={12} className={styles.labelIcon} />
                    {label.name}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
        
        <div className={styles.modalFooter}>
          <button 
            className={styles.cancelButton} 
            onClick={onClose}
            disabled={isLoading}
          >
            Cancel
          </button>
          <button 
            className={styles.saveButton} 
            onClick={handleSave}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <span className={styles.loadingSpinner}></span>
                Saving...
              </>
            ) : (
              <>
                <Check size={16} />
                Save Changes
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

// Component for displaying task/meeting cards
const TaskCard = ({ task, updateTaskStatus, uploadTaskAttachments }) => {
  const statusClasses = {
    "PENDING": styles.statusPending,
    "IN_PROGRESS": styles.statusProgress,
    "COMPLETED": styles.statusCompleted
  };

  const priorityClasses = {
    "HIGH": styles.priorityHigh,
    "MEDIUM": styles.priorityMedium,
    "LOW": styles.priorityLow
  };

  const [showMenu, setShowMenu] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Format user's full name
  const getUserFullName = (user) => {
    if (!user) return "Unassigned";
    return `${user.firstName} ${user.lastName}`;
  };

  const handleTaskClick = () => {
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
  };

  const handleTaskSave = (updatedTask) => {
    updateTaskStatus(updatedTask.id, updatedTask.status);
    // Additional save logic would go here
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showMenu) {
        setShowMenu(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [showMenu]);

  return (
    <>
      <div 
        className={styles.taskCard} 
        style={{"--animation-order": Math.random() * 5}}
        onClick={handleTaskClick}
      >
        <div className={styles.taskHeader}>
          <div>
            <h3 className={styles.taskTitle}>{task.title}</h3>
            <div className={styles.taskBadges}>
              <span className={`${styles.badge} ${priorityClasses[task.priority] || styles.priorityMedium}`}>
                {task.priority}
              </span>
              <span className={`${styles.badge} ${statusClasses[task.status] || styles.statusPending}`}>
                {task.status.replace('_', ' ')}
              </span>
            </div>
          </div>
          <div className={styles.moreButtonContainer}>
            <button 
              className={styles.moreButton}
              onClick={(e) => {
                e.stopPropagation();
                setShowMenu(!showMenu);
              }}
            >
              <MoreHorizontal size={16} />
            </button>
            
            {showMenu && (
              <div className={styles.dropdownMenu}>
                <button 
                  className={styles.menuItem}
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsModalOpen(true);
                    setShowMenu(false);
                  }}
                >
                  <Edit size={14} className={styles.menuIcon} />
                  Edit Task
                </button>
                {task.status !== 'COMPLETED' && (
                  <button 
                    className={styles.menuItem}
                    onClick={(e) => {
                      e.stopPropagation();
                      updateTaskStatus(task.id, "COMPLETED");
                      setShowMenu(false);
                    }}
                  >
                    <CheckCircle size={14} className={styles.menuIcon} />
                    Mark as Completed
                  </button>
                )}
                {task.status === 'COMPLETED' && (
                  <button 
                    className={styles.menuItem}
                    onClick={(e) => {
                      e.stopPropagation();
                      updateTaskStatus(task.id, "IN_PROGRESS");
                      setShowMenu(false);
                    }}
                  >
                    <Circle size={14} className={styles.menuIcon} />
                    Mark as In Progress
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
        
        <div className={styles.taskDetails}>
          {task.deadline && (
            <div className={styles.taskDetail}>
              <Calendar size={14} className={styles.detailIcon} />
              <span>{new Date(task.deadline).toLocaleDateString()}</span>
            </div>
          )}
          
          {task.assignedTo && (
            <div className={styles.taskDetail}>
              <User size={14} className={styles.detailIcon} />
              <span>{getUserFullName(task.assignedTo)}</span>
            </div>
          )}
          
          {task.project && (
            <div className={styles.taskDetail}>
              <Briefcase size={14} className={styles.detailIcon} />
              <span>{task.project.name}</span>
            </div>
          )}
        </div>
        
        {task.labels && task.labels.length > 0 && (
          <div className={styles.labelsContainer}>
            {task.labels.map(label => (
              <span 
                key={label.id} 
                className={styles.label}
                style={{ backgroundColor: label.color || '#cccccc' }}
              >
                <Tag size={10} className={styles.labelIcon} />
                {label.name}
              </span>
            ))}
          </div>
        )}
        
        {task.description && (
          <div className={styles.taskDescription}>
            <p>{task.description.length > 120 ? 
              `${task.description.substring(0, 120)}...` : 
              task.description}
            </p>
          </div>
        )}
      </div>

      <TaskModal 
        task={task}
        isOpen={isModalOpen}
        onClose={handleModalClose}
        updateTaskStatus={updateTaskStatus}
        uploadTaskAttachments={uploadTaskAttachments}
        onSave={handleTaskSave}
      />
    </>
  );
};

// Search component
const SearchBar = ({ searchQuery, setSearchQuery }) => {
  return (
    <div className={styles.searchContainer}>
      <Search size={16} className={styles.searchIcon} />
      <input
        type="text"
        className={styles.searchInput}
        placeholder="Search tasks..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />
    </div>
  );
};

const MyTasksPage = () => {
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [toggleSidebar, setToggleSidebar] = useState(() => {});
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Use the DarkModeContext
  const { darkMode } = useDarkMode();

  const fetchTasks = async () => {
    setLoading(true);
    setError(null);
  
    try {
      const loggedInUserId = localStorage.getItem('loggedInUserID');
  
      if (!loggedInUserId) {
        setError('User not logged in');
        setLoading(false);
        return;
      }
  
      const response = await fetch(`http://localhost:8080/api/tasks/my-tasks?userId=${loggedInUserId}`);
  
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
  
      const data = await response.json();
      setTasks(data);
    } catch (err) {
        console.error('Error fetching tasks:', err);
        setError('Failed to load tasks. Please try again.');
    } finally {
        setLoading(false);
        setRefreshing(false);
    }
  };

  // Initial data fetch
  useEffect(() => {
    fetchTasks();
  }, []);

  // Check if device is mobile
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkIfMobile();
    window.addEventListener('resize', checkIfMobile);
    
    return () => window.removeEventListener('resize', checkIfMobile);
  }, []);

  // Pull to refresh simulation
  const handleRefresh = () => {
    setRefreshing(true);
    fetchTasks();
  };

  // Add the uploadTaskAttachments function
  const uploadTaskAttachments = async (taskId, files) => {
    try {
      const userId = localStorage.getItem('loggedInUserID');
      if (!userId) {
        throw new Error('User not logged in');
      }

      const formData = new FormData();
      files.forEach(file => {
        formData.append('files', file);
      });

      // Add userId as a form parameter
      formData.append('userId', userId);

      const response = await axios.post(
        `http://localhost:8080/api/tasks/${taskId}/attachments`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          }
        }
      );
      
      return response.data;
    } catch (err) {
      console.error('Error uploading attachments:', err);
      alert('Failed to upload attachments. Please try again.');
      throw err;
    }
  };

  // Update task status function
  const updateTaskStatus = async (taskId, newStatus) => {
    try {
      // Get the logged-in user ID from localStorage
      const userId = localStorage.getItem('loggedInUserID');
      if (!userId) {
        throw new Error('User not logged in');
      }

      // Call the API endpoint with the correct path parameters and query parameters
      const response = await axios.patch(
        `http://localhost:8080/api/tasks/${taskId}/status?status=${newStatus}&userId=${userId}`,
        null, // No request body needed for this endpoint
        {
          headers: {
            'Content-Type': 'application/json',
          }
        }
      );
      
      // Update the local state
      setTasks(prevTasks => 
        prevTasks.map(task => 
          task.id === taskId ? { ...task, status: newStatus } : task
        )
      );
      
      return response.data;
    } catch (err) {
      console.error('Error updating task status:', err);
      alert('Failed to update task status. Please try again.');
      throw err;
    }
  };

  // Function to get date category
  const getDateCategory = (dateString) => {
    if (!dateString) return "future";
    
    const date = new Date(dateString);
    const today = new Date();
    
    // Set hours to 0 for accurate date comparison
    today.setHours(0, 0, 0, 0);
    
    // Check if date is today
    if (date.toDateString() === today.toDateString()) {
      return "today";
    }
    
    // Check if date is within this week
    const dayOfWeek = today.getDay();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - dayOfWeek);
    
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    
    if (date >= startOfWeek && date <= endOfWeek) {
      return "week";
    }
    
    // Check if date is within this month
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    
    if (date >= startOfMonth && date <= endOfMonth) {
      return "month";
    }
    
    return "future";
  };

  // Filter tasks based on selected tab and search query
  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title && task.title.toLowerCase().includes(searchQuery.toLowerCase());
    const dateCategory = task.deadline ? getDateCategory(task.deadline) : 'future';
    
    return matchesSearch && (activeTab === "all" || dateCategory === activeTab);
  });

  return (
    <Layout>
      <div className={`${styles.tasksContainer} ${darkMode ? 'dark-mode' : ''}`}>
        <div className={styles.tasksContent}>
          {/* Header component */}
          <Header 
            greeting={"My Tasks"} 
            toggleSidebar={toggleSidebar}
            isMobile={isMobile}
            isRefreshing={refreshing}
          />

          {/* Search Bar */}
          <SearchBar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
          
          {/* Refresh button */}
          <div className={styles.actionsContainer}>
            <button 
              className={styles.refreshButton}
              onClick={handleRefresh}
              disabled={refreshing}
            >
              {refreshing ? 'Refreshing...' : 'Refresh Tasks'}
            </button>
          </div>
          
          {/* Tabs */}
          <div className={styles.tabsContainer}>
            <div className={styles.tabsWrapper}>
              <button
                className={`${styles.tab} ${activeTab === "today" ? styles.active : ""}`}
                onClick={() => setActiveTab("today")}
              >
                Today
              </button>
              <button
                className={`${styles.tab} ${activeTab === "week" ? styles.active : ""}`}
                onClick={() => setActiveTab("week")}
              >
                This Week
              </button>
              <button
                className={`${styles.tab} ${activeTab === "month" ? styles.active : ""}`}
                onClick={() => setActiveTab("month")}
              >
                This Month
              </button>
              <button
                className={`${styles.tab} ${activeTab === "all" ? styles.active : ""}`}
                onClick={() => setActiveTab("all")}
              >
                All Tasks
              </button>
            </div>
          </div>

          {/* Loading and Error States */}
          {loading && <div className={styles.loadingState}>Loading tasks...</div>}
          {error && <div className={styles.errorState}>{error}</div>}

          {/* Tasks List */}
          {!loading && !error && (
            <div className={styles.tasksGrid}>
              {filteredTasks.length > 0 ? (
                filteredTasks.map(task => (
                  <TaskCard 
                    key={task.id} 
                    task={task} 
                    updateTaskStatus={updateTaskStatus}
                    uploadTaskAttachments={uploadTaskAttachments}
                  />
                ))
              ) : (
                <div className={styles.noTasks}>
                  No tasks found for the selected filter.
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default MyTasksPage;