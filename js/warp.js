(function () {
  "use strict";

  var WARP_FLAG = 'vertexWarpArrival';

  function playWarp(direction) {
    return new Promise(function (resolve) {
      var overlay = document.createElement('div');
      overlay.className = 'warp-overlay';
      var warpCanvas = document.createElement('canvas');
      warpCanvas.className = 'warp-canvas';
      document.body.appendChild(overlay);
      document.body.appendChild(warpCanvas);

      warpCanvas.width = window.innerWidth;
      warpCanvas.height = window.innerHeight;
      var wctx = warpCanvas.getContext('2d');
      var cx = warpCanvas.width / 2;
      var cy = warpCanvas.height / 2;
      var maxR = Math.sqrt(cx * cx + cy * cy) * 1.2;

      var PARTICLE_COUNT = 140;
      var particles = [];
      for (var i = 0; i < PARTICLE_COUNT; i++) {
        var angle = Math.random() * Math.PI * 2;
        if (direction === 'in') {
          particles.push({ angle: angle, radius: maxR * (0.4 + Math.random() * 0.6), speed: 16 + Math.random() * 12 });
        } else {
          particles.push({ angle: angle, radius: Math.random() * 40, speed: 2 + Math.random() * 2 });
        }
      }

      overlay.style.opacity = (direction === 'in') ? '1' : '0';
      void overlay.offsetHeight;
      overlay.style.opacity = (direction === 'in') ? '0' : '1';

      var DURATION = 850;
      var start = performance.now();

      function frame(now) {
        var elapsed = now - start;

        wctx.fillStyle = 'rgba(5,4,15,0.10)';
        wctx.fillRect(0, 0, warpCanvas.width, warpCanvas.height);

        particles.forEach(function (p) {
          var oldR = p.radius;
          if (direction === 'in') {
            p.speed *= 0.94;
            p.radius = Math.max(0, p.radius - p.speed);
          } else {
            p.speed *= 1.055;
            p.radius += p.speed;
          }
          var x1 = cx + Math.cos(p.angle) * oldR;
          var y1 = cy + Math.sin(p.angle) * oldR;
          var x2 = cx + Math.cos(p.angle) * p.radius;
          var y2 = cy + Math.sin(p.angle) * p.radius;
          var alpha = Math.max(0.15, Math.min(1, p.radius / (maxR * 0.5)));
          wctx.strokeStyle = 'rgba(205,190,255,' + alpha + ')';
          wctx.lineWidth = 1 + alpha * 1.6;
          wctx.beginPath();
          wctx.moveTo(x1, y1);
          wctx.lineTo(x2, y2);
          wctx.stroke();
        });

        if (elapsed < DURATION) {
          requestAnimationFrame(frame);
        } else {
          warpCanvas.remove();
          if (direction === 'in') {
            setTimeout(function () { overlay.remove(); }, 100);
          }
          resolve();
        }
      }
      requestAnimationFrame(frame);
    });
  }

  window.VertexWarp = {
    play: playWarp,
    navigate: function (href) {
      try { sessionStorage.setItem(WARP_FLAG, '1'); } catch (e) {}
      playWarp('out').then(function () {
        window.location.href = href;
      });
    }
  };

  document.querySelectorAll('a.warp-link').forEach(function (link) {
    link.addEventListener('click', function (e) {
      e.preventDefault();
      window.VertexWarp.navigate(link.getAttribute('href'));
    });
  });

  var shouldArrive = false;
  try { shouldArrive = sessionStorage.getItem(WARP_FLAG) === '1'; } catch (e) {}
  if (shouldArrive) {
    try { sessionStorage.removeItem(WARP_FLAG); } catch (e) {}
    playWarp('in');
  }
})();
