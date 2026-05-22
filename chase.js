(function () {
  const ROWS = 5;
  const NET_ROW   = 0;  // bee + person's net live here
  const HEAD_ROW  = 1;
  const BODY_ROW  = 2;
  const LEGS_ROW  = 3;
  const GROUND_ROW = 4;

  const pre = document.createElement('pre');
  pre.id = 'chase';
  pre.classList.add('animation');
  pre.setAttribute('aria-hidden', 'true');
  document.getElementById('publications').appendChild(pre);

  // Measure how many monospace chars fit
  const probe = document.createElement('span');
  probe.textContent = 'x'.repeat(20);
  pre.appendChild(probe);
  const charWidth = probe.getBoundingClientRect().width / 20;
  pre.removeChild(probe);
  const COLS = Math.max(60, Math.floor(pre.getBoundingClientRect().width / charWidth));

  const BEE_W = 7;
  const BEE = ['v(o.o)v', '^(o.o)^'];

  // person.x = column of head 'o' and body '|'
  // Facing right: net '()' at px+5,+6  |  left edge at px-1  |  right edge at px+6
  // Facing left:  net '()' at px-6,-5  |  left edge at px-6  |  right edge at px

  const bee    = { x: Math.floor(COLS * 0.70), vx: -2, frame: 0 };
  const person = { x: Math.floor(COLS * 0.35), facing: 1, frame: 0 };

  function w(grid, row, col, str) {
    if (row < 0 || row >= ROWS) return;
    for (let i = 0; i < str.length; i++)
      if (col + i >= 0 && col + i < COLS)
        grid[row][col + i] = str[i];
  }

  function render() {
    const grid = Array.from({ length: ROWS }, () => Array(COLS).fill(' '));

    // Ground
    for (let c = 0; c < COLS; c++) grid[GROUND_ROW][c] = '_';

    // Bee (on the same row as the net so it looks like it's being chased into it)
    w(grid, NET_ROW, bee.x, BEE[bee.frame]);

    const px = person.x;
    const lf = person.frame;

    if (person.facing === 1) {
      //        ()       <- net at px+5
      //   o --/         <- head at px
      //  -|  or \|      <- body at px-1
      //  / \ or /\      <- legs at px-1
      w(grid, NET_ROW,  px + 5, '()');
      w(grid, HEAD_ROW, px,     'o --/');
      w(grid, BODY_ROW, px - 1, lf === 0 ? '-|' : '\\|');
      w(grid, LEGS_ROW, px - 1, lf === 0 ? '/ \\' : '/\\');
    } else {
      // ()              <- net at px-6
      //   \-- o         <- handle+head ending at px
      //      -| or \|   <- body at px-1
      //     / \ or /\   <- legs
      w(grid, NET_ROW,  px - 6, '()');
      w(grid, HEAD_ROW, px - 4, '\\-- o');
      w(grid, BODY_ROW, px - 1, lf === 0 ? '-|' : '\\|');
      w(grid, LEGS_ROW, lf === 0 ? px - 2 : px - 1, lf === 0 ? '/ \\' : '/\\');
    }

    pre.textContent = grid.map(r => r.join('')).join('\n');
  }

  function update() {
    bee.frame    = 1 - bee.frame;
    person.frame = 1 - person.frame;

    // Move bee
    bee.x += bee.vx;

    // Bounce off walls
    if (bee.x <= 0)              { bee.x = 0;            bee.vx =  2; }
    else if (bee.x + BEE_W >= COLS) { bee.x = COLS - BEE_W; bee.vx = -2; }

    // Bee flees when the net gets within 8 chars ahead of it
    if (person.facing === 1) {
      const gap = bee.x - (person.x + 5);
      if (gap >= 0 && gap < 8) bee.vx = 2;
    } else {
      const gap = (person.x - 6) - (bee.x + BEE_W);
      if (gap >= 0 && gap < 8) bee.vx = -2;
    }

    // A little chaos: occasional random direction flip
    if (Math.random() < 0.015) bee.vx = -bee.vx;

    // Person always faces the bee
    const beeMid = bee.x + Math.floor(BEE_W / 2);
    const diff   = beeMid - person.x;
    if (Math.abs(diff) > 1) person.facing = diff > 0 ? 1 : -1;

    // Person chases at speed 1 (bee escapes at speed 2)
    if (Math.abs(diff) > 2) person.x += person.facing;

    // Clamp person inside canvas
    person.x = person.facing === 1
      ? Math.max(1, Math.min(COLS - 8, person.x))
      : Math.max(7, Math.min(COLS - 1, person.x));

    render();
  }

  setInterval(update, 150);
})();
