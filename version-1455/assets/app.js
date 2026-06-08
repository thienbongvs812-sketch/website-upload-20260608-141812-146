(function () {
    function ready(fn) {
        if (document.readyState !== "loading") {
            fn();
        } else {
            document.addEventListener("DOMContentLoaded", fn);
        }
    }

    function normalize(value) {
        return String(value || "").trim().toLowerCase();
    }

    ready(function () {
        var menuButton = document.querySelector("[data-menu-toggle]");
        var mobileNav = document.querySelector("[data-mobile-nav]");
        if (menuButton && mobileNav) {
            menuButton.addEventListener("click", function () {
                mobileNav.classList.toggle("is-open");
            });
        }

        document.querySelectorAll("[data-hero-carousel]").forEach(function (carousel) {
            var slides = Array.prototype.slice.call(carousel.querySelectorAll(".hero-slide"));
            var dots = Array.prototype.slice.call(carousel.querySelectorAll("[data-hero-dot]"));
            var prev = carousel.querySelector("[data-hero-prev]");
            var next = carousel.querySelector("[data-hero-next]");
            var index = 0;
            var timer = null;

            function show(nextIndex) {
                if (!slides.length) {
                    return;
                }
                index = (nextIndex + slides.length) % slides.length;
                slides.forEach(function (slide, slideIndex) {
                    slide.classList.toggle("is-active", slideIndex === index);
                });
                dots.forEach(function (dot, dotIndex) {
                    dot.classList.toggle("is-active", dotIndex === index);
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

            dots.forEach(function (dot) {
                dot.addEventListener("click", function () {
                    show(Number(dot.getAttribute("data-hero-dot")) || 0);
                    start();
                });
            });

            if (prev) {
                prev.addEventListener("click", function () {
                    show(index - 1);
                    start();
                });
            }

            if (next) {
                next.addEventListener("click", function () {
                    show(index + 1);
                    start();
                });
            }

            carousel.addEventListener("mouseenter", stop);
            carousel.addEventListener("mouseleave", start);
            show(0);
            start();
        });

        document.querySelectorAll("[data-filter-scope]").forEach(function (scope) {
            var input = scope.querySelector("[data-search-input]");
            var fields = Array.prototype.slice.call(scope.querySelectorAll("[data-filter-field]"));
            var clear = scope.querySelector("[data-clear-filter]");
            var section = scope.nextElementSibling;
            var cards = [];

            while (section && !section.querySelectorAll("[data-card]").length) {
                section = section.nextElementSibling;
            }

            if (section) {
                cards = Array.prototype.slice.call(section.querySelectorAll("[data-card]"));
            } else {
                cards = Array.prototype.slice.call(document.querySelectorAll("[data-card]"));
            }

            function apply() {
                var query = normalize(input ? input.value : "");
                var activeFields = fields.map(function (field) {
                    return {
                        name: field.getAttribute("data-filter-field"),
                        value: normalize(field.value)
                    };
                }).filter(function (item) {
                    return item.value;
                });

                cards.forEach(function (card) {
                    var haystack = normalize(card.getAttribute("data-search-index") || card.textContent);
                    var matchesQuery = !query || haystack.indexOf(query) !== -1;
                    var matchesFields = activeFields.every(function (item) {
                        return normalize(card.getAttribute("data-" + item.name)) === item.value;
                    });
                    card.hidden = !(matchesQuery && matchesFields);
                });
            }

            if (input) {
                input.addEventListener("input", apply);
            }

            fields.forEach(function (field) {
                field.addEventListener("change", apply);
            });

            if (clear) {
                clear.addEventListener("click", function () {
                    if (input) {
                        input.value = "";
                    }
                    fields.forEach(function (field) {
                        field.value = "";
                    });
                    apply();
                });
            }

            apply();
        });
    });

    window.initVideoPlayer = function (streamUrl) {
        var video = document.getElementById("moviePlayer");
        var overlay = document.getElementById("playerOverlay");
        var started = false;
        var hlsInstance = null;

        if (!video || !streamUrl) {
            return;
        }

        function attachStream() {
            if (started) {
                return;
            }
            started = true;

            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = streamUrl;
            } else if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({
                    maxBufferLength: 30,
                    capLevelToPlayerSize: true,
                    enableWorker: true
                });
                hlsInstance.loadSource(streamUrl);
                hlsInstance.attachMedia(video);
            } else {
                video.src = streamUrl;
            }
        }

        function beginPlayback() {
            attachStream();
            if (overlay) {
                overlay.classList.add("is-hidden");
            }
            var playPromise = video.play();
            if (playPromise && typeof playPromise.catch === "function") {
                playPromise.catch(function () {});
            }
        }

        if (overlay) {
            overlay.addEventListener("click", beginPlayback);
        }

        video.addEventListener("click", function () {
            if (!started || video.paused) {
                beginPlayback();
            }
        });

        window.addEventListener("pagehide", function () {
            if (hlsInstance) {
                hlsInstance.destroy();
                hlsInstance = null;
            }
        });
    };
})();
