
import React, { useState, useEffect } from 'react';
import { Layout } from './components/Layout';
import { Auth } from './components/Auth';
import { StudentDashboard } from './components/StudentDashboard';
import { CoordinatorDashboard } from './components/CoordinatorDashboard';
import { AICoach } from './components/AICoach';
import { CareerRoadmap } from './components/CareerRoadmap';
import { Repository } from './components/Repository';
import { MockInterview } from './components/MockInterview';
import { SkillGapAnalysis } from './components/SkillGapAnalysis';
import { MarketInsights } from './components/MarketInsights';
import { JobMatcher } from './components/JobMatcher';
import { CommunicationTrainer } from './components/CommunicationTrainer';
import { COORDINATOR_STATS } from './services/mockData';
import { db } from './services/db';
import { UserRole, Student } from './types';

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState<Student | null>(null);
  const [userRole, setUserRole] = useState<UserRole>('student');
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing session
    const user = db.getCurrentUser();
    const isCoord = db.checkIsCoordinator();
    
    if (user || isCoord) {
      setCurrentUser(user);
      setUserRole(isCoord ? 'coordinator' : 'student');
      setIsAuthenticated(true);
      setActiveTab(isCoord ? 'overview' : 'dashboard');
    }
    setLoading(false);
  }, []);

  const handleLogin = (isCoordinator: boolean) => {
    const user = db.getCurrentUser();
    setCurrentUser(user);
    setUserRole(isCoordinator ? 'coordinator' : 'student');
    setIsAuthenticated(true);
    setActiveTab(isCoordinator ? 'overview' : 'dashboard');
  };

  const handleRoleSwitch = () => {
    // For demo purposes, allows switching between views if authorized or in dev
    // In strict auth, this would just be a view toggle if the user has dual permissions
    // But per requirements "whoever signs up should be in coordinator", let's keep it simple
    if (userRole === 'student') {
        // Checking if we are simulating an admin switch? 
        // For now, let's just toggle the UI role to visualize the other dashboard
        // In a real app, we would validate permissions
        setUserRole('coordinator');
        setActiveTab('overview');
    } else {
        setUserRole('student');
        setActiveTab('dashboard');
    }
  };

  const handleLogout = () => {
    db.logout();
    setIsAuthenticated(false);
    setCurrentUser(null);
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-slate-50">Loading...</div>;

  if (!isAuthenticated) {
    return <Auth onLogin={handleLogin} />;
  }

  const renderContent = () => {
    if (userRole === 'student' && currentUser) {
      switch (activeTab) {
        case 'dashboard': return <StudentDashboard student={currentUser} />;
        case 'roadmap': return <CareerRoadmap />;
        case 'gap-analysis': return <SkillGapAnalysis student={currentUser} />;
        case 'communication': return <CommunicationTrainer />;
        case 'mock-interview': return <MockInterview />;
        case 'market-insights': return <MarketInsights />;
        case 'job-matcher': return <JobMatcher />;
        case 'coach': return <AICoach />;
        case 'profile': return <Repository student={currentUser} />;
        default: return <StudentDashboard student={currentUser} />;
      }
    } else {
      switch (activeTab) {
        case 'overview': return <CoordinatorDashboard stats={COORDINATOR_STATS} view="overview" />;
        case 'analytics': return <CoordinatorDashboard stats={COORDINATOR_STATS} view="overview" />;
        case 'students': return <CoordinatorDashboard stats={COORDINATOR_STATS} view="students" />;
        default: return <CoordinatorDashboard stats={COORDINATOR_STATS} view="overview" />;
      }
    }
  };

  return (
    <Layout 
      activeTab={activeTab} 
      onTabChange={setActiveTab}
      userRole={userRole}
      onRoleSwitch={handleRoleSwitch}
      onLogout={handleLogout}
    >
      {renderContent()}
    </Layout>
  );
};

export default App;
