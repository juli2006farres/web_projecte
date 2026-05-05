// ============================================================
// LOGIN.JS — Gestió del Google Sign-In a la pàgina de login
// ============================================================

const API_BASE = 'http://localhost:8085'; // Canvia per la URL real en producció

// ---------- GESTIÓ DEL TOKEN ----------
function getToken() {
    return localStorage.getItem('agenda_token');
}

function setToken(token) {
    localStorage.setItem('agenda_token', token);
}

// ---------- CALLBACK DE GOOGLE ----------
async function handleGoogleCredential(response) {
    const token = response.credential;
    const errorEl = document.getElementById('login-error');
    const loadingEl = document.getElementById('login-loading');

    // Amaguem error anterior i mostrem "carregant"
    errorEl.style.display = 'none';
    loadingEl.style.display = 'flex';

    try {
        // Validem el token al backend (registra/actualitza l'usuari)
        const res = await fetch(`${API_BASE}/usuaris/token`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!res.ok) {
            loadingEl.style.display = 'none';
            errorEl.style.display = 'block';
            return;
        }

        // Token vàlid: el guardem i redirigim al panell admin
        setToken(token);
        window.location.href = 'admin.html';
    } catch (e) {
        console.error('Error d\'autenticació:', e);
        loadingEl.style.display = 'none';
        errorEl.style.display = 'block';
    }
}

// ---------- INICIALITZACIÓ DE GOOGLE SIGN-IN ----------
function initGoogleSignIn() {
    // Si la llibreria de Google encara no està carregada, esperem una mica
    if (typeof google === 'undefined' || !google.accounts) {
        setTimeout(initGoogleSignIn, 100);
        return;
    }

    const clientId = document.querySelector('meta[name="google-client-id"]')?.content;
    if (!clientId) {
        console.error('Falta el Google Client ID al meta tag!');
        return;
    }

    google.accounts.id.initialize({
        client_id: clientId,
        callback: handleGoogleCredential
    });

    google.accounts.id.renderButton(
        document.getElementById('google-signin-btn'),
        { theme: 'outline', size: 'large', text: 'signin_with', locale: 'ca' }
    );
}

// ---------- ARRENCADA ----------
document.addEventListener('DOMContentLoaded', function () {
    // Si l'usuari ja té token, anem directament al panell d'admin
    if (getToken()) {
        window.location.href = 'admin.html';
        return;
    }

    // Si no, inicialitzem el botó de Google
    initGoogleSignIn();
});