const CONFIG = {
    density: 0.00006,
    maxParticles: 1000,
    minParticles: 500,
    speed: 0.9,
    size: [1, 2.6],
    linkDistance: 120,
    mouseRadius: 140,
    repelStrength: 0.9,
    color: "50, 155, 155",
    dotAlpha: 0.55,
    lineAlpha: 0.18,
    clickBurst: 4,
    maxExtra: 60,
};

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const canvas = document.createElement("canvas");
canvas.id = "particles-canvas";
Object.assign(canvas.style, {
    position: "fixed",
    top: "0",
    left: "0",
    width: "100vw",
    height: "100vh",
    pointerEvents: "none",
    zIndex: "0",
});
document.body.prepend(canvas);
const ctx = canvas.getContext("2d");

let width = 0;
let height = 0;
let dpr = 1;
let particles = [];
let rafId = null;
const pointer = { x: -9999, y: -9999, active: false };

const rand = (min, max) => Math.random() * (max - min) + min;

class Particle {
    constructor(x = rand(0, width), y = rand(0, height)) {
        this.x = x;
        this.y = y;
        const angle = rand(0, Math.PI * 2);
        const v = rand(0.3, 1) * CONFIG.speed;
        this.vx = Math.cos(angle) * v;
        this.vy = Math.sin(angle) * v;
        this.r = rand(CONFIG.size[0], CONFIG.size[1]);
        this.base = v;
    }

    update() {
        if (pointer.active) {
            const dx = this.x - pointer.x;
            const dy = this.y - pointer.y;
            const dist = Math.hypot(dx, dy);
            if (dist < CONFIG.mouseRadius && dist > 0.001) {
                const force = (1 - dist / CONFIG.mouseRadius) * CONFIG.repelStrength;
                this.vx += (dx / dist) * force;
                this.vy += (dy / dist) * force;
            }
        }

        this.vx *= 0.97;
        this.vy *= 0.97;
        const speed = Math.hypot(this.vx, this.vy);
        if (speed < this.base) {
            const k = this.base / (speed || 1);
            this.vx *= 1 + (k - 1) * 0.05;
            this.vy *= 1 + (k - 1) * 0.05;
        }

        this.x += this.vx;
        this.y += this.vy;

        if (this.x < 0 || this.x > width) {
            this.vx *= -1;
            this.x = Math.max(0, Math.min(width, this.x));
        }
        if (this.y < 0 || this.y > height) {
            this.vy *= -1;
            this.y = Math.max(0, Math.min(height, this.y));
        }
    }

    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${CONFIG.color}, ${CONFIG.dotAlpha})`;
        ctx.fill();
    }
}

function targetCount() {
    const n = Math.round(width * height * CONFIG.density);
    return Math.max(CONFIG.minParticles, Math.min(CONFIG.maxParticles, n));
}

function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const target = targetCount();
    while (particles.length < target) particles.push(new Particle());
    if (particles.length > target) particles.length = target;
}

function drawLinks() {
    const max = CONFIG.linkDistance;
    for (let i = 0; i < particles.length; i++) {
        const a = particles[i];
        for (let j = i + 1; j < particles.length; j++) {
            const b = particles[j];
            const dx = a.x - b.x;
            if (dx > max || dx < -max) continue;
            const dy = a.y - b.y;
            const dist = Math.hypot(dx, dy);
            if (dist < max) {
                const alpha = (1 - dist / max) * CONFIG.lineAlpha;
                ctx.strokeStyle = `rgba(${CONFIG.color}, ${alpha})`;
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.moveTo(a.x, a.y);
                ctx.lineTo(b.x, b.y);
                ctx.stroke();
            }
        }

        if (pointer.active) {
            const dx = a.x - pointer.x;
            const dy = a.y - pointer.y;
            const dist = Math.hypot(dx, dy);
            if (dist < CONFIG.mouseRadius) {
                const alpha = (1 - dist / CONFIG.mouseRadius) * CONFIG.lineAlpha * 2;
                ctx.strokeStyle = `rgba(${CONFIG.color}, ${alpha})`;
                ctx.beginPath();
                ctx.moveTo(a.x, a.y);
                ctx.lineTo(pointer.x, pointer.y);
                ctx.stroke();
            }
        }
    }
}

function frame() {
    ctx.clearRect(0, 0, width, height);
    for (const p of particles) {
        p.update();
        p.draw();
    }
    drawLinks();
    rafId = requestAnimationFrame(frame);
}

function start() {
    if (rafId === null) rafId = requestAnimationFrame(frame);
}

function stop() {
    if (rafId !== null) {
        cancelAnimationFrame(rafId);
        rafId = null;
    }
}

function setPointer(x, y) {
    pointer.x = x;
    pointer.y = y;
    pointer.active = true;
}

window.addEventListener("mousemove", (e) => setPointer(e.clientX, e.clientY));
window.addEventListener("mouseleave", () => (pointer.active = false));
window.addEventListener(
    "touchmove",
    (e) => {
        const t = e.touches[0];
        if (t) setPointer(t.clientX, t.clientY);
    },
    { passive: true },
);
window.addEventListener("touchend", () => (pointer.active = false));

window.addEventListener("pointerdown", (e) => {
    if (e.target.closest("a, button, input, .card, [data-search-view]")) return;
    const extra = particles.length - targetCount();
    if (extra >= CONFIG.maxExtra) return;
    for (let i = 0; i < CONFIG.clickBurst; i++) {
        const p = new Particle(e.clientX, e.clientY);
        p.vx *= 4;
        p.vy *= 4;
        particles.push(p);
    }
});

window.addEventListener("resize", resize);
document.addEventListener("visibilitychange", () => {
    document.hidden ? stop() : start();
});

resize();
if (reduceMotion) {
    for (const p of particles) p.draw();
    drawLinks();
} else {
    start();
}
