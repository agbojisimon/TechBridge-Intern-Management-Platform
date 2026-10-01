// Challenge Hub — loads challenges from the API and filters them.

let challenges = [];

// Filter state — 'all' means no filter applied.
let trackFilter = 'all';
let difficultyFilter = 'all';
let searchTerm = '';
let listState = 'loading';
let lastError = '';

// DOM refs.
const gridEl = document.getElementById('ch-grid');
const countEl = document.getElementById('ch-count');
const emptyEl = document.getElementById('ch-empty');
const searchInputEl = document.getElementById('challenge-search');
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

// Escape challenge text before placing it in innerHTML.
function escapeHtml(value) {
  return String(value === undefined || value === null ? '' : value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// Build a single card for one challenge.
function challengeCard(challenge) {
  return '' +
    '<article class="ch-card">' +
      '<div class="ch-card-top">' +
        '<span class="ch-track ' + trackClass(challenge.track) + '">' + trackLabel(challenge.track) + '</span>' +
        '<span class="difficulty ' + difficultyClass(challenge.difficulty) + '">' + escapeHtml(challenge.difficulty) + '</span>' +
      '</div>' +
      '<h3>' + escapeHtml(challenge.name) + '</h3>' +
      '<p class="ch-desc">' + escapeHtml(challenge.description) + '</p>' +
      '<p class="ch-outcome"><strong>Expected outcome:</strong> ' + escapeHtml(challenge.outcome) + '</p>' +
      '<button class="btn btn-primary btn-sm" type="button" data-id="' + challenge.id + '">View Challenge</button>' +
    '</article>';
}

// Apply the active filters and re-render the grid.
function renderChallenges() {
  if (listState === 'loading') {
    gridEl.hidden = false;
    emptyEl.hidden = true;
    gridEl.innerHTML = '<div class="task-state"><span class="spinner" aria-hidden="true"></span><p>Loading challenges...</p></div>';
    return;
  }

  if (listState === 'error') {
    gridEl.hidden = false;
    emptyEl.hidden = true;
    gridEl.innerHTML =
      '<div class="task-state task-state-error">' +
        '<p class="task-state-title">Unable to load challenges.</p>' +
        '<p class="task-state-text">' + escapeHtml(lastError) + '</p>' +
        '<button class="btn btn-primary btn-sm" type="button" data-action="retry">Try Again</button>' +
      '</div>';
    return;
  }

  const filtered = challenges.filter(function (ch) {
    const matchesTrack = trackFilter === 'all' || ch.track === trackFilter;
    const matchesDifficulty = difficultyFilter === 'all' || ch.difficulty.toLowerCase() === difficultyFilter;
    const matchesSearch = searchTerm === '' ||
      ch.name.toLowerCase().indexOf(searchTerm) !== -1 ||
      ch.description.toLowerCase().indexOf(searchTerm) !== -1;
    return matchesTrack && matchesDifficulty && matchesSearch;
  });

  countEl.textContent = 'Showing ' + filtered.length + ' of ' + challenges.length + ' challenges';

  emptyEl.hidden = filtered.length > 0;
  gridEl.hidden = filtered.length === 0;

  gridEl.innerHTML = filtered.map(challengeCard).join('');
}

// Request the challenge list from the API.
async function loadChallenges() {
  listState = 'loading';
  renderChallenges();

  try {
    challenges = await getChallenges();
    listState = 'ready';
    lastError = '';
  } catch (error) {
    challenges = [];
    listState = 'error';
    lastError = error.message + ' Please check your connection or try again.';
  }

  renderChallenges();
}

// Open the detail modal for a specific challenge.
function openModal(id) {
  const challenge = challenges.find(function (item) { return item.id === id; });
  if (!challenge) { return; }

  modalBodyEl.innerHTML =
    '<div class="ch-modal-top">' +
      '<span class="ch-track ' + trackClass(challenge.track) + '">' + trackLabel(challenge.track) + '</span>' +
      '<span class="difficulty ' + difficultyClass(challenge.difficulty) + '">' + escapeHtml(challenge.difficulty) + '</span>' +
    '</div>' +
    '<h3>' + escapeHtml(challenge.name) + '</h3>' +
    '<div class="ch-modal-section">' +
      '<h4>Objective</h4><p>' + escapeHtml(challenge.objective) + '</p>' +
    '</div>' +
    '<div class="ch-modal-section">' +
      '<h4>Skills Required</h4><p>' + escapeHtml(challenge.skills.join(', ')) + '</p>' +
    '</div>' +
    '<div class="ch-modal-section">' +
      '<h4>Tools You May Use</h4><p>' + escapeHtml(challenge.tools.join(', ')) + '</p>' +
    '</div>' +
    '<div class="ch-modal-section">' +
      '<h4>What to Produce</h4><p>' + escapeHtml(challenge.produce) + '</p>' +
    '</div>' +
    '<div class="ch-modal-meta">' +
      '<span><strong>Estimated time:</strong> ' + escapeHtml(challenge.time) + '</span>' +
    '</div>' +
    '<div class="ch-modal-section ch-modal-result">' +
      '<h4>Expected Result</h4><p>' + escapeHtml(challenge.outcome) + '</p>' +
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

// Filter buttons.
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

// Search box.
searchInputEl.addEventListener('input', function () {
  searchTerm = searchInputEl.value.trim().toLowerCase();
  renderChallenges();
});

// Reset filters button.
document.getElementById('reset-filters').addEventListener('click', function () {
  trackFilter = 'all';
  difficultyFilter = 'all';
  searchTerm = '';
  searchInputEl.value = '';
  setActive(document.querySelectorAll('#track-filter .ch-filter-btn'), 'track', 'all');
  setActive(document.querySelectorAll('#difficulty-filter .ch-filter-btn'), 'difficulty', 'all');
  renderChallenges();
});

// Delegated clicks on the grid — open the modal or retry the request.
gridEl.addEventListener('click', function (event) {
  if (event.target.closest('button[data-action="retry"]')) {
    loadChallenges();
    return;
  }
  const button = event.target.closest('button[data-id]');
  if (button) { openModal(parseInt(button.dataset.id, 10)); }
});

// Modal close paths: close button, outside click, and Escape key.
modalCloseEl.addEventListener('click', closeModal);
modalOverlayEl.addEventListener('click', closeModal);
document.addEventListener('keydown', function (event) {
  if (event.key === 'Escape' && !modalEl.hidden) { closeModal(); }
});

// Initial render.
renderChallenges();
loadChallenges();

// Reveal-on-scroll: observe, then unobserve once revealed.
const io = new IntersectionObserver((entries) => {
  entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('revealed'); io.unobserve(e.target); } });
}, { threshold: 0.15 });
document.querySelectorAll('.reveal, .reveal-child').forEach(el => io.observe(el));
