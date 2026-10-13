// ---------- Datos (arrays de objetos) ----------

const skills = [
  { name: "HTML", detail: "Estructura semántica", level: 80 },
  { name: "CSS", detail: "Diseño responsive, mobile-first", level: 70 },
  { name: "JavaScript", detail: "Arrays, objetos y funciones", level: 60 },
  { name: "Git y GitHub", detail: "Commits, push y repositorios", level: 55 }
];

const projects = [
  { title: "Lista de tareas", description: "App para agregar y completar tareas, guardadas en un array.", tags: ["JavaScript", "HTML"], year: 2026, url: "404.html" },
  
];

// ---------- Estado ----------
const state = { tag: "Todos", query: "" };

// ---------- Funciones ----------
function getTags(list) {
  const all = list.flatMap(p => p.tags);
  return ["Todos", ...new Set(all)];
}

function filterProjects(list, { tag, query }) {
  const q = query.trim().toLowerCase();
  return list
    .filter(p => tag === "Todos" || p.tags.includes(tag))
    .filter(p => !q || (p.title + " " + p.description).toLowerCase().includes(q))
    .sort((a, b) => b.year - a.year);
}

function el(tag, props = {}, ...children) {
  const node = document.createElement(tag);
  Object.assign(node, props);
  node.append(...children);
  return node;
}

function renderSkills() {
  const ul = document.getElementById("skills-list");
  ul.replaceChildren(...skills.map(s => {
    const bar = el("div", { className: "level" }, el("i"));
    bar.firstChild.style.width = s.level + "%";
    return el("li", {}, el("strong", { textContent: s.name }), el("span", { textContent: s.detail }), bar);
  }));
}

function renderFilters() {
  const box = document.getElementById("filters");
  box.replaceChildren(...getTags(projects).map(tag => {
    const b = el("button", { className: "chip", type: "button", textContent: tag });
    b.setAttribute("aria-pressed", String(tag === state.tag));
    b.addEventListener("click", () => { state.tag = tag; renderFilters(); renderProjects(); });
    return b;
  }));
}

function renderProjects() {
  const box = document.getElementById("projects");
  const result = filterProjects(projects, state);
  document.getElementById("count").textContent =
    result.length + (result.length === 1 ? " proyecto" : " proyectos");
  if (!result.length) {
    box.replaceChildren(el("p", { className: "empty", textContent: "No hay proyectos que coincidan con tu búsqueda." }));
    return;
  }
  box.replaceChildren(...result.map(p => {
    const tags = el("ul", { className: "tags" }, ...p.tags.map(t => el("li", { textContent: t })));
    const link = el("a", { href: p.url, target: "_blank", rel: "noopener", textContent: "Ver proyecto →" });
    return el("article", { className: "card" },
      el("span", { className: "meta", textContent: String(p.year) }),
      el("h3", { textContent: p.title }),
      el("p", { textContent: p.description }),
      tags, link);
  }));
}

// ---------- Modo oscuro ----------
function applyTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme);
  try { localStorage.setItem("theme", theme); } catch (e) {}
}
function initTheme() {
  let saved = null;
  try { saved = localStorage.getItem("theme"); } catch (e) {}
  if (saved) document.documentElement.setAttribute("data-theme", saved);
  document.getElementById("theme-toggle").addEventListener("click", () => {
    const current = document.documentElement.getAttribute("data-theme")
      || (matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
    applyTheme(current === "dark" ? "light" : "dark");
  });
}

// ---------- Formulario ----------
function validateField(input) {
  const err = document.getElementById(input.id + "-error");
  let msg = "";
  const v = input.value.trim();
  if (!v) msg = "Este campo es obligatorio.";
  else if (input.type === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) msg = "Ingresá un email válido.";
  else if (input.id === "message" && v.length < 10) msg = "El mensaje debe tener al menos 10 caracteres.";
  err.textContent = msg;
  input.setAttribute("aria-invalid", String(Boolean(msg)));
  return !msg;
}

function initForm() {
  const form = document.getElementById("contact-form");
  const fields = [...form.querySelectorAll("input, textarea")];
  fields.forEach(f => f.addEventListener("blur", () => validateField(f)));
  form.addEventListener("submit", e => {
    e.preventDefault();
    const ok = fields.map(validateField).every(Boolean);
    const status = document.getElementById("form-status");
    if (!ok) { status.textContent = "Revisá los campos marcados."; return; }
    // Acá podrías conectar un servicio como Formspree.
    status.textContent = "¡Gracias! Tu mensaje está listo para enviarse.";
    form.reset();
  });
}

// ---------- Inicio ----------
document.getElementById("year").textContent = new Date().getFullYear();
document.getElementById("search").addEventListener("input", e => { state.query = e.target.value; renderProjects(); });
initTheme();
renderSkills();
renderFilters();
renderProjects();
initForm();