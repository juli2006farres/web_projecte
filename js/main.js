const btnAteca = document.getElementById('btn-ateca');
const btnAgora = document.getElementById('btn-agora');
const viewAteca = document.getElementById('view-ateca');
const viewAgora = document.getElementById('view-agora');
const viewHome = document.getElementById('view-home'); // Pàgina principal

// Funció per tornar a l'estat inicial (cap botó actiu)
function goHome() {
    btnAteca.classList.remove('active');
    btnAgora.classList.remove('active');
    viewAteca.classList.remove('active');
    viewAgora.classList.remove('active');
    viewHome.classList.add('active');
}

// ATECA: si ja és actiu → inici. Si no → activa'l
btnAteca.addEventListener('click', () => {
    if (btnAteca.classList.contains('active')) {
        goHome();
    } else {
        btnAteca.classList.add('active');
        btnAgora.classList.remove('active');
        viewAteca.classList.add('active');
        viewAgora.classList.remove('active');
        viewHome.classList.remove('active');
    }
});

// AGORA: si ja és actiu → inici. Si no → activa'l
btnAgora.addEventListener('click', () => {
    if (btnAgora.classList.contains('active')) {
        goHome();
    } else {
        btnAgora.classList.add('active');
        btnAteca.classList.remove('active');
        viewAgora.classList.add('active');
        viewAteca.classList.remove('active');
        viewHome.classList.remove('active');
    }
});