import React, { useState, useEffect } from 'react';
import { Calendar, ChevronLeft, ChevronRight, X } from 'lucide-react';
import styles from '../../css/dashboard/MiniCalendarView.module.css';
import { useDarkMode } from '../../contexts/DarkModeContext';

const MiniCalendar = ({ tasks = [], onSelectDate }) => {
  const { darkMode } = useDarkMode();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [calendarDays, setCalendarDays] = useState([]);
  const [showPopup, setShowPopup] = useState(false);
  const [tasksForSelectedDate, setTasksForSelectedDate] = useState([]);
  
  // Sample tasks data if none provided
  const defaultTasks = [
    { 
      id: 1, 
      title: 'Project Meeting', 
      description: 'Discuss quarterly goals', 
      priority: 'high',
      dueDate: new Date(2025, 3, 29) 
    },
    { 
      id: 2, 
      title: 'Submit Report', 
      description: 'Complete monthly analytics', 
      priority: 'medium',
      dueDate: new Date(2025, 3, 30) 
    },
    { 
      id: 3, 
      title: 'Review Pull Request', 
      priority: 'low',
      dueDate: new Date(2025, 3, 30) 
    }
  ];
  
  const taskData = tasks.length > 0 ? tasks : defaultTasks;
  
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
        const hasTask = taskData?.some(task => {
          const taskDate = new Date(task.dueDate);
          return isSameDay(taskDate, date);
        });
        
        days.push({
          day: i,
          isCurrentMonth: true,
          isToday,
          isSelected,
          hasTask,
          date
        });
      }
      
      setCalendarDays(days.slice(0, 35)); // Limit to 5 weeks max
    };
    
    generateCalendarDays();
  }, [currentDate, selectedDate, taskData]);
  
  // Helper to check if two dates are the same day
  const isSameDay = (date1, date2) => {
    return date1 && date2 && 
      date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getDate() === date2.getDate();
  };
  
  // Month navigation
  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };
  
  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };
  
  // Show tasks for selected date
  const showTasksForDate = (date) => {
    if (!date) return;
    
    const filteredTasks = taskData.filter(task => {
      const taskDate = new Date(task.dueDate);
      return isSameDay(taskDate, date);
    });
    
    setTasksForSelectedDate(filteredTasks);
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
  
  // Format date for display
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
        
        {/* Calendar Grid */}
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
            
            return (
              <div
                key={`day-${index}`}
                className={dayClasses.join(' ')}
                onClick={() => handleDateClick(day)}
              >
                {day.day}
                {day.hasTask && <span className={styles.taskIndicator}></span>}
              </div>
            );
          })}
        </div>
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
            {tasksForSelectedDate.length > 0 ? (
              <div className={styles.taskList}>
                {tasksForSelectedDate.map((task, index) => (
                  <div 
                    key={`task-${index}`} 
                    className={styles.taskItem}
                  >
                    <div className={styles.taskTitle}>
                      {task.title}
                    </div>
                    {task.description && (
                      <div className={styles.taskDescription}>
                        {task.description}
                      </div>
                    )}
                    {task.priority && (
                      <span className={`${styles.taskPriority} ${styles[`priority-${task.priority}`]}`}>
                        {task.priority}
                      </span>
                    )}
                  </div>
                ))}
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