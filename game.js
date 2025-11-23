const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');

// UI Elements
const scoreEl = document.getElementById('score');
const highScoreEl = document.getElementById('high-score');
const finalScoreEl = document.getElementById('final-score');
const startScreen = document.getElementById('start-screen');
const gameOverScreen = document.getElementById('game-over-screen');
const startBtn = document.getElementById('start-btn');
const restartBtn = document.getElementById('restart-btn');

// Game State
let width, height;
let animationId;
let score = 0;
let highScore = localStorage.getItem('neonNinjaHighScore') || 0;
let gameActive = false;
let frame = 0;

highScoreEl.innerText = highScore;

// Colors (Harmonized)
const colors = {
    blue: '#5c9aff',
    red: '#ff6b6b',
    yellow: '#ffce47',
    green: '#51cf66',
    white: '#ffffff'
};

// Resize
function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
}
window.addEventListener('resize', resize);
resize();

// Mouse Control (Blade)
const mouse = { x: undefined, y: undefined, prevX: undefined, prevY: undefined, down: false };
const blade = [];
const MAX_BLADE_LENGTH = 10;

window.addEventListener('mousemove', e => {
    mouse.prevX = mouse.x;
    mouse.prevY = mouse.y;
    mouse.x = e.clientX;
    mouse.y = e.clientY;

    if (gameActive) {
        blade.push({ x: mouse.x, y: mouse.y });
        if (blade.length > MAX_BLADE_LENGTH) blade.shift();
    }
});
window.addEventListener('mousedown', () => mouse.down = true);
window.addEventListener('mouseup', () => mouse.down = false);

// Entities
let objects = []; // Fruits and Bombs
let particles = [];
let pieces = []; // Sliced pieces

class GameObject {
    constructor(x, y, type) {
        this.x = x;
        this.y = y;
        this.type = type; // 'fruit' or 'bomb'
        this.radius = 45; // Increased size

        // Physics (Throw upwards)
        this.vx = (Math.random() - 0.5) * 4;
        this.vy = -(Math.random() * 5 + 12); // Reduced speed (was 15-21, now 12-17)
        this.gravity = 0.2; // Reduced gravity slightly
        this.rotation = 0;
        this.rotationSpeed = (Math.random() - 0.5) * 0.2;

        // Appearance
        if (type === 'bomb') {
            this.color = colors.red;
            this.symbol = '💣';
            this.radius = 40;
        } else {
            const fruitColors = [colors.blue, colors.green, colors.yellow];
            this.color = fruitColors[Math.floor(Math.random() * fruitColors.length)];
        }

        this.sliced = false;
    }

    draw() {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);

        if (this.type === 'bomb') {
            // Bomb Visual (Spiky Shape)
            ctx.beginPath();
            const spikes = 8;
            const outerRadius = this.radius;
            const innerRadius = this.radius / 2;

            for (let i = 0; i < spikes; i++) {
                let angle = (i * Math.PI * 2) / spikes;
                let x = Math.cos(angle) * outerRadius;
                let y = Math.sin(angle) * outerRadius;
                ctx.lineTo(x, y);

                angle += (Math.PI / spikes);
                x = Math.cos(angle) * innerRadius;
                y = Math.sin(angle) * innerRadius;
                ctx.lineTo(x, y);
            }
            ctx.closePath();

            ctx.fillStyle = '#222';
            ctx.fill();
            ctx.strokeStyle = this.color;
            ctx.lineWidth = 3;
            ctx.stroke();

            // Skull Icon
            ctx.fillStyle = this.color;
            ctx.font = '20px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('☠️', 0, 0);

        } else {
            // Fruit Visual (Neon Circle)
            ctx.beginPath();
            ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
            ctx.fillStyle = this.color;
            ctx.fill();
            ctx.shadowBlur = 25;
            ctx.shadowColor = this.color;

            // Inner glow
            ctx.beginPath();
            ctx.arc(0, 0, this.radius * 0.7, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(255,255,255,0.3)';
            ctx.fill();
        }

        ctx.restore();
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.vy += this.gravity;
        this.rotation += this.rotationSpeed;
        this.draw();
    }
}

class Piece {
    constructor(x, y, radius, color, velocity, angle) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = color;
        this.velocity = velocity;
        this.angle = angle;
        this.rotationSpeed = (Math.random() - 0.5) * 0.4;
        this.alpha = 1;
        this.gravity = 0.3;
    }

    draw() {
        ctx.save();
        ctx.globalAlpha = this.alpha;
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle);

        // Draw Half Circle
        ctx.beginPath();
        ctx.arc(0, 0, this.radius, 0, Math.PI, false);
        ctx.fillStyle = this.color;
        ctx.fill();
        ctx.shadowBlur = 15;
        ctx.shadowColor = this.color;

        ctx.restore();
    }

    update() {
        this.x += this.velocity.x;
        this.y += this.velocity.y;
        this.velocity.y += this.gravity;
        this.angle += this.rotationSpeed;
        this.alpha -= 0.015;
        this.draw();
    }
}

class Particle {
    constructor(x, y, color, speed) {
        this.x = x;
        this.y = y;
        this.color = color;
        this.radius = Math.random() * 3 + 1;
        this.vx = (Math.random() - 0.5) * speed;
        this.vy = (Math.random() - 0.5) * speed;
        this.alpha = 1;
    }

