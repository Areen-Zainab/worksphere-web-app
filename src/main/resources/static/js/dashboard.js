document.addEventListener("DOMContentLoaded", function () {
    const userId = localStorage.getItem("loggedInUserID") || "";
    const userEmail = localStorage.getItem("loggedInUser") || "";

    if (!userId) {
        showToast("error", "Error", "User not found!\nRedirecting to login.");
        setTimeout(() => {
            // window.location.href = "login.html";
        }, 2000);
        return;
    }

    const API_URL = "http://localhost:8080/api/users"; 

    setUpUserName();
    initializeFocusTimer();
    initializeCheckboxes();
    initializeCalendar();
});

function capitalize(name) {
    return name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
}

function setUpUserName(){
    let firstName = localStorage.getItem("UserFName") || "";
    let lastName = localStorage.getItem("UserLName") || "";

    firstName = capitalize(firstName);
    lastName = capitalize(lastName);

    let fullName = "Welcome Back, " + firstName + " " + lastName;
    let naam = document.getElementById("dash-message"); 
    if (naam) {
        naam.textContent = fullName; 
    }
}
  
// ====== Focus Timer Functions ======
function initializeFocusTimer() {
    let timerMinutes = 30;
    let timerRunning = false;
    let timerInterval = null;
    let remainingSeconds = timerMinutes * 60;

    const timerValue = document.querySelector('.timer-value');
    const decreaseBtn = document.querySelector('.timer-display .timer-btn:first-child');
    const increaseBtn = document.querySelector('.timer-display .timer-btn:last-child');
    const startBtn = document.querySelector('.start-btn');
    const startBtnIcon = startBtn.querySelector('i');
    const startBtnText = startBtn.querySelector('span');

    // Event listeners for timer controls
    decreaseBtn.addEventListener('click', () => {
        if (!timerRunning && timerMinutes > 5) {
        timerMinutes -= 5;
        remainingSeconds = timerMinutes * 60;
        updateTimerDisplay();
        }
    });

    increaseBtn.addEventListener('click', () => {
        if (!timerRunning && timerMinutes < 60) {
        timerMinutes += 5;
        remainingSeconds = timerMinutes * 60;
        updateTimerDisplay();
        }
    });

    startBtn.addEventListener('click', toggleTimer);

    function toggleTimer() {
        if (timerRunning) {
        // Stop timer
        clearInterval(timerInterval);
        timerRunning = false;
        startBtnIcon.className = 'fas fa-play';
        startBtnText.textContent = 'Start';
        } else {
        // Start timer
        timerRunning = true;
        startBtnIcon.className = 'fas fa-pause';
        startBtnText.textContent = 'Pause';
        
        if (remainingSeconds <= 0) {
            // Reset if timer has finished
            remainingSeconds = timerMinutes * 60;
        }
        
        timerInterval = setInterval(() => {
            remainingSeconds--;
            
            if (remainingSeconds <= 0) {
            // Timer finished
            clearInterval(timerInterval);
            timerRunning = false;
            startBtnIcon.className = 'fas fa-play';
            startBtnText.textContent = 'Start';
            showTimerFinishedNotification();
            }
            
            updateTimerDisplay();
        }, 1000);
        }
    }

    function updateTimerDisplay() {
        if (timerRunning) {
        // Display remaining time when timer is running
        const minutes = Math.floor(remainingSeconds / 60);
        const seconds = remainingSeconds % 60;
        timerValue.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
        } else {
        // Display set time when timer is not running
        timerValue.textContent = `${timerMinutes} mins`;
        }
    }

    function showTimerFinishedNotification() {
        // Check if notification API is supported and permission is granted
        if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('Focus Timer Completed', {
            body: 'Time to take a break!',
            icon: './favicon.ico' // You can add a favicon path here
        });
        } else if ('Notification' in window && Notification.permission !== 'denied') {
        Notification.requestPermission().then(permission => {
            if (permission === 'granted') {
            new Notification('Focus Timer Completed', {
                body: 'Time to take a break!',
                icon: './favicon.ico'
            });
            }
        });
        }
        
        // Show toast notification
        showMyToast('Focus timer completed!', 'success');
    }
}

