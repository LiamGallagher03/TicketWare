document.addEventListener("DOMContentLoaded", async () => {
    const storageKey = "ticketwareLoggedInUser";
    const username = localStorage.getItem(storageKey);
    const tableBody = document.getElementById("user-tickets-body");

    if (!tableBody) return;

    if (!username) {
        tableBody.innerHTML = '<tr><td colspan="6">Please log in to view your tickets.</td></tr>';
        return;
    }

    try {
        const response = await fetch(`/api/user-tickets?username=${encodeURIComponent(username)}`);
        const result = await response.json();

        if (!response.ok || !result.success) {
            throw new Error(result.error || "Failed to load your tickets.");
        }

        if (!Array.isArray(result.tickets) || result.tickets.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="6">You have not submitted any tickets yet.</td></tr>';
            return;
        }

        tableBody.innerHTML = result.tickets.map((ticket) => {
            const status = formatStatus(ticket.Status);
            const created = formatDate(ticket.DateCreated);

            return `
                <tr>
                    <td>${escapeHtml(ticket.Title || "-")}</td>
                    <td>${escapeHtml(ticket.Description || "-")}</td>
                    <td>${escapeHtml(ticket.Hardware || "-")}</td>
                    <td>${escapeHtml(ticket.SerialNumber || "-")}</td>
                    <td>${escapeHtml(status)}</td>
                    <td>${escapeHtml(created)}</td>
                </tr>
            `;
        }).join("");
    } catch (error) {
        console.error("Error loading user tickets:", error);
        tableBody.innerHTML = `<tr><td colspan="6">${escapeHtml(error.message || "Unable to load tickets.")}</td></tr>`;
    }
});

function formatStatus(statusCode) {
    const code = (statusCode || "").toString().toUpperCase();

    if (code === "O") return "Open";
    if (code === "R") return "Resolved";
    if (code === "C") return "Closed";

    return statusCode || "-";
}

function formatDate(dateValue) {
    if (!dateValue) return "-";

    const parsed = new Date(dateValue);
    if (Number.isNaN(parsed.getTime())) return String(dateValue);

    return parsed.toLocaleString();
}

function escapeHtml(value) {
    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/\"/g, "&quot;")
        .replace(/'/g, "&#39;");
}
