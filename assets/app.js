(function () {
    function qs(selector, scope) {
        return (scope || document).querySelector(selector);
    }

    function qsa(selector, scope) {
        return Array.prototype.slice.call((scope || document).querySelectorAll(selector));
    }

    function normalize(value) {
        return String(value || '').trim().toLowerCase();
    }

    function initMenu() {
        var button = qs('[data-menu-button]');
        var nav = qs('[data-site-nav]');
        if (!button || !nav) {
            return;
        }
        button.addEventListener('click', function () {
            nav.classList.toggle('is-open');
        });
    }

    function initHero() {
        var hero = qs('[data-hero]');
        if (!hero) {
            return;
        }
        var slides = qsa('[data-hero-slide]', hero);
        var dots = qsa('[data-hero-dot]', hero);
        var index = 0;
        var timer;

        function show(nextIndex) {
            if (!slides.length) {
                return;
            }
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, itemIndex) {
                slide.classList.toggle('is-active', itemIndex === index);
            });
            dots.forEach(function (dot, itemIndex) {
                dot.classList.toggle('is-active', itemIndex === index);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5200);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
            }
        }

        var next = qs('[data-hero-next]', hero);
        var prev = qs('[data-hero-prev]', hero);
        if (next) {
            next.addEventListener('click', function () {
                show(index + 1);
                start();
            });
        }
        if (prev) {
            prev.addEventListener('click', function () {
                show(index - 1);
                start();
            });
        }
        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                show(parseInt(dot.getAttribute('data-hero-dot'), 10));
                start();
            });
        });
        hero.addEventListener('mouseenter', stop);
        hero.addEventListener('mouseleave', start);
        show(0);
        start();
    }

    function initFilters() {
        qsa('.js-filter-form').forEach(function (form) {
            var scope = form.parentElement || document;
            var grids = qsa('[data-filter-grid]', scope);
            var cards = [];
            grids.forEach(function (grid) {
                cards = cards.concat(qsa('.movie-card', grid));
            });
            if (!cards.length) {
                return;
            }
            var search = qs('[data-filter-search]', form);
            var type = qs('[data-filter-type]', form);
            var year = qs('[data-filter-year]', form);
            var empty = qs('[data-filter-empty]', scope);

            function apply() {
                var term = normalize(search && search.value);
                var typeValue = normalize(type && type.value);
                var yearValue = parseInt(year && year.value, 10);
                var visible = 0;
                cards.forEach(function (card) {
                    var haystack = normalize([
                        card.getAttribute('data-title'),
                        card.getAttribute('data-region'),
                        card.getAttribute('data-type'),
                        card.getAttribute('data-genre'),
                        card.getAttribute('data-tags')
                    ].join(' '));
                    var cardType = normalize(card.getAttribute('data-type'));
                    var cardYear = parseInt(card.getAttribute('data-year'), 10) || 0;
                    var ok = true;
                    if (term && haystack.indexOf(term) === -1) {
                        ok = false;
                    }
                    if (typeValue && cardType.indexOf(typeValue) === -1) {
                        ok = false;
                    }
                    if (yearValue && cardYear < yearValue) {
                        ok = false;
                    }
                    card.style.display = ok ? '' : 'none';
                    if (ok) {
                        visible += 1;
                    }
                });
                if (empty) {
                    empty.classList.toggle('is-visible', visible === 0);
                }
            }

            [search, type, year].forEach(function (item) {
                if (item) {
                    item.addEventListener('input', apply);
                    item.addEventListener('change', apply);
                }
            });
        });
    }

    function initPlayers() {
        qsa('.player').forEach(function (player) {
            var video = qs('video', player);
            var button = qs('.play-layer', player);
            var src = player.getAttribute('data-hls');
            var loaded = false;
            var hlsInstance = null;

            function load() {
                if (!video || !src || loaded) {
                    return;
                }
                if (video.canPlayType('application/vnd.apple.mpegurl')) {
                    video.src = src;
                } else if (window.Hls && window.Hls.isSupported()) {
                    hlsInstance = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: true
                    });
                    hlsInstance.loadSource(src);
                    hlsInstance.attachMedia(video);
                } else {
                    video.src = src;
                }
                loaded = true;
            }

            function play() {
                load();
                player.classList.add('is-playing');
                if (video) {
                    var result = video.play();
                    if (result && typeof result.catch === 'function') {
                        result.catch(function () {});
                    }
                }
            }

            if (button) {
                button.addEventListener('click', play);
            }
            if (video) {
                video.addEventListener('click', function () {
                    if (video.paused) {
                        play();
                    }
                });
                video.addEventListener('play', function () {
                    player.classList.add('is-playing');
                });
                video.addEventListener('ended', function () {
                    if (hlsInstance && typeof hlsInstance.stopLoad === 'function') {
                        hlsInstance.stopLoad();
                    }
                });
            }
        });
    }

    document.addEventListener('DOMContentLoaded', function () {
        initMenu();
        initHero();
        initFilters();
        initPlayers();
    });
}());
