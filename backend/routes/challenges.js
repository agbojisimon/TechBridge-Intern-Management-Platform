// Challenge routes — read, create and delete hub challenges.

const express = require('express');
const store = require('../lib/store');

const router = express.Router();

const CHALLENGES_FILE = 'challenges.json';
const VALID_TRACKS = ['data-analytics', 'web-development'];
const VALID_DIFFICULTIES = ['Beginner', 'Intermediate', 'Advanced'];

// GET /api/challenges — all challenges. Supports ?track=, ?difficulty= and ?search=.
router.get('/', function (req, res) {
  try {
    let challenges = store.read(CHALLENGES_FILE);
    const track = req.query.track;
    const difficulty = req.query.difficulty;
    const search = req.query.search;

    if (track) {
      challenges = challenges.filter(function (item) { return item.track === track; });
    }

    if (difficulty) {
      challenges = challenges.filter(function (item) { return item.difficulty === difficulty; });
    }

    if (search) {
      const term = String(search).toLowerCase();
      challenges = challenges.filter(function (item) {
        return item.name.toLowerCase().indexOf(term) !== -1 ||
          item.description.toLowerCase().indexOf(term) !== -1 ||
          item.objective.toLowerCase().indexOf(term) !== -1;
      });
    }

    res.json(challenges);
  } catch (error) {
    store.sendError(res, 500, 'Challenge data could not be read.');
  }
});

// GET /api/challenges/:id — one specific challenge.
router.get('/:id', function (req, res) {
  const id = parseInt(req.params.id, 10);

  if (isNaN(id)) {
    return store.sendError(res, 400, 'Challenge id must be a number.');
  }

  try {
    const challenge = store.findById(store.read(CHALLENGES_FILE), id);

    if (!challenge) {
      return store.sendError(res, 404, 'No challenge found with id ' + id + '.');
    }

    res.json(challenge);
  } catch (error) {
    store.sendError(res, 500, 'Challenge data could not be read.');
  }
});

// POST /api/challenges — create a challenge.
router.post('/', function (req, res) {
  const body = req.body || {};
  const name = (body.name || '').trim();
  const description = (body.description || '').trim();
  const track = body.track;
  const difficulty = body.difficulty;

  if (!name || !description) {
    return store.sendError(res, 400, 'A new challenge needs both a name and a description.');
  }

  if (VALID_TRACKS.indexOf(track) === -1) {
    return store.sendError(res, 400, 'Track must be one of: ' + VALID_TRACKS.join(', ') + '.');
  }

  if (VALID_DIFFICULTIES.indexOf(difficulty) === -1) {
    return store.sendError(res, 400, 'Difficulty must be one of: ' + VALID_DIFFICULTIES.join(', ') + '.');
  }

  try {
    const challenges = store.read(CHALLENGES_FILE);
    const challenge = {
      id: store.nextId(challenges),
      name: name,
      track: track,
      difficulty: difficulty,
      description: description,
      outcome: (body.outcome || description).trim(),
      objective: (body.objective || description).trim(),
      skills: Array.isArray(body.skills) ? body.skills : [],
      tools: Array.isArray(body.tools) ? body.tools : [],
      produce: (body.produce || 'A completed challenge submission.').trim(),
      time: body.time || 'Not set'
    };

    challenges.push(challenge);
    store.write(CHALLENGES_FILE, challenges);
    res.status(201).json(challenge);
  } catch (error) {
    store.sendError(res, 500, 'The new challenge could not be saved.');
  }
});

// DELETE /api/challenges/:id — remove a challenge.
router.delete('/:id', function (req, res) {
  const id = parseInt(req.params.id, 10);

  if (isNaN(id)) {
    return store.sendError(res, 400, 'Challenge id must be a number.');
  }

  try {
    const challenges = store.read(CHALLENGES_FILE);

    if (!store.findById(challenges, id)) {
      return store.sendError(res, 404, 'No challenge found with id ' + id + '.');
    }

    store.write(CHALLENGES_FILE, challenges.filter(function (item) { return item.id !== id; }));
    res.json({ deleted: true, id: id });
  } catch (error) {
    store.sendError(res, 500, 'The challenge could not be deleted.');
  }
});

module.exports = router;
