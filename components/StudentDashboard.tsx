

import React, { useState } from 'react';
import { 
  CheckCircle, 
  Clock, 
  Award, 
  TrendingUp, 
  BellRing,
  Flame,
  CalendarCheck
} from 'lucide-react';
import { Student } from '../types';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { MOCK_NOTIFICATIONS } from '../services/mockData';
import { db } from '../services/db';

interface Props {
  student: Student;
}

export const StudentDashboard: React.FC<Props> = ({ student }) => {
  const [activeYear, setActiveYear] = useState<number>(2); // Default to current year view
  const [streak, setStreak] = useState(student.streak || {
    currentStreak: 0,
    lastActivityDate: '',
    history: [false, false, false, false, false, false, false]
  });

  const pendingMilestones = student.milestones.filter(m => !m.completed).length;
  const completedMilestones = student.milestones.filter(m => m.completed).length;
  const progress = Math.round((completedMilestones / student.milestones.length) * 100);

  const priorityAlerts = MOCK_NOTIFICATIONS.filter(n => n.type === 'alert' || n.title.includes('Deadline') || n.title.includes('Validation'));

  const data = [
    { name: 'Completed', value: completedMilestones },
    { name: 'Pending', value: pendingMilestones },
  ];
  const COLORS = ['#4F46E5', '#E2E8F0'];

  const handleCheckIn = () => {
    const newStreak = db.updateStreak(student.id);
    if (newStreak) {
      setStreak(prev => ({
        ...prev,
        currentStreak: newStreak,
        lastActivityDate: new Date().toISOString().split('T')[0],
        history: [...prev.history.slice(1), true]
      }));
    }
  };

  const isCheckedInToday = streak.lastActivityDate === new Date().toISOString().split('T')[0];

  return (
    <div className="space-y-6">
      
      {/* Priority Actions Banner */}
      {priorityAlerts.length > 0 && (
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-orange-100 p-4 rounded-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 animate-in slide-in-from-top-2 duration-300">
          <div className="flex gap-4">
             <div className="bg-orange-100 p-2 rounded-lg flex-shrink-0">
               <BellRing className="text-orange-600 h-6 w-6" />
             </div>
             <div>
               <h3 className="font-bold text-slate-800">Priority Actions Required</h3>
               <p className="text-sm text-slate-600">You have {priorityAlerts.length} time-sensitive tasks to complete.</p>
             </div>
          </div>
          <div className="flex gap-2 w-full md:w-auto">
             {priorityAlerts.slice(0, 2).map(alert => (
               <div key={alert.id} className="text-xs bg-white px-3 py-2 rounded-lg border border-orange-100 shadow-sm flex-1 md:flex-none">
                 <span className="font-bold text-orange-700 block mb-0.5">{alert.title}</span>
                 <span className="text-slate-500 truncate max-w-[200px] block">{alert.message}</span>
               </div>
             ))}
          </div>
        </div>
      )}

      {/* Stats Grid including Streak */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-100 flex items-center justify-between relative overflow-hidden group">
          <div className="z-10">
            <p className="text-sm text-slate-500 font-medium">Daily Streak</p>
            <div className="flex items-baseline gap-1">
              <h3 className="text-2xl font-bold text-slate-800">{streak.currentStreak}</h3>
              <span className="text-xs text-slate-400">days</span>
            </div>
            <button 
              onClick={handleCheckIn}
              disabled={isCheckedInToday}
              className={`mt-2 text-xs px-2 py-1 rounded font-semibold transition-colors ${
                isCheckedInToday 
                  ? 'bg-orange-100 text-orange-700' 
                  : 'bg-slate-900 text-white hover:bg-slate-800'
              }`}
            >
              {isCheckedInToday ? 'Checked In!' : 'Check In Today'}
            </button>
          </div>
          <div className="h-10 w-10 bg-orange-50 rounded-full flex items-center justify-center z-10">
            <Flame className="text-orange-500 h-5 w-5 fill-orange-500" />
          </div>
          <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-orange-50 rounded-full opacity-50 group-hover:scale-110 transition-transform"></div>
        </div>
        <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-100 flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-500 font-medium">Overall Readiness</p>
            <h3 className="text-2xl font-bold text-slate-800">{progress}%</h3>
          </div>
          <div className="h-10 w-10 bg-indigo-50 rounded-full flex items-center justify-center">
            <TrendingUp className="text-indigo-600 h-5 w-5" />
          </div>
        </div>
        <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-100 flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-500 font-medium">Current CGPA</p>
            <h3 className="text-2xl font-bold text-slate-800">{student.cgpa}</h3>
          </div>
          <div className="h-10 w-10 bg-emerald-50 rounded-full flex items-center justify-center">
            <Award className="text-emerald-600 h-5 w-5" />
          </div>
        </div>
        <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-100 flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-500 font-medium">Pending Tasks</p>
            <h3 className="text-2xl font-bold text-slate-800">{pendingMilestones}</h3>
          </div>
          <div className="h-10 w-10 bg-blue-50 rounded-full flex items-center justify-center">
            <Clock className="text-blue-600 h-5 w-5" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-slate-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-lg text-slate-800">Longitudinal Progress</h3>
            <div className="flex gap-2">
              {[1, 2, 3, 4].map(year => (
                <button
                  key={year}
                  onClick={() => setActiveYear(year)}
                  className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                    activeYear === year 
                      ? 'bg-indigo-600 text-white shadow-sm' 
                      : 'text-slate-500 hover:bg-slate-50'
                  }`}
                >
                  Year {year}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-4">
             {student.milestones.filter(m => m.year === activeYear).length > 0 ? (
               student.milestones.filter(m => m.year === activeYear).map((milestone) => (
                 <div key={milestone.id} className="flex items-start gap-4 p-4 rounded-xl border border-slate-100 hover:border-indigo-100 transition-colors group">
                    <div className={`mt-1 h-6 w-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                      milestone.completed 
                        ? 'bg-emerald-50 border-emerald-500 text-emerald-600' 
                        : 'border-slate-300 text-transparent'
                    }`}>
                      <CheckCircle size={14} fill={milestone.completed ? "currentColor" : "none"} />
                    </div>
                    <div className="flex-1">
                       <div className="flex justify-between items-start">
                         <h4 className={`font-semibold ${milestone.completed ? 'text-slate-800' : 'text-slate-900'}`}>
                           {milestone.title}
                         </h4>
                         <span className={`text-[10px] px-2 py-0.5 rounded font-medium ${
                           milestone.category === 'Technical' ? 'bg-blue-50 text-blue-600' :
                           milestone.category === 'Soft Skills' ? 'bg-purple-50 text-purple-600' :
                           'bg-orange-50 text-orange-600'
                         }`}>
                           {milestone.category}
                         </span>
                       </div>
                       <p className="text-sm text-slate-500 mt-1 mb-2">{milestone.description}</p>
                       <div className="flex items-center gap-4 text-xs text-slate-400">
                         <span className="flex items-center gap-1">
                           <CalendarCheck size={12} /> Due: {milestone.dueDate}
                         </span>
                       </div>
                    </div>
                 </div>
               ))
             ) : (
               <div className="text-center py-12 text-slate-400">
                 <p>No milestones set for Year {activeYear} yet.</p>
               </div>
             )}
          </div>
        </div>

        <div className="space-y-6">
           <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
              <h3 className="font-bold text-lg text-slate-800 mb-4">Overall Completion</h3>
              <div className="h-48 w-full relative">
                 <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={data}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        fill="#8884d8"
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {data.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                 </ResponsiveContainer>
                 <div className="absolute inset-0 flex items-center justify-center flex-col pointer-events-none">
                    <span className="text-3xl font-bold text-slate-800">{progress}%</span>
                    <span className="text-xs text-slate-400 uppercase font-bold">Done</span>
                 </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};
