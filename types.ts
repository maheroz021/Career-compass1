

export type UserRole = 'student' | 'coordinator';

export interface Student {
  id: string;
  name: string;
  email?: string;
  password?: string;
  batch: string;
  branch: string;
  cgpa: number;
  skills: Skill[];
  milestones: Milestone[];
  targetRole?: string;
  projects?: Project[];
  repositoryFiles?: RepoFile[];
  streak?: StreakData;
  socialActivity?: SocialActivity;
}

export interface RepoFile {
  id: string;
  name: string;
  type: 'Project' | 'Certification' | 'Resume' | 'Other';
  dateAdded: string;
  url?: string;
}

export interface StreakData {
  currentStreak: number;
  lastActivityDate: string;
  history: boolean[]; // last 7 days
}

export interface SocialActivity {
  postsThisWeek: number;
  goalPerWeek: number;
  lastPostDate: string;
}

export interface PostIdea {
  topic: string;
  content: string;
  hashtags: string[];
}

export interface Project {
  title: string;
  tech: string;
  desc: string;
}

export interface Skill {
  name: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  verified: boolean;
}

export interface Milestone {
  id: string;
  title: string;
  description: string;
  year: 1 | 2 | 3 | 4;
  completed: boolean;
  dueDate: string;
  category: 'Technical' | 'Soft Skills' | 'Project' | 'Internship';
}

export interface PlacementStat {
  branch: string;
  placed: number;
  total: number;
  avgPackage: number;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
}

export interface LearningResource {
  title: string;
  type: 'Course' | 'Book' | 'Video' | 'Article';
  platform?: string;
}

export interface RoadmapItem {
  year: number;
  term: string;
  focusArea: string;
  actionItems: string[];
  resources: LearningResource[];
}

export interface CompanyPrepGuide {
  companyName: string;
  summary: string;
  keySkills: string[];
  interviewProcess: string[];
  roadmap: RoadmapItem[];
}

// Interview
export interface InterviewQuestion {
  id: number;
  question: string;
  topic: string;
}

export interface InterviewFeedback {
  questionId: number;
  score: number; // 1-10
  feedback: string;
  improvementTip: string;
}

// Skill Gap
export interface SkillGapAnalysisResult {
  role: string;
  missingSkills: {
    name: string;
    priority: string;
    reason: string;
    recommendation: string;
    courses: string[];
  }[];
  strengthSkills: string[];
}

// Notifications
export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'alert' | 'info' | 'success';
  time: string;
  read: boolean;
}

// Market Insights
export interface MarketTrend {
  role: string;
  demandLevel: 'High' | 'Medium' | 'Emerging';
  growth: string;
  topSkills: string[];
}

// Job Matcher
export interface JobMatch {
  jobTitle: string;
  matchScore: number;
  reason: string;
  recommendedCompanies: string[];
  recommendedCourses: string[];
}

// Profile Review
export interface ProfileReviewResult {
  score: number;
  strengths: string[];
  improvements: string[];
  refinedContent: string;
}

// --- NEW RESUME & ATS TYPES ---

export interface Education {
  id: string;
  degree: string;
  institution: string;
  year: string;
  score: string;
}

export interface Experience {
  id: string;
  role: string;
  company: string;
  duration: string;
  description: string;
}

export interface ResumeData {
  fullName: string;
  email: string;
  phone: string;
  linkedin: string;
  summary: string;
  education: Education[];
  experience: Experience[];
  skills: string[]; // snapshot
  projects: Project[]; // snapshot
}

export interface ATSAnalysisResult {
  score: number; // 0-100
  matchStatus: 'High' | 'Medium' | 'Low';
  missingKeywords: string[];
  formattingIssues: string[];
  impactScore: number; // 1-10 for action verbs usage
  summaryFeedback: string;
}
