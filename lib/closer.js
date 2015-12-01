/**
 * Closer plugin example
 * https://gist.github.com/timthez/d1b29ea02cce7a2a59ff
 */
(function ($window, $document, bs) {
  var socket = bs.socket;
  socket.on("disconnect", function (client) {
    window.close();
  });
})(window, document, ___browserSync___);