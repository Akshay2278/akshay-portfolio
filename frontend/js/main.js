// ============ Config ============
// If the frontend is served by the backend (npm start in /backend), same-origin
// works and this can stay empty. If you host the frontend separately (e.g. a
// static host), set this to your backend's full URL, e.g. "https://your-api.com".
const API_BASE_URL = "https://akshay-portfolio-api.vercel.app";

// ============ Preloader ============
const preloader = document.getElementById("preloader");
const preloaderCount = document.getElementById("preloaderCount");
const preloaderBarFill = document.getElementById("preloaderBarFill");

if (preloader) {
  document.body.classList.add("preload-lock");

  let count = 0;
  const duration = 1400;
  const start = performance.now();

  function tick(now) {
    const elapsed = now - start;
    count = Math.min(100, Math.round((elapsed / duration) * 100));
    preloaderCount.textContent = String(count).padStart(2, "0");
    preloaderBarFill.style.width = count + "%";

    if (count < 100) {
      requestAnimationFrame(tick);
    } else {
      setTimeout(() => {
        preloader.classList.add("preloader-exit");
        document.body.classList.remove("preload-lock");
        preloader.addEventListener("transitionend", () => preloader.remove(), { once: true });
      }, 250);
    }
  }
  requestAnimationFrame(tick);
}

