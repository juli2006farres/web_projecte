const API_BASE = 'http://localhost:8085';

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
        console.log('Valor de API_BASE:', API_BASE);
        const resposta = await fetch(`${API_BASE}/usuaris/usuaris`);
        const usuaris = await resposta.json();
        usersEl.textContent = usuaris.length;
    } catch (error) {
        console.warn('No s\'han pogut carregar els usuaris:', error);
    }

    // 2. Total d'activitats
    try {
        const resposta = await fetch(`${API_BASE}/activitats/activitats`);
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
        const resposta = await fetch(`${API_BASE}/sala/salas`);
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
        const resposta = await fetch(`${API_BASE}/activitats/activitats`);
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
        const resposta = await fetch(`${API_BASE}/usuaris/usuaris`);
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
            tdAccions.style.display = 'flex';
            tdAccions.style.gap = '8px';
            tdAccions.style.justifyContent = 'center';

            // Botó Editar
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
                editarUsuari(u);
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
            btnEsborrar.addEventListener('click', function() {
                confirmarEsborrarUsuari(u);
            });

            tdAccions.appendChild(btnEditar);
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
        const resposta = await fetch(`${API_BASE}/activitats/activitats`);
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
            btnEsborrar.addEventListener('click', function() {
                confirmarEsborrarActivitat(act);
            });

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

// Botó "Nova Activitat" → obre el modal de creació
document.getElementById('btn-nova-activitat').addEventListener('click', function() {
    showNovaActivitatModal();
});

// ---------- MODAL NOVA ACTIVITAT ----------
async function showNovaActivitatModal() {
    // Carreguem sales i usuaris en paral·lel per omplir els selects
    let sales = [];
    let usuaris = [];
    try {
        const [resSales, resUsuaris] = await Promise.all([
            fetch(`${API_BASE}/sala/salas`),
            fetch(`${API_BASE}/usuaris/usuaris`)
        ]);
        sales = await resSales.json();
        usuaris = await resUsuaris.json();
    } catch (error) {
        console.error('Error carregant sales/usuaris:', error);
        alert('No s\'han pogut carregar les sales o usuaris.');
        return;
    }

    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';

    // Construïm les opcions dels selects
    const salesOptions = sales.map(s =>
        `<option value="${s.id_sala}">${s.nom}</option>`
    ).join('');

    const usuarisOptions = usuaris.map(u => {
        const id = u.id_usuari || u.id;
        const nom = u.nom || u.correu || u.email || ('Usuari ' + id);
        return `<option value="${id}">${nom}</option>`;
    }).join('');

    overlay.innerHTML = `
        <div class="modal-card">
            <button class="modal-close-icon" aria-label="Tancar">✕</button>
            <div class="modal-title">Nova Activitat</div>

            <div class="modal-form">
                <label>
                    Títol
                    <input type="text" id="nova-act-titol" placeholder="Ex: Reunió equip" required>
                </label>

                <label>
                    Descripció
                    <textarea id="nova-act-descripcio" placeholder="Descripció de l'activitat" required></textarea>
                </label>

                <div class="form-row">
                    <label>
                        Sala
                        <select id="nova-act-sala">${salesOptions}</select>
                    </label>

                    <label>
                        Usuari
                        <select id="nova-act-usuari">${usuarisOptions}</select>
                    </label>
                </div>

                <div class="form-row">
                    <label>
                        Data
                        <input type="date" id="nova-act-data" required>
                    </label>

                    <label>
                        Hora inici
                        <input type="time" id="nova-act-hora-inici" required>
                    </label>

                    <label>
                        Hora fi
                        <input type="time" id="nova-act-hora-fi" required>
                    </label>
                </div>
                <button class="modal-close-btn" id="nova-act-guardar">Crear activitat</button>
            </div>
    `;

    document.body.appendChild(overlay);

    const close = () => overlay.remove();
    overlay.querySelector('.modal-close-icon').onclick = close;
    overlay.onclick = e => { if (e.target === overlay) close(); };

    // Acció guardar
    overlay.querySelector('#nova-act-guardar').onclick = async function() {
        const titol = document.getElementById('nova-act-titol').value.trim();
        const descripcio = document.getElementById('nova-act-descripcio').value.trim();
        const id_sala = document.getElementById('nova-act-sala').value;
        const id_usuari = document.getElementById('nova-act-usuari').value;
        const data = document.getElementById('nova-act-data').value;
        const horaInici = document.getElementById('nova-act-hora-inici').value;
        const horaFi = document.getElementById('nova-act-hora-fi').value;

        // Validacions bàsiques
        if (!titol) { alert('El títol és obligatori.'); return; }
        if (!descripcio) { alert('La descripció és obligatòria.'); return; }
        if (!id_sala) { alert('Has de seleccionar una sala.'); return; }
        if (!id_usuari) { alert('Has de seleccionar un usuari.'); return; }
        if (!data) { alert('La data és obligatòria.'); return; }
        if (!horaInici || !horaFi) { alert('Les hores són obligatòries.'); return; }
        if (horaFi <= horaInici) { alert('L\'hora final ha de ser posterior a l\'hora d\'inici.'); return; }

        const novaActivitat = {
            id_sala: Number(id_sala),
            id_usuari: Number(id_usuari),
            titol: titol,
            descripcio: descripcio,
            data: data,           // format YYYY-MM-DD (input date ja el dóna així)
            horaInici: horaInici, // format HH:mm (input time ja el dóna així)
            horaFi: horaFi
        };

        try {
            const res = await fetch(`${API_BASE}/activitats/activitat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(novaActivitat)
            });

            if (res.ok) {
                close();
                loadActivitiesTable();
                loadDashboardStats();
                loadRecentActivity();
            } else {
                const errorText = await res.text();
                console.error('Error backend:', res.status, errorText);
                alert('Error ' + res.status + ': ' + errorText);
            }
        } catch (error) {
            console.error('Error creant activitat:', error);
            alert('Error de connexió: ' + error.message);
        }
    };
}







// ---------- CARREGAR TAULA DE SALES ----------
async function loadRoomsTable() {
    const tbody = document.getElementById('rooms-table-body');
    tbody.innerHTML = '<tr><td colspan="4">Carregant sales...</td></tr>';

    try {
        const resposta = await fetch(`${API_BASE}/sala/salas`);
        const sales = await resposta.json();

        tbody.innerHTML = '';

        if (sales.length === 0) {
            tbody.innerHTML = '<tr><td colspan="4">No hi ha sales.</td></tr>';
            return;
        }

        for (let i = 0; i < sales.length; i++) {
            const s = sales[i];
            const fila = document.createElement('tr');

            // ID
            const tdId = document.createElement('td');
            tdId.textContent = s.id_sala;
            fila.appendChild(tdId);

            // Nom
            const tdNom = document.createElement('td');
            tdNom.textContent = s.nom || '';
            fila.appendChild(tdNom);

            // Color (mostrem un quadradet de color + el codi hex)
            const tdColor = document.createElement('td');
            const colorWrapper = document.createElement('div');
            colorWrapper.style.display = 'inline-flex';
            colorWrapper.style.alignItems = 'center';
            colorWrapper.style.gap = '10px';

            const colorBox = document.createElement('span');
            colorBox.style.display = 'inline-block';
            colorBox.style.width = '20px';
            colorBox.style.height = '20px';
            colorBox.style.borderRadius = '6px';
            colorBox.style.backgroundColor = s.colorHex || '#cbd5e1';
            colorBox.style.border = '1px solid #e2e8f0';

            const colorText = document.createElement('span');
            colorText.textContent = s.colorHex || '—';

            colorWrapper.appendChild(colorBox);
            colorWrapper.appendChild(colorText);
            tdColor.appendChild(colorWrapper);
            fila.appendChild(tdColor);

            // Accions
            const tdAccions = document.createElement('td');
            tdAccions.style.display = 'flex';
            tdAccions.style.gap = '8px';
            tdAccions.style.justifyContent = 'center';

            // Botó Editar
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
                editarSala(s.id_sala);
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
            btnEsborrar.addEventListener('click', function() {
                confirmarEsborrarSala(s);
            });

            tdAccions.appendChild(btnEditar);
            tdAccions.appendChild(btnEsborrar);
            fila.appendChild(tdAccions);

            tbody.appendChild(fila);
        }

    } catch (error) {
        console.warn('Error carregant sales:', error);
        tbody.innerHTML = '<tr><td colspan="4">Error en carregar sales.</td></tr>';
    }
}

// ---------- MODAL EDITAR SALA ----------
async function editarSala(id) {
    // Primer carreguem les dades de la sala (de la llista, ja que no hi ha endpoint /sala/{id})
    let sala = null;
    try {
        const res = await fetch(`${API_BASE}/sala/salas`);
        const sales = await res.json();
        sala = sales.find(s => s.id_sala === id);
    } catch (error) {
        console.error('Error carregant sala:', error);
        alert('No s\'han pogut carregar les dades de la sala.');
        return;
    }

    if (!sala) {
        alert('Sala no trobada.');
        return;
    }

    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';

    // Generem les opcions del select marcant la ubicació actual
    const ubicacions = ['P0', 'P4', 'P5'];
    const ubicacioOptions = ubicacions.map(u => {
        const selected = u === sala.ubicacio ? 'selected' : '';
        const label = u === 'P0' ? 'P0 — Planta baixa'
                    : u === 'P4' ? 'P4 — Planta 4'
                    : 'P5 — Planta 5';
        return `<option value="${u}" ${selected}>${label}</option>`;
    }).join('');

    overlay.innerHTML = `
        <div class="modal-card">
            <button class="modal-close-icon" aria-label="Tancar">✕</button>
            <div class="modal-title">Editar Sala</div>

            <div class="modal-form">
                <label>
                    Nom
                    <input type="text" id="edit-sala-nom" value="${sala.nom || ''}" required>
                </label>

                <label>
                    Ubicació
                    <select id="edit-sala-ubicacio">${ubicacioOptions}</select>
                </label>

                <label>
                    Descripció
                    <textarea id="edit-sala-descripcio">${sala.descripcio || ''}</textarea>
                </label>
            </div>

            <button class="modal-close-btn" id="edit-sala-guardar">Guardar canvis</button>
        </div>
    `;

    document.body.appendChild(overlay);

    const close = () => overlay.remove();
    overlay.querySelector('.modal-close-icon').onclick = close;
    overlay.onclick = e => { if (e.target === overlay) close(); };

    // Acció guardar
    overlay.querySelector('#edit-sala-guardar').onclick = async function() {
        const nom = document.getElementById('edit-sala-nom').value.trim();
        const ubicacio = document.getElementById('edit-sala-ubicacio').value;
        const descripcio = document.getElementById('edit-sala-descripcio').value.trim();

        if (!nom) {
            alert('El nom és obligatori.');
            return;
        }

        const salaActualitzada = {
            nom: nom,
            ubicacio: ubicacio,
            descripcio: descripcio
        };

        try {
            const res = await fetch(`${API_BASE}/sala/salas/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(salaActualitzada)
            });

            if (res.ok) {
                close();
                loadRoomsTable();
            } else {
                const errorText = await res.text();
                console.error('Error backend:', res.status, errorText);
                alert('Error ' + res.status + ': ' + errorText);
            }
        } catch (error) {
            console.error('Error editant sala:', error);
            alert('Error de connexió: ' + error.message);
        }
    };
}

