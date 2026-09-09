import { translations } from "./translations.js";

let currentLang = localStorage.getItem("museLang") || "en";

function setLanguage(lang) {
  currentLang = lang;
  localStorage.setItem("auraLang", lang);

  const langToggle = document.getElementById("lang__toggle");
  if (langToggle) langToggle.textContent = lang === "en" ? "KA" : "EN";

  document.querySelectorAll("[data-i18n]").forEach((el) => {
    const key = el.dataset.i18n;
    if (translations[lang] && translations[lang][key]) {
      el.textContent = translations[lang][key];
    }
  });
}

const langToggle = document.getElementById("lang__toggle");
if (langToggle) {
  langToggle.addEventListener("click", () => {
    setLanguage(currentLang === "en" ? "ka" : "en");
  });
}

setLanguage(currentLang);

const header = document.getElementById("main__header");
window.addEventListener("scroll", () => {
  if (window.scrollY > 50) {
    header.classList.add("scrolled");
  } else {
    header.classList.remove("scrolled");
  }
});

// ====BURGER MENU============//

const burgerMenu = document.getElementById("burger__menu");
const navLinks = document.getElementById("nav__links");
if (burgerMenu) {
  burgerMenu.addEventListener("click", () => {
    navLinks.classList.toggle("active");
  });
}
