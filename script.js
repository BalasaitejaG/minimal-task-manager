// Initialize data structure
let tasks = {
    active: [],
    archived: [],
    totalPoints: 0
};

// Load tasks from localStorage on page load
function loadTasks() {
    const savedTasks = localStorage.getItem('taskManager');
    if (savedTasks) {
        tasks = JSON.parse(savedTasks);
        archiveOldTasks();
        updateTotalPoints();
        renderTasks();
    }
}

function saveTasks() {
    localStorage.setItem('taskManager', JSON.stringify(tasks));
}

function updateTotalPoints() {
    document.getElementById('totalPoints').textContent = tasks.totalPoints;
}

// Add this function to generate random points
function generateRandomPoints() {
    return Math.floor(Math.random() * (120 - 10 + 1)) + 10;
}

// Modify the updatePointsPreview function
function updatePointsPreview() {
    const pointsPreview = document.getElementById('pointsPreview');
    const taskInput = document.getElementById('taskInput');
    const pointsPreviewContainer = document.querySelector('.points-preview');
    
    if (taskInput.value.trim() === '') {
        pointsPreviewContainer.classList.add('hidden');
    } else {
        pointsPreviewContainer.classList.remove('hidden');
        pointsPreview.textContent = generateRandomPoints();
    }
}

// Add event listener for input changes
document.getElementById('taskInput').addEventListener('input', updatePointsPreview);

// Modify the addTask function
function addTask() {
    const taskInput = document.getElementById('taskInput');
    const taskText = taskInput.value.trim();
    
    if (taskText === '') {
        alert('Please enter a task!');
        return;
    }
    
    const task = {
        id: Date.now(),
        text: taskText,
        points: generateRandomPoints(),
        completed: false,
        date: new Date().toLocaleDateString(),
        createdAt: new Date().toISOString()
    };
    
    tasks.active.unshift(task);
    saveTasks();
    renderTasks();
    
    taskInput.value = '';
}

function completeTask(taskId) {
    const taskIndex = tasks.active.findIndex(task => task.id === taskId);
    if (taskIndex !== -1) {
        const task = tasks.active[taskIndex];
        task.completed = true;
        task.completedAt = new Date().toISOString();
        tasks.totalPoints += task.points;
        
        tasks.active.splice(taskIndex, 1);
        tasks.archived.push(task);
        
        saveTasks();
        updateTotalPoints();
        renderTasks();
    }
}

function deleteTask(taskId, isArchived = false) {
    const array = isArchived ? tasks.archived : tasks.active;
    const taskIndex = array.findIndex(task => task.id === taskId);
    if (taskIndex !== -1) {
        array.splice(taskIndex, 1);
        saveTasks();
        renderTasks();
    }
}

function renderTasks() {
    const taskList = document.getElementById('taskList');
    const archiveList = document.getElementById('archiveList');
    
    // Render active tasks
    taskList.innerHTML = tasks.active.map(task => `
        <li class="task-item ${task.completed ? 'completed-task' : ''}">
            <div class="task-content">
                <span>${task.text}</span>
                <span class="task-points">${task.points} pts</span>
            </div>
            <div class="task-buttons">
                ${!task.completed ? 
                    `<span onclick="completeTask(${task.id})" class="action-text complete">complete</span>` : ''
                }
                <span onclick="deleteTask(${task.id})" class="delete-text">remove</span>
            </div>
        </li>
    `).join('');
    
    // Sort archived tasks by completion date (newest first)
    const sortedArchivedTasks = [...tasks.archived].sort((a, b) => {
        return new Date(b.completedAt) - new Date(a.completedAt);
    });

    // Group archived tasks by completion date
    const groupedTasks = sortedArchivedTasks.reduce((groups, task) => {
        if (!task.completedAt) {
            task.completedAt = task.date;
        }
        const dateKey = formatDate(task.completedAt);
        if (!groups[dateKey]) {
            groups[dateKey] = [];
        }
        groups[dateKey].push(task);
        return groups;
    }, {});

    // Convert grouped tasks to array and sort by date
    const sortedGroups = Object.entries(groupedTasks).sort((a, b) => {
        const dateA = new Date(a[1][0].completedAt);
        const dateB = new Date(b[1][0].completedAt);
        return dateB - dateA;
    });

    // Render archived tasks grouped by date
    archiveList.innerHTML = sortedGroups
        .map(([date, tasksForDate]) => `
            <li class="archive-date-group">
                <h3 class="archive-date">${date}</h3>
                ${tasksForDate.map(task => `
                    <li class="task-item archived-task">
                        <div class="task-content">
                            <span>${task.text}</span>
                            <span class="task-points">${task.points} pts</span>
                        </div>
                        <div class="task-buttons">
                            <span onclick="deleteTask(${task.id}, true)" class="delete-text">remove</span>
                        </div>
                    </li>
                `).join('')}
            </li>
        `).join('');
}

