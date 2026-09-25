// Small decorative discoveries. No canvas, timers, focus stops, or layout space.
const enabledByDefault = process.env.NEXT_PUBLIC_LIVING_WORLDS !== 'false'
  && process.env.NEXT_PUBLIC_RETRO_EASTER_EGGS !== 'false';

const mushroom = [
  '.....rrrrrr.....',
  '...rrrrrrrrrr...',
  '..rrwwwrrrrwrr..',
  '.rrwwwwwrrwwwrr.',
  '.rrwwwwwrrwwwrr.',
  'rrrwwwwwrrrwwrrr',
  'rrrrwwwrrrrrrrrr',
  'rrwwrrrrrrrwwrrr',
  'rwwwwrrrrrwwwwrr',
  'rwwwwrrrrrwwwwrr',
  '.rrrrrrrrrrrrrr.',
  '...wwkwwwwkww...',
  '...wwkwwwwkww...',
  '...wwwwwwwwww...',
  '....wwwwwwww....',
  '.....wwwwww.....',
];
const invader = [
  '..x.....x..',
  '...x...x...',
  '..xxxxxxx..',
  '.xx.xxx.xx.',
  'xxxxxxxxxxx',
  'x.xxxxxxx.x',
  'x.x.....x.x',
  '...xx.xx...',
];

function pixels(rows, symbol) {
  return rows.flatMap((row, y) => [...row].flatMap((pixel, x) => (
    pixel === symbol ? [`M${x} ${y}h1v1h-1z`] : []
  ))).join('');
}

const mushroomPaths = { red: pixels(mushroom, 'r'), cream: pixels(mushroom, 'w'), eyes: pixels(mushroom, 'k') };
const invaderPath = pixels(invader, 'x');
const tiles = [[0, 0], [1, 0], [2, 0], [1, 1]];

function Mushroom() {
  return <svg viewBox="0 0 64 32" shapeRendering="crispEdges" aria-hidden="true" focusable="false">
    <g className="egg-mushroom" transform="translate(4 0) scale(2)">
      <path d={mushroomPaths.red} fill="#c46950" />
      <path d={mushroomPaths.cream} fill="#e9d8af" />
      <path d={mushroomPaths.eyes} fill="#342c27" />
    </g>
    <g transform="translate(46 13)" fill="#baa271">
      <path d="M0 0h14v14H0z" fill="#6c5840" />
      <path d="M1 1h12v1H1zM1 1h1v12H1z" fill="#c9a878" />
      <path d="M5 3h5v2H8v2H6V5H5zM6 9h2v2H6z" />
    </g>
  </svg>;
}

function Pacman() {
  return <svg viewBox="0 0 152 24" aria-hidden="true" focusable="false">
    {[30, 53, 76, 99, 122].map((x, index) => <circle className="egg-pellet" cx={x} cy="12" r="1.5" fill="#b7a178" style={{ '--eat-at': `${0.7 + index * 1.05}s` }} key={x} />)}
    <g className="egg-pacman">
      <path className="egg-pacman-open" d="M15.5 5.5a9 9 0 1 0 0 13L9 12z" fill="#d5b55e" />
      <circle className="egg-pacman-closed" cx="9" cy="12" r="9" fill="#d5b55e" />
    </g>
  </svg>;
}

function Blocks() {
  return <svg viewBox="0 0 52 58" shapeRendering="crispEdges" aria-hidden="true" focusable="false">
    <g className="egg-tetromino" fill="#85739e">
      {tiles.map(([x, y]) => <g transform={`translate(${14 + x * 9} ${4 + y * 9})`} key={`${x}-${y}`}><path d="M0 0h8v8H0z" /><path d="M1 1h6v1H1zM1 1h1v5H1z" fill="#b6a5cd" /><path d="M1 7h6V2H6v4H1z" fill="#4e425e" /></g>)}
    </g>
    <g fill="#598b89">
      {[0, 1, 2, 3].map((x) => <g transform={`translate(${5 + x * 9} 45)`} key={x}><path d="M0 0h8v8H0z" /><path d="M1 1h6v1H1zM1 1h1v5H1z" fill="#83b4af" /></g>)}
    </g>
  </svg>;
}

function Invader() {
  return <svg viewBox="0 0 48 32" shapeRendering="crispEdges" aria-hidden="true" focusable="false">
    <g className="egg-invader" transform="translate(10 5) scale(2)"><path d={invaderPath} fill="#829b81" /></g>
    <path className="egg-laser" d="M22 28h2v4h-2z" fill="#baa271" />
  </svg>;
}

const artwork = { mushroom: Mushroom, pacman: Pacman, blocks: Blocks, invader: Invader };

export default function GameEasterEgg({ kind, enabled = enabledByDefault }) {
  const Artwork = artwork[kind];
  if (!enabled || !Artwork) return null;
  return <div className={`game-easter-egg game-easter-egg--${kind}`} aria-hidden="true"><Artwork /></div>;
}
