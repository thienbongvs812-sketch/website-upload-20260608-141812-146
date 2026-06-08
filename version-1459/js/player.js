(function () {
  function setupPlayer() {
    var wrapper = document.querySelector('[data-hls-player]');
    if (!wrapper) {
      return;
    }

    var video = wrapper.querySelector('video');
    var startButton = wrapper.querySelector('[data-player-start]');
    var status = wrapper.querySelector('[data-player-status]');
    var source = video ? video.getAttribute('data-src') : '';
    var hlsInstance = null;
    var sourceLoaded = false;

    function setStatus(message, isError) {
      if (!status) {
        return;
      }
      status.textContent = message;
      status.classList.toggle('error', Boolean(isError));
    }

    function hideOverlay() {
      if (startButton) {
        startButton.classList.add('hidden');
      }
      if (status) {
        status.classList.add('hidden');
      }
    }

    function attachNativeSource() {
      video.src = source;
      sourceLoaded = true;
      return Promise.resolve();
    }

    function attachHlsSource() {
      return new Promise(function (resolve, reject) {
        if (!window.Hls || !window.Hls.isSupported()) {
          reject(new Error('当前浏览器没有可用的 HLS 播放能力'));
          return;
        }

        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 90
        });

        hlsInstance.on(window.Hls.Events.MEDIA_ATTACHED, function () {
          hlsInstance.loadSource(source);
        });

        hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
          sourceLoaded = true;
          resolve();
        });

        hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
          if (data && data.fatal) {
            reject(new Error(data.details || 'HLS 播放初始化失败'));
          }
        });

        hlsInstance.attachMedia(video);
      });
    }

    function loadSource() {
      if (!video || !source) {
        return Promise.reject(new Error('播放源不存在'));
      }

      if (sourceLoaded) {
        return Promise.resolve();
      }

      setStatus('正在初始化播放源，请稍候…');

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        return attachNativeSource();
      }

      return attachHlsSource().catch(function () {
        return attachNativeSource();
      });
    }

    function playVideo() {
      loadSource()
        .then(function () {
          return video.play();
        })
        .then(function () {
          hideOverlay();
        })
        .catch(function (error) {
          setStatus(error.message || '播放失败，请检查浏览器网络和播放源。', true);
        });
    }

    if (startButton) {
      startButton.addEventListener('click', playVideo);
    }

    video.addEventListener('play', hideOverlay);
    video.addEventListener('error', function () {
      setStatus('播放器无法读取当前播放源，请稍后重试。', true);
    });

    window.addEventListener('beforeunload', function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  }

  document.addEventListener('DOMContentLoaded', setupPlayer);
}());
