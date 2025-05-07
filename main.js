document.addEventListener('DOMContentLoaded', function(e) {
  e.preventDefault();
  const loginForm = document.getElementById('loginForm');
  const emailGroup = document.getElementById('emailGroup');
  const passwordGroup = document.getElementById('passwordGroup');
  const emailInput = document.getElementById('email');
  const passwordInput = document.getElementById('password');
  const passwordToggle = document.getElementById('passwordToggle');
  const loginButton = document.getElementById('loginButton');

  function validateEmail(email) {
      const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
      return re.test(String(email).toLowerCase());
  }

  passwordToggle.addEventListener('click', function() {
      if (passwordInput.type === 'password') {
          passwordInput.type = 'text';
          passwordToggle.textContent = '🔒';
      } else {
          passwordInput.type = 'password';
          passwordToggle.textContent = '👁️';
      }
  });

  emailInput.addEventListener('blur', function() {
      if (emailInput.value.trim() === '' || !validateEmail(emailInput.value)) {
          emailGroup.classList.add('error');
      } else {
          emailGroup.classList.remove('error');
      }
  });

  passwordInput.addEventListener('blur', function() {
      if (passwordInput.value.trim() === '') {
          passwordGroup.classList.add('error');
      } else {
          passwordGroup.classList.remove('error');
      }
  });

  loginForm.addEventListener('submit', function(e) {
      e.preventDefault();
      let isValid = true;

      if (emailInput.value.trim() === '' || !validateEmail(emailInput.value)) {
          emailGroup.classList.add('error');
          isValid = false;
      } else {
          emailGroup.classList.remove('error');
      }

      if (passwordInput.value.trim() === '') {
          passwordGroup.classList.add('error');
          isValid = false;
      } else {
          passwordGroup.classList.remove('error');
      }

      if (isValid) {
          loginButton.textContent = '';
          loginButton.classList.add('loading');
          
          setTimeout(function() {
              loginButton.classList.remove('loading');
              loginButton.classList.add('success');
              loginButton.textContent = 'Connecté!';
              
              setTimeout(function() {
                  console.log('Connexion réussie avec:', {
                      email: emailInput.value,
                      password: passwordInput.value,
                      remember: document.getElementById('remember').checked
                  });
                  location.href = 'dashboard.html';
              }, 100);
          }, 1500);
      }
  });
});