const express = require("express");
const cors = require("cors");
const fs = require("fs");

const app = express();

app.use(cors());
app.use(express.json());

const FILE_PATH = "./data/tasks.json";

// Read Tasks
function getTasks() {
  const data = fs.readFileSync(FILE_PATH);
  return JSON.parse(data);
}

// Save Tasks
function saveTasks(tasks) {
  fs.writeFileSync(
    FILE_PATH,
    JSON.stringify(tasks, null, 2)
  );
}

// Home Route
app.get("/", (req, res) => {
  res.send("Personal Task Manager Backend Running");
});

// Get All Tasks
app.get("/tasks", (req, res) => {
  const tasks = getTasks();
  res.json(tasks);
});

// Add Task
app.post("/tasks", (req, res) => {
  const tasks = getTasks();

  const newTask = {
    id: Date.now(),
    title: req.body.title,
    completed: false
  };

  tasks.push(newTask);

  saveTasks(tasks);

  res.status(201).json(newTask);
});
// Delete Task
app.delete("/tasks/:id", (req, res) => {
  const tasks = getTasks();

  const updatedTasks = tasks.filter(
    (task) => task.id != req.params.id
  );

  saveTasks(updatedTasks);

  res.json({
    message: "Task Deleted Successfully"
  });
});
// put task 
app.put("/tasks/:id", (req, res) => {
  const tasks = getTasks();

  const updatedTasks = tasks.map((task) => {
    if (task.id == req.params.id) {
      task.completed = true;
    }
    return task;
  });

  saveTasks(updatedTasks);

  res.json({
    message: "Task Completed Successfully"
  });
});
app.listen(5000, () => {
  console.log("Server Running On Port 5000");
});