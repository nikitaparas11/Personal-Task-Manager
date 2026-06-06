const API = "http://localhost:5000/tasks";

async function loadTasks() {

    const response = await fetch(API);
    const tasks = await response.json();

    const taskList = document.getElementById("taskList");

    taskList.innerHTML = "";

    tasks.forEach(task => {

        taskList.innerHTML += `
        <div class="task">
            <span class="${task.completed ? 'completed' : ''}">
                ${task.title}
            </span>

            <div>
                <button onclick="completeTask(${task.id})">
                    Complete
                </button>

                <button onclick="deleteTask(${task.id})">
                    Delete
                </button>
            </div>
        </div>
        `;
    });
}

async function addTask(){

    const title =
    document.getElementById("taskInput").value;

    if(title==="") return;

    await fetch(API,{
        method:"POST",
        headers:{
            "Content-Type":"application/json"
        },
        body:JSON.stringify({title})
    });

    document.getElementById("taskInput").value="";

    loadTasks();
}

async function deleteTask(id){

    await fetch(`${API}/${id}`,{
        method:"DELETE"
    });

    loadTasks();
}

async function completeTask(id){

    await fetch(`${API}/${id}`,{
        method:"PUT"
    });

    loadTasks();
}

loadTasks();