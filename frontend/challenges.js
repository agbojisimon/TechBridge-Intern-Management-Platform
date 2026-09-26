// Challenge Hub — data definitions.

// Each challenge is an object with its track, difficulty, and detail fields.
const challenges = [
  {
    name: 'Expense Analysis Report',
    track: 'data-analytics',
    difficulty: 'Beginner',
    description: 'Clean a month of expense data and summarize spending patterns by category.',
    outcome: 'A tidy expense sheet plus a short summary of the largest spending categories.',
    objective: 'Organize a raw expense dataset and turn it into clear, useful spending insights.',
    skills: ['Spreadsheet basics', 'Data cleaning', 'Pivot tables'],
    tools: ['Google Sheets', 'Excel'],
    produce: 'A cleaned expense table and a category-level summary with totals.',
    time: '2-3 hours'
  },
  {
    name: 'Sales Analysis Dashboard',
    track: 'data-analytics',
    difficulty: 'Intermediate',
    description: 'Analyze monthly sales and build a dashboard that highlights key performance trends.',
    outcome: 'A dashboard showing monthly revenue, top products, and best-performing regions.',
    objective: 'Identify sales trends and communicate them visually for a team decision.',
    skills: ['Pivot tables', 'Formulas', 'Charting', 'Dashboard layout'],
    tools: ['Google Sheets', 'Excel'],
    produce: 'A dashboard presenting the sales insights.',
    time: '3-4 hours'
  },
  {
    name: 'Customer Churn Analysis',
    track: 'data-analytics',
    difficulty: 'Advanced',
    description: 'Investigate patterns behind customer churn and recommend ways to reduce it.',
    outcome: 'A findings report listing the main churn drivers with supporting data.',
    objective: 'Discover which factors most strongly relate to customers leaving.',
    skills: ['SQL queries', 'Joins', 'Aggregations', 'Data visualization'],
    tools: ['SQLite', 'Excel'],
    produce: 'A short analysis report with charts and recommendations.',
    time: '5-6 hours'
  },
  {
    name: 'Employee Dataset Cleanup',
    track: 'data-analytics',
    difficulty: 'Beginner',
    description: 'Prepare a messy employee dataset by fixing duplicates, typos, and format issues.',
    outcome: 'A clean, consistent dataset ready for further analysis.',
    objective: 'Apply data cleaning steps to make the dataset reliable.',
    skills: ['Data cleaning', 'Sorting & filtering'],
    tools: ['Google Sheets', 'Excel'],
    produce: 'A cleaned employee table with no duplicates or inconsistencies.',
    time: '2 hours'
  },
  {
    name: 'Responsive Landing Page',
    track: 'web-development',
    difficulty: 'Beginner',
    description: 'Build a responsive landing page for a product or service of your choice.',
    outcome: 'A working landing page that adapts cleanly to desktop, tablet, and mobile.',
    objective: 'Practice layout, styling, and responsive design techniques.',
    skills: ['HTML', 'CSS', 'Flexbox & Grid', 'Responsive design'],
    tools: ['VS Code', 'Browser DevTools'],
    produce: 'A single-page landing site with hero, features, and footer sections.',
    time: '3 hours'
  },
  {
    name: 'Personal Portfolio Website',
    track: 'web-development',
    difficulty: 'Beginner',
    description: 'Create a personal portfolio to present your profile and projects.',
    outcome: 'A clean portfolio page with about, projects, and contact sections.',
    objective: 'Showcase personal work using a well-structured, styled page.',
    skills: ['HTML', 'CSS', 'Basic design'],
    tools: ['VS Code', 'GitHub Pages'],
    produce: 'A published portfolio website.',
    time: '3-4 hours'
  },
  {
    name: 'Interactive Product Page',
    track: 'web-development',
    difficulty: 'Intermediate',
    description: 'Build a product page with interactive tabs, a gallery, and an add-to-cart UI.',
    outcome: 'An interactive product page where users can switch views and add items.',
    objective: 'Add JavaScript interactions to a normal product display page.',
    skills: ['HTML', 'CSS', 'JavaScript events & DOM'],
    tools: ['VS Code', 'Browser DevTools'],
    produce: 'A product page with working tabs, gallery, and cart counter.',
    time: '4 hours'
  },
  {
    name: 'Online Quiz App',
    track: 'web-development',
    difficulty: 'Advanced',
    description: 'Build a small quiz app that tracks answers and shows a final score.',
    outcome: 'A working quiz with multiple questions, feedback, and a score screen.',
    objective: 'Implement app logic with arrays, state, and DOM updates.',
    skills: ['HTML', 'CSS', 'JavaScript logic'],
    tools: ['VS Code', 'Browser DevTools'],
    produce: 'A functional quiz application.',
    time: '5 hours'
  }
];

// Filter state — 'all' means no filter applied.
let trackFilter = 'all';
let difficultyFilter = 'all';

// DOM refs.
const gridEl = document.getElementById('ch-grid');
const countEl = document.getElementById('ch-count');
const emptyEl = document.getElementById('ch-empty');
const modalEl = document.getElementById('modal');
const modalBodyEl = document.getElementById('modal-body');
const modalOverlayEl = document.getElementById('modal-overlay');
const modalCloseEl = document.getElementById('modal-close');

// Label + badge helpers.
function trackLabel(key) {
  return key === 'data-analytics' ? 'Data Analytics' : 'Web Development';
}

function trackClass(key) {
  return key === 'data-analytics' ? 'ch-track-da' : 'ch-track-wd';
}

