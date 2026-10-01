// TechBridge Intern Management Platform — API server.

const express = require('express');
const cors = require('cors');
const path = require('path');

const store = require('./lib/store');
const taskRoutes = require('./routes/tasks');
const challengeRoutes = require('./routes/challenges');

const app = express();
const PORT = process.env.PORT || 3000;

// Folders served as static files.
const FRONTEND_DIR = path.join(__dirname, '..', 'frontend');
const ASSETS_DIR = path.join(__dirname, '..', 'assets');

// Allow requests from a frontend running on another port.
app.use(cors());

// Parse JSON request bodies so req.body works on POST and PUT.
app.use(express.json());

// API routes
app.get('/api/health', function (req, res) {
  try {
    res.json({
      status: 'ok',
      taskCount: store.read('tasks.json').length,
      challengeCount: store.read('challenges.json').length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    store.sendError(res, 500, 'Data could not be read.');
  }
});

app.use('/api/tasks', taskRoutes);
app.use('/api/challenges', challengeRoutes);

// Any unknown /api route returns JSON instead of the default HTML error page.
app.use('/api', function (req, res) {
  store.sendError(res, 404, 'API route not found: ' + req.method + ' ' + req.originalUrl);
});

// Static files
app.use('/assets', express.static(ASSETS_DIR));
app.use(express.static(FRONTEND_DIR));

// Start the server
app.listen(PORT, function () {
  console.log('TechBridge platform running at http://localhost:' + PORT);
  console.log('Homepage:   http://localhost:' + PORT + '/');
  console.log('Dashboard:  http://localhost:' + PORT + '/dashboard.html');
  console.log('Challenges: http://localhost:' + PORT + '/challenges.html');
  console.log('Admin:      http://localhost:' + PORT + '/admin.html');
  console.log('Tasks:      http://localhost:' + PORT + '/api/tasks');
  console.log('Reset demo data: npm run reset');
});

// Log unexpected failures instead of letting the server die without explanation.
process.on('uncaughtException', function (error) {
  console.error('Server error:', error);
});
