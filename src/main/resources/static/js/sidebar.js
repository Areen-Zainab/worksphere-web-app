document.addEventListener("DOMContentLoaded", function () {
    fetch("sidebar.html")
        .then(response => response.text())
        .then(data => {
            document.getElementById("sidebar-container").innerHTML = data;
            initializeSidebar();
            highlightActiveButton();
        })
        .catch(error => console.error("Error loading sidebar:", error));
});

function initializeSidebar() {
    setUpUserName();
    setupSidebarProfilePicture();

    setupDashboardButton();
    setupTasksButton();
    setupCalendarButton();
    setupInboxButton();
    setupProfileButton();
    setupLogoutButton();
    
    // Setup projects functionality
    setupExistingProjectButtons();
    setupAddProjectButton();

    // Menu toggle functionality
    sidebartoggling();
}

function highlightActiveButton() {
    const currentPage = window.location.pathname.split("/").pop().replace(".html", ""); // Get current page filename without ".html"

    const sidebarButtons = {
        "dashboard": "dashboard-btn",
        "mytasks": "tasks-btn",
        "calendar": "calendar-btn",
        "inbox": "inbox-btn",
        "profile": "profile-btn"
    };

    // Remove 'current-btn' from all buttons
    document.querySelectorAll(".sidebar-nav button").forEach(button => {
        button.classList.remove("current-btn");
    });

    // Add 'current-btn' to the matching button
    if (sidebarButtons[currentPage]) {
        document.getElementById(sidebarButtons[currentPage]).classList.add("current-btn");
    }
}

function capitalize(name) {
    return name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
}

function setUpUserName(){
    let firstName = localStorage.getItem("UserFName") || "";
    let lastName = localStorage.getItem("UserLName") || "";

    firstName = capitalize(firstName);
    lastName = capitalize(lastName);

    let fullName = firstName + " " + lastName;
    let naam = document.querySelector(".user-name"); 
    if (naam) {
        naam.textContent = fullName; 
    }
}

async function setupSidebarProfilePicture() {
    const userId = localStorage.getItem("loggedInUserID") || "";
    const API_URL = "http://localhost:8080/api/users";
    const sidebarPfp = document.getElementById("sidebar-pfp");

    if (!userId) {
        console.error("User ID not found. Sidebar PFP update skipped.");
        return;
    }

    try {
        const response = await fetch(`${API_URL}/${userId}`);
        if (!response.ok) throw new Error("Failed to fetch user data");

        const userData = await response.json();
        const profilePicPath = userData.profilePicture; // Assuming this field stores the image path

        sidebarPfp.src = profilePicPath ? profilePicPath : "./images/my-pfp.jpg"; // Update profile picture
    } catch (error) {
        console.error("Error fetching sidebar profile picture:", error);
        sidebarPfp.src = "./images/my-pfp.jpg"; // Fallback to default on error
    }
}


function setupDashboardButton() {
    const dashboardBtn = document.getElementById("dashboard-btn");
    if (dashboardBtn) {
        dashboardBtn.addEventListener("click", function() {
            window.location.href = "dashboard.html";
        });
    }
}

function setupTasksButton() {
    const tasksBtn = document.getElementById("tasks-btn");
    if (tasksBtn) {
        tasksBtn.addEventListener("click", function() {
            window.location.href = "mytasks.html";
        });
    }
}

function setupCalendarButton() {
    const calendarBtn = document.getElementById("calendar-btn");
    if (calendarBtn) {
        calendarBtn.addEventListener("click", function() {
            window.location.href = "calendar.html";
        });
    }
}

function setupInboxButton() {
    const inboxBtn = document.getElementById("inbox-btn");
    if (inboxBtn) {
        inboxBtn.addEventListener("click", function() {
            window.location.href = "inbox.html";
        });
    }
}

function setupProfileButton() {
    const profileBtn = document.getElementById("profile-btn");
    const pfpBtn = document.getElementById("sidebar-pfp");
    if (profileBtn) {
        profileBtn.addEventListener("click", function() {
            window.location.href = "profile.html";
        });
    }
    if (pfpBtn) {
        pfpBtn.addEventListener("click", function() {
            window.location.href = "profile.html";
        });
    }
}

function setupLogoutButton() {
    const logoutBtn = document.getElementById("logout-btn");
    if (logoutBtn) {
        logoutBtn.addEventListener("click", function() {
            localStorage.removeItem("loggedInUser");
            window.location.href = "login.html";
        });
    }
}

function setupExistingProjectButtons() {
    const projectButtons = document.querySelectorAll(".project-btn");
    
    projectButtons.forEach((button) => {
        button.addEventListener("click", function() {
            const projectId = button.getAttribute("data-project-id");
            window.location.href = `project.html?id=${projectId}`;
        });
    });
}

function setupAddProjectButton() {
    const addButton = document.getElementById("add-project");
    if (addButton) {
        addButton.addEventListener("click", function() {
            addNewProject();
        });
    }
}

function addNewProject() {
    const projectList = document.getElementById("projects-list");
    if (projectList) {
        
    }
}

function sidebartoggling() {
    const sidebarToggle = document.getElementById('sidebar-toggle');
    const sidebar = document.getElementById('sidebar');
    const btnTexts = document.querySelectorAll('.btn-text');
    const icon = document.querySelector('.toggle-icon');
 
    // Check if sidebar state is stored in localStorage
    const sidebarCollapsed = localStorage.getItem('sidebarCollapsed') === 'true';
    
    // Initialize sidebar state based on localStorage or default to expanded
    if (sidebarCollapsed) {
        sidebar.classList.add('collapsed');
        toggleTextElements(false);
    }
    
    // Toggle sidebar on button click
    sidebarToggle.addEventListener('click', function() {
        const isCollapsed = sidebar.classList.toggle('collapsed');
        if (icon.innerHTML === 'chevron_left') {
            icon.innerHTML = 'chevron_right';
        } else {
            icon.innerHTML = 'chevron_left'; 
        }
        // Store sidebar state in localStorage
        localStorage.setItem('sidebarCollapsed', isCollapsed);
        toggleTextElements(!isCollapsed);
    });
    
    // Function to toggle text elements visibility
    function toggleTextElements(show) {
        btnTexts.forEach(function(textElement) {
            textElement.style.display = show ? 'inline' : 'none';
        });
    } 
}