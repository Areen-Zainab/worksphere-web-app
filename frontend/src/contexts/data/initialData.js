// Initial project data structure
export const initialProjectData = {
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
  };
  
  // Initial members data
  export const initialMembers = [
    { id: "user-1", name: "Emma Wilson", avatar: "/api/placeholder/40/40", role: "Lead Designer" },
    { id: "user-2", name: "Alex Chen", avatar: "/api/placeholder/40/40", role: "Content Strategist" },
    { id: "user-3", name: "Maya Patel", avatar: "/api/placeholder/40/40", role: "UI Designer" },
    { id: "user-4", name: "James Walker", avatar: "/api/placeholder/40/40", role: "SEO Specialist" },
    { id: "user-5", name: "Sarah Johnson", avatar: "/api/placeholder/40/40", role: "Project Manager" }
  ];