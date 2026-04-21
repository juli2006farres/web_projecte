(function() {
    "use strict";

    // Esperem que el DOM estigui carregat
    document.addEventListener('DOMContentLoaded', function() {
        
        // ---------- RELLOTGE ----------
        function updateClock() {
            const timeEl = document.getElementById('admin-current-time');
            if (timeEl) {
                const now = new Date();
                timeEl.textContent = now.toLocaleString('ca-ES', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit',
                    hour12: false
                }).replace(/\//g, '/');
            }
        }
        updateClock();
        setInterval(updateClock, 1000);

        // ---------- NAVEGACIÓ PER PESTANYES ----------
        const navButtons = document.querySelectorAll('.admin-nav-btn[data-view]');
        const views = {
            dashboard: document.getElementById('view-dashboard'),
            users: document.getElementById('view-users'),
            activities: document.getElementById('view-activities'),
            rooms: document.getElementById('view-rooms')
        };

        // Funció per canviar de pestanya
        function switchView(viewId) {
            // Treure 'active' de tots els botons
            navButtons.forEach(btn => btn.classList.remove('active'));
            // Treure 'active' de totes les vistes
            Object.values(views).forEach(view => {
                if (view) view.classList.remove('active');
            });

            // Activar el botó corresponent
            const activeBtn = Array.from(navButtons).find(btn => btn.dataset.view === viewId);
            if (activeBtn) activeBtn.classList.add('active');

            // Activar la vista corresponent
            if (views[viewId]) views[viewId].classList.add('active');
        }

        // Assignar event listeners als botons de navegació
        navButtons.forEach(btn => {
            btn.addEventListener('click', function(e) {
                e.preventDefault();
                const viewId = this.dataset.view;
                if (viewId) switchView(viewId);
            });
        });

        // ---------- BOTÓ SORTIR ----------
        const logoutBtn = document.getElementById('logout-btn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', function(e) {
                e.preventDefault();
                // Aquí pots redirigir a la pàgina principal o tancar sessió
                if (confirm('Estàs segur que vols sortir del panell d\'administració?')) {
                    // Redirigeix a la pàgina principal (index.html)
                    window.location.href = '../index.html'; // ajusta la ruta segons estructura
                    // O també pots esborrar token d'autenticació si n'hi ha
                }
            });
        }

        // ---------- INICIALITZACIÓ: assegurem que el dashboard estigui actiu per defecte ----------
        // Si no hi ha cap botó actiu, activem dashboard
        const activeExists = Array.from(navButtons).some(btn => btn.classList.contains('active'));
        if (!activeExists) {
            switchView('dashboard');
        }

        // Exemple de càrrega inicial d'estadístiques (opcional, es pot deixar buit)
        // Més endavant omplirem les taules amb dades reals.
        console.log('Panell d\'administració carregat. Navegació preparada.');


        loadDashboardStats();
        loadRecentActivity();
    });

})();




// ---------- CARREGAR ESTADÍSTIQUES (TOTALS) ----------
async function loadDashboardStats() {
    const usersEl = document.getElementById('stat-users');
    const activitiesEl = document.getElementById('stat-activities');
    const roomsEl = document.getElementById('stat-rooms');

    // 1. Total d'usuaris
    try {
        const resposta = await fetch('https://34.230.76.192/api/usuaris/usuaris');
        const usuaris = await resposta.json();
        usersEl.textContent = usuaris.length;
    } catch (error) {
        console.warn('No s\'han pogut carregar els usuaris:', error);
    }

    // 2. Total d'activitats
    try {
        const resposta = await fetch('https://34.230.76.192/api/activitats/activitats');
        const activitats = await resposta.json();
        
        let comptadorActives = 0;
        for (let i = 0; i < activitats.length; i++) {
            if (activitats[i].activa === true) {
                comptadorActives = comptadorActives + 1;
            }
        }
        activitiesEl.textContent = comptadorActives;
    } catch (error) {
        console.warn('No s\'han pogut carregar les activitats:', error);
    }

    // 3. Total de sales
    try {
        const resposta = await fetch('https://34.230.76.192/api/sala/salas');
        const sales = await resposta.json();
        roomsEl.textContent = sales.length;
    } catch (error) {
        console.warn('No s\'han pogut carregar les sales:', error);
    }
}

// Cridem la funció en iniciar













