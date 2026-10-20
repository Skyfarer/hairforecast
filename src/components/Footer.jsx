export default function Footer() {
  return (
    <footer className="foot">
      <details className="about">
        <summary>What is the Hair Forecast Index?</summary>
        <div className="about-body">
          <p>
            The Hair Forecast Index (HFI) rates the weather for your hair from <strong>1</strong> (frizz and flyaways)
            to <strong>10</strong> (your style stays put). It starts from the dew point, the best single measure of how
            much moisture the air will push into your hair, then subtracts for strong wind and heavy rain and adds a
            little for cool temperatures.
          </p>
          <ul className="about-scale">
            <li><span className="chip hfi-great">8–10</span> Great hair weather</li>
            <li><span className="chip hfi-moderate">5–7</span> Moderate, some frizz possible</li>
            <li><span className="chip hfi-bad">1–4</span> Bad hair weather</li>
          </ul>
          <p className="muted">Forecasts come from the ECMWF global model, updated daily, at six-hour steps.</p>
        </div>
      </details>
      <p className="foot-copy">© {new Date().getFullYear()} Hair Forecast</p>
    </footer>
  )
}
