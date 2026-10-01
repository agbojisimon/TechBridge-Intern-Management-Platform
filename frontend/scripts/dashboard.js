// Intern Dashboard — task tracker, progress and technology explorer.

// Sample intern profile.
const intern = {
  name: 'Alex',
  track: 'Web Development',
  claim: 'Internship Status: In Progress'
};

// Tasks returned by the API.
let tasks = [];

// Tracker filter state — 'all' shows every task.
let taskFilter = 'all';

// Active search text.
let searchTerm = '';

// Task list state — 'loading' | 'ready' | 'error'.
let listState = 'loading';

// Last error message shown to the user.
let lastError = '';

// DOM refs.
const statsCompletedEl = document.getElementById('completed-count');
const statsRemainingEl = document.getElementById('remaining-count');
const statsPercentEl = document.getElementById('progress-percent');
const progressTrackEl = document.querySelector('.dp-track');
const progressBarEl = document.getElementById('dp-bar');
const allDoneEl = document.getElementById('all-done');
const taskListEl = document.getElementById('task-list');
const searchInputEl = document.getElementById('task-search');
const apiPillEl = document.getElementById('api-pill');
const apiPillTextEl = document.getElementById('api-pill-text');
const toastEl = document.getElementById('toast');
const modalEl = document.getElementById('modal');
const modalBodyEl = document.getElementById('modal-body');
const modalOverlayEl = document.getElementById('modal-overlay');
const modalCloseEl = document.getElementById('modal-close');
const newTaskFormEl = document.getElementById('new-task-form');
const newTaskTitleEl = document.getElementById('new-task-title');
const newTaskDescriptionEl = document.getElementById('new-task-description');

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

