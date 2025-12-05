const matrixCanvas = document.getElementById("matrixBg");
const mCtx = matrixCanvas.getContext("2d");

let matrixCols, matrixDrops;
let fontSize = 18;

function resizeMatrix() {
  matrixCanvas.width = window.innerWidth;
  matrixCanvas.height = window.innerHeight;
  matrixCols = Math.floor(matrixCanvas.width / fontSize);
  matrixDrops = Array(matrixCols).fill(1);
}
window.addEventListener("resize", resizeMatrix);
resizeMatrix();

const letters =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789あいうえおかきくけこ".split("");

const particles = [];

function createParticle(x, y, color) {
  particles.push({
    x,
    y,
    vx: (Math.random() - 0.5) * 3,
    vy: (Math.random() - 1.5) * 3,
    life: 60,
    color,
  });
}

function drawMatrix() {
  mCtx.fillStyle = "rgba(0,0,0,0.05)";
  mCtx.fillRect(0, 0, matrixCanvas.width, matrixCanvas.height);

  mCtx.fillStyle = "#00ff00";
  mCtx.font = fontSize + "px monospace";

  matrixDrops.forEach((y, i) => {
    const text = letters[Math.floor(Math.random() * letters.length)];
    mCtx.fillText(text, i * fontSize, y * fontSize);

    if (y * fontSize > matrixCanvas.height && Math.random() > 0.975) {
      matrixDrops[i] = 0;
    }
    matrixDrops[i]++;
  });

  // draw particles
  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];
    mCtx.fillStyle = p.color;
    mCtx.fillText(
      letters[Math.floor(Math.random() * letters.length)],
      p.x,
      p.y
    );
    p.x += p.vx;
    p.y += p.vy;
    p.life--;
    if (p.life <= 0) particles.splice(i, 1);
  }

  requestAnimationFrame(drawMatrix);
}

drawMatrix();

// INFO/NUIT easter egg: create particle burst
function triggerMatrixEasterEgg() {
  for (let i = 0; i < 50; i++) {
    const x = Math.random() * matrixCanvas.width;
    const y = Math.random() * matrixCanvas.height;
    const color = `rgb(0,${150 + Math.random() * 105},0)`;
    createParticle(x, y, color);
  }
}

function triggerGloryMatrix() {
  for (let i = 0; i < 80; i++) {
    const x = Math.random() * matrixCanvas.width;
    const y = Math.random() * matrixCanvas.height;
    createParticle(
      x,
      y,
      `rgb(${200 + Math.random() * 55},${180 + Math.random() * 75},0)`
    );
  }
}

matrixCanvas.addEventListener("mousemove", (e) => {
  createParticle(e.clientX, e.clientY, "#00ff00");
});
function triggerMatrixEasterEgg() {
  // Highlight some random falling characters in bright green
  if (!matrixBg.particles) return;

  for (let i = 0; i < 50; i++) {
    const idx = Math.floor(Math.random() * matrixBg.particles.length);
    matrixBg.particles[idx].color = "#00ff00"; // bright green
    matrixBg.particles[idx].flash = 5; // number of frames to stay bright
  }

  // Optional: play a quick sound sequence
  SoundManager.notes([880, 1046, 1318]);
}

function triggerGaIn() {
  triggerMatrixEasterEgg(); // add visual effect
}

function turnAlertGolden() {
  triggerGloryMatrix(); // golden matrix effect
}

// ---- Utilities & SoundManager ----
const SoundManager = (() => {
  const ctx = new (window.AudioContext || window.webkitAudioContext)();
  function beep(freq = 440, dur = 0.06, type = "sine", volume = 0.06) {
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = type;
    o.frequency.value = freq;
    g.gain.value = volume;
    o.connect(g);
    g.connect(ctx.destination);
    o.start();
    o.stop(ctx.currentTime + dur);
  }
  function notes(nums) {
    nums.forEach((n, i) =>
      setTimeout(() => beep(n, 0.08, "square", 0.06), i * 90)
    );
  }
  return { beep, notes };
})();

// ---- Tiny DOM helpers ----
const $ = (s) => document.querySelector(s);
const $$ = (s) => Array.from(document.querySelectorAll(s));