function toggleArchive() {
    const archiveList = document.getElementById('archiveList');
    const taskList = document.getElementById('taskList');
    const archiveBtn = document.querySelector('.archive-btn');
    
    if (archiveList.classList.contains('hidden')) {
        archiveList.classList.remove('hidden');
        taskList.classList.add('hidden');
        archiveBtn.textContent = 'Show Active Tasks';
    } else {
        archiveList.classList.add('hidden');
        taskList.classList.remove('hidden');
        archiveBtn.textContent = 'Show Archive';
    }
}

// Add ability to press Enter to add task
document.getElementById('taskInput').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        addTask();
    }
});

// Remove the DOMContentLoaded points preview
document.addEventListener('DOMContentLoaded', function() {
    loadTasks();
    // Remove updatePointsPreview() from here
});

// Remove the focus event listener and replace with this
document.getElementById('taskInput').addEventListener('focus', function() {
    if (this.value.trim() !== '') {
        updatePointsPreview();
    }
});

// Add function to check and archive old tasks
function archiveOldTasks() {
    const today = new Date().toLocaleDateString();
    const oldTasks = tasks.active.filter(task => task.date !== today);
    
    // Move old tasks to archive
    oldTasks.forEach(task => {
        const index = tasks.active.findIndex(t => t.id === task.id);
        if (index !== -1) {
            tasks.active.splice(index, 1);
            tasks.archived.push(task);
        }
    });
    
    saveTasks();
    renderTasks();
}

// Add a daily check for old tasks
function initializeTaskManager() {
    loadTasks();
    
    // Check for old tasks every hour
    setInterval(archiveOldTasks, 3600000); // 3600000 ms = 1 hour
}

// Update the DOMContentLoaded event listener
document.addEventListener('DOMContentLoaded', initializeTaskManager);

// Add function to format dates
function formatDate(dateString) {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (date.toDateString() === today.toDateString()) {
        return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
        return 'Yesterday';
    } else {
        return date.toLocaleDateString('en-US', { 
            weekday: 'long', 
            month: 'short', 
            day: 'numeric' 
        });
    }
}

// Add function to show points history
function showPointsHistory() {
    const modal = document.createElement('div');
    modal.className = 'points-history-modal';
    
    const completedTasks = tasks.archived.filter(task => task.completed);
    
    modal.innerHTML = `
        <div class="modal-content">
            <h3>Points History</h3>
            <div class="points-history-list">
                ${completedTasks.map(task => `
                    <div class="points-history-item">
                        <span>${task.text}</span>
                        <span class="points">+${task.points} pts</span>
                        <small>${formatDate(task.completedAt)}</small>
                    </div>
                `).join('')}
            </div>
            <span class="close-modal">×</span>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Close modal when clicking outside or on close button
    modal.addEventListener('click', (e) => {
        if (e.target === modal || e.target.classList.contains('close-modal')) {
            modal.remove();
        }
    });
}

// Add click event listener to total points
document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('totalPoints').addEventListener('click', showPointsHistory);
});