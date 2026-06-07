const API = "http://localhost:3000/api/tasks";

// Load tasks
async function loadTasks() {
    const response = await fetch(API);
    const tasks = await response.json();

    const taskList = document.getElementById("task-list");

    taskList.innerHTML = "";

    tasks.forEach(task => {
        taskList.innerHTML += `
        <div class="task">
            <span class="${task.completed ? 'completed' : ''}">
                ${task.title}
            </span>

            <div>
                <button onclick="completeTask('${task.id}', ${!task.completed})">
                    ${task.completed ? "Undo" : "Complete"}
                </button>

                <button onclick="deleteTask('${task.id}')">
                    Delete
                </button>
            </div>
        </div>
        `;
    });
}

// Add task
async function addTask() {
    const title = document.getElementById("taskInput")?.value || 
                  document.getElementById("title").value;

    if (!title) return;

    await fetch(API, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ title })
    });

    // clear input safely
    if (document.getElementById("taskInput")) {
        document.getElementById("taskInput").value = "";
    } else {
        document.getElementById("title").value = "";
    }

    loadTasks();
}

// Delete task
async function deleteTask(id) {
    await fetch(`${API}/${id}`, {
        method: "DELETE"
    });

    loadTasks();
}

// Toggle complete (FIXED → PATCH)
async function completeTask(id, completed) {
    await fetch(`${API}/${id}`, {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ completed })
    });

    loadTasks();
}

// initial load
loadTasks();