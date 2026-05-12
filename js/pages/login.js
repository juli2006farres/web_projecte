// ============================================================
// LOGIN.JS — Gestió del Cognito Sign-In a la pàgina de login
// ============================================================

const API_BASE = 'https://18.207.128.178/api';


const COGNITO_DOMAIN    = 'agenda-barata-auth-c44f17.auth.us-east-1.amazoncognito.com';
const COGNITO_CLIENT_ID = '5u259dphsi29sjqo8vj9fhv2me';
const REDIRECT_URI      = 'http://localhost:3000/login.html';

// ---------- GESTIÓ DEL TOKEN ----------
function getToken()        { return localStorage.getItem('agenda_token'); }
function setToken(token)   { localStorage.setItem('agenda_token', token); }


// PKCE (Proof Key for Code Exchange) és necessari per clients públics (SPA sense backend secret)
function generateCodeVerifier() {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return btoa(String.fromCharCode(...array))
        .replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

async function generateCodeChallenge(verifier) {
    const encoded = new TextEncoder().encode(verifier);
    const hash    = await crypto.subtle.digest('SHA-256', encoded);
    return btoa(String.fromCharCode(...new Uint8Array(hash)))
        .replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

// ---------- REDIRIGIR A COGNITO ----------
async function loginWithCognito() {
    const verifier   = generateCodeVerifier();
    const challenge  = await generateCodeChallenge(verifier);

    // Guardem el verifier per quan torni el callback
    sessionStorage.setItem('pkce_verifier', verifier);
    console.log('REDIRECT_URI:', REDIRECT_URI);

    const url = new URL(`https://${COGNITO_DOMAIN}/oauth2/authorize`);
    url.searchParams.set('client_id',             COGNITO_CLIENT_ID);
    url.searchParams.set('response_type',         'code');
    url.searchParams.set('scope',                 'openid email profile');
    url.searchParams.set('redirect_uri',          REDIRECT_URI);
    url.searchParams.set('code_challenge',        challenge);
    url.searchParams.set('code_challenge_method', 'S256');

    window.location.href = url.toString();
}

// ---------- GESTIÓ DEL CALLBACK DE COGNITO ----------
// Quan Cognito redirigeix a login.html?code=XXX, intercanviem el codi pel JWT
async function handleCallback() {
    const params = new URLSearchParams(window.location.search);
    const code   = params.get('code');
    const error  = params.get('error');

    if (error) {
        document.getElementById('login-error').style.display = 'block';
        window.history.replaceState({}, '', window.location.pathname);
        return false; // S'ha gestionat (amb error)
    }
    if (!code) return false; // No és un callback

    const errorEl   = document.getElementById('login-error');
    const loadingEl = document.getElementById('login-loading');
    errorEl.style.display   = 'none';
    loadingEl.style.display = 'flex';

    const verifier = sessionStorage.getItem('pkce_verifier');
    sessionStorage.removeItem('pkce_verifier');

    try {
        // 1. Intercanviar el codi d'autorització pel token de Cognito
        const tokenRes = await fetch(`https://${COGNITO_DOMAIN}/oauth2/token`, {
            method:  'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body:    new URLSearchParams({
                grant_type:    'authorization_code',
                client_id:     COGNITO_CLIENT_ID,
                code,
                redirect_uri:  REDIRECT_URI,
                code_verifier: verifier   // PKCE: Cognito valida que el verifier coincideix amb el challenge
            })
        });

        if (!tokenRes.ok) {
            const errBody = await tokenRes.text();
            console.error('Error token Cognito:', errBody);
            throw new Error('Error obtenint el token de Cognito');
        }

        const tokens  = await tokenRes.json();
        const idToken = tokens.id_token; // Aquest és el JWT vàlid per a l'API

        // 2. Registrar/actualitzar l'usuari a l'API amb el Cognito JWT
        const apiRes = await fetch(`${API_BASE}/usuaris/token`, {
            method:  'POST',
            headers: { 'Authorization': `Bearer ${idToken}` }
        });

        if (!apiRes.ok) {
            loadingEl.style.display = 'none';
            errorEl.style.display   = 'block';
            return true;
        }

        // 3. Guardar el token i redirigir al panell d'admin
        setToken(idToken);
        window.history.replaceState({}, '', window.location.pathname); // Netejar ?code=... de la URL
        window.location.href = 'admin.html';

    } catch (e) {
        console.error("Error d'autenticació:", e);
        loadingEl.style.display = 'none';
        errorEl.style.display   = 'block';
    }

    return true;
}

// ---------- ARRENCADA ----------
document.addEventListener('DOMContentLoaded', async function () {
    // Si ja tenim token, anem directament al panell
    if (getToken()) {
        window.location.href = 'admin.html';
        return;
    }

    // Si tornem del callback de Cognito (?code=...), gestionem-lo
    const handled = await handleCallback();
    if (handled) return;

    // Si no, mostrem el botó de login
    const btn = document.getElementById('cognito-signin-btn');
    if (btn) {
        btn.addEventListener('click', loginWithCognito);
    }
});