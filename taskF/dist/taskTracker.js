"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs = __importStar(require("fs"));
const readline = __importStar(require("readline"));
var Priority;
(function (Priority) {
    Priority["Low"] = "low";
    Priority["Medium"] = "medium";
    Priority["High"] = "high";
})(Priority || (Priority = {}));
function createPrivateCounter() {
    let count = 0;
    return {
        increment: function () { return ++count; },
        decrement: function () { return --count; },
        getCount: function () { return count; },
    };
}
const taskCounter = createPrivateCounter();
let tasks = [];
function loadTasks() {
    try {
        const data = fs.readFileSync('tasks.json', 'utf8');
        tasks = JSON.parse(data);
    }
    catch (err) {
        throw new Error('No existing tasks found. Starting with an empty task list.');
        tasks = [];
    }
}
function saveTasks() {
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
    console.log("total tasks: " + taskCounter.getCount() +
        "high priority tasks: " + hasHighPriority +
        "all tasks completed: " + allCompleted +
        "completed tasks: " + completedCount);
}
function askQuestion(query) {
    return new Promise(resolve => rl.question(query, resolve));
}
;
function mainMenu() {
    return __awaiter(this, void 0, void 0, function* () {
        console.log("\nTask Manager");
        console.log("1. Add Task");
        console.log("2. View Tasks");
        console.log("3. Remove Task");
        console.log("4. Search Tasks");
        console.log("5. Sort Task");
        console.log("6. Show Statistics");
        console.log("7. Exit");
        const option = yield askQuestion("Choose an option: ");
        if (option === '1') {
            const description = yield askQuestion("Enter task description: ");
            const priorityInput = yield askQuestion("Enter task priority (low, medium, high): ");
            const priorityNormalized = priorityInput.toLowerCase();
            const dueDate = yield askQuestion("Due date (YYYY-MM-DD): ");
            const priority = Object.values(Priority).includes(priorityNormalized)
                ? priorityNormalized
                : Priority.Low;
            tasks.push({ name: description, priority, dueDate, completed: false });
            taskCounter.increment();
            saveTasks();
            console.log("Task added successfully!");
            mainMenu();
        }
        else if (option === '2') {
            console.log("\nTasks:", tasks);
            mainMenu();
        }
        else if (option === '3') {
            const name = yield askQuestion("Enter task name to remove: ");
            const initialLength = tasks.length;
            tasks = tasks.filter(task => task.name !== name);
            if (tasks.length < initialLength) {
                taskCounter.decrement();
                saveTasks();
                console.log("Task removed successfully!");
            }
            else {
                console.log("Task not found.");
            }
            mainMenu();
        }
        else if (option === '4') {
            const keyword = yield askQuestion("Enter keyword to search: ");
            const result = tasks.filter(task => task.name.includes(keyword) || task.priority.includes(keyword));
            console.log("Search results:", result);
            mainMenu();
        }
        else if (option === '5') {
            const criteria = yield askQuestion("Sort by (name, priority, dueDate): ");
            tasks.sort((a, b) => {
                if (criteria === 'dueDate') {
                    return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
                }
                else {
                    return a[criteria] < b[criteria] ? -1 : a[criteria] > b[criteria] ? 1 : 0;
                }
            });
            console.log("Tasks sorted by " + criteria);
            mainMenu();
        }
        else if (option === '6') {
            showStats();
            mainMenu();
        }
        else if (option === '7') {
            console.log("Exitied");
            rl.close();
        }
        else {
            console.log("Invalid option. Please try again.");
            mainMenu();
        }
    });
}
;
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});
loadTasks();
mainMenu();
