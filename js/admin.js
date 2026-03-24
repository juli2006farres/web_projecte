document.addEventListener('DOMContentLoaded', async () => {

    const autorizado = await auth.isAuthorized();

    if (!autorizado) {
        window.location.href = "login.html";
        return;
    }

    const btns = document.querySelectorAll('.admin-btn:not(.btn-sortir)');
    const panels = document.querySelectorAll('.view-panel');

    // Funció per canviar la pestanya activa al panell d'admin
    btns.forEach(btn => {
        btn.addEventListener('click', () => {
            // 1. Treure classe activa a tots els botons
            btns.forEach(b => b.classList.remove('active'));

            // 2. Posar classe activa al botó clicat
            btn.classList.add('active');

            // 3. Amagar totes les vistes
            panels.forEach(panel => panel.classList.remove('active'));

            // 4. Mostrar la vista corresponent segons l'IDs
            const viewId = 'view-' + btn.id.replace('btn-', '');
            const activeView = document.getElementById(viewId);
            if (activeView) {
                activeView.classList.add('active');
            }
        });
    });

});
