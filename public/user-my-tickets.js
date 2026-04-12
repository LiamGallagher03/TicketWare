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
    if (!raw) return '-';
    const d = new Date(raw);
    return Number.isNaN(d.getTime()) ? escHtml(raw) : d.toLocaleDateString();
}

function normalizeStatus(raw) {
    const s = (raw || '').toString().toUpperCase();
    if (s === 'O' || s === 'OPEN') return 'open';
    if (s === 'C' || s === 'CLOSED') return 'closed';
    if (s === 'P' || s === 'PENDING') return 'pending';
    return 'other';
}

function openModal(ticket) {
    const assignedAdmin = ticket.AdminUsername || ticket.AdminID || 'Unassigned';
    const assignedAdminEmail = ticket.AdminEmail || 'Unassigned';
    document.getElementById('modal-admin').textContent = assignedAdmin;
    document.getElementById('modal-admin-email').textContent = assignedAdminEmail;
    document.getElementById('modal-description').textContent = ticket.Description || '-';
    document.getElementById('modal-hardware').textContent = ticket.Hardware || '-';
    document.getElementById('modal-serial').textContent = ticket.SerialNumber || '-';
    modal.classList.add('active');
}

function renderTickets(tickets) {
    if (!Array.isArray(tickets) || tickets.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;color:#888;">No tickets found for this filter.</td></tr>';
        return;
    }

    tbody.innerHTML = tickets.map((t, i) => `
        <tr>
            <td>${escHtml(t.Title || '-')}</td>
            <td>${formatDate(t.DateCreated)}</td>
            <td><button class="btn-sm" data-index="${i}">Details</button></td>
            <td>${formatStatus(t.Status)}</td>
            <td><span style="color:#888;">-</span></td>
        </tr>
    `).join('');

    tbody.querySelectorAll('button[data-index]').forEach(btn => {
        btn.addEventListener('click', () => openModal(tickets[Number(btn.dataset.index)]));
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
        tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;color:#c00;">Please log in again to view your tickets.</td></tr>';
        return;
    }

    try {
        const res = await fetch(`/api/user-tickets?username=${encodeURIComponent(username)}`);
        const json = await res.json();

        if (!res.ok || !json.success) {
            const msg = json.error || 'Failed to load tickets.';
            tbody.innerHTML = `<tr><td colspan="5" style="text-align:center;color:#c00;">${escHtml(msg)}</td></tr>`;
            return;
        }

        if (!Array.isArray(json.tickets) || json.tickets.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;color:#888;">You have not submitted any tickets yet.</td></tr>';
            return;
        }

        myTickets = json.tickets;
        applyFilter();
    } catch (err) {
        console.error('Error loading user tickets:', err);
        tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;color:#c00;">Error loading tickets.</td></tr>';
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

if (modalClose && modal) {
    modalClose.addEventListener('click', () => modal.classList.remove('active'));
    modal.addEventListener('click', (e) => {
        if (e.target === modal) modal.classList.remove('active');
    });
}

if (statusFilter) {
    statusFilter.addEventListener('change', applyFilter);
}

loadTickets();
