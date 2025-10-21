// ===============================
// Util: helper seguro para addEventListener (opcional)
// ===============================
function on(el, evt, handler, opts = { passive: true }) {
  if (el) el.addEventListener(evt, handler, opts);
}

// ===============================
// Carrossel de depoimentos (A11y) — escopado ao container
// ===============================
(function initTestimonialsCarousel() {
  const area = document.querySelector(".testimonial-carousel");
  if (!area) return;

  const items = Array.from(area.querySelectorAll(".testimonial"));
  const prevBtn = area.querySelector(".prev");
  const nextBtn = area.querySelector(".next");
  if (!items.length || !prevBtn || !nextBtn) return;

  let current = 0;

  // Região viva (polite)
  let live = document.querySelector("#testimonial-live");
  if (!live) {
    live = document.createElement("div");
    live.id = "testimonial-live";
    live.setAttribute("aria-live", "polite");
    live.setAttribute("aria-atomic", "true");
    Object.assign(live.style, {
      position: "absolute", width: "1px", height: "1px",
      overflow: "hidden", clip: "rect(1px, 1px, 1px, 1px)"
    });
    document.body.appendChild(live);
  }

  function updateLiveRegion(index) {
    const total = items.length;
    const nameEl = items[index].querySelector(".testimonial-name");
    const name = nameEl ? nameEl.textContent.trim() : `Depoimento ${index + 1}`;
    live.textContent = `${name} — item ${index + 1} de ${total}`;
  }

  function show(index, { focus = false } = {}) {
    items.forEach((t, i) => {
      const isActive = i === index;
      t.classList.toggle("active", isActive);
      t.setAttribute("aria-hidden", isActive ? "false" : "true");
      t.tabIndex = isActive ? 0 : -1;
    });
    updateLiveRegion(index);
    if (focus) {
      const focusable = items[index].querySelector("h3, p, a, button") || items[index];
      focusable.focus({ preventScroll: true });
    }
  }

  prevBtn.addEventListener("click", () => {
    current = (current - 1 + items.length) % items.length;
    show(current);
  }, { passive: true });

  nextBtn.addEventListener("click", () => {
    current = (current + 1) % items.length;
    show(current);
  }, { passive: true });

  // Teclado nas setas
  [prevBtn, nextBtn].forEach(btn => {
    btn.addEventListener("keydown", (e) => {
      if (e.key === "ArrowLeft") prevBtn.click();
      if (e.key === "ArrowRight") nextBtn.click();
    }, { passive: true });
  });

  // Inicia
  show(current);
})();

// ===============================
// Swipe com proteção a elementos interativos e hooks para autoplay
// ===============================
(function enableTestimonialSwipe() {
  const area = document.querySelector(".testimonial-carousel");
  if (!area) return;

  let startX = 0, startY = 0, deltaX = 0, deltaY = 0, swiping = false, lockedAxis = null;
  const THRESHOLD = 50;   // px para considerar swipe
  const ANGLE_LOCK = 10;  // px para decidir eixo

  // Se você tiver autoplay, conecte aqui
  const stopAuto = () => { /* pare seu timer aqui, se existir */ };
  const startAuto = () => { /* reinicie seu timer aqui, se existir */ };

  function isInteractive(el) {
    return !!el.closest("a, button, input, textarea, select, [role='button']");
  }

  function onStart(e) {
    const target = e.target;
    if (isInteractive(target)) return; // não interceptar cliques

    const t = e.touches ? e.touches[0] : e;
    startX = t.clientX; startY = t.clientY;
    deltaX = 0; deltaY = 0;
    swiping = true; lockedAxis = null;
    stopAuto();
  }

  function onMove(e) {
    if (!swiping) return;
    const t = e.touches ? e.touches[0] : e;
    deltaX = t.clientX - startX;
    deltaY = t.clientY - startY;

    if (lockedAxis == null) {
      if (Math.abs(deltaX) > Math.abs(deltaY) + ANGLE_LOCK) lockedAxis = "x";
      else if (Math.abs(deltaY) > Math.abs(deltaX) + ANGLE_LOCK) lockedAxis = "y";
    }
    if (lockedAxis === "x") e.preventDefault(); // precisa passive:false
  }

  function onEnd() {
    if (!swiping) return;
    swiping = false;

    if (lockedAxis === "x" && Math.abs(deltaX) > THRESHOLD) {
      const prev = area.querySelector(".prev");
      const next = area.querySelector(".next");
      if (deltaX < 0 && next) next.click(); // esquerda -> próximo
      if (deltaX > 0 && prev) prev.click(); // direita -> anterior
    }
    startX = startY = deltaX = deltaY = 0;
    lockedAxis = null;
    startAuto();
  }

  // Touch
  area.addEventListener("touchstart", onStart, { passive: true });
  area.addEventListener("touchmove", onMove, { passive: false }); // iOS precisa de false p/ preventDefault
  area.addEventListener("touchend", onEnd, { passive: true });
  area.addEventListener("touchcancel", onEnd, { passive: true });

  // Pointer (touchpads/stylus)
  area.addEventListener("pointerdown", onStart, { passive: true });
  area.addEventListener("pointermove", onMove, { passive: false });
  area.addEventListener("pointerup", onEnd, { passive: true });
  area.addEventListener("pointercancel", onEnd, { passive: true });
})();

