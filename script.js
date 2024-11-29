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