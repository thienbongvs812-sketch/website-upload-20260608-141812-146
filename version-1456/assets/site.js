(function () {
  function qs(selector, context) {
    return (context || document).querySelector(selector);
  }

  function qsa(selector, context) {
    return Array.prototype.slice.call((context || document).querySelectorAll(selector));
  }

  function text(value) {
    return (value || '').toString().toLowerCase().trim();
  }

  function initMobileMenu() {
    var button = qs('[data-mobile-toggle]');
    var panel = qs('[data-mobile-panel]');
    if (!button || !panel) {
      return;
    }
    button.addEventListener('click', function () {
      panel.classList.toggle('is-open');
    });
  }

  function initHero() {
    var slider = qs('[data-hero-slider]');
    if (!slider) {
      return;
    }
    var slides = qsa('.hero-slide', slider);
    var dots = qsa('[data-hero-dot]', slider);
    var prev = qs('[data-hero-prev]', slider);
    var next = qs('[data-hero-next]', slider);
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5600);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    if (prev) {
      prev.addEventListener('click', function () {
        show(index - 1);
        start();
      });
    }
    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
        start();
      });
    }
    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(parseInt(dot.getAttribute('data-hero-dot'), 10));
        start();
      });
    });
    slider.addEventListener('mouseenter', stop);
    slider.addEventListener('mouseleave', start);
    show(0);
    start();
  }

  function initFilters() {
    qsa('.search-scope').forEach(function (scope) {
      var input = qs('[data-search-input]', scope);
      var cards = qsa('.movie-card', scope);
      var filterButtons = qsa('[data-filter-value]', scope);
      var categoryButtons = qsa('[data-category-filter]', scope);
      var typeFilter = 'all';
      var categoryFilter = 'all';

      function apply() {
        var keyword = input ? text(input.value) : '';
        cards.forEach(function (card) {
          var haystack = text([
            card.getAttribute('data-title'),
            card.getAttribute('data-type'),
            card.getAttribute('data-region'),
            card.getAttribute('data-year'),
            card.getAttribute('data-genre'),
            card.getAttribute('data-tags')
          ].join(' '));
          var cardType = card.getAttribute('data-type') || '';
          var cardCategory = card.getAttribute('data-category') || '';
          var matchKeyword = !keyword || haystack.indexOf(keyword) !== -1;
          var matchType = typeFilter === 'all' || cardType === typeFilter;
          var matchCategory = categoryFilter === 'all' || cardCategory === categoryFilter;
          card.classList.toggle('is-hidden-by-filter', !(matchKeyword && matchType && matchCategory));
        });
      }

      if (input) {
        var params = new URLSearchParams(window.location.search);
        var query = params.get('q');
        if (query) {
          input.value = query;
        }
        input.addEventListener('input', apply);
      }

      filterButtons.forEach(function (button) {
        button.addEventListener('click', function () {
          typeFilter = button.getAttribute('data-filter-value') || 'all';
          filterButtons.forEach(function (item) {
            item.classList.toggle('is-active', item === button);
          });
          apply();
        });
      });

      categoryButtons.forEach(function (button) {
        button.addEventListener('click', function () {
          categoryFilter = button.getAttribute('data-category-filter') || 'all';
          categoryButtons.forEach(function (item) {
            item.classList.toggle('is-active', item === button);
          });
          apply();
        });
      });

      apply();
    });
  }

  function initSmoothPlayLinks() {
    qsa('a[href="#play"]').forEach(function (link) {
      link.addEventListener('click', function (event) {
        var target = qs('#play');
        if (target) {
          event.preventDefault();
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      });
    });
  }

  window.initVideoPlayer = function (streamUrl) {
    var video = qs('#mainVideo');
    var overlay = qs('#playOverlay');
    var message = qs('#playerMessage');
    var prepared = false;
    var hlsInstance = null;

    function setMessage(value) {
      if (message) {
        message.textContent = value || '';
      }
    }

    function prepare() {
      if (!video || prepared) {
        return;
      }
      prepared = true;
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = streamUrl;
      } else if (typeof Hls !== 'undefined' && Hls.isSupported()) {
        hlsInstance = new Hls({ enableWorker: true, lowLatencyMode: true });
        hlsInstance.loadSource(streamUrl);
        hlsInstance.attachMedia(video);
        hlsInstance.on(Hls.Events.ERROR, function (event, data) {
          if (data && data.fatal) {
            setMessage('播放暂时无法加载，请稍后再试');
          }
        });
      } else {
        video.src = streamUrl;
      }
      video.addEventListener('ended', function () {
        if (overlay) {
          overlay.classList.remove('is-hidden');
        }
      });
      window.addEventListener('pagehide', function () {
        if (hlsInstance) {
          hlsInstance.destroy();
        }
      });
    }

    function play() {
      if (!video) {
        return;
      }
      prepare();
      setMessage('');
      if (overlay) {
        overlay.classList.add('is-hidden');
      }
      var result = video.play();
      if (result && typeof result.catch === 'function') {
        result.catch(function () {
          if (overlay) {
            overlay.classList.remove('is-hidden');
          }
        });
      }
    }

    if (overlay) {
      overlay.addEventListener('click', play);
    }
    if (video) {
      video.addEventListener('click', function () {
        if (video.paused) {
          play();
        }
      });
    }
  };

  document.addEventListener('DOMContentLoaded', function () {
    initMobileMenu();
    initHero();
    initFilters();
    initSmoothPlayLinks();
  });
})();
