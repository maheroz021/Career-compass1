

import { Student, RepoFile, Skill, Project, ResumeData } from '../types';
import { MOCK_STUDENT } from './mockData';

const DB_KEYS = {
  USERS: 'career_compass_users',
  CURRENT_USER_ID: 'career_compass_current_user_id',
  IS_COORDINATOR: 'career_compass_is_coordinator',
  RESUMES: 'career_compass_resumes'
};

// Initialize DB with Mock Data if empty
const initDB = () => {
  const existingUsers = localStorage.getItem(DB_KEYS.USERS);
  if (!existingUsers) {
    const initialUsers = [
      {
        ...MOCK_STUDENT,
        email: 'alex@college.edu',
        password: 'password123',
      }
    ];
    localStorage.setItem(DB_KEYS.USERS, JSON.stringify(initialUsers));
  }
};

export const db = {
  // Auth Methods
  login: (email: string, password: string): { success: boolean; user?: Student; isCoordinator?: boolean } => {
    initDB();
    
    // Hardcoded Coordinator Login
    if (email === 'admin@college.edu' && password === 'admin123') {
      localStorage.setItem(DB_KEYS.IS_COORDINATOR, 'true');
      return { success: true, isCoordinator: true };
    }

    const usersStr = localStorage.getItem(DB_KEYS.USERS);
    const users: Student[] = usersStr ? JSON.parse(usersStr) : [];
    
    const user = users.find(u => u.email === email && u.password === password);
    
    if (user) {
      localStorage.setItem(DB_KEYS.CURRENT_USER_ID, user.id);
      localStorage.setItem(DB_KEYS.IS_COORDINATOR, 'false');
      return { success: true, user };
    }
    
    return { success: false };
  },

  signup: (studentData: Partial<Student>): boolean => {
    initDB();
    const usersStr = localStorage.getItem(DB_KEYS.USERS);
    const users: Student[] = usersStr ? JSON.parse(usersStr) : [];
    
    if (users.find(u => u.email === studentData.email)) {
      return false; // User already exists
    }

    const newUser: Student = {
      ...MOCK_STUDENT, 
      id: `S${Date.now()}`,
      name: studentData.name || 'New Student',
      email: studentData.email,
      password: studentData.password,
      branch: studentData.branch || 'CSE',
      batch: studentData.batch || '2025',
      skills: [], 
      projects: [],
      repositoryFiles: [],
      streak: { currentStreak: 0, lastActivityDate: '', history: [false, false, false, false, false, false, false] },
      socialActivity: { postsThisWeek: 0, goalPerWeek: 2, lastPostDate: '' }
    };

    users.push(newUser);
    localStorage.setItem(DB_KEYS.USERS, JSON.stringify(users));
    
    // Auto login
    localStorage.setItem(DB_KEYS.CURRENT_USER_ID, newUser.id);
    localStorage.setItem(DB_KEYS.IS_COORDINATOR, 'false');
    
    return true;
  },

  logout: () => {
    localStorage.removeItem(DB_KEYS.CURRENT_USER_ID);
    localStorage.removeItem(DB_KEYS.IS_COORDINATOR);
  },

  getCurrentUser: (): Student | null => {
    initDB();
    const userId = localStorage.getItem(DB_KEYS.CURRENT_USER_ID);
    if (!userId) return null;

    const users: Student[] = JSON.parse(localStorage.getItem(DB_KEYS.USERS) || '[]');
    return users.find(u => u.id === userId) || null;
  },

  checkIsCoordinator: (): boolean => {
    return localStorage.getItem(DB_KEYS.IS_COORDINATOR) === 'true';
  },

  // Data Methods
  getAllStudents: (): Student[] => {
    initDB();
    return JSON.parse(localStorage.getItem(DB_KEYS.USERS) || '[]');
  },

  deleteStudent: (studentId: string) => {
    initDB();
    const users: Student[] = JSON.parse(localStorage.getItem(DB_KEYS.USERS) || '[]');
    const newUsers = users.filter(u => u.id !== studentId);
    localStorage.setItem(DB_KEYS.USERS, JSON.stringify(newUsers));
  },

  updateStudent: (studentId: string, updates: Partial<Student>) => {
    const users: Student[] = JSON.parse(localStorage.getItem(DB_KEYS.USERS) || '[]');
    const index = users.findIndex(u => u.id === studentId);
    if (index !== -1) {
      users[index] = { ...users[index], ...updates };
      localStorage.setItem(DB_KEYS.USERS, JSON.stringify(users));
    }
  },

  updateStreak: (studentId: string) => {
    const users: Student[] = JSON.parse(localStorage.getItem(DB_KEYS.USERS) || '[]');
    const index = users.findIndex(u => u.id === studentId);
    if (index !== -1) {
      const student = users[index];
      const today = new Date().toISOString().split('T')[0];
      
      if (student.streak?.lastActivityDate !== today) {
        const newStreak = (student.streak?.currentStreak || 0) + 1;
        const newHistory = [...(student.streak?.history || [])];
        newHistory.shift();
        newHistory.push(true);

        users[index].streak = {
          currentStreak: newStreak,
          lastActivityDate: today,
          history: newHistory
        };
        localStorage.setItem(DB_KEYS.USERS, JSON.stringify(users));
        return newStreak;
      }
    }
    return null;
  },

  addProject: (studentId: string, project: Project) => {
    const users: Student[] = JSON.parse(localStorage.getItem(DB_KEYS.USERS) || '[]');
    const index = users.findIndex(u => u.id === studentId);
    if (index !== -1) {
      if (!users[index].projects) {
        users[index].projects = [];
      }
      users[index].projects?.push(project);
      localStorage.setItem(DB_KEYS.USERS, JSON.stringify(users));
    }
  },

  addFile: (userId: string, file: RepoFile) => {
    const users: Student[] = JSON.parse(localStorage.getItem(DB_KEYS.USERS) || '[]');
    const userIndex = users.findIndex(u => u.id === userId);
    
    if (userIndex !== -1) {
      if (!users[userIndex].repositoryFiles) {
        users[userIndex].repositoryFiles = [];
      }
      users[userIndex].repositoryFiles!.push(file);
      localStorage.setItem(DB_KEYS.USERS, JSON.stringify(users));
    }
  },

  removeFile: (userId: string, fileId: string) => {
    const users: Student[] = JSON.parse(localStorage.getItem(DB_KEYS.USERS) || '[]');
    const userIndex = users.findIndex(u => u.id === userId);
    
    if (userIndex !== -1 && users[userIndex].repositoryFiles) {
      users[userIndex].repositoryFiles = users[userIndex].repositoryFiles!.filter(f => f.id !== fileId);
      localStorage.setItem(DB_KEYS.USERS, JSON.stringify(users));
    }
  },

  verifySkill: (userId: string, skillName: string) => {
    const users: Student[] = JSON.parse(localStorage.getItem(DB_KEYS.USERS) || '[]');
    const userIndex = users.findIndex(u => u.id === userId);
    
    if (userIndex !== -1) {
      const skillIndex = users[userIndex].skills.findIndex(s => s.name === skillName);
      if (skillIndex !== -1) {
        users[userIndex].skills[skillIndex].verified = true;
      } else {
        users[userIndex].skills.push({ name: skillName, level: 'Intermediate', verified: true });
      }
      localStorage.setItem(DB_KEYS.USERS, JSON.stringify(users));
    }
  },

  // Resume Methods
  saveResume: (userId: string, resume: ResumeData) => {
    const resumes = JSON.parse(localStorage.getItem(DB_KEYS.RESUMES) || '{}');
    resumes[userId] = resume;
    localStorage.setItem(DB_KEYS.RESUMES, JSON.stringify(resumes));
  },

  getResume: (userId: string): ResumeData | null => {
    const resumes = JSON.parse(localStorage.getItem(DB_KEYS.RESUMES) || '{}');
    return resumes[userId] || null;
  }
};
