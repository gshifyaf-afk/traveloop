// itinerary_view.js
document.addEventListener('DOMContentLoaded', () => {
    loadView();
    loadBudget();

    document.getElementById('shareTrip').onclick = () => {
        const url = `${window.location.origin}/shared/${publicToken}`;
        navigator.clipboard.writeText(url);
        alert('Share link copied to clipboard!');
    };

    document.getElementById('toggleLayout').onclick = () => {
        const content = document.getElementById('itineraryContent');
        content.classList.toggle('grid-view');
        content.classList.toggle('list-view');
    };
});

async function loadView() {
    const stops = await apiFetch(`/api/stops?trip_id=${tripId}`);
    const container = document.getElementById('itineraryContent');
    container.innerHTML = '';

    for (const stop of stops) {
        const acts = await apiFetch(`/api/activities?stop_id=${stop.id}`);
        const stopDiv = document.createElement('div');
        stopDiv.className = 'stop-view-card card';
        stopDiv.innerHTML = `
            <h3>${stop.city_name}</h3>
            <p>${formatDate(stop.arrival_date)} - ${formatDate(stop.departure_date)}</p>
            <div class="view-activities">
                ${acts.map(a => `
                    <div class="view-act">
                        <span>${a.name}</span>
                        <span>$${a.cost}</span>
                    </div>
                `).join('')}
            </div>
        `;
        container.appendChild(stopDiv);
    }
}
