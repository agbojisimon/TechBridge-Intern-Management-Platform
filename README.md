# TechBridge Intern Management Platform

A complete intern management platform built with HTML, CSS, JavaScript, Node.js and Express.js. It combines the Challenge Hub, the Intern Dashboard and a REST API into one working application.

The platform is backed by a live Express server. Tasks and challenges are stored as JSON data files, served over HTTP, and updated through the API — the frontend contains no hardcoded task or challenge data.

```
Browser
   │  fetch()
   ▼
REST API  (http://localhost:3000/api)
   │
   ▼
Node.js + Express
   │
   ▼
JSON data files  (backend/data/*.json)
```

## Technologies Used

- **HTML5** — semantic page structure
- **CSS3** — custom properties, Grid, Flexbox, responsive breakpoints, dark mode
- **JavaScript (ES2020)** — `async`/`await`, `fetch`, event delegation, DOM rendering
- **Node.js** — runtime for the server
- **Express.js** — routing, JSON body parsing, CORS, static file serving
- **REST API** — GET, POST, PUT, DELETE with proper status codes
- **JSON** — file-based data storage

No frameworks, no build step, and no `node_modules` on the frontend.

## Main Features

- **Intern Dashboard** — profile, task tracker, progress bar, completed/remaining counts and overall percentage, all calculated from API data
- **Task Management** — view full task details in a modal without a page refresh, and mark tasks complete through `PUT`
- **Progress Tracking** — counts, percentage and progress bar update from the server's response
- **Challenge Hub** — 8 challenges across Data Analytics and Web Development, filterable by track and difficulty
- **Search** — search across tasks and challenges, with a "no matching results" state
- **Add and Delete** — tasks and challenges can be created and removed through the API
- **Admin Section** — a page for managing tasks and challenges, with an inline API reference
- **Loading, Error and Empty States** — every API-driven page handles slow, failed and empty responses
- **Backend Status Indicator** — shows Connected, Connecting or Offline
- **Dark Mode** — light/dark toggle that persists across refreshes via `localStorage`
- **Responsive** — works on desktop, tablet and mobile
- **Graceful Offline Demo** — CORS allows the frontend to be served from a separate local server, so the error state is visible when the API is stopped

## How to Run

**1. Install dependencies**

```bash
cd backend
npm install
```

**2. Start the server**

```bash
cd backend
npm start
```

Expected output:

```
TechBridge platform running at http://localhost:3000
Homepage:   http://localhost:3000/
Dashboard:  http://localhost:3000/dashboard.html
Challenges: http://localhost:3000/challenges.html
Admin:      http://localhost:3000/admin.html
Tasks:      http://localhost:3000/api/tasks
Reset demo data: npm run reset
```

**3. Open the platform**

| Page | URL |
| --- | --- |
| Homepage | <http://localhost:3000/> |
| Intern Dashboard | <http://localhost:3000/dashboard.html> |
| Challenge Hub | <http://localhost:3000/challenges.html> |
| Admin | <http://localhost:3000/admin.html> |

**4. Restore the demo data**

Changes made through the API are written to disk. Restore the original state at any time:

```bash
cd backend
npm run reset
```

### Demonstrating the error state

Because Express also serves the frontend, stopping the server stops the page too — so the error state cannot be seen from `localhost:3000`. CORS is enabled for this reason. To see it:

1. Open the dashboard using VS Code **Live Server** (`http://localhost:5500/frontend/dashboard.html`)
2. Stop the Express server with `Ctrl+C`
3. The dashboard shows "Unable to load tasks" and `Backend Status: Offline`
4. Restart the server and press **Try Again**

## API Endpoints

Base URL: `http://localhost:3000`

| Method | Endpoint | Purpose | Success | Errors |
| --- | --- | --- | --- | --- |
| GET | `/api/health` | Connectivity check | `200` `{ status, taskCount, challengeCount }` | — |
| GET | `/api/tasks` | All tasks | `200` array | `500` |
| GET | `/api/tasks?status=completed` | Filter by status | `200` array | `500` |
| GET | `/api/tasks?search=dashboard` | Search tasks | `200` array | `500` |
| GET | `/api/tasks/:id` | One task | `200` object | `400`, `404` |
| POST | `/api/tasks` | Create a task | `201` object | `400` |
| PUT | `/api/tasks/:id` | Update a task | `200` object | `400`, `404` |
| DELETE | `/api/tasks/:id` | Delete a task | `200` `{ deleted, id }` | `404` |
| GET | `/api/challenges` | All challenges | `200` array | `500` |
| GET | `/api/challenges?track=web-development` | Filter by track | `200` array | `500` |
| GET | `/api/challenges?difficulty=Advanced` | Filter by difficulty | `200` array | `500` |
| GET | `/api/challenges?search=quiz` | Search challenges | `200` array | `500` |
| GET | `/api/challenges/:id` | One challenge | `200` object | `400`, `404` |
| POST | `/api/challenges` | Create a challenge | `201` object | `400` |
| DELETE | `/api/challenges/:id` | Delete a challenge | `200` `{ deleted, id }` | `404` |

