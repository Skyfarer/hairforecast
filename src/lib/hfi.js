// Hair Forecast Index (HFI) bands. The index runs 1 (bad) to 10 (great).

export const HFI_LEVELS = {
  great: {
    key: 'great',
    label: 'Great Hair Weather',
    short: 'Great',
    description:
      'Low humidity and gentle winds mean your style should stay in place all day.',
  },
  moderate: {
    key: 'moderate',
    label: 'Moderate Hair Weather',
    short: 'Moderate',
    description: 'Some frizz is possible. An anti-frizz product should keep things in check.',
  },
  bad: {
    key: 'bad',
    label: 'Bad Hair Weather',
    short: 'Bad',
    description:
      'High frizz alert. Consider wearing your hair up or using strong-hold products.',
  },
}

export function hfiLevel(hfi) {
  if (hfi == null || Number.isNaN(hfi)) return null
  if (hfi >= 8) return HFI_LEVELS.great
  if (hfi >= 5) return HFI_LEVELS.moderate
  return HFI_LEVELS.bad
}

export function roundHfi(hfi) {
  if (hfi == null) return null
  return Math.min(10, Math.max(1, Math.round(hfi)))
}
