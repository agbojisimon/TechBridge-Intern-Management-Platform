// API layer — every request the dashboard makes to the TechBridge backend lives here.
// dashboard.js never calls fetch() directly, so the frontend and the API contract
// are kept in separate, easy-to-read files.

// Base URL of the Express server. Change this only if the backend runs elsewhere.
const API_BASE = 'http://localhost:3000/api';

// Send a request and return parsed JSON, turning any failure into a readable Error.
// Throwing here means dashboard.js handles success and failure in one place.
async function request(path, options) {
  let response;

  try {
    response = await fetch(API_BASE + path, options);
  } catch (error) {
    // fetch only rejects when the server cannot be reached at all.
    throw new Error('Cannot reach the TechBridge API. Is the backend server running?');
  }

  const data = await response.json().catch(function () {
    return null;
  });

  if (!response.ok) {
    // The server sends { error: { message } } for every failure.
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

// POST /api/tasks — optional challenge: create a new task.
function createTask(task) {
  return request('/tasks', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(task)
  });
}

// DELETE /api/tasks/:id — optional challenge: remove a task.
function deleteTask(id) {
  return request('/tasks/' + id, { method: 'DELETE' });
}
