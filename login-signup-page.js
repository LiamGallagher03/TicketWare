// Wait until the page loads
document.addEventListener("DOMContentLoaded", () => {
    const loginToggle = document.getElementById("login-toggle");
    const signupToggle = document.getElementById("signup-toggle");
    const loginForm = document.getElementById("login-form");
    const signupForm = document.getElementById("signup-form");
    const loginMessage = document.getElementById("login-message");
    const signupMessage = document.getElementById("signup-message");

    // Toggle between login and signup forms
    loginToggle.addEventListener("click", () => {
        loginToggle.classList.add("active");
        signupToggle.classList.remove("active");
        loginForm.classList.add("active");
        signupForm.classList.remove("active");
        loginMessage.textContent = "";
        signupMessage.textContent = "";
    });

    signupToggle.addEventListener("click", () => {
        signupToggle.classList.add("active");
        loginToggle.classList.remove("active");
        signupForm.classList.add("active");
        loginForm.classList.remove("active");
        loginMessage.textContent = "";
        signupMessage.textContent = "";
    });

    // Login form submission
    loginForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const email = document.getElementById("login-email").value;
        const password = document.getElementById("login-password").value;

        if (email && password) {
            // Simulate login success (replace with actual authentication)
            loginMessage.textContent = "Login successful!";
            loginMessage.style.color = "green";
        } else {
            loginMessage.textContent = "Please fill in all fields.";
            loginMessage.style.color = "red";
        }
    });

    // Signup form submission
    signupForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const email = document.getElementById("signup-email").value;
        const password = document.getElementById("signup-password").value;
        const confirmPassword = document.getElementById("confirm-password").value;

        if (email && password && confirmPassword) {
            if (password === confirmPassword) {
                // Simulate signup success (replace with actual registration)
                signupMessage.textContent = "Signup successful!";
                signupMessage.style.color = "green";
            } else {
                signupMessage.textContent = "Passwords do not match.";
                signupMessage.style.color = "red";
            }
        } else {
            signupMessage.textContent = "Please fill in all fields.";
            signupMessage.style.color = "red";
        }
    });
});