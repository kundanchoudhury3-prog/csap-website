// Default illustrations used when a course has no image uploaded yet.
export function CourseArt({ category }: { category?: string | null }) {
  const common = { viewBox: '0 0 320 200', width: '100%', height: '100%', 'aria-hidden': true } as const
  switch (category) {
    case 'UPSC':
      return (
        <svg {...common}>
          <circle cx="60" cy="40" r="26" fill="#13265A" />
          <g className="drift"><path d="M266 22 v44" stroke="#F2D9A6" strokeWidth="3" /><path d="M266 24 h30 l-7 9 7 9 h-30z" fill="#D9A441" /></g>
          <path d="M92 94 a68 36 0 0 1 136 0z" fill="#3A4E86" />
          <rect x="82" y="94" width="156" height="12" rx="2" fill="#D9A441" />
          {[94, 118, 142, 166, 190, 214].map((x) => <rect key={x} x={x} y="110" width="12" height="44" rx="3" fill="#F2D9A6" />)}
          <rect x="74" y="154" width="172" height="12" rx="3" fill="#D9A441" />
          <rect x="62" y="166" width="196" height="10" rx="3" fill="#3A4E86" />
        </svg>
      )
    case 'Interview':
      return (
        <svg {...common}>
          <circle cx="54" cy="44" r="24" fill="#13265A" />
          <g className="drift"><rect x="196" y="22" width="90" height="42" rx="12" fill="#D9A441" /><path d="M210 64 l-6 13 18 -13z" fill="#D9A441" /><path d="M210 37 h58 M210 50 h38" stroke="#0B1A3A" strokeWidth="4" strokeLinecap="round" /></g>
          <circle cx="108" cy="90" r="15" fill="#F2D9A6" /><circle cx="160" cy="82" r="16" fill="#F2D9A6" /><circle cx="212" cy="90" r="15" fill="#F2D9A6" />
          <path d="M86 124 a22 20 0 0 1 44 0z" fill="#3A4E86" /><path d="M136 124 a24 22 0 0 1 48 0z" fill="#D9A441" /><path d="M190 124 a22 20 0 0 1 44 0z" fill="#3A4E86" />
          <rect x="64" y="124" width="192" height="12" rx="4" fill="#F2D9A6" />
          <path d="M84 136 v38 M236 136 v38" stroke="#3A4E86" strokeWidth="7" strokeLinecap="round" />
        </svg>
      )
    case 'Govt jobs':
      return (
        <svg {...common}>
          <circle cx="56" cy="46" r="24" fill="#13265A" />
          <g className="drift"><circle cx="262" cy="48" r="22" fill="#D9A441" /><circle cx="262" cy="48" r="13" fill="none" stroke="#0B1A3A" strokeWidth="3" opacity=".5" /></g>
          <rect x="80" y="122" width="30" height="50" rx="4" fill="#3A4E86" /><rect x="122" y="98" width="30" height="74" rx="4" fill="#F2D9A6" />
          <rect x="164" y="110" width="30" height="62" rx="4" fill="#3A4E86" /><rect x="206" y="72" width="30" height="100" rx="4" fill="#D9A441" />
          <path d="M64 174 h192" stroke="#F2D9A6" strokeWidth="3" strokeLinecap="round" />
          <polyline points="95,108 137,84 179,96 221,56" fill="none" stroke="#F2D9A6" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="221" cy="56" r="6" fill="#F2D9A6" />
        </svg>
      )
    default:
      return (
        <svg {...common}>
          <circle cx="262" cy="46" r="30" fill="#13265A" /><circle cx="48" cy="170" r="40" fill="#13265A" />
          <g className="drift"><path d="M160 30 l60 22 -60 22 -60 -22z" fill="#D9A441" /><path d="M128 62 v16 c0 12 64 12 64 0 v-16" fill="none" stroke="#D9A441" strokeWidth="6" /><path d="M220 53 v24" stroke="#F2D9A6" strokeWidth="3" /><circle cx="220" cy="80" r="4" fill="#F2D9A6" /></g>
          <rect x="100" y="104" width="122" height="22" rx="4" fill="#D9A441" /><rect x="108" y="128" width="112" height="22" rx="4" fill="#3A4E86" /><rect x="96" y="152" width="130" height="22" rx="4" fill="#F2D9A6" />
          <path d="M112 115 h64 M120 139 h50 M108 163 h76" stroke="#0B1A3A" strokeWidth="3" strokeLinecap="round" opacity=".45" />
        </svg>
      )
  }
}
