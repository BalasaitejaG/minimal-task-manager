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
    
    if (!taskText) return; // Don't add empty tasks
    
    const taskList = document.getElementById('taskList');
    const points = Math.floor(Math.random() * (120 - 10 + 1)) + 10; // Random points between 10-120
    
    const taskItem = document.createElement('li');
    taskItem.className = 'task-item';
    taskItem.innerHTML = `
        <div class="task-content">
            <span>${taskText}</span>
            <span class="task-points">${points} pts</span>
        </div>
        <div class="task-buttons">
            <span onclick="completeTask(this)" class="action-text">done</span>
            <span onclick="deleteTask(this)" class="delete-text">delete</span>
        </div>
    `;
    
    taskList.appendChild(taskItem);
    taskInput.value = ''; // Clear input after adding task
}

function completeTask(element) {
    const taskItem = element.closest('.task-item');
    taskItem.classList.add('completed-task');
    
    // Get points from the task
    const pointsText = taskItem.querySelector('.task-points').textContent;
    const points = parseInt(pointsText);
    
    // Update total points
    const totalPointsElement = document.getElementById('totalPoints');
    const currentPoints = parseInt(totalPointsElement.textContent);
    totalPointsElement.textContent = currentPoints + points;

    // Move task to archive list
    const archiveList = document.getElementById('archiveList');
    const taskClone = taskItem.cloneNode(true);
    
    // Add archived class and current date
    taskClone.classList.add('archived-task');
    const dateDiv = document.createElement('div');
    dateDiv.className = 'archive-date';
    dateDiv.textContent = new Date().toLocaleDateString();
    
    // Remove the action buttons since it's archived
    const taskButtons = taskClone.querySelector('.task-buttons');
    taskButtons.remove();
    
    // Add to archive
    archiveList.insertBefore(taskClone, archiveList.firstChild);
    
    // Remove from active task list
    taskItem.remove();
}

function deleteTask(element) {
    const taskItem = element.closest('.task-item');
    taskItem.remove();
}

document.getElementById('taskInput').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        addTask();
    }
});