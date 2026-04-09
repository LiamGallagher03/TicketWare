document.addEventListener("DOMContentLoaded", () => {
	const form = document.getElementById("create-ticket-form");
	if (!form) return;

	form.addEventListener("submit", async (event) => {
		event.preventDefault();

		const submitButton = form.querySelector('button[type="submit"]');
		if (submitButton) {
			submitButton.disabled = true;
			submitButton.textContent = "Creating...";
		}

		const payload = {
			username: localStorage.getItem("ticketwareLoggedInUser"),
			title: document.getElementById("title")?.value.trim(),
			description: document.getElementById("description")?.value.trim(),
			hardwareName: document.getElementById("hardware-name")?.value.trim(),
			serialNumber: document.getElementById("serial-number")?.value.trim(),
			dateCreated: new Date().toISOString()
		};

		try {
			const response = await fetch("/api/create-ticket", {
				method: "POST",
				headers: {
					"Content-Type": "application/json"
				},
				body: JSON.stringify(payload)
			});

			const result = await response.json();

			if (!response.ok || !result.success) {
				throw new Error(result.error || "Failed to create ticket.");
			}

			window.location.href = "/user-my-tickets.html";
		} catch (error) {
			console.error("Error creating ticket:", error);
			alert(error.message || "There was an error creating your ticket.");
		} finally {
			if (submitButton) {
				submitButton.disabled = false;
				submitButton.textContent = "Create Ticket";
			}
		}
	});
});
