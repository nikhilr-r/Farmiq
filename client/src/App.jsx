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
import CropDoctor from './pages/CropDoctor';
import './index.css';

import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';

function App() {
  return (
    <UserProvider>
      <Router>
        <div className="min-h-screen bg-gray-50 font-sans flex flex-col">
          {/* Conditional Header: Show only if NOT in admin routes (optional, but good practice) */}
          <Header />

          <main className="flex-grow pb-24 md:pb-8 max-w-7xl mx-auto w-full">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/schemes" element={<Schemes />} />
              <Route path="/crops" element={<Crops />} />
              <Route path="/officers" element={<Officers />} />
              <Route path="/calendar" element={<Calendar />} />
              <Route path="/admin/login" element={<AdminLogin />} />
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
              <Route path="/crop-doctor" element={<CropDoctor />} />
            </Routes>
          </main>

          {/* Mobile Bottom Nav (Visible only on mobile) */}
          <div className="md:hidden">
            <BottomNav />
          </div>
        </div>
      </Router>
    </UserProvider>
  )
}

export default App;
