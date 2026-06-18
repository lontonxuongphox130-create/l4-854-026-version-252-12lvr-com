(function () {
    function selectAll(selector, scope) {
        return Array.prototype.slice.call((scope || document).querySelectorAll(selector));
    }

    function initMobileNav() {
        var toggle = document.querySelector(".nav-toggle");
        var mobileNav = document.querySelector(".mobile-nav");
        if (!toggle || !mobileNav) {
            return;
        }
        toggle.addEventListener("click", function () {
            var open = mobileNav.hasAttribute("hidden");
            if (open) {
                mobileNav.removeAttribute("hidden");
            } else {
                mobileNav.setAttribute("hidden", "");
            }
            toggle.setAttribute("aria-expanded", String(open));
        });
    }

    function initHero() {
        var hero = document.querySelector(".hero");
        if (!hero) {
            return;
        }
        var slides = selectAll(".hero-slide", hero);
        var dots = selectAll(".hero-dot", hero);
        if (slides.length < 2) {
            return;
        }
        var index = 0;
        var timer = null;
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
        function restart() {
            if (timer) {
                window.clearInterval(timer);
            }
            start();
        }
        dots.forEach(function (dot, i) {
            dot.addEventListener("click", function () {
                show(i);
                restart();
            });
        });
        show(0);
        start();
    }

    function initSearchForms() {
        selectAll("form[action='./search.html']").forEach(function (form) {
            form.addEventListener("submit", function (event) {
                var input = form.querySelector("input[name='q']");
                if (!input || !input.value.trim()) {
                    event.preventDefault();
                    window.location.href = "./search.html";
                }
            });
        });
    }

    function normalize(value) {
        return String(value || "").toLowerCase().trim();
    }

    function applyFilter(input, cards, empty) {
        var keyword = normalize(input.value);
        var visible = 0;
        cards.forEach(function (card) {
            var matched = !keyword || normalize(card.getAttribute("data-search")).indexOf(keyword) !== -1;
            card.style.display = matched ? "" : "none";
            if (matched) {
                visible += 1;
            }
        });
        if (empty) {
            empty.classList.toggle("is-visible", visible === 0);
        }
    }

    function initCategoryFilter() {
        var input = document.querySelector(".category-filter input");
        if (!input) {
            return;
        }
        var cards = selectAll(".searchable-card");
        var empty = document.querySelector(".empty-state");
        input.addEventListener("input", function () {
            applyFilter(input, cards, empty);
        });
    }

    function initSearchPage() {
        var input = document.getElementById("siteSearchInput");
        if (!input) {
            return;
        }
        var params = new URLSearchParams(window.location.search);
        var query = params.get("q") || "";
        input.value = query;
        var cards = selectAll(".searchable-card");
        var empty = document.querySelector(".empty-state");
        var run = function () {
            applyFilter(input, cards, empty);
        };
        input.addEventListener("input", run);
        run();
    }

    document.addEventListener("DOMContentLoaded", function () {
        initMobileNav();
        initHero();
        initSearchForms();
        initCategoryFilter();
        initSearchPage();
    });
})();

window.setupHlsPlayer = function (sourceUrl, videoId, overlayId) {
    var video = document.getElementById(videoId);
    var overlay = document.getElementById(overlayId);
    if (!video || !overlay) {
        return;
    }
    var attached = false;
    function attach() {
        if (attached) {
            return;
        }
        attached = true;
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = sourceUrl;
            return;
        }
        if (window.Hls && window.Hls.isSupported()) {
            var hls = new window.Hls({
                enableWorker: true,
                lowLatencyMode: true
            });
            hls.loadSource(sourceUrl);
            hls.attachMedia(video);
            return;
        }
        video.src = sourceUrl;
    }
    function play() {
        attach();
        overlay.classList.add("is-hidden");
        video.controls = true;
        var promise = video.play();
        if (promise && promise.catch) {
            promise.catch(function () {});
        }
    }
    overlay.addEventListener("click", play);
    video.addEventListener("click", function () {
        if (!attached || video.paused) {
            play();
        }
    });
};
