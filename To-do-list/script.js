document.addEventListener('DOMContentLoaded', () => {
  const loginSection = document.getElementById('loginSection');
  const signInForm = document.getElementById('signInForm');
  const signUpForm = document.getElementById('signUpForm');
  const signinUser = document.getElementById('signinUser');
  const signinPass = document.getElementById('signinPass');
  const signinBtn = document.getElementById('signinBtn');
  const signupUser = document.getElementById('signupUser');
  const signupPass = document.getElementById('signupPass');
  const signupPassConfirm = document.getElementById('signupPassConfirm');
  const signupBtn = document.getElementById('signupBtn');
  const goToSignup = document.getElementById('goToSignup');
  const goToSignin = document.getElementById('goToSignin');

  const mainApp = document.getElementById('mainApp');
  const newTaskInput = document.getElementById('newTaskInput');
  const newTaskDeadline = document.getElementById('newTaskDeadline');
  const taskPriority = document.getElementById('taskPriority');
  const addTaskBtn = document.getElementById('addTaskBtn');
  const tasksList = document.getElementById('tasksList');
  const filterButtons = document.querySelectorAll('.filterButton');

  window.addEventListener('DOMContentLoaded', () => {
  localStorage.removeItem('todoCurrentUser');
  document.getElementById('loginSection').style.display = 'block';
  document.getElementById('mainApp').style.display = 'none';
});

  let users = JSON.parse(localStorage.getItem('flowTaskUsers')) || {};
  let currentUser = localStorage.getItem('flowTaskCurrentUser') || null;
  let tasks = [];
  let currentFilter = 'All';
  let editingTaskId = null;

  if (currentUser && users[currentUser]) {
    tasks = users[currentUser].tasks || [];
    showMainApp();
  } else {
    showLogin();
  }

  signinBtn.addEventListener('click', handleSignin);
  signupBtn.addEventListener('click', handleSignup);
  goToSignup.addEventListener('click', (e) => {
    e.preventDefault();
    switchForms('signup');
  });
  goToSignin.addEventListener('click', (e) => {
    e.preventDefault();
    switchForms('signin');
  });

  addTaskBtn.addEventListener('click', () => {
    if(editingTaskId !== null){
      updateTask();
    } else {
      addTask();
    }
  });

  newTaskInput.addEventListener('keypress', e => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if(editingTaskId !== null){
        updateTask();
      } else {
        addTask();
      }
    }
  });

  filterButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      filterButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentFilter = btn.dataset.filter;
      renderTasks();
    });
  });

  // Functions

  function switchForms(form) {
    clearErrors();
    if (form === 'signin') {
      signInForm.style.display = 'block';
      signUpForm.style.display = 'none';
    } else {
      signInForm.style.display = 'none';
      signUpForm.style.display = 'block';
    }
  }

  function showLogin() {
    loginSection.style.display = 'block';
    mainApp.style.display = 'none';
    switchForms('signin');
    clearInputs();
  }

  function showMainApp() {
    loginSection.style.display = 'none';
    mainApp.style.display = 'block';
    clearInputs();
    renderTasks();
  }

  function clearInputs() {
    signinUser.value = '';
    signinPass.value = '';
    signupUser.value = '';
    signupPass.value = '';
    signupPassConfirm.value = '';
    newTaskInput.value = '';
    newTaskDeadline.value = '';
    taskPriority.value = 'High';
    editingTaskId = null;
    addTaskBtn.textContent = 'Add Task';
  }

  function handleSignin() {
    clearErrors();
    const user = signinUser.value.trim();
    const pass = signinPass.value.trim();

    if (!user || !pass) {
      alert('Please enter username and password.');
      return;
    }

    if (!users[user]) {
      alert('Username not found. Please register');
      return;
    }

    if (users[user].password !== pass) {
      alert('Incorrect password.');
      return;
    }

    currentUser = user;
    localStorage.setItem('flowTaskCurrentUser', currentUser);
    tasks = users[currentUser].tasks || [];
    showMainApp();
  }

  function handleSignup() {
    clearErrors();
    const user = signupUser.value.trim();
    const pass = signupPass.value.trim();
    const passConfirm = signupPassConfirm.value.trim();

    if (!user || !pass || !passConfirm) {
      alert('Please fill all fields.');
      return;
    }

    if (users[user]) {
      alert('User already exists. Please sign in.');
      return;
    }

    if (pass !== passConfirm) {
      alert('Passwords do not match.');
      return;
    }

    users[user] = {
      password: pass,
      tasks: []
    };
    localStorage.setItem('flowTaskUsers', JSON.stringify(users));
    alert('Registration successful! Please sign in.');
    switchForms('signin');
    clearInputs();
  }

  function addTask() {
    const text = newTaskInput.value.trim();
    const deadline = newTaskDeadline.value;
    const priority = taskPriority.value;

    if (!text) {
      alert('Please enter a task.');
      return;
    }

    const task = {
      id: Date.now(),
      text,
      deadline: deadline || null,
      priority,
      completed: false
    };

    tasks.push(task);
    saveTasks();
    clearInputs();
    renderTasks();
  }

  function updateTask() {
    const text = newTaskInput.value.trim();
    const deadline = newTaskDeadline.value;
    const priority = taskPriority.value;

    if (!text) {
      alert('Please enter a task.');
      return;
    }

    const index = tasks.findIndex(t => t.id === editingTaskId);
    if (index === -1) {
      alert('Task not found.');
      clearInputs();
      return;
    }

    tasks[index].text = text;
    tasks[index].deadline = deadline || null;
    tasks[index].priority = priority;

    saveTasks();
    clearInputs();
    renderTasks();
  }

  function saveTasks() {
    users[currentUser].tasks = tasks;
    localStorage.setItem('flowTaskUsers', JSON.stringify(users));
  }

  function renderTasks() {
    tasksList.innerHTML = '';

    let filteredTasks = tasks;
    if (currentFilter !== 'All') {
      filteredTasks = tasks.filter(t => t.priority === currentFilter);
    }

    if(filteredTasks.length === 0){
      tasksList.innerHTML = '<li style="text-align:center; color:#666;">No tasks to display</li>';
      return;
    }

    filteredTasks.forEach(task => {
      const li = document.createElement('li');
      li.classList.add('task-item');
      if(task.completed) li.classList.add('completed');

      // Checkbox to mark complete
      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.className = 'task-checkbox';
      checkbox.checked = task.completed;
      checkbox.addEventListener('change', () => {
        task.completed = checkbox.checked;
        saveTasks();
        renderTasks();
      });
      li.appendChild(checkbox);

      // Task text
      const textSpan = document.createElement('span');
      textSpan.className = 'task-text';
      textSpan.textContent = task.text;
      li.appendChild(textSpan);

      // Due date
      if(task.deadline){
        const deadlineSpan = document.createElement('span');
        deadlineSpan.className = 'task-due';
        const dateObj = new Date(task.deadline);
        const formattedDate = dateObj.toLocaleString([], { dateStyle: 'short', timeStyle: 'short' });
        deadlineSpan.textContent = `⏰ ${formattedDate}`;
        li.appendChild(deadlineSpan);
      }

      // Priority symbol
      const prioSpan = document.createElement('span');
      prioSpan.className = 'task-priority';
      let prioSymbol = '';
      if(task.priority === 'High') prioSymbol = '⚠️';
      else if(task.priority === 'Medium') prioSymbol = '⚡️';
      else if(task.priority === 'Low') prioSymbol = '✅';
      prioSpan.textContent = prioSymbol;
      li.appendChild(prioSpan);

      // Buttons container
      const actionsDiv = document.createElement('div');
      actionsDiv.className = 'task-actions';

      // Edit button
      const editBtn = document.createElement('button');
      editBtn.textContent = 'Edit';
      editBtn.className = 'edit-btn';
      editBtn.addEventListener('click', () => {
        editingTaskId = task.id;
        newTaskInput.value = task.text;
        newTaskDeadline.value = task.deadline ? task.deadline : '';
        taskPriority.value = task.priority;
        addTaskBtn.textContent = 'Update Task';
      });
      actionsDiv.appendChild(editBtn);

      // Delete button
      const deleteBtn = document.createElement('button');
      deleteBtn.textContent = 'Delete';
      deleteBtn.className = 'delete-btn';
      deleteBtn.addEventListener('click', () => {
        if(confirm('Are you sure you want to delete this task?')){
          tasks = tasks.filter(t => t.id !== task.id);
          saveTasks();
          renderTasks();
          if(editingTaskId === task.id){
            clearInputs();
          }
        }
      });
      actionsDiv.appendChild(deleteBtn);

      li.appendChild(actionsDiv);
      tasksList.appendChild(li);
    });
  }

  function clearErrors() {
    // For now, just alerts are used, so no persistent error display
  }

});
