// Landing page — loads live platform statistics from the API.

const heroStatsEl = document.getElementById('hero-stats');

function statMarkup(value, label) {
  return '<div class="hero-stat"><strong>' + value + '</strong><span>' + label + '</span></div>';
}

async function loadStats() {
  heroStatsEl.innerHTML = statMarkup('—', 'Tasks in API') + statMarkup('—', 'Challenges');

  try {
    const results = await Promise.all([getTasks(), getChallenges()]);
    heroStatsEl.innerHTML = statMarkup(results[0].length, 'Tasks in API') + statMarkup(results[1].length, 'Challenges');
  } catch (error) {
    heroStatsEl.innerHTML = statMarkup('Offline', 'Backend') + statMarkup('—', 'Try again later');
  }
}

loadStats();

// Reveal-on-scroll: observe, then unobserve once revealed.
const io = new IntersectionObserver((entries) => {
  entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('revealed'); io.unobserve(e.target); } });
}, { threshold: 0.15 });
document.querySelectorAll('.reveal, .reveal-child').forEach(el => io.observe(el));