// ---- State & Konami ----
const KONAMI = [38, 38, 40, 40, 37, 39, 37, 39, 66, 65];
let konamiPos = 0;
window.addEventListener("keydown", (e) => {
  if (e.keyCode === KONAMI[konamiPos]) {
    konamiPos++;
    if (konamiPos === KONAMI.length) {
      triggerGaIn();
      konamiPos = 0;
    }
  } else konamiPos = e.keyCode === KONAMI[0] ? 1 : 0;
});

// ---- Easter Egg Typing Detection ----
let typedBuffer = "";
let secretTriggered = false;
window.addEventListener("keypress", (e) => {
  const ch = String.fromCharCode(e.which || e.keyCode).toUpperCase();
  typedBuffer = (typedBuffer + ch).slice(-20); // keep last 20 chars

  // GLORY easter egg (trigger once)
  if (!secretTriggered && typedBuffer.includes("GLORY")) {
    secretTriggered = true;
    turnAlertGolden();
  }

  // Classic easter egg words: INFO or NUIT
  if (typedBuffer.includes("INFO") || typedBuffer.includes("NUIT")) {
    triggerGaIn();
  }
});

// ---- Form logic ----
const form = $("#gloriousForm");
const events = $("#events");
const dialogWrap = $("#dialogWrap");
const dialogContent = $("#dialogContent");
const closeDialog = $("#closeDialog");
const goldCanvas = document.getElementById("gold");
const ctx = goldCanvas.getContext("2d");

function log(msg) {
  const d = document.createElement("div");
  d.textContent = msg;
  events.prepend(d);
}

function setInvalid(el, state) {
  if (state) el.classList.add("invalid");
  else el.classList.remove("invalid");
}

function validate() {
  let ok = true;
  const name = $("#name");
  const email = $("#email");
  const subject = $("#subject");
  const message = $("#message");
  [name, email, subject, message].forEach((i) => setInvalid(i, false));
  if (!name.value.trim()) {
    setInvalid(name, true);
    ok = false;
  }
  if (!email.value.match(/^\S+@\S+\.\S+$/)) {
    setInvalid(email, true);
    ok = false;
  }
  if (!subject.value.trim()) {
    setInvalid(subject, true);
    ok = false;
  }
  if (!message.value.trim()) {
    setInvalid(message, true);
    ok = false;
  }
  return ok;
}

