// js/admin/admin-usuaris.js
document.addEventListener('DOMContentLoaded', () => {
    const usuarisBody = document.getElementById('usuaris-body');
    const API_USUARIS_URL = 'https://54.146.198.94/api/usuaris/usuaris';

    // ------------------------------------------------------------------
    // Funció auxiliar per obtenir el token d'autenticació
    // ------------------------------------------------------------------
    function getAuthToken() {
        // Prioritat: funció de window.auth (definida a auth.js)
        if (typeof window.auth !== 'undefined' && typeof window.auth.getRequestToken === 'function') {
            return window.auth.getRequestToken();
        }
        // Alternativa: directament de localStorage (clau 'token')
        const token = localStorage.getItem('token');
        return token ? token : null;
    }

    // ------------------------------------------------------------------
    // Carregar usuaris des de l'API
    // ------------------------------------------------------------------
    async function fetchUsers() {
        try {
            const token = getAuthToken();
            const headers = { 'Accept': 'application/json' };
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }

            const response = await fetch(API_USUARIS_URL, { headers });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status} – ${response.statusText}`);
            }

            const usuaris = await response.json();
            renderUsers(usuaris);
        } catch (error) {
            console.error('Error carregant usuaris:', error);
            if (usuarisBody) {
                usuarisBody.innerHTML = `<tr><td colspan="4" style="text-align:center; padding:20px;">Error al carregar els usuaris. ${error.message}</td></tr>`;
            }
        }
    }

    // ------------------------------------------------------------------
    // Mostrar usuaris a la taula
    // ------------------------------------------------------------------
    function renderUsers(usuaris) {
        if (!usuarisBody) return;

        if (!Array.isArray(usuaris) || usuaris.length === 0) {
            usuarisBody.innerHTML = '<tr><td colspan="4" style="text-align:center; padding:20px;">No hi ha usuaris registrats.</td></tr>';
            return;
        }

        usuarisBody.innerHTML = '';

        usuaris.forEach(user => {
            const userId = user.id; // la API retorna 'id'
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${escapeHtml(user.nom)}</td>
                <td>${escapeHtml(user.email)}</td>
                <td>${escapeHtml(user.rol)}</td>
                <td>
                    ${userId ? `<button class="btn-delete" data-id="${userId}">Borrar</button>` : ''}
                </td>
            `;
            usuarisBody.appendChild(row);
        });

        // Assignar esdeveniments als botons d'esborrar
        document.querySelectorAll('.btn-delete').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = e.target.getAttribute('data-id');
                if (id && confirm('Estàs segur que vols borrar aquest usuari?')) {
                    deleteUser(id);
                }
            });
        });
    }

    // ------------------------------------------------------------------
    // Escapar HTML per evitar XSS
    // ------------------------------------------------------------------
    function escapeHtml(text) {
        if (text === null || text === undefined) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // ------------------------------------------------------------------
    // Esborrar un usuari (DELETE)
    // ------------------------------------------------------------------
    async function deleteUser(id) {
        try {
            const token = getAuthToken();
            const headers = { 'Accept': 'application/json' };
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }

            const response = await fetch(`${API_USUARIS_URL}/${id}`, {
                method: 'DELETE',
                headers
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Error ${response.status}: ${errorText}`);
            }

            // Recarregar la llista després d'esborrar
            await fetchUsers();
        } catch (error) {
            console.error('Error eliminant usuari:', error);
            alert(`No s'ha pogut eliminar l'usuari: ${error.message}`);
        }
    }

    // ------------------------------------------------------------------
    // Crear un nou usuari (POST)
    // ------------------------------------------------------------------
    async function createUser(nom, email, rol) {
        try {
            const token = getAuthToken();
            const headers = {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            };
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }

            const nouUsuari = {
                nom: nom,
                email: email,
                rol: rol,
                actiu: true   // per defecte actiu
                // provider i providerId no s'envien en creació manual
            };

            const response = await fetch(API_USUARIS_URL, {
                method: 'POST',
                headers,
                body: JSON.stringify(nouUsuari)
            });

            if (!response.ok) {
                const errorData = await response.text();
                throw new Error(`HTTP ${response.status}: ${errorData}`);
            }

            // Recarregar la llista
            await fetchUsers();
            return true;
        } catch (error) {
            console.error('Error creant usuari:', error);
            alert(`No s'ha pogut crear l'usuari: ${error.message}`);
            return false;
        }
    }

    // ------------------------------------------------------------------
    // Gestió del modal (Afegir Usuari)
    // ------------------------------------------------------------------
    const modalOverlay = document.getElementById('modal-overlay');
    const formUsuari = document.getElementById('form-nou-usuari');
    const btnAddUser = document.getElementById('btn-add-user');
    const btnModalTancar = document.getElementById('btn-modal-tancar');
    const btnModalCancel = document.getElementById('btn-modal-cancel');

    function tancarModal() {
        modalOverlay.classList.remove('active');
        formUsuari.reset();
    }

    if (btnAddUser) {
        btnAddUser.addEventListener('click', () => {
            modalOverlay.classList.add('active');
            document.getElementById('nou-nom').focus();
        });
    }

    if (btnModalTancar) btnModalTancar.addEventListener('click', tancarModal);
    if (btnModalCancel) btnModalCancel.addEventListener('click', tancarModal);

    modalOverlay.addEventListener('click', (e) => {
        if (e.target === modalOverlay) tancarModal();
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modalOverlay.classList.contains('active')) {
            tancarModal();
        }
    });

    formUsuari.addEventListener('submit', async (e) => {
        e.preventDefault();
        const nom = document.getElementById('nou-nom').value.trim();
        const correu = document.getElementById('nou-correu').value.trim();
        const rol = document.getElementById('nou-rol').value;

        if (!nom || !correu || !rol) {
            alert('Tots els camps són obligatoris');
            return;
        }

        // Validació bàsica del correu
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(correu)) {
            alert('Introdueix un correu electrònic vàlid');
            return;
        }

        const creat = await createUser(nom, correu, rol);
        if (creat) {
            tancarModal();
        }
    });

    // ------------------------------------------------------------------
    // Carregar usuaris en iniciar la pàgina
    // ------------------------------------------------------------------
    fetchUsers();
});