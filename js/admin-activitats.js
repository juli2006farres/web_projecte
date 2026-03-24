/**
 * admin-activitats.js
 * Gestió dels panells d'acció (Afegir / Editar / Borrar)
 * La lògica de l'API s'afegirà aquí quan estigui llesta.
 */

document.addEventListener('DOMContentLoaded', function () {

    // ---- Canvi de panell actiu ----
    const botons  = document.querySelectorAll('.btn-accio');
    const panells = document.querySelectorAll('.accio-panel');

    botons.forEach(function (btn) {
        btn.addEventListener('click', function () {
            // Botons: treure active del que ho tenia i afegir-lo al clicat
            botons.forEach(function (b) { b.classList.remove('active-btn'); });
            btn.classList.add('active-btn');

            // Panells: amagar tots i mostrar el corresponent
            const panelId = btn.getAttribute('data-panel');
            panells.forEach(function (p) { p.classList.remove('active-panel'); });
            document.getElementById(panelId).classList.add('active-panel');
        });
    });

    // TODO: fetchActivitats() — carregar les activitats de l'API
    // TODO: form-afegir submit  → POST /activitats
    // TODO: form-editar submit  → PUT  /activitats/:id
    // TODO: btn-confirmar-borrar → DELETE /activitats/:id

});