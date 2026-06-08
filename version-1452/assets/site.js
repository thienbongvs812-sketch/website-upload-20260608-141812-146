(function () {
    var menuButton = document.querySelector("[data-menu-toggle]");
    var mobilePanel = document.querySelector("[data-mobile-panel]");

    if (menuButton && mobilePanel) {
        menuButton.addEventListener("click", function () {
            mobilePanel.classList.toggle("is-open");
            menuButton.textContent = mobilePanel.classList.contains("is-open") ? "×" : "☰";
        });
    }

    var hero = document.querySelector("[data-hero]");

    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
        var current = 0;

        function showSlide(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("active", slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("active", dotIndex === current);
            });
        }

        dots.forEach(function (dot) {
            dot.addEventListener("click", function () {
                showSlide(Number(dot.getAttribute("data-hero-dot")) || 0);
            });
        });

        if (slides.length > 1) {
            window.setInterval(function () {
                showSlide(current + 1);
            }, 5200);
        }
    }

    function normalize(value) {
        return String(value || "").toLowerCase().replace(/\s+/g, " ").trim();
    }

    function cardText(card) {
        return normalize([
            card.getAttribute("data-title"),
            card.getAttribute("data-region"),
            card.getAttribute("data-year"),
            card.getAttribute("data-genre"),
            card.getAttribute("data-type"),
            card.textContent
        ].join(" "));
    }

    function applyFilters() {
        var grid = document.querySelector("[data-filter-grid]");

        if (!grid) {
            return;
        }

        var cards = Array.prototype.slice.call(grid.querySelectorAll("[data-search-card]"));
        var textInput = document.querySelector("[data-page-filter]");
        var yearSelect = document.querySelector("[data-year-filter]");
        var sortSelect = document.querySelector("[data-sort-filter]");
        var query = normalize(textInput ? textInput.value : "");
        var year = yearSelect ? yearSelect.value : "";

        cards.forEach(function (card) {
            var matchesText = !query || cardText(card).indexOf(query) !== -1;
            var matchesYear = !year || card.getAttribute("data-year") === year;
            card.classList.toggle("is-hidden-card", !(matchesText && matchesYear));
        });

        if (sortSelect && sortSelect.value !== "default") {
            var visible = cards.slice().sort(function (a, b) {
                if (sortSelect.value === "year-desc") {
                    return Number(b.getAttribute("data-year") || 0) - Number(a.getAttribute("data-year") || 0);
                }
                return String(a.getAttribute("data-title") || "").localeCompare(String(b.getAttribute("data-title") || ""), "zh-Hans-CN");
            });
            visible.forEach(function (card) {
                grid.appendChild(card);
            });
        }
    }

    var pageFilter = document.querySelector("[data-page-filter]");
    var yearFilter = document.querySelector("[data-year-filter]");
    var sortFilter = document.querySelector("[data-sort-filter]");

    if (pageFilter) {
        pageFilter.addEventListener("input", applyFilters);
    }

    if (yearFilter) {
        var gridForYears = document.querySelector("[data-filter-grid]");
        var cardsForYears = gridForYears ? Array.prototype.slice.call(gridForYears.querySelectorAll("[data-search-card]")) : [];
        var existingYears = Array.prototype.slice.call(yearFilter.options).map(function (option) {
            return option.value;
        });
        var years = cardsForYears.map(function (card) {
            return card.getAttribute("data-year") || "";
        }).filter(Boolean).filter(function (year, index, all) {
            return all.indexOf(year) === index && existingYears.indexOf(year) === -1;
        }).sort(function (a, b) {
            return Number(b) - Number(a);
        }).slice(0, 20);
        years.forEach(function (year) {
            var option = document.createElement("option");
            option.value = year;
            option.textContent = year;
            yearFilter.appendChild(option);
        });
        yearFilter.addEventListener("change", applyFilters);
    }

    if (sortFilter) {
        sortFilter.addEventListener("change", applyFilters);
    }

    var searchInput = document.querySelector("[data-search-page-input]");
    var searchButton = document.querySelector("[data-search-page-button]");

    if (searchInput) {
        var params = new URLSearchParams(window.location.search);
        var initialQuery = params.get("q") || "";
        searchInput.value = initialQuery;

        if (pageFilter && initialQuery) {
            pageFilter.value = initialQuery;
            applyFilters();
        }

        var submitSearch = function () {
            if (pageFilter) {
                pageFilter.value = searchInput.value;
                applyFilters();
            }
            var nextUrl = window.location.pathname + "?q=" + encodeURIComponent(searchInput.value);
            window.history.replaceState(null, "", nextUrl);
        };

        searchInput.addEventListener("input", submitSearch);
        searchInput.addEventListener("keydown", function (event) {
            if (event.key === "Enter") {
                event.preventDefault();
                submitSearch();
            }
        });

        if (searchButton) {
            searchButton.addEventListener("click", submitSearch);
        }
    }

    applyFilters();
})();
