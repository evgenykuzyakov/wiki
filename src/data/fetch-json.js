async function sendJson({ method, url, json }) {
    const res = await fetch(url, {
        method: method,
        body: method !== 'GET' ? JSON.stringify(json) : undefined,
        headers: { 'content-type': 'application/json; charset=utf-8' }
    });

    if (!res.ok) {
        const err = new Error(`HTTP error: ${res.status} ${res.statusText}`);
        err.data = await res.text();
    }

    if (res.status === 204) {
        // No Content
        return null;
    }
}

export async function getJson(url) {
    return await sendJson({ method: 'GET', url });
}

export async function postJson(url, json) {
    return await sendJson({ method: 'POST', url, json });
}