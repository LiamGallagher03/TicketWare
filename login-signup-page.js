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
        lengthLeast: document.getElementById("signup-password-length"),
        upperLower: document.getElementById("signup-password-upperlower"),
        digit: document.getElementById("signup-password-digit"),
        special: document.getElementById("signup-password-special"),
    };

    const updateSignupPasswordRequirements = (password) => {
        const hasLength = password.length >= 8 && password.length <= 64;
        const hasUpper = /[A-Z]/.test(password);
        const hasLower = /[a-z]/.test(password);
        const hasUpperLower = hasUpper && hasLower;
        const hasDigit = /[0-9]/.test(password);
        const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);

        signupPasswordReq.lengthLeast.classList.toggle("valid", hasLength);
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
        document.getElementById("signup-password-error").textContent = "";
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
        document.getElementById("signup-password-error").textContent = "";
        document.getElementById("confirm-password-error").textContent = "";
        updateSignupPasswordRequirements(signupPasswordInput.value);
    });

    // Login form submission
    loginForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const email = document.getElementById("login-email").value;
        const password = document.getElementById("login-password").value;

        if (email && password && password.length >= 8) {
            // Simulate login success (replace with actual authentication)
            loginMessage.textContent = "Login successful!";
            loginMessage.style.color = "green";
        } else {
            if (!email || !password) {
                loginMessage.textContent = "Please fill in all fields.";
            } 
            loginMessage.style.color = "red";
        }
    });

    // Signup form submission
    signupForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const email = document.getElementById("signup-email").value;
        const password = document.getElementById("signup-password").value;
        const confirmPassword = document.getElementById("confirm-password").value;

        if (email && password && confirmPassword && password.length >= 8 && password === confirmPassword) {
            // Simulate signup success (replace with actual registration)
            signupMessage.textContent = "Signup successful!";
            signupMessage.style.color = "green";
        } else {
            if (!email || !password || !confirmPassword) {
                signupMessage.textContent = "Please fill in all fields.";
            } else if (password.length < 8) {
                signupMessage.textContent = "Password must be at least 8 characters.";
            } else if (password !== confirmPassword) {
                signupMessage.textContent = "Passwords do not match.";
            }
            signupMessage.style.color = "red";
        }
    });

    signupPasswordInput.addEventListener("input", function() {
        const password = this.value;
        updateSignupPasswordRequirements(password);

        const error = document.getElementById("signup-password-error");
        if (password.length < 8 || password.length > 64) {
            error.textContent = "Password must be between 8 and 64 characters long.";
        } else if (!/[A-Z]/.test(password)) {
            error.textContent = "Password must contain at least one uppercase letter.";
        } else if (!/[a-z]/.test(password)) {
            error.textContent = "Password must contain at least one lowercase letter.";
        } else if (!/[0-9]/.test(password)) {
            error.textContent = "Password must contain at least one number.";
        } else if (!/[!@#$%^&*(),.?\":{}|<>]/.test(password)) {
            error.textContent = "Password must contain at least one special character.";
        } else {
            error.textContent = "";
        }
    });

    document.getElementById("confirm-password").addEventListener("input", function() {
        const password = document.getElementById("signup-password").value;
        const confirm = this.value;
        const error = document.getElementById("confirm-password-error");
        if (confirm && confirm !== password) {
            error.textContent = "Passwords do not match.";
        } else {
            error.textContent = "";
        }
    });
});