// ============ Shatter / crack / rebuild / shine effect (hero photo card) ============
function initShatterEffect(cardId, gridId, cracksId, shineId, cols, rows) {
  const card = document.getElementById(cardId);
  const grid = document.getElementById(gridId);
  const cracksSvg = document.getElementById(cracksId);
  const shine = document.getElementById(shineId);
  if (!card || !grid || !cracksSvg || !shine) return;

  grid.style.display = "grid";
  grid.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
  grid.style.gridTemplateRows = `repeat(${rows}, 1fr)`;

  const W = card.clientWidth || 260;
  const H = card.clientHeight || 320;
  const pieceW = W / cols;
  const pieceH = H / rows;

  // Try the real photo first; if it fails to load, fall back to a generated
  // placeholder so the effect still works before a real photo is added.
  const realSrc = card.dataset.photoSrc;
  const placeholderSvg =
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}">` +
    `<rect width="${W}" height="${H}" fill="%23D9D9D6"/>` +
    `<circle cx="${W / 2}" cy="${H * 0.36}" r="${H * 0.15}" fill="%236B6B68"/>` +
    `<path d="M${W * 0.17} ${H * 0.92}c0-${H * 0.19} ${W * 0.33}-${H * 0.28} ${W * 0.33}-${H * 0.28}s${W * 0.33} ${H * 0.09} ${W * 0.33} ${H * 0.28}" fill="%236B6B68"/>` +
    `</svg>`;
  const placeholderUrl = "data:image/svg+xml," + encodeURIComponent(placeholderSvg);

  function buildPieces(imageUrl) {
    grid.innerHTML = "";
    const pieces = [];
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const p = document.createElement("div");
        p.className = "photo-piece";
        p.style.backgroundImage = `url("${imageUrl}")`;
        p.style.backgroundSize = `${W}px ${H}px`;
        p.style.backgroundPosition = `${-c * pieceW}px ${-r * pieceH}px`;
        // No clip-path here — pieces stay as perfect rectangles at rest so
        // the photo looks completely intact until clicked. The jagged shard
        // shape only gets applied at the moment of shattering (see below).

        const cx = c - (cols - 1) / 2;
        const cy = r - (rows - 1) / 2;
        p.dataset.cx = cx;
        p.dataset.cy = cy;
        p.dataset.dist = Math.sqrt(cx * cx + cy * cy);
        grid.appendChild(p);
        pieces.push(p);
      }
    }
    return pieces;
  }

  let pieces = buildPieces(placeholderUrl);
  if (realSrc) {
    const test = new Image();
    test.onload = () => { pieces = buildPieces(realSrc); };
    test.src = realSrc;
  }

  function jaggedShardClip() {
    const jitter = () => Math.random() * 10 - 5;
    const clamp = (v) => Math.max(0, Math.min(100, v));
    const pts = [
      `${clamp(0 + jitter())}% ${clamp(0 + jitter())}%`,
      `${clamp(100 + jitter())}% ${clamp(0 + jitter())}%`,
      `${clamp(100 + jitter())}% ${clamp(100 + jitter())}%`,
      `${clamp(0 + jitter())}% ${clamp(100 + jitter())}%`,
    ];
    return `polygon(${pts.join(",")})`;
  }
  const RECT_CLIP = "polygon(0% 0%,100% 0%,100% 100%,0% 100%)";

  function buildCracks() {
    while (cracksSvg.firstChild) cracksSvg.removeChild(cracksSvg.firstChild);
    const cx = 50 + (Math.random() * 20 - 10);
    const cy = 50 + (Math.random() * 20 - 10);
    const endpoints = [];
    const n = 7;
    for (let i = 0; i < n; i++) {
      const angle = (i / n) * Math.PI * 2 + Math.random() * 0.4;
      const len = 45 + Math.random() * 25;
      const ex = cx + Math.cos(angle) * len;
      const ey = cy + Math.sin(angle) * len;
      endpoints.push([ex, ey]);
      const mx = cx + Math.cos(angle) * len * 0.5 + (Math.random() * 10 - 5);
      const my = cy + Math.sin(angle) * len * 0.5 + (Math.random() * 10 - 5);
      const line = document.createElementNS("http://www.w3.org/2000/svg", "polyline");
      line.setAttribute("points", `${cx},${cy} ${mx},${my} ${ex},${ey}`);
      line.setAttribute("fill", "none");
      line.setAttribute("stroke", "rgba(20,20,20,0.55)");
      line.setAttribute("stroke-width", "0.6");
      cracksSvg.appendChild(line);
    }
    for (let j = 0; j < endpoints.length; j++) {
      const a = endpoints[j];
      const b = endpoints[(j + 2) % endpoints.length];
      const cl = document.createElementNS("http://www.w3.org/2000/svg", "line");
      cl.setAttribute("x1", a[0]); cl.setAttribute("y1", a[1]);
      cl.setAttribute("x2", b[0]); cl.setAttribute("y2", b[1]);
      cl.setAttribute("stroke", "rgba(20,20,20,0.35)");
      cl.setAttribute("stroke-width", "0.4");
      cracksSvg.appendChild(cl);
    }
  }

  let animating = false;

  grid.addEventListener("click", () => {
    if (animating) return;
    animating = true;
    shine.style.left = "-40%";
    shine.classList.remove("shine-run");

    // Phase 1: crack flashes across the still-intact photo.
    buildCracks();
    cracksSvg.style.transition = "opacity 0.12s ease";
    cracksSvg.style.opacity = "1";

    setTimeout(() => {
      // Phase 2: shatter — shards fly out fast and far, fading completely to
      // nothing so the card is genuinely empty during the hold.
      cracksSvg.style.transition = "opacity 0.3s ease";
      cracksSvg.style.opacity = "0";

      const maxDist = Math.max(...pieces.map((p) => parseFloat(p.dataset.dist)));
      const flownTo = [];

      pieces.forEach((p) => {
        // Switch from a perfect rectangle to a jagged shard shape right as
        // it breaks — this is the only point the crack/gap look appears.
        p.style.clipPath = jaggedShardClip();

        const cx = parseFloat(p.dataset.cx);
        const cy = parseFloat(p.dataset.cy);
        const dist = parseFloat(p.dataset.dist);
        const falloutDelay = (dist / maxDist) * 0.1 + Math.random() * 0.05;
        const dx = cx * (60 + Math.random() * 70) + (Math.random() - 0.5) * 60;
        const dy = cy * (50 + Math.random() * 60) + 140 + Math.random() * 100;
        const rot = (Math.random() - 0.5) * 320 + cx * 40;
        flownTo.push({ dx, dy, rot });

        p.style.transition =
          `transform 0.75s cubic-bezier(0.55,0.06,0.86,0.36) ${falloutDelay}s,` +
          `opacity 0.6s ease ${falloutDelay}s`;
        p.style.transform = `translate(${dx}px,${dy}px) rotate(${rot}deg) scale(0.7)`;
        p.style.opacity = "0";
      });

      // Phase 3: hold empty for 2 seconds, then rebuild slowly (~5s) in a
      // randomized piece order for a natural, non-mechanical reassembly.
      setTimeout(() => {
        const order = pieces.map((_, i) => i).sort(() => Math.random() - 0.5);
        order.forEach((idx, i) => {
          const p = pieces[idx];
          const f = flownTo[idx];
          p.style.transition = "none";
          p.style.transform = `translate(${f.dx}px,${f.dy}px) rotate(${f.rot}deg) scale(0.7)`;
          p.style.opacity = "0";
          void p.offsetWidth;
          const delay = (i / order.length) * 4.2;
          p.style.transition =
            `transform 1s cubic-bezier(0.16,1,0.3,1) ${delay}s,` +
            `opacity 0.8s ease ${delay}s`;
          p.style.transform = "translate(0px,0px) rotate(0deg) scale(1)";
          p.style.opacity = "1";
        });

        const rebuildTotal = 4.2 + 1.0;
        // Phase 4: once fully rebuilt, snap back to seamless rectangles
        // (removing the jagged shard shape) and play the shine sweep.
        setTimeout(() => {
          pieces.forEach((p) => { p.style.clipPath = RECT_CLIP; });
          shine.style.opacity = "1";
          shine.classList.add("shine-run");
          setTimeout(() => { animating = false; }, 1700);
        }, rebuildTotal * 1000);
      }, 2000);
    }, 380);
  });
}
initShatterEffect("heroPhotoCard", "heroPieceGrid", "heroCracks", "heroShineOverlay", 5, 6);

