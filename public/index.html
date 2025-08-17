<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <title>Suncity Plaza</title>
  <style>
    body { margin: 0; overflow: hidden; background: #223049; }
    canvas { display: block; }
  </style>
</head>
<body>
  <canvas id="gameCanvas" width="800" height="600"></canvas>
  <script>
    const c = document.getElementById("gameCanvas");
    const ctx = c.getContext("2d");

    const player = { x: 400, y: 300, size: 30, speed: 5 };
    const keys = {};

    addEventListener("keydown", e => keys[e.key] = true);
    addEventListener("keyup",   e => keys[e.key] = false);

    function draw() {
      // Hintergrund + Brunnen
      ctx.fillStyle = "#223049"; ctx.fillRect(0,0,c.width,c.height);
      ctx.beginPath(); ctx.arc(400,300,88,0,Math.PI*2); ctx.strokeStyle="#94bfff"; ctx.lineWidth=6; ctx.stroke();
      ctx.beginPath(); ctx.arc(400,300,60,0,Math.PI*2); ctx.fillStyle="#3a80ff"; ctx.fill();

      // Spieler
      ctx.fillStyle = "#ff4444";
      ctx.fillRect(player.x, player.y, player.size, player.size);
    }

    function update() {
      if (keys["ArrowUp"]||keys["w"]) player.y -= player.speed;
      if (keys["ArrowDown"]||keys["s"]) player.y += player.speed;
      if (keys["ArrowLeft"]||keys["a"]) player.x -= player.speed;
      if (keys["ArrowRight"]||keys["d"]) player.x += player.speed;

      // Bounds
      if (player.x<0) player.x=0;
      if (player.y<0) player.y=0;
      if (player.x+player.size>c.width)  player.x=c.width-player.size;
      if (player.y+player.size>c.height) player.y=c.height-player.size;
    }

    (function loop(){
      update(); draw(); requestAnimationFrame(loop);
    })();
  </script>
</body>
</html>
