// budget.js
async function loadBudget() {
    const data = await apiFetch(`/api/budget/${tripId}`);
    if (!data) return;

    const totalEl = document.getElementById('totalCost');
    const avgEl = document.getElementById('avgPerDay');
    if (totalEl) totalEl.innerText = `₹${data.totalCost.toFixed(2)}`;
    
    // Calculate average per day
    const dates = Object.keys(data.dailyCosts);
    const avg = dates.length ? (data.totalCost / dates.length) : 0;
    if (avgEl) avgEl.innerText = `₹${avg.toFixed(2)}`;

    // Alerts
    const alertContainer = document.getElementById('budgetAlerts');
    if (alertContainer) {
        alertContainer.innerHTML = '';
        data.alerts.forEach(alert => {
            const div = document.createElement('div');
            div.style.cssText = 'padding: 0.75rem; background: hsla(0, 72%, 51%, 0.1); border-radius: var(--radius-sm); border: 1px solid var(--danger); color: var(--danger); margin-bottom: 0.5rem;';
            div.innerText = `⚠️ ${alert}`;
            alertContainer.appendChild(div);
        });
    }

    // Chart.js
    const canvas = document.getElementById('budgetChart');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const categories = Object.keys(data.categorySum);
    const costs = Object.values(data.categorySum);

    // If no costs, show empty state or placeholder
    if (costs.length === 0) {
        ctx.font = '14px Inter';
        ctx.fillStyle = '#64748b';
        ctx.textAlign = 'center';
        ctx.fillText('No expenses yet', canvas.width / 2, canvas.height / 2);
        return;
    }

    new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: categories,
            datasets: [{
                data: costs,
                backgroundColor: [
                    '#2563eb', '#8b5cf6', '#22c55e', '#f59e0b', '#ef4444', '#64748b'
                ],
                borderWidth: 0,
                hoverOffset: 10
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: '75%',
            plugins: {
                legend: { 
                    position: 'bottom',
                    labels: {
                        usePointStyle: true,
                        padding: 20,
                        font: { family: 'Inter', size: 12 }
                    }
                }
            }
        }
    });

    // Detailed Breakdown List
    const breakdownEl = document.getElementById('categoryBreakdown');
    if (breakdownEl) {
        breakdownEl.innerHTML = '';
        categories.forEach((cat, index) => {
            const row = document.createElement('div');
            row.style.cssText = 'display: flex; justify-content: space-between; font-size: 0.85rem; align-items: center;';
            row.innerHTML = `
                <div style="display: flex; align-items: center; gap: 0.5rem;">
                    <div style="width: 10px; height: 10px; border-radius: 2px; background: ${['#2563eb', '#8b5cf6', '#22c55e', '#f59e0b', '#ef4444', '#64748b'][index % 6]}"></div>
                    <span style="font-weight: 500;">${cat}</span>
                </div>
                <span style="font-weight: 700;">₹${data.categorySum[cat].toLocaleString()}</span>
            `;
            breakdownEl.appendChild(row);
        });
    }
}
