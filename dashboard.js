document.addEventListener('DOMContentLoaded', function () {
    const logoutBtn = document.querySelector('#logoutBtn');
    const navItems = document.querySelectorAll('.nav-item');
    const dashboardContent = document.querySelector('.dashboard-content');
    let calendarDiv, todoDiv;

    logoutBtn.addEventListener('click', function () {
        window.location.href = 'index.html';
    });

    for (let i = 0; i < navItems.length; i++) {
        navItems[i].addEventListener('click', function () {
            const activeItem = document.querySelector('.nav-item.active');
            if (activeItem) activeItem.classList.remove('active');
            this.classList.add('active');

            if (calendarDiv) calendarDiv.style.display = 'none';
            if (todoDiv) todoDiv.style.display = 'none';

            // === Affichage Calendrier ===
            if (i === 2) {
                if (!calendarDiv) {
                    calendarDiv = document.createElement('div');
                    calendarDiv.className = 'calendar-heading';
                    calendarDiv.innerHTML = `
                        <div class="calendar-container">
                            <h2 class="calendar-title">📅 Mon Calendrier</h2>
                            <div class="calendar-controls">
                                <input type="text" id="eventTitleInput" placeholder="Titre de l'événement" />
                                <input type="date" id="eventDateInput" />
                                <button id="addEventBtn">Ajouter l'événement</button>
                            </div>
                            <div id="calendar"></div>
                        </div>
                    `;
                    dashboardContent.appendChild(calendarDiv);

                    const calendarEl = calendarDiv.querySelector('#calendar');
                    const calendar = new FullCalendar.Calendar(calendarEl, {
                        locale: 'fr',
                        initialView: 'dayGridMonth',
                        events: JSON.parse(localStorage.getItem('calendarEvents')) || [],
                        eventDidMount: function (info) {
                            const deleteBtn = document.createElement('span');
                            deleteBtn.textContent = ' 🗑';
                            deleteBtn.style.cursor = 'pointer';
                            deleteBtn.style.color = 'red';
                            deleteBtn.addEventListener('click', () => {
                                if (confirm("Supprimer cet événement ?")) {
                                    info.event.remove();
                                    saveEvents();
                                }
                            });
                            const titleEl = info.el.querySelector('.fc-event-title');
                            if (titleEl) {
                                titleEl.appendChild(deleteBtn);
                            }
                        }
                    });
                    calendar.render();

                    const addEventBtn = calendarDiv.querySelector('#addEventBtn');
                    const titleInput = calendarDiv.querySelector('#eventTitleInput');
                    const dateInput = calendarDiv.querySelector('#eventDateInput');

                    addEventBtn.addEventListener('click', () => {
                        const title = titleInput.value.trim();
                        const date = dateInput.value;
                        if (title && date) {
                            calendar.addEvent({
                                title: title,
                                start: date,
                                allDay: true
                            });
                            saveEvents();
                            titleInput.value = '';
                            dateInput.value = '';
                        } else {
                            alert("Veuillez remplir le titre et la date.");
                        }
                    });

                    function saveEvents() {
                        const events = calendar.getEvents();
                        const eventData = events.map(event => ({
                            title: event.title,
                            start: event.start.toISOString(),
                            end: event.end ? event.end.toISOString() : null
                        }));
                        localStorage.setItem('calendarEvents', JSON.stringify(eventData));
                    }
                }

                calendarDiv.style.display = 'block';
            }

            // === Affichage Todo List ===
            if (i === 1) {
                if (!todoDiv) {
                    todoDiv = document.createElement('div');
                    todoDiv.className = 'test-heading';
                    todoDiv.innerHTML = `
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
                    dashboardContent.appendChild(todoDiv);

                    const todoContainer = todoDiv.querySelector('.todo-container');
                    createTodoApp(todoContainer);
                }

                todoDiv.style.display = 'block';
            }
        });
    }

    function createTodoApp(container) {
        let todos = JSON.parse(localStorage.getItem('todos')) || [];

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

            let completedCount = 0;
            for (let i = 0; i < todos.length; i++) {
                if (todos[i].completed) completedCount++;
            }
            summary.textContent = `${completedCount} terminée(s) sur ${todos.length} tâche(s)`;

            const checkboxes = list.querySelectorAll('input[type="checkbox"]');
            for (let i = 0; i < checkboxes.length; i++) {
                checkboxes[i].addEventListener('change', function () {
                    const id = this.dataset.id;
                    for (let j = 0; j < todos.length; j++) {
                        if (todos[j].id === id) {
                            todos[j].completed = !todos[j].completed;
                            break;
                        }
                    }
                    saveTodos();
                    updateList();
                });
            }

            const deleteBtns = list.querySelectorAll('.delete-btn');
            for (let i = 0; i < deleteBtns.length; i++) {
                deleteBtns[i].addEventListener('click', function () {
                    const id = this.dataset.id;
                    for (let j = 0; j < todos.length; j++) {
                        if (todos[j].id === id) {
                            todos.splice(j, 1);
                            break;
                        }
                    }
                    saveTodos();
                    updateList();
                });
            }
        };

        container.addEventListener('click', function (e) {
            if (e.target.id === 'addTodoBtn') {
                const input = container.querySelector('#newTodoInput');
                const text = input.value.trim();
                if (text) {
                    todos.push({ id: Date.now().toString(), text, completed: false });
                    input.value = '';
                    saveTodos();
                    updateList();
                }
            }
        });

        container.addEventListener('keydown', function (e) {
            if (e.key === 'Enter') {
                const input = container.querySelector('#newTodoInput');
                const text = input.value.trim();
                if (text) {
                    todos.push({ id: Date.now().toString(), text, completed: false });
                    input.value = '';
                    saveTodos();
                    updateList();
                }
            }
        });

        function saveTodos() {
            localStorage.setItem('todos', JSON.stringify(todos));
        }

        render();
    }
});
