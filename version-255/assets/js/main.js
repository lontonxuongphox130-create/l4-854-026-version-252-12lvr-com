document.addEventListener("DOMContentLoaded", function () {
  const mobileToggle = document.querySelector(".mobile-toggle");
  const mobileNav = document.querySelector(".mobile-nav");

  if (mobileToggle && mobileNav) {
    mobileToggle.addEventListener("click", function () {
      const opened = mobileNav.hasAttribute("hidden");
      if (opened) {
        mobileNav.removeAttribute("hidden");
        mobileToggle.setAttribute("aria-expanded", "true");
        mobileToggle.textContent = "×";
      } else {
        mobileNav.setAttribute("hidden", "");
        mobileToggle.setAttribute("aria-expanded", "false");
        mobileToggle.textContent = "☰";
      }
    });
  }

  const carousel = document.querySelector(".hero-carousel");
  if (carousel) {
    const slides = Array.from(carousel.querySelectorAll(".hero-slide"));
    const dots = Array.from(carousel.querySelectorAll(".hero-dot"));
    const previous = carousel.querySelector(".hero-prev");
    const next = carousel.querySelector(".hero-next");
    let activeIndex = Math.max(0, slides.findIndex(function (slide) {
      return slide.classList.contains("is-active");
    }));

    function showSlide(index) {
      if (!slides.length) {
        return;
      }
      activeIndex = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === activeIndex);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === activeIndex);
      });
    }

    if (previous) {
      previous.addEventListener("click", function () {
        showSlide(activeIndex - 1);
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        showSlide(activeIndex + 1);
      });
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener("click", function () {
        showSlide(dotIndex);
      });
    });

    window.setInterval(function () {
      showSlide(activeIndex + 1);
    }, 5200);
  }

  const filterInput = document.querySelector("[data-filter-input]");
  const filterGrid = document.querySelector("[data-filter-grid]");

  if (filterInput && filterGrid) {
    const cards = Array.from(filterGrid.querySelectorAll("[data-movie-card]"));

    filterInput.addEventListener("input", function () {
      const query = filterInput.value.trim().toLowerCase();
      cards.forEach(function (card) {
        const text = (card.getAttribute("data-search") || "").toLowerCase();
        card.hidden = query.length > 0 && !text.includes(query);
      });
    });

    document.querySelectorAll("[data-sort]").forEach(function (button) {
      button.addEventListener("click", function () {
        const mode = button.getAttribute("data-sort");
        const sorted = cards.slice().sort(function (a, b) {
          if (mode === "title") {
            return (a.getAttribute("data-title") || "").localeCompare(b.getAttribute("data-title") || "", "zh-CN");
          }
          return Number(b.getAttribute("data-year") || 0) - Number(a.getAttribute("data-year") || 0);
        });
        sorted.forEach(function (card) {
          filterGrid.appendChild(card);
        });
      });
    });
  }

  const searchResults = document.querySelector("[data-search-results]");
  const searchSummary = document.querySelector("[data-search-summary]");

  if (searchResults && window.SEARCH_INDEX) {
    const params = new URLSearchParams(window.location.search);
    const query = (params.get("q") || "").trim();
    const input = document.querySelector(".search-page-panel input[name='q']");
    if (input) {
      input.value = query;
    }

    function safeText(value) {
      return String(value || "").replace(/[&<>"']/g, function (character) {
        return {
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          "\"": "&quot;",
          "'": "&#39;"
        }[character];
      });
    }

    function cardTemplate(movie) {
      const title = safeText(movie.title);
      const file = safeText(movie.file);
      const cover = safeText(movie.cover);
      const year = safeText(movie.year);
      const region = safeText(movie.region);
      const type = safeText(movie.type);
      const oneLine = safeText(movie.oneLine);
      const tags = movie.genres.slice(0, 2).map(function (tag) {
        return "<span>" + safeText(tag) + "</span>";
      }).join("");
      return "<article class=\"movie-card poster-card\">" +
        "<a href=\"./" + file + "\" class=\"poster-link\">" +
        "<img src=\"" + cover + "\" alt=\"" + title + "\" loading=\"lazy\">" +
        "<span class=\"poster-gradient\"></span>" +
        "<span class=\"poster-year\">" + year + "</span>" +
        "</a>" +
        "<div class=\"poster-body\">" +
        "<h3><a href=\"./" + file + "\">" + title + "</a></h3>" +
        "<div class=\"tag-row\">" + tags + "</div>" +
        "<p>" + oneLine + "</p>" +
        "<div class=\"meta-line\"><span>" + region + "</span><span>" + type + "</span></div>" +
        "</div>" +
        "</article>";
    }

    if (query) {
      const normalized = query.toLowerCase();
      const matched = window.SEARCH_INDEX.filter(function (movie) {
        return movie.search.includes(normalized);
      });
      searchResults.innerHTML = matched.slice(0, 240).map(cardTemplate).join("");
      if (searchSummary) {
        searchSummary.textContent = "关键词“" + query + "”匹配到 " + matched.length + " 部影片";
      }
    } else if (searchSummary) {
      searchSummary.textContent = "输入关键词查找影片";
    }
  }
});
