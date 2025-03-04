'use strict';

// Confirm JS is running
console.log("swirl.js is loaded!");

// Get canvas and set up drawing context
const canvas = document.getElementById("swirlCanvas");
const ctx = canvas.getContext("2d");

// Resize canvas to fit the screen
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
window.addEventListener("resize", resizeCanvas);
resizeCanvas();

// Constants for particle properties
const particleCount = 700;
const particlePropCount = 9;
const particlePropsLength = particleCount * particlePropCount;
const rangeY = 100;
const baseTTL = 50;
const rangeTTL = 150;
const baseSpeed = 0.1;
const rangeSpeed = 2;
const baseRadius = 1;
const rangeRadius = 4;
const baseHue = 220;
const rangeHue = 100;
const noiseSteps = 8;
const xOff = 0.00125;
const yOff = 0.00125;
const zOff = 0.0005;
const backgroundColor = 'hsla(0,100%,0%,)';

// Initialize variables
let tick = 0;
let simplex = new SimplexNoise();
let particleProps = new Float32Array(particlePropsLength);

// Initialize particles
function initParticles() {
    for (let i = 0; i < particlePropsLength; i += particlePropCount) {
        initParticle(i);
    }
}

// Initialize individual particle properties
function initParticle(i) {
    let x = Math.random() * canvas.width;
    let y = canvas.height / 2 + (Math.random() * rangeY - rangeY / 2);
    let vx = 0;
    let vy = 0;
    let life = 0;
    let ttl = baseTTL + Math.random() * rangeTTL;
    let speed = baseSpeed + Math.random() * rangeSpeed;
    let radius = baseRadius + Math.random() * rangeRadius;
    let hue = baseHue + Math.random() * rangeHue;

    particleProps.set([x, y, vx, vy, life, ttl, speed, radius, hue], i);
}

// Update and draw particles
function drawParticles() {
    for (let i = 0; i < particlePropsLength; i += particlePropCount) {
        updateParticle(i);
    }
}

// Update particle behavior
function updateParticle(i) {
    let i2 = i + 1, i3 = i + 2, i4 = i + 3, i5 = i + 4, i6 = i + 5, i7 = i + 6, i8 = i + 7, i9 = i + 8;

    let x = particleProps[i];
    let y = particleProps[i2];
    let noiseValue = simplex.noise3D(x * xOff, y * yOff, tick * zOff) * noiseSteps * Math.PI * 2;
    let vx = lerp(particleProps[i3], Math.cos(noiseValue), 0.5);
    let vy = lerp(particleProps[i4], Math.sin(noiseValue), 0.5);
    let life = particleProps[i5];
    let ttl = particleProps[i6];
    let speed = particleProps[i7];
    let x2 = x + vx * speed;
    let y2 = y + vy * speed;
    let radius = particleProps[i8];
    let hue = particleProps[i9];

    drawParticle(x, y, x2, y2, life, ttl, radius, hue);

    life++;

    particleProps[i] = x2;
    particleProps[i2] = y2;
    particleProps[i3] = vx;
    particleProps[i4] = vy;
    particleProps[i5] = life;

    // Reinitialize particle if it leaves bounds or lifespan is exceeded
    if (checkBounds(x2, y2) || life > ttl) {
        initParticle(i);
    }
}

// Draw a particle line with glow effect
function drawParticle(x, y, x2, y2, life, ttl, radius, hue) {
    ctx.save();
    ctx.lineCap = 'round';
    ctx.lineWidth = radius;
    ctx.strokeStyle = `hsla(${hue},100%,60%,${fadeInOut(life, ttl)})`;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x2, y2);
    ctx.stroke();
    ctx.closePath();
    ctx.restore();
}

// Check if the particle is out of bounds
function checkBounds(x, y) {
    return (x > canvas.width || x < 0 || y > canvas.height || y < 0);
}

// Utility function to fade particles in and out
function fadeInOut(life, ttl) {
    return Math.sin((life / ttl) * Math.PI);
}

// Linear interpolation function
function lerp(start, end, amt) {
    return (1 - amt) * start + amt * end;
}

// Animation loop
function animate() {
    tick++;

    // Create a subtle glow effect
    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    drawParticles();

    requestAnimationFrame(animate);
}

// Initialize everything
initParticles();
animate();
