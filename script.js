const $ = s => document.querySelector(s), $$ = s => [...document.querySelectorAll(s)];
$("#yr").textContent = new Date().getFullYear();

/* 1. Dark / light mode (remembers your choice) */
const root = document.documentElement, tb = $("#themeBtn");
function setTheme(t){
  root.dataset.theme = t;
  tb.textContent = t === "dark" ? "☀️" : "🌙";
  tb.setAttribute("aria-label", t === "dark" ? "Switch to light mode" : "Switch to dark mode");
  try{ localStorage.setItem("theme", t); }catch(e){}
}
let saved = null;
try{ saved = localStorage.getItem("theme"); }catch(e){}
setTheme(saved === "light" || saved === "dark" ? saved : "dark");
tb.onclick = () => setTheme(root.dataset.theme === "dark" ? "light" : "dark");

/* 2. Mobile menu + smooth scrolling (CSS) + closing on click / outside / Escape */
const links = $("#links"), mb = $("#menuBtn");
function closeMenu(){
  links.classList.remove("open");
  mb.setAttribute("aria-expanded", "false");
  mb.setAttribute("aria-label", "Open menu");
}
mb.onclick = () => {
  const o = links.classList.toggle("open");
  mb.setAttribute("aria-expanded", String(o));
  mb.setAttribute("aria-label", o ? "Close menu" : "Open menu");
};
$$("#links a").forEach(a => a.onclick = closeMenu);
document.addEventListener("click", e => {
  if(links.classList.contains("open") && !e.target.closest("nav")) closeMenu();
});
document.addEventListener("keydown", e => {
  if(e.key === "Escape" && links.classList.contains("open")){
    closeMenu();
    mb.focus();
  }
});

/* 3. Highlight the nav link of the section in view */
const secs = $$("main section"), navA = $$("#links a");
if("IntersectionObserver" in window){
  const navObs = new IntersectionObserver(es => es.forEach(e => {
    if(e.isIntersecting) navA.forEach(a => a.classList.toggle("active", a.getAttribute("href") === "#" + e.target.id));
  }), {rootMargin:"-45% 0px -50% 0px"});
  secs.forEach(s => navObs.observe(s));

  /* 4. Skill bars animate when scrolled into view */
  const barObs = new IntersectionObserver(es => es.forEach(e => {
    if(e.isIntersecting){
      e.target.style.width = e.target.dataset.w + "%";
      barObs.unobserve(e.target);
    }
  }), {threshold:.4});
  $$(".fill").forEach(f => barObs.observe(f));
} else {
  $$(".fill").forEach(f => f.style.width = f.dataset.w + "%");
}

/* 5. Contact form validation */
const rules = {
  name:  v => v.trim().length < 2 ? "Enter your name (at least 2 characters)." : "",
  email: v => !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()) ? "Enter a valid email, like name@example.com." : "",
  msg:   v => v.trim().length < 10 ? "Write at least 10 characters." : ""
};
function check(id){
  const el = $("#" + id), err = rules[id](el.value), f = el.closest(".field");
  f.classList.toggle("bad", !!err);
  f.querySelector(".err").textContent = err;
  el.setAttribute("aria-invalid", String(!!err));
  return !err;
}
Object.keys(rules).forEach(id => {
  const el = $("#" + id);
  el.addEventListener("blur", () => check(id));
  el.addEventListener("input", () => {
    if(el.closest(".field").classList.contains("bad")) check(id);
  });
});

let okTimer = null;
$("#form").addEventListener("submit", e => {
  e.preventDefault();
  const results = Object.keys(rules).map(check);
  const ok = $("#ok");
  clearTimeout(okTimer);
  if(results.every(Boolean)){
    ok.style.display = "block";
    e.target.reset();
    Object.keys(rules).forEach(id => $("#" + id).removeAttribute("aria-invalid"));
    okTimer = setTimeout(() => ok.style.display = "none", 5000);
  } else {
    ok.style.display = "none";
    const firstBad = $(".bad input, .bad textarea");
    if(firstBad) firstBad.focus();
  }
});
