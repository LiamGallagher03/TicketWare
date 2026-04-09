document.addEventListener("DOMContentLoaded", () => {
    const greetingName = document.querySelector(".user-greeting span");
    if (!greetingName) return;

    const params = new URLSearchParams(window.location.search);
    const usernameFromUrl = params.get("username");
    const storageKey = "ticketwareLoggedInUser";

    if (usernameFromUrl) {
        localStorage.setItem(storageKey, usernameFromUrl);
        greetingName.textContent = usernameFromUrl;

        // Clean the URL so username is not left in browser history/address bar.
        const cleanUrl = window.location.pathname;
        window.history.replaceState({}, "", cleanUrl);
        return;
    }

    const savedUsername = localStorage.getItem(storageKey);
    if (savedUsername) {
        greetingName.textContent = savedUsername;
    }
});
