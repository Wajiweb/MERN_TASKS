import * as fs from 'fs';
import * as readline from 'readline';

enum Priority {
    Low = 'low',
    Medium = 'medium',
    High = 'high',
}
interface Task {
    name: string;
    priority: Priority;
    dueDate: string;
    completed: boolean;
}

interface TaskCounter {
    increment: () => number;
    decrement: () => number;
    getCount: () => number;
}

function createPrivateCounter(): TaskCounter {
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
let tasks : Task[] = [];

function loadTasks(): void {
    try{
        const data = fs.readFileSync('tasks.json', 'utf8');
        tasks = JSON.parse(data);
    }
    catch (err) {
        throw new Error('No existing tasks found. Starting with an empty task list.');
        tasks = [];
    }

}

function saveTasks(): void{
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
function askQuestion(query: string): Promise<string> {
    return new Promise(resolve => rl.question(query, resolve));
};
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
        const priorityInput = await askQuestion("Enter task priority (low, medium, high): ");
        const priorityNormalized = priorityInput.toLowerCase();
        const dueDate = await askQuestion("Due date (YYYY-MM-DD): ");
        const priority = Object.values(Priority).includes(priorityNormalized as Priority)
    ? (priorityNormalized as Priority)
    : Priority.Low; 
        
        tasks.push({ name: description, priority, dueDate, completed: false });
        taskCounter.increment();
        saveTasks();
        console.log("Task added successfully!");
        mainMenu();

        } else if (option === '2') {
            console.log("\nTasks:" ,tasks);
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
                return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
            } else {
                return a[criteria as keyof Task] < b[criteria as keyof Task] ? -1 : a[criteria as keyof Task] > b[criteria as keyof Task] ? 1 : 0;
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
