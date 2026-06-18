(function() {
  window.initMoviePlayer = function(videoUrl) {
    var video = document.getElementById('movie-video');
    var button = document.getElementById('play-cover');
    if (!video || !button || !videoUrl) {
      return;
    }
    var ready = false;
    var hlsInstance = null;

    function attach() {
      if (ready) {
        return;
      }
      ready = true;
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = videoUrl;
      } else if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hlsInstance.loadSource(videoUrl);
        hlsInstance.attachMedia(video);
      } else {
        video.src = videoUrl;
      }
    }

    function play() {
      attach();
      button.classList.add('is-hidden');
      var task = video.play();
      if (task && typeof task.catch === 'function') {
        task.catch(function() {
          button.classList.remove('is-hidden');
        });
      }
    }

    button.addEventListener('click', play);
    video.addEventListener('play', function() {
      button.classList.add('is-hidden');
    });
    video.addEventListener('pause', function() {
      if (video.currentTime === 0 || video.ended) {
        button.classList.remove('is-hidden');
      }
    });
    video.addEventListener('click', function() {
      if (video.paused) {
        play();
      }
    });
    window.addEventListener('beforeunload', function() {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  };
})();
