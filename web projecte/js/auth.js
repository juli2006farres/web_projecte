// Función para capturar el token de la URL y guardarlo
function checkAuth() {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');

    if (token) {
        console.log("Token capturado:", token);
        localStorage.setItem('id_token', token);
        // Limpiamos la URL para que no se vea el token
        window.history.replaceState({}, document.title, window.location.pathname);
    }

    const savedToken = localStorage.getItem('id_token');
    if (!savedToken && !window.location.pathname.includes('login.html')) {
        // Si no hay token y no estamos en login, redirigir opcionalmente
        // window.location.href = 'login.html';
    }
}

// Ejecutar al cargar
document.addEventListener('DOMContentLoaded', checkAuth);
