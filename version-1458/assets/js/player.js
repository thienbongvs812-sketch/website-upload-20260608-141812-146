(function () {
  function initializeVideo(video) {
    var source = video.getAttribute('data-hls-src');
    if (!source) {
      return;
    }

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = source;
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      var hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: false,
        backBufferLength: 90
      });
      hls.loadSource(source);
      hls.attachMedia(video);
      hls.on(window.Hls.Events.ERROR, function (event, data) {
        if (data && data.fatal) {
          hls.destroy();
          video.setAttribute('data-player-error', 'true');
        }
      });
      return;
    }

    video.setAttribute('data-player-error', 'true');
  }

  function ready(callback) {
    if (document.readyState !== 'loading') {
      callback();
      return;
    }
    document.addEventListener('DOMContentLoaded', callback);
  }

  ready(function () {
    var videos = Array.prototype.slice.call(document.querySelectorAll('video[data-hls-src]'));
    videos.forEach(initializeVideo);
  });
}());
