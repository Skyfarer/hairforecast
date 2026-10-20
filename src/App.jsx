import { BrowserRouter, Routes, Route, Navigate, useParams } from 'react-router-dom'
import ForecastPage from './pages/ForecastPage'

/** A pre-rendered city page; the city comes from the page itself, not the bundle. */
function CityRoute({ city, cityInfoHtml }) {
  const { slug } = useParams()
  if (!city || city.slug !== slug) return <Navigate to="/" replace />
  return <ForecastPage city={city} cityInfoHtml={cityInfoHtml} />
}

export default function App({ city = null, cityInfoHtml = null }) {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<ForecastPage />} />
        <Route path="/hair-forecast/:slug" element={<CityRoute city={city} cityInfoHtml={cityInfoHtml} />} />
        {/* Old bookmark from the two-page app: everything lives on one page now. */}
        <Route path="/manual-location" element={<Navigate to="/" replace />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