// ====== Checkbox Functions ======
function initializeCheckboxes() {
    // Task input checkbox
    const inputCheckbox = document.querySelector('.task-input .task-checkbox');
    if (inputCheckbox) {
        inputCheckbox.addEventListener('click', function() {
        this.classList.toggle('checked');
        });
    }

    // Task item checkboxes
    const taskCheckboxes = document.querySelectorAll('.task-item-checkbox');
    taskCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('click', function() {
        const taskItem = this.closest('.task-item');
        this.classList.toggle('checked');
        
        // If checkbox is checked, add strikethrough to the task title
        const taskTitle = taskItem.querySelector('.task-item-title');
        if (this.classList.contains('checked')) {
            taskTitle.style.textDecoration = 'line-through';
            taskTitle.style.opacity = '0.6';
            
            // Show success toast
            showMyToast('Task completed!', 'success');
            
            // Move completed task to bottom after a delay
            setTimeout(() => {
            const taskList = taskItem.parentNode;
            taskList.appendChild(taskItem);
            }, 1000);
        } else {
            taskTitle.style.textDecoration = 'none';
            taskTitle.style.opacity = '1';
        }
        });
    });

    // Add new task functionality
    const taskInput = document.querySelector('.task-input input');
    taskInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter' && this.value.trim() !== '') {
        addNewTask(this.value.trim());
        this.value = '';
        }
    });
    }

    function addNewTask(taskTitle) {
    const taskList = document.querySelector('.task-list');

    // Create new task item
    const newTask = document.createElement('div');
    newTask.className = 'task-item';

    // Get current time
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const formattedHours = hours % 12 || 12;
    const formattedMinutes = minutes.toString().padStart(2, '0');
    const timeString = `${formattedHours}:${formattedMinutes} ${ampm}`;

    // Construct task HTML
    newTask.innerHTML = `
        <div class="task-item-checkbox"></div>
        <div class="task-item-content">
        <div class="task-item-title">${taskTitle}</div>
        <div class="task-item-tag">
            <div class="color-dot blue-dot"></div>
            <span>Inbox</span>
        </div>
        </div>
        <div class="task-item-time">
        ${timeString}
        <div class="icon">
            <i class="fas fa-chevron-right"></i>
        </div>
        </div>
    `;

    // Add to task list
    taskList.appendChild(newTask);

    // Add click event to the new checkbox
    const newCheckbox = newTask.querySelector('.task-item-checkbox');
    newCheckbox.addEventListener('click', function() {
        const taskItem = this.closest('.task-item');
        this.classList.toggle('checked');
        
        const taskTitle = taskItem.querySelector('.task-item-title');
        if (this.classList.contains('checked')) {
        taskTitle.style.textDecoration = 'line-through';
        taskTitle.style.opacity = '0.6';
        
        // Show success toast
        showMyToast('Task completed!', 'success');
        
        // Move completed task to bottom
        setTimeout(() => {
            taskList.appendChild(taskItem);
        }, 1000);
        } else {
        taskTitle.style.textDecoration = 'none';
        taskTitle.style.opacity = '1';
        }
    });

    // Show success toast
    showMyToast('Task added!', 'info');
    }

    // ====== Calendar Functions ======
    function initializeCalendar() {
    const eventDates = [
        "2023-12-08", "2023-12-15", "2023-12-22", "2023-12-29"
    ];
    
    // Initialize Flatpickr
    const calendar = flatpickr("#calendar-container", {
        inline: true,
        dateFormat: "Y-m-d",
        defaultDate: "today",
        minDate: "today",
        maxDate: new Date().fp_incr(60), // 60 days from now
        disableMobile: "true",
        showMonths: 1,
        prevArrow: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M15 18L9 12L15 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
        nextArrow: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M9 18L15 12L9 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
        onReady: function(selectedDates, dateStr, instance) {
            markEventDates();
        },
        onChange: function(selectedDates, dateStr) {
            showMyToast(`Selected date: ${dateStr}`, 'Info');
        },
        onMonthChange: function() {
            setTimeout(markEventDates, 10);
        }
    });
    
    // Mark dates with events
    function markEventDates() {
        const days = document.querySelectorAll(".flatpickr-day");
        days.forEach(day => {
            // Remove previous event markers
            day.classList.remove("has-event");
            
            // Get the date string from the aria-label
            const dateStr = day.getAttribute("aria-label");
            if (dateStr) {
                // Convert to standard format YYYY-MM-DD
                const date = new Date(dateStr);
                const formattedDate = date.toISOString().split('T')[0];
                
                // Mark if it's an event date
                if (eventDates.includes(formattedDate)) {
                    day.classList.add("has-event");
                }
            }
        });
    }
}

// ====== Toast Functions ======
function showMyToast(message, type = 'info') {
    const toastContainer = document.getElementById('toast-container');

    // Create toast element
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;

    // Set icon based on type
    let icon;
    switch (type) {
        case 'success':
        icon = '<i class="fas fa-check-circle"></i>';
        break;
        case 'error':
        icon = '<i class="fas fa-exclamation-circle"></i>';
        break;
        case 'warning':
        icon = '<i class="fas fa-exclamation-triangle"></i>';
        break;
        default:
        icon = '<i class="fas fa-info-circle"></i>';
    }

    toast.innerHTML = `
        <div class="toast-content">
        ${icon}
        <div class="toast-message">${message}</div>
        </div>
        <div class="toast-progress"></div>
    `;

    // Add toast to container
    toastContainer.appendChild(toast);

    // Animate toast in
    setTimeout(() => {
        toast.classList.add('show');
    }, 10);

    // Remove toast after 3 seconds
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => {
        toast.remove();
        }, 300);
    }, 3000);
}
