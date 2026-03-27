const API_URL = process.env.EXPO_PUBLIC_API_URL;

// Helper para hacer llamadas autenticadas al backend
export async function apiFetch(
    endpoint: string,
    token: string,
    options: RequestInit = {}
) {
    const res = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
            ...options.headers,
        },
    });

    if (!res.ok) {
        const error = await res.json().catch(() => ({}));
        throw new Error(error.message || 'API error');
    }

    return res.json();
}

//Calendar

export const calendarApi = {
    getWeek: (token: string, startDate: string, endDate: string) =>
        apiFetch(`/calendar?startDate=${startDate}&endDate=${endDate}`, token),

    addEntry: (token: string, body: { dateKey: string; slot: string; recipeId: string }) =>
        apiFetch('/calendar', token, { method: 'POST', body: JSON.stringify(body) }),

    updateEntry: (token: string, id: string, body: { status?: string | null; skippedIngredients?: string[] }) =>
        apiFetch(`/calendar/${id}`, token, { method: 'PATCH', body: JSON.stringify(body) }),

    deleteEntry: (token: string, id: string) =>
        apiFetch(`/calendar/${id}`, token, { method: 'DELETE' }),

    copy: (token: string, body: { sourceDateKey: string; targetDateKeys: string[]; slot?: string }) =>
        apiFetch('/calendar/copy', token, { method: 'POST', body: JSON.stringify(body) }),
};

//Recipes

export const recipesApi = {
    getAll: (token: string) =>
        apiFetch('/recipes', token),

    create: (token: string, body: object) =>
        apiFetch('/recipes', token, { method: 'POST', body: JSON.stringify(body) }),

    update: (token: string, id: string, body: object) =>
        apiFetch(`/recipes/${id}`, token, { method: 'PUT', body: JSON.stringify(body) }),

    delete: (token: string, id: string) =>
        apiFetch(`/recipes/${id}`, token, { method: 'DELETE' }),
};