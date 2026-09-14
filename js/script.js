document.addEventListener('DOMContentLoaded', () => {
    const signupForm = document.getElementById('signup-form');
    const formMessage = document.getElementById('form-message');

    if (signupForm) {
        signupForm.addEventListener('submit', function(e) {
            e.preventDefault();

            const username = document.getElementById('username').value.trim();
            const email = document.getElementById('email').value.trim();
            const password = document.getElementById('password').value;

            formMessage.className = 'hidden';
            formMessage.textContent = '';

            if (username.length < 3) {
                showAlert('Username must be at least 3 characters long.', 'error');
                return;
            }

            if (password.length < 6) {
                showAlert('Password must be at least 6 characters long.', 'error');
                return;
            }

            showAlert(`Welcome to RevoltFlix, ${username}! Account created successfully.`, 'success');
            signupForm.reset();
        });
    }

    function showAlert(message, type) {
        formMessage.textContent = message;
        if (type === 'error') {
            formMessage.className = 'error-message';
        } else if (type === 'success') {
            formMessage.className = 'success-message';
        }
    }
});
