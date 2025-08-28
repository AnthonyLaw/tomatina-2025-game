import { createClouds, drawCloud, updateCloud, drawBanner, createDropper, updateDropper, drawDropper, spawnTomato, updateTomato, drawTomato, drawSky, drawSFX, updateSFX, addSFX } from './entities.js';

export function bootGame({ sound, gameOverSound, missSound }) {
  const canvas = document.getElementById('game');
  const ctx = canvas.getContext('2d');

  const scoreVal = document.getElementById('scoreVal');
  const missVal = document.getElementById('missVal');
  const startBtn = document.getElementById('startBtn');
  const restartBtn = document.getElementById('restartBtn');
  const centerToast = document.getElementById('centerToast');
  const toastTitle = document.getElementById('toastTitle');
  const toastSubtitle = document.getElementById('toastSubtitle');
  const startArt = document.getElementById('startArt');

  let devicePixelRatioSafe = Math.max(1, Math.min(window.devicePixelRatio || 1, 2));

  const state = {
    running: false,
    score: 0,
    misses: 0,
    maxMisses: 10,
    lastDropTime: 0,
    dropIntervalMs: 900,
    tomatoes: [],
    effects: [],
    clouds: [],
    time: 0,
    dropper: createDropper(400)
  };

  // Load monster sprite for the dropper
  const monster = new Image();
  monster.src = './asset/pirate.png';

  function resizeCanvas() {
    devicePixelRatioSafe = Math.max(1, Math.min(window.devicePixelRatio || 1, 2));
    const widthCss = canvas.clientWidth || canvas.parentElement.clientWidth || window.innerWidth;
    const heightCss = canvas.clientHeight || canvas.parentElement.clientHeight || window.innerHeight;

    canvas.width = Math.floor(widthCss * devicePixelRatioSafe);
    canvas.height = Math.floor(heightCss * devicePixelRatioSafe);
    ctx.setTransform(devicePixelRatioSafe, 0, 0, devicePixelRatioSafe, 0, 0);
  }

  const resizeObserver = new ResizeObserver(resizeCanvas);
  resizeObserver.observe(canvas);

  function spawnClouds() {
    const W = canvas.width / devicePixelRatioSafe;
    const H = canvas.height / devicePixelRatioSafe;
    state.clouds = createClouds(W, H);
  }

  function resetGame() {
    state.running = false;
    state.score = 0;
    state.misses = 0;
    state.dropIntervalMs = 900;
    state.tomatoes.length = 0;
    state.effects.length = 0;
    state.time = 0;

    scoreVal.textContent = '0';
    missVal.textContent = '0';

    const W = canvas.width / devicePixelRatioSafe;
    state.dropper = createDropper(W);
    // Position below the top banner
    state.dropper.y = 84;
    state.dropper.sprite = monster;

    spawnClouds();

    centerToast.style.display = 'block';
    toastTitle.textContent = 'Tomatina Clicker';
    toastSubtitle.textContent = 'Click to start';
    startArt.style.display = 'block';
  }

  function gameOver() {
    state.running = false;
    startBtn.disabled = false;
    restartBtn.disabled = false;
    centerToast.style.display = 'block';
    toastTitle.textContent = 'Game Over';
    toastSubtitle.textContent = `Final score: ${state.score} — click Restart`;
    startArt.style.display = 'none';
    if (gameOverSound && typeof gameOverSound.play === 'function') {
      try { gameOverSound.play(); } catch(e) { /* iOS audio policy */ }
    }
  }

  function update(dt) {
    state.time += dt;

    const W = canvas.width / devicePixelRatioSafe;
    const H = canvas.height / devicePixelRatioSafe;

    // Move dropper
    updateDropper(state.dropper, dt, W);
    // Ensure sprite is set (in case of resize/reset)
    if (!state.dropper.sprite) state.dropper.sprite = monster;

    // Clouds
    for (const c of state.clouds) updateCloud(c, dt, state.time, W);

    // Spawn tomatoes
    if (state.time - state.lastDropTime > state.dropIntervalMs / 1000) {
      state.tomatoes.push(spawnTomato(state.dropper.x, state.dropper.y));
      state.lastDropTime = state.time;
      state.dropIntervalMs = Math.max(380, state.dropIntervalMs * 0.985);
    }

    // Update tomatoes and check falls
    for (let i = state.tomatoes.length - 1; i >= 0; i--) {
      const t = state.tomatoes[i];
      const fellOut = updateTomato(t, dt, H);
      if (fellOut) {
        state.tomatoes.splice(i, 1);
        state.misses += 1;
        missVal.textContent = String(state.misses);
        addSFX(state.effects, Math.max(24, Math.min(W - 24, t.x)), H - 18, 'splat');
        if (missSound && typeof missSound.play === 'function') {
          try { missSound.play(); } catch(e) { /* iOS audio policy */ }
        }
        if (state.misses >= state.maxMisses) gameOver();
      }
    }

    // Update visual effects
    updateSFX(state.effects, dt);
  }

  function draw() {
    const W = canvas.width / devicePixelRatioSafe;
    const H = canvas.height / devicePixelRatioSafe;

    drawSky(ctx, W, H);

    for (const c of state.clouds) drawCloud(ctx, c);

    drawBanner(ctx, W, state.time);
    drawDropper(ctx, state.dropper);

    for (const t of state.tomatoes) drawTomato(ctx, t);

    drawSFX(ctx, state.effects);
  }

  function getCanvasPos(evt) {
    const rect = canvas.getBoundingClientRect();
    return {
      x: evt.clientX - rect.left,
      y: evt.clientY - rect.top
    };
  }

  function onCanvasClick(evt) {
    if (!state.running) return;
    const { x, y } = getCanvasPos(evt);

    for (let i = state.tomatoes.length - 1; i >= 0; i--) {
      const t = state.tomatoes[i];
      const dx = x - t.x, dy = y - t.y;
      if (dx * dx + dy * dy <= t.r * t.r * 1.2) {
        state.tomatoes.splice(i, 1);
        state.score += 1;
        scoreVal.textContent = String(state.score);
        addSFX(state.effects, t.x, t.y, 'pop');
        addSFX(state.effects, t.x, t.y, 'splat');
        if (sound && typeof sound.play === 'function') {
          try { sound.play(); } catch(e) { /* iOS audio policy */ }
        }
        if (state.score % 5 === 0) state.dropIntervalMs = Math.max(300, state.dropIntervalMs - 40);
        return;
      }
    }
  }

  canvas.addEventListener('click', onCanvasClick);
  canvas.addEventListener('touchstart', (e) => {
    e.preventDefault();
    const touch = e.touches[0];
    const rect = canvas.getBoundingClientRect();
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;
    onCanvasClick({ clientX: touch.clientX, clientY: touch.clientY });
  }, { passive: false });

  let lastTs = 0;
  function loop(ts) {
    if (!lastTs) lastTs = ts;
    const dt = Math.min(0.033, (ts - lastTs) / 1000);
    lastTs = ts;
    if (state.running) {
      update(dt);
      draw();
    }
    requestAnimationFrame(loop);
  }

  startBtn.addEventListener('click', () => {
    if (state.running) return;
    startBtn.disabled = true;
    restartBtn.disabled = false;
    centerToast.style.display = 'none';
    state.running = true;
    state.lastDropTime = 0;
    state.time = 0;
    startArt.style.display = 'none';
    // iOS Safari: preload audio on first user interaction
    if (sound && typeof sound.play === 'function') {
      try { sound.play(); } catch(e) { /* iOS blocks autoplay */ }
    }
  });

  restartBtn.addEventListener('click', () => {
    resetGame();
    startBtn.click();
  });

  // Allow clicking the center toast to start or restart appropriately
  centerToast.addEventListener('click', () => {
    if (state.running) return;
    if (state.misses >= state.maxMisses) {
      // Was game over: do a full restart
      restartBtn.click();
    } else {
      // Initial start screen
      startBtn.click();
    }
  });
  centerToast.addEventListener('touchstart', (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (state.running) return;
    if (state.misses >= state.maxMisses) {
      restartBtn.click();
    } else {
      startBtn.click();
    }
  }, { passive: false });

  window.addEventListener('keydown', (e) => {
    if (e.code === 'Space') {
      if (!state.running) startBtn.click(); else restartBtn.click();
    }
  });

  window.addEventListener('resize', () => {
    spawnClouds();
  });

  // Init
  resizeCanvas();
  resetGame();
  requestAnimationFrame(loop);
}
