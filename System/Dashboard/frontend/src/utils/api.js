const API_BASE = '/api'

export async function apiRequest(endpoint, options = {}) {
    const token = localStorage.getItem('token')

    const headers = {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers
    }

    const res = await fetch(`${API_BASE}${endpoint}`, {
        ...options,
        headers
    })

    if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || 'Request failed')
    }

    return res.json()
}

export const api = {
    // Files
    getFiles: (path = '') => apiRequest(`/files?path=${encodeURIComponent(path)}`),
    saveFile: (path, content) => apiRequest('/files', {
        method: 'PUT',
        body: JSON.stringify({ path, content })
    }),

    // Chat
    sendMessage: (message, conversationHistory = []) => apiRequest('/chat', {
        method: 'POST',
        body: JSON.stringify({ message, conversationHistory })
    }),

    // Workflows
    getWorkflows: () => apiRequest('/workflows'),
    runWorkflow: (id) => apiRequest(`/workflows/${id}/run`, { method: 'POST' }),

    // Approvals
    getApprovals: () => apiRequest('/approvals'),
    approveRequest: (id, notes) => apiRequest(`/approvals/${id}/approve`, {
        method: 'POST',
        body: JSON.stringify({ notes })
    }),
    rejectRequest: (id, reason) => apiRequest(`/approvals/${id}/reject`, {
        method: 'POST',
        body: JSON.stringify({ reason })
    }),

    // Status
    getStatus: () => apiRequest('/status')
}
