import React, { useState, useEffect, useContext } from 'react';
import styles from '../../css/task.module.css';
import ProjectContext from '../../contexts/ProjectContext';
import ActivityTab from './TaskActivityTab';
import TaskAttachmentsTab from './TaskAttachmentsTab';
import axios from 'axios';
import LabelPicker from './labelPicker';
import { X, CheckCircle, FileText, Paperclip, Activity, Plus, Clock, User, Circle, ChevronRight, ChevronDown, Loader, Trash, Copy, Check } from 'lucide-react';

const TaskLabels = ({ labels, onRemoveLabel }) => {
  if (!labels || labels.length === 0) {
    return (
      <div style={{ 
        fontSize: '12px', 
        color: '#999', 
        padding: '4px 0', 
        fontStyle: 'italic' 
      }}>
        No labels added yet
      </div>
    );
  }

  return (
    <div style={{ 
      display: 'flex', 
      flexWrap: 'wrap', 
      gap: '8px', 
      marginTop: '8px',
      padding: '4px 0'
    }}>
      {labels.map(label => (
        <div 
          key={label.id} 
          style={{ 
            display: 'flex',
            alignItems: 'center',
            backgroundColor: label.color,
            borderRadius: '4px',
            padding: '3px 8px',
            color: 'white',
            fontSize: '12px',
            fontWeight: '500',
            boxShadow: '0 1px 2px rgba(0,0,0,0.1)'
          }}
        >
          <span style={{ 
            marginRight: '6px', 
            maxWidth: '120px', 
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap'
          }}>
            {label.name}
          </span>
          <button 
            onClick={() => onRemoveLabel(label.id)}
            aria-label={`Remove ${label.name} label`}
            style={{
              background: 'none',
              border: 'none',
              padding: '0',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '16px',
              height: '16px',
              opacity: '0.7'
            }}
            onMouseOver={(e) => e.currentTarget.style.opacity = '1'}
            onMouseOut={(e) => e.currentTarget.style.opacity = '0.7'}
          >
            <X size={12} stroke="white" />
          </button>
        </div>
      ))}
    </div>
  );
};

