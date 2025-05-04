import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDarkMode } from '../contexts/DarkModeContext';
import Layout from '../components/ui-essentials/Layout';
import Header from '../components/header';
import ProjectHeader from '../components/project/ProjectHeader';
import KanbanTab from '../components/project/KanbanTab';
import ListView from '../components/project/ListView';
import TimelineView from '../components/project/TimelineView';
import AnalyticsTab from '../components/project/AnalyticsTab';
import TeamTab from '../components/project/TeamTab';
import SettingsTab from '../components/project/SettingsTab';
import ProjectContext from '../contexts/ProjectContext';
import { Toast, useToast, showToast } from '../components/ui-essentials/toast'; 
import styles from '../css/project/project.module.css';
import '../css/project/base.module.css';

const ProjectPage = () => {
  const { projectId } = useParams(); 
  const navigate = useNavigate();
  const { darkMode } = useDarkMode();
  const [activeTab, setActiveTab] = useState('kanban');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Toast notification state using the custom hook
  const { toast, showSuccess, showError, showInfo, showWarning } = useToast();
  
  // Project data states
  const [project, setProject] = useState(null);
  const [members, setMembers] = useState([]);
  const [tasks, setTasks] = useState([]);
  
  // UI state
  const [showAddMemberForm, setShowAddMemberForm] = useState(false);
  const [newMember, setNewMember] = useState({ name: "", role: "" });
  const [showEditProjectForm, setShowEditProjectForm] = useState(false);
  const [editedProject, setEditedProject] = useState({
    name: "",
    description: "",
    deadline: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentUserRole, setCurrentUserRole] = useState(null);

  // Fetch project data when component mounts or projectId changes
  useEffect(() => {
    const fetchProjectData = async () => {
      if (!projectId) {
        setError("No project ID provided");
        showError("Error", "No project ID provided");
        setLoading(false);
        return;
      }
      
      setLoading(true);
      
      try {
        // Fetch project details - ensure projectId is valid number
        const parsedProjectId = parseInt(projectId, 10);
        if (isNaN(parsedProjectId)) {
          throw new Error("Invalid project ID format");
        }
        
        const currentUserId = localStorage.getItem("loggedInUserID"); 
        const API_BASE_URL = 'http://localhost:8080';
        
        // Fetch project details first
        const projectResponse = await fetch(`${API_BASE_URL}/api/projects/${parsedProjectId}?userId=${currentUserId}`, {
          headers: {
            'Accept': 'application/json'
          }
        });
        const contentType = projectResponse.headers.get("content-type");
        if (contentType && !contentType.includes("application/json")) {
          console.error("API returned non-JSON response:", contentType);
          console.error("Full response status:", projectResponse.status, projectResponse.statusText);
          
          // Log the actual response for debugging
          const responseText = await projectResponse.text();
          console.error("Response preview:", responseText.substring(0, 500) + "...");
          
          throw new Error(`API returned non-JSON response (${contentType}). Check that the backend server is running at ${API_BASE_URL} and the endpoint exists.`);
        }
        
        if (!projectResponse.ok) {
          const errorText = await projectResponse.text();
          let errorMessage;
          
          try {
            const errorData = JSON.parse(errorText);
            errorMessage = errorData.message || errorData.error || `Error: ${projectResponse.status} ${projectResponse.statusText}`;
          } catch (e) {
            errorMessage = `Server error: ${projectResponse.status} ${projectResponse.statusText}`;
            console.error("Full error response:", errorText);
          }
          
          throw new Error(errorMessage);
        }
        
        const projectData = await projectResponse.json();
        projectData.id = projectId;
        
        // Set up a basic project structure even if other API calls fail
        const basicProject = {
          id: projectData.id,
          name: projectData.name,
          description: projectData.description || "",
          boards: [
            { id: 'to-do', title: 'TO DO', tasks: [] },
            { id: 'in-progress', title: 'IN PROGRESS', tasks: [] },
            { id: 'review', title: 'REVIEW', tasks: [] },
            { id: 'done', title: 'DONE', tasks: [] }
          ],
          createdAt: projectData.createdAt,
          deadline: projectData.deadline,
          ownerId: projectData.ownerId,
          currentUserId: currentUserId
        };
        
        // Set the project data right away so we have something to show even if other API calls fail
        setProject(basicProject);

        // Update this section in the useEffect within fetchProjectData
        try {
          const membersResponse = await fetch(`${API_BASE_URL}/api/projects/${parsedProjectId}/members?userId=${currentUserId}`, {
            credentials: 'include',
            headers: { 'Accept': 'application/json' }
          });
          
          if (membersResponse.ok) {
            // Check content type to avoid parsing HTML as JSON
            const contentType = membersResponse.headers.get("content-type");
            if (contentType && contentType.includes("application/json")) {
              const membersData = await membersResponse.json();
              setMembers(membersData);
              console.log("Members fetched successfully:", membersData);
              
              // Find current user's role in the project
              const currentUser = membersData.find(member => member.user.id.toString() === currentUserId);
              if (currentUser) {
                setCurrentUserRole(currentUser.role);
                //console.log("Current user role:", currentUser.role);
              }
            } else {
              showWarning('warning', "Warning", "Could not retrieve team members. The data format was unexpected.");
            }
          } else {
            console.warn(`Failed to fetch members: ${membersResponse.status} ${membersResponse.statusText}`);
            showInfo("Info", "Team members could not be loaded. You can still work with this project.");
          }
        } catch (error) {
          console.warn("Error fetching members:", error);
          showInfo("Info", "Team members could not be loaded due to a connection issue. You can still work with this project.");
        }
        
        // Fetch tasks data
try {
  console.log(`Fetching tasks from: ${API_BASE_URL}/api/tasks/project/${parsedProjectId}?userId=${currentUserId}`);
  const tasksResponse = await fetch(`${API_BASE_URL}/api/tasks/project/${parsedProjectId}?userId=${currentUserId}`, {
    credentials: 'include',
    headers: { 'Accept': 'application/json' }
  });
  
  if (tasksResponse.ok) {
    // Check content type to avoid parsing HTML as JSON
    const contentType = tasksResponse.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      const tasksData = await tasksResponse.json();
      setTasks(tasksData);
      console.log("Tasks fetched successfully:", tasksData);
      
      // Organize tasks into boards
      const boardsMap = {};
      
      // Create default boards even if empty
      const defaultStatuses = ["TO_DO", "IN_PROGRESS", "REVIEW", "DONE"];
      defaultStatuses.forEach(status => {
        boardsMap[status] = {
          id: status.toLowerCase().replace(/\s+/g, '-').replace(/_/g, '-'),
          title: status.replace(/_/g, ' '),
          tasks: []
        };
      });
      
      // Add tasks to appropriate boards
      tasksData.forEach(task => {
        const status = task.status || "TO_DO";
        if (!boardsMap[status]) {
          boardsMap[status] = {
            id: status.toLowerCase().replace(/\s+/g, '-').replace(/_/g, '-'),
            title: status.replace(/_/g, ' '),
            tasks: []
          };
        }
        boardsMap[status].tasks.push(task);
      });
      
      // Update project with the fetched tasks
      setProject(prevProject => ({
        ...prevProject,
        boards: Object.values(boardsMap)
      }));
    } else {
      throw new Error("Tasks API returned non-JSON response");
    }
  } else {
    throw new Error(`Failed to fetch tasks: ${tasksResponse.status} ${tasksResponse.statusText}`);
  }
} catch (tasksError) {
  console.warn("Error with primary tasks endpoint:", tasksError);
  showWarning('warning', "Tasks Loading Issue", "Could not load tasks from primary endpoint. Trying alternative method...");
  
  // Try fallback to the general tasks endpoint with projectId as param
  try {
    console.log(`Trying fallback tasks endpoint: ${API_BASE_URL}/api/tasks?projectId=${parsedProjectId}&userId=${currentUserId}`);
    const fallbackTasksResponse = await fetch(`${API_BASE_URL}/api/tasks?projectId=${parsedProjectId}&userId=${currentUserId}`, {
      credentials: 'include',
      headers: { 'Accept': 'application/json' }
    });
    
    if (fallbackTasksResponse.ok) {
      // Check content type to avoid parsing HTML as JSON
      const contentType = fallbackTasksResponse.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        const tasksData = await fallbackTasksResponse.json();
        setTasks(tasksData);
        console.log("Tasks fetched from fallback endpoint:", tasksData);
        
        // Set up boards
        const boardsMap = {};
        const defaultStatuses = ["TO_DO", "IN_PROGRESS", "REVIEW", "DONE"];
        
        defaultStatuses.forEach(status => {
          boardsMap[status] = {
            id: status.toLowerCase().replace(/\s+/g, '-').replace(/_/g, '-'),
            title: status.replace(/_/g, ' '),
            tasks: []
          };
        });
        
        tasksData.forEach(task => {
          const status = task.status || "TO_DO";
          if (!boardsMap[status]) {
            boardsMap[status] = {
              id: status.toLowerCase().replace(/\s+/g, '-').replace(/_/g, '-'),
              title: status.replace(/_/g, ' '),
              tasks: []
            };
          }
          boardsMap[status].tasks.push(task);
        });
        
        // Update project with the fetched tasks
        setProject(prevProject => ({
          ...prevProject,
          boards: Object.values(boardsMap)
        }));
        
        showSuccess("Tasks Loaded", "Tasks were successfully loaded from alternative source");
      } else {
        console.warn("Fallback tasks API returned non-JSON response");
        showError("Tasks Error", "Could not load tasks. The boards will be empty.");
      }
    } else {
      console.warn(`Fallback tasks endpoint failed: ${fallbackTasksResponse.status} ${fallbackTasksResponse.statusText}`);
      showError("Tasks Error", "Could not load tasks. You can still view project details.");
    }
  } catch (fallbackError) {
    console.error("Error with fallback tasks endpoint:", fallbackError);
    showError("Tasks Error", "Could not connect to the task service. Project will load with empty boards.");
  }
}
        
        setLoading(false);
        showSuccess('success', "Project Loaded", "Project data loaded successfully");
      } catch (err) {
        setError(err.message);
        showError('error', "Project Error", err.message);
        setLoading(false);
      }
    };

    fetchProjectData();
  }, [projectId]);

  // Initialize edit project form
  const handleShowEditProjectForm = () => {
    if (!project) return;
    
    const deadline = project.deadline || "";
      
    setEditedProject({
      name: project.name,
      description: project.description,
      deadline: deadline
    });
    
    setShowEditProjectForm(true);
    setError(null);
  };
  
  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditedProject(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // If user selects a tab they don't have access to, reset to kanban
  useEffect(() => {
    if (isSpectator() && ['analytics', 'team', 'settings'].includes(activeTab)) {
      setActiveTab('kanban');
      showInfo("Access Restricted", "Spectators don't have access to this tab.");
    }
  }, [activeTab, currentUserRole]);
  

  const isProjectOwner = () => {
    if (!project) return false;
    const currentUserId = localStorage.getItem("loggedInUserID");
    return project.ownerId === parseInt(currentUserId, 10);
  };
  
  // Check if user is a spectator
  const isSpectator = () => {
    return currentUserRole === "SPECTATOR";
  };

  // Handle edit project save - using ProjectDTO format expected by backend
  const handleEditProject = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const parsedProjectId = parseInt(projectId, 10);
      if (isNaN(parsedProjectId)) {
        throw new Error("Invalid project ID format");
      }
      
      // Get the current user ID
      const currentUserId = project.currentUserId || 1;
      const API_BASE_URL = 'http://localhost:8080';

      console.log(project);
      
      const projectDTO = {
        name: editedProject.name,
        description: editedProject.description,
        ownerId: project.ownerId,
        status: project.status || "in_progress",
        visibility: project.visibility || "PRIVATE",
        progress: project.progress || 0,
        startDate: project.startDate || null,
        endDate: editedProject.deadline || null
      };      
      
      //console.log(`Updating project: ${API_BASE_URL}/api/projects/${parsedProjectId}?userId=${currentUserId}`);
      const response = await fetch(`${API_BASE_URL}/api/projects/${parsedProjectId}?userId=${currentUserId}`, {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(projectDTO),
      });
      
      // Check content type first
      const contentType = response.headers.get("content-type");
      if (contentType && !contentType.includes("application/json")) {
        console.error("API returned non-JSON response:", contentType);
        throw new Error(`API returned non-JSON response (${contentType}). Check the endpoint configuration.`);
      }
      
      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage;
        
        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.message || errorData.error || `Error: ${response.status} ${response.statusText}`;
        } catch (e) {
          errorMessage = `Server error: ${response.status} ${response.statusText}`;
          showError("Server Error", "Full error response:", errorText);
        }
        
        throw new Error(errorMessage);
      }
      
      const updatedProject = await response.json();
      showSuccess("Successful Update!", "Project updated successfully:");//, updatedProject);
      
      // Update the local project state with new data
      setProject({
        ...project,
        name: updatedProject.name,
        description: updatedProject.description || "",
        deadline: updatedProject.deadline
      });
      
      setShowEditProjectForm(false);
      showSuccess("Success", "Project details updated successfully");
    } catch (err) {
      setError(err.message);
      showError("Update Failed", err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Add new member to the project using invite API
  const handleAddMember = async (e) => {
    e.preventDefault();
    if (newMember.name.trim() && newMember.role.trim()) {
      setIsSubmitting(true);
      try {
        const parsedProjectId = parseInt(projectId, 10);
        if (isNaN(parsedProjectId)) {
          throw new Error("Invalid project ID format");
        }
        const currentUserId = project.currentUserId || localStorage.getItem("loggedInUserID");
        const userEmail = newMember.name.trim();
        
        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(userEmail)) {
          throw new Error("Please enter a valid email address");
        }
        const roleValue = newMember.role;
        
        // Set the API base URL
        const API_BASE_URL = 'http://localhost:8080';
        
        //console.log(`Inviting member: ${API_BASE_URL}/api/projects/${parsedProjectId}/members/invite?userId=${currentUserId}`);
        const response = await fetch(`${API_BASE_URL}/api/projects/${parsedProjectId}/members/invite?userId=${currentUserId}`, {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify({
            inviterId: currentUserId,
            userEmail: userEmail, // Changed from userId to userEmail
            role: roleValue
          }),
        });
        
        // Check content type
        const contentType = response.headers.get("content-type");
        if (contentType && !contentType.includes("application/json")) {
          showError("API returned non-JSON response:", contentType);
          throw new Error(`API returned non-JSON response (${contentType}). Check the endpoint configuration.`);
        }
        
        if (!response.ok) {
          const errorText = await response.text();
          let errorMessage;
          
          try {
            const errorData = JSON.parse(errorText);
            errorMessage = errorData.message || errorData.error || `Error: ${response.status} ${response.statusText}`;
          } catch (e) {
            errorMessage = `Server error: ${response.status} ${response.statusText}`;
            console.error("Full error response:", errorText);
          }
          
          throw new Error(errorMessage);
        }
        
        const addedMember = await response.json();
        setMembers([...members, addedMember]);
        setNewMember({ name: "", role: "" });
        setShowAddMemberForm(false);
        showSuccess("Team Member Added", `Invitation sent to ${userEmail} successfully`);
      } catch (err) {
        setError(err.message);
        showError("Invitation Failed", err.message);
      } finally {
        setIsSubmitting(false);
      }
    } else {
      setError("Please fill in all fields");
      showError("Form Error", "Please fill in all required fields");
    }
  };

  // Calculate project stats
  const getProjectStats = () => {
    if (!project) return { totalTasks: 0, completedTasks: 0, highPriorityTasks: 0, tasksWithDueDateSoon: 0, completionPercentage: 0 };
    
    const allTasks = project.boards.flatMap(board => board.tasks);
    const totalTasks = allTasks.length;
    const completedTasks = project.boards.find(board => board.title === "DONE")?.tasks.length || 0;
    const highPriorityTasks = allTasks.filter(task => task.priority === "High").length;
    const tasksWithDueDateSoon = allTasks.filter(task => {
      if (!task.dueDate) return false;
      const dueDate = new Date(task.dueDate);
      const today = new Date();
      const diffTime = dueDate - today;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays <= 7 && diffDays >= 0;
    }).length;

    return {
      totalTasks,
      completedTasks,
      highPriorityTasks,
      tasksWithDueDateSoon,
      completionPercentage: totalTasks ? Math.round((completedTasks / totalTasks) * 100) : 0
    };
  };

  // Get member initials utility function
const getMemberInitials = (member) => {
  if (!member || !member.name) {
    // Handle the case when member is a direct API object
    if (member?.user?.firstName) {
      const firstName = member.user.firstName;
      const lastName = member.user.lastName || '';
      
      if (!lastName) return firstName[0].toUpperCase();
      return (firstName[0] + lastName[0]).toUpperCase();
    }
    return '';
  }
  
  // Original implementation for backwards compatibility
  const nameParts = member.name.split(' ');
  if (nameParts.length === 1) return nameParts[0][0].toUpperCase();
  return (nameParts[0][0] + nameParts[nameParts.length - 1][0]).toUpperCase();
};

// Get color based on user ID (consistent color for each user)
const getMemberColor = (userId) => {
  if (!userId) return '#CCCCCC';
  
  const colors = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFC43D', '#7768AE', 
    '#1D7874', '#F38181', '#6A0572', '#6F9A8D', '#FB8B24'
  ];
  
  // Generate consistent index based on userId
  const charSum = userId.toString().split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);
  return colors[charSum % colors.length];
};

