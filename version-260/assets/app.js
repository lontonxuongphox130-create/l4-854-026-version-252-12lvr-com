(function () {
    function select(selector, root) {
        return (root || document).querySelector(selector);
    }

    function selectAll(selector, root) {
        return Array.prototype.slice.call((root || document).querySelectorAll(selector));
    }

    function escapeHtml(value) {
        return String(value || "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    function setupMobileMenu() {
        var toggle = select(".mobile-toggle");
        var menu = select(".mobile-menu");
        if (!toggle || !menu) {
            return;
        }
        toggle.addEventListener("click", function () {
            var open = menu.hasAttribute("hidden");
            if (open) {
                menu.removeAttribute("hidden");
            } else {
                menu.setAttribute("hidden", "");
            }
            toggle.setAttribute("aria-expanded", String(open));
        });
    }

    function setupHero() {
        var hero = select("[data-hero]");
        if (!hero) {
            return;
        }
        var slides = selectAll(".hero-slide", hero);
        var dots = selectAll(".hero-dot", hero);
        if (slides.length < 2) {
            return;
        }
        var index = 0;
        var timer;
        function show(next) {
            index = (next + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle("is-active", i === index);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle("is-active", i === index);
            });
        }
        function start() {
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5200);
        }
        dots.forEach(function (dot) {
            dot.addEventListener("click", function () {
                window.clearInterval(timer);
                show(Number(dot.getAttribute("data-slide") || 0));
                start();
            });
        });
        start();
    }

    function setupFilters() {
        selectAll("[data-filter-form]").forEach(function (form) {
            var textInput = select("[data-filter-text]", form);
            var yearSelect = select("[data-filter-year]", form);
            var list = form.parentElement ? select("[data-filter-list]", form.parentElement) : null;
            if (!list) {
                return;
            }
            var cards = selectAll(".movie-card", list);
            function apply() {
                var keyword = (textInput && textInput.value ? textInput.value : "").trim().toLowerCase();
                var year = yearSelect && yearSelect.value ? yearSelect.value : "";
                cards.forEach(function (card) {
                    var search = (card.getAttribute("data-search") || "").toLowerCase();
                    var cardYear = card.getAttribute("data-year") || "";
                    var ok = (!keyword || search.indexOf(keyword) !== -1) && (!year || cardYear === year);
                    card.classList.toggle("hidden-by-filter", !ok);
                });
            }
            if (textInput) {
                textInput.addEventListener("input", apply);
            }
            if (yearSelect) {
                yearSelect.addEventListener("change", apply);
            }
        });
    }

    function cardTemplate(movie) {
        return [
            '<article class="movie-card">',
            '<a class="movie-thumb" href="' + escapeHtml(movie.file) + '">',
            '<img src="' + escapeHtml(movie.cover) + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">',
            '</a>',
            '<div class="movie-info">',
            '<div class="movie-meta"><span>' + escapeHtml(movie.category) + '</span><span>' + escapeHtml(movie.year) + '年</span></div>',
            '<h3><a href="' + escapeHtml(movie.file) + '">' + escapeHtml(movie.title) + '</a></h3>',
            '<p>' + escapeHtml(movie.oneLine) + '</p>',
            '</div>',
            '</article>'
        ].join("");
    }

    function setupSearchPage() {
        var results = select("[data-search-results]");
        if (!results || !window.movieSearchIndex) {
            return;
        }
        var params = new URLSearchParams(window.location.search);
        var query = (params.get("q") || "").trim().toLowerCase();
        var formInput = select(".hero-search input[name='q']");
        var summary = select("[data-search-summary]");
        if (formInput) {
            formInput.value = query;
        }
        if (!query) {
            return;
        }
        var matched = window.movieSearchIndex.filter(function (movie) {
            return String(movie.search || "").toLowerCase().indexOf(query) !== -1;
        }).slice(0, 120);
        if (summary) {
            summary.textContent = matched.length ? "已为你筛选出相关影片。" : "没有找到匹配内容，可尝试更换关键词。";
        }
        results.innerHTML = matched.length ? matched.map(cardTemplate).join("") : "";
    }

    document.addEventListener("DOMContentLoaded", function () {
        setupMobileMenu();
        setupHero();
        setupFilters();
        setupSearchPage();
    });
})();

function initPlayer(url, videoId, wrapId) {
    var video = document.getElementById(videoId);
    var wrap = document.getElementById(wrapId);
    if (!video || !wrap) {
        return;
    }
    var layer = wrap.querySelector(".play-layer");
    var loaded = false;
    var hls = null;
    function attach() {
        if (loaded) {
            return;
        }
        loaded = true;
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = url;
            return;
        }
        if (window.Hls && window.Hls.isSupported()) {
            hls = new window.Hls({ enableWorker: true });
            hls.loadSource(url);
            hls.attachMedia(video);
            hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
                video.play().catch(function () {});
            });
            return;
        }
        video.src = url;
    }
    function play() {
        attach();
        if (layer) {
            layer.classList.add("is-hidden");
        }
        video.controls = true;
        video.play().catch(function () {});
    }
    if (layer) {
        layer.addEventListener("click", play);
    }
    video.addEventListener("click", function () {
        if (video.paused) {
            play();
        }
    });
    video.addEventListener("play", function () {
        if (layer) {
            layer.classList.add("is-hidden");
        }
    });
    window.addEventListener("pagehide", function () {
        if (hls) {
            hls.destroy();
        }
    });
}
