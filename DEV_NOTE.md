# Developer Note — TechBridge Task Management API (Task 7)

For Task 7, I built a backend API for the TechBridge platform and connected it to the Intern Dashboard from Task 6. In Task 6 the eight internship tasks were stored in a JavaScript array inside the dashboard file, so the data was trapped in the page. That array is now gone. The dashboard requests the tasks from an Express server, and a status change is sent back to the server instead of only being applied in the browser.

The server runs on port 3000 and stores the tasks in `data/tasks.json`, which acts as a simple database. It exposes `GET /api/tasks` for all tasks, `GET /api/tasks/:id` for one task, `PUT /api/tasks/:id` to update a status, and `GET /api/health` for the connection indicator, plus `POST` and `DELETE` for adding and removing tasks. The server checks the status against a list of allowed values and returns 400 or 404 with a consistent error shape when a request fails.

On the frontend, I moved every fetch call into `js/api.js` and left `js/dashboard.js` for rendering. The dashboard shows a loading state while it waits, an error state with a Try Again button when the server cannot be reached, and an empty state when nothing matches the filter or search. Marking a task completed sends a PUT request and updates the card, counts and progress bar only once the server responds. View Task requests one task by id and shows it in the existing modal.

One thing worth noting: because Express also serves the frontend, stopping the server stops the page as well, so the error state cannot be seen from `localhost:3000`. I enabled CORS so the dashboard can also be opened from VS Code Live Server, which is how the offline behaviour is demonstrated.
