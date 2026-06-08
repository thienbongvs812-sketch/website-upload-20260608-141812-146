
(function () {
    const menuButton = document.querySelector("[data-menu-button]");
    const mobileNav = document.querySelector("[data-mobile-nav]");

    if (menuButton && mobileNav) {
        menuButton.addEventListener("click", function () {
            mobileNav.classList.toggle("is-open");
        });
    }

    const slider = document.querySelector("[data-hero-slider]");

    if (slider) {
        const slides = Array.from(slider.querySelectorAll("[data-hero-slide]"));
        const dots = Array.from(slider.querySelectorAll("[data-hero-dot]"));
        let current = 0;
        let timer = null;

        function showSlide(index) {
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

        function startTimer() {
            if (timer) {
                clearInterval(timer);
            }
            timer = setInterval(function () {
                showSlide(current + 1);
            }, 5200);
        }

        dots.forEach(function (dot, index) {
            dot.addEventListener("click", function () {
                showSlide(index);
                startTimer();
            });
        });

        showSlide(0);
        startTimer();
    }

    document.querySelectorAll("[data-search-scope]").forEach(function (scope) {
        const input = scope.querySelector("[data-filter-input]");
        const cards = Array.from(scope.querySelectorAll("[data-movie-card]"));
        const empty = scope.querySelector("[data-empty-result]");
        const buttons = Array.from(scope.querySelectorAll("[data-filter-pill]"));
        let activePill = "全部";

        function normalize(value) {
            return String(value || "").toLowerCase().trim();
        }

        function cardText(card) {
            return [
                card.getAttribute("data-title"),
                card.getAttribute("data-region"),
                card.getAttribute("data-genre"),
                card.getAttribute("data-year"),
                card.getAttribute("data-type"),
                card.textContent
            ].join(" ").toLowerCase();
        }

        function applyFilter() {
            const keyword = normalize(input ? input.value : "");
            let visible = 0;

            cards.forEach(function (card) {
                const text = cardText(card);
                const matchesInput = !keyword || text.indexOf(keyword) !== -1;
                const matchesPill = activePill === "全部" || text.indexOf(normalize(activePill)) !== -1;
                const shouldShow = matchesInput && matchesPill;
                card.hidden = !shouldShow;
                if (shouldShow) {
                    visible += 1;
                }
            });

            if (empty) {
                empty.hidden = visible !== 0;
            }
        }

        if (input) {
            input.addEventListener("input", applyFilter);
        }

        buttons.forEach(function (button) {
            button.addEventListener("click", function () {
                activePill = button.getAttribute("data-filter-pill") || "全部";
                buttons.forEach(function (other) {
                    other.classList.toggle("is-active", other === button);
                });
                applyFilter();
            });
        });

        if (buttons.length) {
            buttons[0].classList.add("is-active");
        }

        applyFilter();
    });
}());
