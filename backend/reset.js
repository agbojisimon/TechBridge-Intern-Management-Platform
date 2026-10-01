// Restores the seed data files so the demo always starts in a known state.

const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, 'data');
const FILES = ['tasks', 'challenges'];

FILES.forEach(function (name) {
  const seed = path.join(DATA_DIR, name + '.seed.json');
  if (!fs.existsSync(seed)) {
    console.error('Missing seed file: ' + seed);
    process.exit(1);
  }
  fs.copyFileSync(seed, path.join(DATA_DIR, name + '.json'));
});

console.log('Demo data restored: ' + FILES.length + ' files.');
