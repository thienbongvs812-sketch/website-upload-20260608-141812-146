(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    ready(function () {
        var menuButton = document.querySelector("[data-menu-toggle]");
        var mobileMenu = document.querySelector("[data-mobile-menu]");

        if (menuButton && mobileMenu) {
            menuButton.addEventListener("click", function () {
                mobileMenu.classList.toggle("is-open");
            });
        }

        document.querySelectorAll(".site-search-form").forEach(function (form) {
            form.addEventListener("submit", function (event) {
                var input = form.querySelector("input[name='q']");
                var query = input ? input.value.trim() : "";

                if (query) {
                    event.preventDefault();
                    window.location.href = "./search.html?q=" + encodeURIComponent(query);
                }
            });
        });

        document.querySelectorAll("[data-carousel]").forEach(function (carousel) {
            var slides = Array.prototype.slice.call(carousel.querySelectorAll("[data-slide]"));
            var dots = Array.prototype.slice.call(carousel.querySelectorAll("[data-slide-to]"));
            var prev = carousel.querySelector("[data-slide-prev]");
            var next = carousel.querySelector("[data-slide-next]");
            var current = 0;
            var timer = null;

            function show(index) {
                if (!slides.length) {
                    return;
                }

                current = (index + slides.length) % slides.length;
                slides.forEach(function (slide, slideIndex) {
                    slide.classList.toggle("is-active", slideIndex === current);
                });
                dots.forEach(function (dot, dotIndex) {
                    dot.classList.toggle("is-active", dotIndex === current);
                });
            }

            function start() {
                stop();
                timer = window.setInterval(function () {
                    show(current + 1);
                }, 5200);
            }

            function stop() {
                if (timer) {
                    window.clearInterval(timer);
                    timer = null;
                }
            }

            dots.forEach(function (dot) {
                dot.addEventListener("click", function () {
                    show(Number(dot.getAttribute("data-slide-to")) || 0);
                    start();
                });
            });

            if (prev) {
                prev.addEventListener("click", function () {
                    show(current - 1);
                    start();
                });
            }

            if (next) {
                next.addEventListener("click", function () {
                    show(current + 1);
                    start();
                });
            }

            carousel.addEventListener("mouseenter", stop);
            carousel.addEventListener("mouseleave", start);
            show(0);
            start();
        });

        document.querySelectorAll("[data-filter-area]").forEach(function (area) {
            var input = area.querySelector("[data-filter-input]");
            var year = area.querySelector("[data-filter-year]");
            var type = area.querySelector("[data-filter-type]");
            var cards = Array.prototype.slice.call(area.querySelectorAll("[data-movie-card]"));
            var count = area.querySelector("[data-result-count]");
            var empty = area.querySelector("[data-empty-state]");
            var pageQuery = new URLSearchParams(window.location.search).get("q") || "";

            if (input && pageQuery && input.value.trim() === "") {
                input.value = pageQuery;
            }

            function apply() {
                var query = input ? input.value.trim().toLowerCase() : "";
                var selectedYear = year ? year.value : "";
                var selectedType = type ? type.value : "";
                var visible = 0;

                cards.forEach(function (card) {
                    var text = card.getAttribute("data-search") || "";
                    var cardYear = card.getAttribute("data-year") || "";
                    var cardType = card.getAttribute("data-type-group") || "";
                    var matched = true;

                    if (query && text.indexOf(query) === -1) {
                        matched = false;
                    }

                    if (selectedYear && cardYear !== selectedYear) {
                        matched = false;
                    }

                    if (selectedType && cardType !== selectedType) {
                        matched = false;
                    }

                    card.style.display = matched ? "" : "none";
                    if (matched) {
                        visible += 1;
                    }
                });

                if (count) {
                    count.textContent = String(visible);
                }

                if (empty) {
                    empty.classList.toggle("is-visible", visible === 0);
                }
            }

            if (input) {
                input.addEventListener("input", apply);
            }
            if (year) {
                year.addEventListener("change", apply);
            }
            if (type) {
                type.addEventListener("change", apply);
            }

            apply();
        });
    });
})();
