// Admin page — add, update and remove tasks and challenges through the API.

let tasks = [];
let challenges = [];

// DOM refs.
const taskListEl = document.getElementById('task-list');
const taskCountEl = document.getElementById('task-count');
const challengeListEl = document.getElementById('challenge-list');
const challengeCountEl = document.getElementById('challenge-count');
const taskFormEl = document.getElementById('task-form');
const challengeFormEl = document.getElementById('challenge-form');
const apiPillEl = document.getElementById('api-pill');
const apiPillTextEl = document.getElementById('api-pill-text');
const toastEl = document.getElementById('toast');

// Status helpers.
function statusLabel(status) {
  if (status === 'completed') { return 'Completed'; }
  if (status === 'in-progress') { return 'In Progress'; }
  return 'Not Started';
}

function statusClass(status) {
  if (status === 'completed') { return 'status-completed'; }
  if (status === 'in-progress') { return 'status-current'; }
  return 'status-upcoming';
}

// Escape API text before placing it in innerHTML.
function escapeHtml(value) {
  return String(value === undefined || value === null ? '' : value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// Update the backend connection indicator.
function setApiState(state) {
  apiPillEl.classList.toggle('is-connecting', state === 'connecting');
  apiPillEl.classList.toggle('is-online', state === 'online');
  apiPillEl.classList.toggle('is-offline', state === 'offline');

  if (state === 'online') {
    apiPillTextEl.textContent = 'Backend Status: Connected';
  } else if (state === 'offline') {
    apiPillTextEl.textContent = 'Backend Status: Offline';
  } else {
    apiPillTextEl.textContent = 'Backend Status: Connecting';
  }
}

// Show a short confirmation or error message at the bottom of the page.
function showToast(message, type) {
  toastEl.textContent = message;
  toastEl.className = 'toast show' + (type === 'error' ? ' toast-error' : '');
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(function () {
    toastEl.className = 'toast';
  }, 3200);
}

// Render one row per task with its status control.
function renderTasks() {
  taskCountEl.textContent = tasks.length + ' task' + (tasks.length === 1 ? '' : 's');

  if (tasks.length === 0) {
    taskListEl.innerHTML = '<div class="task-state"><p class="task-state-title">No tasks found.</p><p class="task-state-text">Add one using the form above.</p></div>';
    return;
  }

  taskListEl.innerHTML = tasks.map(function (task) {
    const options = ['not-started', 'in-progress', 'completed'].map(function (value) {
      return '<option value="' + value + '"' + (task.status === value ? ' selected' : '') + '>' + statusLabel(value) + '</option>';
    }).join('');

    return '' +
      '<div class="admin-row">' +
        '<div class="admin-row-main">' +
          '<span class="task-track-num">TASK ' + task.id + '</span>' +
          '<div>' +
            '<strong>' + escapeHtml(task.title) + '</strong>' +
            '<p>' + escapeHtml(task.description) + '</p>' +
          '</div>' +
        '</div>' +
        '<div class="admin-row-actions">' +
          '<span class="task-status ' + statusClass(task.status) + '">' + statusLabel(task.status) + '</span>' +
          '<select data-action="set-status" data-type="task" data-id="' + task.id + '">' + options + '</select>' +
          '<button class="btn btn-danger-ghost btn-sm" type="button" data-action="delete-task" data-id="' + task.id + '">Delete</button>' +
        '</div>' +
      '</div>';
  }).join('');
}

// Render one row per challenge.
function renderChallenges() {
  challengeCountEl.textContent = challenges.length + ' challenge' + (challenges.length === 1 ? '' : 's');

  if (challenges.length === 0) {
    challengeListEl.innerHTML = '<div class="task-state"><p class="task-state-title">No challenges found.</p><p class="task-state-text">Add one using the form above.</p></div>';
    return;
  }

  challengeListEl.innerHTML = challenges.map(function (item) {
    return '' +
      '<div class="admin-row">' +
        '<div class="admin-row-main">' +
          '<span class="ch-track ' + (item.track === 'data-analytics' ? 'ch-track-da' : 'ch-track-wd') + '">' + escapeHtml(item.track) + '</span>' +
          '<div>' +
            '<strong>' + escapeHtml(item.name) + '</strong>' +
            '<p>' + escapeHtml(item.description) + '</p>' +
          '</div>' +
        '</div>' +
        '<div class="admin-row-actions">' +
          '<span class="difficulty ' + (item.difficulty === 'Beginner' ? 'difficulty-beginner' : item.difficulty === 'Advanced' ? 'difficulty-advanced' : 'difficulty-intermediate') + '">' + escapeHtml(item.difficulty) + '</span>' +
          '<button class="btn btn-danger-ghost btn-sm" type="button" data-action="delete-challenge" data-id="' + item.id + '">Delete</button>' +
        '</div>' +
      '</div>';
  }).join('');
}

// Load both lists from the API.
async function loadAll() {
  setApiState('connecting');
  taskListEl.innerHTML = '<div class="task-state"><span class="spinner" aria-hidden="true"></span><p>Loading tasks...</p></div>';
  challengeListEl.innerHTML = '<div class="task-state"><span class="spinner" aria-hidden="true"></span><p>Loading challenges...</p></div>';

  try {
    const results = await Promise.all([getTasks(), getChallenges()]);
    tasks = results[0];
    challenges = results[1];
    setApiState('online');
  } catch (error) {
    tasks = [];
    challenges = [];
    setApiState('offline');
    const message = escapeHtml(error.message + ' Please check your connection or try again.');
    taskListEl.innerHTML =
      '<div class="task-state task-state-error">' +
        '<p class="task-state-title">Unable to load data.</p>' +
        '<p class="task-state-text">' + message + '</p>' +
        '<button class="btn btn-primary btn-sm" type="button" data-action="retry">Try Again</button>' +
      '</div>';
    challengeListEl.innerHTML = '';
  }

  renderTasks();
  renderChallenges();
}

// Send a POST request to add a task.
async function addTask(event) {
  event.preventDefault();

  const title = document.getElementById('task-title').value.trim();
  const description = document.getElementById('task-description').value.trim();
  const status = document.getElementById('task-status').value;

  if (!title || !description) {
    showToast('Please enter a title and a description.', 'error');
    return;
  }

  try {
    const created = await createTask({ title: title, description: description, status: status });
    tasks.push(created);
    taskFormEl.reset();
    closeModal('task-form-modal');
    setApiState('online');
    renderTasks();
    showToast('Task ' + created.id + ' created.');
  } catch (error) {
    setApiState('offline');
    showToast('Could not add the task: ' + error.message, 'error');
  }
}

// Send a POST request to add a challenge.
async function addChallenge(event) {
  event.preventDefault();

  const name = document.getElementById('challenge-name').value.trim();
  const description = document.getElementById('challenge-description').value.trim();
  const track = document.getElementById('challenge-track').value;
  const difficulty = document.getElementById('challenge-difficulty').value;
  const outcome = document.getElementById('challenge-outcome').value.trim();

  if (!name || !description) {
    showToast('Please enter a name and a description.', 'error');
    return;
  }

  try {
    const created = await createChallenge({
      name: name,
      description: description,
      track: track,
      difficulty: difficulty,
      outcome: outcome
    });
    challenges.push(created);
    challengeFormEl.reset();
    closeModal('challenge-form-modal');
    setApiState('online');
    renderChallenges();
    showToast('Challenge ' + created.id + ' created.');
  } catch (error) {
    setApiState('offline');
    showToast('Could not add the challenge: ' + error.message, 'error');
  }
}

// Send a PUT request to change a task status.
async function setTaskStatus(id, status) {
  try {
    const updated = await updateTask(id, { status: status });
    const index = tasks.findIndex(function (item) { return item.id === updated.id; });
    if (index !== -1) { tasks[index] = updated; }
    setApiState('online');
    renderTasks();
    showToast('Task ' + updated.id + ' set to ' + statusLabel(updated.status) + '.');
  } catch (error) {
    setApiState('offline');
    renderTasks();
    showToast('Could not update the task: ' + error.message, 'error');
  }
}

// Send a DELETE request to remove a task.
async function removeTask(id) {
  if (!window.confirm('Delete task ' + id + '? This cannot be undone.')) { return; }

  try {
    await deleteTask(id);
    tasks = tasks.filter(function (item) { return item.id !== id; });
    setApiState('online');
    renderTasks();
    showToast('Task ' + id + ' deleted.');
  } catch (error) {
    setApiState('offline');
    showToast('Could not delete the task: ' + error.message, 'error');
  }
}

// Send a DELETE request to remove a challenge.
async function removeChallenge(id) {
  if (!window.confirm('Delete challenge ' + id + '? This cannot be undone.')) { return; }

  try {
    await deleteChallenge(id);
    challenges = challenges.filter(function (item) { return item.id !== id; });
    setApiState('online');
    renderChallenges();
    showToast('Challenge ' + id + ' deleted.');
  } catch (error) {
    setApiState('offline');
    showToast('Could not delete the challenge: ' + error.message, 'error');
  }
}

// Delegated clicks and select changes inside both lists.
document.addEventListener('click', function (event) {
  const closer = event.target.closest('[data-close]');
  if (closer) { closeModal(closer.dataset.close); return; }

  const button = event.target.closest('button[data-action]');
  if (!button) { return; }

  const action = button.dataset.action;
  if (action === 'retry') { loadAll(); return; }
  if (action === 'open-task-form') { openModal('task-form-modal', 'task-title'); return; }
  if (action === 'open-challenge-form') { openModal('challenge-form-modal', 'challenge-name'); return; }

  const id = parseInt(button.dataset.id, 10);
  if (isNaN(id)) { return; }

  if (action === 'delete-task') { removeTask(id); }
  if (action === 'delete-challenge') { removeChallenge(id); }
});

document.addEventListener('change', function (event) {
  const select = event.target.closest('select[data-action="set-status"]');
  if (!select) { return; }
  setTaskStatus(parseInt(select.dataset.id, 10), select.value);
});

// Open a form modal and focus its first field.
function openModal(id, focusId) {
  const modal = document.getElementById(id);
  if (!modal) { return; }
  modal.hidden = false;
  document.body.classList.add('modal-open');
  if (focusId) { document.getElementById(focusId).focus(); }
}

function closeModal(id) {
  const modal = document.getElementById(id);
  if (!modal || modal.hidden) { return; }
  modal.hidden = true;
  document.body.classList.remove('modal-open');
}

document.addEventListener('keydown', function (event) {
  if (event.key !== 'Escape') { return; }
  document.querySelectorAll('.modal:not([hidden])').forEach(function (modal) {
    modal.hidden = true;
  });
  document.body.classList.remove('modal-open');
});

taskFormEl.addEventListener('submit', addTask);
challengeFormEl.addEventListener('submit', addChallenge);

// Initial render.
loadAll();

// Reveal-on-scroll: observe, then unobserve once revealed.
const io = new IntersectionObserver((entries) => {
  entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('revealed'); io.unobserve(e.target); } });
}, { threshold: 0.15 });
document.querySelectorAll('.reveal, .reveal-child').forEach(el => io.observe(el));