// ============ Floating photo card tilt effect ============
function initPhotoTilt() {
  document.querySelectorAll(".photo-card-inner").forEach((card) => {
    card.addEventListener("mousemove", (e) => {
      const rect = card.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      const tiltX = y * -14;
      const tiltY = x * 14;
      const liftX = x * 10;
      const liftY = y * 10;
      card.style.transform =
        `translate(${liftX}px, ${liftY}px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) translateZ(10px)`;
    });
    card.addEventListener("mouseleave", () => {
      card.style.transform = "translate(0px, 0px) rotateX(0deg) rotateY(0deg) translateZ(0px)";
    });
  });
}
initPhotoTilt();

// ============ Nav toggle (mobile) ============
const navToggle = document.getElementById("navToggle");
const navLinks = document.querySelector(".nav-links");

if (navToggle && navLinks) {
  navToggle.addEventListener("click", () => {
    const isOpen = navLinks.classList.toggle("open");
    navToggle.setAttribute("aria-expanded", String(isOpen));
  });
  navLinks.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      navLinks.classList.remove("open");
      navToggle.setAttribute("aria-expanded", "false");
    });
  });
}

// ============ Fade in/out on scroll (repeats every time, both directions) ============
const fadeTargets = document.querySelectorAll(".fade-target");

if ("IntersectionObserver" in window) {
  const fadeObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
        } else {
          entry.target.classList.remove("is-visible");
        }
      });
    },
    { threshold: 0.15, rootMargin: "0px 0px -60px 0px" }
  );
  fadeTargets.forEach((el) => fadeObserver.observe(el));
} else {
  // Fallback: just show everything if IntersectionObserver isn't supported.
  fadeTargets.forEach((el) => el.classList.add("is-visible"));
}

// ============ Chatbot widget ============
const chatForm = document.getElementById("chatForm");
const chatInput = document.getElementById("chatInput");
const chatLog = document.getElementById("chatLog");

function appendMessage(text, sender) {
  const msg = document.createElement("div");
  msg.className = `chat-msg chat-msg-${sender}`;

  const tag = document.createElement("span");
  tag.className = "chat-tag";
  tag.textContent = sender === "user" ? "you" : "akshay-bot";

  const body = document.createElement("span");
  body.textContent = text;

  msg.appendChild(tag);
  msg.appendChild(body);
  chatLog.appendChild(msg);
  chatLog.scrollTop = chatLog.scrollHeight;
  return msg;
}

async function sendMessage(message) {
  try {
    const res = await fetch(`${API_BASE_URL}/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message }),
    });
    if (!res.ok) throw new Error(`Server responded ${res.status}`);
    const data = await res.json();
    return data.reply;
  } catch (err) {
    console.error("Chat request failed:", err);
    return "I couldn't reach the backend just now. Make sure the backend server is running (npm start in /backend), then try again.";
  }
}

if (chatForm) {
  chatForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const text = chatInput.value.trim();
    if (!text) return;

    appendMessage(text, "user");
    chatInput.value = "";
    chatInput.disabled = true;

    const thinking = appendMessage("...", "bot");
    const reply = await sendMessage(text);
    thinking.querySelector("span:last-child").textContent = reply;
    chatLog.scrollTop = chatLog.scrollHeight;

    chatInput.disabled = false;
    chatInput.focus();
  });
}