// Carregar la taula en iniciar i quan es faci clic a la pestanya
loadRoomsTable();
document.querySelector('.admin-nav-btn[data-view="rooms"]').addEventListener('click', loadRoomsTable);

// Botó "Nova Sala" (per ara només missatge)
// Botó "Nova Sala" → obre el modal de creació
document.getElementById('btn-nova-sala').addEventListener('click', function() {
    showNovaSalaModal();
});

// ---------- MODAL NOVA SALA ----------
function showNovaSalaModal() {
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';

    overlay.innerHTML = `
        <div class="modal-card">
            <button class="modal-close-icon" aria-label="Tancar">✕</button>
            <div class="modal-title">Nova Sala</div>

            <div class="modal-form">
                <label>
                    Nom
                    <input type="text" id="nova-sala-nom" placeholder="Ex: Sala3" required>
                </label>

                <label>
                    Ubicació
                    <select id="nova-sala-ubicacio">
                        <option value="P0">P0 — Planta baixa</option>
                        <option value="P4">P4 — Planta 4</option>
                        <option value="P5">P5 — Planta 5</option>
                    </select>
                </label>

                <label>
                    Descripció
                    <textarea id="nova-sala-descripcio" placeholder="Descripció breu de la sala"></textarea>
                </label>
            </div>

            <button class="modal-close-btn" id="nova-sala-guardar">Crear sala</button>
        </div>
    `;

    document.body.appendChild(overlay);

    const close = () => overlay.remove();
    overlay.querySelector('.modal-close-icon').onclick = close;
    overlay.onclick = e => { if (e.target === overlay) close(); };

    // Acció guardar
    overlay.querySelector('#nova-sala-guardar').onclick = async function() {
        const nom = document.getElementById('nova-sala-nom').value.trim();
        const ubicacio = document.getElementById('nova-sala-ubicacio').value;
        const descripcio = document.getElementById('nova-sala-descripcio').value.trim();

        if (!nom) {
            alert('El nom és obligatori.');
            return;
        }

        const novaSala = {
            nom: nom,
            ubicacio: ubicacio,
            descripcio: descripcio
        };

        try {
            const res = await fetch(`${API_BASE}/sala/salas`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(novaSala)
            });

            if (res.ok) {
                close();
                loadRoomsTable();
                loadDashboardStats();
            } else {
                const errorText = await res.text();
                console.error('Error backend:', res.status, errorText);
                alert('Error ' + res.status + ': ' + errorText);
            }
        } catch (error) {
            console.error('Error creant sala:', error);
            alert('Error de connexió: ' + error.message);
        }
    };
}



