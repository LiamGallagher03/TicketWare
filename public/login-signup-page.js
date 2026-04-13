// Wait until the page loads
document.addEventListener("DOMContentLoaded", () => {
    const loginToggle = document.getElementById("login-toggle");
    const signupToggle = document.getElementById("signup-toggle");
    const loginForm = document.getElementById("login-form");
    const signupForm = document.getElementById("signup-form");
    const loginMessage = document.getElementById("login-message");
    const signupMessage = document.getElementById("signup-message");
    const loginTurnstileContainer = document.getElementById("login-turnstile");
    const signupTurnstileContainer = document.getElementById("signup-turnstile");
    const signupPasswordInput = document.getElementById("signup-password");
    const signupPasswordReq = {
        length: document.getElementById("signup-password-length"),
        upperLower: document.getElementById("signup-password-upperlower"),
        digit: document.getElementById("signup-password-digit"),
        special: document.getElementById("signup-password-special"),
    };
    const turnstileState = {
        loaded: false,
        enabled: false,
        siteKey: "",
        loginWidgetId: null,
        signupWidgetId: null,
    };

    const setFormState = (mode) => {
        const showLogin = mode === "login";
        loginForm.classList.toggle("active", showLogin);
        signupForm.classList.toggle("active", !showLogin);
        loginToggle.classList.toggle("active", showLogin);
        signupToggle.classList.toggle("active", !showLogin);
    };

    const clearMessages = () => {
        loginMessage.textContent = "";
        signupMessage.textContent = "";
        document.getElementById("login-password-error").textContent = "";
        document.getElementById("confirm-password-error").textContent = "";
    };

    const showMessage = (element, text) => {
        element.textContent = text;
        element.style.color = "red";
    };

    const getWidgetIdForForm = (formType) => {
        return formType === "login" ? turnstileState.loginWidgetId : turnstileState.signupWidgetId;
    };

    const renderTurnstileWidgets = () => {
        if (!turnstileState.loaded || !turnstileState.enabled || !window.turnstile) {
            return;
        }

        if (turnstileState.loginWidgetId === null && loginTurnstileContainer) {
            turnstileState.loginWidgetId = window.turnstile.render(loginTurnstileContainer, {
                sitekey: turnstileState.siteKey,
                theme: "light"
            });
        }

        if (turnstileState.signupWidgetId === null && signupTurnstileContainer) {
            turnstileState.signupWidgetId = window.turnstile.render(signupTurnstileContainer, {
                sitekey: turnstileState.siteKey,
                theme: "light"
            });
        }
    };

    window.onTurnstileLoad = () => {
        turnstileState.loaded = true;
        renderTurnstileWidgets();
    };

    fetch("/api/auth-config")
        .then((response) => response.json())
        .then((config) => {
            turnstileState.enabled = Boolean(config.turnstileEnabled && config.turnstileSiteKey);
            turnstileState.siteKey = config.turnstileSiteKey || "";
            renderTurnstileWidgets();
        })
        .catch(() => {
            turnstileState.enabled = false;
        });

    // Check for error messages from server
    const urlParams = new URLSearchParams(window.location.search);
    const error = urlParams.get('error');
    if (error) {
        if (error === 'invalid_credentials') {
            showMessage(loginMessage, "Invalid username/email or password.");
            setFormState("login");
        } else if (error === 'missing_login_fields') {
            showMessage(loginMessage, "Please enter your username/email and password.");
            setFormState("login");
        } else if (error === 'login_captcha_required') {
            showMessage(loginMessage, "Please complete the CAPTCHA.");
            setFormState("login");
        } else if (error === 'login_captcha_failed') {
            showMessage(loginMessage, "CAPTCHA verification failed. Please try again.");
            setFormState("login");
        } else if (error === 'password_invalid') {
            showMessage(signupMessage, "Password does not meet the requirements.");
            setFormState("signup");
        } else if (error === 'password_mismatch') {
            showMessage(signupMessage, "Passwords do not match.");
            setFormState("signup");
        } else if (error === 'missing_fields') {
            showMessage(signupMessage, "Please fill in all fields.");
            setFormState("signup");
        } else if (error === 'signup_captcha_required') {
            showMessage(signupMessage, "Please complete the CAPTCHA.");
            setFormState("signup");
        } else if (error === 'signup_captcha_failed') {
            showMessage(signupMessage, "CAPTCHA verification failed. Please try again.");
            setFormState("signup");
        } else if (error === 'signup_failed') {
            showMessage(signupMessage, "Unable to create the account. Please try again.");
            setFormState("signup");
        } else if (error === 'server_error') {
            showMessage(loginMessage, "Server error. Please try again.");
            setFormState("login");
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
        setFormState("login");
        clearMessages();
        updateSignupPasswordRequirements("");
    });

    signupToggle.addEventListener("click", () => {
        setFormState("signup");
        clearMessages();
        updateSignupPasswordRequirements(signupPasswordInput.value);
    });

    const handleCaptchaSubmission = (event, formType, messageElement) => {
        if (!turnstileState.enabled || !window.turnstile) {
            return;
        }

        const widgetId = getWidgetIdForForm(formType);
        const token = widgetId !== null ? window.turnstile.getResponse(widgetId) : "";

        if (token) {
            return;
        }

        event.preventDefault();
        showMessage(messageElement, "Please complete the CAPTCHA.");
    };

    loginForm.addEventListener("submit", (event) => {
        handleCaptchaSubmission(event, "login", loginMessage);
    });

    signupForm.addEventListener("submit", (event) => {
        handleCaptchaSubmission(event, "signup", signupMessage);
    });

    signupPasswordInput.addEventListener("input", function() {
        const password = this.value;
        updateSignupPasswordRequirements(password);
    });
});