// Wait until the page loads
document.addEventListener("DOMContentLoaded", () => {
    const loginToggle = document.getElementById("login-toggle");
    const signupToggle = document.getElementById("signup-toggle");
    const loginForm = document.getElementById("login-form");
    const signupForm = document.getElementById("signup-form");
    const loginMessage = document.getElementById("login-message");
    const signupMessage = document.getElementById("signup-message");
    const signupPasswordInput = document.getElementById("signup-password");
    const signupPasswordReq = {
        length: document.getElementById("signup-password-length"),
        upperLower: document.getElementById("signup-password-upperlower"),
        digit: document.getElementById("signup-password-digit"),
        special: document.getElementById("signup-password-special"),
    };

    const updateSignupPasswordRequirements = (password) => {
        const hasLength = password.length >= 8 && password.length <= 64;
        const hasUpperLower = /[A-Z]/.test(password) && /[a-z]/.test(password);
        const hasDigit = /[0-9]/.test(password);
        const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);

        signupPasswordReq.length.classList.toggle("valid", hasLength);
        signupPasswordReq.upperLower.classList.toggle("valid", hasUpperLower);
        signupPasswordReq.digit.classList.toggle("valid", hasDigit);
        signupPasswordReq.special.classList.toggle("valid", hasSpecial);
    };

    // Toggle between login and signup forms
    loginToggle.addEventListener("click", () => {
        loginToggle.classList.add("active");
        signupToggle.classList.remove("active");
        loginForm.classList.add("active");
        signupForm.classList.remove("active");
        loginMessage.textContent = "";
        signupMessage.textContent = "";
        document.getElementById("login-password-error").textContent = "";
        document.getElementById("confirm-password-error").textContent = "";
        updateSignupPasswordRequirements("");
    });

    signupToggle.addEventListener("click", () => {
        signupToggle.classList.add("active");
        loginToggle.classList.remove("active");
        signupForm.classList.add("active");
        loginForm.classList.remove("active");
        loginMessage.textContent = "";
        signupMessage.textContent = "";
        document.getElementById("login-password-error").textContent = "";
        document.getElementById("confirm-password-error").textContent = "";
        updateSignupPasswordRequirements(signupPasswordInput.value);
    });

    // Login form submission
    loginForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const email = document.getElementById("login-email").value;
        const username = document.getElementById("login-username").value;
        const password = document.getElementById("login-password").value;

        if (email && username && password) {
            // Simulate login success (replace with actual authentication)
            loginMessage.textContent = "Login successful!";
            loginMessage.style.color = "green";
        } else {
            if (!email || !username || !password) {
                loginMessage.textContent = "Please fill in all fields.";
            } 
            loginMessage.style.color = "red";
        }
    });

    // Signup form submission
    signupForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const email = document.getElementById("signup-email").value;
        const username = document.getElementById("signup-username").value;
        const password = document.getElementById("signup-password").value;
        const confirmPassword = document.getElementById("confirm-password").value;

        if (email && username && password && confirmPassword && password === confirmPassword) {
            // Simulate signup success (replace with actual registration)
            signupMessage.textContent = "Signup successful!";
            signupMessage.style.color = "green";
        } else {
            if (!email || !username ||!password || !confirmPassword) {
                signupMessage.textContent = "Please fill in all fields.";
            } else if (password !== confirmPassword) {
                signupMessage.textContent = "Passwords do not match.";
            }
            signupMessage.style.color = "red";
        }
    });

    signupPasswordInput.addEventListener("input", function() {
        const password = this.value;
        updateSignupPasswordRequirements(password);
    });
});