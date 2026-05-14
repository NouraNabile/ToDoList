let promisDB = idb.open("TasksDB", 2,upgradeDB=>{
      upgradeDB.createObjectStore("TasksStore", { keyPath: "taskName" });
    })

let taskBtn = document.getElementById("taskInput");
let hhBtn = document.getElementById("hours");
let mmBtn = document.getElementById("minutes");
let addTaskButton = document.getElementById('addTaskButton')
let dayBtn = document.getElementById("days");
let monthBtn = document.getElementById("months");
let yearBtn = document.getElementById("years");
let taskCount = document.getElementById("taskCount");
let clearAllButton = document.getElementById("clearTasksButton");
let taskList = document.getElementById("taskList");
let tasks = [];



addTaskButton.addEventListener('click', function() {
    let task = taskBtn.value;
    let hours = parseInt(hhBtn.value);
    let minutes = parseInt(mmBtn.value);
    let day = parseInt(dayBtn.value);
    let month = parseInt(monthBtn.value);
    let year = parseInt(yearBtn.value);

if(Number.isNaN(hours) || hours > 24 || hours < 0){
    alert("Hours must be between 0 and 12");
    return;
}
else if(Number.isNaN(minutes) || minutes > 60 || minutes < 0){
    alert("Minutes must be between 0 and 60");
    return;
}
else if(Number.isNaN(day) || day > 31 || day < 1){
    alert("Day must be between 1 and 31");
    return;
}
else if(Number.isNaN(month) || month < 1 || month > 12){
    alert("Month must be between 1 and 12");
    return;
}
else if(Number.isNaN(year) || year < 2023){
    alert("Year must be a valid year");
    return;
}
add(task,hours,minutes,day,month,year);
Show();
});

function add(task,hours,minutes,day,month,year){
    let obj={};
    obj = {
    taskName: task,
    hours: hours,
    minutes: minutes,
    day: day,
    month: month,
    year: year,
    notified:false,
    itIsTime:false
}
// tasks.push(obj);//locally
pushToDB(obj)
// console.log(tasks);
}
function pushToDB(obj) {
    promisDB.then(function(db) {
        var tx = db.transaction("TasksStore", "readwrite");
        var store = tx.objectStore("TasksStore");
        store.put(obj);
        return tx.complete; // 
    }).then(function() {
        loadFromDB(); // 
    }).catch(function(error) {
        console.error("Error saving task:", error);
    });
}


function loadFromDB() {
    promisDB.then(function(db) {
        var tx = db.transaction("TasksStore", "readonly");
        var store = tx.objectStore("TasksStore");
        return store.getAll();
    }).then(function(allTasks) {
        tasks = allTasks;
        // sorted();
        taskList.innerHTML = "";
        Show();
    }).catch(function(error) {
        console.error("Error loading tasks:", error);
    });
}
function Show(){
    document.getElementById("emptyState").style.display = "none";
    taskList.innerHTML = "";
    for (let i = 0; i < tasks.length; i++) {
        
        let li = document.createElement("li");
        li.className = "flex items-center justify-between gap-3 px-4 py-3 mb-2 border border-gray-200 rounded-lg";

        let span = document.createElement("span");
        span.className = "flex-1 text-sm text-gray-700";
        span.textContent = `${tasks[i].taskName} — ${tasks[i].hours}:${tasks[i].minutes} ${tasks[i].day}/${tasks[i].month}/${tasks[i].year}`;

        let btn = document.createElement("button");
        btn.className = "px-3 py-1 text-sm text-red-500 border border-red-400 rounded-md hover:bg-red-500 hover:text-white transition-colors cursor-pointer";
        btn.textContent = "Delete";
        btn.onclick = () => deleteTask(i);

        li.appendChild(span);
        li.appendChild(btn);
        taskList.appendChild(li);
    }
     taskCount.textContent = tasks.length + " Tasks";
}
// function deleteTask(index) {
//     tasks.splice(index, 1);
//     taskList.innerHTML = "";
//     Show();
// }
function deleteTask(index) {
    let taskName = tasks[index].taskName; // get key first
    promisDB.then(function(db) {
        var tx = db.transaction("TasksStore", "readwrite");
        var store = tx.objectStore("TasksStore");
        store.delete(taskName);
        return tx.complete; // wait for transaction to complete
        // tx.oncomplete = () => loadFromDB();
    }).then(function() {
        loadFromDB(); // reload tasks after deletion
    }).catch(function(error) {
        console.error("Error deleting task:", error);
    });
}
// clearAllButton.addEventListener('click', function() {
//     tasks = [];
//     taskList.innerHTML = "";
//     taskCount.textContent = tasks.length + " Tasks";
//     Show()
// })
clearAllButton.addEventListener('click', function() {
    promisDB.then(function(db) {
        var tx = db.transaction("TasksStore", "readwrite");
        var store = tx.objectStore("TasksStore");
        store.clear();
        tx.oncomplete = () => {
            tasks = [];
            taskList.innerHTML = "";
            taskCount.textContent = "0 Tasks";
        };
    });
});
/////notifications/////////////////////////////////////////////////////////
window.onload = function() {
  loadFromDB();
  navigator.serviceWorker.register('sw.js')
  .then(function(registration) {
    console.log('Service Worker registered with scope:', registration.scope);
  }).catch(function(error) {
    console.log('Service Worker registration failed:', error);
  });
}

document.getElementById("notificationsButton").onclick = function() {
    if(Notification.permission === "granted"){
    setInterval(checkNotifications, 1000);
}}

function checkNotifications(){
  if (tasks.length === 0) return;
  let now = new Date();
  let taskDate=new Date(
    tasks[0].year,
    tasks[0].month - 1,
    tasks[0].day,
    tasks[0].hours,
    tasks[0].minutes);
    if(now.getTime() >= taskDate.getTime() && !tasks[0].notified){
        // console.log(now);
        // console.log(taskDate);
        // tasks[0].itIsTime = true;
        navigator.serviceWorker.getRegistration()
        .then(reg => {
            reg.showNotification("Task Reminder", {
                body: tasks[0].taskName,
                icon: "./assets/notification-icon.png"
            });
        });
        tasks[0].notified = true;
    }
}