const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const app = express();

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// In-memory storage for tasks
let tasks = [];
let taskIdCounter = 1;

// Routes

// Serve HTML page
app.get('/', (req, res) => {
  res.send(getHTML());
});

// Serve CSS
app.get('/style.css', (req, res) => {
  const cssPath = path.join(__dirname, 'style.css');
  fs.readFile(cssPath, 'utf8', (err, data) => {
    if (err) {
      res.statusCode = 404;
      res.end('CSS file not found');
    } else {
      res.setHeader('Content-Type', 'text/css');
      res.statusCode = 200;
      res.end(data);
    }
  });
});

// Get all tasks
app.get('/api/tasks', (req, res) => {
  const remainingTasks = tasks.filter(t => !t.completed);
  const completedTasks = tasks.filter(t => t.completed);
  
  res.json({
    remaining: remainingTasks,
    completed: completedTasks,
    total: tasks.length
  });
});

// Add new task
app.post('/api/tasks/add', (req, res) => {
  const { taskName, startDate, endDate } = req.body;

  if (!taskName || !startDate || !endDate) {
    return res.status(400).json({ success: false, message: 'All fields are required!' });
  }

  const start = new Date(startDate);
  const end = new Date(endDate);

  if (start > end) {
    return res.status(400).json({ success: false, message: 'Start date must be before end date!' });
  }

  const newTask = {
    id: taskIdCounter++,
    taskName,
    startDate: start.toLocaleDateString(),
    endDate: end.toLocaleDateString(),
    completed: false,
    createdAt: new Date().toLocaleString()
  };

  tasks.push(newTask);

  res.json({ 
    success: true, 
    message: 'Task added successfully!',
    task: newTask 
  });
});

// Complete a task
app.put('/api/tasks/:id/complete', (req, res) => {
  const taskId = parseInt(req.params.id);
  const task = tasks.find(t => t.id === taskId);

  if (!task) {
    return res.status(404).json({ success: false, message: 'Task not found!' });
  }

  task.completed = true;
  task.completedAt = new Date().toLocaleString();

  res.json({ 
    success: true, 
    message: 'Task completed!',
    task 
  });
});

// Delete a task
app.delete('/api/tasks/:id', (req, res) => {
  const taskId = parseInt(req.params.id);
  const index = tasks.findIndex(t => t.id === taskId);

  if (index === -1) {
    return res.status(404).json({ success: false, message: 'Task not found!' });
  }

  const deletedTask = tasks.splice(index, 1);

  res.json({ 
    success: true, 
    message: 'Task deleted permanently!',
    task: deletedTask[0]
  });
});

// HTML Template
function getHTML() {
  return '<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Task Manager</title><link rel="stylesheet" href="style.css"></head><body><div class="container"><div class="header"><h1>📋 Task Manager</h1><p>Organize your tasks efficiently</p></div><div class="add-task-section"><h2>➕ Add New Task</h2><form id="task-form"><div class="form-group"><label for="task-name">Task Name:</label><input type="text" id="task-name" name="taskName" placeholder="Enter task name" required></div><div class="form-row"><div class="form-group"><label for="start-date">Start Date:</label><input type="date" id="start-date" name="startDate" required></div><div class="form-group"><label for="end-date">End Date:</label><input type="date" id="end-date" name="endDate" required></div></div><button type="submit" class="btn btn-add">➕ Add Task</button><div id="form-message" class="message"></div></form></div><div class="tasks-section"><div class="tasks-container"><div class="section-header"><h2>⏳ Remaining Tasks</h2><span class="task-count" id="remaining-count">0</span></div><div id="remaining-tasks" class="tasks-list"><p style="text-align: center; color: #999; padding: 20px;">No remaining tasks. Great work! 🎉</p></div></div><div class="tasks-container"><div class="section-header"><h2>✅ Completed Tasks</h2><span class="task-count" id="completed-count">0</span></div><div id="completed-tasks" class="tasks-list"><p style="text-align: center; color: #999; padding: 20px;">No completed tasks yet.</p></div></div></div></div><script>' + getJavaScript() + '</script></body></html>';
}

