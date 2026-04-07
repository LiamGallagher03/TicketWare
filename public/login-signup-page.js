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

    // Check for error messages from server
    const urlParams = new URLSearchParams(window.location.search);
    const error = urlParams.get('error');
    if (error) {
        if (error === 'password_invalid') {
            signupMessage.textContent = "Password does not meet the requirements.";
            signupMessage.style.color = "red";
            signupForm.classList.add("active");
            loginForm.classList.remove("active");
            signupToggle.classList.add("active");
            loginToggle.classList.remove("active");
        } else if (error === 'password_mismatch') {
            signupMessage.textContent = "Passwords do not match.";
            signupMessage.style.color = "red";
            signupForm.classList.add("active");
            loginForm.classList.remove("active");
            signupToggle.classList.add("active");
            loginToggle.classList.remove("active");
        } else if (error === 'missing_fields') {
            signupMessage.textContent = "Please fill in all fields.";
            signupMessage.style.color = "red";
            signupForm.classList.add("active");
            loginForm.classList.remove("active");
            signupToggle.classList.add("active");
            loginToggle.classList.remove("active");
        }
    }

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

    signupPasswordInput.addEventListener("input", function() {
        const password = this.value;
        updateSignupPasswordRequirements(password);
    });
});