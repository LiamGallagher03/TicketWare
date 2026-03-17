// Wait until the page loads
document.addEventListener("DOMContentLoaded", () => {
    const button = document.getElementById("btn");

    button.addEventListener("click", () => {
        alert("Button clicked!");
    });
});