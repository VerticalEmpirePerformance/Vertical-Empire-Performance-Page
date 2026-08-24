const canvas = document.getElementById('stars');
const ctx = canvas.getContext('2d');

let width, height, stars;

const STAR_COLORS = ['#ffffff', '#cdd8ff', '#e3cbff'];

function resize() {
  width = canvas.width = window.innerWidth;
  height = canvas.height = window.innerHeight;
  createStars();
}

function createStars() {
  const count = Math.floor((width * height) / 6000);
  stars = Array.from({ length: count }, () => ({
    x: Math.random() * width,
    y: Math.random() * height,
    radius: Math.random() * 1.4 + 0.3,
    baseAlpha: Math.random() * 0.6 + 0.3,
    twinkleSpeed: Math.random() * 0.02 + 0.005,
    twinklePhase: Math.random() * Math.PI * 2,
    color: STAR_COLORS[Math.floor(Math.random() * STAR_COLORS.length)],
    driftX: (Math.random() - 0.5) * 0.02,
    driftY: (Math.random() - 0.5) * 0.02,
  }));
}

function draw() {
  ctx.clearRect(0, 0, width, height);

  for (const star of stars) {
    star.twinklePhase += star.twinkleSpeed;
    const alpha = star.baseAlpha * (0.5 + 0.5 * Math.sin(star.twinklePhase));

    star.x += star.driftX;
    star.y += star.driftY;

    if (star.x < 0) star.x = width;
    if (star.x > width) star.x = 0;
    if (star.y < 0) star.y = height;
    if (star.y > height) star.y = 0;

    ctx.beginPath();
    ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
    ctx.fillStyle = star.color;
    ctx.globalAlpha = alpha;
    ctx.fill();
  }

  ctx.globalAlpha = 1;
  requestAnimationFrame(draw);
}

window.addEventListener('resize', resize);
resize();
draw();
