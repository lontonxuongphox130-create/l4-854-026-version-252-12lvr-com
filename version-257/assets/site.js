function ready(fn) {
  if (document.readyState !== "loading") {
    fn();
  } else {
    document.addEventListener("DOMContentLoaded", fn);
  }
}

ready(function () {
  var toggle = document.querySelector("[data-menu-toggle]");
  var panel = document.querySelector("[data-mobile-panel]");

  if (toggle && panel) {
    toggle.addEventListener("click", function () {
      panel.classList.toggle("is-open");
    });
  }

  initHeroSlider();
  initFilters();
  initSearchPage();
});

function initHeroSlider() {
  var slides = Array.prototype.slice.call(document.querySelectorAll("[data-hero-slide]"));
  var dots = Array.prototype.slice.call(document.querySelectorAll("[data-hero-dot]"));

  if (!slides.length || !dots.length) {
    return;
  }

  var current = 0;
  var timer = null;

  function show(index) {
    current = index;
    slides.forEach(function (slide, i) {
      slide.classList.toggle("is-active", i === index);
    });
    dots.forEach(function (dot, i) {
      dot.classList.toggle("is-active", i === index);
    });
  }

  function next() {
    show((current + 1) % slides.length);
  }

  function start() {
    stop();
    timer = setInterval(next, 5200);
  }

  function stop() {
    if (timer) {
      clearInterval(timer);
    }
  }

  dots.forEach(function (dot, index) {
    dot.addEventListener("click", function () {
      show(index);
      start();
    });
  });

  start();
}

function initFilters() {
  var panels = Array.prototype.slice.call(document.querySelectorAll("[data-filter-panel]"));

  panels.forEach(function (panel) {
    var scope = panel.getAttribute("data-filter-panel");
    var cards = Array.prototype.slice.call(document.querySelectorAll('[data-filter-scope="' + scope + '"] .movie-card'));
    var input = panel.querySelector("[data-filter-text]");
    var yearSelect = panel.querySelector("[data-filter-year]");
    var typeSelect = panel.querySelector("[data-filter-type]");
    var empty = document.querySelector('[data-empty-state="' + scope + '"]');

    function apply() {
      var text = input ? input.value.trim().toLowerCase() : "";
      var year = yearSelect ? yearSelect.value : "";
      var type = typeSelect ? typeSelect.value : "";
      var visible = 0;

      cards.forEach(function (card) {
        var content = [
          card.getAttribute("data-title") || "",
          card.getAttribute("data-genre") || "",
          card.getAttribute("data-region") || "",
          card.getAttribute("data-type") || "",
          card.getAttribute("data-year") || ""
        ].join(" ").toLowerCase();
        var cardYear = card.getAttribute("data-year") || "";
        var cardType = card.getAttribute("data-type") || "";
        var matchText = !text || content.indexOf(text) !== -1;
        var matchYear = !year || cardYear === year;
        var matchType = !type || cardType.indexOf(type) !== -1;
        var ok = matchText && matchYear && matchType;

        card.style.display = ok ? "" : "none";
        if (ok) {
          visible += 1;
        }
      });

      if (empty) {
        empty.classList.toggle("is-visible", visible === 0);
      }
    }

    if (input) {
      input.addEventListener("input", apply);
    }
    if (yearSelect) {
      yearSelect.addEventListener("change", apply);
    }
    if (typeSelect) {
      typeSelect.addEventListener("change", apply);
    }

    apply();
  });
}

function initSearchPage() {
  var input = document.querySelector("[data-search-input]");

  if (!input) {
    return;
  }

  var params = new URLSearchParams(window.location.search);
  var q = params.get("q") || "";

  if (q) {
    input.value = q;
    input.dispatchEvent(new Event("input"));
  }
}

function setupMoviePlayer(mediaUrl) {
  var video = document.querySelector("[data-player-video]");
  var cover = document.querySelector("[data-player-cover]");
  var button = document.querySelector("[data-player-button]");

  if (!video || !mediaUrl) {
    return;
  }

  var attached = false;

  function attachMedia() {
    if (attached) {
      return;
    }

    attached = true;

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = mediaUrl;
    } else if (window.Hls && window.Hls.isSupported()) {
      var hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 90
      });
      hls.loadSource(mediaUrl);
      hls.attachMedia(video);
    } else {
      video.src = mediaUrl;
    }
  }

  function play() {
    attachMedia();

    if (cover) {
      cover.classList.add("is-hidden");
    }

    video.controls = true;
    var started = video.play();

    if (started && typeof started.catch === "function") {
      started.catch(function () {
        if (cover) {
          cover.classList.remove("is-hidden");
        }
      });
    }
  }

  if (cover) {
    cover.addEventListener("click", play);
  }

  if (button) {
    button.addEventListener("click", function (event) {
      event.preventDefault();
      event.stopPropagation();
      play();
    });
  }

  video.addEventListener("click", function () {
    if (!attached) {
      play();
    }
  });
}
