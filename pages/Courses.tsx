import React, { useState } from 'react';
import { useStore } from '../context/Store';
import { Card, Button, Input, Modal, Badge } from '../components/UI';
import { UserRole } from '../types';
import { Plus, Upload, UserPlus, File, Download, Folder, Share2, Search } from 'lucide-react';
import { motion } from 'framer-motion';

export const Courses: React.FC = () => {
  const { currentUser, courses, users, createCourse, addResource, assignCR, publishCourse } = useStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeCourseId, setActiveCourseId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  // New Course Form
  const [code, setCode] = useState('');
  const [title, setTitle] = useState('');
  const [sem, setSem] = useState('');

  // CR Assignment Form
  const [crId, setCrId] = useState('');

  if (!currentUser) return null;

  // Strict Visibility Rules with Search Filtering
  const myCourses = courses.filter(c => {
    // 1. Role-based filtering
    let isVisible = false;
    if (currentUser.role === UserRole.TEACHER) {
      isVisible = c.teacherId === currentUser.id;
    } else if (currentUser.role === UserRole.CR) {
      isVisible = c.crId === currentUser.id; // Only see if assigned as CR
    } else if (currentUser.role === UserRole.STUDENT) {
      // Only see if published AND matches demographics
      isVisible = c.isPublishedToStudents && 
             c.department === currentUser.department &&
             c.semester === currentUser.semester &&
             c.section === currentUser.section;
    }

    // 2. Search filtering
    if (isVisible && searchQuery) {
      const query = searchQuery.toLowerCase();
      return c.code.toLowerCase().includes(query) || c.title.toLowerCase().includes(query);
    }

    return isVisible;
  });

  const handleCreateCourse = (e: React.FormEvent) => {
    e.preventDefault();
    createCourse({ code, title, semester: sem });
    setIsModalOpen(false);
    setCode(''); setTitle(''); setSem('');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, courseId: string) => {
    if (e.target.files && e.target.files[0]) {
      addResource(courseId, e.target.files[0]);
    }
  };

  const handleAssignCR = (e: React.FormEvent) => {
    e.preventDefault();
    if (activeCourseId && crId) {
      assignCR(activeCourseId, crId);
      setActiveCourseId(null);
      setCrId('');
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-brand-50">Courses & Resources</h1>
          <p className="text-brand-400 text-sm mt-1">Manage curriculum and study materials.</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
            {/* Search Bar */}
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-2.5 text-brand-500 h-4 w-4" />
              <input 
                type="text" 
                placeholder="Search by code..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-brand-900/50 border border-brand-700/50 text-brand-50 rounded-lg pl-9 pr-4 py-2 text-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none transition-all placeholder:text-brand-700/70 hover:border-brand-600"
              />
            </div>

            {currentUser.role === UserRole.TEACHER && (
              <Button onClick={() => setIsModalOpen(true)} className="whitespace-nowrap w-full sm:w-auto">
                <Plus className="w-4 h-4 mr-2" /> New Course
              </Button>
            )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {myCourses.length === 0 && (
          <div className="text-center py-12 bg-brand-900/30 rounded-xl border border-brand-800 border-dashed">
            <p className="text-brand-400">
               {searchQuery ? "No courses found matching your search." : "No courses available yet."}
            </p>
            {!searchQuery && (
              <p className="text-xs text-brand-600 mt-2">
                {currentUser.role === UserRole.STUDENT ? "Courses will appear when shared by your CR." : 
                 currentUser.role === UserRole.CR ? "Courses will appear when assigned by a Teacher." : "Create a course to get started."}
              </p>
            )}
          </div>
        )}
        {myCourses.map((course, idx) => (
          <Card key={course.id} className="flex flex-col lg:flex-row gap-6 bg-brand-900/40 border border-brand-800">
            {/* Course Info */}
            <div className="flex-1 lg:max-w-xs">
              <div className="flex items-center gap-2 mb-3 flex-wrap">
                <Badge color="brand">{course.department}</Badge>
                {course.section && <Badge color="blue">Sec {course.section}</Badge>}
                {course.isPublishedToStudents ? <Badge color="green">Published</Badge> : <Badge color="orange">Draft</Badge>}
              </div>
              <h3 className="text-2xl md:text-3xl font-bold text-brand-100 tracking-tight mb-1">{course.code}</h3>
              <h4 className="text-base md:text-lg text-brand-400 font-medium mb-6">{course.title}</h4>
              
              <div className="p-4 bg-brand-950/30 rounded-lg border border-brand-800/50 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-brand-600">Teacher ID</span>
                  <span className="text-brand-300 font-mono">{course.teacherId}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-brand-600">CR Assigned</span>
                  <span className="text-brand-300 font-mono">{course.crId || '---'}</span>
                </div>
              </div>

              {currentUser.role === UserRole.TEACHER && (
                <div className="mt-4">
                   <Button variant="secondary" onClick={() => setActiveCourseId(course.id)} className="w-full text-xs h-9">
                     <UserPlus className="w-3 h-3 mr-2" /> Assign Class Rep
                   </Button>
                </div>
              )}

              {currentUser.role === UserRole.CR && !course.isPublishedToStudents && (
                <div className="mt-4">
                  <Button onClick={() => publishCourse(course.id)} className="w-full text-xs h-9 bg-brand-500 hover:bg-brand-400 text-brand-950">
                    <Share2 className="w-3 h-3 mr-2" /> Share with Section
                  </Button>
                  <p className="text-[10px] text-brand-500 mt-2 text-center">
                    Students cannot see this course until you share it.
                  </p>
                </div>
              )}
            </div>

            {/* Resources Section */}
            <div className="flex-1 bg-brand-950/50 rounded-xl p-4 md:p-5 border border-brand-800/50 flex flex-col">
              <div className="flex justify-between items-center mb-4">
                <h5 className="text-sm font-bold text-brand-200 flex items-center gap-2">
                  <Folder size={16} className="text-brand-500" />
                  Course Materials
                  <span className="text-brand-600 text-xs font-normal">({course.resources.length})</span>
                </h5>
                {(currentUser.role === UserRole.TEACHER || currentUser.role === UserRole.CR) && (
                  <label className="cursor-pointer bg-brand-600/20 hover:bg-brand-500/20 text-brand-300 text-xs px-3 py-1.5 rounded-md flex items-center transition-colors border border-brand-600/30 hover:border-brand-500/50">
                    <Upload className="w-3 h-3 mr-1.5" /> 
                    <span className="hidden sm:inline">Upload File</span>
                    <span className="sm:hidden">Upload</span>
                    <input type="file" className="hidden" onChange={(e) => handleFileUpload(e, course.id)} />
                  </label>
                )}
              </div>
              
              <div className="flex-1 space-y-2 overflow-y-auto max-h-[250px] pr-2 custom-scrollbar">
                {course.resources.length === 0 ? (
                  <div className="h-32 flex flex-col items-center justify-center text-brand-700 border-2 border-dashed border-brand-800/50 rounded-lg">
                    <p className="text-xs">No resources uploaded yet.</p>
                  </div>
                ) : (
                  course.resources.map(res => (
                    <motion.div 
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      key={res.id} 
                      className="flex items-center justify-between p-3 rounded-lg bg-brand-900 border border-brand-800/50 hover:border-brand-600 transition-colors group"
                    >
                      <div className="flex items-center gap-3 overflow-hidden">
                        <div className={`p-2 rounded-lg ${res.type === 'PDF' ? 'bg-red-500/10 text-red-400' : 'bg-brand-500/10 text-brand-400'}`}>
                          <File size={16} />
                        </div>
                        <div className="truncate min-w-0">
                          <p className="text-sm font-medium text-brand-200 truncate group-hover:text-brand-100 transition-colors">{res.title}</p>
                          <p className="text-[10px] text-brand-600 mt-0.5">{res.size} • {new Date(res.uploadDate).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <button className="p-2 text-brand-500 hover:text-brand-300 hover:bg-brand-800 rounded-md opacity-0 group-hover:opacity-100 transition-all shrink-0">
                        <Download size={16} />
                      </button>
                    </motion.div>
                  ))
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Create Course Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create New Course">
        <form onSubmit={handleCreateCourse} className="space-y-5">
          <Input label="Course Code" value={code} onChange={e => setCode(e.target.value)} required />
          <Input label="Course Title" value={title} onChange={e => setTitle(e.target.value)} required />
          <Input label="Semester" value={sem} onChange={e => setSem(e.target.value)} required />
          <div className="flex justify-end pt-4">
            <Button type="submit" className="w-full sm:w-auto">Create Course</Button>
          </div>
        </form>
      </Modal>

      {/* Assign CR Modal */}
      <Modal isOpen={!!activeCourseId} onClose={() => setActiveCourseId(null)} title="Assign Class Rep">
        <form onSubmit={handleAssignCR} className="space-y-5">
          <div className="p-3 bg-brand-800/30 rounded-lg border border-brand-700/50">
             <p className="text-sm text-brand-300">Enter the Unique ID of the Student you wish to promote to CR.</p>
          </div>
          <Input label="Student Unique ID" value={crId} onChange={e => setCrId(e.target.value)} required />
          <div className="flex justify-end pt-4">
            <Button type="submit" className="w-full sm:w-auto">Confirm Assignment</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};