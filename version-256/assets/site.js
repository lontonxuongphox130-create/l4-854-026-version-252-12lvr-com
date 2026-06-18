(function () {
  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  }

  function normalize(value) {
    return String(value || '').toLowerCase().trim();
  }

  ready(function () {
    var toggle = document.querySelector('.mobile-toggle');
    var panel = document.querySelector('.mobile-panel');
    if (toggle && panel) {
      toggle.addEventListener('click', function () {
        var open = panel.classList.toggle('is-open');
        toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      });
    }

    var slider = document.querySelector('[data-hero-slider]');
    if (slider) {
      var slides = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-slide]'));
      var dots = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-dot]'));
      var index = 0;
      var timer = null;
      var show = function (next) {
        if (!slides.length) {
          return;
        }
        index = (next + slides.length) % slides.length;
        slides.forEach(function (slide, slideIndex) {
          slide.classList.toggle('is-active', slideIndex === index);
        });
        dots.forEach(function (dot, dotIndex) {
          dot.classList.toggle('is-active', dotIndex === index);
        });
      };
      var start = function () {
        if (timer) {
          clearInterval(timer);
        }
        timer = setInterval(function () {
          show(index + 1);
        }, 5600);
      };
      dots.forEach(function (dot, dotIndex) {
        dot.addEventListener('click', function () {
          show(dotIndex);
          start();
        });
      });
      start();
    }

    var filterInputs = Array.prototype.slice.call(document.querySelectorAll('[data-page-search]'));
    var cards = Array.prototype.slice.call(document.querySelectorAll('[data-movie-card]'));
    var filterButtons = Array.prototype.slice.call(document.querySelectorAll('[data-filter-value], [data-filter-keyword]'));
    var activeCategory = 'all';
    var activeKeyword = '';

    function applyFilters() {
      var terms = filterInputs.map(function (input) {
        return normalize(input.value);
      }).filter(Boolean);
      cards.forEach(function (card) {
        var text = normalize(card.getAttribute('data-filter-text') || card.textContent);
        var category = card.getAttribute('data-category') || '';
        var matchText = terms.every(function (term) {
          return text.indexOf(term) !== -1;
        });
        var matchCategory = activeCategory === 'all' || category === activeCategory;
        var matchKeyword = !activeKeyword || text.indexOf(normalize(activeKeyword)) !== -1;
        card.style.display = matchText && matchCategory && matchKeyword ? '' : 'none';
      });
    }

    if (filterInputs.length && cards.length) {
      var params = new URLSearchParams(window.location.search);
      var query = params.get('q');
      if (query) {
        filterInputs.forEach(function (input) {
          input.value = query;
        });
      }
      filterInputs.forEach(function (input) {
        input.addEventListener('input', applyFilters);
      });
      filterButtons.forEach(function (button) {
        button.addEventListener('click', function () {
          filterButtons.forEach(function (item) {
            item.classList.remove('is-active');
          });
          button.classList.add('is-active');
          activeCategory = button.getAttribute('data-filter-value') || 'all';
          activeKeyword = button.getAttribute('data-filter-keyword') || '';
          applyFilters();
        });
      });
      applyFilters();
    }
  });

  window.initMoviePlayer = function (streamUrl) {
    var video = document.querySelector('[data-player-video]');
    var cover = document.querySelector('[data-player-cover]');
    if (!video || !streamUrl) {
      return;
    }
    var loaded = false;
    var instance = null;

    function attach() {
      if (loaded) {
        return;
      }
      loaded = true;
      if (window.Hls && window.Hls.isSupported()) {
        instance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 60
        });
        instance.loadSource(streamUrl);
        instance.attachMedia(video);
        instance.on(window.Hls.Events.ERROR, function (eventName, data) {
          if (!data || !data.fatal) {
            return;
          }
          if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
            instance.startLoad();
          } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
            instance.recoverMediaError();
          } else {
            instance.destroy();
          }
        });
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = streamUrl;
      } else {
        video.src = streamUrl;
      }
    }

    function play() {
      attach();
      if (cover) {
        cover.classList.add('is-hidden');
      }
      video.controls = true;
      var action = video.play();
      if (action && typeof action.catch === 'function') {
        action.catch(function () {});
      }
    }

    if (cover) {
      cover.addEventListener('click', play);
    }
    video.addEventListener('click', function () {
      if (!loaded || video.paused) {
        play();
      }
    });
    video.addEventListener('play', attach);
    window.addEventListener('pagehide', function () {
      if (instance) {
        instance.destroy();
      }
    });
  };
}());
