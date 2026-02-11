import React, { useState, useEffect, useRef } from 'react';
import { useStore } from '../context/Store';
import { Input } from '../components/UI';
import { Search, Send, User, MessageCircle, ArrowLeft } from 'lucide-react';
import { User as UserType } from '../types';
import { motion } from 'framer-motion';
import { useSearchParams } from 'react-router-dom';

export const Chat: React.FC = () => {
  const { currentUser, users, messages, sendMessage } = useStore();
  const [search, setSearch] = useState('');
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [showMobileChat, setShowMobileChat] = useState(false);
  const [searchParams] = useSearchParams();

  // Handle URL param for pre-selecting a user (e.g. coming from Global Search)
  useEffect(() => {
    const uidParam = searchParams.get('uid');
    if (uidParam && uidParam !== currentUser?.id) {
       setSelectedUserId(uidParam);
       setShowMobileChat(true);
    }
  }, [searchParams, currentUser]);

  const filteredUsers = users.filter(u => 
    u.id !== currentUser?.id && 
    (u.name.toLowerCase().includes(search.toLowerCase()) || 
     u.id.toLowerCase().includes(search.toLowerCase()) ||
     u.initials.toLowerCase().includes(search.toLowerCase()))
  );

  const selectedUser = users.find(u => u.id === selectedUserId);

  const currentChatMessages = messages.filter(m => 
    (m.senderId === currentUser?.id && m.receiverId === selectedUserId) ||
    (m.senderId === selectedUserId && m.receiverId === currentUser?.id)
  );

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputText.trim() && selectedUserId) {
      sendMessage(selectedUserId, inputText);
      setInputText('');
    }
  };

  const handleUserSelect = (userId: string) => {
    setSelectedUserId(userId);
    setShowMobileChat(true);
  };

  const handleBackToList = () => {
    setShowMobileChat(false);
  };

  useEffect(() => {
    if (showMobileChat) {
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  }, [currentChatMessages, showMobileChat]);

  if (!currentUser) return null;

  return (
    // Fixed height container relative to viewport (dvh handles mobile address bars)
    <div className="h-[calc(100dvh-4rem)] lg:h-[calc(100vh-2rem)] flex p-0 lg:p-6 lg:pt-12 gap-6 pt-0 box-border overflow-hidden">
      
      {/* Sidebar List */}
      <div className={`w-full lg:w-80 flex-col bg-brand-900/80 backdrop-blur-md lg:rounded-2xl border-r lg:border border-brand-800 shadow-xl overflow-hidden lg:mt-6 mb-0 h-full ${showMobileChat ? 'hidden lg:flex' : 'flex'}`}>
        <div className="p-5 border-b border-brand-800 bg-brand-900">
          <h2 className="text-brand-100 font-bold mb-4 flex items-center gap-2">
            <MessageCircle size={20} className="text-brand-500" /> Messages
          </h2>
          <div className="relative">
            <Search className="absolute left-3 top-2.5 text-brand-500 h-4 w-4" />
            <Input 
              placeholder="Search..." 
              className="pl-9 bg-brand-950/50 border-brand-800" 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto custom-scrollbar pb-20 lg:pb-0">
          {filteredUsers.map(user => (
            <div 
              key={user.id}
              onClick={() => handleUserSelect(user.id)}
              className={`p-4 flex items-center gap-3 cursor-pointer transition-all border-b border-brand-800/50 last:border-0 ${selectedUserId === user.id ? 'bg-brand-800/60 border-l-4 border-l-brand-400 pl-[13px]' : 'hover:bg-brand-800/30'}`}
            >
              <div className="relative">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-brand-100 font-bold text-sm border border-brand-700 ${selectedUserId === user.id ? 'bg-brand-600' : 'bg-brand-950'}`}>
                  {user.profileImage ? (
                    <img src={user.profileImage} alt={user.initials} className="w-full h-full object-cover rounded-full" />
                  ) : (
                    user.initials
                  )}
                </div>
                {user.isOnline && (
                  <span className="absolute bottom-0 right-0 w-3 h-3 bg-brand-400 border-2 border-brand-900 rounded-full"></span>
                )}
              </div>
              <div className="overflow-hidden">
                <h3 className={`text-sm font-semibold truncate ${selectedUserId === user.id ? 'text-white' : 'text-brand-200'}`}>{user.name}</h3>
                <p className="text-xs text-brand-500 font-mono opacity-80">{user.role}</p>
              </div>
            </div>
          ))}
          {filteredUsers.length === 0 && (
             <div className="p-4 text-center text-xs text-brand-600 mt-4">No users found.</div>
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className={`flex-1 flex-col bg-brand-900/40 backdrop-blur-md lg:rounded-2xl lg:border border-brand-800 shadow-xl lg:mt-6 mb-0 overflow-hidden relative h-full w-full ${showMobileChat ? 'flex' : 'hidden lg:flex'}`}>
        {selectedUser ? (
          <>
            {/* Header */}
            <div className="p-3 lg:p-4 border-b border-brand-800 bg-brand-900/90 flex items-center gap-3 shadow-sm z-10 shrink-0">
               <button onClick={handleBackToList} className="lg:hidden text-brand-400 hover:text-white mr-1 p-1">
                 <ArrowLeft size={24} />
               </button>
               <div className="w-10 h-10 rounded-full bg-brand-700 flex items-center justify-center text-brand-100 font-bold border border-brand-600 shrink-0 overflow-hidden">
                  {selectedUser.profileImage ? (
                    <img src={selectedUser.profileImage} alt={selectedUser.initials} className="w-full h-full object-cover" />
                  ) : (
                    selectedUser.initials
                  )}
               </div>
               <div className="min-w-0">
                 <h2 className="text-brand-50 font-bold truncate">{selectedUser.name}</h2>
                 <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-brand-400 shrink-0"></span>
                    <p className="text-xs text-brand-400 truncate">{selectedUser.department} • {selectedUser.role}</p>
                 </div>
               </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 lg:p-6 space-y-3 bg-brand-950/20 custom-scrollbar">
              {currentChatMessages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-brand-600">
                  <div className="w-16 h-16 rounded-full bg-brand-800/30 flex items-center justify-center mb-4">
                    <User size={32} className="opacity-50"/>
                  </div>
                  <p className="text-sm">Start a conversation with <span className="text-brand-400 font-semibold">{selectedUser.name}</span></p>
                </div>
              ) : (
                currentChatMessages.map(msg => {
                  const isMe = msg.senderId === currentUser.id;
                  return (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      key={msg.id} 
                      className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`max-w-[85%] lg:max-w-[75%] rounded-2xl px-4 py-2.5 text-sm shadow-md ${
                        isMe 
                          ? 'bg-brand-600 text-white rounded-br-sm' 
                          : 'bg-brand-800 text-brand-100 rounded-bl-sm border border-brand-700'
                      }`}>
                        {msg.content}
                        <div className={`text-[10px] mt-1 text-right font-medium opacity-70 ${isMe ? 'text-brand-100' : 'text-brand-400'}`}>
                          {new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </div>
                      </div>
                    </motion.div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <form onSubmit={handleSend} className="p-3 lg:p-4 border-t border-brand-800 bg-brand-900/90 flex gap-3 shrink-0 pb-safe">
              <input 
                className="flex-1 bg-brand-950/50 border border-brand-700 rounded-xl px-4 py-3 text-brand-100 focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500 outline-none transition-all placeholder:text-brand-700"
                placeholder="Type a message..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
              />
              <button 
                type="submit"
                disabled={!inputText.trim()}
                className="p-3 bg-brand-500 hover:bg-brand-400 disabled:bg-brand-800 disabled:text-brand-600 rounded-xl text-brand-950 transition-all shadow-lg shadow-brand-500/20 flex items-center justify-center"
              >
                <Send size={20} />
              </button>
            </form>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-brand-500/50 p-6 text-center">
            <MessageCircle size={64} className="mb-4 opacity-20" />
            <p className="text-brand-500/70 text-lg font-medium mb-2">No Chat Selected</p>
            <p className="text-sm text-brand-600 max-w-xs">Select a contact from the list on the left to start messaging.</p>
          </div>
        )}
      </div>
    </div>
  );
};