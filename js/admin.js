document.addEventListener('DOMContentLoaded', async () => {
    console.log("Admin page loading, waiting for auth...");
    // Esperar a que la autenticación (callback) termine
    await auth.waitReady();

    const autorizado = await auth.isAuthorized();
    console.log("Admin authorized:", autorizado);

    if (!autorizado) {
        console.warn("No autorizado, redirigiendo a login...");
        window.location.href = "login.html";
        return;
    }


    document.body.style.display = 'block';

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