// Get member by ID utility function - updated for new structure
const getMemberById = (id) => {
  const member = members.find(member => member.user.id === id) || null;
  return member;
};

  // Handle going back if there's an error or no project found
  const handleBackToDashboard = () => {
    navigate('/dashboard');
  };

  // Show loading state
  if (loading) {
    return (
      <Layout>
        <div className={`${styles.projectPage} ${darkMode ? styles.darkMode : ''}`}>
          <Header 
            greeting="Loading Project..." 
            showBackButton={true}
            backButtonUrl="/dashboard"
          />
          <div className={styles.loadingContainer}>
            <div className={styles.loadingSpinner}></div>
            <p>Loading project data...</p>
          </div>
        </div>
      </Layout>
    );
  }

  // Show error state
  if (error && !project) {
    return (
      <Layout>
        <div className={`${styles.projectPage} ${darkMode ? styles.darkMode : ''}`}>
          <Header 
            greeting="Project Error" 
            showBackButton={true}
            backButtonUrl="/dashboard"
          />
          <div className={styles.errorContainer}>
            <h2>Error Loading Project</h2>
            <p>{error || "Project not found"}</p>
            <button onClick={handleBackToDashboard} className={styles.backButton}>
              Back to Dashboard
            </button>
          </div>
          
          {/* Display error toast */}
          <Toast 
            visible={true}
            type="error"
            title="Project Error"
            message={error || "Could not load project data"}
            onClose={() => {}}
            duration={0} // Keep visible until user navigates away
          />
        </div>
      </Layout>
    );
  }

  // Context value with setProject for header component to use
  const projectContextValue = {
    project,
    setProject,
    members,
    setMembers,
    tasks,
    setTasks,
    getMemberInitials,
    getMemberColor,
    getMemberById,
    getProjectStats,
    handleShowEditProjectForm, // passing the function to show edit form
    projectId: parseInt(projectId, 10), // Ensure projectId is passed as number
    showSuccess, // Add toast functions to context
    showError,
    showInfo,
    currentUserRole, // Add user role to context
    isSpectator: isSpectator, // Add isSpectator function to context
    isProjectOwner: isProjectOwner
  };

  // Render the active tab content
  const renderTabContent = () => {
    switch (activeTab) {
      case 'kanban':
        return <KanbanTab />;
      case 'list':
        return <ListView />;
      case 'timeline':
        return <TimelineView />;
      case 'analytics':
        return <AnalyticsTab />;
      case 'team':
        return <TeamTab setShowAddMemberForm={setShowAddMemberForm} />;
      case 'settings':
        return <SettingsTab />;
      default:
        return <KanbanTab />;
    }
  };

  return (
    <ProjectContext.Provider value={projectContextValue}>
      <Layout>
        <div className={`${styles.projectPage} ${darkMode ? styles.darkMode : ''}`}>
          <Header 
            greeting={project.name} 
            showBackButton={true}
            backButtonUrl="/dashboard"
          />
          
          <ProjectHeader 
            stats={getProjectStats()}
            setShowAddMemberForm={setShowAddMemberForm} 
          />
          
          {/* Tab Navigation */}
          <div className={styles.tabsContainer}>
            <button 
              className={`${styles.tabButton} ${activeTab === 'kanban' ? styles.activeTab : ''}`}
              onClick={() => setActiveTab('kanban')}
            >
              Kanban Board
            </button>
            <button 
              className={`${styles.tabButton} ${activeTab === 'list' ? styles.activeTab : ''}`}
              onClick={() => setActiveTab('list')}
            >
              List View
            </button>
            <button 
              className={`${styles.tabButton} ${activeTab === 'timeline' ? styles.activeTab : ''}`}
              onClick={() => setActiveTab('timeline')}
            >
              Timeline
            </button>
            {!isSpectator() && (
              <>
                <button 
                  className={`${styles.tabButton} ${activeTab === 'analytics' ? styles.activeTab : ''}`}
                  onClick={() => setActiveTab('analytics')}
                >
                  Analytics
                </button>
                <button 
                  className={`${styles.tabButton} ${activeTab === 'team' ? styles.activeTab : ''}`}
                  onClick={() => setActiveTab('team')}
                >
                  Team
                </button>
                {/* Only show Settings tab if user is the project owner */}
                {isProjectOwner() && (
                  <button 
                    className={`${styles.tabButton} ${activeTab === 'settings' ? styles.activeTab : ''}`}
                    onClick={() => setActiveTab('settings')}
                  >
                    Settings
                  </button>
                )}
              </>
            )}
          </div>

          {/* Tab Content */}
          <div className={styles.tabContent}>
            {renderTabContent()}
          </div>

          {/* Add Member Modal */}
          {showAddMemberForm && (
            <div className={styles.modalOverlay}>
              <div className={styles.modal}>
                <h2 className={styles.modalTitle}>Add Team Member</h2>
                {error && (
                  <div className={styles.errorMessage}>
                    {error}
                  </div>
                )}
                <form onSubmit={handleAddMember}>
                  <div className={styles.formGroup}>
                    <label htmlFor="memberEmail">User Email</label>
                    <input
                      id="memberEmail"
                      type="text"
                      value={newMember.email}
                      onChange={(e) => setNewMember({...newMember, name: e.target.value})}
                      className={styles.formInput}
                      placeholder="Enter user email"
                      required
                    />
                    <p className={styles.helpText}>Enter the email of the person you want to add</p>
                  </div>
                  <div className={styles.formGroup}>
                    <label htmlFor="memberRole">Role</label>
                    <select
                      id="memberRole"
                      value={newMember.role}
                      onChange={(e) => setNewMember({...newMember, role: e.target.value})}
                      className={styles.formSelect}
                      required
                    >
                      <option value="">Select a role</option>
                      <option value="PROJECT_MANAGER">Project Manager</option>
                      <option value="TEAM_MEMBER">Team Member</option>
                      <option value="SPECTATOR">Spectator</option>
                    </select>
                    <p className={styles.helpText}>Select the appropriate role for this team member</p>
                  </div>
                  <div className={styles.formActions}>
                    <button
                      type="button"
                      onClick={() => {
                        setShowAddMemberForm(false);
                        setError(null);
                        setNewMember({ name: "", role: "" });
                      }}
                      className={styles.cancelBtn}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className={styles.confirmBtn}
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? 'Adding...' : 'Add Member'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
          
          {/* Edit Project Modal */}
          {showEditProjectForm && (
            <div className={styles.modalOverlay}>
              <div className={styles.modal}>
                <h2 className={styles.modalTitle}>Edit Project Details</h2>
                {error && (
                  <div className={styles.errorMessage}>
                  {error}
                </div>
              )}
              <form onSubmit={handleEditProject}>
                <div className={styles.formGroup}>
                  <label htmlFor="name">Project Name</label>
                  <input
                    id="name"
                    type="text"
                    name="name"
                    value={editedProject.name}
                    onChange={handleInputChange}
                    className={styles.formInput}
                    placeholder="Project name"
                    required
                  />
                </div>
                <div className={styles.formGroup}>
                  <label htmlFor="description">Description</label>
                  <textarea
                    id="description"
                    name="description"
                    value={editedProject.description}
                    onChange={handleInputChange}
                    className={styles.formTextarea}
                    placeholder="Project description"
                    rows={3}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label htmlFor="deadline">Project Deadline</label>
                  <input
                    id="deadline"
                    type="date"
                    name="deadline"
                    value={editedProject.deadline}
                    onChange={handleInputChange}
                    className={styles.formInput}
                  />
                  <p className={styles.helpText}>This will help track overall project progress</p>
                </div>
                <div className={styles.formActions}>
                  <button
                    type="button"
                    onClick={() => setShowEditProjectForm(false)}
                    className={styles.cancelBtn}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className={styles.confirmBtn}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
        
        {/* Toast Component to display notifications */}
        <Toast
          visible={toast.visible}
          type={toast.type}
          title={toast.title}
          message={toast.message}
          onClose={() => toast.hideToast()}
        />
      </div>
    </Layout>
  </ProjectContext.Provider>
);
};

export default ProjectPage;