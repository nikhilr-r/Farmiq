import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { UserProvider } from './context/UserContext';
import Header from './components/Header';
import Footer from './components/Footer';
import BottomNav from './components/BottomNav';
import Home from './pages/Home';
import Schemes from './pages/Schemes';
import Crops from './pages/Crops';
import Officers from './pages/Officers';
import Calendar from './pages/Calendar';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import './index.css';

function App() {
  return (
    <UserProvider>
      <Router>
        <div className="min-h-screen bg-gray-50 font-sans flex flex-col">
          {/* Conditional Header: Show only if NOT in admin routes (optional, but good practice) */}
          <Header />

          <div className="flex-grow pb-16"> {/* Add padding bottom for BottomNav */}
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/schemes" element={<Schemes />} />
              <Route path="/crops" element={<Crops />} />
              <Route path="/officers" element={<Officers />} />
              <Route path="/calendar" element={<Calendar />} />
              <Route path="/admin/login" element={<AdminLogin />} />
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
            </Routes>
          </div>

          {/* Mobile Bottom Nav (Visible on all screens for now) */}
          <BottomNav />
        </div>
      </Router>
    </UserProvider>
  )
}

export default App;
