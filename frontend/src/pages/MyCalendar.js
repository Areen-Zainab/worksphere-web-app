import React, { useState, useEffect } from 'react';
import Layout from '../components/ui-essentials/Layout';
import Header from '../components/header';
import { Calendar, ChevronLeft, ChevronRight, List, Grid, Clock, Tag, MoreHorizontal, Filter } from 'lucide-react';
import styles from '../css/mycalendar.module.css';
import { DarkModeProvider, useDarkMode } from '../contexts/DarkModeContext';

const tasksData = [
  { id: 1, title: 'Update marketing presentation', date: '2025-04-28', project: 'Marketing', status: 'In Progress', priority: 'High' },
  { id: 2, title: 'Review website design changes', date: '2025-05-15', project: 'Website Redesign', status: 'To Do', priority: 'Medium' },
  { id: 3, title: 'Team standup meeting', date: '2025-04-26', project: 'Management', status: 'Completed', priority: 'High' },
  { id: 4, title: 'Client feedback integration', date: '2025-05-10', project: 'Mobile App', status: 'In Progress', priority: 'Medium' },
  { id: 5, title: 'Quarterly review preparation', date: '2025-05-05', project: 'Management', status: 'To Do', priority: 'High' },
  { id: 6, title: 'Update API documentation', date: '2025-04-30', project: 'Backend', status: 'In Progress', priority: 'Low' },
  { id: 7, title: 'Product roadmap discussion', date: '2025-05-12', project: 'Product', status: 'To Do', priority: 'Medium' },
  { id: 8, title: 'Debugging user authentication issues', date: '2025-05-20', project: 'Backend', status: 'In Progress', priority: 'High' }
];

// Generate calendar days
const generateCalendarDays = (year, month) => {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  
  const days = [];
  const startingDayOfWeek = firstDay.getDay();
  
  // Add empty slots for days before the 1st of the month
  for (let i = 0; i < startingDayOfWeek; i++) {
    days.push({ day: null, isCurrentMonth: false });
  }
  
  // Add days of the current month
  for (let day = 1; day <= lastDay.getDate(); day++) {
    days.push({ day, isCurrentMonth: true });
  }
  
  return days;
};

// Project color mapping
const projectColors = {
  'Marketing': styles.blue,
  'Website Redesign': styles.green,
  'Management': styles.purple,
  'Mobile App': styles.amber,
  'Backend': styles.red,
  'Product': styles.teal
};

// Status classes
const statusClasses = {
  'To Do': styles.statusToDo,
  'In Progress': styles.statusInProgress,
  'Completed': styles.statusCompleted
};

// Priority indicators
const priorityClasses = {
  'High': styles.priorityHigh,
  'Medium': styles.priorityMedium,
  'Low': styles.priorityLow
};

