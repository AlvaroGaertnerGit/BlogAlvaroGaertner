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

// Mouse Trail Effect
function initMouseTrail() {
    // Reduced color palette: Google Blue and White/Light Grey
    const colors = ['#4285F4', '#ffffff', '#e8eaed'];

    let lastX = 0;
    let lastY = 0;

    document.addEventListener('mousemove', (e) => {
        // Calculate distance to ensure particles are generated even on fast movement
        const distance = Math.hypot(e.clientX - lastX, e.clientY - lastY);

        // Generate more particles based on movement speed
        const particleCount = Math.min(Math.floor(distance / 5) + 1, 5);

        for (let i = 0; i < particleCount; i++) {
            createParticle(e.clientX, e.clientY, colors);
        }

        lastX = e.clientX;
        lastY = e.clientY;
    });
}

function createParticle(x, y, colors) {
    const particle = document.createElement('div');
    particle.classList.add('particle');

    // Random color from reduced palette
    const color = colors[Math.floor(Math.random() * colors.length)];
    particle.style.background = color;

    // Add some random offset so they don't all spawn in the exact same pixel
    const offsetX = (Math.random() - 0.5) * 10;
    const offsetY = (Math.random() - 0.5) * 10;

    particle.style.left = `${x + offsetX}px`;
    particle.style.top = `${y + offsetY}px`;

    // Slightly smaller but more numerous
    const size = Math.random() * 6 + 2;
    particle.style.width = `${size}px`;
    particle.style.height = `${size}px`;

    // Vary opacity for depth
    particle.style.opacity = Math.random() * 0.5 + 0.5;

    document.body.appendChild(particle);

    // Animate movement - spread out more
    const destinationX = x + (Math.random() - 0.5) * 100;
    const destinationY = y + (Math.random() - 0.5) * 100;

    const animation = particle.animate([
        { transform: `translate(-50%, -50%) scale(1)`, opacity: 1 },
        { transform: `translate(calc(-50% + ${destinationX - x}px), calc(-50% + ${destinationY - y}px)) scale(0)`, opacity: 0 }
    ], {
        duration: 1200, // Longer life
        easing: 'cubic-bezier(0, .9, .57, 1)',
        fill: 'forwards'
    });

    animation.onfinish = () => {
        particle.remove();
    };
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    renderPosts();
    initMouseTrail();
});
