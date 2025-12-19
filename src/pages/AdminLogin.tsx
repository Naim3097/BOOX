import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import logo from '../assets/logo.png';

export default function AdminLogin() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'Onex@1234') {
      localStorage.setItem('isAuthenticated', 'true');
      navigate('/admin');
    } else {
      setError('Invalid password');
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#F8FAFC] font-sans p-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl shadow-black/5 border border-gray-100 p-8 md:p-10">
        <div className="flex flex-col items-center mb-8">
          <img src={logo} alt="One X" className="h-16 object-contain mb-4" />
          <h1 className="text-2xl font-bold text-gray-900">Admin Access</h1>
          <p className="text-gray-500 mt-2">Please enter your password to continue</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <Input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="rounded-full px-6 py-6 bg-gray-50 border-gray-100 focus:bg-white transition-all text-center text-lg"
            />
            {error && <p className="text-red-500 text-sm text-center mt-2">{error}</p>}
          </div>
          
          <Button 
            type="submit" 
            className="w-full rounded-full py-6 text-lg font-medium bg-black hover:bg-gray-800 shadow-lg shadow-black/10"
          >
            Login
          </Button>
        </form>
      </div>
      
      <div className="mt-8 text-center">
        <a href="/" className="text-sm text-gray-400 hover:text-gray-600 transition-colors">
          ← Back to Booking
        </a>
      </div>
    </div>
  );
}
