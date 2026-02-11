import { mongoFetch, isMongoConfigured } from '../lib/mongodb';
import { User, Course, ClassSession, Message, Notification, Resource } from '../types';

// Helper to simulate async network delay for local operations
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Generic Local Storage Helper
const localDB = {
  get: <T>(key: string): T[] => {
    try {
      return JSON.parse(localStorage.getItem(`pocket_${key}`) || '[]');
    } catch {
      return [];
    }
  },
  set: <T>(key: string, data: T[]) => {
    localStorage.setItem(`pocket_${key}`, JSON.stringify(data));
  }
};

export const DB = {
  users: {
    getAll: async (): Promise<User[]> => {
      if (isMongoConfigured) {
        // MongoDB returns { documents: [] }
        const res = await mongoFetch<{ documents: User[] }>('find', 'users', { filter: {} });
        return res.documents || [];
      }
      return localDB.get<User>('users');
    },
    create: async (user: User): Promise<User> => {
      if (isMongoConfigured) {
        await mongoFetch('insertOne', 'users', { document: user });
        return user;
      }
      await delay(300);
      const users = localDB.get<User>('users');
      users.push(user);
      localDB.set('users', users);
      return user;
    },
    update: async (user: User): Promise<User> => {
      if (isMongoConfigured) {
        // Strip _id from user object because MongoDB does not allow updating the immutable _id field
        const { _id, ...userWithoutId } = user as any;
        
        await mongoFetch('updateOne', 'users', { 
          filter: { id: user.id },
          update: { $set: userWithoutId } 
        });
        return user;
      }
      await delay(200);
      const users = localDB.get<User>('users');
      const idx = users.findIndex(u => u.id === user.id);
      if (idx !== -1) {
        users[idx] = user;
        localDB.set('users', users);
      }
      return user;
    }
  },

  courses: {
    getAll: async (): Promise<Course[]> => {
      if (isMongoConfigured) {
        const res = await mongoFetch<{ documents: Course[] }>('find', 'courses', { filter: {} });
        return res.documents || [];
      }
      return localDB.get<Course>('courses');
    },
    create: async (course: Course): Promise<Course> => {
      if (isMongoConfigured) {
        await mongoFetch('insertOne', 'courses', { document: course });
        return course;
      }
      await delay(300);
      const courses = localDB.get<Course>('courses');
      courses.push(course);
      localDB.set('courses', courses);
      return course;
    },
    update: async (course: Course): Promise<Course> => {
      if (isMongoConfigured) {
        const { _id, ...courseWithoutId } = course as any;
        await mongoFetch('updateOne', 'courses', { 
          filter: { id: course.id },
          update: { $set: courseWithoutId } 
        });
        return course;
      }
      const courses = localDB.get<Course>('courses');
      const idx = courses.findIndex(c => c.id === course.id);
      if (idx !== -1) {
        courses[idx] = course;
        localDB.set('courses', courses);
      }
      return course;
    }
  },

  sessions: {
    getAll: async (): Promise<ClassSession[]> => {
      if (isMongoConfigured) {
        const res = await mongoFetch<{ documents: ClassSession[] }>('find', 'sessions', { filter: {} });
        return res.documents || [];
      }
      return localDB.get<ClassSession>('sessions');
    },
    create: async (session: ClassSession): Promise<ClassSession> => {
      if (isMongoConfigured) {
        await mongoFetch('insertOne', 'sessions', { document: session });
        return session;
      }
      await delay(200);
      const sessions = localDB.get<ClassSession>('sessions');
      sessions.push(session);
      localDB.set('sessions', sessions);
      return session;
    }
  },

  messages: {
    getAll: async (): Promise<Message[]> => {
      if (isMongoConfigured) {
        const res = await mongoFetch<{ documents: Message[] }>('find', 'messages', { filter: {} });
        return res.documents || [];
      }
      return localDB.get<Message>('messages');
    },
    create: async (message: Message): Promise<Message> => {
      if (isMongoConfigured) {
        await mongoFetch('insertOne', 'messages', { document: message });
        return message;
      }
      const messages = localDB.get<Message>('messages');
      messages.push(message);
      localDB.set('messages', messages);
      return message;
    }
  },

  notifications: {
    getAll: async (): Promise<Notification[]> => {
      if (isMongoConfigured) {
        const res = await mongoFetch<{ documents: Notification[] }>('find', 'notifications', { filter: {} });
        // Sort in memory or use sort option in find if needed. 
        // For simplicity, we return as is and let frontend sort by timestamp
        return res.documents || [];
      }
      return localDB.get<Notification>('notifications');
    },
    create: async (notification: Notification): Promise<Notification> => {
      if (isMongoConfigured) {
        await mongoFetch('insertOne', 'notifications', { document: notification });
        return notification;
      }
      const notifications = localDB.get<Notification>('notifications');
      notifications.unshift(notification);
      localDB.set('notifications', notifications);
      return notification;
    },
    markRead: async (id: string) => {
      if (isMongoConfigured) {
        await mongoFetch('updateOne', 'notifications', {
          filter: { id: id },
          update: { $set: { read: true } }
        });
        return;
      }
      const notifications = localDB.get<Notification>('notifications');
      const idx = notifications.findIndex(n => n.id === id);
      if (idx !== -1) {
        notifications[idx].read = true;
        localDB.set('notifications', notifications);
      }
    },
    markAllRead: async (userId: string) => {
       if (isMongoConfigured) {
        await mongoFetch('updateMany', 'notifications', {
          filter: { userId: userId },
          update: { $set: { read: true } }
        });
        return;
      }
      const notifications = localDB.get<Notification>('notifications');
      const updated = notifications.map(n => n.userId === userId ? { ...n, read: true } : n);
      localDB.set('notifications', updated);
    }
  }
};