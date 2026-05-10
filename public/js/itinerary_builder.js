// itinerary_builder.js
document.addEventListener('DOMContentLoaded', () => {
    loadStops();
    loadChecklist();
    loadNotes();

    // Modal controls
    const stopModal = document.getElementById('stopModal');
    const closeBtn = document.getElementById('closeModal');
    const addStopBtn = document.getElementById('addStopBtn');

    addStopBtn.onclick = () => {
        document.getElementById('modalTitle').innerText = 'Plan a Destination';
        document.getElementById('stopForm').reset();
        document.getElementById('stopId').value = '';
        stopModal.style.display = 'flex';
    };

    closeBtn.onclick = () => stopModal.style.display = 'none';

    // Close on outside click
    window.onclick = (event) => {
        if (event.target == stopModal) stopModal.style.display = 'none';
        if (event.target == document.getElementById('activityModal')) document.getElementById('activityModal').style.display = 'none';
    };

    // Stop Form Submission
    document.getElementById('stopForm').onsubmit = async (e) => {
        e.preventDefault();
        const id = document.getElementById('stopId').value;
        const data = {
            city_name: document.getElementById('cityName').value,
            arrival_date: document.getElementById('arrivalDate').value,
            departure_date: document.getElementById('departureDate').value,
            trip_id: tripId,
            stop_order: 0
        };

        const method = id ? 'PUT' : 'POST';
        const url = id ? `/api/stops/${id}` : '/api/stops';

        const res = await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        if (res.ok) {
            stopModal.style.display = 'none';
            loadStops();
        } else {
            const error = await res.json();
            alert(error.error || 'Failed to save stop');
        }
    };

    // Checklist
    document.getElementById('addChecklistForm').onsubmit = async (e) => {
        e.preventDefault();
        const input = document.getElementById('checklistItem');
        await fetch('/api/checklist', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ item_name: input.value, trip_id: tripId })
        });
        input.value = '';
        loadChecklist();
    };

    // Notes
    document.getElementById('addNoteForm').onsubmit = async (e) => {
        e.preventDefault();
        const input = document.getElementById('noteText');
        await fetch('/api/notes', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ note_text: input.value, trip_id: tripId })
        });
        input.value = '';
        loadNotes();
    };
});

