const express = require("express");
const fs = require("fs");
const path = require("path");
const cors = require("cors");
const { randomUUID } = require("crypto");

const app = express();
const PORT = process.env.PORT || 3000;

const DATA_FILE = path.join(__dirname, "tasks.json");

// --------------------
// Middleware
// --------------------
app.use(cors());
app.use(express.json());

// --------------------
// Read tasks safely
// --------------------
function readTasks() {
  try {
    if (!fs.existsSync(DATA_FILE)) return [];

    const data = fs.readFileSync(DATA_FILE, "utf8");
    const parsed = JSON.parse(data || "[]");

    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.error("Read error:", err);
    return [];
  }
}

// --------------------
// Write tasks safely
// --------------------
function writeTasks(tasks) {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(tasks, null, 2));
  } catch (err) {
    console.error("Write error:", err);
  }
}

// --------------------
// GET all tasks
// --------------------
app.get("/api/tasks", (req, res) => {
  const tasks = readTasks();

  const sorted = tasks.sort((a, b) => {
    return (b.order ?? 0) - (a.order ?? 0);
  });

  res.json(sorted);
});

// --------------------
// CREATE task
// --------------------
app.post("/api/tasks", (req, res) => {
  const { title, description = "", dueDate = null } = req.body;

  if (!title || !title.trim()) {
    return res.status(400).json({ error: "Title is required" });
  }

  const tasks = readTasks();

  const newTask = {
    id: randomUUID(),
    title: title.trim(),
    description: description.trim(),
    dueDate,
    completed: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    order: tasks.length + 1
  };

  tasks.push(newTask);
  writeTasks(tasks);

  res.status(201).json({
    success: true,
    data: newTask
  });
});

// --------------------
// UPDATE task (PATCH)
// --------------------
app.patch("/api/tasks/:id", (req, res) => {
  const { id } = req.params;
  const tasks = readTasks();

  const task = tasks.find(t => t.id === id);

  if (!task) {
    return res.status(404).json({ error: "Task not found" });
  }

  const { title, description, dueDate, completed, order } = req.body;

  if (title !== undefined) {
    if (!title.trim()) {
      return res.status(400).json({ error: "Title cannot be empty" });
    }
    task.title = title.trim();
  }

  if (description !== undefined) {
    task.description = description.trim();
  }

  if (dueDate !== undefined) {
    task.dueDate = dueDate;
  }

  if (completed !== undefined) {
    task.completed = Boolean(completed);
  }

  if (order !== undefined) {
    task.order = Number(order);
  }

  task.updatedAt = new Date().toISOString();

  writeTasks(tasks);

  res.json({
    success: true,
    data: task
  });
});

// --------------------
// DELETE task
// --------------------
app.delete("/api/tasks/:id", (req, res) => {
  const { id } = req.params;

  let tasks = readTasks();

  const index = tasks.findIndex(t => t.id === id);

  if (index === -1) {
    return res.status(404).json({ error: "Task not found" });
  }

  const deleted = tasks.splice(index, 1);

  writeTasks(tasks);

  res.json({
    success: true,
    data: deleted[0]
  });
});

// --------------------
// Root route
// --------------------
app.get("/", (req, res) => {
  res.send("🚀 Task Manager API is running");
});

// --------------------
// Start server
// --------------------
app.listen(PORT, () => {
  console.log(`🚀 Task Manager running at http://localhost:${PORT}`);
});