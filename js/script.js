// =====TRANSLATION========

import { translations } from "./translations.js";

let currentLang = localStorage.getItem("museLang") || "en";

function setLanguage(lang) {
  currentLang = lang;
  localStorage.setItem("museLang", lang);

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

// ====HEADER BACKGROUND CHANGE ON SCROLL=========

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

if (burgerMenu && navLinks) {
  burgerMenu.addEventListener("click", () => {
    burgerMenu.classList.toggle("active");
    navLinks.classList.toggle("active");
  });

  navLinks.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      burgerMenu.classList.remove("active");
      navLinks.classList.remove("active");
    });
  });
}

// ========SALE TIMER=======//

function saleTimer(durationHours) {
  let endTime = localStorage.getItem("museSaleEndTime");

  if (!endTime) {
    endTime = new Date().getTime() + durationHours * 3600 * 1000;
    localStorage.setItem("museSaleEndTime", endTime);
  }

  function updateTimer() {
    const now = new Date().getTime();
    const remaining = Math.max(0, Math.floor((endTime - now) / 1000));

    const hours = Math.floor(remaining / 3600);
    const minutes = Math.floor((remaining % 3600) / 60);
    const seconds = remaining % 60;

    if (document.getElementById("hours"))
      document.getElementById("hours").textContent = String(hours).padStart(
        2,
        "0",
      );
    if (document.getElementById("minutes"))
      document.getElementById("minutes").textContent = String(minutes).padStart(
        2,
        "0",
      );
    if (document.getElementById("seconds"))
      document.getElementById("seconds").textContent = String(seconds).padStart(
        2,
        "0",
      );

    if (remaining <= 0) {
      localStorage.removeItem("museSaleEndTime");
    }
  }

  updateTimer();
  setInterval(updateTimer, 1000);
}
saleTimer(2);

if (document.querySelector("#featured__slider")) {
  new Splide("#featured__slider", {
    type: "loop",
    perPage: 3,
    gap: "24px",
    autoplay: true,
    interval: 3500,
    breakpoints: {
      1024: { perPage: 3, gap: "16px" },
      768: { perPage: 2, gap: "16px" },
      480: { perPage: 1, gap: "12px" },
      320: { perPage: 1, gap: "8px" },
    },
  }).mount();
}