const TaskModal = ({ 
  show, 
  onClose, 
  task, 
  boardId, 
  index, 
  statuses = ["COMPLETED", "IN_PROGRESS", "PENDING", "NOT_STARTED"], 
  getMemberById,
  updateTask,
  showSuccess,
  showError,
  labels
}) => {
  const [editedTask, setEditedTask] = useState(null);
  const [originalLabels, setOriginalLabels] = useState([]);
  const [selectedAssignee, setSelectedAssignee] = useState('');
  const [activeTab, setActiveTab] = useState('details');
  const [showLabelPicker, setShowLabelPicker] = useState(false);
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [showAssigneeDropdown, setShowAssigneeDropdown] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const modalRef = React.useRef(null);
  const statusDropdownRef = React.useRef(null);
  const assigneeDropdownRef = React.useRef(null);
  const { 
    project, 
    members
  } = useContext(ProjectContext);

  // Debug useEffect for statuses and members
  useEffect(() => {
    if (show) {
      console.log('Project context data:', project);
      console.log('Members from context:', members);
      
      // Check if the members array exists and has valid structure
      if (!Array.isArray(members)) {
        console.error('Members is not an array:', members);
      } else if (members.length === 0) {
        console.warn('Members array is empty');
      }
      if (selectedAssignee) {
        console.log('Selected assignee ID:', selectedAssignee);
        console.log('Member data for selected assignee:', members.find(m => m.id === selectedAssignee));
      }
    }
  }, [show, project, members, selectedAssignee, getMemberById, statuses]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (statusDropdownRef.current && !statusDropdownRef.current.contains(event.target)) {
        setShowStatusDropdown(false);
      }
      if (assigneeDropdownRef.current && !assigneeDropdownRef.current.contains(event.target)) {
        setShowAssigneeDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (show && task) {
      const taskCopy = {...task};
      
      // Ensure labels is an array
      if (!taskCopy.labels) {
        taskCopy.labels = [];
      } else if (labels) {
        taskCopy.labels = [...labels];
      }
      setOriginalLabels([...taskCopy.labels]);
      
      // Handle assignee
      if (taskCopy.assignedTo && typeof taskCopy.assignedTo === 'object') {
        taskCopy.assignedToId = taskCopy.assignedTo.id;
      }
      
      // Normalize deadline field
      if (taskCopy.dueDate && !taskCopy.deadline) {
        taskCopy.deadline = taskCopy.dueDate;
      } else if (taskCopy.deadline && !taskCopy.dueDate) {
        taskCopy.dueDate = taskCopy.deadline;
      }
      
      setEditedTask(taskCopy);
      
      if (task.assignedTo) {
        const assignedId = Number(task.assignedTo); 
        const member = members.find(m => m.user.id === assignedId);

        if (member) {
          setSelectedAssignee(member.id);
        } else {
          console.warn("Assigned member not found in members array.");
        }
        ;
      } else {
        setSelectedAssignee('');
      }
      
      document.body.style.overflow = 'hidden';
    }
  }, [show, task, labels]);

  const closeTaskModal = () => {
    setEditedTask(null);
    setOriginalLabels([]);
    setSelectedAssignee('');
    setActiveTab('details');
    setShowLabelPicker(false);
    setShowStatusDropdown(false);
    setShowAssigneeDropdown(false);
    
    document.body.style.overflow = '';
    onClose();
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditedTask(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePriorityChange = (priority) => {
    setEditedTask(prev => ({
      ...prev,
      priority
    }));
  };

  const handleStatusChange = (statusId) => {
    setEditedTask(prev => ({
      ...prev,
      status: statusId
    }));
    setShowStatusDropdown(false);
  };

  const handleDateChange = (e) => {
    const deadlineValue = e.target.value;
    setEditedTask(prev => ({
      ...prev,
      deadline: deadlineValue,
      dueDate: deadlineValue
    }));
  };

  const handleAssigneeChange = (userId) => {
    setSelectedAssignee(userId);
    
    setEditedTask(prev => {
      if (!userId) {
        return { ...prev, assignedTo: null, assignedToId: null };
      }
      const member = members.find(m => m.id === userId);
      
      if (member && member.user) {
        return { 
          ...prev, 
          assignedTo: {id : member.user.id}, 
          assignedToId: member.user.id 
        };
      }
      
      return prev;
    });
    setShowAssigneeDropdown(false);
  };
  

  const addLabel = (newLabel) => {
    setEditedTask(prev => ({
      ...prev,
      labels: [...(prev.labels || []), newLabel]
    }));
  };

  const removeLabel = (labelId) => {
    setEditedTask(prev => ({
      ...prev,
      labels: prev.labels.filter(label => label.id !== labelId)
    }));
  };

  // Helper function to get added and removed labels
  const getLabelsChanges = () => {
    if (!editedTask || !labels || !originalLabels) return { added: [], removed: [] };
    
    const addedLabels = editedTask.labels.filter(label => 
      !originalLabels.some(origLabel => origLabel.id === label.id)
    );
    
    const removedLabels = originalLabels.filter(origLabel => 
      !editedTask.labels.some(label => label.id === origLabel.id)
    );
    
    return { added: addedLabels, removed: removedLabels };
  };

  // Handle API calls for labels
  const handleLabelChanges = async (userId) => {
    const { added, removed } = getLabelsChanges();

    const sanitizedAdded = added.map(({ id, ...rest }) => rest);
    const taskId = editedTask.id;
    
    try {
      if (added.length > 0) {
        await axios.patch(
          `http://localhost:8080/api/tasks/${taskId}/labels/add?userId=${userId}`,
          sanitizedAdded
        );
      }
      
      // Remove labels if any
      if (removed.length > 0) {
        await axios.patch(
          `http://localhost:8080/api/tasks/${taskId}/labels/remove?userId=${userId}`,
          removed
        );
      }
    } catch (error) {
      throw new Error(`Failed to update labels: ${error.message}`);
    }
  };

  // Handle deadline API call
  const handleDeadlineChange = async (userId) => {
    if (!editedTask.deadline) return;
    
    try {
      let deadlineValue = editedTask.deadline;
      if (deadlineValue instanceof Date) {
        deadlineValue = deadlineValue.toISOString().split('T')[0];
      }
      
      await axios.patch(
        `http://localhost:8080/api/tasks/${editedTask.id}/deadline?userId=${userId}&deadline=${encodeURIComponent(deadlineValue)}`
      );
    } catch (error) {
      showError('Deadline update error:', error);
    }
  };

  const saveChanges = async () => {
    try {
      setIsSaving(true);
      const userId = localStorage.getItem("loggedInUserID");
      
      if (!userId) {
        showError('Error', 'User ID not found');
        return;
      }
      
      // Main task update payload first
      const apiPayload = {
        id: editedTask.id,
        title: editedTask.title,
        description: editedTask.description,
        priority: editedTask.priority,
        status: editedTask.status,
        project: { id: editedTask.project?.id },
        // Pass the correct assignedTo value (user ID, not member ID)
        assignedTo: editedTask.assignedTo
        // Note: Labels and deadline are handled separately
      };
      
      // Update the main task data first
      const response = await fetch(`http://localhost:8080/api/tasks/${editedTask.id}?userId=${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(apiPayload)
      });
      
      if (!response.ok) {
        throw new Error(`Failed to update task: ${response.statusText}`);
      }
      
      try {
        await handleLabelChanges(userId);
        await handleDeadlineChange(userId);
      } catch (specialFieldError) {
        showError('Warning', `Task saved but there was an issue with labels or deadline: ${specialFieldError.message}`);
      }
      
      // Get the latest task data after all updates
      const getLatestResponse = await fetch(`http://localhost:8080/api/tasks/${editedTask.id}?userId=${userId}`);
      const savedTask = await getLatestResponse.json();
      
      // Update the task in the UI
      updateTask(boardId, index, savedTask);
      showSuccess('Success', 'Task updated successfully');
      
    } catch (error) {
      showError('Error', `Error updating task: ${error.message}`);
    } finally {
      setIsSaving(false);
      closeTaskModal();
    }
  };

  const onDeleteTaskClick = async () => {
    const userId = localStorage.getItem("loggedInUserID");
    const taskId = task.id;
    if (!task || !task.id || !userId) {
      showError('Error', 'Task ID and User ID are required');
      return;
    }

    try {
      const response = await axios.delete(`http://localhost:8080/api/tasks/${taskId}?userId=${userId}`);

      if (response.data && response.data.deleted) {
        showSuccess('Success', 'Task was successfully deleted');
      } else {
        showError('Error', 'Failed to delete the task. You may not have permission.');
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'An error occurred while deleting the task';
      showError('Error', errorMessage);
    } finally {
      closeTaskModal();
    }
  };

  const getStatusName = (statusId) => {
    if (!statusId) return "Unknown";
    
    if (Array.isArray(statuses) && statuses.length > 0 && typeof statuses[0] === 'object' && 'id' in statuses[0]) {
      const status = statuses.find(s => s.id === statusId);
      return status ? status.name : statusId.replace(/_/g, ' ');
    } 
    else if (Array.isArray(statuses) && statuses.includes(statusId)) {
      return statusId.replace(/_/g, ' ');
    } 
    else {
      return String(statusId).replace(/_/g, ' ').toLowerCase()
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
    }
  };
  
  const renderStatusIcon = (statusId) => {
    if (!statusId) {
      return <Circle size={16} />;
    }
    const statusString = String(statusId).toUpperCase();
    
    if (statusString.includes('PENDING')) return <Circle size={16} />;
    if (statusString.includes('PROGRESS')) return <ChevronRight size={16} />;
    if (statusString.includes('COMPLETE')) return <CheckCircle size={16} />;
    return <Circle size={16} />;
  };

  const getMemberInitials = (userId) => {
    if (!userId) return '';
    
    const member = members.find(m => m.id === userId);

    if (member) {
      const initials = member.user.firstName[0] + member.user.lastName[0];
      return initials;
    } else {
      return "NA";
    }
  };

  const getMemberName = (userId) => {
    if (!userId) return 'Unassigned';
    
    const member = members.find(m => m.id === userId);
    if (!member) {
      console.warn(`Member not found for ID: ${userId}`);
      return 'Unknown Member';
    }
    
    if (member.user.fullName) return member.user.fullName;
    if (member.user) return member.user.firstName;
    if (member.user.firstName && member.user.firstName) return `${member.user.firstName} ${member.user.firstName}`;
    if (member.user.firstName) return member.user.firstName;
    if (member.user.firstName) return member.user.firstName;
    if (member.user.email) return member.user.email;
    
    return 'Unnamed Member';
  };

  const getMemberColor = (userId) => {
    const colors = [
      '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFC43D', '#7768AE', 
      '#1D7874', '#F38181', '#6A0572', '#6F9A8D', '#FB8B24'
    ];
    
    const charSum = userId.toString().split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);
    return colors[charSum % colors.length];
  };

  const getPriorityBadgeStyle = (priority) => {
    if (!priority) return styles.priorityDefault;
    
    const priorityUpper = priority.toUpperCase();
    switch (priorityUpper) {
      case 'HIGH':
        return styles.priorityHigh;
      case 'MEDIUM':
        return styles.priorityMedium;
      case 'LOW':
        return styles.priorityLow;
      default:
        return styles.priorityDefault;
    }
  };

  const formatDateForInput = (dateString) => {
    if (!dateString) return '';
    
    try {
      const date = new Date(dateString);
      return date.toISOString().split('T')[0];
    } catch (error) {
      return '';
    }
  };

  if (!show || !editedTask) return null;

  return (
    <div className={styles.modalOverlay} onClick={closeTaskModal}>
      <div className={styles.enhancedModalContent} ref={modalRef} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <div className={styles.modalTitleArea}>
            <input
              type="text"
              name="title"
              value={editedTask.title || ''}
              onChange={handleInputChange}
              className={styles.modalTitleInput}
              placeholder="Task title"
            />
            
            <div className={styles.headerMetadata}>
              <div className={styles.statusDropdownContainer} ref={statusDropdownRef}>
                <div 
                  className={styles.statusBadge}
                  onClick={() => setShowStatusDropdown(!showStatusDropdown)}
                >
                  {renderStatusIcon(editedTask.status)}
                  <span>{getStatusName(editedTask.status)}</span>
                  <ChevronDown className={styles.dropdownArrow} size={12} />
                </div>
                
                {showStatusDropdown && (
                  <div className={styles.statusDropdownMenu}>
                    {Array.isArray(statuses) && statuses.length > 0 ? (
                      statuses.map((status, idx) => {
                        const statusId = typeof status === 'object' ? status.id : status;
                        const statusName = typeof status === 'object' ? status.name : 
                          String(status).replace(/_/g, ' ')
                            .toLowerCase()
                            .split(' ')
                            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                            .join(' ');
                        
                        return (
                          <div 
                            key={statusId || idx} 
                            className={styles.statusOption}
                            onClick={() => handleStatusChange(statusId)}
                          >
                            {renderStatusIcon(statusId)}
                            <span>{statusName}</span>
                          </div>
                        );
                      })
                    ) : (
                      <div className={styles.statusOption}>
                        <span>No statuses available</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
              
              <div className={`${styles.priorityBadge} ${getPriorityBadgeStyle(editedTask.priority)}`}> {editedTask.priority || 'None'} </div>
              <div className={styles.assigneeDropdownContainer} ref={assigneeDropdownRef}>
                <div 
                  className={styles.assigneeBadge}
                  onClick={() => setShowAssigneeDropdown(!showAssigneeDropdown)}
                >
                  {selectedAssignee ? (
                    <>
                      <div 
                        className={styles.assigneeAvatar}
                        style={{ backgroundColor: getMemberColor(selectedAssignee) }}
                      >
                        {getMemberInitials(selectedAssignee)}
                      </div>
                      <span className={styles.assigneeName}>
                        {getMemberName(selectedAssignee)}
                      </span>
                    </>
                  ) : (
                    <>
                      <User size={16} />
                      <span>Unassigned</span>
                    </>
                  )}
                  <ChevronDown className={styles.dropdownArrow} size={12} />
                </div>
                
                {showAssigneeDropdown && (
                  <div className={styles.assigneeDropdownMenu}>
                    <div 
                      className={styles.assigneeOption}
                      onClick={() => handleAssigneeChange('')}
                    >
                      <User size={16} />
                      <span>Unassigned</span>
                    </div>
                    
                    {Array.isArray(members) && members.length > 0 ? (
                      members.map(member => {
                        // Make sure member has an id
                        if (!member || !member.id) return null;
                        const initials = member.user.firstName[0] + member.user.lastName[0] || 'NA';
                        const name = member.user.firstName + ' ' + member.user.lastName;
                        
                        return (
                          <div 
                            key={member.id} 
                            className={styles.assigneeOption}
                            onClick={() => handleAssigneeChange(member.id)}
                          >
                            <div 
                              className={styles.assigneeOptionAvatar}
                              style={{ backgroundColor: getMemberColor(member.id) }}
                            >
                              {initials}
                            </div>
                            <span>{name}</span>
                          </div>
                        );
                      })
                    ) : (
                      <div className={styles.assigneeOption}>
                        <span>No members available</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <button 
            className={styles.closeModalButton} 
            onClick={closeTaskModal}
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>
        
        <div className={styles.modalTabsContainer}>
          <div className={styles.modalTabs}>
            <button 
              className={`${styles.tabButton} ${activeTab === 'details' ? styles.tabActive : ''}`}
              onClick={() => setActiveTab('details')}
            >
              <FileText size={16} />
              Details
            </button>
            <button 
              className={`${styles.tabButton} ${activeTab === 'attachments' ? styles.tabActive : ''}`}
              onClick={() => setActiveTab('attachments')}
            >
              <Paperclip size={16} />
              Attachments
            </button>
            <button 
              className={`${styles.tabButton} ${activeTab === 'activity' ? styles.tabActive : ''}`}
              onClick={() => setActiveTab('activity')}
            >
              <Activity size={16} />
              Activity
            </button>
          </div>
        </div>
        
        <div className={styles.modalBody}>
          {activeTab === 'details' && (
            <div className={styles.detailsTabContent}>
              <div className={styles.modalSidebar}>                
                <div className={styles.sidebarSection}>
                  <h4 className={styles.sidebarSectionTitle}>Priority</h4>
                  <div className={styles.prioritySelector}>
                    <button className={`${styles.priorityOption} ${editedTask.priority === 'Low' ? styles.priorityOptionActive : ''} ${styles.priorityLow}`}
                      onClick={() => handlePriorityChange('Low')}
                    >
                      Low
                    </button>
                    <button className={`${styles.priorityOption} ${editedTask.priority === 'Medium' ? styles.priorityOptionActive : ''} ${styles.priorityMedium}`}
                      onClick={() => handlePriorityChange('Medium')}
                    >
                      Medium
                    </button>
                    <button className={`${styles.priorityOption} ${editedTask.priority === 'High' ? styles.priorityOptionActive : ''} ${styles.priorityHigh}`}
                      onClick={() => handlePriorityChange('High')}
                    >
                      High
                    </button>
                  </div>
                </div>
                
                <div className={styles.sidebarSection}>
                  <h4 className={styles.sidebarSectionTitle}>Deadline</h4>
                  <input
                    type="date"
                    value={formatDateForInput(editedTask.deadline || editedTask.dueDate)}
                    onChange={handleDateChange}
                    className={styles.dateInput}
                  />
                </div>
                
                <div className={styles.sidebarSection}>
                  <div className={styles.labelSectionHeader}>
                    <h4 className={styles.sidebarSectionTitle}>Labels</h4>
                    <button 
                      className={styles.addLabelButton}
                      onClick={() => setShowLabelPicker(true)}
                      title="Add new label"
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                  
                  <TaskLabels 
                    labels={editedTask.labels} 
                    onRemoveLabel={removeLabel} 
                  />
                </div>
              </div>
              
              <div className={styles.descriptionSection}>
                <label htmlFor="description" className={styles.descriptionLabel}>Description</label>
                <textarea
                  id="description"
                  name="description"
                  value={editedTask.description || ''}
                  onChange={handleInputChange}
                  className={styles.descriptionInput}
                  placeholder="Add a detailed description..."
                  rows="12"
                />
              </div>
            </div>
          )}
          
          {/* Attachments Tab */}
          {activeTab === 'attachments' && (
            <TaskAttachmentsTab
              taskId={editedTask.id}
              attachments={editedTask.attachments || []}
            />
          )}
          
          {/* Activity Tab */}
          {activeTab === 'activity' && (
            <ActivityTab taskId={editedTask.id} />
          )}
        </div>
        
        <div className={styles.modalFooter}>
          <div className={styles.modalFooterLeft}>
            <button 
              className={styles.deleteTaskButton} 
              aria-label="Delete task"
              title="Delete task"
              onClick={onDeleteTaskClick}
            >
              <Trash size={16} />
            </button>
            
            <button 
              className={styles.duplicateTaskButton} 
              aria-label="Duplicate task"
              title="Duplicate task"
            >
              <Copy size={16} />
            </button>
          </div>
          
          <div className={styles.modalFooterRight}>
            <button 
              className={styles.cancelButton} 
              onClick={closeTaskModal}
            >
              Cancel
            </button>
            
            <button 
              className={styles.saveButton} 
              onClick={saveChanges}
              disabled={isSaving}
            >
              {isSaving ? <Loader size={16} className={styles.spinnerIcon} /> : <Check size={16} />}
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>
      
      <LabelPicker 
        show={showLabelPicker} 
        onClose={() => setShowLabelPicker(false)} 
        onAddLabel={addLabel} 
      />
    </div>
  );
};

export default TaskModal;