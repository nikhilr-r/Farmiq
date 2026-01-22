import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { UserProvider } from './context/UserContext';
import Header from './components/Header';
import Footer from './components/Footer';
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
          <Header />
          <div className="flex-grow">
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
          <Footer />
        </div>
      </Router>
    </UserProvider>
  )
}

export default App;
