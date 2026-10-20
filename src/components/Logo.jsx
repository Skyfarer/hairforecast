/** Wordmark that follows the colour scheme live via <picture>. */
export default function Logo({ height = 44, className = '' }) {
  return (
    <picture className={`logo ${className}`}>
      <source srcSet="/images/hf_logo_dark.png" media="(prefers-color-scheme: dark)" />
      <img src="/images/hf_logo_light.png" alt="Hair Forecast" height={height} width={Math.round(height * 2.23)} />
    </picture>
  )
}
