// TechBridge Task Management API — Express server.

// Third-party packages.
const express = require('express');
const cors = require('cors');

// Node.js built-in modules for reading and writing the JSON data file.
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Paths to the data files and the frontend folder.
const DATA_FILE = path.join(__dirname, 'data', 'tasks.json');
const SEED_FILE = path.join(__dirname, 'data', 'tasks.seed.json');
const FRONTEND_DIR = path.join(__dirname, '..', 'frontend');

// Status values the API accepts.
const VALID_STATUSES = ['completed', 'in-progress', 'not-started'];

// Middleware

// Allow requests from a frontend running on another port.
app.use(cors());

// Parse JSON request bodies so req.body works on POST and PUT.
app.use(express.json());

// Data helpers

// Read every task from the JSON file.
function readTasks() {
  const raw = fs.readFileSync(DATA_FILE, 'utf8');
  return JSON.parse(raw);
}

// Overwrite the JSON file with the given task list.
function writeTasks(tasks) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(tasks, null, 2) + '\n', 'utf8');
}

// Find a single task by its id.
function findTask(tasks, id) {
  return tasks.find(function (task) { return task.id === id; });
}

// Send an error response.
function sendError(res, status, message) {
  res.status(status).json({ error: { status: status, message: message } });
}

// API routes

// Health check — used for the Connected / Offline indicator.
app.get('/api/health', function (req, res) {
  try {
    const tasks = readTasks();
    res.json({ status: 'ok', taskCount: tasks.length, timestamp: new Date().toISOString() });
  } catch (error) {
    sendError(res, 500, 'Task data could not be read.');
  }
});

// GET /api/tasks — all tasks. Supports ?status= and ?search=.
app.get('/api/tasks', function (req, res) {
  try {
    let tasks = readTasks();
    const status = req.query.status;
    const search = req.query.search;

    if (status) {
      tasks = tasks.filter(function (task) { return task.status === status; });
    }

    if (search) {
      const term = String(search).toLowerCase();
      tasks = tasks.filter(function (task) {
        return task.title.toLowerCase().indexOf(term) !== -1 ||
          task.description.toLowerCase().indexOf(term) !== -1;
      });
    }

    res.json(tasks);
  } catch (error) {
    sendError(res, 500, 'Task data could not be read.');
  }
});

// GET /api/tasks/:id — one specific task.
app.get('/api/tasks/:id', function (req, res) {
  const id = parseInt(req.params.id, 10);

  if (isNaN(id)) {
    return sendError(res, 400, 'Task id must be a number.');
  }

  try {
    const tasks = readTasks();
    const task = findTask(tasks, id);

    if (!task) {
      return sendError(res, 404, 'No task found with id ' + id + '.');
    }

    res.json(task);
  } catch (error) {
    sendError(res, 500, 'Task data could not be read.');
  }
});

// POST /api/tasks — create a task.
app.post('/api/tasks', function (req, res) {
  const body = req.body || {};
  const title = (body.title || '').trim();
  const description = (body.description || '').trim();
  const status = body.status || 'not-started';

  if (!title || !description) {
    return sendError(res, 400, 'A new task needs both a title and a description.');
  }

  if (VALID_STATUSES.indexOf(status) === -1) {
    return sendError(res, 400, 'Status must be one of: ' + VALID_STATUSES.join(', ') + '.');
  }

  try {
    const tasks = readTasks();
    const nextId = tasks.reduce(function (highest, task) {
      return task.id > highest ? task.id : highest;
    }, 0) + 1;

    const newTask = {
      id: nextId,
      title: title,
      description: description,
      details: (body.details || description).trim(),
      day: body.day || null,
      difficulty: body.difficulty || 'Not set',
      status: status
    };

    tasks.push(newTask);
    writeTasks(tasks);
    res.status(201).json(newTask);
  } catch (error) {
    sendError(res, 500, 'The new task could not be saved.');
  }
});

// PUT /api/tasks/:id — update a task.
app.put('/api/tasks/:id', function (req, res) {
  const id = parseInt(req.params.id, 10);
  const body = req.body || {};

  if (isNaN(id)) {
    return sendError(res, 400, 'Task id must be a number.');
  }

  if (VALID_STATUSES.indexOf(body.status) === -1) {
    return sendError(res, 400, 'Status must be one of: ' + VALID_STATUSES.join(', ') + '.');
  }

  try {
    const tasks = readTasks();
    const task = findTask(tasks, id);

    if (!task) {
      return sendError(res, 404, 'No task found with id ' + id + '.');
    }

    task.status = body.status;

    if (typeof body.title === 'string' && body.title.trim()) {
      task.title = body.title.trim();
    }
    if (typeof body.description === 'string' && body.description.trim()) {
      task.description = body.description.trim();
    }

    writeTasks(tasks);
    res.json(task);
  } catch (error) {
    sendError(res, 500, 'The task could not be updated.');
  }
});

// DELETE /api/tasks/:id — remove a task.
app.delete('/api/tasks/:id', function (req, res) {
  const id = parseInt(req.params.id, 10);

  if (isNaN(id)) {
    return sendError(res, 400, 'Task id must be a number.');
  }

  try {
    const tasks = readTasks();
    const task = findTask(tasks, id);

    if (!task) {
      return sendError(res, 404, 'No task found with id ' + id + '.');
    }

    writeTasks(tasks.filter(function (item) { return item.id !== id; }));
    res.json({ deleted: true, id: id });
  } catch (error) {
    sendError(res, 500, 'The task could not be deleted.');
  }
});

// Any unknown /api route returns JSON instead of the default HTML error page.
app.use('/api', function (req, res) {
  sendError(res, 404, 'API route not found: ' + req.method + ' ' + req.originalUrl);
});

// Static frontend

app.use(express.static(FRONTEND_DIR));

// Start the server

app.listen(PORT, function () {
  console.log('TechBridge API running at http://localhost:' + PORT);
  console.log('Homepage:       http://localhost:' + PORT + '/');
  console.log('Dashboard:      http://localhost:' + PORT + '/dashboard.html');
  console.log('Tasks:          http://localhost:' + PORT + '/api/tasks');
  console.log('Reset demo data: npm run reset');
});

// Log unexpected failures instead of letting the server die without explanation.
process.on('uncaughtException', function (error) {
  console.error('Server error:', error);
});
