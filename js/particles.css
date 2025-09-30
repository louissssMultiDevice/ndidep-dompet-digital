class ParticleSystem {
    constructor() {
        this.container = document.getElementById('particles-container');
        this.particles = [];
        this.maxParticles = 50;
        this.init();
    }

    init() {
        this.createParticles();
        this.addEventListeners();
        this.animate();
    }

    createParticles() {
        for (let i = 0; i < this.maxParticles; i++) {
            this.createParticle();
        }
    }

    createParticle() {
        const particle = document.createElement('div');
        const types = ['particle-1', 'particle-2', 'particle-3', 'particle-4'];
        const type = types[Math.floor(Math.random() * types.length)];
        
        particle.className = `particle ${type}`;
        particle.style.left = Math.random() * 100 + '%';
        particle.style.animationDelay = Math.random() * 10 + 's';
        particle.style.animationDuration = (Math.random() * 5 + 8) + 's';
        
        this.container.appendChild(particle);
        this.particles.push(particle);

        // Remove particle after animation
        setTimeout(() => {
            if (particle.parentNode) {
                particle.parentNode.removeChild(particle);
                const index = this.particles.indexOf(particle);
                if (index > -1) {
                    this.particles.splice(index, 1);
                }
            }
        }, 15000);
    }

    createMoneyParticle() {
        const symbols = ['$', '€', '¥', '₹', '£'];
        const particle = document.createElement('div');
        
        particle.className = 'particle particle-money';
        particle.textContent = symbols[Math.floor(Math.random() * symbols.length)];
        particle.style.left = Math.random() * 100 + '%';
        particle.style.color = `hsl(${Math.random() * 60 + 120}, 70%, 50%)`;
        
        this.container.appendChild(particle);
        
        setTimeout(() => {
            if (particle.parentNode) {
                particle.parentNode.removeChild(particle);
            }
        }, 15000);
    }

    createInteractiveParticle(x, y) {
        const particle = document.createElement('div');
        particle.className = 'interactive-particle';
        particle.style.left = x + 'px';
        particle.style.top = y + 'px';
        
        this.container.appendChild(particle);
        
        setTimeout(() => {
            if (particle.parentNode) {
                particle.parentNode.removeChild(particle);
            }
        }, 3000);
    }

    createCursorTrail(x, y) {
        const trail = document.createElement('div');
        trail.className = 'cursor-trail';
        trail.style.left = (x - 10) + 'px';
        trail.style.top = (y - 10) + 'px';
        
        document.body.appendChild(trail);
        
        setTimeout(() => {
            if (trail.parentNode) {
                trail.parentNode.removeChild(trail);
            }
        }, 800);
    }

    createBurstEffect(x, y) {
        const burstCount = 8;
        for (let i = 0; i < burstCount; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle-burst';
            
            const angle = (i / burstCount) * Math.PI * 2;
            const distance = 50;
            const burstX = Math.cos(angle) * distance;
            const burstY = Math.sin(angle) * distance;
            
            particle.style.left = x + 'px';
            particle.style.top = y + 'px';
            particle.style.setProperty('--burst-x', burstX + 'px');
            particle.style.setProperty('--burst-y', burstY + 'px');
            
            this.container.appendChild(particle);
            
            setTimeout(() => {
                if (particle.parentNode) {
                    particle.parentNode.removeChild(particle);
                }
            }, 1000);
        }
    }

    addEventListeners() {
        let mouseTrailTimer;
        
        document.addEventListener('mousemove', (e) => {
            // Cursor trail effect
            if (Math.random() < 0.1) {
                this.createCursorTrail(e.clientX, e.clientY);
            }
        });

        document.addEventListener('click', (e) => {
            // Interactive particles on click
            this.createInteractiveParticle(e.clientX, e.clientY);
            this.createBurstEffect(e.clientX, e.clientY);
        });

        // Create money particles periodically
        setInterval(() => {
            if (Math.random() < 0.3) {
                this.createMoneyParticle();
            }
        }, 3000);

        // Maintain particle count
        setInterval(() => {
            if (this.particles.length < this.maxParticles) {
                this.createParticle();
            }
        }, 1000);
    }

    animate() {
        // Add sparkle effects randomly
        setInterval(() => {
            if (Math.random() < 0.2) {
                this.createSparkle();
            }
        }, 2000);
    }

    createSparkle() {
        const sparkle = document.createElement('div');
        sparkle.className = 'sparkle';
        sparkle.style.left = Math.random() * 100 + '%';
        sparkle.style.top = Math.random() * 100 + '%';
        
        this.container.appendChild(sparkle);
        
        setTimeout(() => {
            if (sparkle.parentNode) {
                sparkle.parentNode.removeChild(sparkle);
            }
        }, 2000);
    }
}

// Initialize particle system when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new ParticleSystem();
});
      