// JavaScript for HTML
function getJavaScript() {
  return `const today = new Date().toISOString().split('T')[0];
    document.getElementById('start-date').min = today;
    document.getElementById('end-date').min = today;

    document.getElementById('task-form').addEventListener('submit', function(e) {
      e.preventDefault();
      const taskName = document.getElementById('task-name').value;
      const startDate = document.getElementById('start-date').value;
      const endDate = document.getElementById('end-date').value;
      const messageDiv = document.getElementById('form-message');

      fetch('/api/tasks/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ taskName, startDate, endDate })
      })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          messageDiv.className = 'message success';
          messageDiv.textContent = data.message;
          document.getElementById('task-form').reset();
          setTimeout(() => { messageDiv.textContent = ''; }, 3000);
          loadTasks();
        } else {
          messageDiv.className = 'message error';
          messageDiv.textContent = data.message;
        }
      });
    });

    function loadTasks() {
      fetch('/api/tasks')
      .then(res => res.json())
      .then(data => {
        displayRemainingTasks(data.remaining);
        displayCompletedTasks(data.completed);
      });
    }

    function displayRemainingTasks(tasks) {
      const container = document.getElementById('remaining-tasks');
      const count = document.getElementById('remaining-count');
      count.textContent = tasks.length;

      if (tasks.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: #999; padding: 20px;">No remaining tasks. Great work! 🎉</p>';
        return;
      }

      container.innerHTML = tasks.map(task => '<div class="task-card remaining"><div class="task-header"><h3 class="task-name">' + task.taskName + '</h3></div><div class="task-dates"><div class="date-item"><span class="date-label">📅 Start:</span><span class="date-value">' + task.startDate + '</span></div><div class="date-item"><span class="date-label">📅 End:</span><span class="date-value">' + task.endDate + '</span></div></div><p class="created-at">Created: ' + task.createdAt + '</p><div class="task-actions"><button class="btn btn-complete" onclick="completeTask(' + task.id + ')">✅ Complete Task</button><button class="btn btn-delete" onclick="deleteTask(' + task.id + ')">🗑️ Delete</button></div></div>').join('');
    }

    function displayCompletedTasks(tasks) {
      const container = document.getElementById('completed-tasks');
      const count = document.getElementById('completed-count');
      count.textContent = tasks.length;

      if (tasks.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: #999; padding: 20px;">No completed tasks yet.</p>';
        return;
      }

      container.innerHTML = tasks.map(task => '<div class="task-card completed"><div class="task-header"><h3 class="task-name">' + task.taskName + '</h3><span class="completed-badge">Completed</span></div><div class="task-dates"><div class="date-item"><span class="date-label">📅 Start:</span><span class="date-value">' + task.startDate + '</span></div><div class="date-item"><span class="date-label">📅 End:</span><span class="date-value">' + task.endDate + '</span></div></div><p class="created-at">Created: ' + task.createdAt + '</p><p class="completed-at">Completed: ' + task.completedAt + '</p><div class="task-actions"><button class="btn btn-delete" onclick="deleteTask(' + task.id + ')">🗑️ Delete</button></div></div>').join('');
    }

    function completeTask(taskId) {
      fetch('/api/tasks/' + taskId + '/complete', { method: 'PUT', headers: { 'Content-Type': 'application/json' } })
      .then(res => res.json())
      .then(data => { if (data.success) loadTasks(); });
    }

    function deleteTask(taskId) {
      if (confirm('Are you sure you want to delete this task permanently?')) {
        fetch('/api/tasks/' + taskId, { method: 'DELETE' })
        .then(res => res.json())
        .then(data => { if (data.success) loadTasks(); });
      }
    }

    loadTasks();
    setInterval(loadTasks, 5000);`;
}

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log('✅ Task Manager server running at http://localhost:' + PORT);
});
