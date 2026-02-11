export enum UserRole {
  TEACHER = 'Teacher',
  CR = 'CR',
  STUDENT = 'Student',
}

export interface User {
  id: string; // T123, CR123, ST123
  name: string;
  initials: string;
  email: string;
  role: UserRole;
  department: string;
  semester?: string;
  section?: string;
  password?: string; // In a real app, this would be hashed and not stored in frontend state
  isOnline: boolean;
  profileImage?: string; // Base64 string for profile picture
  phone?: string;
  bio?: string;
}

export interface Resource {
  id: string;
  title: string;
  type: 'PDF' | 'PPT' | 'DOC' | 'OTHER';
  uploadedBy: string; // User ID
  uploadDate: string;
  size: string;
}

export interface Course {
  id: string;
  code: string; // e.g., CSE123
  title: string;
  department: string;
  semester: string;
  section: string;
  teacherId: string;
  crId?: string; // Assigned CR
  isPublishedToStudents: boolean; // Determines if students can see it
  resources: Resource[];
  studentIds: string[];
}

export interface ClassSession {
  id: string;
  courseId: string;
  teacherId: string;
  startTime: string; // ISO string
  duration: number; // minutes
  topic: string;
  room: string;
}

export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  timestamp: string;
  read: boolean;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'INFO' | 'ALERT' | 'SUCCESS';
  read: boolean;
  timestamp: string;
}

// Stats for dashboard
export interface DashboardStats {
  totalCourses: number;
  totalStudents: number;
  pendingTasks: number;
}