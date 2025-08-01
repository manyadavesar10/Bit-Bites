function playClick() {
  const audio = document.getElementById("clickSound");
  if (audio) {
    audio.currentTime = 0;
    audio.play();
  }
}