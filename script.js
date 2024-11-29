// Data structure for tasks
let state = {
    tasks: [],
    archivedTasks: [],
    totalPoints: 0
};

// Load data from localStorage
function loadFromLocalStorage() {
    const savedState = localStorage.getItem('taskManagerState');
    if (savedState) {
        state = JSON.parse(savedState);
        renderTasks();
        renderArchivedTasks();
        updateTotalPoints();
    }
}

// Save data to localStorage
function saveToLocalStorage() {
    localStorage.setItem('taskManagerState', JSON.stringify(state));
}

// Update total points display
function updateTotalPoints() {
    document.getElementById('totalPoints').textContent = state.totalPoints;
}

// Render active tasks
function renderTasks() {
    const taskList = document.getElementById('taskList');
    taskList.innerHTML = '';
    
    state.tasks.forEach(task => {
        const taskItem = createTaskElement(task);
        taskList.appendChild(taskItem);
    });
}

// Render archived tasks
function renderArchivedTasks() {
    const archiveList = document.getElementById('archiveList');
    archiveList.innerHTML = '';
    
    state.archivedTasks.forEach(task => {
        const taskItem = document.createElement('li');
        taskItem.className = 'task-item archived-task';
        taskItem.innerHTML = `
            <div class="task-content">
                <span>${task.text}</span>
                <span class="task-points">${task.points} pts</span>
            </div>
            <div class="archive-date">${new Date(task.archiveDate).toLocaleDateString()}</div>
        `;
        archiveList.appendChild(taskItem);
    });
}

// Create task element
function createTaskElement(task) {
    const taskItem = document.createElement('li');
    taskItem.className = 'task-item';
    taskItem.setAttribute('data-id', task.id);
    taskItem.innerHTML = `
        <div class="task-content">
            <span>${task.text}</span>
            <span class="task-points">${task.points} pts</span>
        </div>
        <div class="task-buttons">
            <span onclick="completeTask(this)" class="action-text" title="Mark as done (Ctrl + D)">done</span>
            <span onclick="deleteTask(this)" class="delete-text" title="Delete task">delete</span>
        </div>
    `;
    return taskItem;
}

function toggleArchive() {
    const taskList = document.getElementById('taskList');
    const archiveList = document.getElementById('archiveList');
    const archiveButton = document.querySelector('.tasks-header .action-text');
    const tasksHeader = document.querySelector('.tasks-header h2');
    
    if (archiveList.classList.contains('hidden')) {
        taskList.classList.add('hidden');
        archiveList.classList.remove('hidden');
        archiveButton.textContent = 'back';
        tasksHeader.textContent = 'Archived Tasks';
    } else {
        taskList.classList.remove('hidden');
        archiveList.classList.add('hidden');
        archiveButton.textContent = 'archive';
        tasksHeader.textContent = 'Tasks';
    }
}

function addTask() {
    const taskInput = document.getElementById('taskInput');
    const taskText = taskInput.value.trim();
    
    if (!taskText) return;
    
    const task = {
        id: Date.now().toString(),
        text: taskText,
        points: Math.floor(Math.random() * (120 - 10 + 1)) + 10,
        createdAt: new Date()
    };
    
    state.tasks.unshift(task);
    saveToLocalStorage();
    
    const taskItem = createTaskElement(task);
    taskItem.className = 'task-item loading';
    
    const taskList = document.getElementById('taskList');
    taskList.insertBefore(taskItem, taskList.firstChild);
    taskInput.value = '';

    setTimeout(() => {
        taskItem.classList.remove('loading');
    }, 500);
}

function completeTask(element) {
    const taskItem = element.closest('.task-item');
    const taskId = taskItem.getAttribute('data-id');
    
    if (taskItem.classList.contains('completing')) return;
    
    taskItem.classList.add('completing');
    
    // Find task in state
    const taskIndex = state.tasks.findIndex(t => t.id === taskId);
    if (taskIndex === -1) return;
    
    const task = state.tasks[taskIndex];
    state.totalPoints += task.points;
    
    // Update points display
    const totalPointsElement = document.getElementById('totalPoints');
    totalPointsElement.textContent = state.totalPoints;
    
    // Animate points
    totalPointsElement.style.transform = 'scale(1.2)';
    setTimeout(() => {
        totalPointsElement.style.transform = 'scale(1)';
    }, 200);
    
    // Move to archived tasks
    task.archiveDate = new Date();
    state.archivedTasks.unshift(task);
    state.tasks.splice(taskIndex, 1);
    saveToLocalStorage();
    
    // Animate and remove task
    taskItem.classList.add('completed-task');
    setTimeout(() => {
        taskItem.style.opacity = '0';
        taskItem.style.transform = 'translateX(-20px)';
        
        setTimeout(() => {
            taskItem.remove();
            renderArchivedTasks();
        }, 200);
    }, 500);
}

function deleteTask(element) {
    const taskItem = element.closest('.task-item');
    const taskId = taskItem.getAttribute('data-id');
    
    taskItem.classList.add('loading');
    
    // Remove from state
    state.tasks = state.tasks.filter(t => t.id !== taskId);
    saveToLocalStorage();
    
    setTimeout(() => {
        taskItem.style.transform = 'translateX(-100px)';
        taskItem.style.opacity = '0';
        
        setTimeout(() => {
            taskItem.remove();
        }, 300);
    }, 300);
}

// Initialize app
document.addEventListener('DOMContentLoaded', function() {
    loadFromLocalStorage();
    
    // Make tasks focusable
    const taskList = document.getElementById('taskList');
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.addedNodes.length) {
                mutation.addedNodes.forEach(function(node) {
                    if (node.classList && node.classList.contains('task-item')) {
                        node.setAttribute('tabindex', '0');
                    }
                });
            }
        });
    });
    
    observer.observe(taskList, { childList: true });
});

// Keyboard shortcuts
document.addEventListener('keydown', function(e) {
    // Ctrl/Cmd + / to focus task input
    if ((e.ctrlKey || e.metaKey) && e.key === '/') {
        e.preventDefault();
        document.getElementById('taskInput').focus();
    }
    // Esc to blur task input
    if (e.key === 'Escape') {
        document.getElementById('taskInput').blur();
    }
    // Ctrl/Cmd + D to complete focused task
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'd') {
        e.preventDefault();
        const focusedTask = document.activeElement.closest('.task-item');
        if (focusedTask) {
            const doneButton = focusedTask.querySelector('.action-text');
            if (doneButton) {
                doneButton.click();
            }
        }
    }
});

document.getElementById('taskInput').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        addTask();
    }
});