// Escape task text before placing it in innerHTML.
function escapeHtml(value) {
  return String(value === undefined || value === null ? '' : value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
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

// Update the backend connection indicator.
// State is 'connecting' during a request, then 'online' or 'offline'.
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

// Recalculate and paint progress stats from the API task statuses.
function renderStats() {
  const total = tasks.length;
  const completed = tasks.filter(function (t) { return t.status === 'completed'; }).length;
  const remaining = total - completed;
  const percent = total === 0 ? 0 : Math.round((completed / total) * 100);

  statsCompletedEl.textContent = total === 0 ? '—' : completed;
  statsRemainingEl.textContent = total === 0 ? '—' : remaining;
  statsPercentEl.textContent = total === 0 ? '—' : percent + '%';
  progressBarEl.style.width = percent + '%';
  progressTrackEl.setAttribute('aria-valuenow', percent);

  allDoneEl.hidden = total === 0 || completed < total;
  allDoneEl.textContent = 'Congratulations! You have completed all ' + total + ' internship tasks.';
}

// Build a single task card from an API task object.
function taskCard(task) {
  const isCompleted = task.status === 'completed';

  const completeButton = isCompleted
    ? '<button class="btn btn-primary btn-sm" type="button" disabled>Completed</button>'
    : '<button class="btn btn-primary btn-sm" type="button" data-action="complete" data-id="' + task.id + '">Mark as Completed</button>';

  return '' +
    '<article class="task-track-card">' +
      '<div class="task-track-top">' +
        '<span class="task-track-num">TASK ' + task.id + '</span>' +
        '<span class="task-status ' + statusClass(task.status) + '">' + statusLabel(task.status) + '</span>' +
      '</div>' +
      '<h3>' + escapeHtml(task.title) + '</h3>' +
      '<p>' + escapeHtml(task.description) + '</p>' +
      '<div class="task-track-actions">' +
        '<button class="btn btn-outline btn-sm" type="button" data-action="view" data-id="' + task.id + '">View Task</button>' +
        completeButton +
        '<button class="btn btn-danger-ghost btn-sm" type="button" data-action="delete" data-id="' + task.id + '">Delete</button>' +
      '</div>' +
    '</article>';
}

// Apply the active status filter and search term to the API task list.
function visibleTasks() {
  return tasks.filter(function (task) {
    const matchesStatus = taskFilter === 'all' || task.status === taskFilter;
    const matchesSearch = searchTerm === '' ||
      task.title.toLowerCase().indexOf(searchTerm) !== -1 ||
      task.description.toLowerCase().indexOf(searchTerm) !== -1;
    return matchesStatus && matchesSearch;
  });
}

// Render the task area: loading, error, empty or the filtered task cards.
function renderTasks() {
  if (listState === 'loading') {
    taskListEl.innerHTML =
      '<div class="task-state">' +
        '<span class="spinner" aria-hidden="true"></span>' +
        '<p>Loading tasks...</p>' +
      '</div>';
    return;
  }

  if (listState === 'error') {
    taskListEl.innerHTML =
      '<div class="task-state task-state-error">' +
        '<p class="task-state-title">Unable to load tasks.</p>' +
        '<p class="task-state-text">' + escapeHtml(lastError) + '</p>' +
        '<button class="btn btn-primary btn-sm" type="button" data-action="retry">Try Again</button>' +
      '</div>';
    return;
  }

  const filtered = visibleTasks();

  if (filtered.length === 0) {
    taskListEl.innerHTML =
      '<div class="task-state">' +
        '<p class="task-state-title">No tasks found.</p>' +
        '<p class="task-state-text">Try a different filter or clear the search box.</p>' +
      '</div>';
    return;
  }

  taskListEl.innerHTML = filtered.map(taskCard).join('');
}

// Request the task list and the health check from the API.
async function loadTasks() {
  listState = 'loading';
  renderTasks();
  setApiState('connecting');

  try {
    const results = await Promise.all([getHealth(), getTasks()]);
    tasks = results[1];
    listState = 'ready';
    lastError = '';
    setApiState('online');
  } catch (error) {
    tasks = [];
    listState = 'error';
    lastError = error.message + ' Please check your connection or try again.';
    setApiState('offline');
  }

  renderStats();
  renderTasks();
}

// Ask the API for one task and show it in the modal without refreshing the page.
async function openTaskModal(taskId) {
  modalBodyEl.innerHTML =
    '<div class="task-state">' +
      '<span class="spinner" aria-hidden="true"></span>' +
      '<p>Loading task...</p>' +
    '</div>';

  modalEl.hidden = false;
  document.body.classList.add('modal-open');

  try {
    const task = await getTask(taskId);

    modalBodyEl.innerHTML =
      '<div class="ch-modal-top">' +
        '<span class="task-track-num">TASK ' + task.id + '</span>' +
        '<span class="task-status ' + statusClass(task.status) + '">' + statusLabel(task.status) + '</span>' +
      '</div>' +
      '<h3>' + escapeHtml(task.title) + '</h3>' +
      '<div class="ch-modal-section"><h4>About This Task</h4><p>' + escapeHtml(task.details || task.description) + '</p></div>' +
      '<div class="ch-modal-meta">' +
        '<span><strong>Introduced:</strong> ' + (task.day ? 'Day ' + escapeHtml(task.day) : 'Not scheduled') + '</span>' +
        '<span><strong>Difficulty:</strong> ' + escapeHtml(task.difficulty || 'Not set') + '</span>' +
      '</div>';
  } catch (error) {
    modalBodyEl.innerHTML =
      '<div class="task-state task-state-error">' +
        '<p class="task-state-title">Unable to load this task.</p>' +
        '<p class="task-state-text">' + escapeHtml(error.message) + '</p>' +
        '<button class="btn btn-primary btn-sm" type="button" data-action="close">Close</button>' +
      '</div>';
  }
}

// Close the detail modal.
function closeModal() {
  modalEl.hidden = true;
  document.body.classList.remove('modal-open');
}

// Send a PUT request to update a task status, then refresh the dashboard.
async function markCompleted(taskId, button) {
  button.disabled = true;
  button.textContent = 'Saving...';

  try {
    const updated = await updateTask(taskId, { status: 'completed' });
    const index = tasks.findIndex(function (t) { return t.id === updated.id; });
    if (index !== -1) { tasks[index] = updated; }

    renderStats();
    renderTasks();
    showToast('Task ' + updated.id + ' marked as completed.');
  } catch (error) {
    // Rebuild the card to restore the button.
    setApiState('offline');
    renderTasks();
    showToast('Could not update the task: ' + error.message, 'error');
  }
}

// Send a POST request to add a task.
async function addTask(event) {
  event.preventDefault();

  const title = newTaskTitleEl.value.trim();
  const description = newTaskDescriptionEl.value.trim();

  if (!title || !description) {
    showToast('Please enter a title and a description.', 'error');
    return;
  }

  try {
    const created = await createTask({ title: title, description: description, status: 'not-started' });
    tasks.push(created);
    newTaskFormEl.reset();
    setApiState('online');
    taskFilter = 'all';
    searchTerm = '';
    searchInputEl.value = '';
    setActive(document.querySelectorAll('#task-filter .ch-filter-btn'), 'filter', 'all');
    listState = 'ready';
    renderStats();
    renderTasks();
    showToast('Task ' + created.id + ' added through the API.');
  } catch (error) {
    setApiState('offline');
    showToast('Could not add the task: ' + error.message, 'error');
  }
}

// Send a DELETE request to remove a task.
async function removeTask(taskId) {
  if (!window.confirm('Delete task ' + taskId + '? This cannot be undone.')) { return; }

  try {
    await deleteTask(taskId);
    tasks = tasks.filter(function (t) { return t.id !== taskId; });
    setApiState('online');
    renderStats();
    renderTasks();
    showToast('Task ' + taskId + ' deleted.');
  } catch (error) {
    setApiState('offline');
    showToast('Could not delete the task: ' + error.message, 'error');
  }
}

// Sync the active class across a button group.
function setActive(buttons, attribute, value) {
  buttons.forEach(function (btn) {
    btn.classList.toggle('active', btn.dataset[attribute] === value);
  });
}

// Task filter buttons.
document.querySelectorAll('#task-filter .ch-filter-btn').forEach(function (btn) {
  btn.addEventListener('click', function () {
    taskFilter = btn.dataset.filter;
    setActive(document.querySelectorAll('#task-filter .ch-filter-btn'), 'filter', taskFilter);
    renderTasks();
  });
});

// Search box filters the task list.
searchInputEl.addEventListener('input', function () {
  searchTerm = searchInputEl.value.trim().toLowerCase();
  renderTasks();
});

// Add-task form.
newTaskFormEl.addEventListener('submit', addTask);

// Delegated clicks inside the task list and the modal.
document.addEventListener('click', function (event) {
  const button = event.target.closest('button[data-action]');
  if (!button) { return; }

  const action = button.dataset.action;

  if (action === 'retry') { loadTasks(); return; }
  if (action === 'close') { closeModal(); return; }

  const id = parseInt(button.dataset.id, 10);
  if (isNaN(id)) { return; }

  if (action === 'view') { openTaskModal(id); }
  if (action === 'complete') { markCompleted(id, button); }
  if (action === 'delete') { removeTask(id); }
});

// Modal close paths: close button, outside click, Escape.
modalCloseEl.addEventListener('click', closeModal);
modalOverlayEl.addEventListener('click', closeModal);
document.addEventListener('keydown', function (event) {
  if (event.key === 'Escape' && !modalEl.hidden) { closeModal(); }
});

// Modern web technologies — switchable content panels.
const technologies = {
  'nextjs': {
    name: 'Next.js',
    desc: 'Next.js is a React framework used for building fast, production-ready web applications. It adds server-side rendering, static site generation, and file-based routing on top of React.',
    link: 'https://nextjs.org/',
    linkLabel: 'Learn More'
  },
  'vuejs': {
    name: 'Vue.js',
    desc: 'Vue.js is a progressive JavaScript framework for building user interfaces and single-page applications. It is known for being approachable, flexible, and easy to integrate into projects.',
    link: 'https://vuejs.org/',
    linkLabel: 'Learn More'
  },
  'angular': {
    name: 'Angular',
    desc: 'Angular is a full-featured, TypeScript-based framework for building large-scale web applications. It is commonly used in enterprise projects because it ships with everything you need out of the box.',
    link: 'https://angular.io/',
    linkLabel: 'Learn More'
  },
  'backend': {
    name: 'Backend Development',
    desc: 'Backend development is the server-side of a website — the code that manages databases, authentication, and business logic. It connects to the frontend through APIs, letting users interact with stored data.',
    link: 'https://developer.mozilla.org/en-US/docs/Learn/Server-side/First_steps/Introduction',
    linkLabel: 'Learn More',
    chips: ['Node.js', 'Express.js', 'Django', 'Flask', 'Laravel', '.NET']
  }
};

let techKey = 'nextjs';

const techInfoEl = document.getElementById('tech-info');

// Render the selected technology panel.
function renderTech(key) {
  const tech = technologies[key];
  if (!tech) { return; }
  techKey = key;

  const chips = tech.chips
    ? '<div class="tech-chips">' + tech.chips.map(function (c) { return '<span class="tech-chip">' + c + '</span>'; }).join('') + '</div>'
    : '';

  techInfoEl.innerHTML =
    '<h3>' + tech.name + '</h3>' +
    '<p>' + tech.desc + '</p>' +
    chips +
    '<a class="tech-link" href="' + tech.link + '" target="_blank" rel="noopener noreferrer">' + tech.linkLabel + ' &rarr;</a>';
}

// Technology explorer buttons.
document.querySelectorAll('#tech-filter .tech-btn').forEach(function (btn) {
  btn.addEventListener('click', function () {
    renderTech(btn.dataset.tech);
    setActive(document.querySelectorAll('#tech-filter .tech-btn'), 'tech', techKey);
  });
});

// Initial render.
renderStats();
renderTasks();
renderTech(techKey);
loadTasks();

// Reveal-on-scroll: observe, then unobserve once revealed.
const io = new IntersectionObserver((entries) => {
  entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('revealed'); io.unobserve(e.target); } });
}, { threshold: 0.15 });
document.querySelectorAll('.reveal, .reveal-child').forEach(el => io.observe(el));
