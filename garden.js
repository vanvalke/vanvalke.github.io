(function () {
  const ROWS = 8;
  const GROUND_ROW = 7;
  const STEM_ROW = 6;
  const VISIT_Y = 4;

  // Insert pre into DOM first so we can measure its width
  const footer = document.createElement('footer');
  footer.setAttribute('aria-label', 'decorative garden animation');
  const pre = document.createElement('pre');
  pre.id = 'garden';
  pre.classList.add('animation');
  pre.setAttribute('aria-hidden', 'true');
  footer.appendChild(pre);
  document.querySelector('main').appendChild(footer);

  // Measure how many monospace characters fit across the container
  const probe = document.createElement('span');
  probe.textContent = 'x'.repeat(20);
  pre.appendChild(probe);
  const charWidth = probe.getBoundingClientRect().width / 20;
  pre.removeChild(probe);
  const COLS = Math.max(60, Math.floor(pre.getBoundingClientRect().width / charWidth));

  const flowerTypes = [
    { rows: ['(o)', ' | '] },
    { rows: ['\\*/', ' | '] },
    { rows: [' \\^/', ' (o)', '  | '] },
    { rows: ['* * *', ' \\|/', '  | '] },
  ];

  const flowers = [];
  for (let x = 2; x < COLS - 4; x += 8)
    flowers.push({ x, type: flowerTypes[flowers.length % 4] });

  function makeBee(x, vx) {
    const cruiseY = Math.floor(Math.random() * 3);
    return { x, y: cruiseY, vx, cruiseY, state: 'flying', targetFlower: null, visitTimer: 0, wingFrame: 0 };
  }
  const spread = Math.floor(COLS / 5);
  const bees = [
    makeBee(spread * 0 + 3, 1),
    makeBee(spread * 1 + 3, -1),
    makeBee(spread * 3 + 3, 1),
    makeBee(spread * 4 + 3, -1),
  ];

  const SPRITES = { flyA: 'v(o.o)v', flyB: '^(o.o)^', landed: '-(o.o)-' };

  function getSprite(b) {
    if (b.state === 'visiting') return SPRITES.landed;
    return b.wingFrame === 0 ? SPRITES.flyA : SPRITES.flyB;
  }

  function updateBee(b) {
    b.wingFrame = 1 - b.wingFrame;
    if (b.state === 'flying') {
      b.x += b.vx;
      if (b.x <= 0 || b.x >= COLS - 7) b.vx = -b.vx;
      const nearby = flowers.filter(f => Math.abs(f.x - b.x) < 12);
      if (nearby.length && Math.random() < 0.02) {
        b.targetFlower = nearby[Math.floor(Math.random() * nearby.length)];
        b.state = 'descending';
      }
    } else if (b.state === 'descending') {
      const tf = b.targetFlower;
      if (b.x < tf.x) b.x++;
      else if (b.x > tf.x) b.x--;
      if (b.y < VISIT_Y) b.y++;
      if (b.x === tf.x && b.y === VISIT_Y) {
        b.state = 'visiting';
        b.visitTimer = 8 + Math.floor(Math.random() * 8);
      }
    } else if (b.state === 'visiting') {
      if (--b.visitTimer <= 0) b.state = 'ascending';
    } else if (b.state === 'ascending') {
      if (b.y > b.cruiseY) b.y--;
      else { b.state = 'flying'; b.targetFlower = null; b.vx = Math.random() < 0.5 ? 1 : -1; }
    }
  }

  function render() {
    const grid = Array.from({ length: ROWS }, () => Array(COLS).fill(' '));
    const w = (row, col, str) => {
      if (row < 0 || row >= ROWS) return;
      for (let i = 0; i < str.length; i++)
        if (col + i >= 0 && col + i < COLS) grid[row][col + i] = str[i];
    };
    for (let c = 0; c < COLS; c++) grid[GROUND_ROW][c] = '_';
    for (const f of flowers) {
      const startRow = STEM_ROW - f.type.rows.length + 1;
      for (let r = 0; r < f.type.rows.length; r++)
        w(startRow + r, f.x, f.type.rows[r]);
    }
    for (const b of bees) w(b.y, b.x, getSprite(b));
    pre.textContent = grid.map(row => row.join('')).join('\n');
  }

  setInterval(() => { bees.forEach(updateBee); render(); }, 150);
})();
