(function () {
  const MOOSE_H = 6;
  const MOOSE_W = 17;
  const ROWS = MOOSE_H + 1; // +1 for ground row

  const footer = document.createElement('footer');
  footer.setAttribute('aria-label', 'decorative moose animation');
  const pre = document.createElement('pre');
  pre.id = 'moose';
  pre.classList.add('animation');
  pre.setAttribute('aria-hidden', 'true');
  footer.appendChild(pre);
  document.getElementById('projects').appendChild(footer);

  const probe = document.createElement('span');
  probe.textContent = 'x'.repeat(20);
  pre.appendChild(probe);
  const charWidth = probe.getBoundingClientRect().width / 20;
  pre.removeChild(probe);
  const COLS = Math.max(60, Math.floor(pre.getBoundingClientRect().width / charWidth));

  const FRAMES = {
    right: {
      still: [
        '        (__v_v__)',
        '          (oo)',
        '   /-------\\/',
        '  / |     ||',
        ' *  ||----||',
        '    ^^    ^^',
      ],
      walking: [
        '        (__v_v__)',
        '          (oo)',
        '   /-------\\/',
        ' */ |\\    |\\',
        '    |-|---| |',
        '    ^ ^   ^ ^',
      ],
      blink: [
        '        (__v_v__)',
        '          (--)',
        '   /-------\\/',
        '  / |     ||',
        ' *  ||----||',
        '    ^^    ^^',
      ],
    },
    left: {
      still: [
        '(__v_v__)',
        '  (oo)',
        '   \\/-------\\',
        '    ||     | \\',
        '    ||----||  *',
        '    ^^    ^^',
      ],
      walking: [
        '(__v_v__)',
        '  (oo)',
        '   \\/-------\\',
        '    /|     /|\\*',
        '    | |---|-|',
        '    ^ ^   ^ ^',
      ],
      blink: [
        '(__v_v__)',
        '   (--)',
        '    \\/-------\\',
        '     ||     | \\',
        '     ||----||  *',
        '     ^^    ^^',
      ],
    },
  };

  let x = 0, vx = 1, step = 0;
  let state = 'walking'; // 'walking' | 'blinking'
  let blinkTimer = 0;

  function w(grid, row, col, str) {
    if (row < 0 || row >= ROWS) return;
    for (let i = 0; i < str.length; i++)
      if (col + i >= 0 && col + i < COLS) grid[row][col + i] = str[i];
  }

  function draw(lines) {
    const grid = Array.from({ length: ROWS }, () => Array(COLS).fill(' '));
    for (let c = 0; c < COLS; c++) grid[ROWS - 1][c] = '_';
    for (let r = 0; r < lines.length; r++) w(grid, r, x, lines[r]);
    pre.textContent = grid.map(row => row.join('')).join('\n');
  }

  function update() {
    const dir = vx > 0 ? 'right' : 'left';

    if (state === 'blinking') {
      draw(FRAMES[dir].blink);
      if (--blinkTimer <= 0) state = 'walking';
      return;
    }

    // Move
    x += vx;
    if (x <= 0)              { x = 0;               vx =  1; }
    if (x + MOOSE_W >= COLS) { x = COLS - MOOSE_W;  vx = -1; }

    step = 1 - step;

    // Random direction flip (only away from walls)
    if (Math.random() < 0.05 && x > MOOSE_W && x < COLS - 2 * MOOSE_W) vx = -vx;

    // Random blink stop
    if (Math.random() < 0.04) {
      state = 'blinking';
      blinkTimer = 2 + Math.floor(Math.random() * 3);
      return;
    }

    draw(step === 0 ? FRAMES[dir].still : FRAMES[dir].walking);
  }

  setInterval(update, 200);
})();
