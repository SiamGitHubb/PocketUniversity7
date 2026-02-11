import React, { useState, useRef, useEffect } from 'react';
import { useStore } from '../context/Store';
import { useNavigate } from 'react-router-dom';
import { Search, User, MessageSquare, X, Briefcase, Hash, Mail, Phone } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Modal, Button, Badge } from './UI';
import { User as UserType } from '../types';

export const GlobalSearch: React.FC<{ mobile?: boolean, onCloseMobile?: () => void }> = ({ mobile, onCloseMobile }) => {
  const { users, currentUser } = useStore();
  const [query, setQuery] = useState('');
  const [showResults, setShowResults] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserType | null>(null);
  const searchRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Filter users based on query
  const filteredUsers = query.trim() === '' ? [] : users.filter(u => 
    u.id !== currentUser?.id && (
      u.name.toLowerCase().includes(query.toLowerCase()) || 
      u.id.toLowerCase().includes(query.toLowerCase()) ||
      u.initials.toLowerCase().includes(query.toLowerCase())
    )
  );

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleUserClick = (user: UserType) => {
    setSelectedUser(user);
    setShowResults(false);
    setQuery('');
  };

  const startChat = () => {
    if (selectedUser) {
      navigate(`/chat?uid=${selectedUser.id}`);
      setSelectedUser(null);
      if (mobile && onCloseMobile) onCloseMobile();
    }
  };

  return (
    <div ref={searchRef} className={`relative transition-all duration-300 ease-in-out ${mobile ? 'w-full' : (isFocused || query ? 'w-72' : 'w-56')}`}>
      <div className="relative group">
        <Search className={`absolute left-3 top-1/2 -translate-y-1/2 text-brand-500 h-4 w-4 transition-colors group-hover:text-brand-400`} />
        <input 
          type="text" 
          placeholder="Search..." 
          value={query}
          onFocus={() => { setShowResults(true); setIsFocused(true); }}
          onBlur={() => setIsFocused(false)}
          onChange={(e) => { setQuery(e.target.value); setShowResults(true); }}
          className={`w-full bg-brand-900/40 backdrop-blur-md border border-brand-700/30 text-brand-50 rounded-full pl-9 pr-8 text-sm focus:border-brand-500 focus:bg-brand-900/80 focus:ring-1 focus:ring-brand-500 outline-none transition-all placeholder:text-brand-500/50 hover:border-brand-600 shadow-sm hover:shadow-md ${mobile ? 'py-3' : 'py-2'}`}
        />
        {query && (
          <button 
            onClick={() => { setQuery(''); setShowResults(false); }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-600 hover:text-brand-400 p-0.5 rounded-full hover:bg-brand-800/50 transition-colors"
          >
            <X size={12} />
          </button>
        )}
      </div>

      {/* Results Dropdown */}
      <AnimatePresence>
        {showResults && query && (
          <motion.div 
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full mt-2 w-full bg-brand-900 border border-brand-800 rounded-xl shadow-2xl overflow-hidden z-50 max-h-[300px] overflow-y-auto custom-scrollbar"
          >
            {filteredUsers.length > 0 ? (
              filteredUsers.map(user => (
                <div 
                  key={user.id} 
                  onClick={() => handleUserClick(user)}
                  className="p-3 hover:bg-brand-800/50 cursor-pointer border-b border-brand-800/30 last:border-0 flex items-center gap-3 transition-colors group"
                >
                  <div className="w-8 h-8 rounded-full bg-brand-800 flex items-center justify-center text-brand-100 font-bold text-xs shrink-0 border border-brand-700 group-hover:border-brand-500 transition-colors">
                     {user.profileImage ? (
                        <img src={user.profileImage} alt={user.initials} className="w-full h-full object-cover rounded-full" />
                     ) : (
                        user.initials
                     )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-baseline">
                      <p className="text-sm font-semibold text-brand-100 truncate group-hover:text-white">{user.name}</p>
                      <span className="text-[10px] text-brand-500 font-mono opacity-80">{user.id}</span>
                    </div>
                    <p className="text-xs text-brand-400 truncate">{user.role} • {user.department}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-4 text-center text-brand-500/50 text-xs">
                No users found.
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Profile Modal */}
      {selectedUser && (
        <Modal isOpen={!!selectedUser} onClose={() => setSelectedUser(null)} title="User Profile">
           <div className="flex flex-col items-center">
              <div className="w-24 h-24 rounded-full border-4 border-brand-700 bg-brand-950 overflow-hidden shadow-lg flex items-center justify-center mb-4">
                  {selectedUser.profileImage ? (
                    <img src={selectedUser.profileImage} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-3xl font-bold text-brand-600">{selectedUser.initials}</span>
                  )}
              </div>
              <h2 className="text-xl font-bold text-brand-50">{selectedUser.name}</h2>
              <div className="flex gap-2 mt-2">
                 <Badge color="brand">{selectedUser.role}</Badge>
                 <Badge color="blue">{selectedUser.department}</Badge>
              </div>

              <div className="w-full mt-6 space-y-3">
                 {selectedUser.bio && (
                   <p className="text-sm text-brand-300 text-center italic mb-4">"{selectedUser.bio}"</p>
                 )}
                 
                 <div className="grid grid-cols-2 gap-3">
                    <div className="bg-brand-950/50 p-3 rounded-lg border border-brand-800/50">
                       <p className="text-[10px] text-brand-500 uppercase font-bold flex items-center gap-1"><Hash size={10}/> ID</p>
                       <p className="text-sm text-brand-200 font-mono">{selectedUser.id}</p>
                    </div>
                    <div className="bg-brand-950/50 p-3 rounded-lg border border-brand-800/50">
                       <p className="text-[10px] text-brand-500 uppercase font-bold flex items-center gap-1"><Briefcase size={10}/> Dept</p>
                       <p className="text-sm text-brand-200">{selectedUser.department} {selectedUser.section ? `- Sec ${selectedUser.section}` : ''}</p>
                    </div>
                    <div className="bg-brand-950/50 p-3 rounded-lg border border-brand-800/50 col-span-2">
                       <p className="text-[10px] text-brand-500 uppercase font-bold flex items-center gap-1"><Mail size={10}/> Email</p>
                       <p className="text-sm text-brand-200">{selectedUser.email}</p>
                    </div>
                    <div className="bg-brand-950/50 p-3 rounded-lg border border-brand-800/50 col-span-2">
                       <p className="text-[10px] text-brand-500 uppercase font-bold flex items-center gap-1"><Phone size={10}/> Phone</p>
                       <p className="text-sm text-brand-200">{selectedUser.phone || 'Not Provided'}</p>
                    </div>
                 </div>
              </div>

              <div className="mt-8 w-full flex gap-3">
                 <Button variant="secondary" onClick={() => setSelectedUser(null)} className="flex-1">Close</Button>
                 <Button onClick={startChat} className="flex-1">
                    <MessageSquare size={16} className="mr-2" /> Message
                 </Button>
              </div>
           </div>
        </Modal>
      )}
    </div>
  );
};