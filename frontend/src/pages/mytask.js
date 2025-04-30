import React, { useState, useEffect } from 'react';
import { Search, Calendar, Clock, User, CheckCircle, Circle, MoreHorizontal, Moon, Sun } from 'lucide-react';
import Layout from '../components/ui-essentials/Layout';
import styles from '../css/mytask.module.css';
import Header from '../components/header';
import { useDarkMode } from '../contexts/DarkModeContext';

// Sample data for demonstration
const sampleTasks = [
  {
    id: 1,
    title: "Update Project Documentation",
    type: "Task",
    dueDate: "2025-04-28",
    status: "In Progress",
    assignees: ["Alex K.", "Jamie L."]
  },
  {
    id: 2,
    title: "Weekly Team Meeting",
    type: "Meeting",
    dueDate: "2025-04-28",
    time: "14:00",
    status: "Pending",
    assignees: ["Alex K.", "Jamie L.", "Sam P.", "Taylor R."]
  },
  {
    id: 3,
    title: "Review Client Proposal",
    type: "Task",
    dueDate: "2025-04-29",
    status: "Pending",
    assignees: ["Alex K."]
  },
  {
    id: 4,
    title: "Client Presentation",
    type: "Meeting",
    dueDate: "2025-04-30",
    time: "10:30",
    status: "Pending",
    assignees: ["Alex K.", "Taylor R."]
  },
  {
    id: 5,
    title: "Finalize Q2 Roadmap",
    type: "Task",
    dueDate: "2025-05-05",
    status: "Pending",
    assignees: ["Alex K.", "Jamie L."]
  },
  {
    id: 6,
    title: "Department Budget Review",
    type: "Meeting",
    dueDate: "2025-05-15",
    time: "09:00",
    status: "Pending",
    assignees: ["Alex K.", "Casey M."]
  }
];

// Function to determine if a date is today, this week, or this month
const getDateCategory = (dateString) => {
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

// Component for displaying task/meeting cards
const TaskCard = ({ task, updateTaskStatus }) => {
  const statusClasses = {
    "Pending": styles.statusPending,
    "In Progress": styles.statusProgress,
    "Completed": styles.statusCompleted
  };

  const typeClasses = {
    "Task": styles.typeTask,
    "Meeting": styles.typeMeeting
  };

  const [isExpanded, setIsExpanded] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
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
    <div 
      className={styles.taskCard} 
      style={{"--animation-order": Math.random() * 5}}
      onClick={toggleExpand}
    >
      <div className={styles.taskHeader}>
        <div>
          <h3 className={styles.taskTitle}>{task.title}</h3>
          <div className={styles.taskBadges}>
            <span className={`${styles.badge} ${typeClasses[task.type]}`}>
              {task.type}
            </span>
            <span className={`${styles.badge} ${statusClasses[task.status]}`}>
              {task.status}
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
                  updateTaskStatus(task.id, "Completed");
                  setShowMenu(false);
                }}
              >
                <CheckCircle size={14} className={styles.menuIcon} />
                Mark as Completed
              </button>
              {task.status === "Completed" && (
                <button 
                  className={styles.menuItem}
                  onClick={(e) => {
                    e.stopPropagation();
                    updateTaskStatus(task.id, task.type === "Task" ? "In Progress" : "Pending");
                    setShowMenu(false);
                  }}
                >
                  <Circle size={14} className={styles.menuIcon} />
                  Mark as {task.type === "Task" ? "In Progress" : "Pending"}
                </button>
              )}
            </div>
          )}
        </div>
      </div>
      
      <div className={styles.taskDetails}>
        <div className={styles.taskDetail}>
          <Calendar size={14} className={styles.detailIcon} />
          <span>{new Date(task.dueDate).toLocaleDateString()}</span>
        </div>
        
        {task.time && (
          <div className={styles.taskDetail}>
            <Clock size={14} className={styles.detailIcon} />
            <span>{task.time}</span>
          </div>
        )}
      </div>
      
      {task.assignees.length > 0 && (
        <div className={styles.taskAssignees}>
          <div className={styles.assigneesLabel}>Assignees:</div>
          <div className={styles.assigneesList}>
            {task.assignees.map((assignee, index) => (
              <div key={index} className={styles.assigneeBadge}>
                <User size={12} className={styles.assigneeIcon} />
                <span>{assignee}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
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
  const [activeTab, setActiveTab] = useState("today");
  const [searchQuery, setSearchQuery] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [toggleSidebar, setToggleSidebar] = useState(() => {});
  const [tasks, setTasks] = useState(sampleTasks);
  
  // Use the DarkModeContext
  const { darkMode, toggleDarkMode } = useDarkMode();

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
    setTimeout(() => {
      setRefreshing(false);
    }, 1500);
  };

  // Update task status function
  const updateTaskStatus = (taskId, newStatus) => {
    setTasks(prevTasks => 
      prevTasks.map(task => 
        task.id === taskId ? { ...task, status: newStatus } : task
      )
    );
  };

  // Filter tasks based on selected tab and search query
  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase());
    const dateCategory = getDateCategory(task.dueDate);
    
    return matchesSearch && (activeTab === "all" || dateCategory === activeTab);
  });

  return (
    <Layout>
      <div className={styles.tasksContainer}>
        <div className={styles.tasksContent}>
          {/* Preserved Header component */}
          <Header 
            greeting={"My Tasks"} 
            toggleSidebar={toggleSidebar}
            isMobile={isMobile}
            isRefreshing={refreshing}
          />

          {/* Search Bar */}
          <SearchBar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
          
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

          {/* Tasks List */}
          <div className={styles.tasksGrid}>
            {filteredTasks.length > 0 ? (
              filteredTasks.map(task => (
                <TaskCard 
                  key={task.id} 
                  task={task} 
                  updateTaskStatus={updateTaskStatus}
                />
              ))
            ) : (
              <div className={styles.noTasks}>
                No tasks found for the selected filter.
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default MyTasksPage;