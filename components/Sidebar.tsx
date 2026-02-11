import React, { useState, useRef, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useStore } from '../context/Store';
import { 
  LayoutDashboard, 
  BookOpen, 
  MessageSquare, 
  Bell, 
  LogOut, 
  UserCircle,
  User,
  X,
  Check
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const LOGO_URL = "https://cdn-icons-png.flaticon.com/512/3413/3413535.png";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { currentUser, logout, notifications, markNotificationRead, clearAllNotifications } = useStore();
  const navigate = useNavigate();
  const [showNotifications, setShowNotifications] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  const handleLogout = () => {
    logout();
    navigate('/auth');
  };

  useEffect(() => {
    // Optional: Close notifications if clicking outside sidebar entirely, 
    // but for accordion style inside sidebar, this is less critical.
    // Keeping it for good UX if user clicks main content.
    const handleClickOutside = (event: MouseEvent) => {
      if (isOpen && notifRef.current && !notifRef.current.contains(event.target as Node)) {
        // Only close if it's not a click inside the notification area
        // setShowNotifications(false); 
        // Logic might be annoying if they are interacting with the sidebar, so I'll disable auto-close for accordion mode 
        // to prevent accidental closing while scrolling.
      }
    };
    // document.addEventListener("mousedown", handleClickOutside);
    // return () => {
    //   document.removeEventListener("mousedown", handleClickOutside);
    // };
  }, [isOpen]);

  if (!currentUser) return null;

  const myNotifications = notifications.filter(n => n.userId === currentUser.id).sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  const unreadCount = myNotifications.filter(n => !n.read).length;

  const navItems = [
    { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/courses', icon: BookOpen, label: 'Courses' },
    { to: '/chat', icon: MessageSquare, label: 'Messages' },
    { to: '/profile', icon: User, label: 'Profile' },
  ];

  return (
    <>
      {/* Changed z-30 to z-50 to ensure sidebar is on top of mobile header and overlay */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-brand-900 border-r border-brand-800 flex flex-col shadow-2xl transition-transform duration-300 ease-in-out lg:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        {/* Brand Header */}
        <div className="h-20 flex items-center justify-between px-6 border-b border-brand-800/50 bg-brand-950/20 shrink-0">
          <div className="flex items-center gap-3">
            <img src={LOGO_URL} alt="Logo" className="h-8 w-8 object-contain drop-shadow-md" />
            <h1 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-brand-300 to-brand-500 tracking-tight">
              Pocket<span className="text-brand-100 font-light">Uni</span>
            </h1>
          </div>
          {/* Mobile Close Button */}
          <button onClick={onClose} className="lg:hidden text-brand-400 hover:text-white p-1 rounded-md hover:bg-brand-800">
            <X size={24} />
          </button>
        </div>

        {/* User Profile Summary */}
        <div className="px-6 py-6 flex flex-col items-center shrink-0">
           <div className="relative">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-brand-700 to-brand-900 border-2 border-brand-600 flex items-center justify-center shadow-lg overflow-hidden">
                 {currentUser.profileImage ? (
                   <img src={currentUser.profileImage} alt="Profile" className="w-full h-full object-cover" />
                 ) : (
                   <span className="text-2xl font-bold text-brand-100">{currentUser.initials}</span>
                 )}
              </div>
              <div className="absolute bottom-0 right-0 w-5 h-5 bg-brand-500 border-4 border-brand-900 rounded-full"></div>
           </div>
           <h2 className="mt-3 text-brand-50 font-semibold">{currentUser.name}</h2>
           <span className="text-xs text-brand-400 bg-brand-950/50 px-3 py-1 rounded-full mt-1 border border-brand-800">
              {currentUser.role}
           </span>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 space-y-2 mt-4 overflow-y-auto custom-scrollbar">
          <p className="px-4 text-[10px] font-bold text-brand-500 uppercase tracking-widest opacity-70 mb-2">Menu</p>
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={onClose} // Close sidebar on mobile when clicked
              className={({ isActive }) =>
                `flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 group ${
                  isActive
                    ? 'bg-brand-800 text-brand-100 border-l-4 border-brand-400 shadow-lg shadow-brand-950/20'
                    : 'text-brand-400 hover:bg-brand-800/50 hover:text-brand-200'
                }`
              }
            >
              <item.icon className={`mr-3 h-5 w-5 transition-colors ${ ({isActive}:any) => isActive ? 'text-brand-400' : 'text-brand-600 group-hover:text-brand-400'}`} />
              {item.label}
            </NavLink>
          ))}
          
          {/* Notifications Button & List (Accordion) */}
          <div className="flex flex-col" ref={notifRef}>
             <button 
               onClick={() => setShowNotifications(!showNotifications)}
               className={`w-full flex items-center px-4 py-3 text-sm font-medium transition-all duration-200 group ${
                  showNotifications 
                    ? 'bg-brand-800 text-brand-100 rounded-t-xl rounded-b-none' 
                    : 'text-brand-400 hover:bg-brand-800/50 hover:text-brand-200 rounded-xl'
               }`}
             >
               <Bell className="mr-3 h-5 w-5" />
               Notifications
               {unreadCount > 0 && (
                 <span className="ml-auto bg-brand-500 text-brand-950 font-bold text-[10px] min-w-[20px] h-5 flex items-center justify-center rounded-full shadow-md">
                   {unreadCount}
                 </span>
               )}
             </button>

             {/* Notifications Accordion Content */}
             <AnimatePresence>
               {showNotifications && (
                 <motion.div 
                   initial={{ height: 0, opacity: 0 }}
                   animate={{ height: 'auto', opacity: 1 }}
                   exit={{ height: 0, opacity: 0 }}
                   className="overflow-hidden bg-brand-900 border-x border-b border-brand-700/30 rounded-b-xl mb-4"
                 >
                   <div className="p-3 border-b border-brand-800/50 flex justify-between items-center bg-brand-950/20">
                      <span className="text-xs font-semibold text-brand-300">Recent</span>
                      {unreadCount > 0 && (
                       <button 
                        onClick={(e) => { e.stopPropagation(); clearAllNotifications(); }}
                        className="text-[10px] text-brand-500 hover:text-brand-300 flex items-center transition-colors"
                       >
                         <Check size={12} className="mr-1"/> Mark all read
                       </button>
                     )}
                   </div>
                   
                   <div className="max-h-[300px] overflow-y-auto custom-scrollbar p-2 space-y-2 bg-brand-950/10">
                     {myNotifications.length === 0 ? (
                       <div className="p-4 text-center flex flex-col items-center text-brand-600">
                         <Bell size={20} className="mb-2 opacity-20"/>
                         <span className="text-xs">No notifications</span>
                       </div>
                     ) : (
                       myNotifications.map(notif => (
                         <div 
                           key={notif.id}
                           onClick={() => markNotificationRead(notif.id)}
                           className={`p-2.5 rounded-lg text-left cursor-pointer transition-all border border-transparent ${notif.read ? 'opacity-60 hover:opacity-100 hover:bg-brand-800/30' : 'bg-brand-800/40 hover:bg-brand-800/60 border-l-brand-500 border-l-2'}`}
                         >
                           <div className="flex justify-between items-start mb-1 gap-2">
                             <span className={`text-[11px] font-semibold leading-tight ${notif.read ? 'text-brand-300' : 'text-brand-100'}`}>{notif.title}</span>
                             <span className="text-[9px] text-brand-600 whitespace-nowrap">{new Date(notif.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                           </div>
                           <p className="text-[10px] text-brand-400 line-clamp-2 leading-relaxed">{notif.message}</p>
                         </div>
                       ))
                     )}
                   </div>
                 </motion.div>
               )}
             </AnimatePresence>
          </div>
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-brand-800 bg-brand-900/50 shrink-0">
          <div className="flex items-center gap-3 px-2 mb-3">
             <div className="bg-brand-950 p-2 rounded-lg">
                <UserCircle size={16} className="text-brand-500"/>
             </div>
             <div className="overflow-hidden">
               <div className="text-[10px] text-brand-500 uppercase font-bold tracking-wider">ID</div>
               <div className="text-xs font-mono text-brand-200 truncate">{currentUser.id}</div>
             </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex w-full items-center justify-center px-4 py-2 text-sm font-medium text-red-300 bg-red-500/10 hover:bg-red-500/20 hover:text-red-200 rounded-lg transition-all border border-red-500/10"
          >
            <LogOut className="mr-2 h-4 w-4" />
            Sign Out
          </button>
        </div>
      </aside>
    </>
  );
};