import React, { useState, useRef } from 'react';
import KanbanBoard from '../components/kanban';
import ProjectAnalytics from '../components/projectAnalytics';
import styles from '../css/project.module.css';
import { useDarkMode } from '../contexts/DarkModeContext';
import Layout from '../components/ui-essentials/Layout';
import Header from '../components/header';

const ProjectPage = () => {
  // References for drag operations
  const dragTask = useRef(null);
  const dragTaskNode = useRef(null);
  const dragBoard = useRef(null);
  const dragBoardNode = useRef(null);

  const [project, setProject] = useState({
    id: "proj-123",
    name: "Website Redesign",
    description: "Complete overhaul of company website with new branding",
    boards: [
      {
        id: "board-1",
        title: "To Do",
        tasks: [
          {
            id: "task-1",
            title: "Create wireframes",
            description: "Design initial wireframes for homepage and product pages",
            priority: "High",
            dueDate: "2025-05-15",
            assignedTo: ["user-1", "user-3"]
          },
          {
            id: "task-2",
            title: "Content audit",
            description: "Review all existing content and identify gaps",
            priority: "Medium",
            dueDate: "2025-05-10",
            assignedTo: ["user-2"]
          },
          {
            id: "task-3",
            title: "SEO research",
            description: "Identify target keywords and competitive analysis",
            priority: "Low",
            dueDate: "2025-05-12",
            assignedTo: ["user-4"]
          }
        ]
      },
      {
        id: "board-2",
        title: "In Progress",
        tasks: [
          {
            id: "task-4",
            title: "Create design system",
            description: "Develop color palette, typography, and component library",
            priority: "High",
            dueDate: "2025-05-08",
            assignedTo: ["user-1"]
          },
          {
            id: "task-5",
            title: "Homepage prototype",
            description: "Build interactive prototype of new homepage design",
            priority: "Medium",
            dueDate: "2025-05-14",
            assignedTo: ["user-3", "user-5"]
          }
        ]
      },
      {
        id: "board-3",
        title: "Done",
        tasks: [
          {
            id: "task-6",
            title: "Stakeholder interviews",
            description: "Gather requirements from key stakeholders",
            priority: "High",
            dueDate: "2025-05-01",
            assignedTo: ["user-2", "user-5"]
          },
          {
            id: "task-7",
            title: "Competitor analysis",
            description: "Research competitor websites and identify opportunities",
            priority: "Medium",
            dueDate: "2025-05-03",
            assignedTo: ["user-4"]
          }
        ]
      }
    ]
  });

  const [members, setMembers] = useState([
    { id: "user-1", name: "Emma Wilson", avatar: "/api/placeholder/40/40", role: "Lead Designer" },
    { id: "user-2", name: "Alex Chen", avatar: "/api/placeholder/40/40", role: "Content Strategist" },
    { id: "user-3", name: "Maya Patel", avatar: "/api/placeholder/40/40", role: "UI Designer" },
    { id: "user-4", name: "James Walker", avatar: "/api/placeholder/40/40", role: "SEO Specialist" },
    { id: "user-5", name: "Sarah Johnson", avatar: "/api/placeholder/40/40", role: "Project Manager" }
  ]);

  const [showAddMemberForm, setShowAddMemberForm] = useState(false);
  const [newMember, setNewMember] = useState({ name: "", role: "" });
  const [newBoardTitle, setNewBoardTitle] = useState("");
  const [showAddBoardForm, setShowAddBoardForm] = useState(false);
  const [showAddTaskForm, setShowAddTaskForm] = useState(false);
  const [selectedBoardId, setSelectedBoardId] = useState(null);
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    priority: "Medium",
    dueDate: "",
    assignedTo: []
  });
  const [showEditProjectForm, setShowEditProjectForm] = useState(false);
  const [editedProject, setEditedProject] = useState({
    name: "",
    description: "",
    deadline: ""
  });
  const [draggingTask, setDraggingTask] = useState(false);
  const [draggingBoard, setDraggingBoard] = useState(false);

  // Get member initials
  const getMemberInitials = (member) => {
    const nameParts = member.name.split(' ');
    if (nameParts.length === 1) return nameParts[0][0].toUpperCase();
    return (nameParts[0][0] + nameParts[nameParts.length - 1][0]).toUpperCase();
  };

  // Get color based on user ID (consistent color for each user)
  const getMemberColor = (userId) => {
    const colors = [
      '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFC43D', '#7768AE', 
      '#1D7874', '#F38181', '#6A0572', '#6F9A8D', '#FB8B24'
    ];
    
    // Generate consistent index based on userId
    const charSum = userId.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);
    return colors[charSum % colors.length];
  };

  // Handle task drag operations
  const handleTaskDragStart = (e, taskIndex, boardId) => {
    dragTaskNode.current = e.target;
    dragTask.current = { taskIndex, boardId };
    
    setTimeout(() => {
      setDraggingTask(true);
    }, 0);
    
    e.dataTransfer.effectAllowed = "move";
  };

  const handleTaskDragEnd = () => {
    setDraggingTask(false);
    dragTask.current = null;
    dragTaskNode.current = null;
  };

  const handleTaskDragEnter = (e, targetTaskIndex, targetBoardId) => {
    if (!draggingTask || !dragTask.current) return;
    
    const { taskIndex: sourceTaskIndex, boardId: sourceBoardId } = dragTask.current;

    // Skip if hovering over the same task
    if (sourceBoardId === targetBoardId && sourceTaskIndex === targetTaskIndex) return;
    
    // Clone the boards array
    const newBoards = [...project.boards];
    
    // Find source and target board indices
    const sourceBoardIndex = newBoards.findIndex(board => board.id === sourceBoardId);
    const targetBoardIndex = newBoards.findIndex(board => board.id === targetBoardId);
    
    // Console log for debugging
    console.log(`Moving from board ${sourceBoardId} to board ${targetBoardId}`);
    console.log(`Board indices: source=${sourceBoardIndex}, target=${targetBoardIndex}`);
    
    // Exit if boards not found
    if (sourceBoardIndex < 0 || targetBoardIndex < 0) {
      console.error("Board not found", { sourceBoardId, targetBoardId, boards: newBoards.map(b => b.id) });
      return;
    }
    
    // Clone tasks arrays
    const sourceTasks = [...newBoards[sourceBoardIndex].tasks];
    const targetTasks = sourceBoardIndex === targetBoardIndex ? 
      sourceTasks : [...newBoards[targetBoardIndex].tasks];
    
    // Get the task being dragged
    const draggedTask = sourceTasks[sourceTaskIndex];
    
    // Remove from source
    sourceTasks.splice(sourceTaskIndex, 1);
    
    // Same board - reorder within the same list
    if (sourceBoardIndex === targetBoardIndex) {
      sourceTasks.splice(targetTaskIndex, 0, draggedTask);
      newBoards[sourceBoardIndex].tasks = sourceTasks;
    } 
    // Different boards - move task between boards
    else {
      targetTasks.splice(targetTaskIndex, 0, draggedTask);
      newBoards[sourceBoardIndex].tasks = sourceTasks;
      newBoards[targetBoardIndex].tasks = targetTasks;
    }
    
    // Update the project state
    setProject({
      ...project,
      boards: newBoards
    });
    
    // Update the current drag position
    dragTask.current = { taskIndex: targetTaskIndex, boardId: targetBoardId };
  };

  // Handle board drag operations
  const handleBoardDragStart = (e, boardIndex) => {
    dragBoardNode.current = e.target.closest(`.${styles.boardContainer}`);
    dragBoard.current = { boardIndex };
    
    setTimeout(() => {
      setDraggingBoard(true);
    }, 0);
    
    e.dataTransfer.effectAllowed = "move";
  };

  const handleBoardDragEnd = () => {
    setDraggingBoard(false);
    dragBoard.current = null;
    dragBoardNode.current = null;
  };

  const handleBoardDragEnter = (e, targetBoardIndex) => {
    if (!draggingBoard || !dragBoard.current) return;
    
    const { boardIndex: sourceBoardIndex } = dragBoard.current;
    
    // Skip if hovering over the same board
    if (sourceBoardIndex === targetBoardIndex) return;
    
    // Clone boards array
    const newBoards = [...project.boards];
    
    // Get the board being dragged
    const draggedBoard = newBoards[sourceBoardIndex];
    
    // Remove from source position
    newBoards.splice(sourceBoardIndex, 1);
    
    // Insert at target position
    newBoards.splice(targetBoardIndex, 0, draggedBoard);
    
    // Update the project state
    setProject({
      ...project,
      boards: newBoards
    });
    
    // Update current drag position
    dragBoard.current = { boardIndex: targetBoardIndex };
  };

  // Handle adding new task to specific board
  const handleAddTask = (e) => {
    e.preventDefault();
    if (newTask.title.trim() && selectedBoardId) {
      const boardIndex = project.boards.findIndex(board => board.id === selectedBoardId);
      
      if (boardIndex !== -1) {
        const updatedBoards = [...project.boards];
        const newTaskId = `task-${Math.random().toString(36).substr(2, 9)}`;
        
        updatedBoards[boardIndex].tasks.push({
          id: newTaskId,
          title: newTask.title,
          description: newTask.description || "",
          priority: newTask.priority,
          dueDate: newTask.dueDate || "",
          assignedTo: newTask.assignedTo
        });
        
        setProject({
          ...project,
          boards: updatedBoards
        });
        
        setNewTask({
          title: "",
          description: "",
          priority: "Medium",
          dueDate: "",
          assignedTo: []
        });
        
        setShowAddTaskForm(false);
        setSelectedBoardId(null);
      }
    }
  };

  // Add new board/column
  const handleAddBoard = (e) => {
    e.preventDefault();
    if (newBoardTitle.trim()) {
      // Generate a unique ID that doesn't depend on length
      const newBoardId = `board-${Date.now()}`;
      
      setProject({
        ...project,
        boards: [
          ...project.boards,
          {
            id: newBoardId,
            title: newBoardTitle,
            tasks: []
          }
        ]
      });
      setNewBoardTitle("");
      setShowAddBoardForm(false);
    }
  };

  // Add new member to the project
  const handleAddMember = (e) => {
    e.preventDefault();
    if (newMember.name.trim() && newMember.role.trim()) {
      const newMemberId = `user-${members.length + 1}`;
      setMembers([
        ...members,
        {
          id: newMemberId,
          name: newMember.name,
          avatar: "/api/placeholder/40/40",
          role: newMember.role
        }
      ]);
      setNewMember({ name: "", role: "" });
      setShowAddMemberForm(false);
    }
  };

  // Get member details by ID
  const getMemberById = (id) => {
    return members.find(member => member.id === id) || null;
  };

  // Show the add task form for a specific board
  const handleShowAddTaskForm = (boardId) => {
    setSelectedBoardId(boardId);
    setShowAddTaskForm(true);
  };
  
  // Handle delete board
  const handleDeleteBoard = (boardId) => {
    if (window.confirm("Are you sure you want to delete this board? All tasks in this board will be deleted.")) {
      const updatedBoards = project.boards.filter(board => board.id !== boardId);
      setProject({
        ...project,
        boards: updatedBoards
      });
    }
  };
  
  // Initialize edit project form
  const handleShowEditProjectForm = () => {
    const deadline = project.boards
      .flatMap(board => board.tasks)
      .map(task => task.dueDate)
      .filter(date => date)
      .sort((a, b) => new Date(b) - new Date(a))[0] || "";
      
    setEditedProject({
      name: project.name,
      description: project.description,
      deadline: deadline
    });
    
    setShowEditProjectForm(true);
  };
  
  // Handle edit project save
  const handleEditProject = (e) => {
    e.preventDefault();
    setProject({
      ...project,
      name: editedProject.name,
      description: editedProject.description
    });
    setShowEditProjectForm(false);
  };

  return (
    <Layout>
    <div className={styles.projectPage}>
      {/* Sidebar Component 
      <Sidebar /> */ }
      {/* Project Header */}
      <div className={styles.projectHeader}>
        <div className={styles.projectHeaderContent}>
          <div>
            <div className={styles.projectTitleWrapper}>
              <h1 className={styles.projectTitle}>{project.name}</h1>
              <button 
                className={styles.editButton}
                onClick={handleShowEditProjectForm}
                title="Edit project details"
              >
                <span className={styles.editIcon}>✎</span>
              </button>
            </div>
            <p className={styles.projectDescription}>{project.description}</p>
          </div>
          <div className={styles.memberSection}>
            <div className={styles.memberAvatars}>
              {members.slice(0, 5).map((member) => (
                <div
                  key={member.id}
                  className={styles.memberInitial}
                  style={{ backgroundColor: getMemberColor(member.id) }}
                  title={member.name}
                >
                  {getMemberInitials(member)}
                </div>
              ))}
              {members.length > 5 && (
                <div className={styles.memberCount}>
                  +{members.length - 5}
                </div>
              )}
            </div>
            <button
              onClick={() => setShowAddMemberForm(true)}
              className={styles.addMemberBtn}
            >
              Add Member
            </button>
          </div>
        </div>
      </div>

      {/* Project Analytics */}
      <ProjectAnalytics project={project} members={members} />

      {/* Main Kanban Board Content */}
      <div className={styles.kanbanContainer}>
        <div className={styles.boardsWrapper}>
          {project.boards.map((board, boardIndex) => (
            <KanbanBoard
              key={board.id}
              board={board}
              boardIndex={boardIndex}
              draggingTask={draggingTask}
              draggingBoard={draggingBoard}
              dragTask={dragTask}
              dragBoard={dragBoard}
              handleTaskDragStart={handleTaskDragStart}
              handleTaskDragEnd={handleTaskDragEnd}
              handleTaskDragEnter={handleTaskDragEnter}
              handleBoardDragStart={handleBoardDragStart}
              handleBoardDragEnd={handleBoardDragEnd}
              handleBoardDragEnter={handleBoardDragEnter}
              onAddTask={handleShowAddTaskForm}
              getMemberById={getMemberById}
              onDeleteBoard={handleDeleteBoard}
            />
          ))}
          
          {/* Add New Board/Column Button */}
          <div className={styles.addBoardContainer}>
            {!showAddBoardForm ? (
              <button
                onClick={() => setShowAddBoardForm(true)}
                className={styles.addBoardBtn}
              >
                <span className={styles.plusIcon}>+</span> Add Column
              </button>
            ) : (
              <div className={styles.addBoardForm}>
                <form onSubmit={handleAddBoard}>
                  <input
                    type="text"
                    value={newBoardTitle}
                    onChange={(e) => setNewBoardTitle(e.target.value)}
                    placeholder="Column name"
                    className={styles.boardTitleInput}
                    autoFocus
                  />
                  <div className={styles.formActions}>
                    <button
                      type="button"
                      onClick={() => setShowAddBoardForm(false)}
                      className={styles.cancelBtn}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className={styles.confirmBtn}
                    >
                      Add
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add Member Modal */}
      {showAddMemberForm && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <h2 className={styles.modalTitle}>Add Team Member</h2>
            <form onSubmit={handleAddMember}>
              <div className={styles.formGroup}>
                <label>Name</label>
                <input
                  type="text"
                  value={newMember.name}
                  onChange={(e) => setNewMember({...newMember, name: e.target.value})}
                  className={styles.formInput}
                  placeholder="Enter name"
                />
              </div>
              <div className={styles.formGroup}>
                <label>Role</label>
                <input
                  type="text"
                  value={newMember.role}
                  onChange={(e) => setNewMember({...newMember, role: e.target.value})}
                  className={styles.formInput}
                  placeholder="Enter role"
                />
              </div>
              <div className={styles.formActions}>
                <button
                  type="button"
                  onClick={() => setShowAddMemberForm(false)}
                  className={styles.cancelBtn}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={styles.confirmBtn}
                >
                  Add Member
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Task Modal */}
      {showAddTaskForm && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <h2 className={styles.modalTitle}>Add New Task</h2>
            <form onSubmit={handleAddTask}>
              <div className={styles.formGroup}>
                <label>Title</label>
                <input
                  type="text"
                  value={newTask.title}
                  onChange={(e) => setNewTask({...newTask, title: e.target.value})}
                  className={styles.formInput}
                  placeholder="Task title"
                />
              </div>
              <div className={styles.formGroup}>
                <label>Description</label>
                <textarea
                  value={newTask.description}
                  onChange={(e) => setNewTask({...newTask, description: e.target.value})}
                  className={styles.formTextarea}
                  placeholder="Task description"
                  rows={3}
                />
              </div>
              <div className={styles.formGroup}>
                <label>Priority</label>
                <select
                  value={newTask.priority}
                  onChange={(e) => setNewTask({...newTask, priority: e.target.value})}
                  className={styles.formSelect}
                >
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                </select>
              </div>
              <div className={styles.formGroup}>
                <label>Due Date</label>
                <input
                  type="date"
                  value={newTask.dueDate}
                  onChange={(e) => setNewTask({...newTask, dueDate: e.target.value})}
                  className={styles.formInput}
                />
              </div>
              <div className={styles.formGroup}>
                <label>Assigned To</label>
                <select
                  multiple
                  value={newTask.assignedTo}
                  onChange={(e) => {
                    const selected = Array.from(e.target.selectedOptions, option => option.value);
                    setNewTask({...newTask, assignedTo: selected});
                  }}
                  className={styles.formSelect}
                  size={3}
                >
                  {members.map(member => (
                    <option key={member.id} value={member.id}>
                      {member.name} ({member.role})
                    </option>
                  ))}
                </select>
                <p className={styles.helpText}>Hold Ctrl/Cmd to select multiple</p>
              </div>
              <div className={styles.formActions}>
                <button
                  type="button"
                  onClick={() => {
                    setShowAddTaskForm(false);
                    setSelectedBoardId(null);
                  }}
                  className={styles.cancelBtn}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={styles.confirmBtn}
                >
                  Add Task
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
            <form onSubmit={handleEditProject}>
              <div className={styles.formGroup}>
                <label>Project Name</label>
                <input
                  type="text"
                  value={editedProject.name}
                  onChange={(e) => setEditedProject({...editedProject, name: e.target.value})}
                  className={styles.formInput}
                  placeholder="Project name"
                />
              </div>
              <div className={styles.formGroup}>
                <label>Description</label>
                <textarea
                  value={editedProject.description}
                  onChange={(e) => setEditedProject({...editedProject, description: e.target.value})}
                  className={styles.formTextarea}
                  placeholder="Project description"
                  rows={3}
                />
              </div>
              <div className={styles.formGroup}>
                <label>Project Deadline</label>
                <input
                  type="date"
                  value={editedProject.deadline}
                  onChange={(e) => setEditedProject({...editedProject, deadline: e.target.value})}
                  className={styles.formInput}
                />
                <p className={styles.helpText}>This will help track overall project progress</p>
              </div>
              <div className={styles.formActions}>
                <button
                  type="button"
                  onClick={() => setShowEditProjectForm(false)}
                  className={styles.cancelBtn}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={styles.confirmBtn}
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
    </Layout>
  );
};

export default ProjectPage;