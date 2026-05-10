// Global utilities
async function apiFetch(url, options = {}) {
    const defaultOptions = {
        headers: { 'Content-Type': 'application/json' },
        ...options
    };
    
    try {
        const res = await fetch(url, defaultOptions);
        if (res.status === 401) {
            window.location.href = '/login';
            return;
        }
        return await res.json();
    } catch (err) {
        console.error('Fetch error:', err);
        // Basic offline support
        const cached = localStorage.getItem(url);
        if (cached) return JSON.parse(cached);
        throw err;
    }
}

function formatDate(dateStr) {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }).format(date);
}
