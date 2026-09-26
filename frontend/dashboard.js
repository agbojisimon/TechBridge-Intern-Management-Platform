// Intern Dashboard — dynamic task tracker, progress, and technology explorer.

// Sample intern profile.
const intern = {
  name: 'Alex',
  track: 'Web Development',
  claim: 'Internship Status: In Progress'
};

// Task definitions — rendered into cards dynamically.
const tasks = [
  { num: 1, title: 'Build the TechBridge Homepage', day: 1, desc: 'Create the first version of the TechBridge website using HTML and CSS.', details: 'Design and build the homepage including a hero, about, programs, and footer sections using HTML and CSS.', status: 'completed' },
  { num: 2, title: 'Build the TechBridge Programs Experience', day: 4, desc: 'Create a Programs experience presenting TechBridge learning programs.', details: 'Present the available programs with descriptions, skills, and a comparison so visitors understand each path.', status: 'completed' },
  { num: 3, title: 'Build the Internship Tasks Experience', day: 8, desc: 'Create an interface presenting the internship tasks and journey.', details: 'Show all 8 internship tasks along a timeline so visitors understand the sequence and progression.', status: 'completed' },
  { num: 4, title: 'Build an Interactive Internship Roadmap', day: 11, desc: 'Use JavaScript to switch between the two internship tracks.', details: 'Let visitors choose between the Data Analytics and Web Development tracks and view each journey without refreshing.', status: 'completed' },
  { num: 5, title: 'Build the Intern Registration Experience', day: 15, desc: 'Create a professional registration and onboarding interface.', details: 'Design a registration interface that interns use to join the TechBridge internship program.', status: 'completed' },
  { num: 6, title: 'Build the Task Submission System', day: 19, desc: 'Create an interface through which interns prepare and submit their work.', details: 'Build an interface where interns can prepare, review, and submit their task work for review.', status: 'in-progress' },
  { num: 7, title: 'Build the Intern Dashboard', day: 22, desc: 'Create a dashboard with profile, progress, tasks, and submissions.', details: 'Give interns a single place to view their profile, progress, tasks, and submissions.', status: 'not-started' },
  { num: 8, title: 'Build the Complete TechBridge Internship Platform', day: 26, desc: 'Combine the components into a complete TechBridge platform.', details: 'Bring the different components built during the internship together into one complete platform.', status: 'not-started' }
];

// Tracker filter state — 'all' shows every task.
let taskFilter = 'all';

// DOM refs.
const statsCompletedEl = document.getElementById('completed-count');
const statsRemainingEl = document.getElementById('remaining-count');
const statsPercentEl = document.getElementById('progress-percent');
const progressBarEl = document.getElementById('dp-bar');
const allDoneEl = document.getElementById('all-done');
const taskListEl = document.getElementById('task-list');
const modalEl = document.getElementById('modal');
const modalBodyEl = document.getElementById('modal-body');
const modalOverlayEl = document.getElementById('modal-overlay');
const modalCloseEl = document.getElementById('modal-close');

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

// Recalculate and paint progress stats.
function renderStats() {
  const total = tasks.length;
  const completed = tasks.filter(function (t) { return t.status === 'completed'; }).length;
  const remaining = total - completed;
  const percent = Math.round((completed / total) * 100);

  statsCompletedEl.textContent = completed;
  statsRemainingEl.textContent = remaining;
  statsPercentEl.textContent = percent + '%';
  progressBarEl.style.width = percent + '%';
  allDoneEl.hidden = completed < total;
}

// Build a single task card.
function taskCard(task) {
  const completeButton = task.status === 'completed'
    ? '<button class="btn btn-primary btn-sm" type="button" disabled>Completed</button>'
    : '<button class="btn btn-primary btn-sm" type="button" data-action="complete" data-num="' + task.num + '">Mark as Completed</button>';

  return '' +
    '<article class="task-track-card">' +
      '<div class="task-track-top">' +
        '<span class="task-track-num">TASK ' + task.num + '</span>' +
        '<span class="task-status ' + statusClass(task.status) + '">' + statusLabel(task.status) + '</span>' +
      '</div>' +
      '<h3>' + task.title + '</h3>' +
      '<p>' + task.desc + '</p>' +
      '<div class="task-track-actions">' +
        '<button class="btn btn-outline btn-sm" type="button" data-action="view" data-num="' + task.num + '">View Task</button>' +
        completeButton +
      '</div>' +
    '</article>';
}

// Re-render the task list using the active filter.
function renderTasks() {
  const filtered = tasks.filter(function (t) {
    if (taskFilter === 'all') { return true; }
    return t.status === taskFilter;
  });

  taskListEl.innerHTML = filtered.map(taskCard).join('');
}

// Mark a task as completed and refresh the dashboard.
function markCompleted(taskNum) {
  const task = tasks.find(function (t) { return t.num === taskNum; });
  if (!task || task.status === 'completed') { return; }

  task.status = 'completed';
  renderStats();
  renderTasks();
}

// Open the detail modal for a specific task.
function openTaskModal(taskNum) {
  const task = tasks.find(function (t) { return t.num === taskNum; });
  if (!task) { return; }

  modalBodyEl.innerHTML =
    '<div class="ch-modal-top">' +
      '<span class="task-track-num">TASK ' + task.num + '</span>' +
      '<span class="task-status ' + statusClass(task.status) + '">' + statusLabel(task.status) + '</span>' +
    '</div>' +
    '<h3>' + task.title + '</h3>' +
    '<div class="ch-modal-section"><h4>About This Task</h4><p>' + task.details + '</p></div>' +
    '<div class="ch-modal-meta"><span><strong>Introduced:</strong> Day ' + task.day + '</span></div>';

  modalEl.hidden = false;
  document.body.classList.add('modal-open');
}

// Close the detail modal.
function closeModal() {
  modalEl.hidden = true;
  document.body.classList.remove('modal-open');
}

// Sync active class across a button group.
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

// Delegated clicks inside the task list.
taskListEl.addEventListener('click', function (event) {
  const button = event.target.closest('button[data-num]');
  if (!button) { return; }

  const num = parseInt(button.dataset.num, 10);
  if (button.dataset.action === 'complete') { markCompleted(num); }
  if (button.dataset.action === 'view') { openTaskModal(num); }
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

// Reveal-on-scroll: observe, then unobserve once revealed.
const io = new IntersectionObserver((entries) => {
  entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('revealed'); io.unobserve(e.target); } });
}, { threshold: 0.15 });
document.querySelectorAll('.reveal, .reveal-child').forEach(el => io.observe(el));