function simulateSend(payload) {
  const endpoint = "http://localhost:3000/api/send";
  return fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  })
    .then((r) => {
      if (!r.ok) throw new Error("Network");
      return r.json();
    })
    .catch((err) => {
      const blob = new Blob([JSON.stringify(payload, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "glorious-message.json";
      document.body.appendChild(a);
      a.click();
      a.remove();
      return { ok: true, fallback: true, id: "local-" + Date.now() };
    });
}

form.addEventListener("submit", async (ev) => {
  ev.preventDefault();
  if (!validate()) {
    SoundManager.beep(220, 0.06);
    log("Validation failed — vérifiez les champs");
    return;
  }
  const payload = {
    name: $("#name").value.trim(),
    email: $("#email").value.trim(),
    subject: $("#subject").value.trim(),
    message: $("#message").value.trim(),
    ts: new Date().toISOString(),
  };
  log("Envoi...");
  SoundManager.notes([880, 988, 1046]);
  const res = await simulateSend(payload);
  log("Réponse reçue — " + (res.id || "OK"));
  showDialog(res);
  showThemeAlert(
    "Ton message a été envoyé avec gloire !\nFélicitations, héros pixelisé !"
  );
});

// ---- Dialog typing animation ----
function showDialog(res) {
  dialogContent.innerHTML = "";
  dialogWrap.setAttribute("aria-hidden", "false");
  dialogWrap.classList.add("show");
  const lines = [];
  if (res && res.fallback) lines.push("Envoi simulé (pas de serveur détecté).");
  lines.push("Votre message a bien été envoyé.");
  lines.push("\nNous avons enregistré l'instant.");
  if (
    (res && res.id && String(res.id).toLowerCase().includes("gold")) ||
    payloadContainsWin()
  ) {
    lines.push("\nFélicitations, vous avez gagné !");
  }

  let text = lines.join("\n");
  let pos = 0;
  const cursor = document.createElement("span");
  cursor.className = "cursor";
  dialogContent.appendChild(cursor);

  function step() {
    if (pos < text.length) {
      const next = document.createTextNode(text[pos]);
      dialogContent.insertBefore(next, cursor);
      pos++;
      if (text[pos - 1] === "\n") SoundManager.beep(660, 0.03, "square");
      else SoundManager.beep(880, 0.02, "sine", 0.02);
      setTimeout(step, 22 + (text[pos - 1] === "." ? 120 : 0));
    } else {
      cursor.remove();
      SoundManager.notes([1200, 900, 720]);
      if (text.includes("Félicitations")) runConfetti();
    }
  }
  step();
}

// ---- Theme Alert ----
const themeAlert = $("#themeAlert");
const alertContent = $("#alertContent");
const okBtn = $("#closeAlert");
let alertClosed = false;

function showThemeAlert(msg) {
  alertContent.innerHTML = "";
  themeAlert.setAttribute("aria-hidden", "false");
  themeAlert.classList.add("show");

  $(".alert-box").classList.remove("glory-mode");
  $(".alert-box").classList.remove("glitch");
  $(".alert-box").style.color = "#ffdd66";
  $(".alert-box").style.lineHeight = "1.6";

  msg +=
    "\n\n💡 Astuce: essaye de cliquer sur OK... il pourrait te fuir !\n\n✨ Mais tu peux toujours appuyer sur ESC pour le fermer.";

  let pos = 0;
  const cursor = document.createElement("span");
  cursor.className = "cursor";
  alertContent.appendChild(cursor);

  function step() {
    if (pos < msg.length) {
      const next = document.createTextNode(msg[pos]);
      alertContent.insertBefore(next, cursor);
      pos++;
      SoundManager.beep(880, 0.02, "sine", 0.02);
      setTimeout(step, 22 + (msg[pos - 1] === "." ? 120 : 0));
    } else cursor.remove();
  }
  step();
}

// ---- GLORY Mode ----
function turnAlertGolden() {
  SoundManager.notes([880, 1020, 1200, 1480]);
  alertContent.innerHTML = "";
  alertContent.textContent =
    "✨ MODE GLORY ACTIVÉ ✨\nTon aura brille dans le noir.";

  $(".alert-box").classList.add("glory-mode");
  runConfetti();
}

// ---- Moving OK Button ----
okBtn.style.position = "absolute";
okBtn.style.left = "50%";
okBtn.style.bottom = "12px";
okBtn.style.transform = "translateX(-50%)";

function moveButtonAway(e) {
  if (alertClosed) return;
  const rect = okBtn.getBoundingClientRect();
  const alertRect = themeAlert.getBoundingClientRect();
  const mouseX = e.clientX;
  const mouseY = e.clientY;

  const btnX = rect.left + rect.width / 2;
  const btnY = rect.top + rect.height / 2;

  const distX = mouseX - btnX;
  const distY = mouseY - btnY;
  const distance = Math.hypot(distX, distY);
  const safeDistance = 120;

  if (distance < safeDistance) {
    const moveX = ((btnX - mouseX) / distance) * 100;
    const moveY = ((btnY - mouseY) / distance) * 60;

    let newLeft = rect.left + moveX - alertRect.left;
    let newBottom = rect.bottom + moveY - alertRect.top;

    newLeft = Math.max(
      12,
      Math.min(alertRect.width - rect.width - 12, newLeft)
    );
    newBottom = Math.max(
      12,
      Math.min(alertRect.height - rect.height - 12, newBottom)
    );

    okBtn.style.left = `${newLeft}px`;
    okBtn.style.bottom = `${alertRect.height - newBottom - rect.height}px`;
    SoundManager.beep(660, 0.02, "square");
  }
}

themeAlert.addEventListener("mousemove", moveButtonAway);

okBtn.addEventListener("click", () => {
  if (!alertClosed) {
    themeAlert.classList.remove("show");
    themeAlert.setAttribute("aria-hidden", "true");
    alertClosed = true;
    okBtn.style.left = "50%";
    okBtn.style.bottom = "12px";
    okBtn.style.transform = "translateX(-50%)";
  }
});

window.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    themeAlert.classList.remove("show");
    themeAlert.setAttribute("aria-hidden", "true");
    alertClosed = true;
    okBtn.style.left = "50%";
    okBtn.style.bottom = "12px";
    okBtn.style.transform = "translateX(-50%)";
  }
});

