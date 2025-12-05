
import { Student, PlacementStat, Notification } from '../types';

export const MOCK_STUDENT: Student = {
  id: 'S101',
  name: 'Alex Johnson',
  batch: '2025',
  branch: 'Computer Science',
  cgpa: 8.7,
  targetRole: 'Full Stack Developer',
  skills: [
    { name: 'React', level: 'Intermediate', verified: true },
    { name: 'Python', level: 'Advanced', verified: true },
    { name: 'Data Structures', level: 'Intermediate', verified: false },
    { name: 'System Design', level: 'Beginner', verified: false },
    { name: 'Communication', level: 'Intermediate', verified: false },
  ],
  streak: {
    currentStreak: 12,
    lastActivityDate: 'Today',
    history: [true, true, true, false, true, true, true]
  },
  socialActivity: {
    postsThisWeek: 1,
    goalPerWeek: 2,
    lastPostDate: '2023-10-25'
  },
  milestones: [
    { id: 'm1', title: 'Complete Python Basics', description: 'Finish the introductory Python course.', year: 1, completed: true, dueDate: '2022-05-15', category: 'Technical' },
    { id: 'm2', title: 'First Hackathon', description: 'Participate in an internal hackathon.', year: 1, completed: true, dueDate: '2022-08-20', category: 'Project' },
    { id: 'm3', title: 'Data Structures Certification', description: 'Get certified in DSA.', year: 2, completed: true, dueDate: '2023-04-10', category: 'Technical' },
    { id: 'm4', title: 'Mini Project Submission', description: 'Build a full-stack CRUD app.', year: 2, completed: false, dueDate: '2023-11-30', category: 'Project' },
    { id: 'm5', title: 'Mock Interview 1', description: 'Attend the first round of mock HR interviews.', year: 3, completed: false, dueDate: '2024-02-15', category: 'Soft Skills' },
  ],
  projects: [
    { title: 'E-Commerce Microservices', tech: 'Node.js, Docker, MongoDB', desc: 'A scalable backend for an e-commerce platform using microservices architecture.' },
    { title: 'AI Traffic Sign Recognition', tech: 'Python, TensorFlow, OpenCV', desc: 'Built a model to detect and classify traffic signs with 95% accuracy.' },
  ]
};

export const COORDINATOR_STATS: PlacementStat[] = [
  { branch: 'CSE', placed: 120, total: 150, avgPackage: 12.5 },
  { branch: 'ECE', placed: 85, total: 120, avgPackage: 9.2 },
  { branch: 'MECH', placed: 45, total: 80, avgPackage: 7.5 },
  { branch: 'CIVIL', placed: 30, total: 60, avgPackage: 6.8 },
];

export const SKILL_GAP_DATA = [
  { subject: 'Problem Solving', A: 120, B: 110, fullMark: 150 },
  { subject: 'System Design', A: 98, B: 130, fullMark: 150 },
  { subject: 'Communication', A: 86, B: 130, fullMark: 150 },
  { subject: 'Coding', A: 99, B: 100, fullMark: 150 },
  { subject: 'Aptitude', A: 85, B: 90, fullMark: 150 },
  { subject: 'Core CS', A: 65, B: 85, fullMark: 150 },
];

export const MOCK_NOTIFICATIONS: Notification[] = [
  { 
    id: '1', 
    title: 'Certification Deadline Approaching', 
    message: 'Action Required: You have 15 days to complete the "Cloud Computing Fundamentals" certification to meet batch criteria.', 
    type: 'alert', 
    time: '2 hrs ago', 
    read: false 
  },
  { 
    id: '2', 
    title: 'Year 1 Skill Validation', 
    message: 'As a 1st Year CSE student, you are expected to possess "C++ Basics". Please take the assessment to verify this skill.', 
    type: 'info', 
    time: '5 hrs ago', 
    read: false 
  },
  { 
    id: '3', 
    title: 'Hackathon Registration', 
    message: 'Registration for CodeFest closes in 2 days.', 
    type: 'info', 
    time: '1 day ago', 
    read: false 
  },
  { 
    id: '4', 
    title: 'Course Suggestion', 
    message: 'New "Advanced React Patterns" course available based on your interests.', 
    type: 'info', 
    time: '1 day ago', 
    read: true 
  },
  { 
    id: '5', 
    title: 'Resume Verified', 
    message: 'Your uploaded resume has been verified by the coordinator.', 
    type: 'success', 
    time: '3 days ago', 
    read: true 
  },
];
