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

// ===FEATURED SLIDER==============

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

// ===== 'OUR COLLECTION' FETCH API/SLIDER/FILTER=============

const shopSliderList = document.getElementById("shop__slider__list");
const brandSelect = document.getElementById("brand__filter");
const fallbackImage =
  "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=600&q=80";
let shopSplideInstance = null;

async function fetchProductsByBrand(brand) {
  if (!shopSliderList) return;

  shopSliderList.innerHTML = `<li class="splide__slide"><p style="text-align:center; width:100%; padding:20px;">${translations[currentLang].loadingProducts}</p></li>`;

  try {
    const response = await fetch(
      `https://makeup-api.herokuapp.com/api/v1/products.json?brand=${brand}`,
    );
    const products = await response.json();

    shopSliderList.innerHTML = "";

    if (!products || products.length === 0) {
      shopSliderList.innerHTML = `<li class="splide__slide"><p style="text-align:center; width:100%;">${translations[currentLang].noProductsFound}</p></li>`;
      return;
    }

    for (let i = 0; i < products.length; i += 2) {
      const product1 = products[i];
      const product2 = products[i + 1];

      const slide = document.createElement("li");
      slide.className = "splide__slide";
      slide.style.display = "flex";
      slide.style.flexDirection = "column";
      slide.style.gap = "16px";

      const productCardHTML = (product) => {
        if (!product) return "";

        const priceVal = parseFloat(product.price);
        const displayPrice =
          !isNaN(priceVal) && priceVal > 0
            ? `$${priceVal.toFixed(2)}`
            : "$18.00";
        const numericPrice =
          !isNaN(priceVal) && priceVal > 0 ? priceVal.toFixed(2) : "18.00";

        let rawImg = product.image_link || fallbackImage;
        if (rawImg.startsWith("http://")) {
          rawImg = rawImg.replace("http://", "https://");
        }

        return `
                        <div class="slider__card" style="flex: 1; display: flex; flex-direction: column;">
                            <div class="card__img__wrapper">
                                <img src="${rawImg}" alt="${product.name}" onerror="this.onerror=null;this.src='${fallbackImage}';">
                            </div>
                            <h3>${product.name}</h3>
                            <p class="price" style="margin-top: auto;">${displayPrice}</p>
                            <button class="btn btn__sm add__to__cart" data-name="${product.name.replace(/"/g, "&quot;")}" data-price="${numericPrice}">${translations[currentLang].addToCart}</button>
                        </div>
                    `;
      };

      slide.innerHTML = productCardHTML(product1) + productCardHTML(product2);
      shopSliderList.appendChild(slide);
    }

    bindAddToCartButtons();

    if (shopSplideInstance) {
      shopSplideInstance.destroy();
    }

    shopSplideInstance = new Splide("#shop__slider", {
      type: "slide",
      perPage: 4,
      gap: "24px",
      pagination: true,
      arrows: true,
      breakpoints: {
        1200: { perPage: 3 },
        992: { perPage: 2 },
        640: { perPage: 1 },
      },
    }).mount();
  } catch (error) {
    console.error("API Fetch Error:", error);
    shopSliderList.innerHTML = `<li class="splide__slide"><p style="text-align:center; width:100%; color:red;">Failed to load products from API.</p></li>`;
  }
}

if (brandSelect) {
  brandSelect.addEventListener("change", (e) => {
    fetchProductsByBrand(e.target.value);
  });

  fetchProductsByBrand(brandSelect.value || "maybelline");
}

let cart = [];
const cartToggle = document.getElementById("cart__toggle");
const cartClose = document.getElementById("cart__close");
const cartSidebar = document.getElementById("cart__sidebar");
const cartOverlay = document.getElementById("cart__overlay");
const cartCount = document.getElementById("cart__count");
const cartItemsContainer = document.getElementById("cart__items");
const cartSubtotal = document.getElementById("cart__subtotal");
const submitOrderBtn = document.getElementById("submit__order__btn");

function toggleCart() {
  cartSidebar.classList.toggle("open");
  cartOverlay.classList.toggle("open");
}

if (cartToggle) cartToggle.addEventListener("click", toggleCart);
if (cartClose) cartClose.addEventListener("click", toggleCart);
if (cartOverlay) cartOverlay.addEventListener("click", toggleCart);

function bindAddToCartButtons() {
  document.querySelectorAll(".add__to__cart").forEach((button) => {
    button.onclick = null;
    button.onclick = () => {
      const name = button.dataset.name;
      const price = parseFloat(button.dataset.price);
      const existingItem = cart.find((item) => item.name === name);
      if (existingItem) {
        existingItem.qty += 1;
      } else {
        cart.push({ name, price, qty: 1 });
      }

      updateCartUI();
      toggleCart();
    };
  });
}