// ---------- CARREGAR ACTIVITAT RECENT (últimes 3 activitats) ----------
async function loadRecentActivity() {
    const recentListEl = document.getElementById('recent-list');

    try {
        const resposta = await fetch('https://34.230.76.192/api/activitats/activitats');
        const activitats = await resposta.json();

        // Ordenar per data descendent (més recents primer)
        // Suposem que data és 'YYYY-MM-DD' i horaInici 'HH:MM:SS'
        activitats.sort(function(a, b) {
            const dataA = a.data + 'T' + a.horaInici;
            const dataB = b.data + 'T' + b.horaInici;
            return dataB.localeCompare(dataA); // descendent
        });

        // Agafar les 3 primeres
        const ultimes = activitats.slice(0, 3);

        // Netejar el contenidor
        recentListEl.innerHTML = '';

        if (ultimes.length === 0) {
            recentListEl.textContent = 'No hi ha activitats recents.';
            return;
        }

        // Crear llista HTML
        for (let i = 0; i < ultimes.length; i++) {
            const act = ultimes[i];
            
            const itemDiv = document.createElement('div');
            itemDiv.style.padding = '12px 0';
            itemDiv.style.borderBottom = '1px solid #e2e8f0';
            
            // Títol
            const titolP = document.createElement('p');
            titolP.style.fontWeight = '600';
            titolP.style.fontSize = '1.2rem';
            titolP.style.marginBottom = '4px';
            titolP.textContent = act.titol;
            
            // Data i hora
            const dataP = document.createElement('p');
            dataP.style.color = '#64748b';
            dataP.style.fontSize = '0.95rem';
            
            // Format data dd/mm/aaaa
            const partsData = act.data.split('-');
            const dataFormatada = partsData[2] + '/' + partsData[1] + '/' + partsData[0];
            dataP.textContent = dataFormatada + ' · ' + act.horaInici.substring(0, 5) + ' - ' + act.horaFi.substring(0, 5);
            
            itemDiv.appendChild(titolP);
            itemDiv.appendChild(dataP);
            recentListEl.appendChild(itemDiv);
        }

        // Si no és l'últim element, esborrar la vora de l'últim
        const lastChild = recentListEl.lastChild;
        if (lastChild) {
            lastChild.style.borderBottom = 'none';
        }

    } catch (error) {
        console.warn('No s\'ha pogut carregar l\'activitat recent:', error);
        recentListEl.textContent = 'Error en carregar activitats recents.';
    }
}







// ---------- CARREGAR TAULA D'USUARIS ----------
async function loadUsersTable() {
    const tbody = document.getElementById('users-table-body');
    tbody.innerHTML = '<tr><td colspan="5">Carregant usuaris...</td></tr>';

    try {
        const resposta = await fetch('https://34.230.76.192/api/usuaris/usuaris');
        const usuaris = await resposta.json();

        // Netejar taula
        tbody.innerHTML = '';

        if (usuaris.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5">No hi ha usuaris.</td></tr>';
            return;
        }

        // Omplir files
        for (let i = 0; i < usuaris.length; i++) {
            const u = usuaris[i];
            const fila = document.createElement('tr');

            // ID
            const tdId = document.createElement('td');
            tdId.textContent = u.id_usuari || u.id || '';
            fila.appendChild(tdId);

            // Nom
            const tdNom = document.createElement('td');
            tdNom.textContent = u.nom || '';
            fila.appendChild(tdNom);

            // Correu
            const tdCorreu = document.createElement('td');
            tdCorreu.textContent = u.correu || u.email || '';
            fila.appendChild(tdCorreu);

            // Rol
            const tdRol = document.createElement('td');
            tdRol.textContent = u.rol || 'usuari';
            fila.appendChild(tdRol);

            // Accions
            const tdAccions = document.createElement('td');
            const btnEsborrar = document.createElement('button');
            btnEsborrar.textContent = 'Esborrar';
            btnEsborrar.style.backgroundColor = '#dc2626';
            btnEsborrar.style.color = 'white';
            btnEsborrar.style.border = 'none';
            btnEsborrar.style.padding = '6px 14px';
            btnEsborrar.style.borderRadius = '30px';
            btnEsborrar.style.cursor = 'pointer';
            btnEsborrar.style.fontWeight = '500';
            btnEsborrar.style.fontSize = '0.9rem';
            btnEsborrar.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
            btnEsborrar.style.transition = 'all 0.15s';

            // Funció esborrar
            btnEsborrar.addEventListener('click', async function() {
                if (!confirm('Segur que vols esborrar aquest usuari?')) return;

                const idUsuari = u.id_usuari || u.id;
                try {
                    const respostaDelete = await fetch(`https://34.230.76.192/api/usuaris/usuaris/${idUsuari}`, {
                        method: 'DELETE'
                    });

                    if (respostaDelete.ok) {
                        // Recarregar taula
                        loadUsersTable();
                        // Actualitzar estadístiques
                        loadDashboardStats();
                    } else {
                        alert('Error en esborrar l\'usuari.');
                    }
                } catch (error) {
                    console.warn('Error esborrant usuari:', error);
                    alert('Error de connexió.');
                }
            });

            tdAccions.appendChild(btnEsborrar);
            fila.appendChild(tdAccions);

            tbody.appendChild(fila);
        }

    } catch (error) {
        console.warn('Error carregant usuaris:', error);
        tbody.innerHTML = '<tr><td colspan="5">Error en carregar usuaris.</td></tr>';
    }
}

// Carregar la taula d'usuaris quan es carrega la pàgina
loadUsersTable();

