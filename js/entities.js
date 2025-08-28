// Entities: clouds, dropper, tomatoes (with evil eyes), plus drawing helpers

export function createClouds(W, H) {
  const arr = [];
  const count = Math.max(6, Math.floor(W / 180));
  for (let i = 0; i < count; i++) {
    arr.push({
      x: Math.random() * W - W * 0.3,
      y: 30 + Math.random() * 160,
      s: 0.7 + Math.random() * 1.2,
      v: 10 + Math.random() * 30,
      w: 120 + Math.random() * 120,
    });
  }
  // Add a mid-screen cloud so they don’t all cluster at the top
  arr.push({
    x: Math.random() * W - W * 0.1,
    y: Math.max(60, Math.min(H - 60, H * (0.45 + Math.random() * 0.15))),
    s: 0.9 + Math.random() * 0.6,
    v: 12 + Math.random() * 24,
    w: 140 + Math.random() * 140,
  });
  return arr;
}
  
  export function drawCloud(ctx, c) {
    const { x, y, s, w } = c;
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(s, s);
    ctx.globalAlpha = 0.75;
    ctx.fillStyle = '#ffffff';
    puff(-w * 0.15, 0, w * 0.35, 28);
    puff(0, -10, w * 0.45, 32);
    puff(w * 0.18, 4, w * 0.33, 24);
    ctx.restore();
  
    function puff(px, py, aw, ah) {
      ctx.beginPath(); ctx.ellipse(px, py, aw, ah, 0, 0, Math.PI * 2); ctx.fill();
    }
  }
  
  export function updateCloud(c, dt, time, W) {
    c.x += c.v * dt;
    c.y += Math.sin(time * 0.4 + c.x * 0.01) * 0.05;
    if (c.x > W + 200) c.x = -200;
  }
  
  export function drawBanner(ctx, W, time) {
    ctx.save();
    const H = 48;

    // Background bar
    ctx.fillStyle = '#111826cc';
    ctx.fillRect(0, 0, W, H);

    // Animated gradient text
    const phase = (time || 0) * 120 % W;
    const g = ctx.createLinearGradient(-phase, 0, W - phase, 0);
    g.addColorStop(0.0, '#fde68a'); // amber
    g.addColorStop(0.5, '#fca5a5'); // red
    g.addColorStop(1.0, '#86efac'); // green

    ctx.fillStyle = g;
    ctx.shadowColor = '#00000088';
    ctx.shadowBlur = 8;
    ctx.font = '900 22px system-ui, -apple-system, Segoe UI, Roboto';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // subtle pulsing scale animation
    const scale = 1 + Math.sin((time || 0) * 2.2) * 0.03;
    ctx.save();
    ctx.translate(W / 2, H / 2);
    ctx.scale(scale, scale);
    ctx.fillText('Happy Tomatina 2025', 0, 0);
    ctx.restore();

    // Bottom accent line
    ctx.shadowBlur = 0;
    ctx.globalAlpha = 0.6;
    ctx.strokeStyle = '#e11d48';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, H - 2);
    ctx.lineTo(W, H - 2);
    ctx.stroke();

    ctx.restore();
  }
  
  export function createDropper(W) {
    return { x: W / 2, y: 24, vx: 160, w: 64, h: 18 };
  }
  export function updateDropper(d, dt, W) {
    d.x += d.vx * dt;
    if (d.x < 16 || d.x > W - 16) {
      d.vx *= -1;
      d.x = Math.max(16, Math.min(W - 16, d.x));
    }
  }
  export function drawDropper(ctx, d) {
    ctx.save();
    ctx.translate(d.x, d.y);

      if (d.sprite && d.sprite.complete) {
    // Draw provided sprite (e.g., monster) centered; flip based on velocity direction
    const targetH = 96; // display height in CSS pixels
    const iw = d.sprite.width || 1;
    const ih = d.sprite.height || 1;
    const scale = targetH / ih;
    const w = iw * scale;
    const h = targetH;

    const dir = d.vx >= 0 ? 1 : -1; // face movement direction
    ctx.scale(dir, 1);
    const drawX = (dir < 0 ? (-w / 2 - w) : (-w / 2));
    ctx.drawImage(d.sprite, drawX, -h * 0.25, w, h);
  } else {
      // Fallback vector dropper
      ctx.fillStyle = '#334155';
      ctx.fillRect(-d.w / 2, 0, d.w, d.h);
      ctx.beginPath(); ctx.arc(0, -10, 10, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#f59e0b'; ctx.fillRect(-8, -2, 16, 6);
    }

    ctx.restore();
  }
  
  export function spawnTomato(dropperX, dropperY) {
    const r = rand(12, 22);
    return {
      x: dropperX + rand(-14, 14),
      y: dropperY + 18 + r,
      r,
      vy: rand(120, 180) * (0.9 + 0.25 * Math.random()),
      wobbleT: Math.random() * Math.PI * 2,
      wobbleA: rand(2, 6),
      rot: 0,
      rotV: (Math.random() < 0.5 ? -1 : 1) * rand(1, 3) * 0.02,
    };
  }
  
  export function updateTomato(t, dt, H) {
    t.vy += 220 * dt * 0.2;
    t.y += t.vy * dt;
    t.wobbleT += dt * 6; t.rot += t.rotV;
    t.x += Math.sin(t.wobbleT) * (t.wobbleA * dt * 8);
    return (t.y - t.r > H);
  }
  
  export function drawTomato(ctx, t) {
    ctx.save();
    ctx.translate(t.x, t.y);
    ctx.rotate(t.rot);
  
    // body
    const g = ctx.createRadialGradient(-3, -3, 2, 0, 0, t.r);
    g.addColorStop(0, '#ff8da1'); g.addColorStop(1, '#e11d48');
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.ellipse(0, 0, t.r * 1.1, t.r, 0, 0, Math.PI * 2); ctx.fill();
  
    // leaf
    ctx.fillStyle = '#16a34a';
    ctx.beginPath(); ctx.moveTo(-4, -t.r * 0.6);
    ctx.quadraticCurveTo(0, -t.r, 4, -t.r * 0.6);
    ctx.lineTo(0, -t.r * 0.2); ctx.closePath(); ctx.fill();
  
    // evil eyes 😈
    const ey = -t.r * 0.15, ex = t.r * 0.28, ew = t.r * 0.22, eh = t.r * 0.18;
    ctx.fillStyle = '#0b0b0b';
    // left eye
    pathEye(-ex, ey, ew, eh, -0.5);
    // right eye
    pathEye(+ex, ey, ew, eh, +0.5);
    ctx.fill();
  
    // pupils (tiny white glint)
    ctx.fillStyle = '#ffffff';
    ctx.beginPath(); ctx.arc(-ex - ew * 0.15, ey - eh * 0.15, Math.max(1.2, ew * 0.15), 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(+ex - ew * 0.15, ey - eh * 0.15, Math.max(1.2, ew * 0.15), 0, Math.PI * 2); ctx.fill();
  
    ctx.restore();
  
    function pathEye(cx, cy, w, h, slant) {
      ctx.beginPath();
      ctx.moveTo(cx - w, cy);
      ctx.quadraticCurveTo(cx, cy + h * slant, cx + w, cy);
      ctx.quadraticCurveTo(cx, cy - h * 0.9, cx - w, cy);
      // do not close here to allow both eyes in one fill(); we’ll rely on separate beginPath for each if needed
    }
  }
  
  export function drawSky(ctx, W, H) {
    const sky = ctx.createLinearGradient(0, 0, 0, H);
    sky.addColorStop(0, '#7ec8ff'); sky.addColorStop(1, '#c7ecff');
    ctx.fillStyle = sky; ctx.fillRect(0, 0, W, H);
  }
  
  export function drawSFX(ctx, effects) {
    for (const e of effects) {
      if (e.kind === 'splat') {
        ctx.save(); ctx.globalAlpha = Math.max(0, e.alpha);
        ctx.strokeStyle = '#ef4444'; ctx.lineWidth = 6;
        ctx.beginPath(); ctx.arc(e.x, e.y, e.r, 0, Math.PI * 2); ctx.stroke(); ctx.restore();
      } else if (e.kind === 'pop') {
        const t = e.t; const alpha = 1 - Math.min(1, t / 0.7);
        ctx.save(); ctx.globalAlpha = alpha; ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 18px system-ui, -apple-system, Segoe UI, Roboto'; ctx.textAlign = 'center';
        ctx.fillText('+1', e.x, e.y - t * 40);
        ctx.restore();
      } else if (e.kind === 'slash') {
        // Quick white slash line with slight glow
        const life = Math.max(0, 1 - e.t / 0.18);
        const len = 120;
        const half = len * 0.5;
        ctx.save();
        ctx.translate(e.x, e.y);
        ctx.rotate(e.angle || 0);
        ctx.globalAlpha = life;
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 3 + 6 * life;
        ctx.beginPath();
        ctx.moveTo(-half, 0);
        ctx.lineTo(half, 0);
        ctx.stroke();
        // Red hue inner line
        ctx.strokeStyle = '#fecaca';
        ctx.lineWidth = 1.5 + 3 * life;
        ctx.beginPath(); ctx.moveTo(-half * 0.8, -1); ctx.lineTo(half * 0.8, 1); ctx.stroke();
        ctx.restore();
      }
    }
  }
  
  export function updateSFX(effects, dt) {
    for (let i = effects.length - 1; i >= 0; i--) {
      const e = effects[i];
      if (e.kind === 'splat') {
        e.r += 120 * dt; e.alpha -= dt * 0.8; if (e.alpha <= 0) effects.splice(i, 1);
      } else if (e.kind === 'pop') {
        e.t += dt; if (e.t > 0.7) effects.splice(i, 1);
      } else if (e.kind === 'slash') {
        e.t += dt; if (e.t > 0.18) effects.splice(i, 1);
      }
    }
  }
  
  export function addSFX(effects, x, y, kind, data) {
    if (kind === 'splat') effects.push({ kind, x, y, r: 4, maxR: 48, alpha: 0.9 });
    else if (kind === 'pop') effects.push({ kind, x, y, t: 0 });
    else if (kind === 'slash') effects.push({ kind, x, y, angle: data && data.angle ? data.angle : 0, t: 0 });
  }
  
  function rand(min, max) { return Math.random() * (max - min) + min; }
  