// ---- Helpers ----
function payloadContainsWin() {
  try {
    const s = $("#subject").value + " " + $("#message").value;
    return /gagn(es?|é|er|é|t)/i.test(s) || /gagner/i.test(s);
  } catch (e) {
    return false;
  }
}

closeDialog.addEventListener("click", () => {
  dialogWrap.classList.remove("show");
  dialogWrap.setAttribute("aria-hidden", "true");
});

// ---- Demo buttons ----
$("#demoFill").addEventListener("click", () => {
  $("#name").value = "Hilox Team";
  $("#email").value = "Nuit@Info.com";
  $("#subject").value = "Demande de gloire";
  $("#message").value = "Vous désirez un biscuit ?.";
  SoundManager.notes([440, 550]);
  log("Demo filled");
});
$("#clearBtn").addEventListener("click", () => {
  form.reset();
  $$(".invalid").forEach((el) => el.classList.remove("invalid"));
  log("Formulaire réinitialisé");
  SoundManager.beep(220);
});

// ---- Confetti / Gold animation ----
function runConfetti() {
  const W = (goldCanvas.width = window.innerWidth);
  const H = (goldCanvas.height = window.innerHeight);
  ctx.clearRect(0, 0, W, H);
  const pieces = [];
  for (let i = 0; i < 120; i++)
    pieces.push({
      x: Math.random() * W,
      y: -Math.random() * H * 0.5,
      vy: 1 + Math.random() * 4,
      vx: (Math.random() - 0.5) * 4,
      r: 2 + Math.random() * 6,
      color: Math.random() > 0.5 ? "#ffd166" : "#ffe8a1",
    });
  let t = 0;
  function frame() {
    ctx.clearRect(0, 0, W, H);
    pieces.forEach((p) => {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.06;
      ctx.fillStyle = p.color;
      ctx.fillRect(p.x, p.y, p.r, p.r * 0.5);
    });
    t++;
    if (t < 240) requestAnimationFrame(frame);
    else ctx.clearRect(0, 0, W, H);
  }
  frame();
}

// ---- Triggered by Konami or GOLD ----
function triggerGaIn() {
  $("#subject").value = "Gloire détectée";
  $("#message").value = "Sequence spéciale activée.";
  SoundManager.notes([880, 880, 1046, 1318]);
  showDialog({ ok: true, id: "INFO-NUIT-SECRET" });
  runConfetti();
  log("Easter egg activé — INFO / NUIT détecté !");
}

// ---- Keyboard navigation (Undertale-like) ----
(function keyboardNav() {
  const fields = ["#name", "#email", "#subject", "#message", "#submitBtn"];
  let idx = 0;
  function focusIdx() {
    const el = document.querySelector(fields[idx]);
    if (el) {
      el.focus();
      if (el.select) {
        try {
          el.select();
        } catch (e) {}
      }
    }
  }
  focusIdx();
  window.addEventListener("keydown", (e) => {
    if (e.key === "ArrowDown" || e.key === "Tab") {
      e.preventDefault();
      idx = Math.min(fields.length - 1, idx + 1);
      focusIdx();
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      idx = Math.max(0, idx - 1);
      focusIdx();
    }
    if (
      e.key === "Enter" &&
      document.activeElement &&
      document.activeElement.id === "submitBtn"
    ) {
      document.activeElement.click();
    }
  });
})();

// ---- Resize canvas ----
window.addEventListener("resize", () => {
  goldCanvas.width = window.innerWidth;
  goldCanvas.height = window.innerHeight;
});

// ---- Draggable logo ----
const logo = document.getElementById("draggableLogo");
const secret = document.getElementById("logo-secret");
let offsetX = 0,
  offsetY = 0,
  dragging = false;

logo.addEventListener("mousedown", (e) => {
  dragging = true;
  logo.style.position = "absolute";
  logo.style.zIndex = "9999";
  secret.style.opacity = "1";
  offsetX = e.clientX - logo.offsetLeft;
  offsetY = e.clientY - logo.offsetTop;
});
document.addEventListener("mousemove", (e) => {
  if (!dragging) return;
  logo.style.left = e.clientX - offsetX + "px";
  logo.style.top = e.clientY - offsetY + "px";
});
document.addEventListener("mouseup", () => {
  dragging = false;
  secret.style.opacity = "0";
});

// ---- Initial log ----
log("Prêt — tape NUIT ou INFO pour un easter egg");
