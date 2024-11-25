const ctx = pintura.getContext('2d');

// Lista de objetos con imágenes
let objetos = [
    { x: 50, y: 0, width: 60, height: 60, velocidad: 1.7, dispara: true, imagen: './imcon/ene1.png'},
    { x: 100, y: 30, width: 60, height: 60, velocidad: 1.4, dispara: true, imagen: './imcon/ene1.png'},
    { x: 20, y: 0, width: 60, height: 60, velocidad: 1.5, dispara: true, imagen: './imcon/ennn4.png'},
    { x: 200, y: 60, width: 60, height: 60, velocidad: 2, dispara: true, imagen: './imcon/ennn4.png'},
    { x: 160, y: 60, width: 60, height: 60, velocidad: 1.8, dispara: true, imagen: './imcon/en5.png'},
    { x: 360, y: 10, width: 60, height: 60, velocidad: 2.3, dispara: true, imagen: './imcon/en5.png'},
    { x: 300, y: 20, width: 60, height: 60, velocidad: 1.3, dispara: true, imagen: './imcon/ene1.png'},
    
];

let proyectiles = [];
const minRad = 10;
const rangeRad = 20;
let p = 0;
let x = 0, y = 0;
let mouseRadioCrece = true;
let finJuego = false;
let puntaje = 0; // Puntaje del jugador

// Imagen del jugador
let jugadorImg = new Image();
jugadorImg.src = './imcon/11.png'; // Cambia la ruta según tu imagen

jugadorImg.onerror = () => {
    console.error('No se pudo cargar la imagen del jugador.');
};

// Imagen del proyectil
let proyectilImg = new Image();
proyectilImg.src = './imcon/proyec.png'; // Cambia la ruta según tu imagen

proyectilImg.onerror = () => {
    console.error('No se pudo cargar la imagen del proyectil.');
};

// Función para calcular colisiones
colision = (objeto1, objeto2) => {
    const distancia = Math.sqrt((objeto2.x - objeto1.x) ** 2 + (objeto2.y - objeto1.y) ** 2);
    return distancia <= (objeto1.width / 2 + objeto2.width / 2);
};

// Función para generar proyectiles
function lanzarProyectil(origen) {
    proyectiles.push({
        x: origen.x + origen.width / 2,
        y: origen.y + origen.height,
        width: 5,
        color: '#FF0000',
        velocidad: 20,
        dx: 0, // Movimiento solo en el eje Y
        dy: 1 // Dirección hacia abajo
    });
}

// Función para mostrar el puntaje
function mostrarPuntaje() {
    ctx.fillStyle = '#FFFFFF'; // Blanco
    ctx.font = '16px Arial';
    ctx.fillText(`Puntaje: ${puntaje}`, 10, 20);
}


// Función para finalizar el juego
function terminarJuego(mensaje) {
    alert(mensaje);
    finJuego = true;
}

// Cargar las imágenes antes de iniciar la animación
function cargarImagenes(callback) {
    let pendientes = objetos.length;

    objetos.forEach(objeto => {
        const img = new Image();
        img.src = objeto.imagen;
        img.onload = () => {
            objeto.imgElement = img; // Guardar referencia de la imagen cargada
            pendientes--;
            if (pendientes === 0) callback(); // Iniciar animación cuando todas las imágenes estén cargadas
        };
        img.onerror = () => {
            console.error(`No se pudo cargar la imagen: ${objeto.imagen}`);
            pendientes--;
            if (pendientes === 0) callback(); // Continuar incluso si falla alguna imagen
        };
    });
}
// Función para disparos automáticos
function iniciarDisparos() {
    setInterval(() => {
        objetos.forEach(objeto => {
            if (objeto.dispara) {
                lanzarProyectil(objeto);
            }
        });
    }, 200); // Disparan 
}

// Animación principal
function animate() {
    if (mouseRadioCrece) {
        p += 0.01;
        if (p > 1) mouseRadioCrece = false;
    } else {
        p -= 0.01;
        if (p < 0.1) mouseRadioCrece = true;
    }
    const rad = minRad + rangeRad * p;

    // Limpiar canvas
    ctx.clearRect(0, 0, pintura.width, pintura.height);

    // Dibujar puntaje
    mostrarPuntaje();

    // Dibujar enemigos y gestionar su movimiento
    objetos.forEach(objeto => {
        // Dibujar la imagen del objeto si está cargada
        if (objeto.imgElement) {
            ctx.drawImage(objeto.imgElement, objeto.x, objeto.y, objeto.width, objeto.height);
        }

        // Dibujar el nombre del enemigo
        //ctx.font = "10px Arial";
        //ctx.fillStyle = '#000';
        //const a = ctx.measureText(objeto.nombre);
        //ctx.fillText(objeto.nombre, objeto.x + objeto.width / 2 - a.width / 2, objeto.y + objeto.height + 10);

        // Colisión con jugador
        if (colision({x, y, width: rad}, {x: objeto.x + objeto.width / 2, y: objeto.y + objeto.height / 2, width: objeto.width})) {
            terminarJuego('¡Colisión con un enemigo! GAME OVER');
        }

        // Mover el objeto
        objeto.y += objeto.velocidad;
        if (objeto.y > pintura.height) {
            objeto.y = 0;
            objeto.velocidad *= 1.1; // Incrementar dificultad
            objeto.x = Math.random() * (pintura.width - objeto.width);

            // Incrementar puntaje cuando el jugador esquiva
            puntaje += 10;
        }
    });

    // Dibujar y mover proyectiles
    proyectiles.forEach((proyectil, index) => {
        proyectil.x += proyectil.dx * proyectil.velocidad;
        proyectil.y += proyectil.dy * proyectil.velocidad;

        // Dibujar el proyectil como imagen si está cargada
        if (proyectilImg.complete) {
            ctx.drawImage(proyectilImg, proyectil.x - proyectil.width / 2, proyectil.y - proyectil.width / 2, 20, 20);
        } else {
            // Dibujar como círculo si la imagen falla
            ctx.beginPath();
            ctx.arc(proyectil.x, proyectil.y, proyectil.width, 0, Math.PI * 2);
            ctx.fillStyle = proyectil.color;
            ctx.fill();
            ctx.stroke();
        }

        // Colisión con jugador
        if (colision({x, y, width: rad}, proyectil)) {
            terminarJuego('¡Impactado por un proyectil! GAME OVER');
        }

        // Eliminar proyectil si sale de los límites
        if (proyectil.x < 0 || proyectil.x > pintura.width || proyectil.y < 0 || proyectil.y > pintura.height) {
            proyectiles.splice(index, 1);
        }
    });

    // Dibujar el jugador como imagen
    if (jugadorImg.complete) {
        ctx.drawImage(jugadorImg, x - rad, y - rad, rad * 2, rad * 2);
    } else {
        // Dibujar como círculo si la imagen falla
        ctx.beginPath();
        ctx.arc(x, y, rad, 0, Math.PI * 2);
        ctx.fillStyle = '#1288AA';
        ctx.fill();
        ctx.stroke();
    }

    // Dibujar borde
    ctx.beginPath();
    ctx.rect(1, 1, pintura.width - 1, pintura.height - 1);
    ctx.stroke();

    // Continuar la animación
    if (!finJuego) requestAnimationFrame(animate);
}

// Iniciar animación después de cargar imágenes
cargarImagenes(() => {
    iniciarDisparos();
    animate();
});

// Mover jugador con el mouse
pintura.addEventListener('mousemove', (info) => {
    x = info.offsetX;
    y = info.offsetY;
});
