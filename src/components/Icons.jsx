// Small inline icons so there is no icon-font or emoji dependency.
const base = {
  width: 20, height: 20, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor',
  strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true,
}

export const SearchIcon = (p) => (
  <svg {...base} {...p}><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></svg>
)

export const PinIcon = (p) => (
  <svg {...base} {...p}>
    <path d="M12 21s-6-5.3-6-10a6 6 0 0 1 12 0c0 4.7-6 10-6 10Z" /><circle cx="12" cy="11" r="2.2" />
  </svg>
)

export const CrosshairIcon = (p) => (
  <svg {...base} {...p}>
    <circle cx="12" cy="12" r="7" /><circle cx="12" cy="12" r="2" />
    <path d="M12 2v3M12 19v3M2 12h3M19 12h3" />
  </svg>
)

export const ThermometerIcon = (p) => (
  <svg {...base} {...p}>
    <path d="M10 4a2 2 0 1 1 4 0v9.5a4 4 0 1 1-4 0Z" /><path d="M12 10v6" />
  </svg>
)

export const WindIcon = (p) => (
  <svg {...base} {...p}>
    <path d="M3 8h9.5a2.5 2.5 0 1 0-2.5-2.5" /><path d="M3 12h13.5a2.5 2.5 0 1 1-2.5 2.5" />
    <path d="M3 16h7.5a2 2 0 1 1-2 2" />
  </svg>
)

export const DropIcon = (p) => (
  <svg {...base} {...p}><path d="M12 3s6 6.5 6 11a6 6 0 0 1-12 0c0-4.5 6-11 6-11Z" /></svg>
)

export const InfoIcon = (p) => (
  <svg {...base} {...p}><circle cx="12" cy="12" r="9" /><path d="M12 11v5M12 8h.01" /></svg>
)

export const RefreshIcon = (p) => (
  <svg {...base} {...p}>
    <path d="M20 12a8 8 0 1 1-2.3-5.7" /><path d="M20 4v5h-5" />
  </svg>
)

export const Spinner = (p) => (
  <svg {...base} className="spinner" {...p}><path d="M12 3a9 9 0 1 1-6.4 2.6" /></svg>
)
