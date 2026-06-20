import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Landing from './pages/scrapdeviq/Landing';
import PredictiveScan from './pages/scrapdeviq/PredictiveScan';
import ResaleMatcher from './pages/scrapdeviq/ResaleMatcher';
import ImpactDashboard from './pages/scrapdeviq/ImpactDashboard';
import ProofOfDisposal from './pages/scrapdeviq/ProofOfDisposal';
import Navbar from './components/scrapdeviq/Navbar';

export default function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/scan" element={<PredictiveScan />} />
        <Route path="/resale" element={<ResaleMatcher />} />
        <Route path="/impact" element={<ImpactDashboard />} />
        <Route path="/proof" element={<ProofOfDisposal />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
