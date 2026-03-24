console.log("Auth library loading...");
const TOKEN_STORAGE_KEY = 'agenda_cognito_tokens';

const COGNITO_CONFIG = {
    region: window.COGNITO_CONFIG?.region || 'eu-west-1',
    userPoolId: window.COGNITO_CONFIG?.userPoolId || '',
    clientId: window.COGNITO_CONFIG?.clientId || '',
    domain: window.COGNITO_CONFIG?.domain || '',
    identityProvider: window.COGNITO_CONFIG?.identityProvider || '',
    redirectUri: window.COGNITO_CONFIG?.redirectUri || window.location.origin,
    logoutUri: window.COGNITO_CONFIG?.logoutUri || window.location.origin,
    scope: window.COGNITO_CONFIG?.scope || 'openid email profile'
};
console.log("Cognito Config present:", Boolean(window.COGNITO_CONFIG), window.COGNITO_CONFIG);

function parseJwt(token) {
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(c => `%${(`00${c.charCodeAt(0).toString(16)}`).slice(-2)}`).join(''));
        return JSON.parse(jsonPayload);
    } catch (error) {
        return null;
    }
}

function getStoredTokens() {
    const raw = localStorage.getItem(TOKEN_STORAGE_KEY);
    if (!raw) return null;

    try {
        return JSON.parse(raw);
    } catch (error) {
        localStorage.removeItem(TOKEN_STORAGE_KEY);
        return null;
    }
}

function setStoredTokens(tokens) {
    localStorage.setItem(TOKEN_STORAGE_KEY, JSON.stringify(tokens));
}

function clearStoredTokens() {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
}

function isTokenExpired(jwtToken) {
    const claims = parseJwt(jwtToken);
    if (!claims?.exp) return true;
    return Date.now() >= claims.exp * 1000;
}

function buildCognitoUrl(path, params) {
    const query = new URLSearchParams(params).toString();
    return `https://${COGNITO_CONFIG.domain}${path}?${query}`;
}

function initializeFromCallback() {
    if (!window.location.hash) return false;

    const params = new URLSearchParams(window.location.hash.slice(1));
    const accessToken = params.get('access_token');
    const idToken = params.get('id_token');

    if (!accessToken || !idToken) {
        if (window.location.hash.includes('access_token') || window.location.hash.includes('id_token') || window.location.hash.includes('error')) {
            console.log("Malformed callback detected, cleaning URL anyway");
            window.history.replaceState({}, document.title, window.location.pathname);
        }
        return false;
    }

    console.log("Tokens found in URL, saving and cleaning...");
    setStoredTokens({ accessToken, idToken });
    window.history.replaceState({}, document.title, window.location.pathname);
    return true;
}

function getAccessToken() {
    const tokens = getStoredTokens();
    if (!tokens) return null;

    const accessToken = tokens.accessToken || tokens.token || null;
    const idToken = tokens.idToken || tokens.id_token || null;

    if (!accessToken) return null;
    if (idToken && isTokenExpired(idToken)) {
        clearStoredTokens();
        return null;
    }

    return accessToken;
}

function getFallbackTokenFromStorage() {
    const localToken = localStorage.getItem('token') || localStorage.getItem('access_token') || localStorage.getItem('id_token');
    if (localToken) return localToken;

    const sessionToken = sessionStorage.getItem('token') || sessionStorage.getItem('access_token') || sessionStorage.getItem('id_token');
    return sessionToken || null;
}

function getRequestToken() {
    return getAccessToken() || getFallbackTokenFromStorage();
}

const auth = {
    initializeFromCallback,
    isConfigured: () => Boolean(COGNITO_CONFIG.clientId && COGNITO_CONFIG.domain),
    isAuthenticated: () => Boolean(getAccessToken()),
    getUser: () => {
        const tokens = getStoredTokens();
        if (!tokens?.idToken) return null;
        if (isTokenExpired(tokens.idToken)) {
            clearStoredTokens();
            return null;
        }

        const claims = parseJwt(tokens.idToken);
        return {
            name: claims?.name || claims?.email || 'User',
            email: claims?.email || ''
        };
    },
    login: (identityProvider) => {
        if (!auth.isConfigured()) {
            console.error("Cognito is NOT configured. Check COGNITO_CONFIG in config.js.", COGNITO_CONFIG);
            throw new Error('Falta configurar Cognito: define domain y clientId en window.COGNITO_CONFIG (index.html).');
        }
        console.log("Initiating login for provider:", identityProvider);

        const params = {
            client_id: COGNITO_CONFIG.clientId,
            response_type: 'token',
            scope: COGNITO_CONFIG.scope,
            redirect_uri: COGNITO_CONFIG.redirectUri
        };

        const provider = identityProvider || COGNITO_CONFIG.identityProvider;
        if (provider) {
            params.identity_provider = provider;
        }

        const endpoint = provider ? '/oauth2/authorize' : '/login';
        const loginUrl = buildCognitoUrl(endpoint, params);
        window.location.href = loginUrl;
    },
    isAuthorized: async () => {
        const user = auth.getUser();
        if (!user || !user.email) return false;
        try {
            const response = await fetch("http://localhost:8080/correos-permitidos/correos-permitidos/" + user.email);
            if (response.ok) {
                const data = await response.json()
                return data != null;
            } else {
                return false
            }
        } catch (error) {
            console.error("Error checking authorization:", error);
            return false;
        }

    },
    logout: () => {
        const shouldRedirectToCognito = auth.isConfigured();
        clearStoredTokens();

        if (!shouldRedirectToCognito) return;

        const logoutUrl = buildCognitoUrl('/logout', {
            client_id: COGNITO_CONFIG.clientId,
            logout_uri: COGNITO_CONFIG.logoutUri
        });
        window.location.href = logoutUrl;
    }
};

window.auth = auth;
window.checkAuth = () => {
    if (auth.initializeFromCallback()) {
        console.log("Logged in from callback");
    }
};

document.addEventListener('DOMContentLoaded', window.checkAuth);