    draw() {
        ctx.save();
        ctx.globalAlpha = this.alpha;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
        ctx.restore();
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.alpha -= 0.02;
        this.draw();
    }
}

// --- Game Functions ---

function spawnObjects() {
    if (frame % 100 === 0) { // Slower spawn rate (was 60)
        // Spawn 1 object, rarely 2
        const count = Math.random() > 0.8 ? 2 : 1;

        for (let i = 0; i < count; i++) {
            const x = Math.random() * (width - 100) + 50;
            const y = height + 50;
            // 20% chance of bomb
            const type = Math.random() < 0.2 ? 'bomb' : 'fruit';
            objects.push(new GameObject(x, y, type));
        }
    }
}

function drawBlade() {
    if (blade.length < 2) return;

    ctx.beginPath();
    ctx.moveTo(blade[0].x, blade[0].y);
    for (let i = 1; i < blade.length; i++) {
        const point = blade[i];
        ctx.lineTo(point.x, point.y);
    }

    // Gradient Blade
    const gradient = ctx.createLinearGradient(blade[0].x, blade[0].y, blade[blade.length - 1].x, blade[blade.length - 1].y);
    gradient.addColorStop(0, 'rgba(255, 255, 255, 0)');
    gradient.addColorStop(1, colors.white);

    ctx.strokeStyle = gradient;
    ctx.lineWidth = 6;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.shadowBlur = 20;
    ctx.shadowColor = colors.blue;
    ctx.stroke();
}

function checkSlicing() {
    if (blade.length < 2) return;

    const p1 = blade[blade.length - 2];
    const p2 = blade[blade.length - 1];

    objects.forEach((obj, index) => {
        if (obj.sliced) return;

        const dist = pointLineDistance(obj.x, obj.y, p1.x, p1.y, p2.x, p2.y);

        if (dist < obj.radius) {
            sliceObject(obj, index);
        }
    });
}

function pointLineDistance(px, py, x1, y1, x2, y2) {
    const A = px - x1;
    const B = py - y1;
    const C = x2 - x1;
    const D = y2 - y1;

    const dot = A * C + B * D;
    const len_sq = C * C + D * D;
    let param = -1;
    if (len_sq != 0) param = dot / len_sq;

    let xx, yy;

    if (param < 0) { xx = x1; yy = y1; }
    else if (param > 1) { xx = x2; yy = y2; }
    else { xx = x1 + param * C; yy = y1 + param * D; }

    const dx = px - xx;
    const dy = py - yy;
    return Math.sqrt(dx * dx + dy * dy);
}

function sliceObject(obj, index) {
    obj.sliced = true;

    // Logic
    if (obj.type === 'bomb') {
        createExplosion(obj.x, obj.y, colors.red, 30);
        endGame();
    } else {
        // Points
        score += 10;
        scoreEl.innerText = score;
        objects.splice(index, 1);

        // Visuals: Split Effect
        createExplosion(obj.x, obj.y, obj.color, 15);

        // Spawn two halves
        const angle = Math.random() * Math.PI * 2;
        const speed = 5;

        pieces.push(new Piece(obj.x, obj.y, obj.radius, obj.color, {
            x: Math.cos(angle) * speed,
            y: Math.sin(angle) * speed
        }, angle));

        pieces.push(new Piece(obj.x, obj.y, obj.radius, obj.color, {
            x: Math.cos(angle + Math.PI) * speed,
            y: Math.sin(angle + Math.PI) * speed
        }, angle + Math.PI));
    }
}

function createExplosion(x, y, color, intensity = 10) {
    for (let i = 0; i < intensity * 2; i++) {
        particles.push(new Particle(x, y, color, 12));
    }
}

function animate() {
    if (!gameActive) return;
    animationId = requestAnimationFrame(animate);

    ctx.clearRect(0, 0, width, height);

    drawBlade();

    // Update Objects
    objects.forEach((obj, index) => {
        obj.update();
        if (obj.y > height + 100) objects.splice(index, 1);
    });

    // Update Pieces (Sliced halves)
    pieces.forEach((piece, index) => {
        piece.update();
        if (piece.alpha <= 0) pieces.splice(index, 1);
    });

    // Update Particles
    particles.forEach((particle, index) => {
        if (particle.alpha <= 0) particles.splice(index, 1);
        else particle.update();
    });

    checkSlicing();
    spawnObjects();
    frame++;
}

function startGame() {
    gameActive = true;
    score = 0;
    frame = 0;
    scoreEl.innerText = 0;
    objects = [];
    particles = [];
    pieces = [];
    blade.length = 0;

    startScreen.classList.add('hidden');
    gameOverScreen.classList.add('hidden');
    canvas.style.cursor = 'none';

    animate();
}

function endGame() {
    gameActive = false;
    cancelAnimationFrame(animationId);
    canvas.style.cursor = 'default';

    finalScoreEl.innerText = score;
    if (score > highScore) {
        highScore = score;
        localStorage.setItem('neonNinjaHighScore', highScore);
        highScoreEl.innerText = highScore;
    }

    gameOverScreen.classList.remove('hidden');
}

// Event Listeners
startBtn.addEventListener('click', startGame);
restartBtn.addEventListener('click', startGame);
