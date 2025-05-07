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
                            <div class="input-btn">
                              <button onclick="deleteTask()" class="suppBtn">supprimer</button>
                              <button onclick="addTask()" class="addBtn">Ajouter</button>
                            </div>
                            <ul id="todo-list"></ul>
                        </div>
                    `;
                    dashboardContent.appendChild(div);
                }
            }
        });
    }
});
