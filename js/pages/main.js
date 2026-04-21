(function(){
    "use strict";

    // Configuración
    const API = {
        SALAS: 'https://34.230.76.192/api/sala/salas',
        ACTIVITATS: 'https://34.230.76.192/api/activitats/activitats'
    };

    // DOM elements
    const dom = {
        sidebar: document.getElementById('sidebar-menu'),
        dynamicViews: document.getElementById('dynamic-views'),
        viewHome: document.getElementById('view-home'),
        headerTitle: document.getElementById('header-title'),
        roomBadge: document.getElementById('active-room-badge'),
        time: document.getElementById('current-time')
    };

    // Estado
    let activeBtn = null, activeView = null;
    const calendars = new Map();
    const activitiesByRoom = new Map();
    const roomColors = new Map();

    // ---------- MODAL ----------
    function showModal(event) {
        const overlay = document.createElement('div');
        overlay.className = 'modal-overlay';
        
        const start = event.start, end = event.end;
        const dateStr = start.toLocaleDateString('ca-ES', { weekday:'long', day:'numeric', month:'long', year:'numeric' });
        const timeStr = start.toLocaleTimeString('ca-ES', { hour:'2-digit', minute:'2-digit' }) 
                      + (end ? ' – ' + end.toLocaleTimeString('ca-ES', { hour:'2-digit', minute:'2-digit' }) : '');
        
        overlay.innerHTML = `
            <div class="modal-card">
                <button class="modal-close-icon" aria-label="Tancar">✕</button>
                <div class="modal-title">${event.title || 'Activitat sense títol'}</div>
                <div class="modal-datetime">
                    <div><span style="font-weight:600;">📅</span> ${dateStr}</div>
                    <div><span style="font-weight:600;">⏰</span> ${timeStr}</div>
                </div>
                <div class="modal-description">${event.extendedProps?.description || 'Sense descripció'}</div>
                <button class="modal-close-btn">Entesos</button>
            </div>
        `;
        
        document.body.appendChild(overlay);
        
        const close = () => overlay.remove();
        overlay.querySelector('.modal-close-icon').onclick = close;
        overlay.querySelector('.modal-close-btn').onclick = close;
        overlay.onclick = e => { if (e.target === overlay) close(); };
    }

    // ---------- RELOJ ----------
    function updateClock() {
        const now = new Date();
        dom.time.textContent = now.toLocaleString('ca-ES', {
            day:'2-digit', month:'2-digit', year:'numeric',
            hour:'2-digit', minute:'2-digit', second:'2-digit', hour12:false
        }).replace(/\//g, '/');
    }
    updateClock();
    setInterval(updateClock, 1000);

    // ---------- NAVEGACIÓN ----------
    window.goHome = function() {
        if (activeBtn) activeBtn.classList.remove('active');
        if (activeView) activeView.classList.remove('active');
        activeBtn = activeView = null;
        dom.viewHome.classList.add('active');
        dom.headerTitle.textContent = 'AgendaTIC';
        dom.roomBadge.textContent = 'Selecciona una sala';
    };

    // ---------- CALENDARIO ----------
    function formatEvent(act, color) {
        return {
            id: `api-${act.id_activitat}`,
            title: act.titol,
            start: `${act.data}T${act.horaInici}`,
            end: `${act.data}T${act.horaFi}`,
            extendedProps: { description: act.descripcio || '' },
            color: color || '#3b82f6'
        };
    }

    function updateCalendarEvents(roomId, calendar) {
        const events = [
            ...(activitiesByRoom.get(roomId) || []),
            ...(JSON.parse(localStorage.getItem(`calendarEvents_sala_${roomId}`)) || [])
        ];
        calendar.removeAllEvents();
        events.forEach(e => calendar.addEvent(e));
    }

    async function loadActivities() {
        try {
            const res = await fetch(API.ACTIVITATS);
            const acts = await res.json();
            activitiesByRoom.clear();
            
            acts.filter(a => a.activa).forEach(act => {
                const roomId = String(act.id_sala);
                if (!activitiesByRoom.has(roomId)) activitiesByRoom.set(roomId, []);
                activitiesByRoom.get(roomId).push(formatEvent(act, roomColors.get(roomId)));
            });
            
            calendars.forEach((cal, roomId) => updateCalendarEvents(roomId, cal));
        } catch (e) {
            console.error('Error activitats:', e);
        }
    }

    function createRoomPanel(room) {
        const roomId = String(room.id_sala);
        const panel = document.createElement('div');
        panel.id = `view-sala-${roomId}`;
        panel.className = 'view-panel';
        
        panel.innerHTML = `
            <div class="calendar-panel" style="height:100%">
                <div class="calendar-header">
                    <h2>${room.nom}</h2>
                    <div class="view-toggles">
                        <button class="view-btn active-view" data-view="dayGridMonth">Mes</button>
                        <button class="view-btn" data-view="timeGridWeek">Setmana</button>
                        <button class="view-btn" data-view="timeGridDay">Dia</button>
                    </div>
                </div>
                <div id="calendar-sala-${roomId}" style="flex:1; min-height:0"></div>
            </div>
        `;
        dom.dynamicViews.appendChild(panel);
        
        const calendarEl = panel.querySelector(`#calendar-sala-${roomId}`);
        const calendar = new FullCalendar.Calendar(calendarEl, {
            initialView: 'dayGridMonth',
            locale: 'ca',
            firstDay: 1,
            height: '100%',
            headerToolbar: { left: 'prev,next today', center: 'title', right: '' },
            buttonText: { today: 'Avui' },
            eventClick: info => showModal(info.event)
        });
        calendar.render();
        calendars.set(roomId, calendar);
        
        // Cambiar vista
        panel.querySelectorAll('.view-btn').forEach(btn => {
            btn.onclick = () => {
                calendar.changeView(btn.dataset.view);
                panel.querySelectorAll('.view-btn').forEach(b => b.classList.remove('active-view'));
                btn.classList.add('active-view');
            };
        });
        
        if (activitiesByRoom.size) updateCalendarEvents(roomId, calendar);
        return panel;
    }

    function createRoomButton(room) {
        const btn = document.createElement('button');
        btn.className = 'sala-btn';
        btn.textContent = room.nom;
        btn.dataset.id = room.id_sala;
        btn.style.backgroundColor = room.colorHex || '#3b82f6';
        btn.style.color = '#fff';
        btn.style.border = 'none';
        btn.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
        btn.style.transition = 'all 0.2s ease'; // Añadir transición
        
        const panel = createRoomPanel(room);
        
        btn.onclick = () => {
            if (btn.classList.contains('active')) return goHome();
            
            if (activeBtn) activeBtn.classList.remove('active');
            if (activeView) activeView.classList.remove('active');
            
            btn.classList.add('active');
            panel.classList.add('active');
            dom.viewHome.classList.remove('active');
            
            activeBtn = btn;
            activeView = panel;
            dom.headerTitle.textContent = room.nom;
            dom.roomBadge.textContent = room.nom;
            
            const cal = calendars.get(String(room.id_sala));
            if (cal) setTimeout(() => cal.updateSize(), 50);
        };
        
        return btn;
    }

    async function loadRooms() {
        try {
            const res = await fetch(API.SALAS);
            const rooms = await res.json();
            
            document.getElementById('loading-sales')?.remove();
            if (!rooms?.length) {
                dom.sidebar.innerHTML = '<div style="padding:20px;text-align:center">No hi ha sales</div>';
                return;
            }
            
            rooms.forEach(r => { if (r.colorHex) roomColors.set(String(r.id_sala), r.colorHex); });
            rooms.sort((a,b) => a.nom.localeCompare(b.nom));
            rooms.forEach(r => dom.sidebar.appendChild(createRoomButton(r)));
            
            await loadActivities();
            calendars.forEach((cal, roomId) => updateCalendarEvents(roomId, cal));
        } catch (e) {
            console.error('Error sales:', e);
            const loading = document.getElementById('loading-sales');
            if (loading) loading.innerHTML = `Error: ${e.message}`;
        }
    }

    // Inicio
    document.addEventListener('DOMContentLoaded', () => {
        const savedColor = localStorage.getItem('pref_color');
        if (savedColor) document.documentElement.style.setProperty('--color-primary', savedColor);
        const savedName = localStorage.getItem('pref_nom');
        if (savedName) dom.headerTitle.textContent = savedName;
        loadRooms();
    });
})();