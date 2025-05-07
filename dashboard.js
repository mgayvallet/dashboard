document.addEventListener('DOMContentLoaded', function () {
    const logoutBtn = document.querySelector('#logoutBtn');
    const navItems = document.querySelectorAll('.nav-item');
    const dashboardContent = document.querySelector('.dashboard-content');

    logoutBtn.addEventListener('click', function () {
        window.location.href = 'login.html';
    });

    for (let i = 0; i < navItems.length; i++) {
        navItems[i].addEventListener('click', function () {
            const activeItem = document.querySelector('.nav-item.active');
            if (activeItem) {
                activeItem.classList.remove('active');
            }
            this.classList.add('active');

            if (i === 1) {
                if (!dashboardContent.querySelector('.test-heading')) {
                    const div = document.createElement('div');
                    div.className = 'test-heading';
                    div.innerHTML = `
                    <div class="todo-container">
                      <h2 class="todo-title">📝 Ma Liste de Tâches</h2>
                      <div class="todo-input">
                        <input type="text" id="newTodoInput" placeholder="Ajouter une nouvelle tâche..." />
                        <button id="addTodoBtn">Ajouter</button>
                      </div>
                      <ul id="todoList" class="todo-list"></ul>
                      <div id="todoSummary" class="summary"></div>
                    </div>
                  `;
                  
                    dashboardContent.appendChild(div);

                    const todoContainer = div.querySelector('.todo-container');
                    createTodoApp(todoContainer);
                }
            }
        });
    }

    function createTodoApp(container) {
        const todos = [
            { id: "1", text: "Acheter des courses", completed: false },
            { id: "2", text: "Appeler le médecin", completed: true },
            { id: "3", text: "Finir le projet", completed: false }
        ];

        const render = () => {
            updateList();
        };

        const updateList = () => {
            const list = container.querySelector('#todoList');
            const summary = container.querySelector('#todoSummary');
            list.innerHTML = '';

            for (let i = 0; i < todos.length; i++) {
                const todo = todos[i];
                const li = document.createElement('li');
                li.className = 'todo-item';
                li.innerHTML = `
                    <input type="checkbox" ${todo.completed ? 'checked' : ''} data-id="${todo.id}" />
                    <span class="${todo.completed ? 'done' : ''}">${todo.text}</span>
                    <button class="delete-btn" data-id="${todo.id}">🗑</button>
                `;
                list.appendChild(li);
            }

            summary.textContent = `${todos.filter(t => t.completed).length} terminée(s) sur ${todos.length} tâche(s)`;

            const checkboxes = list.querySelectorAll('input[type="checkbox"]');
            for (let i = 0; i < checkboxes.length; i++) {
                checkboxes[i].addEventListener('change', (e) => {
                    const id = e.target.dataset.id;
                    const todo = todos.find(t => t.id === id);
                    if (todo) {
                        todo.completed = !todo.completed;
                        updateList();
                    }
                });
            }

            const deleteButtons = list.querySelectorAll('.delete-btn');
            for (let i = 0; i < deleteButtons.length; i++) {
                deleteButtons[i].addEventListener('click', (e) => {
                    const id = e.target.dataset.id;
                    const index = todos.findIndex(t => t.id === id);
                    if (index !== -1) {
                        todos.splice(index, 1);
                        updateList();
                    }
                });
            }
        };

        container.addEventListener('click', (e) => {
            if (e.target.id === 'addTodoBtn') {
                const input = container.querySelector('#newTodoInput');
                const text = input.value.trim();
                if (text) {
                    todos.push({ id: Date.now().toString(), text, completed: false });
                    input.value = '';
                    updateList();
                }
            }
        });

        container.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                const input = container.querySelector('#newTodoInput');
                const text = input.value.trim();
                if (text) {
                    todos.push({ id: Date.now().toString(), text, completed: false });
                    input.value = '';
                    updateList();
                }
            }
        });

        render();
    }
});
