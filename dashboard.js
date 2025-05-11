document.addEventListener("DOMContentLoaded", () => {
    const logoutBtn = document.querySelector("#logoutBtn")
    const navItems = document.querySelectorAll(".nav-item")
    const dashboardContent = document.querySelector(".dashboard-content")
    const summaryContainer = document.getElementById("summaryContainer")
    let calendarDiv, todoDiv, activityDiv, settingsDiv
  
    const savedTheme = localStorage.getItem("userTheme")
    if (savedTheme === "dark") {
      document.body.classList.add("dark-theme")
    }
  
    initLanguage()
  
    logoutBtn.addEventListener("click", () => {
      window.location.href = "index.html"
    })
  
    initSummaryPage()
  
    for (let i = 0; i < navItems.length; i++) {
      navItems[i].addEventListener("click", function () {
        document.querySelector(".nav-item.active")?.classList.remove("active")
        this.classList.add("active")
  
        if (summaryContainer) summaryContainer.style.display = "none"
        if (calendarDiv) calendarDiv.style.display = "none"
        if (todoDiv) todoDiv.style.display = "none"
        if (activityDiv) activityDiv.style.display = "none"
        if (settingsDiv) settingsDiv.style.display = "none"
  
        if (i === 0) {
          if (summaryContainer) {
            summaryContainer.style.display = "flex"
            loadSummaryData()
          }
        } else if (i === 1) {
          showTodoSection()
        } else if (i === 2) {
          showCalendarSection()
        } else if (i === 3) {
          showActivitySection()
        } else if (i === 4) {
          showSettingsSection()
        }
      })
    }
  
    function initLanguage() {
      if (typeof window.translations === "undefined") {
        const script = document.createElement("script")
        script.src = "translations.js"
        script.onload = () => {
          window.translations.translateInterface()
        }
        document.head.appendChild(script)
      } else {
        window.translations.translateInterface()
      }
    }
  
    function showTodoSection() {
      if (!todoDiv) {
        todoDiv = document.createElement("div")
        todoDiv.className = "test-heading"
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
              `
        dashboardContent.appendChild(todoDiv)
        createTodoApp(todoDiv.querySelector(".todo-container"))
      }
      todoDiv.style.display = "block"
  
      if (typeof window.translations !== "undefined") {
        window.translations.translateInterface()
      }
    }
  
    function showCalendarSection() {
      if (!calendarDiv) {
        calendarDiv = document.createElement("div")
        calendarDiv.className = "calendar-heading"
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
              `
        dashboardContent.appendChild(calendarDiv)
  
        let calendar
  
        const initializeCalendar = () => {
          const currentLang = localStorage.getItem("userLanguage") || "fr"
          calendar = new FullCalendar.Calendar(calendarDiv.querySelector("#calendar"), {
            locale: currentLang,
            initialView: "dayGridMonth",
            events: JSON.parse(localStorage.getItem("calendarEvents")) || [],
            eventDidMount: (info) => {
              const deleteBtn = document.createElement("span")
              deleteBtn.textContent = " 🗑"
              deleteBtn.style.cursor = "pointer"
              deleteBtn.style.color = "red"
              deleteBtn.addEventListener("click", () => {
                const t = window.translations
                  ? window.translations.getTranslation()
                  : { deleteEvent: "Supprimer cet événement ?" }
                if (confirm(t.deleteEvent)) {
                  info.event.remove()
                  saveEvents()
                }
              })
              info.el.querySelector(".fc-event-title")?.appendChild(deleteBtn)
            },
          })
          calendar.render()
        }
  
        initializeCalendar()
  
        calendarDiv.querySelector("#addEventBtn").addEventListener("click", () => {
          const title = calendarDiv.querySelector("#eventTitleInput").value.trim()
          const date = calendarDiv.querySelector("#eventDateInput").value
  
          const t = window.translations
            ? window.translations.getTranslation()
            : { fillTitleDate: "Veuillez remplir le titre et la date." }
  
          if (title && date) {
            calendar.addEvent({ title, start: date, allDay: true })
            saveEvents()
          } else {
            alert(t.fillTitleDate)
          }
        })
  
        function saveEvents() {
          const events = calendar.getEvents().map((event) => ({
            title: event.title,
            start: event.start.toISOString(),
            end: event.end ? event.end.toISOString() : null,
          }))
          localStorage.setItem("calendarEvents", JSON.stringify(events))
          if (summaryContainer && summaryContainer.style.display !== "none") {
            loadSummaryData()
          }
        }
      }
      calendarDiv.style.display = "block"
  
      if (typeof window.translations !== "undefined") {
        window.translations.translateInterface()
      }
    }
  
    function showActivitySection() {
      if (!activityDiv) {
        activityDiv = document.createElement("div")
        activityDiv.className = "activity-log"
        activityDiv.innerHTML = `
                  <div class="activity-container">
                      <h2 class="activity-title">📘 Journal d'activité</h2>
                      <ul id="activityList" class="activity-list"></ul>
                  </div>
              `
        dashboardContent.appendChild(activityDiv)
      }
      activityDiv.style.display = "block"
      displayCompletedTasks()
  
      if (typeof window.translations !== "undefined") {
        window.translations.translateInterface()
      }
    }
  
    function showSettingsSection() {
      if (!settingsDiv) {
        settingsDiv = document.createElement("div")
        settingsDiv.className = "settings-page"
  
        if (!document.querySelector('link[href="settings.css"]')) {
          const link = document.createElement("link")
          link.rel = "stylesheet"
          link.href = "settings.css"
          document.head.appendChild(link)
        }
  
        settingsDiv.innerHTML = createSettingsHTML()
        dashboardContent.appendChild(settingsDiv)
  
        initializeSettings(settingsDiv)
      }
      settingsDiv.style.display = "block"
  
      if (typeof window.translations !== "undefined") {
        window.translations.translateInterface()
      }
    }
  
    function createSettingsHTML() {
      return `
              <div class="settings-container">
                  <h2 class="settings-title">⚙️ Paramètres</h2>
                  
                  <div id="settingsSaveMessage" class="settings-save-message" style="display: none;"></div>
                  
                  <div class="settings-sections">
                      <div class="settings-section">
                          <h3 class="settings-section-title">
                              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                              Profil Utilisateur
                          </h3>
                          <div class="settings-form-group">
                              <label for="settingsUserName">Nom d'utilisateur</label>
                              <input type="text" id="settingsUserName" />
                          </div>
                          <div class="settings-form-group">
                              <label for="settingsUserEmail">Email</label>
                              <input type="email" id="settingsUserEmail" />
                          </div>
                          <div class="settings-form-group">
                              <label for="settingsUserAvatar">Avatar (initiale)</label>
                              <input type="text" id="settingsUserAvatar" maxlength="1" />
                          </div>
                      </div>
                      
                      <div class="settings-section">
                          <h3 class="settings-section-title">
                              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"></circle><path d="M12 1v2M12 21v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M1 12h2M21 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4"></path></svg>
                              Apparence
                          </h3>
                          <div class="settings-form-group">
                              <label>Thème</label>
                              <div class="settings-toggle-group">
                                  <button id="lightThemeBtn" class="settings-toggle-btn">
                                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"></circle><path d="M12 1v2M12 21v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M1 12h2M21 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4"></path></svg>
                                      Clair
                                  </button>
                                  <button id="darkThemeBtn" class="settings-toggle-btn">
                                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"></path></svg>
                                      Sombre
                                  </button>
                              </div>
                          </div>
                          <div class="settings-form-group">
                              <label for="settingsLanguage">Langue</label>
                              <select id="settingsLanguage">
                                  <option value="fr">Français</option>
                                  <option value="en">English</option>
                                  <option value="es">Español</option>
                                  <option value="de">Deutsch</option>
                              </select>
                          </div>
                      </div>
                      
                      <div class="settings-section">
                          <h3 class="settings-section-title">
                              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"></path><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"></path></svg>
                              Notifications
                          </h3>
                          <div class="settings-form-group">
                              <label>Notifications d'activité</label>
                              <div class="settings-toggle-group">
                                  <button id="notificationsOnBtn" class="settings-toggle-btn">
                                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"></path><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"></path></svg>
                                      Activées
                                  </button>
                                  <button id="notificationsOffBtn" class="settings-toggle-btn">
                                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8.7 3A6 6 0 0 1 18 8a21.3 21.3 0 0 0 .6 5"></path><path d="M17 17H3s3-2 3-9a4.67 4.67 0 0 1 .3-1.7"></path><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"></path><path d="m2 2 20 20"></path></svg>
                                      Désactivées
                                  </button>
                              </div>
                          </div>
                      </div>
                      
                      <div class="settings-section">
                          <h3 class="settings-section-title">
                              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"></path></svg>
                              Compte
                          </h3>
                          <div class="settings-form-group">
                              <button id="logoutSettingsBtn" class="settings-danger-btn">
                                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
                                  Se déconnecter
                              </button>
                          </div>
                          <div class="settings-form-group">
                              <button id="deleteAccountBtn" class="settings-danger-btn danger">
                                  Supprimer mon compte
                              </button>
                          </div>
                      </div>
                  </div>
                  
                  <div class="settings-actions">
                      <button id="saveSettingsBtn" class="settings-save-btn">
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path><polyline points="17 21 17 13 7 13 7 21"></polyline><polyline points="7 3 7 8 15 8"></polyline></svg>
                          Enregistrer les modifications
                      </button>
                  </div>
              </div>
          `
    }
  
    function initializeSettings(container) {
      const userNameInput = container.querySelector("#settingsUserName")
      const userEmailInput = container.querySelector("#settingsUserEmail")
      const userAvatarInput = container.querySelector("#settingsUserAvatar")
      const languageSelect = container.querySelector("#settingsLanguage")
      const lightThemeBtn = container.querySelector("#lightThemeBtn")
      const darkThemeBtn = container.querySelector("#darkThemeBtn")
      const notificationsOnBtn = container.querySelector("#notificationsOnBtn")
      const notificationsOffBtn = container.querySelector("#notificationsOffBtn")
      const logoutBtn = container.querySelector("#logoutSettingsBtn")
      const deleteAccountBtn = container.querySelector("#deleteAccountBtn")
      const saveBtn = container.querySelector("#saveSettingsBtn")
      const saveMessage = container.querySelector("#settingsSaveMessage")
  
      const savedTheme = localStorage.getItem("userTheme") || "light"
      const savedLanguage = localStorage.getItem("userLanguage") || "fr"
      const savedNotifications = localStorage.getItem("userNotifications") !== "false"
      const savedUserName = localStorage.getItem("userName") || "Utilisateur"
      const savedEmail = localStorage.getItem("userEmail") || "utilisateur@exemple.com"
      const savedAvatar = localStorage.getItem("userAvatar") || "U"
  
      userNameInput.value = savedUserName
      userEmailInput.value = savedEmail
      userAvatarInput.value = savedAvatar
      languageSelect.value = savedLanguage
  
      if (savedTheme === "light") {
        lightThemeBtn.classList.add("active")
      } else {
        darkThemeBtn.classList.add("active")
      }
  
      if (savedNotifications) {
        notificationsOnBtn.classList.add("active")
      } else {
        notificationsOffBtn.classList.add("active")
      }
  
      lightThemeBtn.addEventListener("click", () => {
        lightThemeBtn.classList.add("active")
        darkThemeBtn.classList.remove("active")
      })
  
      darkThemeBtn.addEventListener("click", () => {
        darkThemeBtn.classList.add("active")
        lightThemeBtn.classList.remove("active")
      })
  
      notificationsOnBtn.addEventListener("click", () => {
        notificationsOnBtn.classList.add("active")
        notificationsOffBtn.classList.remove("active")
      })
  
      notificationsOffBtn.addEventListener("click", () => {
        notificationsOffBtn.classList.add("active")
        notificationsOnBtn.classList.remove("active")
      })
  
      logoutBtn.addEventListener("click", () => {
        window.location.href = "index.html"
      })
  
      deleteAccountBtn.addEventListener("click", () => {
        const t = window.translations
          ? window.translations.getTranslation()
          : {
              deleteConfirm: "Êtes-vous sûr de vouloir supprimer votre compte ? Cette action est irréversible.",
              accountDeleted: "Votre compte a été supprimé avec succès.",
            }
  
        if (confirm(t.deleteConfirm)) {
          localStorage.clear()
          alert(t.accountDeleted)
          window.location.href = "index.html"
        }
      })
  
      saveBtn.addEventListener("click", () => {
        const userName = userNameInput.value.trim()
        const userEmail = userEmailInput.value.trim()
        const userAvatar = userAvatarInput.value.trim().charAt(0).toUpperCase()
        const language = languageSelect.value
        const theme = lightThemeBtn.classList.contains("active") ? "light" : "dark"
        const notifications = notificationsOnBtn.classList.contains("active")
  
        const t = window.translations
          ? window.translations.getTranslation()
          : {
              enterUsername: "Veuillez entrer un nom d'utilisateur.",
              enterValidEmail: "Veuillez entrer une adresse email valide.",
              settingsSaved: "Paramètres enregistrés avec succès!",
            }
  
        if (!userName) {
          alert(t.enterUsername)
          return
        }
  
        if (!userEmail || !userEmail.includes("@")) {
          alert(t.enterValidEmail)
          return
        }
  
        localStorage.setItem("userName", userName)
        localStorage.setItem("userEmail", userEmail)
        localStorage.setItem("userAvatar", userAvatar || "U")
        localStorage.setItem("userLanguage", language)
        localStorage.setItem("userTheme", theme)
        localStorage.setItem("userNotifications", notifications.toString())
  
        const userNameElement = document.getElementById("userName")
        if (userNameElement) userNameElement.textContent = userName
  
        const userAvatarElement = document.getElementById("userAvatar")
        if (userAvatarElement) userAvatarElement.textContent = userAvatar || "U"
  
        if (theme === "dark") {
          document.body.classList.add("dark-theme")
        } else {
          document.body.classList.remove("dark-theme")
        }
  
        saveMessage.textContent = t.settingsSaved
        saveMessage.style.display = "block"
        setTimeout(() => {
          saveMessage.style.display = "none"
        }, 3000)
  
        if (typeof window.translations !== "undefined") {
          window.translations.translateInterface()
        }
  
        if (calendarDiv) {
          const calendarEl = calendarDiv.querySelector("#calendar")
          if (calendarEl) {
            const calendar = FullCalendar.getCalendarById(calendarEl.id)
            if (calendar) {
              calendar.setOption("locale", language)
              calendar.render()
            }
          }
        }
      })
  
      userAvatarInput.addEventListener("input", function () {
        if (this.value.length > 1) {
          this.value = this.value.charAt(0).toUpperCase()
        } else if (this.value.length === 1) {
          this.value = this.value.toUpperCase()
        }
      })
  
      languageSelect.addEventListener("change", function () {
        localStorage.setItem("userLanguage", this.value)
  
        if (typeof window.translations !== "undefined") {
          window.translations.translateInterface()
        }
      })
    }
  
    function createTodoApp(container) {
      let todos = JSON.parse(localStorage.getItem("todos")) || []
  
      const updateList = () => {
        const list = container.querySelector("#todoList")
        const summary = container.querySelector("#todoSummary")
        list.innerHTML = ""
  
        for (let i = 0; i < todos.length; i++) {
          const todo = todos[i]
          const li = document.createElement("li")
          li.className = "todo-item"
          li.innerHTML = `
                      <input type="checkbox" ${todo.completed ? "checked" : ""} data-id="${todo.id}" />
                      <span class="${todo.completed ? "done" : ""}">${todo.text}</span>
                      <button class="delete-btn" data-id="${todo.id}">🗑</button>
                  `
          list.appendChild(li)
        }
  
        const completedCount = todos.filter((t) => t.completed).length
  
        if (typeof window.translations !== "undefined") {
          const t = window.translations.getTranslation()
          summary.textContent = `${completedCount} ${t.taskCompleted.toLowerCase()}(s) ${t.timeUnits.day[0]} ${todos.length} ${t.tasks.toLowerCase()}`
        } else {
          summary.textContent = `${completedCount} terminée(s) sur ${todos.length} tâche(s)`
        }
  
        const checkboxes = list.querySelectorAll('input[type="checkbox"]')
        for (let i = 0; i < checkboxes.length; i++) {
          checkboxes[i].addEventListener("change", () => {
            const id = checkboxes[i].dataset.id
            for (let j = 0; j < todos.length; j++) {
              if (todos[j].id === id) {
                todos[j].completed = !todos[j].completed
                todos[j].completedAt = todos[j].completed ? new Date().toISOString() : null
              }
            }
            saveTodos()
            updateList()
          })
        }
  
        const deleteButtons = list.querySelectorAll(".delete-btn")
        for (let i = 0; i < deleteButtons.length; i++) {
          deleteButtons[i].addEventListener("click", () => {
            const id = deleteButtons[i].dataset.id
            todos = todos.filter((t) => t.id !== id)
            saveTodos()
            updateList()
          })
        }
      }
  
      container.querySelector("#addTodoBtn").addEventListener("click", () => {
        const input = container.querySelector("#newTodoInput")
        const text = input.value.trim()
        if (text) {
          todos.push({ id: Date.now().toString(), text, completed: false, completedAt: null })
          input.value = ""
          saveTodos()
          updateList()
        }
      })
  
      container.querySelector("#newTodoInput").addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
          const text = e.target.value.trim()
          if (text) {
            todos.push({ id: Date.now().toString(), text, completed: false, completedAt: null })
            e.target.value = ""
            saveTodos()
            updateList()
          }
        }
      })
  
      function saveTodos() {
        localStorage.setItem("todos", JSON.stringify(todos))
        if (summaryContainer && summaryContainer.style.display !== "none") {
          loadSummaryData()
        }
      }
  
      updateList()
    }
  
    function displayCompletedTasks() {
      const activityList = activityDiv.querySelector("#activityList")
      activityList.innerHTML = ""
  
      const todos = JSON.parse(localStorage.getItem("todos")) || []
      const completed = todos.filter((t) => t.completed).sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt))
  
      const t = window.translations
        ? window.translations.getTranslation()
        : {
            noCompletedTasks: "Aucune tâche terminée pour le moment.",
            taskCompletedText: "Tâche terminée:",
          }
  
      if (completed.length === 0) {
        activityList.innerHTML = `<li>${t.noCompletedTasks}</li>`
        return
      }
  
      for (let i = 0; i < completed.length; i++) {
        const task = completed[i]
        const li = document.createElement("li")
        li.classList.add("liActivite")
  
        const timeAgo = window.translations
          ? window.translations.formatTimeAgo(task.completedAt)
          : formatTimeAgo(task.completedAt)
  
        li.innerHTML = `
                  <div class="activity-entry">
                      <span class="activity-icon">✅</span>
                      <span class="activity-text">${t.taskCompletedText} <strong>${task.text}</strong></span>
                      <span class="activity-time">${timeAgo}</span>
                  </div>
              `
        activityList.appendChild(li)
      }
    }
  
    function initSummaryPage() {
      if (summaryContainer) {
        loadSummaryData()
  
        const periodButtons = document.querySelectorAll(".period-btn")
        for (let i = 0; i < periodButtons.length; i++) {
          periodButtons[i].addEventListener("click", function () {
            document.querySelector(".period-btn.active")?.classList.remove("active")
            this.classList.add("active")
            updateChart(this.textContent)
          })
        }
  
        const viewAllButtons = document.querySelectorAll(".view-all")
        for (let i = 0; i < viewAllButtons.length; i++) {
          viewAllButtons[i].addEventListener("click", () => {
            const navItems = document.querySelectorAll(".nav-item")
            if (i === 0) {
              navItems[1].click()
            } else if (i === 1) {
              navItems[2].click()
            } else if (i === 2) {
              navItems[3].click()
            }
          })
        }
      }
    }
  
    function loadSummaryData() {
      const totalTasksEl = document.getElementById("totalTasks")
      const completedTasksEl = document.getElementById("completedTasks")
      const upcomingEventsEl = document.getElementById("upcomingEvents")
      const completionRateEl = document.getElementById("completionRate")
      const recentTasksList = document.getElementById("recentTasks")
      const upcomingEventsList = document.getElementById("upcomingEventsList")
      const recentActivityList = document.getElementById("recentActivity")
  
      const todos = JSON.parse(localStorage.getItem("todos") || "[]")
      const events = JSON.parse(localStorage.getItem("calendarEvents") || "[]")
  
      const completedTasks = todos.filter((todo) => todo.completed).length
      const upcomingEvents = events.filter((event) => {
        return new Date(event.start) > new Date()
      }).length
      const completionRate = todos.length ? Math.round((completedTasks / todos.length) * 100) : 0
  
      if (totalTasksEl) totalTasksEl.textContent = todos.length
      if (completedTasksEl) completedTasksEl.textContent = completedTasks
      if (upcomingEventsEl) upcomingEventsEl.textContent = upcomingEvents
      if (completionRateEl) completionRateEl.textContent = completionRate + "%"
  
      const t = window.translations
        ? window.translations.getTranslation()
        : {
            noTasks: "Aucune tâche pour le moment",
            inProgress: "En cours",
            taskCompleted: "Terminé",
            noEvents: "Aucun événement planifié",
            noActivity: "Aucune activité récente",
          }
  
      if (recentTasksList) {
        recentTasksList.innerHTML = ""
        if (todos.length === 0) {
          recentTasksList.innerHTML = `<li class="overview-item empty">${t.noTasks}</li>`
        } else {
          const recentTodos = todos.slice(0, 5)
          for (let i = 0; i < recentTodos.length; i++) {
            const todo = recentTodos[i]
            const li = document.createElement("li")
            li.className = `overview-item ${todo.completed ? "completed" : ""}`
  
            const timeAgo = todo.completed
              ? window.translations
                ? window.translations.formatTimeAgo(todo.completedAt)
                : formatTimeAgo(todo.completedAt)
              : t.inProgress
  
            li.innerHTML = `
                          <div class="overview-item-status">${todo.completed ? "✅" : "⏳"}</div>
                          <div class="overview-item-content">
                              <div class="overview-item-title">${todo.text}</div>
                              <div class="overview-item-meta">
                                  ${todo.completed ? `${t.taskCompleted} ${timeAgo}` : t.inProgress}
                              </div>
                          </div>
                      `
            recentTasksList.appendChild(li)
          }
        }
      }
  
      if (upcomingEventsList) {
        upcomingEventsList.innerHTML = ""
        const upcomingEventsArray = events
          .filter((event) => new Date(event.start) > new Date())
          .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime())
          .slice(0, 5)
  
        if (upcomingEventsArray.length === 0) {
          upcomingEventsList.innerHTML = `<li class="overview-item empty">${t.noEvents}</li>`
        } else {
          for (let i = 0; i < upcomingEventsArray.length; i++) {
            const event = upcomingEventsArray[i]
            const li = document.createElement("li")
            li.className = "overview-item"
            li.innerHTML = `
                          <div class="overview-item-status">📅</div>
                          <div class="overview-item-content">
                              <div class="overview-item-title">${event.title}</div>
                              <div class="overview-item-meta">${formatDate(event.start)}</div>
                          </div>
                      `
            upcomingEventsList.appendChild(li)
          }
        }
      }
  
      if (recentActivityList) {
        recentActivityList.innerHTML = ""
        const activities = todos
          .filter((todo) => todo.completed && todo.completedAt)
          .sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime())
          .slice(0, 5)
  
        if (activities.length === 0) {
          recentActivityList.innerHTML = `
                      <div class="activity-item">
                          <div class="activity-content">
                              <div class="activity-text">${t.noActivity}</div>
                          </div>
                      </div>
                  `
        } else {
          for (let i = 0; i < activities.length; i++) {
            const activity = activities[i]
            const div = document.createElement("div")
            div.className = "activity-item"
  
            const timeAgo = window.translations
              ? window.translations.formatTimeAgo(activity.completedAt)
              : formatTimeAgo(activity.completedAt)
  
            div.innerHTML = `
                          <div class="activity-icon">✅</div>
                          <div class="activity-content">
                              <div class="activity-text">
                                  ${t.taskCompletedText} <strong>${activity.text}</strong>
                              </div>
                              <div class="activity-time">${timeAgo}</div>
                          </div>
                      `
            recentActivityList.appendChild(div)
          }
        }
      }
  
      updateChart("Semaine")
    }
  
    function updateChart(period) {
      const todos = JSON.parse(localStorage.getItem("todos") || "[]")
      const chartBars = document.querySelectorAll(".chart-bar")
      const chartLabels = document.querySelectorAll(".chart-label")
  
      if (window.translations) {
        window.translations.updateChartLabels(period)
      }
  
      const now = new Date()
      const dayOfWeek = now.getDay() || 7
  
      let startDate, endDate, dateFormat, groupBy
  
      if (period === getTranslationValue("week") || period === "Semaine") {
        startDate = new Date(now)
        startDate.setDate(now.getDate() - dayOfWeek + 1)
        startDate.setHours(0, 0, 0, 0)
  
        endDate = new Date(startDate)
        endDate.setDate(startDate.getDate() + 6)
        endDate.setHours(23, 59, 59, 999)
  
        dateFormat = { weekday: "short" }
        groupBy = "day"
  
        if (!window.translations) {
          for (let i = 0; i < chartLabels.length; i++) {
            const day = new Date(startDate)
            day.setDate(startDate.getDate() + i)
            chartLabels[i].textContent = day.toLocaleDateString("fr-FR", { weekday: "short" }).substring(0, 3)
          }
        }
      } else if (period === getTranslationValue("month") || period === "Mois") {
        startDate = new Date(now.getFullYear(), now.getMonth(), 1)
        endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0)
  
        const weeksInMonth = Math.ceil(endDate.getDate() / 7)
        dateFormat = { day: "numeric" }
        groupBy = "week"
  
        if (!window.translations) {
          for (let i = 0; i < chartLabels.length; i++) {
            chartLabels[i].textContent = `S${i + 1}`
          }
        }
      } else if (period === getTranslationValue("year") || period === "Année") {
        startDate = new Date(now.getFullYear(), 0, 1)
        endDate = new Date(now.getFullYear(), 11, 31)
        dateFormat = { month: "short" }
        groupBy = "month"
  
        if (!window.translations) {
          const months = ["Jan", "Fév", "Mar", "Avr", "Mai", "Jun", "Jul", "Aoû", "Sep", "Oct", "Nov", "Déc"]
          for (let i = 0; i < chartLabels.length && i < months.length; i++) {
            chartLabels[i].textContent = months[i]
          }
        }
      }
  
      const completedInPeriod = todos.filter((todo) => {
        if (!todo.completed || !todo.completedAt) return false
        const completedDate = new Date(todo.completedAt)
        return completedDate >= startDate && completedDate <= endDate
      })
  
      const tasksByPeriod = {}
  
      if (groupBy === "day") {
        for (let i = 0; i < 7; i++) {
          const day = new Date(startDate)
          day.setDate(startDate.getDate() + i)
          tasksByPeriod[i] = 0
        }
  
        for (let i = 0; i < completedInPeriod.length; i++) {
          const todo = completedInPeriod[i]
          const completedDate = new Date(todo.completedAt)
          const dayIndex = (completedDate.getDay() || 7) - 1
          tasksByPeriod[dayIndex]++
        }
      } else if (groupBy === "week") {
        for (let i = 0; i < 5; i++) {
          tasksByPeriod[i] = 0
        }
  
        for (let i = 0; i < completedInPeriod.length; i++) {
          const todo = completedInPeriod[i]
          const completedDate = new Date(todo.completedAt)
          const weekIndex = Math.floor((completedDate.getDate() - 1) / 7)
          tasksByPeriod[weekIndex]++
        }
      } else if (groupBy === "month") {
        for (let i = 0; i < 12; i++) {
          tasksByPeriod[i] = 0
        }
  
        for (let i = 0; i < completedInPeriod.length; i++) {
          const todo = completedInPeriod[i]
          const completedDate = new Date(todo.completedAt)
          const monthIndex = completedDate.getMonth()
          tasksByPeriod[monthIndex]++
        }
      }
  
      let maxValue = 0
      for (const key in tasksByPeriod) {
        if (tasksByPeriod[key] > maxValue) {
          maxValue = tasksByPeriod[key]
        }
      }
  
      if (maxValue === 0) maxValue = 1
  
      for (let i = 0; i < chartBars.length && i < Object.keys(tasksByPeriod).length; i++) {
        const value = tasksByPeriod[i]
        const heightPercentage = Math.max(10, (value / maxValue) * 100)
        chartBars[i].style.height = `${heightPercentage}%`
        chartBars[i].setAttribute("data-value", value)
      }
    }
  
    function getTranslationValue(key) {
      return window.translations ? window.translations.getTranslation()[key] : null
    }
  
    function formatDate(dateString) {
      const date = new Date(dateString)
      const currentLang = localStorage.getItem("userLanguage") || "fr"
  
      return date.toLocaleDateString(
        currentLang === "en" ? "en-US" : currentLang === "es" ? "es-ES" : currentLang === "de" ? "de-DE" : "fr-FR",
        {
          day: "numeric",
          month: "short",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        },
      )
    }
  
    function formatTimeAgo(isoDate) {
      if (!isoDate) return ""
  
      if (window.translations) {
        return window.translations.formatTimeAgo(isoDate)
      }
  
      const seconds = Math.floor((Date.now() - new Date(isoDate).getTime()) / 1000)
      const intervals = [
        { label: "an", seconds: 31536000 },
        { label: "mois", seconds: 2592000 },
        { label: "jour", seconds: 86400 },
        { label: "heure", seconds: 3600 },
        { label: "minute", seconds: 60 },
        { label: "seconde", seconds: 1 },
      ]
      for (let i = 0; i < intervals.length; i++) {
        const { label, seconds: s } = intervals[i]
        const count = Math.floor(seconds / s)
        if (count > 0) {
          return `il y a ${count} ${label}${count > 1 && label !== "mois" ? "s" : ""}`
        }
      }
      return "à l'instant"
    }
  })
  