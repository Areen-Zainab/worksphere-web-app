import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Calendar, ChevronLeft, ChevronRight, X, Clock, AlertCircle } from 'lucide-react';
import styles from '../../css/dashboard/MiniCalendarView.module.css';
import { useDarkMode } from '../../contexts/DarkModeContext';

const MiniCalendar = ({ onSelectDate }) => {
  const { darkMode } = useDarkMode();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [calendarDays, setCalendarDays] = useState([]);
  const [showPopup, setShowPopup] = useState(false);
  const [tasksForSelectedDate, setTasksForSelectedDate] = useState([]);
  const [taskDetails, setTaskDetails] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [allTasks, setAllTasks] = useState([]);
  const [loadingTaskDetails, setLoadingTaskDetails] = useState(false);
  
  // Fetch all tasks from the backend API
  useEffect(() => {
    const fetchAllTasks = async () => {
      try {
        setLoading(true);
        const userId = localStorage.getItem("loggedInUserID");
        
        if (!userId) {
          throw new Error("User ID not found");
        }
        
        // Get tasks with deadlines
        const response = await axios.get(`http://localhost:8080/api/tasks/my-tasks`, {
          params: {
            userId: userId
          }
        });
        
        // Filter to only include tasks with deadlines
        const tasksWithDeadlines = response.data.filter(task => task.deadline);
        
        setAllTasks(tasksWithDeadlines);
        setError(null);
      } catch (err) {
        console.error('Error fetching tasks:', err);
        setError('Failed to load tasks. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchAllTasks();
  }, []);

  // Generate calendar days for current month
  useEffect(() => {
    const generateCalendarDays = () => {
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth();
      
      // Get first day of the month
      const firstDay = new Date(year, month, 1).getDay();
      
      // Get number of days in current month
      const daysInMonth = new Date(year, month + 1, 0).getDate();
      
      // Generate array of days
      const days = [];
      
      // Add empty slots for days before start of month
      for (let i = 0; i < firstDay; i++) {
        days.push({ day: '', isCurrentMonth: false, date: null });
      }
      
      // Add days of current month
      for (let i = 1; i <= daysInMonth; i++) {
        const date = new Date(year, month, i);
        const isToday = isSameDay(date, new Date());
        const isSelected = isSameDay(date, selectedDate);
        
        // Check if there are tasks for this day
        const tasksForDay = allTasks.filter(task => {
          const taskDate = task.deadline ? new Date(task.deadline) : null;
          return taskDate && isSameDay(taskDate, date);
        });
        
        // Check if any tasks are overdue
        const hasOverdueTasks = tasksForDay.some(task => {
          const taskDate = new Date(task.deadline);
          const currentDate = new Date();
          return taskDate < currentDate && task.status !== 'COMPLETED';
        });
        
        days.push({
          day: i,
          isCurrentMonth: true,
          isToday,
          isSelected,
          hasTask: tasksForDay.length > 0,
          hasOverdueTask: hasOverdueTasks,
          taskCount: tasksForDay.length,
          date
        });
      }
      
      setCalendarDays(days);
    };
    
    generateCalendarDays();
  }, [currentDate, selectedDate, allTasks]);
  
  // Helper to check if two dates are the same day
  const isSameDay = (date1, date2) => {
    if (!date1 || !date2) return false;
    
    return (
      date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getDate() === date2.getDate()
    );
  };
  
  // Fetch task details by ID
  const fetchTaskDetails = async (taskId) => {
    try {
      setLoadingTaskDetails(true);
      const userId = localStorage.getItem("loggedInUserID");
      
      if (!userId) {
        throw new Error("User ID not found");
      }
      
      const response = await axios.get(`http://localhost:8080/api/tasks/${taskId}`, {
        params: {
          userId: userId
        }
      });
      
      return response.data;
    } catch (err) {
      console.error(`Error fetching task details for task ${taskId}:`, err);
      return null;
    } finally {
      setLoadingTaskDetails(false);
    }
  };
  
  // Month navigation
  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };
  
  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };
  
  // Get tasks for selected date and fetch details for each
  const showTasksForDate = async (date) => {
    if (!date) return;
    
    const filteredTasks = allTasks.filter(task => {
      const taskDate = task.deadline ? new Date(task.deadline) : null;
      return taskDate && isSameDay(taskDate, date);
    });
    
    setTasksForSelectedDate(filteredTasks);
    
    // Fetch details for each task
    const detailsMap = {};
    
    for (const task of filteredTasks) {
      const details = await fetchTaskDetails(task.id);
      if (details) {
        detailsMap[task.id] = details;
      }
    }
    
    setTaskDetails(detailsMap);
    setShowPopup(true);
  };
  
  // Handle date selection
  const handleDateClick = (day) => {
    if (day.isCurrentMonth && day.date) {
      setSelectedDate(day.date);
      showTasksForDate(day.date);
      
      if (onSelectDate) {
        onSelectDate(day.date);
      }
    }
  };
  
  // Format dates for display
  const formatMonthYear = (date) => {
    return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  };
  
  const formatFullDate = (date) => {
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric' 
    });
  };
  
  // Format task deadline
  const formatDeadline = (deadline) => {
    if (!deadline) return 'No deadline';
    
    const deadlineDate = new Date(deadline);
    const now = new Date();
    
    // Check if the task is overdue
    const isOverdue = deadlineDate < now && deadlineDate.getDate() !== now.getDate();
    
    // Check if it's today
    if (isSameDay(deadlineDate, now)) {
      const hours = deadlineDate.getHours();
      const minutes = deadlineDate.getMinutes();
      const formattedTime = `${hours % 12 || 12}:${minutes.toString().padStart(2, '0')} ${hours >= 12 ? 'PM' : 'AM'}`;
      return `Today at ${formattedTime}`;
    }
    
    // Check if it's tomorrow
    const tomorrow = new Date(now);
    tomorrow.setDate(now.getDate() + 1);
    if (isSameDay(deadlineDate, tomorrow)) {
      return 'Tomorrow';
    }
    
    // For overdue tasks
    if (isOverdue) {
      const diffTime = Math.abs(now - deadlineDate);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return `${diffDays} ${diffDays === 1 ? 'day' : 'days'} overdue`;
    }
    
    // For future dates
    return deadlineDate.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };
  
  // Get color based on task status
  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'not_started':
        return '#6366F1'; // indigo
      case 'in_progress':
        return '#3B82F6'; // blue
      case 'completed':
        return '#10B981'; // green
      case 'on_hold':
        return '#F59E0B'; // amber
      case 'cancelled':
        return '#9CA3AF'; // gray
      default:
        return '#6B7280'; // gray
    }
  };
  
  // Format status label
  const formatStatusLabel = (status) => {
    if (!status) return '';
    return status
      .toLowerCase()
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };
  
  // Get priority class
  const getPriorityClass = (priority) => {
    switch (priority) {
      case 'HIGH':
        return styles.priorityHigh;
      case 'MEDIUM':
        return styles.priorityMedium;
      case 'LOW':
        return styles.priorityLow;
      default:
        return '';
    }
  };
  
  // Days of week abbreviated
  const daysOfWeek = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
  
  return (
    <div className={`${styles.calendarWrapper} ${darkMode ? styles.darkMode : ''}`}>
      {/* Mini Calendar Container */}
      <div className={styles.calendarContainer}>
        {/* Calendar Header */}
        <div className={styles.calendarHeader}>
          <button 
            className={styles.navButton}
            onClick={goToPreviousMonth}
            aria-label="Previous month"
          >
            <ChevronLeft size={16} />
          </button>
          
          <div className={styles.currentMonth}>
            <Calendar size={14} className={styles.calendarIcon} />
            {formatMonthYear(currentDate)}
          </div>
          
          <button 
            className={styles.navButton}
            onClick={goToNextMonth}
            aria-label="Next month"
          >
            <ChevronRight size={16} />
          </button>
        </div>
        
        {/* Loading and Error States */}
        {loading && (
          <div className={styles.loadingState}>
            <p>Loading calendar...</p>
          </div>
        )}
        
        {error && (
          <div className={styles.errorState}>
            <p>{error}</p>
          </div>
        )}
        
        {/* Calendar Grid */}
        {!loading && !error && (
          <div className={styles.calendarGrid}>
            {/* Weekday Headers */}
            {daysOfWeek.map((day, index) => (
              <div 
                key={`header-${index}`}
                className={styles.weekdayHeader}
              >
                {day}
              </div>
            ))}
            
            {/* Calendar Days */}
            {calendarDays.map((day, index) => {
              const dayClasses = [styles.calendarDay];
              
              if (!day.isCurrentMonth) dayClasses.push(styles.otherMonth);
              if (day.isToday) dayClasses.push(styles.today);
              if (day.isSelected) dayClasses.push(styles.selected);
              if (day.hasTask) dayClasses.push(styles.hasTask);
              if (day.hasOverdueTask) dayClasses.push(styles.hasOverdueTask);
              
              return (
                <div
                  key={`day-${index}`}
                  className={dayClasses.join(' ')}
                  onClick={() => day.isCurrentMonth && day.date && handleDateClick(day)}
                >
                  {day.day}
                  {day.hasTask && (
                    <span className={`${styles.taskIndicator} ${day.hasOverdueTask ? styles.overdueIndicator : ''}`}>
                      {day.taskCount > 1 && day.taskCount}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
      
      {/* Task Popup */}
      {showPopup && (
        <div className={styles.taskPopup}>
          {/* Popup Header */}
          <div className={styles.popupHeader}>
            <h4>{formatFullDate(selectedDate)}</h4>
            <button 
              className={styles.closeButton}
              onClick={() => setShowPopup(false)}
              aria-label="Close task popup"
            >
              <X size={16} />
            </button>
          </div>
          
          {/* Popup Content */}
          <div className={styles.popupContent}>
            {loadingTaskDetails ? (
              <div className={styles.loadingTaskDetails}>
                <p>Loading task details...</p>
              </div>
            ) : tasksForSelectedDate.length > 0 ? (
              <div className={styles.taskList}>
                {tasksForSelectedDate.map((task) => {
                  const isOverdue = new Date(task.deadline) < new Date() && task.status !== 'COMPLETED';
                  
                  return (
                    <div 
                      key={task.id} 
                      className={`${styles.taskItem} ${isOverdue ? styles.overdueTask : ''}`}
                    >
                      <div className={styles.taskHeader}>
                        <div className={styles.taskTitle}>
                          {task.title}
                        </div>
                        <span 
                          className={styles.statusIndicator}
                          style={{
                            backgroundColor: `${getStatusColor(task.status)}20`,
                            color: getStatusColor(task.status),
                            padding: '2px 6px',
                            borderRadius: '4px',
                            fontSize: '0.7rem',
                            fontWeight: '500'
                          }}
                        >
                          {formatStatusLabel(task.status)}
                        </span>
                      </div>
                      
                      {task.description && (
                        <div className={styles.taskDescription}>
                          {task.description}
                        </div>
                      )}
                      
                      <div className={styles.taskMeta}>
                        {task.deadline && (
                          <div className={`${styles.taskDeadline} ${isOverdue ? styles.overdueDeadline : ''}`}>
                            <Clock size={14} />
                            <span>{formatDeadline(task.deadline)}</span>
                            {isOverdue && <AlertCircle size={14} className={styles.overdueIcon} />}
                          </div>
                        )}
                        
                        {task.priority && (
                          <span className={`${styles.taskPriority} ${getPriorityClass(task.priority)}`}>
                            {task.priority}
                          </span>
                        )}
                      </div>
                      
                      <a 
                        href={`/tasks/${task.id}`} 
                        className={styles.viewTaskLink}
                      >
                        View Task
                      </a>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className={styles.noTasksMessage}>
                No tasks due on this date
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default MiniCalendar;