async function loadStops() {
    const stops = await apiFetch(`/api/stops?trip_id=${tripId}`);
    const container = document.getElementById('stopsList');
    container.innerHTML = '';

    if (stops.length === 0) {
        container.innerHTML = `<div class="card" style="text-align: center; padding: 4rem; color: var(--text-dim); border: 2px dashed var(--glass-border); background: transparent;">
            <p>Your journey is currently empty. Begin by adding your first destination.</p>
        </div>`;
        return;
    }

    stops.forEach(async stop => {
        const div = document.createElement('div');
        div.className = 'card animate-up';
        div.style.borderLeft = '6px solid var(--primary)';
        div.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 2rem;">
                <div>
                    <h3 style="font-size: 1.5rem; margin-bottom: 0.25rem;">${stop.city_name}</h3>
                    <div style="font-size: 0.9rem; font-weight: 600; color: var(--primary);">
                        <i class="far fa-calendar-alt"></i> ${formatDate(stop.arrival_date)} — ${formatDate(stop.departure_date)}
                    </div>
                </div>
                <div style="display: flex; gap: 0.75rem;">
                    <button class="btn btn-primary btn-small" onclick="showActivityModal(${stop.id})" title="Schedule Activity"><i class="fas fa-plus"></i></button>
                    <button class="btn btn-outline btn-small" onclick="deleteStop(${stop.id})" title="Remove Destination"><i class="fas fa-trash-alt"></i></button>
                </div>
            </div>
            <div id="activities-${stop.id}" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 1rem;"></div>
        `;
        container.appendChild(div);
        loadActivities(stop.id);
    });
}

async function loadActivities(stopId) {
    const acts = await apiFetch(`/api/activities?stop_id=${stopId}`);
    const container = document.getElementById(`activities-${stopId}`);
    container.innerHTML = '';
    acts.forEach(act => {
        container.innerHTML += `
            <div style="display: flex; justify-content: space-between; align-items: center; padding: 1rem; background: var(--bg-main); border-radius: var(--radius-md); border: 1px solid rgba(0,0,0,0.03);">
                <div style="display: flex; align-items: center; gap: 1rem;">
                    <div style="width: 35px; height: 35px; border-radius: 50%; background: white; display: flex; align-items: center; justify-content: center; color: var(--primary); font-size: 0.8rem; border: 1px solid var(--glass-border);">
                        <i class="fas ${getActivityIcon(act.category)}"></i>
                    </div>
                    <div>
                        <div style="font-weight: 600; font-size: 0.9rem;">${act.name}</div>
                        <div style="font-size: 0.75rem; color: var(--text-dim);">₹${act.cost.toLocaleString()}</div>
                    </div>
                </div>
                <button class="btn" style="padding: 0.25rem; background: transparent; color: var(--text-dim);" onclick="deleteActivity(${act.id}, ${stopId})"><i class="fas fa-times"></i></button>
            </div>
        `;
    });
}

function getActivityIcon(category) {
    const icons = {
        'Activities': 'fa-camera',
        'Food': 'fa-utensils',
        'Travel': 'fa-car',
        'Hotel': 'fa-hotel',
        'Shopping': 'fa-bag-shopping'
    };
    return icons[category] || 'fa-star';
}

function showActivityModal(stopId) {
    document.getElementById('activityStopId').value = stopId;
    document.getElementById('activityModal').style.display = 'flex';
}

document.getElementById('closeActModal').onclick = () => {
    document.getElementById('activityModal').style.display = 'none';
};

document.getElementById('activityForm').onsubmit = async (e) => {
    e.preventDefault();
    const stopId = document.getElementById('activityStopId').value;
    const data = {
        name: document.getElementById('actName').value,
        cost: document.getElementById('actCost').value,
        activity_time: document.getElementById('actTime').value,
        category: document.getElementById('actCategory').value,
        stop_id: stopId
    };
    const res = await fetch('/api/activities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });
    if (res.ok) {
        document.getElementById('activityModal').style.display = 'none';
        loadActivities(stopId);
    } else {
        const error = await res.json();
        alert(error.error || 'Failed to add activity');
    }
};

async function deleteStop(id) {
    if (!confirm('Are you sure you want to remove this destination and all its scheduled activities?')) return;
    await fetch(`/api/stops/${id}`, { method: 'DELETE' });
    loadStops();
}

async function deleteActivity(id, stopId) {
    await fetch(`/api/activities/${id}`, { method: 'DELETE' });
    loadActivities(stopId);
}

async function loadChecklist() {
    const items = await apiFetch(`/api/checklist/${tripId}`);
    const container = document.getElementById('checklistItems');
    container.innerHTML = '';
    items.forEach(item => {
        container.innerHTML += `
            <div style="display: flex; align-items: center; gap: 1rem; padding: 0.75rem 1rem; background: rgba(255,255,255,0.5); border-radius: var(--radius-md); border: 1px solid var(--glass-border);">
                <input type="checkbox" ${item.is_packed ? 'checked' : ''} onchange="togglePacked(${item.id}, this.checked)" style="width: 1.25rem; height: 1.25rem; accent-color: var(--success); cursor: pointer;">
                <span style="${item.is_packed ? 'text-decoration: line-through; opacity: 0.5;' : ''}; font-weight: 500; font-size: 0.9rem;">${item.item_name}</span>
            </div>
        `;
    });
}

async function togglePacked(id, checked) {
    await fetch(`/api/checklist/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_packed: checked })
    });
    loadChecklist();
}

async function loadNotes() {
    const notes = await apiFetch(`/api/notes/${tripId}`);
    const container = document.getElementById('notesList');
    container.innerHTML = '';
    notes.forEach(note => {
        container.innerHTML += `
            <div class="animate-up" style="padding: 1.25rem; margin-bottom: 1rem; background: rgba(255,255,255,0.5); border-radius: var(--radius-md); border: 1px solid var(--glass-border); position: relative;">
                <p style="margin: 0; font-size: 0.95rem; color: var(--text-heading); font-weight: 500;">${note.note_text}</p>
                <div style="margin-top: 0.75rem; font-size: 0.75rem; color: var(--text-dim); font-weight: 600;">${new Date(note.created_at).toLocaleDateString()}</div>
                <button onclick="deleteNote(${note.id})" style="position: absolute; top: 0.75rem; right: 0.75rem; background: none; border: none; cursor: pointer; color: var(--text-dim); font-size: 0.9rem;"><i class="fas fa-times"></i></button>
            </div>
        `;
    });
}

async function deleteNote(id) {
    await fetch(`/api/notes/${id}`, { method: 'DELETE' });
    loadNotes();
}
