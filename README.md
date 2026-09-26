# TechBridge Task Management API — Task 7

A backend API for the TechBridge internship platform, connected to the Intern Dashboard built in Task 6.

Before this task the dashboard kept its eight internship tasks inside a JavaScript array, so the information was trapped in the page. Task 7 moves that data behind a REST API: the dashboard now *requests* tasks from an Express server, and any status change is *sent back* to it.

```
TechBridge Website
        ↓
  Intern Dashboard  (frontend/dashboard.html + js/dashboard.js)
        ↓  fetch()
     REST API        (http://localhost:3000/api)
        ↓
  Node.js + Express (backend/server.js)
        ↓
   Task Data        (backend/data/tasks.json)
```

## Project structure

```
techbridge-task-management/
├── frontend/
│   ├── index.html
│   ├── dashboard.html          ← dashboard now reads from the API
│   ├── challenges.html
│   ├── roadmap.html
│   ├── tasks.html
│   ├── programs.html
│   ├── style.css
│   ├── js/
│   │   ├── api.js              ← every fetch() call lives here
│   │   └── dashboard.js        ← rendering, filters, modal, progress
│   └── images/
│
└── backend/
    ├── server.js               ← Express app and all API routes
    ├── package.json
    ├── package-lock.json
    ├── node_modules/
    └── data/
        ├── tasks.json          ← live data, updated by PUT / POST / DELETE
        └── tasks.seed.json     ← pristine copy used by npm run reset
```

## How to run

**1. Install dependencies**

```bash
cd backend
npm install
```

**2. Start the API**

```bash
cd backend
npm start
```

You should see:

```
TechBridge API running at http://localhost:3000
Homepage:       http://localhost:3000/
Dashboard:      http://localhost:3000/dashboard.html
Tasks:          http://localhost:3000/api/tasks
Reset demo data: npm run reset
```

**3. Open the dashboard**

Go to <http://localhost:3000/dashboard.html> (the TechBridge homepage is at <http://localhost:3000/>).

The Express server also serves the frontend, so the whole project runs from one server. The API still allows cross-origin requests, so the dashboard can equally be opened from VS Code Live Server (`http://localhost:5500/frontend/dashboard.html`) — that is the better option for testing the "backend offline" behaviour, because the page keeps loading after the API is stopped.

**4. Restore the demo data at any time**

```bash
cd backend
npm run reset
```

## API endpoints

Base URL: `http://localhost:3000`

| Method | Endpoint | Purpose | Success | Errors |
| --- | --- | --- | --- | --- |
| GET | `/api/health` | Connectivity check used by the Connected / Offline indicator | `200` `{ status, taskCount, timestamp }` | — |
| GET | `/api/tasks` | Get all tasks | `200` array of task objects | `500` |
| GET | `/api/tasks?status=completed` | Filter tasks by status (server side) | `200` filtered array | `500` |
| GET | `/api/tasks?search=dashboard` | Search titles and descriptions (server side) | `200` matching array | `500` |
| GET | `/api/tasks/:id` | Get one specific task | `200` task object | `400` non-numeric id, `404` unknown id |
| POST | `/api/tasks` | Create a new task (optional challenge) | `201` created task | `400` missing title/description or invalid status |
| PUT | `/api/tasks/:id` | Update an existing task, mainly its status | `200` updated task | `400` invalid status, `404` unknown id |
| DELETE | `/api/tasks/:id` | Remove a task (optional challenge) | `200` `{ deleted, id }` | `404` unknown id |

### HTTP methods used in this project

- **GET** — retrieve information. `GET /api/tasks` means *"give me the tasks"*. GET never changes data.
- **PUT** — update existing information. `PUT /api/tasks/3` with `{"status":"completed"}` means *"update Task 3"*. The full resource is replaced by the update, which is why the status must be sent every time.
- **POST** — create a new resource. The server generates the `id`.
- **DELETE** — remove a resource.

### Task object shape

