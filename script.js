// Blog Data
const blogPosts = [
    {
        id: 1,
        title: "Fundamentos de JavaScript",
        excerpt: "Certificación de OpenWebinars. Profundización en el lenguaje, sintaxis moderna (ES6+) y buenas prácticas de desarrollo.",
        date: "Nov 2025",
        image: "https://images.unsplash.com/photo-1627398242454-45a1465c2479?auto=format&fit=crop&q=80&w=800",
        redirectTo: "https://openwebinars.net/certificacion/mqeHA2hP"
    },
    {
        id: 2,
        title: "Líderes Digitales Universitarios",
        excerpt: "Programa de Telefónica Innovación Digital. Formación en competencias digitales, liderazgo y transformación tecnológica.",
        date: "Jun 2025",
        image: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&q=80&w=800",
        redirectTo: "https://www.acreditta.com/credential/a2c23a3d-da51-4f03-a04b-6686e32a65c5?utm_source=linkedin_profile&resource_type=badge&resource=a2c23a3d-da51-4f03-a04b-6686e32a65c5"
    },
    {
        id: 3,
        title: "Grado en Ingeniería Informática",
        excerpt: "Universidad Francisco de Vitoria. 4º Curso. Enfocado en Ingeniería del Software, Cloud Computing y Visualización de Datos.",
        date: "En curso",
        image: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&q=80&w=800",
        redirectTo: "https://www.ufv.es/ingenieria-informatica-guia-completa-para-futuros-profesionales-preguntas-grados/"
    }
];

// DOM Elements
const blogGrid = document.getElementById('blog-grid');
const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
const navLinks = document.querySelector('.nav-links');

// Render Blog Posts
function renderPosts() {
    if (!blogGrid) return;
    blogGrid.innerHTML = blogPosts.map(post => `
        <a href="${post.redirectTo}" target="_blank" class="blog-card" style="animation: fade-in 0.5s ease forwards; display: block; text-decoration: none;">
            <div class="card-image">
                <img src="${post.image}" alt="${post.title}" loading="lazy">
            </div>
            <div class="card-content">
                <span class="card-date">${post.date}</span>
                <h3>${post.title}</h3>
                <p>${post.excerpt}</p>
                <span class="read-more">Leer más</span>
            </div>
        </a>
    `).join('');
}

// Mobile Menu Toggle
if (mobileMenuBtn) {
    mobileMenuBtn.addEventListener('click', () => {
        navLinks.classList.toggle('active');

        // Animate hamburger
        const spans = mobileMenuBtn.querySelectorAll('span');
        if (navLinks.classList.contains('active')) {
            spans[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
            spans[1].style.opacity = '0';
            spans[2].style.transform = 'rotate(-45deg) translate(5px, -5px)';
        } else {
            spans[0].style.transform = 'none';
            spans[1].style.opacity = '1';
            spans[2].style.transform = 'none';
        }
    });
}

// Smooth Scroll for Anchor Links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        if (navLinks) navLinks.classList.remove('active'); // Close menu on click

        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth'
            });
        }
    });
});

// Navbar Scroll Effect
window.addEventListener('scroll', () => {
    const header = document.querySelector('.glass-header');
    if (header) {
        if (window.scrollY > 50) {
            header.style.background = 'rgba(10, 10, 10, 0.9)';
        } else {
            header.style.background = 'rgba(10, 10, 10, 0.7)';
        }
    }
});

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    renderPosts();
    initParticleSystem();
});

// --- Advanced Particle System (Canvas) ---
// --- Advanced Particle System (Canvas) ---
function initParticleSystem() {
    const canvas = document.getElementById('particle-canvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let particles = [];
    let width, height;

    // Mouse State
    const mouse = {
        x: undefined,
        y: undefined,
        radius: 150 // Interaction radius
    };

    // Resize Handler
    function resize() {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
    }
    window.addEventListener('resize', resize);
    resize();

    // Mouse Events
    window.addEventListener('mousemove', (e) => {
        mouse.x = e.x;
        mouse.y = e.y;
    });

    window.addEventListener('mouseout', () => {
        mouse.x = undefined;
        mouse.y = undefined;
    });

    // Particle Class
    class Particle {
        constructor() {
            this.x = Math.random() * width;
            this.y = Math.random() * height;
            this.vx = (Math.random() - 0.5) * 1; // Velocity X
            this.vy = (Math.random() - 0.5) * 1; // Velocity Y
            this.size = Math.random() * 2 + 1;
            this.baseX = this.x;
            this.baseY = this.y;
            this.density = (Math.random() * 30) + 1;
            // Harmonized Colors: Blue or White
            this.color = Math.random() > 0.5 ? '#5c9aff' : '#ffffff';
        }

        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fillStyle = this.color;
            ctx.fill();
        }

        update() {
            // Physics: Mouse Interaction
            if (mouse.x !== undefined && mouse.y !== undefined) {
                let dx = mouse.x - this.x;
                let dy = mouse.y - this.y;
                let distance = Math.sqrt(dx * dx + dy * dy);

                // Force Field Effect
                if (distance < mouse.radius) {
                    const forceDirectionX = dx / distance;
                    const forceDirectionY = dy / distance;
                    const maxDistance = mouse.radius;
                    const force = (maxDistance - distance) / maxDistance;
                    const directionX = forceDirectionX * force * this.density;
                    const directionY = forceDirectionY * force * this.density;

                    // Repulsion (Game-like interaction)
                    this.x -= directionX;
                    this.y -= directionY;
                } else {
                    // Return to original speed/position logic if needed, 
                    // but for "game-like" let's keep them floating freely but influenced
                    if (this.x !== this.baseX) {
                        let dx = this.x - this.baseX;
                        this.x -= dx / 50; // Elastic return
                    }
                    if (this.y !== this.baseY) {
                        let dy = this.y - this.baseY;
                        this.y -= dy / 50;
                    }
                }
            }

            // Move particle
            this.x += this.vx;
            this.y += this.vy;

            // Bounce off edges
            if (this.x < 0 || this.x > width) this.vx = -this.vx;
            if (this.y < 0 || this.y > height) this.vy = -this.vy;

            this.draw();
        }
    }

    // Initialize Particles
    function init() {
        particles = [];
        // Create many particles for "game feel"
        const numberOfParticles = (width * height) / 9000;
        for (let i = 0; i < numberOfParticles; i++) {
            particles.push(new Particle());
        }
    }

    // Animation Loop
    function animate() {
        requestAnimationFrame(animate);
        ctx.clearRect(0, 0, width, height);

        for (let i = 0; i < particles.length; i++) {
            particles[i].update();
        }

        // Connect particles (Constellation effect)
        connect();
    }

    // Draw lines between close particles
    function connect() {
        let opacityValue = 1;
        for (let a = 0; a < particles.length; a++) {
            for (let b = a; b < particles.length; b++) {
                let distance = ((particles[a].x - particles[b].x) * (particles[a].x - particles[b].x))
                    + ((particles[a].y - particles[b].y) * (particles[a].y - particles[b].y));

                if (distance < (canvas.width / 7) * (canvas.height / 7)) {
                    opacityValue = 1 - (distance / 20000);
                    if (opacityValue > 0) {
                        ctx.strokeStyle = 'rgba(92, 154, 255,' + opacityValue * 0.2 + ')'; // Harmonized Blue lines
                        ctx.lineWidth = 1;
                        ctx.beginPath();
                        ctx.moveTo(particles[a].x, particles[a].y);
                        ctx.lineTo(particles[b].x, particles[b].y);
                        ctx.stroke();
                    }
                }
            }
        }
    }

    init();
    animate();
}