// ---------- MODAL CONFIRMAR ESBORRAR SALA ----------
function confirmarEsborrarSala(sala) {
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';

    overlay.innerHTML = `
        <div class="modal-card modal-card-small">
            <button class="modal-close-icon" aria-label="Tancar">✕</button>

            <div class="modal-icon-warning">
                <i class="fas fa-exclamation-triangle"></i>
            </div>

            <div class="modal-title modal-title-center">Esborrar sala</div>

            <p class="modal-text">
                Segur que vols esborrar la sala <strong>${sala.nom}</strong>?<br>
                Aquesta acció no es pot desfer.
            </p>

            <div class="modal-actions">
                <button class="modal-btn-secondary" id="cancel-esborrar">Cancel·lar</button>
                <button class="modal-btn-danger" id="confirm-esborrar">Sí, esborrar</button>
            </div>
        </div>
    `;

    document.body.appendChild(overlay);

    const close = () => overlay.remove();
    overlay.querySelector('.modal-close-icon').onclick = close;
    overlay.querySelector('#cancel-esborrar').onclick = close;
    overlay.onclick = e => { if (e.target === overlay) close(); };

    overlay.querySelector('#confirm-esborrar').onclick = async function() {
        try {
            const res = await fetch(`${API_BASE}/sala/salas/${sala.id_sala}`, {
                method: 'DELETE'
            });

            if (res.ok) {
                close();
                loadRoomsTable();
                loadDashboardStats();
            } else {
                const errorText = await res.text();
                console.error('Error backend:', res.status, errorText);
                alert('Error ' + res.status + ': ' + errorText);
            }
        } catch (error) {
            console.error('Error esborrant sala:', error);
            alert('Error de connexió: ' + error.message);
        }
    };
}


