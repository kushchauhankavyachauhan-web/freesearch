import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import Landing from './pages/Landing';
import Auth from './pages/Auth';
import Onboarding from './pages/Onboarding';
import Dashboard from './pages/Dashboard';
import DeepWork from './pages/DeepWork';
import WeeklyReport from './pages/WeeklyReport';
import { isAuthenticated } from './lib/auth';

function Protected({ children }) {
  return isAuthenticated() ? children : <Navigate to="/login" replace />;
}
function PublicOnly({ children }) {
  return !isAuthenticated() ? children : <Navigate to="/dashboard" replace />;
}

export default function App() {
  return (
    <BrowserRouter>
      <AnimatePresence mode="wait">
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<PublicOnly><Auth mode="login" /></PublicOnly>} />
          <Route path="/signup" element={<PublicOnly><Auth mode="signup" /></PublicOnly>} />
          <Route path="/onboarding" element={<Protected><Onboarding /></Protected>} />
          <Route path="/dashboard" element={<Protected><Dashboard /></Protected>} />
          <Route path="/deepwork" element={<Protected><DeepWork /></Protected>} />
          <Route path="/report" element={<Protected><WeeklyReport /></Protected>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AnimatePresence>
    </BrowserRouter>
  );
}
