import React, { useContext, useMemo } from 'react';
import ProjectContext from '../../contexts/ProjectContext';
import styles from '../../css/project/project-analytics.module.css';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, 
         PieChart, Pie, Cell, LineChart, Line } from 'recharts';

const AnalyticsTab = () => {
  const { project, members } = useContext(ProjectContext);
  
  // Get all tasks from all boards
  const allTasks = useMemo(() => {
    return project.boards.flatMap(board => 
      board.tasks.map(task => ({
        ...task,
        status: board.title // Add status based on board title
      }))
    );
  }, [project]);
  
  // Task distribution by status
  const tasksByStatus = useMemo(() => {
    const statusCounts = {};
    
    project.boards.forEach(board => {
      statusCounts[board.title] = board.tasks.length;
    });
    
    return Object.entries(statusCounts).map(([status, count]) => ({
      name: status,
      value: count
    }));
  }, [project]);
  
  // Task distribution by priority
  const tasksByPriority = useMemo(() => {
    const priorities = { High: 0, Medium: 0, Low: 0 };
    
    allTasks.forEach(task => {
      if (task.priority) {
        // Use default priority if not specified
        priorities[task.priority] = (priorities[task.priority] || 0) + 1;
      } else {
        priorities['Medium'] = (priorities['Medium'] || 0) + 1;
      }
    });
    
    return Object.entries(priorities).map(([priority, count]) => ({
      name: priority,
      value: count
    }));
  }, [allTasks]);
  
  // Task distribution by assignee
  const tasksByAssignee = useMemo(() => {
    const assigneeCounts = {};
    
    // Count tasks per assignee - handle assignedTo as a single user object
    allTasks.forEach(task => {
      if (task.assignedTo && task.assignedTo.id) {
        const userId = task.assignedTo.id.toString();
        if (!assigneeCounts[userId]) {
          assigneeCounts[userId] = {
            id: userId,
            name: `${task.assignedTo.firstName} ${task.assignedTo.lastName || ''}`.trim(),
            count: 0
          };
        }
        assigneeCounts[userId].count++;
      }
    });
    
    return Object.values(assigneeCounts)
      .map(user => ({
        name: user.name || 'Unassigned',
        value: user.count
      }))
      .sort((a, b) => b.value - a.value);
  }, [allTasks]);
  
  // Tasks by due date (for timeline chart)
  const tasksByDueDate = useMemo(() => {
    const dueDataMap = {};
    
    // Get tasks with deadlines
    const tasksWithDeadlines = allTasks.filter(task => task.deadline);
    
    // Group by date
    tasksWithDeadlines.forEach(task => {
      const deadline = task.deadline.split('T')[0]; // Just get the date part
      
      if (!dueDataMap[deadline]) {
        dueDataMap[deadline] = {
          date: deadline,
          count: 0,
          high: 0,
          medium: 0,
          low: 0
        };
      }
      
      dueDataMap[deadline].count++;
      
      // Handle case when priority might be undefined
      const priority = task.priority ? task.priority.toLowerCase() : 'medium';
      dueDataMap[deadline][priority]++;
    });
    
    // Convert to array and sort by date
    return Object.values(dueDataMap).sort((a, b) => 
      new Date(a.date) - new Date(b.date)
    );
  }, [allTasks]);
  
  // Calculate completion rate
  const completionRate = useMemo(() => {
    const completedTasks = project.boards.find(board => 
      board.title.toUpperCase() === "DONE")?.tasks.length || 0;
    const totalTasks = allTasks.length;
    
    return totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  }, [project, allTasks]);
  
  // Colors for charts
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#A28BFC', '#FF6B6B', '#4ECDC4'];
  
  // Priority colors
  const PRIORITY_COLORS = {
    High: '#FF6B6B',
    Medium: '#FFC43D',
    Low: '#4ECDC4'
  };

  return (
    <div className={styles.analyticsContainer}>
      <div className={styles.analyticsHeader}>
        <h2 className={styles.analyticsTitle}>Project Analytics</h2>
        <div className={styles.completionRateCard}>
          <div className={styles.completionRate}>{completionRate}%</div>
          <div className={styles.completionLabel}>Overall Completion</div>
        </div>
      </div>
      
      <div className={styles.chartsGrid}>
        {/* Task Status Distribution Chart */}
        <div className={styles.chartCard}>
          <h3 className={styles.chartTitle}>Tasks by Status</h3>
          <div className={styles.chartContainer}>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={tasksByStatus}
                  cx="50%"
                  cy="50%"
                  labelLine={true}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                  nameKey="name"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {tasksByStatus.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`${value} tasks`, 'Count']} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        {/* Task Priority Distribution Chart */}
        <div className={styles.chartCard}>
          <h3 className={styles.chartTitle}>Tasks by Priority</h3>
          <div className={styles.chartContainer}>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={tasksByPriority}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value) => [`${value} tasks`, 'Count']} />
                <Bar dataKey="value" name="Tasks">
                  {tasksByPriority.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={PRIORITY_COLORS[entry.name] || COLORS[index % COLORS.length]} 
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        {/* Task Distribution by Team Member */}
        <div className={styles.chartCard}>
          <h3 className={styles.chartTitle}>Workload by Team Member</h3>
          <div className={styles.chartContainer}>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={tasksByAssignee}
                layout="vertical"
                margin={{ top: 20, right: 30, left: 100, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis type="category" dataKey="name" width={80} />
                <Tooltip formatter={(value) => [`${value} tasks`, 'Assigned']} />
                <Bar dataKey="value" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        {/* Timeline of Tasks */}
        <div className={styles.chartCard}>
          <h3 className={styles.chartTitle}>Timeline of Due Dates</h3>
          <div className={styles.chartContainer}>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart
                data={tasksByDueDate}
                margin={{ top: 20, right: 30, left: 20, bottom: 30 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date" 
                  angle={-45} 
                  textAnchor="end"
                  tickFormatter={(value) => {
                    const date = new Date(value);
                    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                  }}
                />
                <YAxis />
                <Tooltip 
                  formatter={(value, name) => [value, name.charAt(0).toUpperCase() + name.slice(1)]}
                  labelFormatter={(label) => {
                    const date = new Date(label);
                    return date.toLocaleDateString('en-US', { 
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    });
                  }}
                />
                <Legend />
                <Line type="monotone" dataKey="high" stroke={PRIORITY_COLORS.High} name="High Priority" />
                <Line type="monotone" dataKey="medium" stroke={PRIORITY_COLORS.Medium} name="Medium Priority" />
                <Line type="monotone" dataKey="low" stroke={PRIORITY_COLORS.Low} name="Low Priority" />
                <Line type="monotone" dataKey="count" stroke="#8884d8" name="Total Tasks" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
      
      {/* Project Stats Summary */}
      <div className={styles.statsSummary}>
        <div className={styles.statCard}>
          <span className={styles.statNumber}>{allTasks.length}</span>
          <span className={styles.statLabel}>Total Tasks</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statNumber}>
            {allTasks.filter(task => task.priority === "High").length}
          </span>
          <span className={styles.statLabel}>High Priority</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statNumber}>
            {project.boards.find(board => 
              board.title.toUpperCase() === "DONE")?.tasks.length || 0}
          </span>
          <span className={styles.statLabel}>Completed</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statNumber}>
            {project.boards.find(board => 
              board.title.toUpperCase() === "IN PROGRESS")?.tasks.length || 0}
          </span>
          <span className={styles.statLabel}>In Progress</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statNumber}>
            {allTasks.filter(task => {
              if (!task.deadline) return false;
              const deadline = new Date(task.deadline);
              const today = new Date();
              return deadline < today && task.status.toUpperCase() !== "DONE";
            }).length}
          </span>
          <span className={styles.statLabel}>Overdue</span>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsTab;