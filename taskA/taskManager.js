const fs = require('fs');
const readline = require('readline');

function createPrivateCounter() {
    let count = 0;
    return {
         increment: function() 
         { return ++count; },
        decrement: function()
         { return --count; },
        getCount: function() 
        { return count; },
    };
}
const taskCounter = createPrivateCounter();
let tasks = [];

function loadTasks() {
    try{
        const data = fs.readFileSync('tasks.json', 'utf8');
        tasks = JSON.parse(data);
    }
    catch (err) {
        throw new Error('No existing tasks found. Starting with an empty task list.');
        tasks = [];
    }

}

function saveTasks(){
    fs.writeFileSync('tasks.json', JSON.stringify(tasks, null, 2));
}
function showStats() {
    if (tasks.length === 0) {
        console.log("No tasks available.");
        return;
    }
    const hasHighPriority = tasks.some(task => task.priority === 'high');
    const allCompleted = tasks.every(task => task.completed);
    const completedCount = tasks.filter(task => task.completed).length;
    console.log("Task Statistics:");
console.log(
    "total tasks: " + taskCounter.getCount() +
    "high priority tasks: " + hasHighPriority + 
    "all tasks completed: " + allCompleted  +
    "completed tasks: " + completedCount
);
}   
function askQuestion(query) {
    return new Promise(resolve => rl.question(query, resolve));
}
async function mainMenu() {
    console.log("\nTask Manager");
    console.log("1. Add Task");
    console.log("2. View Tasks");
    console.log("3. Remove Task");
    console.log("4. Search Tasks");
    console.log ("5. Sort Task");
    console.log("6. Show Statistics");
    console.log("7. Exit");
   const option = await askQuestion("Choose an option: ");

    if (option === '1') {
        const description = await askQuestion("Enter task description: ");
        const priority = await askQuestion("Enter task priority (low, medium, high): ");
        const dueDate = await askQuestion("Due date (YYYY-MM-DD): ");
        
        tasks.push({ name: description, priority, dueDate, completed: false });
        taskCounter.increment();
        saveTasks();
        console.log("Task added successfully!");
        mainMenu();

        } else if (option === '2') {
            console.log("Tasks:" ,tasks);
            mainMenu();
        }

        else if (option === '3') {
        const name = await askQuestion("Enter task name to remove: ");
        const initialLength = tasks.length;
        tasks = tasks.filter(task => task.name !== name);
                if (tasks.length < initialLength) {
                    taskCounter.decrement();
                    saveTasks();
                    console.log("Task removed successfully!");
        } else {
            console.log("Task not found.");
        }   
        mainMenu();
}
else if (option === '4') {
        const keyword = await askQuestion("Enter keyword to search: ");
        const result = tasks.filter(task => task.name.includes(keyword) || task.priority.includes(keyword));
        console.log("Search results:", result);
        mainMenu();

    } else if (option === '5') {
        const criteria = await askQuestion("Sort by (name, priority, dueDate): ");
        
        tasks.sort((a, b) => {
            if (criteria === 'dueDate') {
                return new Date(a.dueDate) - new Date(b.dueDate);
            } else {
                return a[criteria] < b[criteria] ? -1 : a[criteria] > b[criteria] ? 1 : 0;
            }
        });
        console.log("Tasks sorted by " + criteria);
        mainMenu();

} else if (option === '6') {
    showStats();
    mainMenu();
} else if (option === '7') {
    console.log("Exitied");
    rl.close();
}   
else {
    console.log("Invalid option. Please try again.");
    mainMenu();
}
    };
    const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

loadTasks();
mainMenu();