const CalendarContent = () => {
  // Access dark mode from context
  const { darkMode, toggleDarkMode } = useDarkMode();
  const [viewMode, setViewMode] = useState('calendar'); // 'calendar' or 'list'
  const [currentDate, setCurrentDate] = useState(new Date());
  const [animating, setAnimating] = useState(false);
  const [filterBy, setFilterBy] = useState('all');
  const [isMobile, setIsMobile] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const isSidebarExpanded = localStorage.getItem('sidebarExpanded') !== 'false';
  
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const calendarDays = generateCalendarDays(year, month);
  
  const monthNames = [
    'January', 'February', 'March', 'April', 
    'May', 'June', 'July', 'August', 
    'September', 'October', 'November', 'December'
  ];
  
  const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  
  const handlePrevMonth = () => {
    setAnimating(true);
    setTimeout(() => {
      setCurrentDate(new Date(year, month - 1, 1));
      setAnimating(false);
    }, 300);
  };
  
  const handleNextMonth = () => {
    setAnimating(true);
    setTimeout(() => {
      setCurrentDate(new Date(year, month + 1, 1));
      setAnimating(false);
    }, 300);
  };

  const toggleView = (mode) => {
    setAnimating(true);
    setTimeout(() => {
      setViewMode(mode);
      setAnimating(false);
    }, 300);
  };

  // Filter tasks based on current filter
  const filteredTasks = tasksData.filter(task => {
    if (filterBy === 'all') return true;
    if (filterBy === 'high') return task.priority === 'High';
    if (filterBy === 'inProgress') return task.status === 'In Progress';
    if (filterBy === 'upcoming') {
      const taskDate = new Date(task.date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return taskDate >= today;
    }
    return true;
  });

  // Filter tasks for the current month
  const currentMonthTasks = filteredTasks.filter(task => {
    const taskDate = new Date(task.date);
    return taskDate.getMonth() === month && taskDate.getFullYear() === year;
  });

  // Get tasks for a specific day
  const getTasksForDay = (day) => {
    if (!day) return [];
    const formattedDate = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return filteredTasks.filter(task => task.date === formattedDate);
  };

  // Check if a day is today
  const isToday = (day) => {
    if (!day) return false;
    const today = new Date();
    return day === today.getDate() && month === today.getMonth() && year === today.getFullYear();
  };

  // Sort tasks by date
  const sortedTasks = [...filteredTasks].sort((a, b) => new Date(a.date) - new Date(b.date));
  
  // Group tasks by month for list view
  const groupedTasks = sortedTasks.reduce((acc, task) => {
    const date = new Date(task.date);
    const monthYear = `${monthNames[date.getMonth()]} ${date.getFullYear()}`;
    
    if (!acc[monthYear]) {
      acc[monthYear] = [];
    }
    
    acc[monthYear].push(task);
    return acc;
  }, {});

  // Get formatted date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return `${monthNames[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
  };

  // Get days remaining
  const getDaysRemaining = (dateString) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const targetDate = new Date(dateString);
    const diffTime = targetDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Tomorrow';
    if (diffDays < 0) return `${Math.abs(diffDays)} days ago`;
    return `${diffDays} days remaining`;
  };

  // Get unique projects for filtering
  const projects = [...new Set(tasksData.map(task => task.project))];

  return (
    <div className={`${styles.taskCalendar} ${darkMode ? styles.darkMode : ''}`}>
      <Header 
        greeting={"My Calendar"} 
      />
      
      <div className={styles.calendarHeader}>
        <div className={styles.calendarTitle}>
          <Calendar size={24} className={styles.calendarIcon} />
          <h1>Task Calendar</h1>
        </div>
        <div className={styles.headerControls}>
          <div className={styles.filterDropdown}>
            <button className={styles.filterButton}>
              <Filter size={16} />
              <span>Filter</span>
            </button>
            <div className={styles.filterMenu}>
              <div className={styles.filterOption} onClick={() => setFilterBy('all')}>
                <span className={filterBy === 'all' ? styles.activeFilter : ''}>All Tasks</span>
              </div>
              <div className={styles.filterOption} onClick={() => setFilterBy('high')}>
                <span className={filterBy === 'high' ? styles.activeFilter : ''}>High Priority</span>
              </div>
              <div className={styles.filterOption} onClick={() => setFilterBy('inProgress')}>
                <span className={filterBy === 'inProgress' ? styles.activeFilter : ''}>In Progress</span>
              </div>
              <div className={styles.filterOption} onClick={() => setFilterBy('upcoming')}>
                <span className={filterBy === 'upcoming' ? styles.activeFilter : ''}>Upcoming</span>
              </div>
            </div>
          </div>
          <div className={styles.viewToggle}>
            <button 
              onClick={() => toggleView('calendar')} 
              className={`${styles.toggleBtn} ${viewMode === 'calendar' ? styles.active : ''}`}
              aria-label="Calendar View"
            >
              <Grid size={20} />
              <span>Calendar</span>
            </button>
            <button 
              onClick={() => toggleView('list')} 
              className={`${styles.toggleBtn} ${viewMode === 'list' ? styles.active : ''}`}
              aria-label="List View"
            >
              <List size={20} />
              <span>List</span>
            </button>
          </div>
        </div>
      </div>

      <div className={`${styles.calendarContent} ${animating ? styles.fadeOut : styles.fadeIn}`}>
        {viewMode === 'calendar' ? (
          <div className={styles.calendarView}>
            <div className={styles.monthNavigation}>
              <button onClick={handlePrevMonth} className={styles.navBtn} aria-label="Previous Month">
                <ChevronLeft size={20} />
              </button>
              <h2 className={styles.monthTitle}>{monthNames[month]} {year}</h2>
              <button onClick={handleNextMonth} className={styles.navBtn} aria-label="Next Month">
                <ChevronRight size={20} />
              </button>
            </div>

            <div className={styles.calendarGrid}>
              <div className={styles.weekdayHeaders}>
                {weekdays.map(day => (
                  <div key={day} className={styles.weekday}>
                    {day}
                  </div>
                ))}
              </div>

              <div className={styles.calendarDays}>
                {calendarDays.map((day, index) => {
                  const dayTasks = day.day ? getTasksForDay(day.day) : [];
                  const isTodayClass = isToday(day.day) ? styles.isToday : '';
                  
                  return (
                    <div 
                      key={index} 
                      className={`${styles.calendarDay} ${!day.isCurrentMonth ? styles.otherMonth : ''} ${isTodayClass}`}
                    >
                      {day.day && (
                        <>
                          <span className={styles.dayNumber}>{day.day}</span>
                          <div className={styles.dayTasks}>
                            {dayTasks.map(task => (
                              <div 
                                key={task.id} 
                                className={`${styles.taskItem} ${projectColors[task.project]} ${statusClasses[task.status]}`}
                                title={task.title}
                              >
                                <span className={styles.taskTitle}>{task.title}</span>
                                <div className={styles.taskMeta}>
                                  <span className={styles.taskProject}>{task.project}</span>
                                  <span className={`${styles.taskPriority} ${priorityClasses[task.priority]}`}></span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ) : (
          <div className={styles.listView}>
            <div className={styles.listHeader}>
              <h2>All Tasks</h2>
            </div>
            
            <div className={styles.tasksList}>
              {Object.entries(groupedTasks).length > 0 ? (
                Object.entries(groupedTasks).map(([monthYear, tasks]) => (
                  <div key={monthYear} className={styles.monthGroup}>
                    <h3 className={styles.monthHeading}>{monthYear}</h3>
                    <div className={styles.monthItems}>
                      {tasks.map(task => {
                        const taskDate = new Date(task.date);
                        return (
                          <div key={task.id} className={styles.taskListItem}>
                            <div className={`${styles.taskDate} ${projectColors[task.project]}`}>
                              <span className={styles.dateDay}>{taskDate.getDate()}</span>
                              <span className={styles.dateMonth}>{monthNames[taskDate.getMonth()].substring(0, 3)}</span>
                            </div>
                            <div className={styles.taskDetails}>
                              <h4 className={styles.taskTitle}>{task.title}</h4>
                              <div className={styles.taskMeta}>
                                <span className={styles.taskProject}>
                                  <Tag size={14} />
                                  {task.project}
                                </span>
                                <span className={styles.taskStatus}>
                                  <span className={`${styles.statusDot} ${statusClasses[task.status]}`}></span>
                                  {task.status}
                                </span>
                                <span className={styles.taskCountdown}>
                                  <Clock size={14} />
                                  {getDaysRemaining(task.date)}
                                </span>
                              </div>
                            </div>
                            <div className={`${styles.taskPriorityFlag} ${priorityClasses[task.priority]}`}>
                              {task.priority}
                            </div>
                            <button className={styles.taskMoreBtn}>
                              <MoreHorizontal size={18} />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))
              ) : (
                <div className={styles.noTasks}>
                  <p>No tasks match your current filter.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Monthly Overview Section */}
      <div className={styles.monthlySummary}>
        <h2>This Month's Tasks</h2>
        {currentMonthTasks.length > 0 ? (
          <div className={styles.summaryList}>
            {currentMonthTasks.map(task => (
              <div key={task.id} className={styles.summaryItem}>
                <div className={`${styles.summaryIndicator} ${projectColors[task.project]}`}></div>
                <div className={styles.summaryContent}>
                  <div className={styles.summaryTitle}>{task.title}</div>
                  <div className={styles.summaryDetails}>
                    <span className={styles.summaryProject}>{task.project}</span>
                    <span className={styles.summaryDate}>{formatDate(task.date)}</span>
                  </div>
                </div>
                <div className={styles.summaryStatus}>
                  <span className={`${styles.statusBadge} ${getDaysRemaining(task.date) === 'Today' ? styles.urgent : ''}`}>
                    {getDaysRemaining(task.date)}
                  </span>
                </div>
                <div className={`${styles.summaryPriority} ${priorityClasses[task.priority]}`}>
                  {task.priority}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className={styles.noTasks}>No tasks for this month match your filter.</p>
        )}
      </div>
    </div>
  );
};

// Wrap the main component with DarkModeProvider
const MyCalendar = () => {
  return (
    <Layout>
      <DarkModeProvider>
        <CalendarContent />
      </DarkModeProvider>
    </Layout>
  );
};

export default MyCalendar;