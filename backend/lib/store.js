// File storage helpers — reads and writes the JSON data files.

const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', 'data');

// Read a JSON file from the data folder.
function read(file) {
  return JSON.parse(fs.readFileSync(path.join(DATA_DIR, file), 'utf8'));
}

// Overwrite a JSON file in the data folder.
function write(file, items) {
  fs.writeFileSync(path.join(DATA_DIR, file), JSON.stringify(items, null, 2) + '\n', 'utf8');
}

// Find an item by its id.
function findById(items, id) {
  return items.find(function (item) { return item.id === id; });
}

// Next free id in a list.
function nextId(items) {
  return items.reduce(function (highest, item) {
    return item.id > highest ? item.id : highest;
  }, 0) + 1;
}

// Send an error response.
function sendError(res, status, message) {
  res.status(status).json({ error: { status: status, message: message } });
}

module.exports = {
  read: read,
  write: write,
  findById: findById,
  nextId: nextId,
  sendError: sendError
};
