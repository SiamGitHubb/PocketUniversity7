import React, { useState } from 'react';
import { HashRouter as Router, Routes, Route, Navigate, Outlet, useLocation } from 'react-router-dom';
import { StoreProvider, useStore } from './context/Store';
import { Auth } from './pages/Auth';
import { Dashboard } from './pages/Dashboard';
import { Courses } from './pages/Courses';
import { Chat } from './pages/Chat';
import { Profile } from './pages/Profile';
import { Sidebar } from './components/Sidebar';
import { Menu, Database, HardDrive, Search, X } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { isMongoConfigured } from './lib/mongodb';
import { Toast } from './components/UI';
import { GlobalSearch } from './components/GlobalSearch';

// Protected Route Wrapper
const ProtectedLayout = () => {
  const { currentUser } = useStore();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const location = useLocation();
  
  // Close sidebar on route change
  React.useEffect(() => {
    setIsSidebarOpen(false);
    setIsMobileSearchOpen(false);
  }, [location]);

  if (!currentUser) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <div className="flex min-h-[100dvh] bg-brand-950 text-brand-50 font-sans selection:bg-brand-500 selection:text-brand-950">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-30 bg-brand-900 border-b border-brand-800 px-4 py-3 flex items-center justify-between shadow-md h-16">
         {!isMobileSearchOpen ? (
           <>
             <div className="flex items-center gap-3">
                <button 
                  onClick={() => setIsSidebarOpen(true)} 
                  className="text-brand-100 p-1 hover:bg-brand-800 rounded-md transition-colors"
                >
                  <Menu size={24} />
                </button>
                <span className="font-bold text-brand-100 tracking-tight">PocketUni</span>
             </div>
             <div className="flex items-center gap-3">
                <button 
                  onClick={() => setIsMobileSearchOpen(true)}
                  className="text-brand-400 p-2 hover:bg-brand-800 rounded-full transition-colors"
                >
                  <Search size={20} />
                </button>
                <div className="w-8 h-8 rounded-full bg-brand-800 flex items-center justify-center border border-brand-600 overflow-hidden">
                    {currentUser.profileImage ? (
                      <img src={currentUser.profileImage} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-xs font-bold text-brand-100">{currentUser.initials}</span>
                    )}
                </div>
             </div>
           </>
         ) : (
           <div className="w-full flex items-center gap-2">
             <GlobalSearch mobile onCloseMobile={() => setIsMobileSearchOpen(false)} />
             <button 
                onClick={() => setIsMobileSearchOpen(false)}
                className="text-brand-400 p-1"
             >
               <span className="text-xs font-medium">Cancel</span>
             </button>
           </div>
         )}
      </div>

      <main className="flex-1 lg:ml-64 min-h-[100dvh] w-full overflow-x-hidden relative bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-brand-900/20 via-brand-950 to-brand-950">
        {/* Desktop Global Search - Top Right */}
        <div className="hidden lg:flex absolute top-4 right-8 z-20 pointer-events-none justify-end w-full">
           <div className="pointer-events-auto">
              <GlobalSearch />
           </div>
        </div>

        <div className="pt-16 lg:pt-0 min-h-[100dvh] pb-8">
           <Outlet />
        </div>
      </main>

      {/* DB Status Indicator (Bottom Right) */}
      <div className="fixed bottom-2 right-2 z-30 pointer-events-none opacity-50 hover:opacity-100 transition-opacity">
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-bold shadow-lg border backdrop-blur-md ${isMongoConfigured ? 'bg-green-500/10 border-green-500/20 text-green-400' : 'bg-orange-500/10 border-orange-500/20 text-orange-400'}`}>
           {isMongoConfigured ? <Database size={12} /> : <HardDrive size={12} />}
           {isMongoConfigured ? 'MongoDB' : 'Local'}
        </div>
      </div>

      {/* Mobile Overlay */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 bg-brand-950/80 backdrop-blur-sm z-40 lg:hidden"
          />
        )}
      </AnimatePresence>
    </div>
  );
};

const ToastContainer = () => {
  const { toasts, dismissToast } = useStore();
  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] flex flex-col gap-2 w-full max-w-md px-4 pointer-events-none">
      <AnimatePresence>
        {toasts.map(toast => (
          <Toast 
            key={toast.id}
            id={toast.id}
            message={toast.message}
            type={toast.type}
            onDismiss={dismissToast}
          />
        ))}
      </AnimatePresence>
    </div>
  );
};

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/auth" element={<Auth />} />
      <Route element={<ProtectedLayout />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/courses" element={<Courses />} />
        <Route path="/chat" element={<Chat />} />
        <Route path="/profile" element={<Profile />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

const App: React.FC = () => {
  return (
    <StoreProvider>
      <Router>
        <AppRoutes />
        <ToastContainer />
      </Router>
    </StoreProvider>
  );
};

export default App;