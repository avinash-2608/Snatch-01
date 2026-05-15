import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Signup from './pages/Signup';
import AdminDashboard from './pages/AdminDashboard';
import CustomerDashboard from './pages/CustomerDashboard';
import StoreDashboard from './pages/StoreDashboard';
import PayBills from './pages/PayBills';
import { OfferProvider } from './context/OfferContext';
import { ThemeProvider } from './context/ThemeContext';
import Chatbot from './components/chatbot/Chatbot';
import Background from './components/background/Background';

function App() {
  return (
    <ThemeProvider>
      <OfferProvider>
        <Router>
          {/* Animated Background Layer */}
          <Background />

          {/* Dark Overlay for better readability */}
          <div className="fixed inset-0 -z-5 pointer-events-none" style={{
            background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.5) 0%, rgba(15, 23, 42, 0.7) 100%)'
          }} />

          {/* Main Content Layer */}
          <div className="relative z-10 min-h-screen flex flex-col">
            <Routes>
              <Route path="/" element={<Navigate to="/login" replace />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/customer" element={<CustomerDashboard />} />
              <Route path="/store" element={<StoreDashboard />} />
              <Route path="/pay-bills" element={<PayBills />} />
            </Routes>
            <Chatbot />
          </div>
        </Router>
      </OfferProvider>
    </ThemeProvider>
  );
}

export default App;
