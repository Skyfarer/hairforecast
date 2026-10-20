import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import ForecastPage from './pages/ForecastPage'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<ForecastPage />} />
        {/* Old bookmark from the two-page app: everything lives on one page now. */}
        <Route path="/manual-location" element={<Navigate to="/" replace />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
