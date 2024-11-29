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
});

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
    
    const taskList = document.getElementById('taskList');
    const points = Math.floor(Math.random() * (120 - 10 + 1)) + 10;
    
    const taskItem = document.createElement('li');
    taskItem.className = 'task-item loading';
    taskItem.innerHTML = `
        <div class="task-content">
            <span>${taskText}</span>
            <span class="task-points">${points} pts</span>
        </div>
        <div class="task-buttons">
            <span onclick="completeTask(this)" class="action-text" title="Mark as done (Ctrl + D)">done</span>
            <span onclick="deleteTask(this)" class="delete-text" title="Delete task">delete</span>
        </div>
    `;
    
    taskList.insertBefore(taskItem, taskList.firstChild);
    taskInput.value = '';

    // Remove loading state after animation
    setTimeout(() => {
        taskItem.classList.remove('loading');
    }, 500);
}

function completeTask(element) {
    const taskItem = element.closest('.task-item');
    
    // Prevent multiple clicks
    if (taskItem.classList.contains('completing')) return;
    
    taskItem.classList.add('completing');
    
    // Get and update points immediately
    const pointsText = taskItem.querySelector('.task-points').textContent;
    const points = parseInt(pointsText);
    
    const totalPointsElement = document.getElementById('totalPoints');
    const currentPoints = parseInt(totalPointsElement.textContent);
    totalPointsElement.textContent = currentPoints + points;

    // Animate points increase
    totalPointsElement.style.transform = 'scale(1.2)';
    setTimeout(() => {
        totalPointsElement.style.transform = 'scale(1)';
    }, 200);

    // Add completion animation
    taskItem.classList.add('completed-task');
    
    // Archive the task
    const archiveList = document.getElementById('archiveList');
    const taskClone = taskItem.cloneNode(true);
    taskClone.classList.remove('completing');
    taskClone.classList.add('archived-task');
    
    const dateDiv = document.createElement('div');
    dateDiv.className = 'archive-date';
    dateDiv.textContent = new Date().toLocaleDateString();
    
    const taskButtons = taskClone.querySelector('.task-buttons');
    taskButtons.remove();
    
    // Wait for completion animation before removing
    setTimeout(() => {
        taskItem.style.opacity = '0';
        taskItem.style.transform = 'translateX(-20px)';
        
        setTimeout(() => {
            taskItem.remove();
            archiveList.insertBefore(taskClone, archiveList.firstChild);
        }, 200);
    }, 500);
}

function deleteTask(element) {
    const taskItem = element.closest('.task-item');
    taskItem.classList.add('loading');
    
    setTimeout(() => {
        taskItem.style.transform = 'translateX(-100px)';
        taskItem.style.opacity = '0';
        
        setTimeout(() => {
            taskItem.remove();
        }, 300);
    }, 300);
}

// Add keyboard shortcut for completing tasks
document.addEventListener('keydown', function(e) {
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

// Make tasks focusable for keyboard navigation
document.addEventListener('DOMContentLoaded', function() {
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

document.getElementById('taskInput').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        addTask();
    }
});