// Task routes — read, create, update and delete internship tasks.

const express = require('express');
const store = require('../lib/store');

const router = express.Router();

const TASKS_FILE = 'tasks.json';
const VALID_STATUSES = ['completed', 'in-progress', 'not-started'];

// GET /api/tasks — all tasks. Supports ?status= and ?search=.
router.get('/', function (req, res) {
  try {
    let tasks = store.read(TASKS_FILE);
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
    store.sendError(res, 500, 'Task data could not be read.');
  }
});

// GET /api/tasks/:id — one specific task.
router.get('/:id', function (req, res) {
  const id = parseInt(req.params.id, 10);

  if (isNaN(id)) {
    return store.sendError(res, 400, 'Task id must be a number.');
  }

  try {
    const task = store.findById(store.read(TASKS_FILE), id);

    if (!task) {
      return store.sendError(res, 404, 'No task found with id ' + id + '.');
    }

    res.json(task);
  } catch (error) {
    store.sendError(res, 500, 'Task data could not be read.');
  }
});

// POST /api/tasks — create a task.
router.post('/', function (req, res) {
  const body = req.body || {};
  const title = (body.title || '').trim();
  const description = (body.description || '').trim();
  const status = body.status || 'not-started';

  if (!title || !description) {
    return store.sendError(res, 400, 'A new task needs both a title and a description.');
  }

  if (VALID_STATUSES.indexOf(status) === -1) {
    return store.sendError(res, 400, 'Status must be one of: ' + VALID_STATUSES.join(', ') + '.');
  }

  try {
    const tasks = store.read(TASKS_FILE);
    const task = {
      id: store.nextId(tasks),
      title: title,
      description: description,
      details: (body.details || description).trim(),
      day: body.day || null,
      difficulty: body.difficulty || 'Not set',
      status: status
    };

    tasks.push(task);
    store.write(TASKS_FILE, tasks);
    res.status(201).json(task);
  } catch (error) {
    store.sendError(res, 500, 'The new task could not be saved.');
  }
});

// PUT /api/tasks/:id — update a task.
router.put('/:id', function (req, res) {
  const id = parseInt(req.params.id, 10);
  const body = req.body || {};

  if (isNaN(id)) {
    return store.sendError(res, 400, 'Task id must be a number.');
  }

  if (VALID_STATUSES.indexOf(body.status) === -1) {
    return store.sendError(res, 400, 'Status must be one of: ' + VALID_STATUSES.join(', ') + '.');
  }

  try {
    const tasks = store.read(TASKS_FILE);
    const task = store.findById(tasks, id);

    if (!task) {
      return store.sendError(res, 404, 'No task found with id ' + id + '.');
    }

    task.status = body.status;

    if (typeof body.title === 'string' && body.title.trim()) {
      task.title = body.title.trim();
    }
    if (typeof body.description === 'string' && body.description.trim()) {
      task.description = body.description.trim();
    }

    store.write(TASKS_FILE, tasks);
    res.json(task);
  } catch (error) {
    store.sendError(res, 500, 'The task could not be updated.');
  }
});

// DELETE /api/tasks/:id — remove a task.
router.delete('/:id', function (req, res) {
  const id = parseInt(req.params.id, 10);

  if (isNaN(id)) {
    return store.sendError(res, 400, 'Task id must be a number.');
  }

  try {
    const tasks = store.read(TASKS_FILE);

    if (!store.findById(tasks, id)) {
      return store.sendError(res, 404, 'No task found with id ' + id + '.');
    }

    store.write(TASKS_FILE, tasks.filter(function (task) { return task.id !== id; }));
    res.json({ deleted: true, id: id });
  } catch (error) {
    store.sendError(res, 500, 'The task could not be deleted.');
  }
});

module.exports = router;
