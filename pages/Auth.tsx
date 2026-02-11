import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../context/Store';
import { UserRole } from '../types';
import { Button, Input } from '../components/UI';
import { ArrowRight, ChevronDown } from 'lucide-react';

// Constants for Dropdowns
const DEPARTMENTS = ['CSE', 'BBA', 'ENG', 'EEE', 'ECO'];
const SEMESTERS = ['1', '2', '3', '4', '5', '6', '7', '8'];
const SECTIONS = Array.from({ length: 26 }, (_, i) => String.fromCharCode(65 + i)); // A-Z

// Placeholder Logo URL
const LOGO_URL = "https://cdn-icons-png.flaticon.com/512/3413/3413535.png";

export const Auth: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [role, setRole] = useState<UserRole>(UserRole.STUDENT);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Form States
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [dept, setDept] = useState('');
  const [sem, setSem] = useState('');
  const [sec, setSec] = useState('');

  const { login, signup } = useStore();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isLogin) {
        const success = await login(email, password);
        if (success) {
          navigate('/');
        } else {
          setError('Invalid Credentials. Please sign up first.');
        }
      } else {
        // Validation
        if (!dept) { setError('Please select a department'); setLoading(false); return; }
        if (role !== UserRole.TEACHER) {
          if (!sem) { setError('Please select a semester'); setLoading(false); return; }
          if (!sec) { setError('Please select a section'); setLoading(false); return; }
        }

        const success = await signup({
          name, 
          email, 
          password, 
          role, 
          department: dept, 
          semester: role === UserRole.TEACHER ? undefined : sem, 
          section: role === UserRole.TEACHER ? undefined : sec
        });
        
        if (success) {
          navigate('/');
        } else {
          setError('Signup failed');
        }
      }
    } catch (err) {
      setError('An error occurred');
    } finally {
      setLoading(false);
    }
  };

  // Shared Select Style to match Input component
  const selectClassName = "w-full bg-brand-950/50 border border-brand-700/50 text-brand-50 rounded-lg px-4 py-2.5 text-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none transition-all placeholder:text-brand-700/70 hover:border-brand-600 appearance-none cursor-pointer";

  return (
    <div className="min-h-screen flex items-center justify-center bg-brand-950 relative overflow-hidden">
      {/* Background Blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-brand-500/10 rounded-full blur-[100px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-brand-300/10 rounded-full blur-[100px]" />

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md z-10 p-4"
      >
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-2xl bg-gradient-to-tr from-brand-500/20 to-brand-700/20 shadow-xl mb-4 p-4 border border-brand-500/30">
             <img src={LOGO_URL} alt="Pocket University" className="w-full h-full object-contain drop-shadow-lg" />
          </div>
          <h1 className="text-3xl font-bold text-brand-100 tracking-tight">Pocket University</h1>
          <p className="text-brand-400 mt-2">Academic collaboration reimagined.</p>
        </div>

        <div className="glass-panel p-8 rounded-2xl shadow-2xl border border-brand-700/50">
          <div className="flex gap-4 mb-6 bg-brand-900/50 p-1 rounded-lg">
            <button 
              className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${isLogin ? 'bg-brand-700 text-white shadow-sm' : 'text-brand-400 hover:text-brand-200'}`}
              onClick={() => setIsLogin(true)}
            >
              Sign In
            </button>
            <button 
              className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${!isLogin ? 'bg-brand-700 text-white shadow-sm' : 'text-brand-400 hover:text-brand-200'}`}
              onClick={() => setIsLogin(false)}
            >
              Sign Up
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div className="grid grid-cols-3 gap-2 mb-4">
                {Object.values(UserRole).map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => { setRole(r); setDept(''); setSem(''); setSec(''); }}
                    className={`text-xs py-2 px-1 rounded border transition-colors ${role === r ? 'bg-brand-500/20 border-brand-500 text-brand-300' : 'border-brand-700 text-brand-500 hover:border-brand-600'}`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            )}

            {!isLogin && <Input placeholder="Full Name" value={name} onChange={e => setName(e.target.value)} required />}
            
            <Input 
              placeholder={isLogin ? "Unique ID or Email" : "Email"} 
              value={email} 
              onChange={e => setEmail(e.target.value)} 
              required 
            />
            
            {!isLogin && (
              <>
                <div className="relative">
                  <label className="block text-xs font-semibold text-brand-300 ml-1 mb-1.5">Department</label>
                  <div className="relative">
                    <select 
                      value={dept} 
                      onChange={e => setDept(e.target.value)} 
                      className={selectClassName}
                      required
                    >
                      <option value="" disabled>Select Department</option>
                      {DEPARTMENTS.map(d => (
                        <option key={d} value={d} className="bg-brand-900 text-brand-100">{d}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-3 text-brand-500 pointer-events-none" size={16} />
                  </div>
                </div>

                {role !== UserRole.TEACHER && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                       <label className="block text-xs font-semibold text-brand-300 ml-1 mb-1.5">Semester</label>
                       <div className="relative">
                         <select 
                            value={sem} 
                            onChange={e => setSem(e.target.value)} 
                            className={selectClassName}
                            required
                         >
                            <option value="" disabled>Sem</option>
                            {SEMESTERS.map(s => (
                              <option key={s} value={s} className="bg-brand-900 text-brand-100">{s}</option>
                            ))}
                         </select>
                         <ChevronDown className="absolute right-3 top-3 text-brand-500 pointer-events-none" size={16} />
                       </div>
                    </div>
                    <div>
                       <label className="block text-xs font-semibold text-brand-300 ml-1 mb-1.5">Section</label>
                       <div className="relative">
                         <select 
                            value={sec} 
                            onChange={e => setSec(e.target.value)} 
                            className={selectClassName}
                            required
                         >
                            <option value="" disabled>Sec</option>
                            {SECTIONS.map(s => (
                              <option key={s} value={s} className="bg-brand-900 text-brand-100">{s}</option>
                            ))}
                         </select>
                         <ChevronDown className="absolute right-3 top-3 text-brand-500 pointer-events-none" size={16} />
                       </div>
                    </div>
                  </div>
                )}
              </>
            )}

            <Input 
              type="password" 
              placeholder="Password" 
              value={password} 
              onChange={e => setPassword(e.target.value)} 
              required 
            />

            {error && <p className="text-red-400 text-xs text-center bg-red-500/10 py-2 rounded border border-red-500/20">{error}</p>}

            <Button type="submit" isLoading={loading} className="w-full h-11 text-base">
              {isLogin ? 'Access Dashboard' : 'Create Account'} <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </form>
          
          <div className="mt-6 text-center text-xs text-brand-500 opacity-80">
            <p>{isLogin ? 'Use your unique ID or email to sign in.' : 'Join your academic circle today.'}</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};