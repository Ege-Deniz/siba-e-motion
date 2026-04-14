/*
 * Hero reactive overlay — Siba E-Motion
 *
 * Sits on top of the first <video> in the document and paints a pointer-reactive
 * spotlight + soft ripples on a canvas with mix-blend-mode: screen. No WebGL,
 * no dependencies, no React. Respects prefers-reduced-motion.
 */
(function () {
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  if (prefersReducedMotion.matches) return;

  const MOUNT_RETRIES = 40;
  const RETRY_DELAY_MS = 150;
  const TRAIL_FADE = 0.12;
  const SPOT_RADIUS = 260;
  const SPOT_STRENGTH = 0.55;
  const RIPPLE_LIFETIME_MS = 900;

  let canvas = null;
  let ctx = null;
  let video = null;
  let wrapper = null;
  const ripples = [];
  const pointer = { x: -9999, y: -9999, tx: -9999, ty: -9999, active: false };

  function findHeroVideo() {
    return document.querySelector("video");
  }

  function mount(attempt) {
    video = findHeroVideo();
    if (!video) {
      if (attempt < MOUNT_RETRIES) {
        window.setTimeout(() => mount(attempt + 1), RETRY_DELAY_MS);
      }
      return;
    }

    const parent = video.parentElement;
    if (!parent) return;

    wrapper = parent;
    if (getComputedStyle(wrapper).position === "static") {
      wrapper.style.position = "relative";
    }

    canvas = document.createElement("canvas");
    canvas.setAttribute("data-siba-hero-canvas", "");
    canvas.style.cssText = [
      "position:absolute",
      "inset:0",
      "width:100%",
      "height:100%",
      "pointer-events:none",
      "mix-blend-mode:screen",
      "opacity:0.9",
      "z-index:2"
    ].join(";");
    wrapper.appendChild(canvas);
    ctx = canvas.getContext("2d");

    resize();
    window.addEventListener("resize", resize, { passive: true });
    window.addEventListener("scroll", resize, { passive: true });

    window.addEventListener("pointermove", onPointerMove, { passive: true });
    window.addEventListener("pointerdown", onPointerDown, { passive: true });
    window.addEventListener("pointerleave", onPointerLeave, { passive: true });

    requestAnimationFrame(frame);
  }

  function resize() {
    if (!canvas || !video) return;
    const rect = video.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.max(1, Math.round(rect.width * dpr));
    canvas.height = Math.max(1, Math.round(rect.height * dpr));
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function toLocal(clientX, clientY) {
    const rect = video.getBoundingClientRect();
    return { x: clientX - rect.left, y: clientY - rect.top };
  }

  function onPointerMove(event) {
    if (!video) return;
    const local = toLocal(event.clientX, event.clientY);
    pointer.tx = local.x;
    pointer.ty = local.y;
    if (!pointer.active) {
      pointer.x = local.x;
      pointer.y = local.y;
    }
    pointer.active = true;
  }

  function onPointerDown(event) {
    if (!video) return;
    const local = toLocal(event.clientX, event.clientY);
    const rect = video.getBoundingClientRect();
    if (local.x < 0 || local.y < 0 || local.x > rect.width || local.y > rect.height) return;
    ripples.push({ x: local.x, y: local.y, born: performance.now() });
    if (ripples.length > 16) ripples.shift();
  }

  function onPointerLeave() {
    pointer.active = false;
  }

  function frame() {
    if (!ctx || !canvas || !video) {
      requestAnimationFrame(frame);
      return;
    }

    const rect = video.getBoundingClientRect();
    const w = rect.width;
    const h = rect.height;

    ctx.globalCompositeOperation = "destination-out";
    ctx.fillStyle = "rgba(0,0,0," + TRAIL_FADE + ")";
    ctx.fillRect(0, 0, w, h);

    ctx.globalCompositeOperation = "source-over";

    pointer.x += (pointer.tx - pointer.x) * 0.12;
    pointer.y += (pointer.ty - pointer.y) * 0.12;

    if (pointer.active && pointer.x > -1000) {
      const grad = ctx.createRadialGradient(
        pointer.x, pointer.y, 0,
        pointer.x, pointer.y, SPOT_RADIUS
      );
      grad.addColorStop(0, "rgba(255,255,255," + SPOT_STRENGTH + ")");
      grad.addColorStop(0.4, "rgba(166,218,255,0.18)");
      grad.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);
    }

    const now = performance.now();
    for (let i = ripples.length - 1; i >= 0; i--) {
      const r = ripples[i];
      const age = now - r.born;
      if (age > RIPPLE_LIFETIME_MS) {
        ripples.splice(i, 1);
        continue;
      }
      const t = age / RIPPLE_LIFETIME_MS;
      const radius = 30 + t * 320;
      const alpha = (1 - t) * 0.55;
      ctx.strokeStyle = "rgba(255,255,255," + alpha.toFixed(3) + ")";
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.arc(r.x, r.y, radius, 0, Math.PI * 2);
      ctx.stroke();
    }

    requestAnimationFrame(frame);
  }

  if (document.readyState === "complete" || document.readyState === "interactive") {
    mount(0);
  } else {
    window.addEventListener("DOMContentLoaded", () => mount(0), { once: true });
  }
})();
