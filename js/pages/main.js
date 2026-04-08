// ----- Configuració de l'API -----
const API_SALAS_URL = 'https://54.146.198.94/api/sala/salas';

// Elements del DOM
const sidebar = document.getElementById('sidebar-menu');
const contentSection = document.querySelector('.content');
const loadingDiv = document.getElementById('loading-sales');
const viewHome = document.getElementById('view-home');

// Estat global
let currentActiveButton = null;
let currentActiveView = null;
const calendars = new Map(); // Guardar instàncies de calendaris per id de sala

// Funció per tornar a la vista inicial (home)
function goHome() {
    if (currentActiveButton) {
        currentActiveButton.classList.remove('active');
        currentActiveButton = null;
    }
    if (currentActiveView) {
        currentActiveView.classList.remove('active');
        currentActiveView = null;
    }
    viewHome.classList.add('active');
}

// Funció per obtenir la clau de localStorage per a una sala
function getStorageKey(salaId) {
    return `calendarEvents_sala_${salaId}`;
}

// Funció per crear un calendari dins d'un contenidor
function createCalendar(container, salaId) {
    const storageKey = getStorageKey(salaId);
    const savedEvents = JSON.parse(localStorage.getItem(storageKey)) || [];

    const calendar = new FullCalendar.Calendar(container, {
        initialView: 'dayGridMonth',
        locale: 'ca',
        firstDay: 1,
        height: '100%',
        headerToolbar: {
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,listWeek'
        },
        buttonText: {
            today: 'Avui',
            month: 'Mes',
            week: 'Setmana',
            list: 'Llista'
        },
        events: savedEvents,
        eventClick: function(info) {
            const event = info.event;
            const desc = event.extendedProps.description || 'Sense descripció';
            const time = event.extendedProps.time || 'Sense hora especificada';
            alert(`Activitat: ${event.title}\nHora: ${time}\nDescripció: ${desc}`);
        }
    });

    calendar.render();
    
    // Guardar referència
    calendars.set(salaId, calendar);
    
    // Exposar mètode per actualitzar esdeveniments (útil més endavant)
    calendar.updateEvents = (newEvents) => {
        calendar.removeAllEvents();
        newEvents.forEach(ev => calendar.addEvent(ev));
        localStorage.setItem(storageKey, JSON.stringify(newEvents));
    };

    return calendar;
}

// Funció per crear un botó de sala i el seu panell amb calendari
function createSalaButton(sala) {
    // Crear botó
    const button = document.createElement('button');
    button.className = 'sala-btn';
    button.textContent = sala.nom;
    button.dataset.id = sala.id;
    button.dataset.nom = sala.nom;
    
    // Crear vista panell per a aquesta sala
    const viewPanel = document.createElement('div');
    viewPanel.id = `view-sala-${sala.id}`;
    viewPanel.className = 'view-panel';
    
    // Contenidor del calendari amb estil
    const calendarWrapper = document.createElement('div');
    calendarWrapper.className = 'calendar-wrapper';
    const calendarEl = document.createElement('div');
    calendarEl.id = `calendar-sala-${sala.id}`;
    calendarEl.style.width = '100%';
    calendarEl.style.height = '100%';
    calendarWrapper.appendChild(calendarEl);
    viewPanel.appendChild(calendarWrapper);
    
    contentSection.appendChild(viewPanel);

    // Crear el calendari quan el panell es mostri per primer cop? 
    // Millor crear-lo immediatament per evitar retard, però podem fer-ho lazy.
    // El crearem ara mateix perquè FullCalendar s'inicialitzi correctament.
    // Esperem que el DOM estigui llest (el panell ja està afegit).
    setTimeout(() => {
        createCalendar(calendarEl, sala.id);
    }, 10);

    // Esdeveniment clic: toggle (si actiu -> home, si no -> activar)
    button.addEventListener('click', () => {
        if (button.classList.contains('active')) {
            goHome();
        } else {
            // Desactivar l'anterior
            if (currentActiveButton) {
                currentActiveButton.classList.remove('active');
            }
            if (currentActiveView) {
                currentActiveView.classList.remove('active');
            }
            // Activar aquest
            button.classList.add('active');
            viewPanel.classList.add('active');
            viewHome.classList.remove('active');
            
            currentActiveButton = button;
            currentActiveView = viewPanel;
            
            // Forçar un resize del calendari perquè es pinti bé (de vegades cal)
            const cal = calendars.get(sala.id);
            if (cal) {
                setTimeout(() => cal.updateSize(), 50);
            }
        }
    });

    return button;
}

// Funció per carregar les sales des de l'API
async function carregarSales() {
    try {
        const resposta = await fetch(API_SALAS_URL);
        if (!resposta.ok) {
            throw new Error(`Error HTTP: ${resposta.status}`);
        }
        const sales = await resposta.json();
        
        // Eliminar missatge de càrrega
        if (loadingDiv) {
            loadingDiv.remove();
        }
        
        if (!sales || sales.length === 0) {
            sidebar.innerHTML = '<div style="padding:20px;text-align:center;width:100%;">No hi ha sales disponibles</div>';
            return;
        }
        
        // Crear botons per a cada sala
        sales.forEach(sala => {
            const button = createSalaButton(sala);
            sidebar.appendChild(button);
        });
        
    } catch (error) {
        console.error('Error carregant sales:', error);
        if (loadingDiv) {
            loadingDiv.innerHTML = `Error carregant les sales<br><small>${error.message}</small>`;
            loadingDiv.style.color = 'red';
        }
    }
}

// Inicialització
document.addEventListener('DOMContentLoaded', () => {
    carregarSales();
});

// Exposar goHome per si es necessita
window.goHome = goHome;

