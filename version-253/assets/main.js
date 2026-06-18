(function() {
  function getSearchValue(form) {
    var input = form.querySelector('input[name="q"]');
    return input ? input.value.trim() : '';
  }

  function bindMenus() {
    var button = document.querySelector('.menu-toggle');
    var panel = document.querySelector('.mobile-panel');
    if (!button || !panel) {
      return;
    }
    button.addEventListener('click', function() {
      panel.classList.toggle('open');
    });
  }

  function bindSearchForms() {
    var forms = document.querySelectorAll('.search-form, .mobile-search, .search-page-form');
    forms.forEach(function(form) {
      form.addEventListener('submit', function(event) {
        var value = getSearchValue(form);
        if (!value) {
          event.preventDefault();
        }
      });
    });
  }

  function bindHero() {
    var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
    if (!slides.length) {
      return;
    }
    var dots = Array.prototype.slice.call(document.querySelectorAll('.hero-dot'));
    var prev = document.querySelector('.hero-control.prev');
    var next = document.querySelector('.hero-control.next');
    var index = 0;
    var timer = null;

    function show(target) {
      index = (target + slides.length) % slides.length;
      slides.forEach(function(slide, i) {
        slide.classList.toggle('active', i === index);
      });
      dots.forEach(function(dot, i) {
        dot.classList.toggle('active', i === index);
      });
    }

    function play() {
      stop();
      timer = window.setInterval(function() {
        show(index + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    dots.forEach(function(dot) {
      dot.addEventListener('click', function() {
        show(Number(dot.getAttribute('data-slide')) || 0);
        play();
      });
    });
    if (prev) {
      prev.addEventListener('click', function() {
        show(index - 1);
        play();
      });
    }
    if (next) {
      next.addEventListener('click', function() {
        show(index + 1);
        play();
      });
    }
    play();
  }

  function bindFilters() {
    var grid = document.querySelector('.filter-grid') || document.querySelector('.ranking-list');
    var input = document.querySelector('.filter-input');
    var year = document.querySelector('.year-filter');
    if (!grid || (!input && !year)) {
      return;
    }
    var cards = Array.prototype.slice.call(grid.querySelectorAll('[data-search]'));

    function apply() {
      var keyword = input ? input.value.trim().toLowerCase() : '';
      var yearValue = year ? year.value : '';
      cards.forEach(function(card) {
        var text = card.getAttribute('data-search') || '';
        var cardYear = card.getAttribute('data-year') || '';
        var matchKeyword = !keyword || text.indexOf(keyword) !== -1;
        var matchYear = !yearValue || cardYear === yearValue;
        card.classList.toggle('is-hidden-card', !(matchKeyword && matchYear));
      });
    }

    if (input) {
      input.addEventListener('input', apply);
    }
    if (year) {
      year.addEventListener('change', apply);
    }
  }

  function renderSearchPage() {
    var resultBox = document.getElementById('search-results');
    var status = document.getElementById('search-status');
    var input = document.getElementById('search-page-input');
    if (!resultBox || !status || !window.MOVIE_SEARCH_DATA) {
      return;
    }
    var params = new URLSearchParams(window.location.search);
    var query = (params.get('q') || '').trim();
    if (input) {
      input.value = query;
    }
    if (!query) {
      status.textContent = '输入关键词查看影片';
      return;
    }
    var lower = query.toLowerCase();
    var results = window.MOVIE_SEARCH_DATA.filter(function(movie) {
      return movie.search.indexOf(lower) !== -1;
    }).slice(0, 120);
    status.textContent = results.length ? '相关影片' : '未找到匹配影片';
    resultBox.innerHTML = results.map(function(movie) {
      var tags = movie.tags.slice(0, 2).map(function(tag) {
        return '<span>' + escapeHtml(tag) + '</span>';
      }).join('');
      return '<article class="movie-card">' +
        '<a href="' + movie.url + '" class="card-link">' +
        '<div class="poster-wrap"><img src="' + movie.cover + '" alt="' + escapeHtml(movie.title) + '" loading="lazy"><span class="year-badge">' + escapeHtml(movie.year) + '</span></div>' +
        '<div class="card-body"><h3>' + escapeHtml(movie.title) + '</h3><div class="card-tags">' + tags + '</div><div class="card-meta"><span>' + escapeHtml(movie.region) + '</span><span>' + escapeHtml(movie.type) + '</span></div></div>' +
        '</a></article>';
    }).join('');
  }

  function escapeHtml(value) {
    return String(value).replace(/[&<>"]/g, function(char) {
      return {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;'
      }[char];
    });
  }

  document.addEventListener('DOMContentLoaded', function() {
    bindMenus();
    bindSearchForms();
    bindHero();
    bindFilters();
    renderSearchPage();
  });
})();
