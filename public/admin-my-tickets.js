const tbody = document.getElementById('ticket-tbody');
const modal = document.getElementById('detail-modal');
const modalClose = document.getElementById('modal-close-btn');
const statusFilter = document.getElementById('status-filter');
const storageKey = 'ticketwareLoggedInUser';
let myTickets = [];

function formatStatus(raw) {
    if (!raw) return '<span>Unknown</span>';
    const s = raw.toString().toUpperCase();
    if (s === 'O' || s === 'OPEN') return '<span class="status-open">Open</span>';
    if (s === 'C' || s === 'CLOSED') return '<span class="status-closed">Closed</span>';
    if (s === 'P' || s === 'PENDING') return '<span class="status-pending">Pending</span>';
    return `<span>${escHtml(raw)}</span>`;
}

function formatDate(raw) {
    if (!raw) return '—';
    const d = new Date(raw);
    return Number.isNaN(d.getTime()) ? escHtml(raw) : d.toLocaleDateString();
}

function openModal(ticket) {
    document.getElementById('modal-admin').textContent = ticket.AdminUsername || 'Unassigned';
    document.getElementById('modal-description').textContent = ticket.Description || '—';
    document.getElementById('modal-hardware').textContent = ticket.Hardware || '—';
    document.getElementById('modal-serial').textContent = ticket.SerialNumber || '—';
    modal.classList.add('active');
}

modalClose.addEventListener('click', () => modal.classList.remove('active'));
modal.addEventListener('click', (e) => {
    if (e.target === modal) modal.classList.remove('active');
});

function normalizeStatus(raw) {
    const s = (raw || '').toString().toUpperCase();
    if (s === 'O' || s === 'OPEN') return 'open';
    if (s === 'C' || s === 'CLOSED') return 'closed';
    if (s === 'P' || s === 'PENDING') return 'pending';
    return 'other';
}

function renderTickets(tickets) {
    if (!Array.isArray(tickets) || tickets.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;color:#888;">No tickets found for this filter.</td></tr>';
        return;
    }

    tbody.innerHTML = tickets.map((t, i) => {
        const status = (t.Status || '').toString().toUpperCase();
        const closeAction = status === 'C' || status === 'CLOSED'
            ? '<span style="color:#888;">—</span>'
            : `<button class="btn-sm btn-close" data-close-index="${i}">Close</button>`;

        return `
            <tr>
                <td>${escHtml(t.ClientUsername || '—')}</td>
                <td>${escHtml(t.Title || '—')}</td>
                <td>${formatDate(t.DateCreated)}</td>
                <td><button class="btn-sm" data-index="${i}">Details</button></td>
                <td>${formatStatus(t.Status)}</td>
                <td>${closeAction}</td>
            </tr>
        `;
    }).join('');

    tbody.querySelectorAll('button[data-index]').forEach(btn => {
        btn.addEventListener('click', () => openModal(tickets[Number(btn.dataset.index)]));
    });

    tbody.querySelectorAll('button[data-close-index]').forEach(btn => {
        btn.addEventListener('click', () => {
            const ticket = tickets[Number(btn.dataset.closeIndex)];
            closeTicket(ticket);
        });
    });
}

function applyFilter() {
    const filter = statusFilter ? statusFilter.value : 'all';

    if (filter === 'all') {
        renderTickets(myTickets);
        return;
    }

    const filtered = myTickets.filter(t => normalizeStatus(t.Status) === filter);
    renderTickets(filtered);
}

async function loadTickets() {
    const username = localStorage.getItem(storageKey);

    if (!username) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;color:#c00;">Please log in again to view your claimed tickets.</td></tr>';
        return;
    }

    try {
        const res = await fetch(`/api/admin-my-tickets?username=${encodeURIComponent(username)}`);
        const json = await res.json();

        if (!res.ok || !json.success) {
            const msg = json.error || 'Failed to load tickets.';
            tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;color:#c00;">${escHtml(msg)}</td></tr>`;
            return;
        }

        if (!Array.isArray(json.tickets) || json.tickets.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;color:#888;">No claimed tickets found.</td></tr>';
            return;
        }

        myTickets = json.tickets;
        applyFilter();
    } catch (err) {
        console.error('Error loading claimed tickets:', err);
        tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;color:#c00;">Error loading tickets.</td></tr>';
    }
}

function resolveTicketId(ticket) {
    const preferredKeys = ['ResolvedTicketId', 'ID', 'Id', 'id', 'TicketID', 'TicketId', 'ticketID', 'ticketId', 'TicketNumber', 'ticketNumber'];

    for (const key of preferredKeys) {
        if (Object.prototype.hasOwnProperty.call(ticket, key) && ticket[key] != null) {
            return ticket[key];
        }
    }

    const fallbackKey = Object.keys(ticket).find(k => /(^id$|ticket.?id|ticket.?number)/i.test(k) && ticket[k] != null);
    return fallbackKey ? ticket[fallbackKey] : null;
}

async function closeTicket(ticket) {
    const username = localStorage.getItem(storageKey);
    const ticketId = resolveTicketId(ticket);

    if (!username) {
        alert('Unable to close this ticket right now. Please refresh and try again.');
        return;
    }

    const title = ticket.Title || `#${ticketId}`;
    const confirmed = window.confirm(`Close ticket "${title}"? This action marks it as Closed.`);

    if (!confirmed) return;

    try {
        const res = await fetch('/api/admin-close-ticket', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                username,
                ticketId,
                selector: {
                    Title: ticket.Title || '',
                    DateCreated: ticket.DateCreated || '',
                    Description: ticket.Description || ''
                }
            })
        });

        const json = await res.json();

        if (!res.ok || !json.success) {
            alert(json.error || 'Failed to close ticket.');
            return;
        }

        await loadTickets();
        alert('Ticket closed successfully.');
    } catch (err) {
        console.error('Error closing ticket:', err);
        alert('Error closing ticket.');
    }
}

function escHtml(str) {
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

if (statusFilter) {
    statusFilter.addEventListener('change', applyFilter);
}

loadTickets();
