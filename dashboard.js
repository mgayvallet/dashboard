document.addEventListener('DOMContentLoaded', function () {
    const logoutBtn = document.querySelector('#logoutBtn');
    const navItems = document.querySelectorAll('.nav-item');
    const dashboardContent = document.querySelector('.dashboard-content');
    const summaryContainer = document.getElementById('summaryContainer');
    let calendarDiv, todoDiv, activityDiv;

    logoutBtn.addEventListener('click', function () {
        window.location.href = 'index.html';
    });

    initSummaryPage();

    for (let i = 0; i < navItems.length; i++) {
        navItems[i].addEventListener('click', function () {
            document.querySelector('.nav-item.active')?.classList.remove('active');
            this.classList.add('active');

            if (summaryContainer) summaryContainer.style.display = 'none';
            if (calendarDiv) calendarDiv.style.display = 'none';
            if (todoDiv) todoDiv.style.display = 'none';
            if (activityDiv) activityDiv.style.display = 'none';

            if (i === 0) { 
                if (summaryContainer) {
                    summaryContainer.style.display = 'flex';
                    loadSummaryData();
                }
            } else if (i === 1) { 
                showTodoSection();
            } else if (i === 2) { 
                showCalendarSection();
            } else if (i === 3) { 
                showActivitySection();
            } else if (i === 4) { 
                showSettingsSection();
            }
        });
    }

    function showTodoSection() {
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

    function showCalendarSection() {
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

            let calendar; 
            
            const initializeCalendar = () => {
                calendar = new FullCalendar.Calendar(calendarDiv.querySelector('#calendar'), {
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
            };

            initializeCalendar();

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
                if (summaryContainer && summaryContainer.style.display !== 'none') {
                    loadSummaryData();
                }
            }
        }
        calendarDiv.style.display = 'block';
    }

    function showActivitySection() {
        if (!activityDiv) {
            activityDiv = document.createElement('div');
            activityDiv.className = 'activity-log';
            activityDiv.innerHTML = `
                <div class="activity-container">
                    <h2 class="activity-title">📘 Journal d'activité</h2>
                    <ul id="activityList" class="activity-list"></ul>
                </div>
            `;
            dashboardContent.appendChild(activityDiv);
        }
        activityDiv.style.display = 'block';
        displayCompletedTasks();
    }

    function showSettingsSection() {
        alert("La section Paramètres sera disponible prochainement.");
    }

    function createTodoApp(container) {
        let todos = JSON.parse(localStorage.getItem('todos')) || [];

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

            const completedCount = todos.filter(t => t.completed).length;
            summary.textContent = `${completedCount} terminée(s) sur ${todos.length} tâche(s)`;

            const checkboxes = list.querySelectorAll('input[type="checkbox"]');
            for (let i = 0; i < checkboxes.length; i++) {
                checkboxes[i].addEventListener('change', () => {
                    const id = checkboxes[i].dataset.id;
                    for (let j = 0; j < todos.length; j++) {
                        if (todos[j].id === id) {
                            todos[j].completed = !todos[j].completed;
                            todos[j].completedAt = todos[j].completed ? new Date().toISOString() : null;
                        }
                    }
                    saveTodos();
                    updateList();
                });
            }

            const deleteButtons = list.querySelectorAll('.delete-btn');
            for (let i = 0; i < deleteButtons.length; i++) {
                deleteButtons[i].addEventListener('click', () => {
                    const id = deleteButtons[i].dataset.id;
                    todos = todos.filter(t => t.id !== id);
                    saveTodos();
                    updateList();
                });
            }
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
            if (summaryContainer && summaryContainer.style.display !== 'none') {
                loadSummaryData();
            }
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

        for (let i = 0; i < completed.length; i++) {
            const t = completed[i];
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
        }
    }

    function initSummaryPage() {
        if (summaryContainer) {
            loadSummaryData();

            const periodButtons = document.querySelectorAll('.period-btn');
            for (let i = 0; i < periodButtons.length; i++) {
                periodButtons[i].addEventListener('click', function() {
                    document.querySelector('.period-btn.active')?.classList.remove('active');
                    this.classList.add('active');
                    updateChart(this.textContent);
                });
            }

            const viewAllButtons = document.querySelectorAll('.view-all');
            for (let i = 0; i < viewAllButtons.length; i++) {
                viewAllButtons[i].addEventListener('click', () => {
                    const navItems = document.querySelectorAll('.nav-item');
                    if (i === 0) {
                        navItems[1].click();
                    } else if (i === 1) {
                        navItems[2].click();
                    } else if (i === 2) {
                        navItems[3].click();
                    }
                });
            }
        }
    }

    function loadSummaryData() {
        const totalTasksEl = document.getElementById('totalTasks');
        const completedTasksEl = document.getElementById('completedTasks');
        const upcomingEventsEl = document.getElementById('upcomingEvents');
        const completionRateEl = document.getElementById('completionRate');
        const recentTasksList = document.getElementById('recentTasks');
        const upcomingEventsList = document.getElementById('upcomingEventsList');
        const recentActivityList = document.getElementById('recentActivity');

        const todos = JSON.parse(localStorage.getItem('todos') || '[]');
        const events = JSON.parse(localStorage.getItem('calendarEvents') || '[]');

        const completedTasks = todos.filter(todo => todo.completed).length;
        const upcomingEvents = events.filter(event => {
            return new Date(event.start) > new Date();
        }).length;
        const completionRate = todos.length ? Math.round((completedTasks / todos.length) * 100) : 0;

        if (totalTasksEl) totalTasksEl.textContent = todos.length;
        if (completedTasksEl) completedTasksEl.textContent = completedTasks;
        if (upcomingEventsEl) upcomingEventsEl.textContent = upcomingEvents;
        if (completionRateEl) completionRateEl.textContent = completionRate + '%';

        if (recentTasksList) {
            recentTasksList.innerHTML = '';
            if (todos.length === 0) {
                recentTasksList.innerHTML = '<li class="overview-item empty">Aucune tâche pour le moment</li>';
            } else {
                const recentTodos = todos.slice(0, 5);
                for (let i = 0; i < recentTodos.length; i++) {
                    const todo = recentTodos[i];
                    const li = document.createElement('li');
                    li.className = `overview-item ${todo.completed ? 'completed' : ''}`;
                    li.innerHTML = `
                        <div class="overview-item-status">${todo.completed ? '✅' : '⏳'}</div>
                        <div class="overview-item-content">
                            <div class="overview-item-title">${todo.text}</div>
                            <div class="overview-item-meta">
                                ${todo.completed ? `Terminé ${formatTimeAgo(todo.completedAt)}` : 'En cours'}
                            </div>
                        </div>
                    `;
                    recentTasksList.appendChild(li);
                }
            }
        }

        if (upcomingEventsList) {
            upcomingEventsList.innerHTML = '';
            const upcomingEventsArray = events
                .filter(event => new Date(event.start) > new Date())
                .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime())
                .slice(0, 5);

            if (upcomingEventsArray.length === 0) {
                upcomingEventsList.innerHTML = '<li class="overview-item empty">Aucun événement planifié</li>';
            } else {
                for (let i = 0; i < upcomingEventsArray.length; i++) {
                    const event = upcomingEventsArray[i];
                    const li = document.createElement('li');
                    li.className = 'overview-item';
                    li.innerHTML = `
                        <div class="overview-item-status">📅</div>
                        <div class="overview-item-content">
                            <div class="overview-item-title">${event.title}</div>
                            <div class="overview-item-meta">${formatDate(event.start)}</div>
                        </div>
                    `;
                    upcomingEventsList.appendChild(li);
                }
            }
        }

        if (recentActivityList) {
            recentActivityList.innerHTML = '';
            const activities = todos
                .filter(todo => todo.completed && todo.completedAt)
                .sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime())
                .slice(0, 5);

            if (activities.length === 0) {
                recentActivityList.innerHTML = `
                    <div class="activity-item">
                        <div class="activity-content">
                            <div class="activity-text">Aucune activité récente</div>
                        </div>
                    </div>
                `;
            } else {
                for (let i = 0; i < activities.length; i++) {
                    const activity = activities[i];
                    const div = document.createElement('div');
                    div.className = 'activity-item';
                    div.innerHTML = `
                        <div class="activity-icon">✅</div>
                        <div class="activity-content">
                            <div class="activity-text">
                                Tâche terminée: <strong>${activity.text}</strong>
                            </div>
                            <div class="activity-time">${formatTimeAgo(activity.completedAt)}</div>
                        </div>
                    `;
                    recentActivityList.appendChild(div);
                }
            }
        }

        updateChart('Semaine');
    }

    function updateChart(period) {
        const todos = JSON.parse(localStorage.getItem('todos') || '[]');
        const chartBars = document.querySelectorAll('.chart-bar');
        const chartLabels = document.querySelectorAll('.chart-label');
        
        const now = new Date();
        const dayOfWeek = now.getDay() || 7; 
        
        let startDate, endDate, dateFormat, groupBy;
        
        if (period === 'Semaine') {
            startDate = new Date(now);
            startDate.setDate(now.getDate() - dayOfWeek + 1); 
            startDate.setHours(0, 0, 0, 0);
            
            endDate = new Date(startDate);
            endDate.setDate(startDate.getDate() + 6); 
            endDate.setHours(23, 59, 59, 999);
            
            dateFormat = { weekday: 'short' };
            groupBy = 'day';
            
            for (let i = 0; i < chartLabels.length; i++) {
                const day = new Date(startDate);
                day.setDate(startDate.getDate() + i);
                chartLabels[i].textContent = day.toLocaleDateString('fr-FR', { weekday: 'short' }).substring(0, 3);
            }
        } else if (period === 'Mois') {
            startDate = new Date(now.getFullYear(), now.getMonth(), 1);
            endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
            
            const weeksInMonth = Math.ceil(endDate.getDate() / 7);
            dateFormat = { day: 'numeric' };
            groupBy = 'week';
            
            for (let i = 0; i < chartLabels.length; i++) {
                chartLabels[i].textContent = `S${i+1}`;
            }
        } else if (period === 'Année') {
            startDate = new Date(now.getFullYear(), 0, 1);
            endDate = new Date(now.getFullYear(), 11, 31);
            dateFormat = { month: 'short' };
            groupBy = 'month';
            
            const months = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'];
            for (let i = 0; i < chartLabels.length && i < months.length; i++) {
                chartLabels[i].textContent = months[i];
            }
        }
        
        const completedInPeriod = todos.filter(todo => {
            if (!todo.completed || !todo.completedAt) return false;
            const completedDate = new Date(todo.completedAt);
            return completedDate >= startDate && completedDate <= endDate;
        });
        
        const tasksByPeriod = {};
        
        if (groupBy === 'day') {
            for (let i = 0; i < 7; i++) {
                const day = new Date(startDate);
                day.setDate(startDate.getDate() + i);
                tasksByPeriod[i] = 0;
            }
            
            for (let i = 0; i < completedInPeriod.length; i++) {
                const todo = completedInPeriod[i];
                const completedDate = new Date(todo.completedAt);
                const dayIndex = (completedDate.getDay() || 7) - 1; 
                tasksByPeriod[dayIndex]++;
            }
        } else if (groupBy === 'week') {
            for (let i = 0; i < 5; i++) {
                tasksByPeriod[i] = 0;
            }
            
            for (let i = 0; i < completedInPeriod.length; i++) {
                const todo = completedInPeriod[i];
                const completedDate = new Date(todo.completedAt);
                const weekIndex = Math.floor((completedDate.getDate() - 1) / 7);
                tasksByPeriod[weekIndex]++;
            }
        } else if (groupBy === 'month') {
            for (let i = 0; i < 12; i++) {
                tasksByPeriod[i] = 0;
            }
            
            for (let i = 0; i < completedInPeriod.length; i++) {
                const todo = completedInPeriod[i];
                const completedDate = new Date(todo.completedAt);
                const monthIndex = completedDate.getMonth();
                tasksByPeriod[monthIndex]++;
            }
        }
        
        let maxValue = 0;
        for (const key in tasksByPeriod) {
            if (tasksByPeriod[key] > maxValue) {
                maxValue = tasksByPeriod[key];
            }
        }
        
        if (maxValue === 0) maxValue = 1;
        
        for (let i = 0; i < chartBars.length && i < Object.keys(tasksByPeriod).length; i++) {
            const value = tasksByPeriod[i];
            const heightPercentage = Math.max(10, (value / maxValue) * 100); 
            chartBars[i].style.height = `${heightPercentage}%`;
            chartBars[i].setAttribute('data-value', value);
        }
    }

    function formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('fr-FR', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    function formatTimeAgo(isoDate) {
        if (!isoDate) return '';
        const seconds = Math.floor((Date.now() - new Date(isoDate).getTime()) / 1000);
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
        return 'à l\'instant';
    }
});