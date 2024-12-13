// Sélection des éléments HTML
var balls = document.querySelectorAll('.ball');
var modal = document.getElementById('scratch-modal');
var canvas = document.getElementById('scratch-canvas');
var closeModalButton = document.getElementById('close-modal');

var ctx, isScratching = false, lastPoint;

// Charger les états de grattage depuis localStorage
var scratchStates = JSON.parse(localStorage.getItem('scratchStates')) || Array.from({ length: 25 }, () => null);

// Fonction pour empêcher le défilement de la page
function preventScroll(e) {
    e.preventDefault();
}

// Fonction pour sauvegarder les états dans localStorage
function saveScratchStates() {
    localStorage.setItem('scratchStates', JSON.stringify(scratchStates));
}

// Fonction pour ouvrir le modal de la boule active
function openBall(number) {
    modal.classList.add('active'); // Affiche le modal
    setupScratchCanvas(number);

    // Désactiver le défilement
    document.body.style.overflow = 'hidden'; // Empêche de scroller
    window.addEventListener('touchmove', preventScroll, { passive: false }); // Bloque les gestes tactiles
}

// Fonction pour configurer le canvas
function setupScratchCanvas(number) {
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    ctx = canvas.getContext('2d');

    // Définir une image comme fond du canvas
    var imagePath = `images/${number}.png`; // Chemin des images
    canvas.style.backgroundImage = `url('${imagePath}')`;
    canvas.style.backgroundSize = "90%"; // Taille des images (1.5x plus petite)
    canvas.style.backgroundPosition = "center"; // Centrer l'image
    canvas.style.backgroundRepeat = "no-repeat"; // Pas de répétition

    // Restaurer l’état précédent s’il existe
    if (scratchStates[number - 1]) {
        var imageData = new Image();
        imageData.src = scratchStates[number - 1];
        imageData.onload = function () {
            ctx.drawImage(imageData, 0, 0, canvas.width, canvas.height);
        };
    } else {
        // Sinon, créer une nouvelle couche à gratter (rouge)
        ctx.globalCompositeOperation = 'source-over';
        ctx.fillStyle = 'red'; // Couleur rouge
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    // Gérer les événements de grattage
    canvas.addEventListener('mousedown', startScratching);
    canvas.addEventListener('mousemove', scratch);
    canvas.addEventListener('mouseup', stopScratching);
    canvas.addEventListener('touchstart', startScratching, { passive: false });
    canvas.addEventListener('touchmove', scratch, { passive: false });
    canvas.addEventListener('touchend', stopScratching);
}

// Début du grattage
function startScratching(e) {
    isScratching = true;
    lastPoint = getMousePosition(e);
}

// Grattage en cours
function scratch(e) {
    if (!isScratching) return;

    var point = getMousePosition(e);

    ctx.globalCompositeOperation = 'destination-out';
    ctx.beginPath();
    ctx.arc(point.x, point.y, 20, 0, Math.PI * 2, false);
    ctx.fill();

    ctx.beginPath();
    ctx.lineWidth = 40;
    ctx.moveTo(lastPoint.x, lastPoint.y);
    ctx.lineTo(point.x, point.y);
    ctx.stroke();

    lastPoint = point;
}

// Fin du grattage
function stopScratching() {
    isScratching = false;
}

// Obtenir la position de la souris ou du toucher
function getMousePosition(e) {
    var rect = canvas.getBoundingClientRect();
    var clientX = e.touches ? e.touches[0].clientX : e.clientX;
    var clientY = e.touches ? e.touches[0].clientY : e.clientY;

    return {
        x: clientX - rect.left,
        y: clientY - rect.top,
    };
}

// Fermer le modal
closeModalButton.addEventListener('click', function () {
    modal.classList.remove('active'); // Cache le modal

    // Sauvegarder l’état actuel du canvas
    var currentIndex = parseInt(modal.dataset.number) - 1;

    // Convertir l'état actuel du canvas en DataURL et enregistrer
    scratchStates[currentIndex] = canvas.toDataURL(); // Sauvegarde en base64
    saveScratchStates(); // Enregistre dans localStorage

    // Réactiver le défilement
    document.body.style.overflow = '';
    window.removeEventListener('touchmove', preventScroll, { passive: false });

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    canvas.style.backgroundImage = ''; // Réinitialise l'image de fond
});

// Attacher les événements aux boules
balls.forEach(function (ball, index) {
    ball.addEventListener('click', function () {
        modal.dataset.number = index + 1; // Sauvegarde du numéro dans le modal
        openBall(index + 1);
    });
});