function difficultyClass(level) {
  if (level === 'Beginner') { return 'difficulty-beginner'; }
  if (level === 'Intermediate') { return 'difficulty-intermediate'; }
  return 'difficulty-advanced';
}

// Build a single card for one challenge.
function challengeCard(challenge, index) {
  return '' +
    '<article class="ch-card">' +
      '<div class="ch-card-top">' +
        '<span class="ch-track ' + trackClass(challenge.track) + '">' + trackLabel(challenge.track) + '</span>' +
        '<span class="difficulty ' + difficultyClass(challenge.difficulty) + '">' + challenge.difficulty + '</span>' +
      '</div>' +
      '<h3>' + challenge.name + '</h3>' +
      '<p class="ch-desc">' + challenge.description + '</p>' +
      '<p class="ch-outcome"><strong>Expected outcome:</strong> ' + challenge.outcome + '</p>' +
      '<button class="btn btn-primary btn-sm" type="button" data-index="' + index + '">View Challenge</button>' +
    '</article>';
}

// Apply the active filters and re-render the grid.
function renderChallenges() {
  const filtered = challenges.filter(function (ch) {
    const matchesTrack = trackFilter === 'all' || ch.track === trackFilter;
    const matchesDifficulty = difficultyFilter === 'all' || ch.difficulty.toLowerCase() === difficultyFilter;
    return matchesTrack && matchesDifficulty;
  });

  countEl.textContent = 'Showing ' + filtered.length + ' of ' + challenges.length + ' challenges';

  emptyEl.hidden = filtered.length > 0;
  gridEl.hidden = filtered.length === 0;

  gridEl.innerHTML = filtered.map(function (ch) {
    return challengeCard(ch, challenges.indexOf(ch));
  }).join('');
}

// Open the detail modal for a specific challenge.
function openModal(index) {
  const challenge = challenges[index];
  if (!challenge) { return; }

  modalBodyEl.innerHTML =
    '<div class="ch-modal-top">' +
      '<span class="ch-track ' + trackClass(challenge.track) + '">' + trackLabel(challenge.track) + '</span>' +
      '<span class="difficulty ' + difficultyClass(challenge.difficulty) + '">' + challenge.difficulty + '</span>' +
    '</div>' +
    '<h3>' + challenge.name + '</h3>' +
    '<div class="ch-modal-section">' +
      '<h4>Objective</h4><p>' + challenge.objective + '</p>' +
    '</div>' +
    '<div class="ch-modal-section">' +
      '<h4>Skills Required</h4><p>' + challenge.skills.join(', ') + '</p>' +
    '</div>' +
    '<div class="ch-modal-section">' +
      '<h4>Tools You May Use</h4><p>' + challenge.tools.join(', ') + '</p>' +
    '</div>' +
    '<div class="ch-modal-section">' +
      '<h4>What to Produce</h4><p>' + challenge.produce + '</p>' +
    '</div>' +
    '<div class="ch-modal-meta">' +
      '<span><strong>Estimated time:</strong> ' + challenge.time + '</span>' +
    '</div>' +
    '<div class="ch-modal-section ch-modal-result">' +
      '<h4>Expected Result</h4><p>' + challenge.outcome + '</p>' +
    '</div>';

  modalEl.hidden = false;
  document.body.classList.add('modal-open');
}

// Close the detail modal.
function closeModal() {
  modalEl.hidden = true;
  document.body.classList.remove('modal-open');
}

// Sync active class across a button group.
function setActive(buttons, key, value) {
  buttons.forEach(function (btn) {
    btn.classList.toggle('active', btn.dataset[key] === value);
  });
}

// Wire up filter buttons.
document.querySelectorAll('#track-filter .ch-filter-btn').forEach(function (btn) {
  btn.addEventListener('click', function () {
    trackFilter = btn.dataset.track;
    setActive(document.querySelectorAll('#track-filter .ch-filter-btn'), 'track', trackFilter);
    renderChallenges();
  });
});

document.querySelectorAll('#difficulty-filter .ch-filter-btn').forEach(function (btn) {
  btn.addEventListener('click', function () {
    difficultyFilter = btn.dataset.difficulty;
    setActive(document.querySelectorAll('#difficulty-filter .ch-filter-btn'), 'difficulty', difficultyFilter);
    renderChallenges();
  });
});

// Reset filters button.
document.getElementById('reset-filters').addEventListener('click', function () {
  trackFilter = 'all';
  difficultyFilter = 'all';
  setActive(document.querySelectorAll('#track-filter .ch-filter-btn'), 'track', 'all');
  setActive(document.querySelectorAll('#difficulty-filter .ch-filter-btn'), 'difficulty', 'all');
  renderChallenges();
});

// Delegated click on the grid — opens the detail modal.
gridEl.addEventListener('click', function (event) {
  const button = event.target.closest('button[data-index]');
  if (button) { openModal(parseInt(button.dataset.index, 10)); }
});

// Modal close paths: close button, outside click, and Escape key.
modalCloseEl.addEventListener('click', closeModal);
modalOverlayEl.addEventListener('click', closeModal);
document.addEventListener('keydown', function (event) {
  if (event.key === 'Escape' && !modalEl.hidden) { closeModal(); }
});

// Initial render.
renderChallenges();

// Reveal-on-scroll: observe, then unobserve once revealed.
const io = new IntersectionObserver((entries) => {
  entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('revealed'); io.unobserve(e.target); } });
}, { threshold: 0.15 });
document.querySelectorAll('.reveal, .reveal-child').forEach(el => io.observe(el));