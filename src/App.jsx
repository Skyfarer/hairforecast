import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import './App.css'
import HomePage from './pages/HomePage'
import ManualLocationPage from './pages/ManualLocationPage'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/manual-location" element={<ManualLocationPage />} />
      </Routes>
    </Router>
  )
}

export default App
