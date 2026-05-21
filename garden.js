(function () {
  const COLS = 90, ROWS = 8;
  const GROUND_ROW = 7;
  const STEM_ROW = 6;
  const VISIT_Y = 4;

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
    return { x, y: 0, vx, state: 'flying', targetFlower: null, visitTimer: 0, wingFrame: 0 };
  }
  const bees = [makeBee(3, 1), makeBee(25, -1), makeBee(55, 1), makeBee(80, -1)];

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
      if (b.y > 0) b.y--;
      else { b.state = 'flying'; b.targetFlower = null; b.vx = Math.random() < 0.5 ? 1 : -1; }
    }
  }

  function render(pre) {
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

  const footer = document.createElement('footer');
  footer.setAttribute('aria-label', 'decorative garden animation');
  const pre = document.createElement('pre');
  pre.id = 'garden';
  pre.setAttribute('aria-hidden', 'true');
  footer.appendChild(pre);
  document.querySelector('main').appendChild(footer);

  setInterval(() => { bees.forEach(updateBee); render(pre); }, 150);
})();