// ---------- MODAL CONFIRMAR ESBORRAR ACTIVITAT ----------
function confirmarEsborrarActivitat(act) {
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';

    overlay.innerHTML = `
        <div class="modal-card modal-card-small">
            <button class="modal-close-icon" aria-label="Tancar">✕</button>

            <div class="modal-icon-warning">
                <i class="fas fa-exclamation-triangle"></i>
            </div>

            <div class="modal-title modal-title-center">Esborrar activitat</div>

            <p class="modal-text">
                Segur que vols esborrar l'activitat <strong>${act.titol}</strong>?<br>
                Aquesta acció no es pot desfer.
            </p>

            <div class="modal-actions">
                <button class="modal-btn-secondary" id="cancel-esborrar-act">Cancel·lar</button>
                <button class="modal-btn-danger" id="confirm-esborrar-act">Sí, esborrar</button>
            </div>
        </div>
    `;

    document.body.appendChild(overlay);

    const close = () => overlay.remove();
    overlay.querySelector('.modal-close-icon').onclick = close;
    overlay.querySelector('#cancel-esborrar-act').onclick = close;
    overlay.onclick = e => { if (e.target === overlay) close(); };

    overlay.querySelector('#confirm-esborrar-act').onclick = async function() {
        try {
            const res = await fetch(`${API_BASE}/activitats/activitat/${act.id_activitat}`, {
                method: 'DELETE'
            });

            if (res.ok) {
                close();
                loadActivitiesTable();
                loadDashboardStats();
                loadRecentActivity();
            } else {
                const errorText = await res.text();
                console.error('Error backend:', res.status, errorText);
                alert('Error ' + res.status + ': ' + errorText);
            }
        } catch (error) {
            console.error('Error esborrant activitat:', error);
            alert('Error de connexió: ' + error.message);
        }
    };
}



