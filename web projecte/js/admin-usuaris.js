document.addEventListener('DOMContentLoaded', () => {
    const usuarisBody = document.getElementById('usuaris-body');
    const apiBase = window.API_BASE || 'https://api.agenda.ianordonez.cat';

    async function fetchUsers() {
        try {
            const token = getRequestToken();
            const response = await fetch(`${apiBase}/usuaris/usuaris`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error('Error al carregar els usuaris');
            }

            const usuaris = await response.json();
            renderUsers(usuaris);
        } catch (error) {
            console.error('Error fetching users:', error);
            if (usuarisBody) {
                usuarisBody.innerHTML = '<tr><td colspan="4" style="text-align:center; padding: 20px;">Error al carregar els usuaris. Revisa la consola per a més detalls.</td></tr>';
            }
        }
    }

    function renderUsers(usuaris) {
        if (!usuarisBody) return;

        if (usuaris.length === 0) {
            usuarisBody.innerHTML = '<tr><td colspan="4" style="text-align:center; padding: 20px;">No hi ha usuaris registrats.</td></tr>';
            return;
        }

        usuarisBody.innerHTML = ''; // Clear loading message

        usuaris.forEach(user => {
            console.log(user);
            // L'API pot tornar 'id' o 'id_usuari' depenent de la configuració de Jackson
            const userId = user.id || user.id_usuari;
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${user.nom}</td>
                <td>${user.email}</td>
                <td>${user.rol}</td>
                <td>
                    ${userId ? `<button class="btn-delete" data-id="${userId}">Borrar</button>` : ''}
                </td>
            `;
            usuarisBody.appendChild(row);
        });

        // Add event listeners to delete buttons
        document.querySelectorAll('.btn-delete').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = e.target.getAttribute('data-id');
                if (id && confirm('Estàs segur de borrar aquest usuari?')) {
                    deleteUser(id);
                }
            });
        });
    }

    async function deleteUser(id) {
        try {
            const token = auth.getRequestToken();
            const response = await fetch(`${apiBase}/usuaris/usuaris/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                fetchUsers(); // Refresh list
            } else {
                alert('Error al esborrar l\'usuari');
            }
        } catch (error) {
            console.error('Error deleting user:', error);
            alert('Error de xarxa al esborrar l\'usuari');
        }
    }

    // Initial fetch
    fetchUsers();
});
