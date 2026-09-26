// API requests to the TechBridge backend.

// Base URL of the Express server.
const API_BASE = 'http://localhost:3000/api';

// Send a request and return the parsed JSON response.
async function request(path, options) {
  let response;

  try {
    response = await fetch(API_BASE + path, options);
  } catch (error) {
    throw new Error('Cannot reach the TechBridge API. Is the backend server running?');
  }

  const data = await response.json().catch(function () {
    return null;
  });

  if (!response.ok) {
    const message = data && data.error ? data.error.message : 'Request failed (' + response.status + ').';
    throw new Error(message);
  }

  return data;
}

// GET /api/health — used for the Connected / Offline indicator.
function getHealth() {
  return request('/health');
}

// GET /api/tasks — fetch every task for the tracker.
function getTasks() {
  return request('/tasks');
}

// GET /api/tasks/:id — fetch one task for the View Task modal.
function getTask(id) {
  return request('/tasks/' + id);
}

// PUT /api/tasks/:id — update a task. Used to mark a task as completed.
function updateTask(id, changes) {
  return request('/tasks/' + id, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(changes)
  });
}

// POST /api/tasks — create a new task.
function createTask(task) {
  return request('/tasks', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(task)
  });
}

// DELETE /api/tasks/:id — remove a task.
function deleteTask(id) {
  return request('/tasks/' + id, { method: 'DELETE' });
}
