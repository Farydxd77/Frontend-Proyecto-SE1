    const baseUrl = "http://localhost:3000/api"

    export const fetchSinToken = async(endpoint, data, method = 'GET') => {
        const url = `${baseUrl}/${endpoint}`;  // Agregué / para separar

        if( method === 'GET') {  // Usar === en lugar de ==
            const resp = await fetch(url);  // ✅ fetch, no fetchSinToken
            return await resp.json();
        } else {
            const resp = await fetch(url, {  // ✅ fetch, no fetchSinToken
                method,
                headers: {  // ✅ headers en minúscula
                    'Content-Type': 'application/json',
                    'X-Tenant-ID': 'tienda-abc'
                },
                body: JSON.stringify(data)
            });
            return await resp.json();
        }
    }

   export const fetchConToken = async (endpoint, data, method = "GET") => {
    console.log({data})
    const url = `${baseUrl}/${endpoint}`;
    const token = localStorage.getItem('token'); // O donde tengas guardado el token
    
    if (method === 'GET') {
        const resp = await fetch(url, {
            method,
            headers: {
                'Content-Type': 'application/json',
                'X-Tenant-ID': 'tienda-abc',
                'Authorization': `Bearer ${token}`
            }
        });
        return await resp.json();
    } else {
        const resp = await fetch(url, {
            method,
            headers: {
                'Content-Type': 'application/json',
                'X-Tenant-ID': 'tienda-abc',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(data)
        });
        return await resp.json();
    }
}