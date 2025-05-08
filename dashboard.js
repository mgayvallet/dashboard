document.addEventListener('DOMContentLoaded', function () {
    const logoutBtn = document.querySelector('#logoutBtn');
    const navItems = document.querySelectorAll('.nav-item');
    const dashboardContent = document.querySelector('.dashboard-content');
    let calendarDiv, todoDiv, activityDiv;

    logoutBtn.addEventListener('click', function () {
        window.location.href = 'index.html';
    });

    navItems.forEach((item, i) => {
        item.addEventListener('click', function () {
            document.querySelector('.nav-item.active')?.classList.remove('active');
            this.classList.add('active');

            [calendarDiv, todoDiv, activityDiv].forEach(div => {
                if (div) div.style.display = 'none';
            });

            if (i === 2) { // Calendrier
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

                    const calendar = new FullCalendar.Calendar(calendarDiv.querySelector('#calendar'), {
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
                            info.el.querySelector('.fc-event-title')?.appendChild(deleteBtn);
                        }
                    });
                    calendar.render();

                    calendarDiv.querySelector('#addEventBtn').addEventListener('click', () => {
                        const title = calendarDiv.querySelector('#eventTitleInput').value.trim();
                        const date = calendarDiv.querySelector('#eventDateInput').value;
                        if (title && date) {
                            calendar.addEvent({ title, start: date, allDay: true });
                            saveEvents();
                        } else {
                            alert("Veuillez remplir le titre et la date.");
                        }
                    });

                    function saveEvents() {
                        const events = calendar.getEvents().map(event => ({
                            title: event.title,
                            start: event.start.toISOString(),
                            end: event.end ? event.end.toISOString() : null
                        }));
                        localStorage.setItem('calendarEvents', JSON.stringify(events));
                    }
                }
                calendarDiv.style.display = 'block';
            }

            if (i === 1) { // Tâches
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
                    createTodoApp(todoDiv.querySelector('.todo-container'));
                }
                todoDiv.style.display = 'block';
            }

            if (i === 3) { // Journal d’activité
                if (!activityDiv) {
                    activityDiv = document.createElement('div');
                    activityDiv.className = 'activity-log';
                    activityDiv.innerHTML = `
                        <div class="activity-container">
                            <h2 class="activity-title">📘 Journal d’activité</h2>
                            <ul id="activityList" class="activity-list"></ul>
                        </div>
                    `;
                    dashboardContent.appendChild(activityDiv);
                }
                activityDiv.style.display = 'block';
                displayCompletedTasks();
            }
        });
    });

    function createTodoApp(container) {
        let todos = JSON.parse(localStorage.getItem('todos')) || [];

        const updateList = () => {
            const list = container.querySelector('#todoList');
            const summary = container.querySelector('#todoSummary');
            list.innerHTML = '';

            todos.forEach(todo => {
                const li = document.createElement('li');
                li.className = 'todo-item';
                li.innerHTML = `
                    <input type="checkbox" ${todo.completed ? 'checked' : ''} data-id="${todo.id}" />
                    <span class="${todo.completed ? 'done' : ''}">${todo.text}</span>
                    <button class="delete-btn" data-id="${todo.id}">🗑</button>
                `;
                list.appendChild(li);
            });

            const completedCount = todos.filter(t => t.completed).length;
            summary.textContent = `${completedCount} terminée(s) sur ${todos.length} tâche(s)`;

            list.querySelectorAll('input[type="checkbox"]').forEach(cb => {
                cb.addEventListener('change', () => {
                    const id = cb.dataset.id;
                    todos = todos.map(t => {
                        if (t.id === id) {
                            t.completed = !t.completed;
                            t.completedAt = t.completed ? new Date().toISOString() : null;
                        }
                        return t;
                    });
                    saveTodos();
                    updateList();
                });
            });

            list.querySelectorAll('.delete-btn').forEach(btn => {
                btn.addEventListener('click', () => {
                    const id = btn.dataset.id;
                    todos = todos.filter(t => t.id !== id);
                    saveTodos();
                    updateList();
                });
            });
        };

        container.querySelector('#addTodoBtn').addEventListener('click', () => {
            const input = container.querySelector('#newTodoInput');
            const text = input.value.trim();
            if (text) {
                todos.push({ id: Date.now().toString(), text, completed: false, completedAt: null });
                input.value = '';
                saveTodos();
                updateList();
            }
        });

        container.querySelector('#newTodoInput').addEventListener('keydown', e => {
            if (e.key === 'Enter') {
                const text = e.target.value.trim();
                if (text) {
                    todos.push({ id: Date.now().toString(), text, completed: false, completedAt: null });
                    e.target.value = '';
                    saveTodos();
                    updateList();
                }
            }
        });

        function saveTodos() {
            localStorage.setItem('todos', JSON.stringify(todos));
        }

        updateList();
    }

    function displayCompletedTasks() {
        const activityList = activityDiv.querySelector('#activityList');
        activityList.innerHTML = '';

        const todos = JSON.parse(localStorage.getItem('todos')) || [];
        const completed = todos
            .filter(t => t.completed)
            .sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt));

        if (completed.length === 0) {
            activityList.innerHTML = `<li>Aucune tâche terminée pour le moment.</li>`;
            return;
        }

        completed.forEach(t => {
            const li = document.createElement('li');
            li.classList.add("liActivite");
            const timeAgo = formatTimeAgo(t.completedAt);
            li.innerHTML = `
                <div class="activity-entry">
                    <span class="activity-icon">✅</span>
                    <span class="activity-text">${t.text}</span>
                    <span class="activity-time">${timeAgo}</span>
                </div>
            `;
            activityList.appendChild(li);
        });
    }

    function formatTimeAgo(isoDate) {
        if (!isoDate) return '';
        const seconds = Math.floor((Date.now() - new Date(isoDate)) / 1000);
        const intervals = [
            { label: 'an', seconds: 31536000 },
            { label: 'mois', seconds: 2592000 },
            { label: 'jour', seconds: 86400 },
            { label: 'heure', seconds: 3600 },
            { label: 'minute', seconds: 60 },
            { label: 'seconde', seconds: 1 }
        ];
        for (let i = 0; i < intervals.length; i++) {
            const { label, seconds: s } = intervals[i];
            const count = Math.floor(seconds / s);
            if (count > 0) {
                return `il y a ${count} ${label}${count > 1 && label !== 'mois' ? 's' : ''}`;
            }
        }
        return 'à l’instant';
    }
});