// ---------- BOTÓ NOU USUARI ----------
document.getElementById('btn-nou-usuari').addEventListener('click', function() {
    showNouUsuariModal();
});

// ---------- MODAL NOU USUARI ----------
function showNouUsuariModal() {
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';

    overlay.innerHTML = `
        <div class="modal-card">
            <button class="modal-close-icon" aria-label="Tancar">✕</button>
            <div class="modal-title">Nou Usuari</div>

            <div class="modal-form">
                <label>
                    Nom
                    <input type="text" id="nou-user-nom" placeholder="Ex: Joan Pérez" required>
                </label>

                <label>
                    Email
                    <input type="text" id="nou-user-email" placeholder="exemple@iticbcn.cat" required>
                </label>
            </div>

            <button class="modal-close-btn" id="nou-user-guardar">Crear usuari</button>
        </div>
    `;

    document.body.appendChild(overlay);

    const close = () => overlay.remove();
    overlay.querySelector('.modal-close-icon').onclick = close;
    overlay.onclick = e => { if (e.target === overlay) close(); };

    overlay.querySelector('#nou-user-guardar').onclick = async function() {
        const nom = document.getElementById('nou-user-nom').value.trim();
        const email = document.getElementById('nou-user-email').value.trim();

        if (!nom) { alert('El nom és obligatori.'); return; }
        if (!email) { alert('L\'email és obligatori.'); return; }
        if (!email.includes('@')) { alert('L\'email no és vàlid.'); return; }

        const nouUsuari = {
            nom: nom,
            email: email,
            provider: 'manual',
            providerId: null,
            fotoPerfil: null
        };

        try {
            const res = await fetch(`${API_BASE}/usuaris/usuaris`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(nouUsuari)
            });

            if (res.ok) {
                close();
                loadUsersTable();
                loadDashboardStats();
            } else {
                const errorText = await res.text();
                console.error('Error backend:', res.status, errorText);
                alert('Error ' + res.status + ': ' + errorText);
            }
        } catch (error) {
            console.error('Error creant usuari:', error);
            alert('Error de connexió: ' + error.message);
        }
    };
}

