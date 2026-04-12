const tbody = document.getElementById('ticket-tbody');
const modal = document.getElementById('detail-modal');
const modalClose = document.getElementById('modal-close-btn');
const statusFilter = document.getElementById('status-filter');
let allTickets = [];

function formatStatus(raw) {
    if (!raw) return '<span>Unknown</span>';
    const s = raw.toString().toUpperCase();
    if (s === 'O' || s === 'OPEN')   return '<span class="status-open">Open</span>';
    if (s === 'C' || s === 'CLOSED') return '<span class="status-closed">Closed</span>';
    if (s === 'P' || s === 'PENDING') return '<span class="status-pending">Pending</span>';
    return `<span>${raw}</span>`;
}

function formatDate(raw) {
    if (!raw) return '—';
    const d = new Date(raw);
    return isNaN(d.getTime()) ? raw : d.toLocaleDateString();
}

function openModal(ticket) {
    document.getElementById('modal-admin').textContent       = ticket.AdminUsername || 'Unassigned';
    document.getElementById('modal-description').textContent = ticket.Description   || '—';
    document.getElementById('modal-hardware').textContent    = ticket.Hardware       || '—';
    document.getElementById('modal-serial').textContent      = ticket.SerialNumber   || '—';
    modal.classList.add('active');
}

modalClose.addEventListener('click', () => modal.classList.remove('active'));
modal.addEventListener('click', (e) => { if (e.target === modal) modal.classList.remove('active'); });

function normalizeStatus(raw) {
    const s = (raw || '').toString().toUpperCase();
    if (s === 'O' || s === 'OPEN') return 'open';
    if (s === 'C' || s === 'CLOSED') return 'closed';
    if (s === 'P' || s === 'PENDING') return 'pending';
    return 'other';
}

function renderTickets(tickets) {
    if (!tickets.length) {
        tbody.innerHTML = `<tr><td colspan="5" style="text-align:center;color:#888;">No tickets found for this filter.</td></tr>`;
        return;
    }

    tbody.innerHTML = tickets.map((t, i) => `
        <tr>
            <td>${escHtml(t.ClientUsername || '—')}</td>
            <td>${escHtml(t.Title || '—')}</td>
            <td>${formatDate(t.DateCreated)}</td>
            <td><button class="btn-sm" data-index="${i}">Details</button></td>
            <td>${formatStatus(t.Status)}</td>
        </tr>
    `).join('');

    tbody.querySelectorAll('button[data-index]').forEach(btn => {
        btn.addEventListener('click', () => openModal(tickets[Number(btn.dataset.index)]));
    });
}

function applyFilter() {
    const filter = statusFilter ? statusFilter.value : 'all';

    if (filter === 'all') {
        renderTickets(allTickets);
        return;
    }

    const filtered = allTickets.filter(t => normalizeStatus(t.Status) === filter);
    renderTickets(filtered);
}

async function loadTickets() {
    try {
        const res = await fetch('/api/admin-all-tickets');
        const json = await res.json();

        if (!json.success) {
            tbody.innerHTML = `<tr><td colspan="5" style="text-align:center;color:#c00;">Failed to load tickets.</td></tr>`;
            return;
        }

        if (json.tickets.length === 0) {
            tbody.innerHTML = `<tr><td colspan="5" style="text-align:center;color:#888;">No tickets found.</td></tr>`;
            return;
        }

        allTickets = Array.isArray(json.tickets) ? json.tickets : [];
        applyFilter();

    } catch (err) {
        console.error('Error loading tickets:', err);
        tbody.innerHTML = `<tr><td colspan="5" style="text-align:center;color:#c00;">Error loading tickets.</td></tr>`;
    }
}

function escHtml(str) {
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

if (statusFilter) {
    statusFilter.addEventListener('change', applyFilter);
}

loadTickets();
