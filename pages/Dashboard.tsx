import React, { useState } from 'react';
import { useStore } from '../context/Store';
import { Card, Button, Modal, Input, Badge } from '../components/UI';
import { UserRole } from '../types';
import { motion } from 'framer-motion';
import { 
  BookOpen, 
  FileText, 
  Clock, 
  AlertCircle,
  TrendingUp,
  Calendar,
  MapPin,
  ChevronRight
} from 'lucide-react';

export const Dashboard: React.FC = () => {
  const { currentUser, courses, notifications, sessions, scheduleSession } = useStore();
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  
  // Schedule Form State
  const [scheduleData, setScheduleData] = useState({
    courseId: '',
    date: '',
    time: '',
    topic: '',
    room: ''
  });

  if (!currentUser) return null;

  // Calculate Stats based on Strict Visibility Rules
  const myCourses = courses.filter(c => {
    if (currentUser.role === UserRole.TEACHER) {
      return c.teacherId === currentUser.id;
    }
    if (currentUser.role === UserRole.CR) {
      return c.crId === currentUser.id; // Strictly only if assigned as CR
    }
    if (currentUser.role === UserRole.STUDENT) {
      // Must be published AND match the student's demographics
      return c.isPublishedToStudents && 
             c.department === currentUser.department &&
             c.semester === currentUser.semester &&
             c.section === currentUser.section;
    }
    return false;
  });

  const totalResources = myCourses.reduce((acc, c) => acc + c.resources.length, 0);
  const recentNotifications = notifications.filter(n => n.userId === currentUser.id).slice(0, 3);

  // Filter Upcoming Sessions
  const mySessions = sessions.filter(s => {
    // Show sessions related to "My Courses"
    return myCourses.some(c => c.id === s.courseId);
  }).filter(s => new Date(s.startTime) > new Date(Date.now() - 2 * 60 * 60 * 1000)); // Show sessions from 2 hours ago onwards
  
  // Sort by nearest date
  mySessions.sort((a,b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
  const upcomingSessions = mySessions.slice(0, 3);

  const handleScheduleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!scheduleData.courseId || !scheduleData.date || !scheduleData.time) return;

    const startTime = new Date(`${scheduleData.date}T${scheduleData.time}`).toISOString();
    scheduleSession({
      courseId: scheduleData.courseId,
      startTime,
      topic: scheduleData.topic || 'Lecture Session',
      room: scheduleData.room || 'TBD',
      duration: 90 // Default 1.5h
    });
    
    setIsScheduleModalOpen(false);
    setScheduleData({ courseId: '', date: '', time: '', topic: '', room: '' });
  };

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <div className="p-4 md:p-8 space-y-6 md:space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-end border-b border-brand-800 pb-6 gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-brand-50 mb-1 tracking-tight">Dashboard</h1>
          <p className="text-brand-400 text-sm md:text-base font-medium">Welcome back, {currentUser.name.split(' ')[0]}</p>
        </div>
        <div className="text-left sm:text-right">
           <p className="text-sm text-brand-300 font-medium">{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
           <p className="text-xs text-brand-600 uppercase tracking-widest mt-1">Academic Session 2024</p>
        </div>
      </div>

      <div className="space-y-6">
          
          {/* Stats Grid */}
          <motion.div 
            variants={container}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6"
          >
            <motion.div variants={item}>
              <div className="rounded-xl p-1 bg-gradient-to-br from-brand-500 to-brand-800 shadow-lg h-full">
                <div className="bg-brand-900 rounded-lg p-5 h-full relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                      <BookOpen size={64} className="text-brand-500"/>
                    </div>
                    <div className="relative z-10">
                      <div className="w-10 h-10 rounded-full bg-brand-950 flex items-center justify-center mb-4 text-brand-400">
                          <BookOpen size={20} />
                      </div>
                      <h3 className="text-2xl font-bold text-white mb-1">{myCourses.length}</h3>
                      <p className="text-sm text-brand-400 font-medium">Active Courses</p>
                    </div>
                </div>
              </div>
            </motion.div>

            <motion.div variants={item}>
              <div className="rounded-xl p-1 bg-gradient-to-br from-brand-400 to-brand-600 shadow-lg h-full">
                <div className="bg-brand-900 rounded-lg p-5 h-full relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                      <FileText size={64} className="text-brand-300"/>
                    </div>
                    <div className="relative z-10">
                      <div className="w-10 h-10 rounded-full bg-brand-950 flex items-center justify-center mb-4 text-brand-300">
                          <FileText size={20} />
                      </div>
                      <h3 className="text-2xl font-bold text-white mb-1">{totalResources}</h3>
                      <p className="text-sm text-brand-400 font-medium">Learning Resources</p>
                    </div>
                </div>
              </div>
            </motion.div>

            <motion.div variants={item}>
              <div className="rounded-xl p-1 bg-gradient-to-br from-brand-300 to-brand-500 shadow-lg h-full">
                <div className="bg-brand-900 rounded-lg p-5 h-full relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                      <TrendingUp size={64} className="text-brand-200"/>
                    </div>
                    <div className="relative z-10">
                      <div className="w-10 h-10 rounded-full bg-brand-950 flex items-center justify-center mb-4 text-brand-200">
                          <TrendingUp size={20} />
                      </div>
                      <h3 className="text-2xl font-bold text-white mb-1">98%</h3>
                      <p className="text-sm text-brand-400 font-medium">Engagement Rate</p>
                    </div>
                </div>
              </div>
            </motion.div>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Recent Notifications */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-brand-100 flex items-center gap-2">
                  <AlertCircle size={20} className="text-brand-500"/> Activity Feed
                </h2>
                <Button variant="ghost" className="text-xs h-8">View All</Button>
              </div>
              <div className="space-y-3">
                {recentNotifications.length > 0 ? recentNotifications.map(n => (
                  <Card key={n.id} className="p-4 flex gap-4 items-start bg-brand-800/20 border border-brand-800 hover:bg-brand-800/40">
                    <div className="w-2 h-2 rounded-full bg-brand-500 mt-2 shrink-0 shadow-[0_0_8px_rgba(121,215,190,0.6)]" />
                    <div>
                      <h4 className="text-sm font-semibold text-brand-100">{n.title}</h4>
                      <p className="text-xs text-brand-400 mt-1">{n.message}</p>
                      <p className="text-[10px] text-brand-600 mt-2 font-mono">{new Date(n.timestamp).toLocaleTimeString()} • {new Date(n.timestamp).toLocaleDateString()}</p>
                    </div>
                  </Card>
                )) : (
                  <div className="p-6 rounded-xl border border-dashed border-brand-800 text-center">
                    <p className="text-brand-600 text-sm">No recent activity to report.</p>
                  </div>
                )}
              </div>
            </div>

            {/* Schedule */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-brand-100 flex items-center gap-2">
                  <Clock size={20} className="text-brand-400"/> Upcoming Schedule
                </h2>
              </div>
              <Card className="min-h-[200px] md:min-h-[250px] flex flex-col border border-brand-800 bg-brand-900/30 p-0 overflow-hidden relative">
                {upcomingSessions.length === 0 ? (
                  <div className="flex-1 flex flex-col items-center justify-center p-6">
                    <div className="bg-brand-950/50 p-4 rounded-full mb-3">
                        <Calendar size={24} className="text-brand-600"/>
                    </div>
                    <p className="text-brand-400 font-medium mb-1">No classes scheduled.</p>
                    <p className="text-xs text-brand-600 mb-4">Enjoy your free time!</p>
                  </div>
                ) : (
                  <div className="flex-1 p-4 space-y-3 overflow-y-auto">
                    {upcomingSessions.map(session => {
                      const course = myCourses.find(c => c.id === session.courseId);
                      return (
                        <div key={session.id} className="flex items-center bg-brand-950/50 p-3 rounded-lg border border-brand-800/50">
                          <div className="flex-col items-center justify-center px-3 border-r border-brand-800/50 text-center min-w-[60px]">
                            <span className="block text-xs text-brand-500 font-bold uppercase">{new Date(session.startTime).toLocaleDateString('en-US', {month: 'short'})}</span>
                            <span className="block text-xl text-brand-100 font-bold">{new Date(session.startTime).getDate()}</span>
                          </div>
                          <div className="pl-4 flex-1">
                            <div className="flex justify-between items-start">
                              <h4 className="text-sm font-bold text-brand-100">{course?.code}</h4>
                              <span className="text-[10px] bg-brand-800/50 text-brand-300 px-2 py-0.5 rounded">{new Date(session.startTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                            </div>
                            <p className="text-xs text-brand-300 font-medium mt-0.5">{session.topic}</p>
                            <div className="flex items-center gap-2 mt-1.5">
                              <Badge color="blue" className="py-0 px-1.5 text-[9px] flex items-center gap-1">
                                <MapPin size={10} /> {session.room}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
                
                {currentUser.role === UserRole.TEACHER && (
                  <div className="p-4 border-t border-brand-800 bg-brand-900/80 backdrop-blur-sm">
                    <Button variant="secondary" onClick={() => setIsScheduleModalOpen(true)} className="w-full text-xs h-9">
                        <Calendar className="mr-2 h-3 w-3" /> Schedule Class
                    </Button>
                  </div>
                )}
              </Card>
            </div>
          </div>
      </div>

      {/* Schedule Modal */}
      <Modal isOpen={isScheduleModalOpen} onClose={() => setIsScheduleModalOpen(false)} title="Schedule New Class">
         <form onSubmit={handleScheduleSubmit} className="space-y-4">
            <div className="space-y-1.5">
               <label className="block text-xs font-semibold text-brand-300 ml-1">Course</label>
               <select 
                  className="w-full bg-brand-950/50 border border-brand-700/50 text-brand-50 rounded-lg px-4 py-2.5 text-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none transition-all"
                  value={scheduleData.courseId}
                  onChange={e => setScheduleData({...scheduleData, courseId: e.target.value})}
                  required
               >
                 <option value="" disabled>Select a Course</option>
                 {myCourses.map(c => (
                   <option key={c.id} value={c.id}>{c.code} - {c.title}</option>
                 ))}
               </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Input 
                label="Date" 
                type="date" 
                value={scheduleData.date}
                onChange={e => setScheduleData({...scheduleData, date: e.target.value})}
                required
              />
              <Input 
                label="Time" 
                type="time" 
                value={scheduleData.time}
                onChange={e => setScheduleData({...scheduleData, time: e.target.value})}
                required
              />
            </div>
            
            <Input 
              label="Topic" 
              value={scheduleData.topic}
              onChange={e => setScheduleData({...scheduleData, topic: e.target.value})}
            />

            <Input 
              label="Room / Location" 
              value={scheduleData.room}
              onChange={e => setScheduleData({...scheduleData, room: e.target.value})}
            />

            <div className="flex justify-end pt-4">
               <Button type="submit">Schedule Class</Button>
            </div>
         </form>
      </Modal>
    </div>
  );
};