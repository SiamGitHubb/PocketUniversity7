import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User, Course, Message, Notification, UserRole, Resource, ClassSession } from '../types';
import { DB } from '../services/db';

interface ToastMessage {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

interface StoreContextType {
  currentUser: User | null;
  users: User[];
  courses: Course[];
  messages: Message[];
  notifications: Notification[];
  sessions: ClassSession[];
  isLoading: boolean;
  toasts: ToastMessage[];
  showToast: (message: string, type: 'success' | 'error' | 'info') => void;
  dismissToast: (id: string) => void;
  login: (idOrEmail: string, pass: string) => Promise<boolean>;
  signup: (data: Partial<User>) => Promise<boolean>;
  logout: () => void;
  createCourse: (data: Partial<Course>) => Promise<void>;
  addResource: (courseId: string, file: File) => Promise<void>;
  sendMessage: (receiverId: string, content: string) => Promise<void>;
  markNotificationRead: (id: string) => Promise<void>;
  clearAllNotifications: () => Promise<void>;
  getUsersByRole: (role: UserRole) => User[];
  assignCR: (courseId: string, crId: string) => Promise<void>;
  publishCourse: (courseId: string) => Promise<void>;
  updateUser: (data: Partial<User>) => Promise<void>;
  scheduleSession: (data: Partial<ClassSession>) => Promise<void>;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem('pocket_current_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [users, setUsers] = useState<User[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [sessions, setSessions] = useState<ClassSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info') => {
    const id = Math.random().toString(36).substring(7);
    setToasts(prev => [...prev, { id, message, type }]);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  // Initial Data Fetch
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        // Fallback for initial load if DB fails
        const [fetchedUsers, fetchedCourses, fetchedSessions, fetchedMsgs, fetchedNotifs] = await Promise.all([
          DB.users.getAll().catch(e => { console.error(e); return []; }),
          DB.courses.getAll().catch(e => { console.error(e); return []; }),
          DB.sessions.getAll().catch(e => { console.error(e); return []; }),
          DB.messages.getAll().catch(e => { console.error(e); return []; }),
          DB.notifications.getAll().catch(e => { console.error(e); return []; })
        ]);
        
        setUsers(fetchedUsers);
        setCourses(fetchedCourses);
        setSessions(fetchedSessions);
        setMessages(fetchedMsgs);
        setNotifications(fetchedNotifs);
      } catch (error) {
        console.error("Failed to load data from database:", error);
        showToast("Connection failed. Running in offline mode.", "error");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [showToast]);