### Error format

```json
{ "error": { "status": 404, "message": "No task found with id 99." } }
```

### Validation

The server checks input rather than trusting the client. Task status must be one of `completed`, `in-progress`, `not-started`. A challenge needs a valid `track` (`data-analytics` or `web-development`) and a valid `difficulty` (`Beginner`, `Intermediate`, `Advanced`). Invalid values return `400`.

## Project Structure

```
techbridge-task-management/
├── frontend/
│   ├── index.html              Platform landing page with live API statistics
│   ├── dashboard.html          Intern dashboard — tasks, progress, search
│   ├── challenges.html         Challenge Hub with track/difficulty filters
│   ├── admin.html              Manage tasks and challenges
│   ├── programs.html           Learning programs
│   ├── roadmap.html            Track roadmap
│   ├── tasks.html              Internship task timeline
│   ├── styles/
│   │   └── style.css           All styling, including dark mode
│   └── scripts/
│       ├── api.js              Every fetch() call to the API
│       ├── theme.js            Dark mode toggle and localStorage
│       ├── home.js             Landing page statistics
│       ├── dashboard.js        Dashboard rendering and interaction
│       ├── challenges.js       Challenge Hub rendering and filters
│       └── admin.js            Admin CRUD operations
│
├── backend/
│   ├── server.js               Express app, middleware, static serving
│   ├── reset.js                Restores the seed data files
│   ├── package.json
│   ├── lib/
│   │   └── store.js            JSON file read/write helpers
│   ├── routes/
│   │   ├── tasks.js            Task endpoints
│   │   └── challenges.js       Challenge endpoints
│   └── data/
│       ├── tasks.json          Live task data
│       ├── tasks.seed.json     Seed copy for npm run reset
│       ├── challenges.json     Live challenge data
│       └── challenges.seed.json
│
├── assets/
│   └── images/
│       └── techbridge-logo.png
│
├── README.md
└── DEV_NOTE.md
```

## How the Frontend Talks to the Backend

`frontend/scripts/api.js` contains every `fetch()` call. It turns any failure — server down, 404, invalid JSON — into a thrown `Error` with a readable message, so each page handles success and failure in one place.

| Action | Request | Handler |
| --- | --- | --- |
| Page loads | `GET /api/tasks` + `GET /api/challenges` | `loadTasks()` / `loadChallenges()` / `loadAll()` / `loadStats()` |
| View Task | `GET /api/tasks/:id` | `openTaskModal(id)` |
| Mark as Completed | `PUT /api/tasks/:id` | `markCompleted(id)` |
| Add task | `POST /api/tasks` | `addTask()` |
| Delete task | `DELETE /api/tasks/:id` | `removeTask()` |
| View Challenge | `GET /api/challenges/:id` | `openModal(id)` |
| Add / delete challenge | `POST` / `DELETE /api/challenges/:id` | `addChallenge()` / `removeChallenge()` |

The server response is what updates the UI, so the displayed progress always reflects what the API actually stored.

## Testing the API

With the server running:

| Request | Expected |
| --- | --- |
| `GET /api/health` | `{ "status": "ok", "taskCount": 8, "challengeCount": 8 }` |
| `GET /api/tasks` | Array of 8 tasks |
| `GET /api/tasks/3` | Task with `id: 3` |
| `GET /api/tasks/99` | `404` error object |
| `GET /api/tasks?status=completed` | Only completed tasks |
| `GET /api/challenges` | Array of 8 challenges |
| `GET /api/challenges?track=web-development` | Only Web Development challenges |
| `GET /api/challenges?search=quiz` | Only the Online Quiz App |
| `PUT /api/tasks/6` with `{"status":"completed"}` | Updated task |
| `PUT /api/tasks/6` with `{"status":"done"}` | `400` — invalid status rejected |
| `POST /api/tasks` with title and description | `201` with generated id |
| `DELETE /api/tasks/9` | `{ "deleted": true, "id": 9 }` |
| `npm run reset` then `GET /api/tasks` | Original data restored |

## What This Project Covers

- Separating a frontend from a backend and connecting them over HTTP
- Designing REST endpoints and choosing status codes
- `fetch()`, promises, and handling asynchronous success and failure
- Loading, error and empty states for data that can be slow or missing
- Server-side input validation
- Persisting data without a database
- File-based modular routing in Express
- Progressive enhancement features: dark mode and `localStorage`
