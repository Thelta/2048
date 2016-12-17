// Wait till the browser is ready to render the game (avoids glitches)
var a;
window.requestAnimationFrame(function () {
  a = new GameManager(4, KeyboardInputManager, HTMLActuator, LocalStorageManager);
});