  // Sync Current User persistence
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('pocket_current_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('pocket_current_user');
    }
  }, [currentUser]);

  const addNotification = async (userId: string, title: string, message: string) => {
    const newNotif: Notification = {
      id: `N${Date.now()}${Math.random()}`,
      userId,
      title,
      message,
      read: false,
      timestamp: new Date().toISOString(),
      type: 'INFO'
    };
    
    setNotifications(prev => [newNotif, ...prev]);
    await DB.notifications.create(newNotif).catch(e => console.error("Failed to save notif", e));
  };

  const login = async (idOrEmail: string, pass: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      // Refresh users from DB to ensure we have latest data
      const latestUsers = await DB.users.getAll();
      setUsers(latestUsers);

      const user = latestUsers.find(u => 
        (u.id.toLowerCase() === idOrEmail.toLowerCase() || u.email.toLowerCase() === idOrEmail.toLowerCase()) && 
        u.password === pass
      );

      if (user) {
        setCurrentUser(user);
        showToast(`Welcome back, ${user.name}!`, "success");
        return true;
      }
      showToast("Invalid credentials", "error");
      return false;
    } catch (e) {
      showToast("Login error. Check connection.", "error");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (data: Partial<User>): Promise<boolean> => {
    let prefix = '';
    if (data.role === UserRole.TEACHER) prefix = 'T';
    if (data.role === UserRole.CR) prefix = 'CR';
    if (data.role === UserRole.STUDENT) prefix = 'ST';

    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const newId = `${prefix}${randomNum}`;

    const newUser: User = {
      ...data as User,
      id: newId,
      initials: data.name ? data.name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2) : 'XX',
      isOnline: true,
      password: data.password || '123',
      profileImage: undefined,
      phone: '',
      bio: `Hi, I am a ${data.role} at Pocket University.`
    };

    try {
      const createdUser = await DB.users.create(newUser);
      setUsers(prev => [...prev, createdUser]);
      setCurrentUser(createdUser);
      showToast("Account created successfully!", "success");
      return true;
    } catch (e) {
      console.error("Signup error", e);
      showToast("Failed to create account.", "error");
      return false;
    }
  };

  const logout = () => {
    setCurrentUser(null);
    showToast("Signed out successfully", "info");
  };

  const updateUser = async (data: Partial<User>) => {
    if (!currentUser) return;
    
    const updatedUser = { ...currentUser, ...data };
    if (data.name) {
      updatedUser.initials = data.name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
    }

    try {
      setCurrentUser(updatedUser); 
      setUsers(prev => prev.map(u => u.id === currentUser.id ? updatedUser : u)); 
      await DB.users.update(updatedUser);
      await addNotification(currentUser.id, 'Profile Updated', 'Your profile details have been successfully updated.');
      showToast("Profile updated", "success");
    } catch (e) {
      console.error("Update failed", e);
      showToast("Failed to update profile", "error");
    }
  };

  const createCourse = async (data: Partial<Course>) => {
    if (!currentUser) return;
    const newCourse: Course = {
      id: `C${Date.now()}`,
      code: data.code || 'UNK',
      title: data.title || 'Untitled Course',
      department: data.department || currentUser.department || 'Gen',
      semester: data.semester || '1',
      section: data.section || 'A',
      teacherId: currentUser.id,
      studentIds: [],
      resources: [],
      isPublishedToStudents: false,
      ...data
    };
    
    try {
      setCourses(prev => [...prev, newCourse]);
      await DB.courses.create(newCourse);
      showToast("Course created", "success");
    } catch (e) {
      showToast("Failed to create course", "error");
    }
  };

  const assignCR = async (courseId: string, crId: string) => {
    try {
      const course = courses.find(c => c.id === courseId);
      if (!course) return;

      const updatedCourse = { ...course, crId };
      setCourses(prev => prev.map(c => c.id === courseId ? updatedCourse : c));
      
      await DB.courses.update(updatedCourse);
      await addNotification(crId, 'Role Assigned', `You have been assigned as CR for course ${course.code}`);
      showToast(`CR assigned to ${course.code}`, "success");
    } catch (e) {
      showToast("Failed to assign CR", "error");
    }
  };

  const publishCourse = async (courseId: string) => {
    try {
      let targetSection: string | undefined = undefined;
      if (currentUser?.role === UserRole.CR && currentUser.section) {
        targetSection = currentUser.section;
      }

      const course = courses.find(c => c.id === courseId);
      if (!course) return;

      const updatedCourse = { 
        ...course, 
        isPublishedToStudents: true,
        section: targetSection || course.section 
      };

      setCourses(prev => prev.map(c => c.id === courseId ? updatedCourse : c));
      await DB.courses.update(updatedCourse);
      
      const effectiveSection = targetSection || course.section;
      const students = users.filter(u => 
        u.role === UserRole.STUDENT &&
        u.department === course.department &&
        u.semester === course.semester &&
        u.section === effectiveSection
      );
      
      await Promise.all(students.map(s => 
        addNotification(s.id, 'Course Available', `${course.code} is now available on your dashboard.`)
      ));
      showToast("Course published to students", "success");
    } catch (e) {
      showToast("Failed to publish course", "error");
    }
  };

  const addResource = async (courseId: string, file: File) => {
    if (!currentUser) return;
    
    const resource: Resource = {
      id: `R${Date.now()}`,
      title: file.name,
      type: file.name.endsWith('pdf') ? 'PDF' : file.name.endsWith('ppt') || file.name.endsWith('pptx') ? 'PPT' : 'DOC',
      size: `${(file.size / 1024 / 1024).toFixed(2)} MB`,
      uploadedBy: currentUser.id,
      uploadDate: new Date().toISOString(),
    };

    try {
      const course = courses.find(c => c.id === courseId);
      if (!course) return;

      const updatedCourse = { ...course, resources: [...course.resources, resource] };
      setCourses(prev => prev.map(c => c.id === courseId ? updatedCourse : c));
      
      await DB.courses.update(updatedCourse);

      if (course.crId && course.crId !== currentUser.id) {
         await addNotification(course.crId, 'New Resource', `New file in ${course.code}`);
      }

      if (course.isPublishedToStudents) {
         const students = users.filter(u => 
          u.role === UserRole.STUDENT &&
          u.department === course.department &&
          u.semester === course.semester &&
          u.section === course.section
        );
        await Promise.all(students.map(s => 
          addNotification(s.id, 'New Resource', `${resource.title} uploaded in ${course.code}`)
        ));
      }
      showToast("Resource uploaded", "success");
    } catch (e) {
      showToast("Failed to upload resource", "error");
    }
  };

  const scheduleSession = async (data: Partial<ClassSession>) => {
    if (!currentUser || !data.courseId) return;
    
    try {
      const newSession: ClassSession = {
          id: `S${Date.now()}`,
          courseId: data.courseId,
          teacherId: currentUser.id,
          startTime: data.startTime || new Date().toISOString(),
          duration: data.duration || 60,
          topic: data.topic || 'Class Session',
          room: data.room || 'Online'
      };
      
      setSessions(prev => [...prev, newSession].sort((a,b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime()));
      await DB.sessions.create(newSession);

      const course = courses.find(c => c.id === data.courseId);
      if (course && course.isPublishedToStudents) {
           const students = users.filter(u => 
            u.role === UserRole.STUDENT &&
            u.department === course.department &&
            u.semester === course.semester &&
            u.section === course.section
          );
          await Promise.all(students.map(s => 
            addNotification(s.id, 'New Class Scheduled', `${course.code}: ${newSession.topic} at ${new Date(newSession.startTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}`)
          ));
      }
      showToast("Class session scheduled", "success");
    } catch (e) {
      showToast("Failed to schedule class", "error");
    }
  };

  const sendMessage = async (receiverId: string, content: string) => {
    if (!currentUser) return;
    const msg: Message = {
      id: `M${Date.now()}`,
      senderId: currentUser.id,
      receiverId,
      content,
      timestamp: new Date().toISOString(),
      read: false
    };
    try {
      setMessages(prev => [...prev, msg]);
      await DB.messages.create(msg);
    } catch (e) {
      showToast("Failed to send message", "error");
    }
  };

  const markNotificationRead = async (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    await DB.notifications.markRead(id);
  };

  const clearAllNotifications = async () => {
    if (!currentUser) return;
    setNotifications(prev => prev.map(n => n.userId === currentUser.id ? { ...n, read: true } : n));
    await DB.notifications.markAllRead(currentUser.id);
  };

  const getUsersByRole = useCallback((role: UserRole) => {
    return users.filter(u => u.role === role);
  }, [users]);

  return (
    <StoreContext.Provider value={{
      currentUser, users, courses, messages, notifications, sessions, isLoading, toasts,
      showToast, dismissToast, login, signup, logout, createCourse, addResource, sendMessage,
      markNotificationRead, clearAllNotifications, getUsersByRole, assignCR, publishCourse, updateUser, scheduleSession
    }}>
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) throw new Error("useStore must be used within StoreProvider");
  return context;
};