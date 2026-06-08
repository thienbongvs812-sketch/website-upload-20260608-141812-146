(function () {
  function qs(selector, root) {
    return (root || document).querySelector(selector);
  }

  function qsa(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function setupMobileMenu() {
    var button = qs('[data-mobile-menu]');
    var panel = qs('[data-mobile-panel]');
    if (!button || !panel) {
      return;
    }

    button.addEventListener('click', function () {
      panel.classList.toggle('open');
    });
  }

  function setupHero() {
    var hero = qs('[data-hero]');
    if (!hero) {
      return;
    }

    var slides = qsa('[data-hero-slide]', hero);
    var dots = qsa('[data-hero-dot]', hero);
    var prev = qs('[data-hero-prev]', hero);
    var next = qs('[data-hero-next]', hero);
    var current = 0;
    var timer = null;

    function show(index) {
      if (!slides.length) {
        return;
      }
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === current);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5000);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    if (prev) {
      prev.addEventListener('click', function () {
        show(current - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(current + 1);
        start();
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-hero-dot')) || 0);
        start();
      });
    });

    hero.addEventListener('mouseenter', stop);
    hero.addEventListener('mouseleave', start);
    show(0);
    start();
  }

  function setupRails() {
    qsa('.rail-wrap').forEach(function (wrap) {
      var rail = qs('[data-rail]', wrap);
      var left = qs('[data-scroll-left]', wrap);
      var right = qs('[data-scroll-right]', wrap);
      if (!rail) {
        return;
      }

      function scrollByCard(direction) {
        var amount = Math.min(rail.clientWidth * 0.9, 520);
        rail.scrollBy({
          left: direction * amount,
          behavior: 'smooth'
        });
      }

      if (left) {
        left.addEventListener('click', function () {
          scrollByCard(-1);
        });
      }

      if (right) {
        right.addEventListener('click', function () {
          scrollByCard(1);
        });
      }
    });
  }

  function normalize(text) {
    return String(text || '').toLowerCase().trim();
  }

  function setupFilters() {
    var panel = qs('[data-filter-panel]');
    var grid = qs('[data-filter-grid]');
    if (!panel || !grid) {
      return;
    }

    var input = qs('[data-filter-input]', panel);
    var region = qs('[data-filter-region]', panel);
    var type = qs('[data-filter-type]', panel);
    var result = qs('[data-filter-result]', panel);
    var cards = qsa('.movie-card', grid);

    function cardText(card) {
      return normalize([
        card.getAttribute('data-title'),
        card.getAttribute('data-region'),
        card.getAttribute('data-type'),
        card.getAttribute('data-genre'),
        card.getAttribute('data-category'),
        card.textContent
      ].join(' '));
    }

    function applyFilter() {
      var keyword = normalize(input && input.value);
      var selectedRegion = normalize(region && region.value);
      var selectedType = normalize(type && type.value);
      var visibleCount = 0;

      cards.forEach(function (card) {
        var text = cardText(card);
        var cardRegion = normalize(card.getAttribute('data-region'));
        var cardType = normalize(card.getAttribute('data-type'));
        var matchesKeyword = !keyword || text.indexOf(keyword) !== -1;
        var matchesRegion = !selectedRegion || cardRegion === selectedRegion;
        var matchesType = !selectedType || cardType === selectedType;
        var visible = matchesKeyword && matchesRegion && matchesType;

        card.classList.toggle('is-hidden-by-filter', !visible);
        if (visible) {
          visibleCount += 1;
        }
      });

      if (result) {
        result.textContent = '当前显示 ' + visibleCount + ' / ' + cards.length + ' 部影片';
      }
    }

    [input, region, type].forEach(function (control) {
      if (control) {
        control.addEventListener('input', applyFilter);
        control.addEventListener('change', applyFilter);
      }
    });

    applyFilter();
  }

  function setupBackToTop() {
    var button = qs('[data-back-to-top]');
    if (!button) {
      return;
    }

    function update() {
      button.classList.toggle('visible', window.scrollY > 320);
    }

    button.addEventListener('click', function () {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });

    window.addEventListener('scroll', update, { passive: true });
    update();
  }

  document.addEventListener('DOMContentLoaded', function () {
    setupMobileMenu();
    setupHero();
    setupRails();
    setupFilters();
    setupBackToTop();
  });
}());