function updateCartUI() {
  cartItemsContainer.innerHTML = "";
  let total = 0;
  let count = 0;

  cart.forEach((item, index) => {
    total += item.price * item.qty;
    count += item.qty;

    const itemEl = document.createElement("div");
    itemEl.className = "cart__item";
    itemEl.innerHTML = `
                <div class="cart__item__details">
                    <h4>${item.name}</h4>
                    <p>$${item.price.toFixed(2)} x ${item.qty}</p>
                </div>
                <button class="remove__item" data-index="${index}">&times;</button>
            `;
    cartItemsContainer.appendChild(itemEl);
  });

  if (cartCount) cartCount.textContent = count;
  if (cartSubtotal) cartSubtotal.textContent = `$${total.toFixed(2)}`;

  if (submitOrderBtn) {
    if (cart.length === 0) {
      submitOrderBtn.disabled = true;
      submitOrderBtn.style.opacity = "0.5";
      submitOrderBtn.style.cursor = "not-allowed";
    } else {
      submitOrderBtn.disabled = false;
      submitOrderBtn.style.opacity = "1";
      submitOrderBtn.style.cursor = "pointer";
    }
  }

  document.querySelectorAll(".remove__item").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const idx = parseInt(e.target.dataset.index);
      cart.splice(idx, 1);
      updateCartUI();
    });
  });
}

bindAddToCartButtons();
updateCartUI();

// ======CHECKOUT FORM VALIDATION=========
const orderForm = document.getElementById("checkout__form");

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phoneRegex = /^(\+?995)?(5\d{8}|\d{9,12})$/;

function validateInput(input, errorEl, rules) {
  const val = input.value.trim();
  let errorMessage = "";

  if (!val) {
    errorMessage = rules.emptyMsg;
  } else if (rules.minLength && val.length < rules.minLength) {
    errorMessage = rules.lengthMsg;
  } else if (rules.regex && !rules.regex.test(val.replace(/\s+/g, ""))) {
    errorMessage = rules.regexMsg;
  }

  if (errorMessage) {
    input.classList.add("error__input");
    input.classList.remove("valid__input");
    errorEl.textContent = errorMessage;
    return false;
  } else {
    input.classList.remove("error__input");
    input.classList.add("valid__input");
    errorEl.textContent = "";
    return true;
  }
}

if (orderForm) {
  document.getElementById("full__name").addEventListener("blur", () => {
    validateInput(
      document.getElementById("full__name"),
      document.getElementById("name__error"),
      {
        emptyMsg: translations[currentLang].valNameEmpty,
        minLength: 3,
        lengthMsg: translations[currentLang].valNameShort,
      },
    );
  });

  document.getElementById("email").addEventListener("blur", () => {
    validateInput(
      document.getElementById("email"),
      document.getElementById("email__error"),
      {
        emptyMsg: translations[currentLang].valEmailEmpty,
        regex: emailRegex,
        regexMsg: translations[currentLang].valEmailInvalid,
      },
    );
  });

  document.getElementById("phone").addEventListener("blur", () => {
    validateInput(
      document.getElementById("phone"),
      document.getElementById("phone__error"),
      {
        emptyMsg: translations[currentLang].valPhoneEmpty,
        regex: phoneRegex,
        regexMsg: translations[currentLang].valPhoneInvalid,
      },
    );
  });

  document.getElementById("shipping__address").addEventListener("blur", () => {
    validateInput(
      document.getElementById("shipping__address"),
      document.getElementById("address__error"),
      {
        emptyMsg: translations[currentLang].valAddressEmpty,
        minLength: 5,
        lengthMsg: translations[currentLang].valAddressShort,
      },
    );
  });

  orderForm.addEventListener("submit", (e) => {
    e.preventDefault();

    if (cart.length === 0) {
      alert(translations[currentLang].cartEmptyError);
      return;
    }

    const isNameValid = validateInput(
      document.getElementById("full__name"),
      document.getElementById("name__error"),
      {
        emptyMsg: translations[currentLang].valNameEmpty,
        minLength: 3,
        lengthMsg: translations[currentLang].valNameShort,
      },
    );

    const isEmailValid = validateInput(
      document.getElementById("email"),
      document.getElementById("email__error"),
      {
        emptyMsg: translations[currentLang].valEmailEmpty,
        regex: emailRegex,
        regexMsg: translations[currentLang].valEmailInvalid,
      },
    );

    const isPhoneValid = validateInput(
      document.getElementById("phone"),
      document.getElementById("phone__error"),
      {
        emptyMsg: translations[currentLang].valPhoneEmpty,
        regex: phoneRegex,
        regexMsg: translations[currentLang].valPhoneInvalid,
      },
    );

    const isAddressValid = validateInput(
      document.getElementById("shipping__address"),
      document.getElementById("address__error"),
      {
        emptyMsg: translations[currentLang].valAddressEmpty,
        minLength: 5,
        lengthMsg: translations[currentLang].valAddressShort,
      },
    );

    if (isNameValid && isEmailValid && isPhoneValid && isAddressValid) {
      alert(translations[currentLang].orderSuccess);
      orderForm.reset();

      document.querySelectorAll(".checkout__form input").forEach((input) => {
        input.classList.remove("valid__input", "error__input");
      });

      cart = [];
      updateCartUI();
    }
  });
}
