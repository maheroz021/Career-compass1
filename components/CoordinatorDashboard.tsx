
import React, { useEffect, useState } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from 'recharts';
import { PlacementStat, MarketTrend, Student } from '../types';
import { SKILL_GAP_DATA } from '../services/mockData';
import { getMarketTrends } from '../services/geminiService';
import { db } from '../services/db';
import { Users, CheckCircle, TrendingUp, AlertTriangle, Globe, Loader2, ArrowUpRight, Search, Filter, Trash2, ShieldCheck, MoreHorizontal } from 'lucide-react';

interface Props {
  stats: PlacementStat[];
  view?: 'overview' | 'students';
}

export const CoordinatorDashboard: React.FC<Props> = ({ stats, view = 'overview' }) => {
  const [trends, setTrends] = useState<MarketTrend[]>([]);
  const [loading, setLoading] = useState(true);
  const [students, setStudents] = useState<Student[]>([]);

  const totalStudents = stats.reduce((acc, curr) => acc + curr.total, 0);
  const totalPlaced = stats.reduce((acc, curr) => acc + curr.placed, 0);
  const placementRate = Math.round((totalPlaced / totalStudents) * 100);

  useEffect(() => {
    const loadData = async () => {
      if (view === 'overview') {
          const data = await getMarketTrends();
          setTrends(data);
      }
      // Always fetch students for the students view
      if (view === 'students') {
          const studentList = db.getAllStudents();
          setStudents(studentList);
      }
      setLoading(false);
    };
    loadData();
  }, [view]);

  const handleDeleteStudent = (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to remove student: ${name}? This action cannot be undone.`)) {
      db.deleteStudent(id);
      setStudents(prev => prev.filter(s => s.id !== id));
    }
  };

  if (view === 'students') {
    return (
      <div className="space-y-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
            <div>
              <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                <ShieldCheck className="text-indigo-600" /> Admin Student Registry
              </h2>
              <p className="text-slate-500 text-sm">Manage student enrollment and verification.</p>
            </div>
            
            <div className="flex gap-2 w-full md:w-auto">
              <div className="relative flex-1 md:flex-none">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 h-4 w-4" />
                <input 
                  type="text" 
                  placeholder="Search student..." 
                  className="pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full md:w-64"
                />
              </div>
              <button className="flex items-center gap-2 px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-600 hover:bg-slate-50">
                <Filter className="h-4 w-4" /> Filter
              </button>
            </div>
          </div>

          <div className="overflow-x-auto border rounded-xl border-slate-100">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 text-slate-500 font-semibold">
                <tr>
                  <th className="px-6 py-4">ID</th>
                  <th className="px-6 py-4">Name</th>
                  <th className="px-6 py-4">Branch</th>
                  <th className="px-6 py-4">Batch</th>
                  <th className="px-6 py-4">CGPA</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {students.map((student) => (
                  <tr key={student.id} className="hover:bg-slate-50 transition-colors group">
                    <td className="px-6 py-4 font-mono text-xs text-slate-400">{student.id}</td>
                    <td className="px-6 py-4 font-medium text-slate-900">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-xs">
                          {student.name.charAt(0)}
                        </div>
                        <div className="flex flex-col">
                          <span>{student.name}</span>
                          <span className="text-xs text-slate-400">{student.email}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-600">{student.branch}</td>
                    <td className="px-6 py-4 text-slate-500">{student.batch}</td>
                    <td className="px-6 py-4">
                      <span className={`font-bold ${student.cgpa >= 8 ? 'text-emerald-600' : 'text-slate-700'}`}>
                        {student.cgpa}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 bg-emerald-50 text-emerald-700 rounded text-xs font-semibold border border-emerald-100">
                        Active
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors">
                          <MoreHorizontal size={16} />
                        </button>
                        <button 
                          onClick={() => handleDeleteStudent(student.id, student.name)}
                          className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete Student"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {students.length === 0 && (
                    <tr>
                        <td colSpan={7} className="text-center py-12 text-slate-500">
                          <div className="flex flex-col items-center gap-2">
                            <Users size={32} className="opacity-20" />
                            <p>No students enrolled yet.</p>
                          </div>
                        </td>
                    </tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="mt-4 flex justify-between items-center text-xs text-slate-500">
            <span>Showing {students.length} students</span>
            <div className="flex gap-1">
              <button className="px-3 py-1 border rounded hover:bg-slate-50 disabled:opacity-50" disabled>Previous</button>
              <button className="px-3 py-1 border rounded hover:bg-slate-50 disabled:opacity-50" disabled>Next</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header for Coordinator Dashboard */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Coordinator Dashboard</h1>
          <p className="text-slate-500">Overview of batch performance and placement statistics.</p>
        </div>
        <div className="bg-indigo-50 px-4 py-2 rounded-lg text-indigo-700 text-sm font-semibold">
          Academic Year: 2024-25
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-100">
           <div className="flex items-center gap-3 mb-2">
              <div className="bg-blue-100 p-2 rounded-lg"><Users className="text-blue-600 h-5 w-5" /></div>
              <p className="text-sm text-slate-500 font-medium">Total Batch Size</p>
           </div>
           <h3 className="text-2xl font-bold text-slate-800">{totalStudents}</h3>
        </div>
        <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-100">
           <div className="flex items-center gap-3 mb-2">
              <div className="bg-emerald-100 p-2 rounded-lg"><CheckCircle className="text-emerald-600 h-5 w-5" /></div>
              <p className="text-sm text-slate-500 font-medium">Students Placed</p>
           </div>
           <h3 className="text-2xl font-bold text-slate-800">{totalPlaced} <span className="text-sm text-emerald-600 font-medium">({placementRate}%)</span></h3>
        </div>
        <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-100">
           <div className="flex items-center gap-3 mb-2">
              <div className="bg-purple-100 p-2 rounded-lg"><TrendingUp className="text-purple-600 h-5 w-5" /></div>
              <p className="text-sm text-slate-500 font-medium">Avg Package</p>
           </div>
           <h3 className="text-2xl font-bold text-slate-800">8.4 LPA</h3>
        </div>
        <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-100">
           <div className="flex items-center gap-3 mb-2">
              <div className="bg-red-100 p-2 rounded-lg"><AlertTriangle className="text-red-600 h-5 w-5" /></div>
              <p className="text-sm text-slate-500 font-medium">At Risk ({'<'} 6 CGPA)</p>
           </div>
           <h3 className="text-2xl font-bold text-slate-800">42</h3>
        </div>
      </div>

      {/* Market Intelligence Section */}
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-xl p-6 text-white shadow-lg">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="font-bold text-xl flex items-center gap-2">
              <Globe className="text-blue-400" /> Market Intelligence & Curriculum Alignment
            </h3>
            <p className="text-slate-400 text-sm mt-1">
              AI-driven insights on current market demands to help align training modules.
            </p>
          </div>
          <div className="bg-white/10 px-3 py-1 rounded-full text-xs font-medium text-blue-200 border border-white/10 flex items-center gap-2">
            <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></span> Live Analysis
          </div>
        </div>

        {loading ? (
          <div className="h-32 flex items-center justify-center">
            <Loader2 className="animate-spin text-blue-400 h-8 w-8" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {trends.map((trend, idx) => (
              <div key={idx} className="bg-white/5 border border-white/10 rounded-lg p-4 hover:bg-white/10 transition-colors">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-bold text-blue-100">{trend.role}</h4>
                  <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${
                    trend.demandLevel === 'High' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300'
                  }`}>
                    {trend.demandLevel}
                  </span>
                </div>
                <div className="flex items-center gap-1 text-emerald-400 text-xs font-bold mb-3">
                  <ArrowUpRight size={12} /> {trend.growth} Growth
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] text-slate-400 uppercase font-semibold">Required Skills</p>
                  <div className="flex flex-wrap gap-1">
                    {trend.topSkills.slice(0, 3).map((s, i) => (
                      <span key={i} className="text-[10px] bg-white/10 px-1.5 py-0.5 rounded text-slate-300">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <h3 className="font-bold text-lg text-slate-800 mb-6">Placement Stats by Branch</h3>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={stats}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="branch" />
                <YAxis />
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Legend />
                <Bar dataKey="placed" fill="#4F46E5" name="Placed" radius={[4, 4, 0, 0]} />
                <Bar dataKey="total" fill="#E2E8F0" name="Total Strength" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <h3 className="font-bold text-lg text-slate-800 mb-6">Batch Skill Gap Analysis</h3>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={SKILL_GAP_DATA}>
                <PolarGrid />
                <PolarAngleAxis dataKey="subject" />
                <PolarRadiusAxis />
                <Radar
                  name="Current Avg"
                  dataKey="A"
                  stroke="#4F46E5"
                  fill="#4F46E5"
                  fillOpacity={0.6}
                />
                <Radar
                  name="Industry Target"
                  dataKey="B"
                  stroke="#10B981"
                  fill="#10B981"
                  fillOpacity={0.3}
                />
                <Legend />
                <Tooltip />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
