import Image from 'next/image';

// Built-in artwork for the front page panels. Each one fills its panel like a
// wallpaper and is used until a photograph is uploaded for that panel.
//
// The shapes are drawn from a fixed seed, so the server and the browser draw
// exactly the same picture.

function seeded(seed) {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) % 4294967296;
    return s / 4294967296;
  };
}

const round = (n) => Math.round(n * 10) / 10;

// ---- Yarn: long threads running across the panel -------------------------
const THREAD_COLOURS = ['#f5f2ea', '#e6ba6b', '#e2725b', '#3fb8a5', '#f6e4c1', '#c98a2b'];
const threads = (() => {
  const rnd = seeded(11);
  return Array.from({ length: 58 }, (_, i) => {
    const y = -60 + i * 17 + rnd() * 10;
    const lift = 60 + rnd() * 130;
    const dip = 40 + rnd() * 150;
    return {
      d: `M-80 ${round(y + 130)} C 260 ${round(y + 130 - lift)}, 620 ${round(y + dip)}, 1280 ${round(y - 40 - rnd() * 90)}`,
      colour: THREAD_COLOURS[Math.floor(rnd() * THREAD_COLOURS.length)],
      width: round(1 + rnd() * 2.4),
      opacity: round(0.35 + rnd() * 0.6),
    };
  });
})();

function YarnArt() {
  return (
    <svg className="art art--yarn" viewBox="0 0 1200 900" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id="yarn-bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#3a1a2e" />
          <stop offset="1" stopColor="#170b1c" />
        </linearGradient>
      </defs>
      <rect width="1200" height="900" fill="url(#yarn-bg)" />
      <g className="art__drift" fill="none" strokeLinecap="round">
        {threads.map((t, i) => (
          <path key={i} d={t.d} stroke={t.colour} strokeWidth={t.width} opacity={t.opacity} />
        ))}
      </g>
    </svg>
  );
}

// ---- PET flakes: clear chips of washed plastic, floating in water --------
const flakes = (() => {
  const rnd = seeded(29);
  return Array.from({ length: 84 }, (_, i) => {
    const cx = rnd() * 1200;
    const cy = rnd() * 900;
    const size = 14 + rnd() * 46;
    const sides = 4 + Math.floor(rnd() * 3);
    const spin = rnd() * Math.PI;
    const points = Array.from({ length: sides }, (_, k) => {
      const angle = spin + (k / sides) * Math.PI * 2;
      const reach = size * (0.55 + rnd() * 0.55);
      return `${round(cx + Math.cos(angle) * reach)},${round(cy + Math.sin(angle) * reach * 0.8)}`;
    }).join(' ');
    return { points, fill: round(0.07 + rnd() * 0.22), edge: round(0.25 + rnd() * 0.5), layer: i % 3 };
  });
})();

function PetArt() {
  return (
    <svg className="art art--pet" viewBox="0 0 1200 900" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id="pet-bg" x1="0" y1="0" x2="0.4" y2="1">
          <stop offset="0" stopColor="#0f6f7c" />
          <stop offset="0.55" stopColor="#0a4a58" />
          <stop offset="1" stopColor="#052a35" />
        </linearGradient>
        <radialGradient id="pet-light" cx="0.3" cy="0" r="0.9">
          <stop offset="0" stopColor="#bdf3f0" stopOpacity="0.4" />
          <stop offset="1" stopColor="#bdf3f0" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="1200" height="900" fill="url(#pet-bg)" />
      <rect width="1200" height="900" fill="url(#pet-light)" />
      {[0, 1, 2].map((layer) => (
        <g key={layer} className={`art__float art__float--${layer}`}>
          {flakes.filter((f) => f.layer === layer).map((f, i) => (
            <polygon key={i} points={f.points} fill="#dff8fb" fillOpacity={f.fill} stroke="#ffffff" strokeOpacity={f.edge} strokeWidth="1" strokeLinejoin="round" />
          ))}
        </g>
      ))}
    </svg>
  );
}

// ---- Mats and twine: the product illustrations on a woven ground ---------
function IllustrationArt({ kind }) {
  const src = kind === 'twine' ? '/showcase/twine-art.png' : '/showcase/woven-mats-art.png';
  return (
    <div className={`art art--${kind}`} aria-hidden="true">
      <Image src={src} alt="" fill sizes="(max-width: 760px) 100vw, 60vw" quality={82} priority={kind === 'mats'} />
    </div>
  );
}

export default function HomeArt({ kind }) {
  if (kind === 'yarn') return <YarnArt />;
  if (kind === 'pet') return <PetArt />;
  return <IllustrationArt kind={kind === 'twine' ? 'twine' : 'mats'} />;
}
