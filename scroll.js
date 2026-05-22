(function () {
  var main  = document.querySelector('main');
  var pubs  = document.getElementById('publications');

  function update() {
    var vh = window.innerHeight;
    var p1 = Math.max(0, Math.min(1, window.scrollY / vh));
    var p2 = Math.max(0, Math.min(1, (window.scrollY - vh) / vh));
    main.style.transform = 'translateX(-50%) translateY(-' + (p1 * 100) + 'vh)';
    pubs.style.transform  = 'translateX(-50%) translateY(-' + (p2 * 100) + 'vh)';
  }

  window.addEventListener('scroll', update, { passive: true });
  window.addEventListener('resize', update);
  update();
})();