// També recarregar quan es canvia a la vista d'usuaris (opcional)
// Podem afegir un listener al botó de navegació 'users'
const usersNavBtn = document.querySelector('.admin-nav-btn[data-view="users"]');
if (usersNavBtn) {
    usersNavBtn.addEventListener('click', function() {
        loadUsersTable();
    });
}
















// ---------- CARREGAR TAULA D'ACTIVITATS ----------
async function loadActivitiesTable() {
    const tbody = document.getElementById('activities-table-body');
    tbody.innerHTML = '<tr><td colspan="7">Carregant activitats...</td></tr>';

    try {
        const resposta = await fetch('https://34.230.76.192/api/activitats/activitats');
        const activitats = await resposta.json();

        tbody.innerHTML = '';

        if (activitats.length === 0) {
            tbody.innerHTML = '<tr><td colspan="7">No hi ha activitats.</td></tr>';
            return;
        }

        for (let i = 0; i < activitats.length; i++) {
            const act = activitats[i];
            const fila = document.createElement('tr');

            // ID
            const tdId = document.createElement('td');
            tdId.textContent = act.id_activitat;
            fila.appendChild(tdId);

            // Títol
            const tdTitol = document.createElement('td');
            tdTitol.textContent = act.titol;
            fila.appendChild(tdTitol);

            // Sala (necessitem el nom, farem una funció auxiliar o ho deixem com a ID)
            const tdSala = document.createElement('td');
            tdSala.textContent = act.id_sala; // Més endavant podem substituir pel nom
            fila.appendChild(tdSala);

            // Data
            const tdData = document.createElement('td');
            const partsData = act.data.split('-');
            tdData.textContent = partsData[2] + '/' + partsData[1] + '/' + partsData[0];
            fila.appendChild(tdData);

            // Hora
            const tdHora = document.createElement('td');
            tdHora.textContent = act.horaInici.substring(0, 5) + ' - ' + act.horaFi.substring(0, 5);
            fila.appendChild(tdHora);

            // Activa
            const tdActiva = document.createElement('td');
            tdActiva.textContent = act.activa ? 'Sí' : 'No';
            fila.appendChild(tdActiva);

            // Accions
            const tdAccions = document.createElement('td');
            tdAccions.style.display = 'flex';
            tdAccions.style.gap = '8px';

            // Botó Editar (individual)
            const btnEditar = document.createElement('button');
            btnEditar.textContent = 'Editar';
            btnEditar.style.backgroundColor = '#f59e0b';
            btnEditar.style.color = 'white';
            btnEditar.style.border = 'none';
            btnEditar.style.padding = '6px 14px';
            btnEditar.style.borderRadius = '30px';
            btnEditar.style.cursor = 'pointer';
            btnEditar.style.fontWeight = '500';
            btnEditar.addEventListener('click', function() {
                editarActivitat(act.id_activitat);
            });

            // Botó Esborrar
            const btnEsborrar = document.createElement('button');
            btnEsborrar.textContent = 'Esborrar';
            btnEsborrar.style.backgroundColor = '#dc2626';
            btnEsborrar.style.color = 'white';
            btnEsborrar.style.border = 'none';
            btnEsborrar.style.padding = '6px 14px';
            btnEsborrar.style.borderRadius = '30px';
            btnEsborrar.style.cursor = 'pointer';
            btnEsborrar.style.fontWeight = '500';
            btnEsborrar.addEventListener('click', async function() {
                if (!confirm('Segur que vols esborrar aquesta activitat?')) return;
                try {
                    const res = await fetch(`https://34.230.76.192/api/activitats/activitats/${act.id_activitat}`, {
                        method: 'DELETE'
                    });
                    if (res.ok) {
                        loadActivitiesTable();
                        loadDashboardStats(); // actualitza comptador
                        loadRecentActivity();  // actualitza llista recent
                    } else {
                        alert('Error en esborrar.');
                    }
                } catch (error) {
                    console.warn(error);
                    alert('Error de connexió.');
                }
            });

            tdAccions.appendChild(btnEditar);
            tdAccions.appendChild(btnEsborrar);
            fila.appendChild(tdAccions);

            tbody.appendChild(fila);
        }

    } catch (error) {
        console.warn('Error carregant activitats:', error);
        tbody.innerHTML = '<tr><td colspan="7">Error en carregar activitats.</td></tr>';
    }
}

// Funció per editar (de moment buida)
function editarActivitat(id) {
    alert('Editar activitat amb ID: ' + id);
    // Més endavant obrirem un formulari modal
}

// Carregar la taula en iniciar i quan es faci clic a la pestanya
loadActivitiesTable();
document.querySelector('.admin-nav-btn[data-view="activities"]').addEventListener('click', loadActivitiesTable);

// Botó "Nova Activitat" (per ara només missatge)
document.getElementById('btn-nova-activitat').addEventListener('click', function() {
    alert('Obrir formulari per crear nova activitat.');
});


