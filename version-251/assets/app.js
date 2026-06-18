(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
    } else {
      document.addEventListener("DOMContentLoaded", fn);
    }
  }

  ready(function () {
    var menuButton = document.querySelector("[data-menu-button]");
    var mobileMenu = document.querySelector("[data-mobile-menu]");
    if (menuButton && mobileMenu) {
      menuButton.addEventListener("click", function () {
        mobileMenu.classList.toggle("is-open");
      });
    }

    document.querySelectorAll("[data-carousel]").forEach(function (carousel) {
      var slides = Array.prototype.slice.call(carousel.querySelectorAll("[data-slide]"));
      var dots = Array.prototype.slice.call(carousel.querySelectorAll("[data-slide-dot]"));
      var next = carousel.querySelector("[data-slide-next]");
      var prev = carousel.querySelector("[data-slide-prev]");
      var index = 0;
      var timer = null;

      function show(nextIndex) {
        if (!slides.length) {
          return;
        }
        index = (nextIndex + slides.length) % slides.length;
        slides.forEach(function (slide, slideIndex) {
          slide.classList.toggle("is-active", slideIndex === index);
        });
        dots.forEach(function (dot, dotIndex) {
          dot.classList.toggle("is-active", dotIndex === index);
        });
      }

      function start() {
        if (slides.length < 2) {
          return;
        }
        window.clearInterval(timer);
        timer = window.setInterval(function () {
          show(index + 1);
        }, 5200);
      }

      if (next) {
        next.addEventListener("click", function () {
          show(index + 1);
          start();
        });
      }

      if (prev) {
        prev.addEventListener("click", function () {
          show(index - 1);
          start();
        });
      }

      dots.forEach(function (dot, dotIndex) {
        dot.addEventListener("click", function () {
          show(dotIndex);
          start();
        });
      });

      show(0);
      start();
    });

    document.querySelectorAll("[data-filter-panel]").forEach(function (panel) {
      var input = panel.querySelector("[data-card-search]");
      var buttons = Array.prototype.slice.call(panel.querySelectorAll("[data-type-filter]"));
      var cards = Array.prototype.slice.call(document.querySelectorAll("[data-movie-card]"));
      var currentType = "all";

      function apply() {
        var term = input ? input.value.trim().toLowerCase() : "";
        cards.forEach(function (card) {
          var text = (card.getAttribute("data-search") || "").toLowerCase();
          var type = card.getAttribute("data-type") || "";
          var okText = !term || text.indexOf(term) !== -1;
          var okType = currentType === "all" || type === currentType;
          card.style.display = okText && okType ? "" : "none";
        });
      }

      if (input) {
        input.addEventListener("input", apply);
      }

      buttons.forEach(function (button) {
        button.addEventListener("click", function () {
          currentType = button.getAttribute("data-type-filter") || "all";
          buttons.forEach(function (item) {
            item.classList.toggle("is-active", item === button);
          });
          apply();
        });
      });

      apply();
    });

    document.querySelectorAll("[data-player]").forEach(function (player) {
      var video = player.querySelector("video");
      var button = player.querySelector(".player-start");
      var stream = player.getAttribute("data-stream") || "";
      var loaded = false;
      var hls = null;

      function loadStream(onReady) {
        if (!video || !stream) {
          return;
        }

        if (loaded) {
          onReady();
          return;
        }

        loaded = true;

        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = stream;
          video.addEventListener("loadedmetadata", onReady, { once: true });
          video.load();
          return;
        }

        if (window.Hls && window.Hls.isSupported()) {
          hls = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hls.loadSource(stream);
          hls.attachMedia(video);
          hls.on(window.Hls.Events.MANIFEST_PARSED, onReady);
          return;
        }

        video.src = stream;
        video.addEventListener("loadedmetadata", onReady, { once: true });
        video.load();
      }

      function begin() {
        loadStream(function () {
          player.classList.add("is-ready");
          var playPromise = video.play();
          if (playPromise && playPromise.catch) {
            playPromise.catch(function () {});
          }
        });
      }

      if (button) {
        button.addEventListener("click", begin);
      }

      if (video) {
        video.addEventListener("play", function () {
          player.classList.add("is-playing");
        });
        video.addEventListener("pause", function () {
          player.classList.remove("is-playing");
        });
      }

      player.addEventListener("dblclick", function () {
        if (video && video.requestFullscreen) {
          video.requestFullscreen();
        }
      });

      window.addEventListener("beforeunload", function () {
        if (hls && hls.destroy) {
          hls.destroy();
        }
      });
    });

    var searchRoot = document.querySelector("[data-search-page]");
    if (searchRoot && window.SITE_CATALOG) {
      var params = new URLSearchParams(window.location.search);
      var initialQuery = params.get("q") || "";
      var input = searchRoot.querySelector("[data-search-input]");
      var button = searchRoot.querySelector("[data-search-button]");
      var summary = searchRoot.querySelector("[data-search-summary]");
      var results = searchRoot.querySelector("[data-search-results]");

      function render(query) {
        var term = query.trim().toLowerCase();
        var matched = window.SITE_CATALOG.filter(function (item) {
          if (!term) {
            return false;
          }
          return item.text.toLowerCase().indexOf(term) !== -1;
        }).slice(0, 120);

        if (summary) {
          summary.textContent = term ? "搜索关键词：“" + query.trim() + "”" : "输入片名、地区、类型或关键词查找内容";
        }

        if (!results) {
          return;
        }

        if (!term) {
          results.innerHTML = '<div class="no-results">输入关键词后显示匹配影片</div>';
          return;
        }

        if (!matched.length) {
          results.innerHTML = '<div class="no-results">没有找到匹配影片</div>';
          return;
        }

        results.innerHTML = matched.map(function (item) {
          return [
            '<article class="movie-card compact">',
            '  <a class="poster-wrap" href="' + item.url + '" aria-label="观看' + escapeHtml(item.title) + '">',
            '    <img src="' + item.image + '" alt="' + escapeHtml(item.title) + '" loading="lazy" onerror="this.style.opacity=\'0\'">',
            '    <span class="corner-badge">' + escapeHtml(item.type) + '</span>',
            '    <span class="score-badge">' + escapeHtml(String(item.score)) + '</span>',
            '  </a>',
            '  <div class="movie-card-body">',
            '    <h3><a href="' + item.url + '">' + escapeHtml(item.title) + '</a></h3>',
            '    <p class="movie-meta">' + escapeHtml(item.year) + ' · ' + escapeHtml(item.region) + '</p>',
            '    <p class="movie-line">' + escapeHtml(item.oneLine) + '</p>',
            '  </div>',
            '</article>'
          ].join("");
        }).join("");
      }

      function escapeHtml(value) {
        return String(value)
          .replace(/&/g, "&amp;")
          .replace(/</g, "&lt;")
          .replace(/>/g, "&gt;")
          .replace(/"/g, "&quot;")
          .replace(/'/g, "&#039;");
      }

      if (input) {
        input.value = initialQuery;
        input.addEventListener("input", function () {
          render(input.value);
        });
        input.addEventListener("keydown", function (event) {
          if (event.key === "Enter") {
            event.preventDefault();
            render(input.value);
          }
        });
      }

      if (button) {
        button.addEventListener("click", function () {
          render(input ? input.value : "");
        });
      }

      render(initialQuery);
    }
  });
})();
