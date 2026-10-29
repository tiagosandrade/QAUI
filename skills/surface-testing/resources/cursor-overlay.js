/**
 * QAUI — Universal Visual Cursor, Click Ripple, Target Highlighter & Live HUD
 * Project-agnostic browser overlay for Antigravity MCP & Playwright sessions.
 * License: MIT
 */
(() => {
  if (window.__QAUI_OVERLAY_ACTIVE__) {
    return window.__QAUI;
  }
  window.__QAUI_OVERLAY_ACTIVE__ = true;

  const SPEED_PROFILES = {
    slow: { glideMs: 1350, hoverPauseMs: 850, postPauseMs: 1200, charDelayMs: 240 },
    normal: { glideMs: 520, hoverPauseMs: 320, postPauseMs: 550, charDelayMs: 85 },
    fast: { glideMs: 220, hoverPauseMs: 100, postPauseMs: 220, charDelayMs: 30 },
    instant: { glideMs: 0, hoverPauseMs: 0, postPauseMs: 0, charDelayMs: 0 },
  };

  const state = {
    speed: 'normal',
    x: Math.round((window.innerWidth || 1280) * 0.5),
    y: Math.round((window.innerHeight || 800) * 0.45),
    runtimeErrors: [],
    consoleErrors: [],
  };

  // Capture uncaught JS exceptions & unhandled promise rejections passively
  window.addEventListener('error', (ev) => {
    state.runtimeErrors.push({
      type: 'error',
      message: ev.message || String(ev.error || 'Unknown error'),
      source: ev.filename || '',
      line: ev.lineno || 0,
      timestamp: new Date().toISOString(),
    });
  });

  window.addEventListener('unhandledrejection', (ev) => {
    state.runtimeErrors.push({
      type: 'unhandledrejection',
      message: String(ev.reason?.message || ev.reason || 'Unhandled rejection'),
      timestamp: new Date().toISOString(),
    });
  });

  function mountDOM() {
    if (!document.body || document.getElementById('__qaui_root__')) return;

    const style = document.createElement('style');
    style.id = '__qaui_styles__';
    style.textContent = `
      #__qaui_root__ {
        position: fixed;
        top: 0;
        left: 0;
        width: 0;
        height: 0;
        z-index: 2147483647;
        pointer-events: none;
        transform: translate3d(${state.x}px, ${state.y}px, 0);
        will-change: transform;
      }
      #__qaui_halo__ {
        position: absolute;
        top: -22px;
        left: -22px;
        width: 44px;
        height: 44px;
        border-radius: 50%;
        background: rgba(255, 45, 85, 0.22);
        border: 2.5px solid rgba(255, 45, 85, 0.85);
        box-shadow: 0 0 18px rgba(255, 45, 85, 0.6);
        transition: transform 0.14s ease, background 0.14s ease;
      }
      #__qaui_svg__ {
        position: absolute;
        top: -3px;
        left: -3px;
        width: 42px;
        height: 42px;
        filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.65));
        transform-origin: 4px 4px;
        transition: transform 0.12s ease;
      }
      #__qaui_root__.qaui-clicking #__qaui_svg__ {
        transform: scale(0.8);
      }
      #__qaui_root__.qaui-clicking #__qaui_halo__ {
        transform: scale(0.72);
        background: rgba(255, 45, 85, 0.58);
      }
      .__qaui_ripple__ {
        position: fixed;
        width: 18px;
        height: 18px;
        margin-left: -9px;
        margin-top: -9px;
        border-radius: 50%;
        border: 3.5px solid #ff2d55;
        background: rgba(255, 45, 85, 0.26);
        z-index: 2147483646;
        pointer-events: none;
        animation: __qaui_ripple_kf__ 0.78s cubic-bezier(0.16, 1, 0.3, 1) forwards;
      }
      @keyframes __qaui_ripple_kf__ {
        0% { transform: scale(0.45); opacity: 1; }
        100% { transform: scale(5.2); opacity: 0; }
      }
      #__qaui_hud__ {
        position: fixed;
        bottom: 24px;
        right: 24px;
        z-index: 2147483646;
        pointer-events: none;
        background: rgba(15, 19, 30, 0.94);
        color: #ffffff;
        font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
        font-size: 14.5px;
        font-weight: 600;
        padding: 12px 18px;
        border-radius: 12px;
        border: 1.8px solid #ff2d55;
        box-shadow: 0 10px 28px rgba(0, 0, 0, 0.45);
        display: flex;
        align-items: center;
        gap: 10px;
        max-width: 480px;
      }
      #__qaui_dot__ {
        width: 10px;
        height: 10px;
        border-radius: 50%;
        background: #ff2d55;
        box-shadow: 0 0 10px #ff2d55;
        flex-shrink: 0;
      }
      #__qaui_hud__[data-tone="pass"] { border-color: #00d68f; }
      #__qaui_hud__[data-tone="pass"] #__qaui_dot__ { background: #00d68f; box-shadow: 0 0 10px #00d68f; }
      #__qaui_hud__[data-tone="warn"] { border-color: #ffb800; }
      #__qaui_hud__[data-tone="warn"] #__qaui_dot__ { background: #ffb800; box-shadow: 0 0 10px #ffb800; }
      .__qaui_highlight__ {
        outline: 3px solid #ff2d55 !important;
        outline-offset: 4px !important;
        box-shadow: 0 0 20px rgba(255, 45, 85, 0.45) !important;
        transition: outline 0.18s ease, box-shadow 0.18s ease !important;
      }
    `;
    document.head.appendChild(style);

    const root = document.createElement('div');
    root.id = '__qaui_root__';
    root.innerHTML = `
      <div id="__qaui_halo__"></div>
      <svg id="__qaui_svg__" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
        <path d="M3 2 L3 26 L9.5 19.8 L14.5 29.5 L19 27.2 L14 17.8 L23 17.8 Z"
              fill="#ff2d55"
              stroke="#ffffff"
              stroke-width="2.4"
              stroke-linejoin="round" />
      </svg>
    `;
    document.body.appendChild(root);

    const hud = document.createElement('div');
    hud.id = '__qaui_hud__';
    hud.dataset.tone = 'info';
    hud.innerHTML = `<span id="__qaui_dot__"></span><span id="__qaui_text__">QAUI Surface Testing ativo</span>`;
    document.body.appendChild(hud);
  }

  function setCursorPos(x, y, transitionMs = 0) {
    mountDOM();
    state.x = x;
    state.y = y;
    const root = document.getElementById('__qaui_root__');
    if (!root) return;
    root.style.transition = transitionMs > 0 ? `transform ${transitionMs}ms cubic-bezier(0.25, 1, 0.5, 1)` : 'none';
    root.style.transform = `translate3d(${x}px, ${y}px, 0)`;
  }

  function spawnRipple(x, y) {
    mountDOM();
    const ripple = document.createElement('div');
    ripple.className = '__qaui_ripple__';
    ripple.style.left = `${x}px`;
    ripple.style.top = `${y}px`;
    document.body.appendChild(ripple);
    setTimeout(() => ripple.remove(), 820);
  }

  function setStatus(text, tone = 'info') {
    mountDOM();
    const hud = document.getElementById('__qaui_hud__');
    const txt = document.getElementById('__qaui_text__');
    if (hud) hud.dataset.tone = tone;
    if (txt) txt.textContent = text;
  }

  // Native passive listeners so standard MCP click/hover/type tools automatically animate the cursor!
  window.addEventListener(
    'mousemove',
    (e) => {
      if (!window.__qauiGliding) {
        setCursorPos(e.clientX, e.clientY, 0);
      }
    },
    { passive: true, capture: true }
  );

  window.addEventListener(
    'mousedown',
    (e) => {
      mountDOM();
      const root = document.getElementById('__qaui_root__');
      if (root) root.classList.add('qaui-clicking');
      spawnRipple(e.clientX || state.x, e.clientY || state.y);
    },
    { passive: true, capture: true }
  );

  window.addEventListener(
    'mouseup',
    () => {
      const root = document.getElementById('__qaui_root__');
      if (root) root.classList.remove('qaui-clicking');
    },
    { passive: true, capture: true }
  );

  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

  function resolveTarget(target) {
    if (!target) return null;
    if (typeof target === 'string') return document.querySelector(target);
    return target;
  }

  async function focusTarget(target, label = 'elemento', customSpeed = null) {
    mountDOM();
    const el = resolveTarget(target);
    if (!el) return { ok: false, error: `Target not found: ${label}` };

    const profile = SPEED_PROFILES[customSpeed || state.speed] || SPEED_PROFILES.normal;

    const rect0 = el.getBoundingClientRect();
    if (rect0.top < 90 || rect0.bottom > window.innerHeight - 90) {
      el.scrollIntoView({ behavior: profile.glideMs > 0 ? 'smooth' : 'auto', block: 'center' });
      if (profile.glideMs > 0) await sleep(Math.min(600, profile.glideMs));
    }

    document.querySelectorAll('.__qaui_highlight__').forEach((n) => n.classList.remove('__qaui_highlight__'));
    el.classList.add('__qaui_highlight__');

    const r = el.getBoundingClientRect();
    const tx = Math.round(r.left + Math.min(r.width * 0.45, Math.max(20, r.width / 2)));
    const ty = Math.round(r.top + r.height / 2);

    setStatus(`Movendo até ${label}...`, 'info');
    window.__qauiGliding = true;
    setCursorPos(tx, ty, profile.glideMs);
    if (profile.glideMs > 0) await sleep(profile.glideMs);
    window.__qauiGliding = false;

    if (profile.hoverPauseMs > 0) {
      setStatus(`Foco em ${label}`, 'info');
      await sleep(profile.hoverPauseMs);
    }

    return { ok: true, x: tx, y: ty, profile };
  }

  async function clickTarget(target, label = 'elemento', customSpeed = null) {
    const el = resolveTarget(target);
    if (!el) return { ok: false, error: `Target not found: ${label}` };

    const res = await focusTarget(el, label, customSpeed);
    if (!res.ok) return res;

    setStatus(`Clicando em ${label}`, 'info');
    const root = document.getElementById('__qaui_root__');
    if (root) root.classList.add('qaui-clicking');
    spawnRipple(res.x, res.y);
    await sleep(160);
    if (root) root.classList.remove('qaui-clicking');
    el.classList.remove('__qaui_highlight__');

    el.click();
    if (res.profile.postPauseMs > 0) await sleep(res.profile.postPauseMs);
    return { ok: true, x: res.x, y: res.y };
  }

  function setNativeValue(el, value) {
    const proto = el instanceof HTMLTextAreaElement ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype;
    const desc = Object.getOwnPropertyDescriptor(proto, 'value');
    if (desc && desc.set) {
      desc.set.call(el, value);
    } else {
      el.value = value;
    }
    el.dispatchEvent(new Event('input', { bubbles: true }));
    el.dispatchEvent(new Event('change', { bubbles: true }));
  }

  async function typeIntoTarget(target, text, { label = 'campo', clearFirst = true, speed = null } = {}) {
    const el = resolveTarget(target);
    if (!el) return { ok: false, error: `Input not found: ${label}` };

    const res = await focusTarget(el, label, speed);
    if (!res.ok) return res;

    el.focus();
    spawnRipple(res.x, res.y);

    if (clearFirst && el.value) {
      setStatus(`Limpando ${label}...`, 'info');
      setNativeValue(el, '');
      if (res.profile.hoverPauseMs > 0) await sleep(Math.min(400, res.profile.hoverPauseMs));
    }

    if (res.profile.charDelayMs === 0) {
      setNativeValue(el, text);
    } else {
      let current = el.value || '';
      for (const ch of String(text)) {
        current += ch;
        setNativeValue(el, current);
        setStatus(`Digitando em ${label}: "${current}"`, 'info');
        await sleep(res.profile.charDelayMs);
      }
    }

    el.classList.remove('__qaui_highlight__');
    if (res.profile.postPauseMs > 0) await sleep(res.profile.postPauseMs);
    return { ok: true, value: el.value };
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', mountDOM);
  } else {
    mountDOM();
  }

  window.__QAUI = {
    setSpeed(mode) {
      if (SPEED_PROFILES[mode]) state.speed = mode;
      setStatus(`Velocidade: ${state.speed}`, 'info');
      return state.speed;
    },
    setStatus,
    setCursorPos,
    spawnRipple,
    focusTarget,
    clickTarget,
    typeIntoTarget,
    getErrors: () => ({
      runtimeErrors: state.runtimeErrors,
      consoleErrors: state.consoleErrors,
    }),
  };

  return window.__QAUI;
})();
