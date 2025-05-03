import React, { useState, useContext } from 'react';
import ProjectContext from '../../contexts/ProjectContext';
import styles from '../../css/project/settings.module.css';

const SettingsTab = () => {
  const { project, setProject, members, setMembers, handleShowEditProjectForm } = useContext(ProjectContext);
  
  const [exportFormat, setExportFormat] = useState('json');
  const [notificationSettings, setNotificationSettings] = useState({
    dueDateReminders: true,
    taskAssignments: true,
    statusChanges: false,
    dailyDigest: true
  });
  const [displaySettings, setDisplaySettings] = useState({
    showCompletedTasks: true,
    defaultView: 'kanban',
    colorCodePriority: true,
    groupByAssignee: false
  });
  const [confirmDeleteProject, setConfirmDeleteProject] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  
  // Handle notification settings change
  const handleNotificationChange = (setting) => {
    setNotificationSettings({
      ...notificationSettings,
      [setting]: !notificationSettings[setting]
    });
  };
  
  // Handle display settings change
  const handleDisplayChange = (setting, value) => {
    setDisplaySettings({
      ...displaySettings,
      [setting]: typeof value === 'boolean' ? value : value.target.value
    });
  };
  
  // Handle project export
  const handleExport = () => {
    let exportData;
    let fileName;
    let dataStr;
    
    switch (exportFormat) {
      case 'json':
        exportData = JSON.stringify(project, null, 2);
        fileName = `${project.name.replace(/\s+/g, '_')}_export.json`;
        dataStr = `data:text/json;charset=utf-8,${encodeURIComponent(exportData)}`;
        break;
      case 'csv':
        // Create CSV for tasks
        const headers = ['ID', 'Title', 'Description', 'Priority', 'Due Date', 'Status', 'Assigned To'];
        const tasksData = project.boards.flatMap(board => 
          board.tasks.map(task => [
            task.id,
            task.title,
            task.description.replace(/,/g, ';'), // Replace commas in description
            task.priority,
            task.dueDate || '',
            board.title,
            task.assignedTo.map(id => {
              const member = members.find(m => m.id === id);
              return member ? member.name : id;
            }).join('; ')
          ])
        );
        
        const csvContent = [
          headers.join(','),
          ...tasksData.map(row => row.join(','))
        ].join('\n');
        
        fileName = `${project.name.replace(/\s+/g, '_')}_tasks.csv`;
        dataStr = `data:text/csv;charset=utf-8,${encodeURIComponent(csvContent)}`;
        break;
      default:
        return; // Unsupported format
    }
    
    // Create download link
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute('href', dataStr);
    downloadAnchorNode.setAttribute('download', fileName);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };
  
  // Handle project delete
  const handleDeleteProject = () => {
    if (deleteConfirmText === project.name) {
      // In a real app, this would navigate to projects list
      alert('Project would be deleted. In a real app, this would redirect to projects list.');
      setConfirmDeleteProject(false);
      setDeleteConfirmText('');
    }
  };
  
  // Handle board order reset
  const handleResetBoardOrder = () => {
    // Assuming the standard order is "To Do", "In Progress", "Done"
    const standardOrder = ['To Do', 'In Progress', 'Done'];
    
    // Create a copy of the current boards
    const currentBoards = [...project.boards];
    
    // Sort the boards according to the standard order
    const sortedBoards = currentBoards.sort((a, b) => {
      const indexA = standardOrder.indexOf(a.title);
      const indexB = standardOrder.indexOf(b.title);
      
      // If both are in the standard order list
      if (indexA !== -1 && indexB !== -1) {
        return indexA - indexB;
      }
      
      // If only a is in the standard order list
      if (indexA !== -1) {
        return -1;
      }
      
      // If only b is in the standard order list
      if (indexB !== -1) {
        return 1;
      }
      
      // If neither is in the standard order list, keep their relative order
      return 0;
    });
    
    // Update the project with the sorted boards
    setProject({
      ...project,
      boards: sortedBoards
    });
  };

  return (
    <div className={styles.settingsContainer}>
      <div className={styles.settingsSection}>
        <h2 className={styles.sectionTitle}>Project Settings</h2>
        <div className={styles.settingsGroup}>
          <button
            onClick={handleShowEditProjectForm}
            className={styles.primaryButton}
          >
            Edit Project Details
          </button>
          <button
            onClick={handleResetBoardOrder}
            className={styles.secondaryButton}
          >
            Reset Board Order
          </button>
        </div>
      </div>
      
      <div className={styles.settingsSection}>
        <h2 className={styles.sectionTitle}>Export Project</h2>
        <div className={styles.settingsGroup}>
          <div className={styles.formGroup}>
            <label>Export Format</label>
            <select
              value={exportFormat}
              onChange={(e) => setExportFormat(e.target.value)}
              className={styles.formSelect}
            >
              <option value="json">JSON</option>
              <option value="csv">CSV</option>
            </select>
          </div>
          <button
            onClick={handleExport}
            className={styles.primaryButton}
          >
            Export Project
          </button>
        </div>
      </div>
      
      <div className={styles.settingsSection}>
        <h2 className={styles.sectionTitle}>Display Settings</h2>
        <div className={styles.settingsGroup}>
          <div className={styles.checkboxGroup}>
            <input
              type="checkbox"
              id="showCompletedTasks"
              checked={displaySettings.showCompletedTasks}
              onChange={() => handleDisplayChange('showCompletedTasks', !displaySettings.showCompletedTasks)}
              className={styles.checkbox}
            />
            <label htmlFor="showCompletedTasks">Show Completed Tasks</label>
          </div>
          
          <div className={styles.checkboxGroup}>
            <input
              type="checkbox"
              id="colorCodePriority"
              checked={displaySettings.colorCodePriority}
              onChange={() => handleDisplayChange('colorCodePriority', !displaySettings.colorCodePriority)}
              className={styles.checkbox}
            />
            <label htmlFor="colorCodePriority">Color Code by Priority</label>
          </div>
          
          <div className={styles.checkboxGroup}>
            <input
              type="checkbox"
              id="groupByAssignee"
              checked={displaySettings.groupByAssignee}
              onChange={() => handleDisplayChange('groupByAssignee', !displaySettings.groupByAssignee)}
              className={styles.checkbox}
            />
            <label htmlFor="groupByAssignee">Group Tasks by Assignee</label>
          </div>
          
          <div className={styles.formGroup}>
            <label htmlFor="defaultView">Default View</label>
            <select
              id="defaultView"
              value={displaySettings.defaultView}
              onChange={(e) => handleDisplayChange('defaultView', e)}
              className={styles.formSelect}
            >
              <option value="kanban">Kanban Board</option>
              <option value="list">List View</option>
              <option value="timeline">Timeline</option>
              <option value="analytics">Analytics</option>
            </select>
          </div>
        </div>
      </div>
      
      <div className={styles.settingsSection}>
        <h2 className={styles.sectionTitle}>Notification Settings</h2>
        <div className={styles.settingsGroup}>
          <div className={styles.checkboxGroup}>
            <input
              type="checkbox"
              id="dueDateReminders"
              checked={notificationSettings.dueDateReminders}
              onChange={() => handleNotificationChange('dueDateReminders')}
              className={styles.checkbox}
            />
            <label htmlFor="dueDateReminders">Due Date Reminders</label>
          </div>
          
          <div className={styles.checkboxGroup}>
            <input
              type="checkbox"
              id="taskAssignments"
              checked={notificationSettings.taskAssignments}
              onChange={() => handleNotificationChange('taskAssignments')}
              className={styles.checkbox}
            />
            <label htmlFor="taskAssignments">Task Assignment Notifications</label>
          </div>
          
          <div className={styles.checkboxGroup}>
            <input
              type="checkbox"
              id="statusChanges"
              checked={notificationSettings.statusChanges}
              onChange={() => handleNotificationChange('statusChanges')}
              className={styles.checkbox}
            />
            <label htmlFor="statusChanges">Status Change Notifications</label>
          </div>
          
          <div className={styles.checkboxGroup}>
            <input
              type="checkbox"
              id="dailyDigest"
              checked={notificationSettings.dailyDigest}
              onChange={() => handleNotificationChange('dailyDigest')}
              className={styles.checkbox}
            />
            <label htmlFor="dailyDigest">Daily Task Digest</label>
          </div>
        </div>
      </div>
      
      <div className={styles.settingsSection}>
        <h2 className={styles.sectionTitle}>Danger Zone</h2>
        <div className={styles.dangerZone}>
          {!confirmDeleteProject ? (
            <button
              onClick={() => setConfirmDeleteProject(true)}
              className={styles.dangerButton}
            >
              Delete Project
            </button>
          ) : (
            <div className={styles.deleteConfirmation}>
              <p className={styles.warningText}>
                This action cannot be undone. To confirm, type the project name: <strong>{project.name}</strong>
              </p>
              <input
                type="text"
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                className={styles.confirmInput}
                placeholder="Type project name to confirm"
              />
              <div className={styles.dangerActions}>
                <button
                  onClick={() => setConfirmDeleteProject(false)}
                  className={styles.cancelButton}
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteProject}
                  className={styles.dangerButton}
                  disabled={deleteConfirmText !== project.name}
                >
                  Confirm Delete
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SettingsTab;