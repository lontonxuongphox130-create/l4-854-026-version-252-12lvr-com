(function () {
    var menuButton = document.querySelector('[data-menu-toggle]');
    var mobileMenu = document.querySelector('[data-mobile-menu]');

    if (menuButton && mobileMenu) {
        menuButton.addEventListener('click', function () {
            mobileMenu.classList.toggle('is-open');
        });
    }

    var slider = document.querySelector('[data-hero-slider]');

    if (slider) {
        var slides = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-dot]'));
        var prev = slider.querySelector('[data-hero-prev]');
        var next = slider.querySelector('[data-hero-next]');
        var current = 0;
        var timer = null;

        function show(index) {
            if (!slides.length) {
                return;
            }
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === current);
            });
        }

        function restart() {
            if (timer) {
                clearInterval(timer);
            }
            timer = setInterval(function () {
                show(current + 1);
            }, 6500);
        }

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                show(Number(dot.getAttribute('data-hero-dot')) || 0);
                restart();
            });
        });

        if (prev) {
            prev.addEventListener('click', function () {
                show(current - 1);
                restart();
            });
        }

        if (next) {
            next.addEventListener('click', function () {
                show(current + 1);
                restart();
            });
        }

        restart();
    }

    var filterList = document.querySelector('[data-card-list]');

    if (filterList) {
        var searchInput = document.querySelector('[data-card-search]');
        var yearSelect = document.querySelector('[data-card-year]');
        var cards = Array.prototype.slice.call(filterList.querySelectorAll('.movie-card'));

        function applyFilter() {
            var keyword = searchInput ? searchInput.value.trim().toLowerCase() : '';
            var year = yearSelect ? yearSelect.value : '';

            cards.forEach(function (card) {
                var text = [
                    card.getAttribute('data-title'),
                    card.getAttribute('data-region'),
                    card.getAttribute('data-type'),
                    card.getAttribute('data-tags'),
                    card.getAttribute('data-year')
                ].join(' ').toLowerCase();
                var okKeyword = !keyword || text.indexOf(keyword) !== -1;
                var okYear = !year || card.getAttribute('data-year') === year;
                card.style.display = okKeyword && okYear ? '' : 'none';
            });
        }

        if (searchInput) {
            searchInput.addEventListener('input', applyFilter);
        }

        if (yearSelect) {
            yearSelect.addEventListener('change', applyFilter);
        }
    }

    function makeCard(item) {
        var tags = (item.tags || []).slice(0, 4).map(function (tag) {
            return '<span>' + escapeHtml(tag) + '</span>';
        }).join('');
        return '<article class="movie-card">' +
            '<a href="' + escapeAttr(item.url) + '" class="movie-link" aria-label="观看' + escapeAttr(item.title) + '">' +
            '<div class="movie-thumb"><img src="' + escapeAttr(item.cover) + '" alt="' + escapeAttr(item.title) + '" loading="lazy"><div class="thumb-shade"></div></div>' +
            '<div class="movie-info"><div class="movie-meta-row"><span class="category-pill">' + escapeHtml(item.category) + '</span><span>' + escapeHtml(item.year) + '年</span></div>' +
            '<h3>' + escapeHtml(item.title) + '</h3><p>' + escapeHtml(item.description) + '</p><div class="tag-row">' + tags + '</div></div>' +
            '</a></article>';
    }

    function escapeHtml(value) {
        return String(value || '').replace(/[&<>"']/g, function (char) {
            return {
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                '"': '&quot;',
                "'": '&#39;'
            }[char];
        });
    }

    function escapeAttr(value) {
        return escapeHtml(value);
    }

    var searchInputPage = document.getElementById('site-search-input');
    var searchButtonPage = document.getElementById('site-search-button');
    var searchResults = document.getElementById('search-results');
    var searchStatus = document.getElementById('search-status');

    if (searchInputPage && searchResults && window.SEARCH_MOVIES) {
        var params = new URLSearchParams(window.location.search);
        var initial = params.get('q') || '';
        searchInputPage.value = initial;

        function renderSearch() {
            var keyword = searchInputPage.value.trim().toLowerCase();
            var matches = window.SEARCH_MOVIES.filter(function (item) {
                var text = [item.title, item.description, item.year, item.region, item.type, item.genre, item.category, (item.tags || []).join(' ')].join(' ').toLowerCase();
                return !keyword || text.indexOf(keyword) !== -1;
            }).slice(0, 120);

            if (matches.length) {
                searchResults.innerHTML = matches.map(makeCard).join('');
                searchStatus.textContent = keyword ? '相关影片' : '精选影片';
            } else {
                searchResults.innerHTML = '';
                searchStatus.textContent = '没有匹配的影片';
            }
        }

        searchInputPage.addEventListener('input', renderSearch);
        if (searchButtonPage) {
            searchButtonPage.addEventListener('click', renderSearch);
        }
        renderSearch();
    }

    window.MoviePlayer = {
        init: function (config) {
            var video = document.getElementById(config.videoId);
            var button = document.getElementById(config.buttonId);
            var source = config.source;
            var ready = false;
            var hls = null;

            function prepare() {
                if (ready || !video || !source) {
                    return;
                }
                ready = true;
                if (video.canPlayType('application/vnd.apple.mpegurl')) {
                    video.src = source;
                } else if (window.Hls && window.Hls.isSupported()) {
                    hls = new window.Hls();
                    hls.loadSource(source);
                    hls.attachMedia(video);
                } else {
                    video.src = source;
                }
            }

            function play() {
                prepare();
                if (button) {
                    button.classList.add('is-hidden');
                }
                var action = video.play();
                if (action && typeof action.catch === 'function') {
                    action.catch(function () {});
                }
            }

            if (!video) {
                return;
            }

            if (button) {
                button.addEventListener('click', play);
            }

            video.addEventListener('click', function () {
                if (video.paused) {
                    play();
                }
            });

            video.addEventListener('play', function () {
                if (button) {
                    button.classList.add('is-hidden');
                }
            });

            window.addEventListener('beforeunload', function () {
                if (hls) {
                    hls.destroy();
                }
            });
        }
    };
})();
