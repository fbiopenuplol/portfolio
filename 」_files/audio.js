document.addEventListener("DOMContentLoaded", function () {
    const audio = document.getElementById("audio");
    const trackList = document
      .getElementById("trackList")
      .getElementsByTagName("li");
    const songTitle = document.getElementById("songTitle");
    const forwardButton = document.getElementById("forward");
    const backwardButton = document.getElementById("backward");
    const playPauseButton = document.getElementById("playPause");
    const playIcon = document.getElementById('playIcon');
    const stopIcon = document.getElementById('stopIcon');
    let songTime = document.getElementById("songTime");
    let rangeVolume = document.getElementById('range26');
    
    let currentTrack = Math.floor(Math.random() * trackList.length);
  
    audio.src = document.querySelector(
      `[data-track-number="${trackList[currentTrack].dataset.trackNumber}"]`
    ).src;
    songTitle.innerText = trackList[currentTrack].innerText;
    audio.play();
  
    if (forwardButton) {
      forwardButton.addEventListener("click", function () {
        currentTrack = (currentTrack + 1) % trackList.length;
        audio.src = document.querySelector(
          `[data-track-number="${trackList[currentTrack].dataset.trackNumber}"]`
        ).src;
        songTitle.innerText = trackList[currentTrack].innerText;
        audio.play();
      });
    }
  
    if (backwardButton) {
      backwardButton.addEventListener("click", function () {
        if (audio.currentTime > 2) {
          audio.currentTime = 0;
          audio.play();
        } else {
          currentTrack = (currentTrack - 1 + trackList.length) % trackList.length;
          audio.src = document.querySelector(
            `[data-track-number="${trackList[currentTrack].dataset.trackNumber}"]`
          ).src;
          songTitle.innerText = trackList[currentTrack].innerText;
          audio.play();
        }
      });
    }
  
    audio.addEventListener("ended", function () {
      try {
        let currentTrackNumber = Number(
          audio.querySelector("source").getAttribute("data-track-number")
        );
        let nextTrackNumber = (currentTrackNumber % trackList.length) + 1;

        const nextSource = audio.querySelector(`source[data-track-number="${nextTrackNumber}"]`);
        if (nextSource) {
          audio.src = nextSource.getAttribute('src');
          songTitle.innerHTML = trackList.querySelector(`li[data-track-number="${nextTrackNumber}"]`).innerHTML;
          audio.load();
          audio.play();
        }
      } catch (e) {
        console.warn('Error advancing to next track:', e);
      }
    });
    // Play/pause control and icon syncing
    function updateIcons() {
      if (!playIcon && !stopIcon) return;
      const isPaused = !!audio.paused;
      if (playIcon) playIcon.style.display = isPaused ? 'block' : 'none';
      if (stopIcon) stopIcon.style.display = isPaused ? 'none' : 'block';
    }

    if (playPauseButton) {
      playPauseButton.addEventListener('click', function(e){
        e.stopPropagation();
        if (audio.paused) {
          const p = audio.play();
          if (p && p.catch) p.catch(err => console.warn('Play failed:', err)).finally(updateIcons);
          else updateIcons();
        } else {
          audio.pause();
          updateIcons();
        }
      });
    }

    // Keep icons in sync with audio events
    audio.addEventListener('play', updateIcons);
    audio.addEventListener('pause', updateIcons);
    audio.addEventListener('ended', updateIcons);
    // initialize icons after metadata/initial state
    window.addEventListener('load', function(){ setTimeout(updateIcons, 0); });
  
    function updateTime() {
      if (!songTime) return;
      let currentTime = audio.currentTime || 0;
      let minutes = Math.floor(currentTime / 60);
      let seconds = Math.floor(currentTime % 60);

      seconds = seconds < 10 ? "0" + seconds : seconds;
      songTime.innerHTML = `${minutes}:${seconds}`;
    }
    audio.addEventListener("timeupdate", function () {
      updateTime();
    });
  
    audio.addEventListener("loadedmetadata", function () {
      updateTime();
      // initialize volume slider if present
      if (rangeVolume) {
        try { rangeVolume.value = Math.round((audio.volume || 1) * 50); } catch(e){}
      }
    });
  
    audio.addEventListener("play", function () {
      songTitle.innerHTML = trackList.querySelector(
        "li[data-track-number='" +
          audio.querySelector("source").getAttribute("data-track-number") +
          "']"
      ).innerHTML;
    });

    // volume slider handling
    if (rangeVolume) {
      rangeVolume.addEventListener('input', function(e){
        const val = Number(e.target.value);
        if (!isNaN(val)) audio.volume = Math.max(0, Math.min(1, val / 50));
      });
    }
  });
  