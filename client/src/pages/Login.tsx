import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '@/services/api';
import { Lock, User as UserIcon, AlertCircle, ShieldCheck } from 'lucide-react';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const data = await authService.login({ username, password });
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Login gagal. Silakan periksa kembali kredensial Anda.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f1f5f9] px-4 relative overflow-hidden font-sans">
      {/* Background Decorative Elements */}
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-primary/5 rounded-full blur-[150px] -z-10 -translate-y-1/2 translate-x-1/2 animate-pulse" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-secondary/5 rounded-full blur-[120px] -z-10 translate-y-1/2 -translate-x-1/2" />
      
      <div className="max-w-md w-full space-y-8 bg-white/80 backdrop-blur-xl p-10 rounded-[2.5rem] shadow-2xl shadow-primary/5 border border-white relative animate-in fade-in zoom-in duration-700">
        <div className="text-center">
          <div className="mx-auto h-20 w-20 bg-gradient-to-tr from-primary to-primary/80 rounded-[2rem] flex items-center justify-center shadow-lg shadow-primary/20 rotate-3 hover:rotate-0 transition-transform duration-500">
            <span className="text-white font-black text-3xl">H</span>
          </div>
          <h2 className="mt-8 text-3xl font-black text-slate-900">Selamat Datang</h2>
          <p className="mt-2 text-sm text-slate-500 font-medium">
            Sistem Pemenangan Internal HIPMI
          </p>
        </div>
        
        <form className="mt-10 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-destructive/5 border border-destructive/20 p-4 rounded-2xl flex items-center animate-in slide-in-from-top-2">
              <AlertCircle className="h-5 w-5 text-destructive mr-3 flex-shrink-0" />
              <p className="text-sm text-destructive font-semibold">{error}</p>
            </div>
          )}
          
          <div className="space-y-4">
            <div className="group relative">
              <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 ml-4 mb-1.5 block">Username</label>
              <div className="relative">
                <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-primary transition-colors" />
                <input
                  type="text"
                  required
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary focus:bg-white transition-all duration-300 placeholder:text-slate-400 placeholder:font-medium"
                  placeholder="Masukkan username anda"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>
            </div>
            
            <div className="group relative">
              <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 ml-4 mb-1.5 block">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-primary transition-colors" />
                <input
                  type="password"
                  required
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary focus:bg-white transition-all duration-300 placeholder:text-slate-400 placeholder:font-medium"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center items-center gap-2 py-4 px-4 bg-primary text-white text-sm font-bold rounded-2xl shadow-lg shadow-primary/20 hover:bg-primary/90 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300 disabled:opacity-50 group"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <ShieldCheck className="w-5 h-5 group-hover:scale-110 transition-transform" />
                  Masuk ke Dashboard
                </>
              )}
            </button>
          </div>
        </form>

        <div className="pt-6 text-center">
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
            © 2026 HIPMI Digital Ecosystem
          </p>
        </div>
      </div>
    </div>
  );
}

