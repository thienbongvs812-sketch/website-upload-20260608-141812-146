(function () {
  function ready(callback) {
    if (document.readyState !== 'loading') {
      callback();
      return;
    }
    document.addEventListener('DOMContentLoaded', callback);
  }

  function setupNavigation() {
    var toggle = document.querySelector('[data-nav-toggle]');
    var nav = document.querySelector('[data-main-nav]');
    if (!toggle || !nav) {
      return;
    }
    toggle.addEventListener('click', function () {
      nav.classList.toggle('is-open');
    });
  }

  function setupHero() {
    var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
    var prev = document.querySelector('[data-hero-prev]');
    var next = document.querySelector('[data-hero-next]');
    if (!slides.length) {
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
        timer = null;
      }
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-hero-dot')) || 0);
        start();
      });
    });

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

    var hero = document.querySelector('.hero');
    if (hero) {
      hero.addEventListener('mouseenter', stop);
      hero.addEventListener('mouseleave', start);
    }

    start();
  }

  function normalizeText(value) {
    return String(value || '').toLowerCase().replace(/\s+/g, '');
  }

  function setupCardFilter() {
    var input = document.querySelector('[data-card-filter]');
    var list = document.querySelector('[data-filter-list]');
    if (!input || !list) {
      return;
    }
    var cards = Array.prototype.slice.call(list.querySelectorAll('.movie-card'));
    input.addEventListener('input', function () {
      var keyword = normalizeText(input.value);
      cards.forEach(function (card) {
        var text = normalizeText(card.textContent);
        card.classList.toggle('is-hidden-by-filter', keyword && text.indexOf(keyword) === -1);
      });
    });
  }

  function setupRankFilter() {
    var input = document.querySelector('[data-rank-filter]');
    var list = document.querySelector('[data-rank-list]');
    if (!input || !list) {
      return;
    }
    var items = Array.prototype.slice.call(list.querySelectorAll('.rank-item'));
    input.addEventListener('input', function () {
      var keyword = normalizeText(input.value);
      items.forEach(function (item) {
        var text = normalizeText(item.textContent);
        item.classList.toggle('is-hidden-by-filter', keyword && text.indexOf(keyword) === -1);
      });
    });
  }

  function setupImageFallback() {
    document.addEventListener('error', function (event) {
      var target = event.target;
      if (!target || target.tagName !== 'IMG') {
        return;
      }
      var holder = target.closest('.poster, .rank-poster, .ranking-feature-cover, .detail-cover, .hero-backdrop, .detail-backdrop');
      if (holder) {
        holder.classList.add('is-missing');
      }
      target.style.visibility = 'hidden';
    }, true);
  }

  ready(function () {
    setupNavigation();
    setupHero();
    setupCardFilter();
    setupRankFilter();
    setupImageFallback();
  });
}());
