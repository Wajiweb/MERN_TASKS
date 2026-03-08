function debounce(func, delay) {
    let timer;
    return function (e) {
        clearTimeout(timer);
        timer = setTimeout(() => func.apply(this, e), delay);
    };
}

function throttle(func, limit) {
    let waiting = false;
return (e) => {
    if (!waiting) {
        func(e);
        waiting = true;
        setTimeout(() => waiting = false, limit);
    }
};
}
const taskForm = document.getElementById('task-form');
const taskNameInput = document.getElementById('task-name');
const userEmailInput = document.getElementById('user-email');
const emailError = document.getElementById('email-error');
const nameError = document.getElementById('name-error'); 
const taskList = document.getElementById('task-list');

let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
function saveTasks() {
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

function renderTasks() {
    taskList.innerHTML = '';
    tasks.forEach(task => { const li = document.createElement('li');
        li.className = 'task-item';
        li.innerHTML = `
        <div class="task-content">
        <strong>${task.name}</strong>
        <span>${task.email}</span>
        </div>
        <button class="delete-btn" data-id="${task.id}">Delete</button>
        `;
        taskList.appendChild(li);
    });
}

  function checkEmail(e) {
      const email = e.target.value.trim();
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; 
    
    if (email === '') {
        emailError.textContent = '';
        userEmailInput.classList.remove('is-invalid', 'is-valid');
    } else if (!regex.test(email)) {
        emailError.textContent = 'Please enter a valid email address.';
        userEmailInput.classList.add('is-invalid');
        userEmailInput.classList.remove('is-valid');
    } else {
        emailError.textContent = '';
        userEmailInput.classList.add('is-valid');
        userEmailInput.classList.remove('is-invalid');
    }
  }
  const validateEmail = debounce(checkEmail, 300);
  userEmailInput.addEventListener('input', validateEmail);
    
taskList.addEventListener('submit', (e) => {
    e.preventDefault();
     const name = taskNameInput.value.trim();
    const email = userEmailInput.value.trim();

    if (!name || !email || userEmailInput.classList.contains('is-invalid')) {
        alert('Please provide a valid task name and email.');
        return;
    }

    const newTask = { id: Date.now(), name, email };
    tasks.push(newTask);
    saveTasks();
    renderTasks();
    taskForm.reset();
    userEmailInput.classList.remove('is-valid');
});
taskForm.addEventListener('click', (e) => {
   if (e.target.classList.contains('delete-btn')) {
       const id = Number(e.target.dataset.id);
       tasks = tasks.filter(task => String(task.id) !== String(clickId));
   
    saveTasks();
    renderTasks();
   }
    
})
function logResize() {
    console.log(`Window width: ${window.innerWidth}px`);
}
    
const throttledResize = throttle(logResize, 500);
window.addEventListener('resize', throttledResize);
renderTasks();
