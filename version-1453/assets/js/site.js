(function () {
  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
      return;
    }
    callback();
  }

  function setupMenu() {
    var toggle = document.querySelector('[data-menu-toggle]');
    var nav = document.querySelector('[data-main-nav]');
    if (!toggle || !nav) {
      return;
    }
    toggle.addEventListener('click', function () {
      nav.classList.toggle('is-open');
    });
  }

  function setupHero() {
    var slider = document.querySelector('[data-hero-slider]');
    if (!slider) {
      return;
    }
    var slides = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-dot]'));
    if (slides.length <= 1) {
      return;
    }
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === index);
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

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        var nextIndex = Number(dot.getAttribute('data-hero-dot')) || 0;
        show(nextIndex);
        start();
      });
    });

    slider.addEventListener('mouseenter', stop);
    slider.addEventListener('mouseleave', start);
    start();
  }

  function setupSearchForms() {
    var forms = Array.prototype.slice.call(document.querySelectorAll('[data-search-form]'));
    forms.forEach(function (form) {
      form.addEventListener('submit', function (event) {
        var input = form.querySelector('input[name="q"]');
        if (!input || !input.value.trim()) {
          event.preventDefault();
          input && input.focus();
        }
      });
    });
  }

  function normalize(value) {
    return String(value || '').trim().toLowerCase();
  }

  function matchText(card, query) {
    if (!query) {
      return true;
    }
    var haystack = [
      card.getAttribute('data-title'),
      card.getAttribute('data-region'),
      card.getAttribute('data-type'),
      card.getAttribute('data-year'),
      card.getAttribute('data-category'),
      card.getAttribute('data-tags'),
      card.textContent
    ].join(' ').toLowerCase();
    return haystack.indexOf(query) !== -1;
  }

  function setupFilters() {
    var lists = Array.prototype.slice.call(document.querySelectorAll('.js-movie-list'));
    if (!lists.length) {
      return;
    }
    var search = document.querySelector('.js-search-input');
    var typeFilter = document.querySelector('.js-type-filter');
    var yearFilter = document.querySelector('.js-year-filter');
    var categoryFilter = document.querySelector('.js-category-filter');
    var emptyState = document.querySelector('[data-empty-state]');
    var params = new URLSearchParams(window.location.search);
    var queryFromUrl = params.get('q');

    if (queryFromUrl && search) {
      search.value = queryFromUrl;
    }

    function apply() {
      var query = normalize(search && search.value);
      var typeValue = normalize(typeFilter && typeFilter.value);
      var yearValue = normalize(yearFilter && yearFilter.value);
      var categoryValue = normalize(categoryFilter && categoryFilter.value);
      var visibleCount = 0;

      lists.forEach(function (list) {
        var cards = Array.prototype.slice.call(list.querySelectorAll('.movie-card'));
        cards.forEach(function (card) {
          var matches = matchText(card, query);
          var cardType = normalize(card.getAttribute('data-type'));
          var cardYear = normalize(card.getAttribute('data-year'));
          var cardCategory = normalize(card.getAttribute('data-category'));

          if (typeValue && typeValue !== 'all') {
            matches = matches && cardType.indexOf(typeValue) !== -1;
          }
          if (yearValue && yearValue !== 'all') {
            matches = matches && cardYear === yearValue;
          }
          if (categoryValue && categoryValue !== 'all') {
            matches = matches && cardCategory === categoryValue;
          }

          card.classList.toggle('is-hidden', !matches);
          if (matches) {
            visibleCount += 1;
          }
        });
      });

      if (emptyState) {
        emptyState.classList.toggle('is-visible', visibleCount === 0);
      }
    }

    [search, typeFilter, yearFilter, categoryFilter].forEach(function (element) {
      if (element) {
        element.addEventListener('input', apply);
        element.addEventListener('change', apply);
      }
    });
    apply();
  }

  function setupPlayer() {
    var players = Array.prototype.slice.call(document.querySelectorAll('[data-player]'));
    players.forEach(function (shell) {
      var source = shell.getAttribute('data-m3u8');
      var video = shell.querySelector('video');
      var button = shell.querySelector('[data-play-button]');
      var message = shell.querySelector('[data-player-message]');
      var hlsInstance = null;
      var loaded = false;

      if (!source || !video || !button) {
        return;
      }

      function setMessage(text) {
        if (message) {
          message.textContent = text || '';
        }
      }

      function attachSource() {
        if (loaded) {
          return;
        }
        loaded = true;
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = source;
          return;
        }
        if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hlsInstance.loadSource(source);
          hlsInstance.attachMedia(video);
          hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
            if (data && data.fatal) {
              setMessage('播放源连接异常，请刷新页面后重试。');
            }
          });
          return;
        }
        video.src = source;
        setMessage('当前浏览器可直接尝试播放，如无法播放请更换支持流媒体播放的浏览器。');
      }

      button.addEventListener('click', function () {
        attachSource();
        shell.classList.add('is-playing');
        var promise = video.play();
        if (promise && typeof promise.catch === 'function') {
          promise.catch(function () {
            setMessage('请再次点击播放器中的播放按钮开始观看。');
          });
        }
      });
    });
  }

  ready(function () {
    setupMenu();
    setupHero();
    setupSearchForms();
    setupFilters();
    setupPlayer();
  });
})();
