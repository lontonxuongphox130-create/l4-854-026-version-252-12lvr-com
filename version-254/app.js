(function () {
  var toggle = document.querySelector(".mobile-toggle");
  var menu = document.querySelector(".nav-menu");

  if (toggle && menu) {
    toggle.addEventListener("click", function () {
      var opened = menu.classList.toggle("open");
      toggle.setAttribute("aria-expanded", opened ? "true" : "false");
      toggle.textContent = opened ? "×" : "☰";
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
  var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dot"));
  var current = 0;
  var timer = null;

  function showSlide(index) {
    if (!slides.length) {
      return;
    }
    current = (index + slides.length) % slides.length;
    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle("active", slideIndex === current);
    });
    dots.forEach(function (dot, dotIndex) {
      dot.classList.toggle("active", dotIndex === current);
    });
  }

  function startHero() {
    if (timer || slides.length < 2) {
      return;
    }
    timer = window.setInterval(function () {
      showSlide(current + 1);
    }, 5000);
  }

  function resetHero() {
    if (timer) {
      window.clearInterval(timer);
      timer = null;
    }
    startHero();
  }

  var prev = document.querySelector(".hero-prev");
  var next = document.querySelector(".hero-next");

  if (prev) {
    prev.addEventListener("click", function () {
      showSlide(current - 1);
      resetHero();
    });
  }

  if (next) {
    next.addEventListener("click", function () {
      showSlide(current + 1);
      resetHero();
    });
  }

  dots.forEach(function (dot) {
    dot.addEventListener("click", function () {
      showSlide(Number(dot.getAttribute("data-slide")) || 0);
      resetHero();
    });
  });

  startHero();

  document.addEventListener("error", function (event) {
    var target = event.target;
    if (target && target.tagName === "IMG") {
      target.style.opacity = "0";
    }
  }, true);

  function normalize(value) {
    return String(value || "").trim().toLowerCase();
  }

  function applyFilter(input) {
    var root = input.closest("main") || document;
    var items = Array.prototype.slice.call(root.querySelectorAll(".filter-item"));
    var count = root.querySelector(".filter-count");
    var keyword = normalize(input.value);
    var visible = 0;

    items.forEach(function (item) {
      var haystack = normalize((item.getAttribute("data-title") || "") + " " + (item.getAttribute("data-meta") || "") + " " + item.textContent);
      var matched = !keyword || haystack.indexOf(keyword) !== -1;
      item.classList.toggle("hidden-by-filter", !matched);
      if (matched) {
        visible += 1;
      }
    });

    if (count) {
      count.textContent = visible + " 部作品";
    }
  }

  var params = new URLSearchParams(window.location.search);
  var query = params.get("q") || "";
  var searchInput = document.getElementById("site-search-input");

  if (searchInput && query) {
    searchInput.value = query;
  }

  Array.prototype.slice.call(document.querySelectorAll(".movie-filter")).forEach(function (input) {
    applyFilter(input);
    input.addEventListener("input", function () {
      applyFilter(input);
    });
  });
})();
