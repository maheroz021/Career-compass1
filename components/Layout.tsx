

import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  User, 
  BookOpen, 
  BarChart2, 
  MessageSquare, 
  LogOut,
  GraduationCap,
  Mic,
  Zap,
  TrendingUp,
  Briefcase,
  Bell,
  X,
  Languages,
  Users,
  SwitchCamera
} from 'lucide-react';
import { MOCK_NOTIFICATIONS } from '../services/mockData';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  onTabChange: (tab: string) => void;
  userRole: 'student' | 'coordinator';
  onRoleSwitch: () => void;
  onLogout: () => void;
}

export const Layout: React.FC<LayoutProps> = ({ 
  children, 
  activeTab, 
  onTabChange, 
  userRole,
  onRoleSwitch,
  onLogout
}) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const unreadCount = MOCK_NOTIFICATIONS.filter(n => !n.read).length;

  const studentNav = [
    { id: 'dashboard', label: 'My Progress', icon: LayoutDashboard },
    { id: 'roadmap', label: 'Career Roadmap', icon: BookOpen },
    { id: 'gap-analysis', label: 'Skill Gap Analysis', icon: Zap },
    { id: 'communication', label: 'Comm. Lab', icon: Languages },
    { id: 'mock-interview', label: 'Mock Interview', icon: Mic },
    { id: 'job-matcher', label: 'Project Job Match', icon: Briefcase },
    { id: 'market-insights', label: 'Market Insights', icon: TrendingUp },
    { id: 'coach', label: 'AI Coach', icon: MessageSquare },
    { id: 'profile', label: 'My Repository', icon: User },
  ];

  const coordinatorNav = [
    { id: 'overview', label: 'Batch Overview', icon: LayoutDashboard },
    { id: 'analytics', label: 'Analytics', icon: BarChart2 },
    { id: 'students', label: 'Student Registry', icon: Users },
  ];

  const navItems = userRole === 'student' ? studentNav : coordinatorNav;

  return (
    <div className="flex h-screen bg-slate-50 font-sans text-slate-900">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col shadow-xl z-20 hidden md:flex print:hidden">
        <div className="p-6 flex items-center space-x-3 border-b border-slate-700">
          <div className="bg-indigo-500 p-2 rounded-lg">
            <GraduationCap className="h-6 w-6 text-white" />
          </div>
          <span className="font-bold text-xl tracking-tight">CareerCompass</span>
        </div>

        <nav className="flex-1 p-4 space-y-2 mt-4 overflow-y-auto">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`flex items-center space-x-3 w-full p-3 rounded-lg transition-all duration-200 ${
                activeTab === item.id 
                  ? 'bg-indigo-600 text-white shadow-md translate-x-1' 
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <item.icon className="h-5 w-5" />
              <span className="font-medium text-left">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-700">
          <div className="bg-slate-800/50 rounded-xl p-4 mb-4 border border-slate-700">
            <div className="flex items-center gap-3 mb-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${userRole === 'student' ? 'bg-indigo-500 text-white' : 'bg-emerald-500 text-white'}`}>
                {userRole === 'student' ? 'S' : 'A'}
              </div>
              <div className="overflow-hidden">
                <p className="text-sm font-bold text-white capitalize truncate">{userRole}</p>
                <p className="text-[10px] text-slate-400 truncate">{userRole === 'student' ? 'Student View' : 'Admin Access'}</p>
              </div>
            </div>
            
            <button 
              onClick={onRoleSwitch}
              className="flex items-center space-x-2 w-full px-2 py-1.5 rounded text-xs text-slate-400 hover:text-white hover:bg-slate-700 transition-colors mb-1"
            >
              <SwitchCamera size={14} />
              <span>Switch Account</span>
            </button>
          </div>
          
          <button 
            onClick={onLogout}
            className="flex items-center space-x-3 w-full p-3 text-red-400 hover:text-white transition-colors hover:bg-red-500/10 rounded-lg"
          >
            <LogOut className="h-5 w-5" />
            <span className="font-medium">Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Mobile Header (Visible only on small screens) */}
      <div className="md:hidden fixed top-0 w-full bg-slate-900 text-white z-50 flex items-center justify-between p-4 shadow-md print:hidden">
        <span className="font-bold text-lg flex items-center gap-2">
          <GraduationCap className="h-5 w-5" /> CareerCompass
        </span>
        <button onClick={onLogout} className="text-xs bg-slate-800 px-3 py-1 rounded border border-slate-700">
           Sign Out
        </button>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Top Header */}
        <header className="bg-white border-b border-slate-200 p-4 md:px-8 flex items-center justify-end h-16 relative print:hidden">
          <div className="relative">
            <button 
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2 text-slate-500 hover:bg-slate-100 rounded-full relative transition-colors"
            >
              <Bell className="h-6 w-6" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 h-3 w-3 bg-red-500 rounded-full border-2 border-white"></span>
              )}
            </button>

            {/* Notification Dropdown */}
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg border border-slate-200 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="p-3 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                  <span className="font-semibold text-sm text-slate-800">Notifications</span>
                  <button onClick={() => setShowNotifications(false)} className="text-slate-400 hover:text-slate-600">
                    <X size={16} />
                  </button>
                </div>
                <div className="max-h-80 overflow-y-auto">
                  {MOCK_NOTIFICATIONS.map(notif => (
                    <div key={notif.id} className={`p-4 border-b border-slate-50 hover:bg-slate-50 transition-colors ${!notif.read ? 'bg-indigo-50/50' : ''}`}>
                      <div className="flex justify-between items-start mb-1">
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                          notif.type === 'alert' ? 'bg-red-100 text-red-600' :
                          notif.type === 'success' ? 'bg-emerald-100 text-emerald-600' :
                          'bg-blue-100 text-blue-600'
                        }`}>
                          {notif.type.toUpperCase()}
                        </span>
                        <span className="text-[10px] text-slate-400">{notif.time}</span>
                      </div>
                      <h4 className="text-sm font-semibold text-slate-800 mb-1">{notif.title}</h4>
                      <p className="text-xs text-slate-500 leading-relaxed">{notif.message}</p>
                    </div>
                  ))}
                </div>
                <div className="p-2 text-center border-t border-slate-100 bg-slate-50">
                  <button className="text-xs text-indigo-600 font-medium hover:underline">Mark all as read</button>
                </div>
              </div>
            )}
          </div>
        </header>

        {/* Scrollable Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="max-w-7xl mx-auto h-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};
