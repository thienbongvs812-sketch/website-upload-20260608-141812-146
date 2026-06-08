(function () {
    var video = document.querySelector("[data-player-video]");
    var trigger = document.querySelector("[data-player-trigger]");
    var overlay = document.querySelector("[data-player-overlay]");
    var source = window.movieStreamSource || "";
    var hls = null;
    var prepared = false;

    function prepare() {
        if (!video || !source || prepared) {
            return;
        }

        prepared = true;

        if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = source;
        } else if (window.Hls && window.Hls.isSupported()) {
            hls = new window.Hls({
                enableWorker: true,
                lowLatencyMode: true
            });
            hls.loadSource(source);
            hls.attachMedia(video);
        } else {
            video.src = source;
        }
    }

    function start(event) {
        if (event) {
            event.preventDefault();
        }

        prepare();

        if (overlay) {
            overlay.classList.add("is-hidden");
        }

        var promise = video.play();
        if (promise && typeof promise.catch === "function") {
            promise.catch(function () {
                if (overlay) {
                    overlay.classList.remove("is-hidden");
                }
            });
        }
    }

    if (video) {
        video.addEventListener("click", function () {
            if (!prepared) {
                start();
            }
        });
        video.addEventListener("play", function () {
            if (overlay) {
                overlay.classList.add("is-hidden");
            }
        });
        video.addEventListener("pause", function () {
            if (overlay && video.currentTime === 0) {
                overlay.classList.remove("is-hidden");
            }
        });
    }

    if (trigger) {
        trigger.addEventListener("click", start);
    }

    window.addEventListener("beforeunload", function () {
        if (hls) {
            hls.destroy();
        }
    });
})();