// ===============================
// Remoção de código órfão (opcional)
// ===============================
(function initBonusTags() {
  const tags = document.querySelectorAll(".bonus-tags span");
  if (!tags.length) return;
  tags.forEach(tag => on(tag, "click", () => alert(`Você clicou em: ${tag.textContent}`)));
})();

// ===============================
// FAQ - Acordeão acessível (único)
// ===============================
document.addEventListener("DOMContentLoaded", () => {
  const faq = document.querySelector(".faq");
  if (!faq) return;

  // Normaliza ids/ARIA
  faq.querySelectorAll(".accordion-item").forEach((item, idx) => {
    const btn = item.querySelector(".accordion-button");
    const panel = item.querySelector(".accordion-content");
    if (!btn || !panel) return;
    if (!btn.id) btn.id = `faq-btn-${idx + 1}`;
    if (!panel.id) panel.id = `faq-panel-${idx + 1}`;
    btn.setAttribute("aria-controls", panel.id);
    btn.setAttribute("aria-expanded", btn.getAttribute("aria-expanded") || "false");
    panel.setAttribute("role", "region");
    panel.setAttribute("aria-labelledby", btn.id);
    panel.hidden = true;
    panel.classList.remove("show");
  });

  function closeAll() {
    faq.querySelectorAll(".accordion-button[aria-expanded='true']").forEach(b => b.setAttribute("aria-expanded","false"));
    faq.querySelectorAll(".accordion-content").forEach(p => { p.hidden = true; p.classList.remove("show"); });
  }

  faq.addEventListener("click", (e) => {
    const btn = e.target.closest(".accordion-button");
    if (!btn) return;
    const panel = document.getElementById(btn.getAttribute("aria-controls"));
    if (!panel) return;

    const open = btn.getAttribute("aria-expanded") === "true";
    if (open) {
      btn.setAttribute("aria-expanded","false");
      panel.hidden = true;
      panel.classList.remove("show");
    } else {
      closeAll();
      btn.setAttribute("aria-expanded","true");
      panel.hidden = false;
      requestAnimationFrame(() => panel.classList.add("show"));
    }
  }, { passive: true });

  // Navegação por teclado
  faq.addEventListener("keydown", (e) => {
    const btn = e.target.closest(".accordion-button");
    if (!btn) return;
    const buttons = Array.from(faq.querySelectorAll(".accordion-button"));
    const i = buttons.indexOf(btn);
    if (e.key === "ArrowDown") { e.preventDefault(); buttons[Math.min(i + 1, buttons.length - 1)].focus(); }
    if (e.key === "ArrowUp")   { e.preventDefault(); buttons[Math.max(i - 1, 0)].focus(); }
    if (e.key === "Home")      { e.preventDefault(); buttons[0].focus(); }
    if (e.key === "End")       { e.preventDefault(); buttons[buttons.length - 1].focus(); }
  }, { passive: false });
});

