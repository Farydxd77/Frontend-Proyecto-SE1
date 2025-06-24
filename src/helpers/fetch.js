const baseUrl ="https://914a-189-28-75-53.ngrok-free.app/api";
// "http://localhost:3000/api"
// "https://ce1c-189-28-75-53.ngrok-free.app/api";
// "http://localhost:3000/api"

// Función auxiliar para manejar respuestas
const handleResponse = async (resp) => {
    if (!resp.ok) {
        const errorText = await resp.text();
        console.error('Error response:', errorText);
        
        // Si la respuesta parece HTML (como una página de error)
        if (errorText.includes('<!DOCTYPE') || errorText.includes('<html>')) {
            throw new Error(`Server returned HTML instead of JSON. Status: ${resp.status}`);
        }
        
        // Intentar parsear como JSON si es posible
        try {
            const errorJson = JSON.parse(errorText);
            throw new Error(errorJson.message || `HTTP Error: ${resp.status}`);
        } catch (parseError) {
            throw new Error(`HTTP Error: ${resp.status} - ${errorText}`);
        }
    }
    
    const contentType = resp.headers.get('content-type');
    if (!contentType?.includes('application/json')) {
        const text = await resp.text();
        console.warn('Response is not JSON:', text);
        if (text.includes('<!DOCTYPE') || text.includes('<html>')) {
            throw new Error('Server returned HTML instead of JSON');
        }
        return text;
    }
    
    return await resp.json();
};

export const fetchSinToken = async (endpoint, data, method = 'GET') => {
    try {
        const url = `${baseUrl}/${endpoint}`;
        
        if (method === 'GET') {
            const resp = await fetch(url, {
                headers: {
                    'Content-Type': 'application/json',
                    'X-Tenant-ID': 'tienda-abc',
                    'ngrok-skip-browser-warning': 'true'  // 🔥 Para evitar la pantalla de advertencia
                }
            });
            return await handleResponse(resp);
        } else {
            const resp = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'X-Tenant-ID': 'tienda-abc',
                    'ngrok-skip-browser-warning': 'true'  // 🔥 Para evitar la pantalla de advertencia
                },
                body: JSON.stringify(data)
            });
            return await handleResponse(resp);
        }
    } catch (error) {
        console.error(`Error en fetchSinToken (${method} ${endpoint}):`, error);
        throw error;
    }
};

export const fetchConToken = async (endpoint, data, method = "GET") => {
    try {
        console.log({ data });
        const url = `${baseUrl}/${endpoint}`;
        const token = localStorage.getItem('token');
        
        if (!token) {
            throw new Error('No hay token de autenticación disponible');
        }
        
        const headers = {
            'Content-Type': 'application/json',
            'X-Tenant-ID': 'tienda-abc',
            'Authorization': `Bearer ${token}`,
            'ngrok-skip-browser-warning': 'true'  // 🔥 ESTE ES EL HEADER QUE FALTABA
        };
        
        const config = {
            method,
            headers
        };
        
        // Solo agregar body si no es GET
        if (method !== 'GET' && data) {
            config.body = JSON.stringify(data);
        }
        
        const resp = await fetch(url, config);
        return await handleResponse(resp);
        
    } catch (error) {
        console.error(`Error en fetchConToken (${method} ${endpoint}):`, error);
        throw error;
    }
};

// Función adicional para debug
export const testConnection = async () => {
    try {
        console.log('Probando conexión a:', baseUrl);
        const resp = await fetch(baseUrl, {
            headers: {
                'ngrok-skip-browser-warning': 'true'  // 🔥 También aquí
            }
        });
        console.log('Status:', resp.status);
        console.log('Headers:', Object.fromEntries(resp.headers.entries()));
        const text = await resp.text();
        console.log('Response:', text.substring(0, 200) + '...');
        return { success: resp.ok, status: resp.status, preview: text.substring(0, 200) };
    } catch (error) {
        console.error('Error de conexión:', error);
        return { success: false, error: error.message };
    }
};