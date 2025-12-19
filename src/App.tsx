import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import BookingPage from './pages/BookingPage';
import AdminDashboard from './pages/AdminDashboard';
import AdminLogin from './pages/AdminLogin';
import 'react-day-picker/dist/style.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<BookingPage />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/login" element={<AdminLogin />} />
      </Routes>
    </Router>
  );
}

export default App;