```json
{
  "id": 6,
  "title": "Build the Task Submission System",
  "description": "Create an interface through which interns can prepare and submit their task work.",
  "details": "Build an interface where interns can prepare, review and submit their task work for review by the TechBridge team.",
  "day": 19,
  "difficulty": "Intermediate",
  "status": "in-progress"
}
```

`status` is always one of `completed`, `in-progress`, `not-started`. The server validates this against a whitelist, so invalid data can never be stored no matter what the frontend sends.

### Error shape

Every failure returns the same structure with a matching HTTP status code:

```json
{ "error": { "status": 404, "message": "No task found with id 99." } }
```

## How the frontend is wired to the API

`frontend/js/api.js` contains every `fetch()` call, so all network code is in one file. It converts any failure — server down, 404, bad JSON — into a thrown `Error` with a readable message, which means `dashboard.js` handles success and failure in the same place.

| Dashboard action | Request | Code |
| --- | --- | --- |
| Page loads | `GET /api/tasks` | `loadTasks()` |
| "View Task" clicked | `GET /api/tasks/:id` | `openTaskModal(id)` |
| "Mark as Completed" clicked | `PUT /api/tasks/:id` | `markCompleted(id)` |
| "Add via API" submitted | `POST /api/tasks` | `addTask()` |
| "Delete" clicked | `DELETE /api/tasks/:id` | `removeTask()` |
| Any page load | `GET /api/tasks` | `setApiState()` via the pill |

The dashboard keeps a single `tasks` array as its render source, but that array is now **populated by the API** instead of being hardcoded. `renderStats()` and `renderTasks()` rebuild the progress numbers, the cards and the filters from it, so the displayed percentage is always whatever the server reports.

### States the dashboard handles

- **Loading** — a spinner and "Loading tasks..." while the request is in flight.
- **Ready** — the task cards, progress bar and statistics.
- **Error** — "Unable to load tasks." with the reason and a "Try Again" button, plus `Backend Status: Offline`.
- **Empty** — no tasks match the current filter or search, with a hint to reset them.
- **Pending** — the clicked button is disabled and reads "Saving..." so a task cannot be updated twice.
- **Rollback** — if a `PUT` fails, the task is left unchanged and a red toast explains why.

## Endpoints to test

With the server running (`cd backend && npm start`):

| # | Request | Expected |
| --- | --- | --- |
| 1 | `GET /api/health` | `{ "status": "ok", "taskCount": 8, ... }` |
| 2 | `GET /api/tasks` | JSON array of 8 tasks |
| 3 | `GET /api/tasks/3` | The single task with `id: 3` |
| 4 | `GET /api/tasks/99` | `404` with an error message |
| 5 | `GET /api/tasks?status=completed` | Only the 5 completed tasks |
| 6 | `GET /api/tasks?search=dashboard` | Only tasks matching "dashboard" |
| 7 | `PUT /api/tasks/6` body `{"status":"completed"}` | The updated task, `status: "completed"` |
| 8 | `PUT /api/tasks/6` body `{"status":"done"}` | `400` — invalid status rejected |
| 9 | `POST /api/tasks` body `{"title":"Test","description":"Test task"}` | `201` with a generated `id` |
| 10 | `DELETE /api/tasks/9` | `{ "deleted": true, "id": 9 }` |
| 11 | `GET /api/tasks` after steps 7–10 | Data reflects every change |
| 12 | `npm run reset` then `GET /api/tasks` | Original 8 tasks restored |

## What this project taught

- A **backend** is the server-side code that owns the data; a **frontend** is what the user sees. Splitting them means the data outlives any single page.
- An **API** is a contract: a set of URLs and HTTP methods anyone can call without knowing the internals.
- **REST** means resources (URLs like `/api/tasks/3`) manipulated with HTTP methods (GET, POST, PUT, DELETE) and exchanged as JSON.
- `fetch()` returns a promise, so network code is asynchronous — the page must handle "not arrived yet" and "never arrived" as normal cases, which is what the loading and error states are.
- **The server must validate input.** The frontend sending a valid status does not mean the status is valid.
