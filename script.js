// Initialize state
let state = {
    tasks: [],
    archivedTasks: [],
    totalPoints: 0
};

// Load tasks from localStorage
function loadTasks() {
    const savedTasks = localStorage.getItem('tasks');
    if (savedTasks) {
        const tasks = JSON.parse(savedTasks);
        renderTasks(tasks);
    }
}

// Save tasks to localStorage
function saveTasks() {
    const tasks = [...state.tasks, ...state.archivedTasks];
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

// Render tasks from state
function renderTasks(tasks) {
    state.tasks = tasks.filter(t => !t.archived);
    state.archivedTasks = tasks.filter(t => t.archived);
    state.totalPoints = tasks.reduce((sum, task) => sum + (task.archived ? task.points : 0), 0);
    
    updateTotalPoints();
    renderActiveTaskList();
    renderArchivedTaskList();
}

function updateTotalPoints() {
    document.getElementById('totalPoints').textContent = state.totalPoints;
}

function renderActiveTaskList() {
    const taskList = document.getElementById('taskList');
    taskList.innerHTML = '';
    
    state.tasks.forEach(task => {
        const taskItem = createTaskElement(task);
        taskList.appendChild(taskItem);
    });
}

function renderArchivedTaskList() {
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
            <span onclick="deleteTaskFromUI(this)" class="delete-text" title="Delete task">delete</span>
        </div>
    `;
    return taskItem;
}

function addTask() {
    const taskInput = document.getElementById('taskInput');
    const taskText = taskInput.value.trim();
    
    if (!taskText) return;
    
    const task = {
        id: Date.now().toString(),
        text: taskText,
        points: Math.floor(Math.random() * (120 - 10 + 1)) + 10,
        createdAt: new Date(),
        archived: false
    };
    
    state.tasks.push(task);
    renderTasks([...state.tasks, ...state.archivedTasks]);
    saveTasks();
    
    taskInput.value = '';
}

function completeTask(element) {
    const taskItem = element.closest('.task-item');
    const taskId = taskItem.getAttribute('data-id');
    
    if (taskItem.classList.contains('completing')) return;
    
    taskItem.classList.add('completing');
    
    const task = state.tasks.find(t => t.id === taskId);
    if (!task) return;
    
    task.archived = true;
    task.archiveDate = new Date();
    
    // Animate completion
    taskItem.classList.add('completed-task');
    setTimeout(() => {
        taskItem.style.opacity = '0';
        taskItem.style.transform = 'translateX(-20px)';
        
        setTimeout(() => {
            renderTasks([...state.tasks, ...state.archivedTasks]);
            saveTasks();
        }, 300);
    }, 500);
}

function deleteTaskFromUI(element) {
    const taskItem = element.closest('.task-item');
    const taskId = taskItem.getAttribute('data-id');
    
    taskItem.classList.add('loading');
    
    // Animate deletion
    setTimeout(() => {
        taskItem.style.transform = 'translateX(-100px)';
        taskItem.style.opacity = '0';
        
        setTimeout(() => {
            state.tasks = state.tasks.filter(t => t.id !== taskId);
            state.archivedTasks = state.archivedTasks.filter(t => t.id !== taskId);
            saveTasks();
            taskItem.remove();
        }, 300);
    }, 300);
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

// Initialize app
document.addEventListener('DOMContentLoaded', function() {
    loadTasks();
    
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
    if ((e.ctrlKey || e.metaKey) && e.key === '/') {
        e.preventDefault();
        document.getElementById('taskInput').focus();
    }
    if (e.key === 'Escape') {
        document.getElementById('taskInput').blur();
    }
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