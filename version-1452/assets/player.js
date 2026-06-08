(function () {
    window.initMoviePlayer = function (source, poster) {
        var box = document.querySelector("[data-player]");

        if (!box) {
            return;
        }

        var video = box.querySelector("video");
        var cover = box.querySelector(".player-cover");
        var started = false;
        var hls = null;

        if (!video) {
            return;
        }

        if (poster) {
            video.setAttribute("poster", poster);
        }

        function attach() {
            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = source;
                return;
            }

            if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hls.loadSource(source);
                hls.attachMedia(video);
                return;
            }

            video.src = source;
        }

        function play() {
            if (!started) {
                started = true;
                attach();
            }

            if (cover) {
                cover.classList.add("is-hidden");
            }

            var attempt = video.play();

            if (attempt && typeof attempt.catch === "function") {
                attempt.catch(function () {
                    if (cover) {
                        cover.classList.remove("is-hidden");
                    }
                });
            }
        }

        if (cover) {
            cover.addEventListener("click", play);
        }

        video.addEventListener("click", function () {
            if (!started) {
                play();
            }
        });

        window.addEventListener("pagehide", function () {
            if (hls && typeof hls.destroy === "function") {
                hls.destroy();
            }
        });
    };
})();
