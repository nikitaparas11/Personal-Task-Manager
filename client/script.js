const BASE_URL = "https://personal-task-manager-kfzs.onrender.com";
const API = `${BASE_URL}/api/tasks`;
let allTasks = [];
let currentFilter = "all";
let editingTaskId = null;

// Elements
const taskList = document.getElementById("task-list");
const counts = document.getElementById("counts");
const emptyState = document.getElementById("empty");
const toast = document.getElementById("toast");
const editDialog = document.getElementById("edit-dialog");
const editForm = document.getElementById("edit-form");

// ======================
// Toast Notification
// ======================
function showToast(message, type = "success") {
  toast.textContent = message;
  toast.className = `toast show ${type}`;

  setTimeout(() => {
    toast.className = "toast";
  }, 2500);
}

// ======================
// Load Tasks
// ======================
async function loadTasks() {
  try {
    const response = await fetch(API);

    if (!response.ok) throw new Error("Failed to fetch");

    allTasks = await response.json();

    updateCounts();
    renderTasks();

  } catch (error) {
    console.error(error);

    taskList.innerHTML = `<li class="task">Could not load tasks</li>`;

    showToast("Failed to load tasks", "error");
  }
}

// ======================
// Render Tasks
// ======================
function renderTasks() {
  let tasks = [...allTasks];

  const searchText = document
    .getElementById("search")
    .value
    .toLowerCase();

  if (currentFilter === "active") {
    tasks = tasks.filter(t => !t.completed);
  }

  if (currentFilter === "completed") {
    tasks = tasks.filter(t => t.completed);
  }

  tasks = tasks.filter(task =>
    task.title.toLowerCase().includes(searchText)
  );

  taskList.innerHTML = "";

  if (tasks.length === 0) {
    emptyState.classList.remove("hidden");
    return;
  }

  emptyState.classList.add("hidden");

  tasks.forEach(task => {
    const overdue =
      task.dueDate &&
      !task.completed &&
      new Date(task.dueDate) < new Date();

    taskList.innerHTML += `
      <li class="task">
        <h3>
          ${task.completed ? "✅" : "📌"} ${task.title}
        </h3>

        ${
          task.description
            ? `<p>${task.description}</p>`
            : ""
        }

        <small style="color:${overdue ? "#ffb347" : "#9aa9bd"}">
          Due: ${task.dueDate || "No due date"}
          ${overdue ? " • Overdue" : ""}
        </small>

        <div class="actions">
          <button onclick="editTask('${task.id}')">Edit</button>

          <button onclick="completeTask('${task.id}', ${!task.completed})">
            ${task.completed ? "Undo" : "Complete"}
          </button>

          <button class="danger" onclick="deleteTask('${task.id}')">
            Delete
          </button>
        </div>
      </li>
    `;
  });
}

// ======================
// Update Counts
// ======================
function updateCounts() {
  const active = allTasks.filter(t => !t.completed).length;
  const completed = allTasks.filter(t => t.completed).length;

  counts.textContent = `${active} active • ${completed} completed`;
}

// ======================
// Add Task
// ======================
async function addTask() {
  const title = document.getElementById("title").value.trim();
  const description = document.getElementById("description").value.trim();
  const dueDate = document.getElementById("dueDate").value;

  if (!title) {
    showToast("Title is required", "error");
    return;
  }

  try {
    const response = await fetch(API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, description, dueDate })
    });

    if (!response.ok) throw new Error();

    document.getElementById("title").value = "";
    document.getElementById("description").value = "";
    document.getElementById("dueDate").value = "";

    await loadTasks();

    showToast("Task added successfully");

  } catch (error) {
    console.error(error);
    showToast("Failed to add task", "error");
  }
}

// ======================
// Edit Task
// ======================
function editTask(id) {
  const task = allTasks.find(t => t.id === id);
  if (!task) return;

  editingTaskId = id;

  document.getElementById("edit-title").value = task.title;
  document.getElementById("edit-description").value = task.description || "";
  document.getElementById("edit-dueDate").value = task.dueDate || "";

  editDialog.showModal();
}

// ======================
// Save Edit
// ======================
editForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  try {
    const response = await fetch(`${API}/${editingTaskId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: document.getElementById("edit-title").value,
        description: document.getElementById("edit-description").value,
        dueDate: document.getElementById("edit-dueDate").value
      })
    });

    if (!response.ok) throw new Error();

    editDialog.close();
    await loadTasks();

    showToast("Task updated");

  } catch (error) {
    console.error(error);
    showToast("Update failed", "error");
  }
});

// ======================
// Delete Task
// ======================
async function deleteTask(id) {
  if (!confirm("Delete this task?")) return;

  try {
    const response = await fetch(`${API}/${id}`, {
      method: "DELETE"
    });

    if (!response.ok) throw new Error();

    await loadTasks();
    showToast("Task deleted");

  } catch (error) {
    console.error(error);
    showToast("Delete failed", "error");
  }
}

// ======================
// Complete / Undo Task
// ======================
async function completeTask(id, completed) {
  try {
    const response = await fetch(`${API}/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ completed })
    });

    if (!response.ok) throw new Error();

    await loadTasks();

    showToast(
      completed ? "Task completed" : "Task marked active"
    );

  } catch (error) {
    console.error(error);
    showToast("Update failed", "error");
  }
}

// ======================
// Events
// ======================
document.getElementById("new-task-form")
  .addEventListener("submit", (e) => {
    e.preventDefault();
    addTask();
  });

document.getElementById("search")
  .addEventListener("input", renderTasks);

document.querySelectorAll(".filter")
  .forEach(button => {
    button.addEventListener("click", () => {
      document.querySelectorAll(".filter")
        .forEach(btn => btn.classList.remove("active"));

      button.classList.add("active");
      currentFilter = button.dataset.filter;

      renderTasks();
    });
  });

// ======================
// Init
// ======================
loadTasks();