// ---------- MODAL EDITAR USUARI ----------
function editarUsuari(usuari) {
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';

    overlay.innerHTML = `
        <div class="modal-card">
            <button class="modal-close-icon" aria-label="Tancar">✕</button>
            <div class="modal-title">Editar Usuari</div>

            <div class="modal-form">
                <label>
                    Nom
                    <input type="text" id="edit-user-nom" value="${usuari.nom || ''}" required>
                </label>

                <label>
                    Email
                    <input type="text" id="edit-user-email" value="${usuari.email || ''}" required>
                </label>
            </div>

            <button class="modal-close-btn" id="edit-user-guardar">Guardar canvis</button>
        </div>
    `;

    document.body.appendChild(overlay);

    const close = () => overlay.remove();
    overlay.querySelector('.modal-close-icon').onclick = close;
    overlay.onclick = e => { if (e.target === overlay) close(); };

    overlay.querySelector('#edit-user-guardar').onclick = async function() {
        const nom = document.getElementById('edit-user-nom').value.trim();
        const email = document.getElementById('edit-user-email').value.trim();

        if (!nom) { alert('El nom és obligatori.'); return; }
        if (!email) { alert('L\'email és obligatori.'); return; }
        if (!email.includes('@')) { alert('L\'email no és vàlid.'); return; }

        const usuariActualitzat = {
            nom: nom,
            email: email
            // provider, providerId i fotoPerfil els deixem null perquè
            // l'API mantingui els valors existents
        };

        try {
            const res = await fetch(`${API_BASE}/usuaris/usuaris/${usuari.id_usuari}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(usuariActualitzat)
            });

            if (res.ok) {
                close();
                loadUsersTable();
            } else {
                const errorText = await res.text();
                console.error('Error backend:', res.status, errorText);
                alert('Error ' + res.status + ': ' + errorText);
            }
        } catch (error) {
            console.error('Error editant usuari:', error);
            alert('Error de connexió: ' + error.message);
        }
    };
}

// ---------- MODAL CONFIRMAR ESBORRAR USUARI ----------
function confirmarEsborrarUsuari(usuari) {
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';

    overlay.innerHTML = `
        <div class="modal-card modal-card-small">
            <button class="modal-close-icon" aria-label="Tancar">✕</button>

            <div class="modal-icon-warning">
                <i class="fas fa-exclamation-triangle"></i>
            </div>

            <div class="modal-title modal-title-center">Esborrar usuari</div>

            <p class="modal-text">
                Segur que vols esborrar l'usuari <strong>${usuari.nom || usuari.email}</strong>?<br>
                Aquesta acció no es pot desfer.
            </p>

            <div class="modal-actions">
                <button class="modal-btn-secondary" id="cancel-esborrar-user">Cancel·lar</button>
                <button class="modal-btn-danger" id="confirm-esborrar-user">Sí, esborrar</button>
            </div>
        </div>
    `;

    document.body.appendChild(overlay);

    const close = () => overlay.remove();
    overlay.querySelector('.modal-close-icon').onclick = close;
    overlay.querySelector('#cancel-esborrar-user').onclick = close;
    overlay.onclick = e => { if (e.target === overlay) close(); };

    overlay.querySelector('#confirm-esborrar-user').onclick = async function() {
        try {
            const res = await fetch(`${API_BASE}/usuaris/usuaris/${usuari.id_usuari}`, {
                method: 'DELETE'
            });

            if (res.ok) {
                close();
                loadUsersTable();
                loadDashboardStats();
            } else {
                const errorText = await res.text();
                console.error('Error backend:', res.status, errorText);
                alert('Error ' + res.status + ': ' + errorText);
            }
        } catch (error) {
            console.error('Error esborrant usuari:', error);
            alert('Error de connexió: ' + error.message);
        }
    };
}