
import React, { useEffect, useState } from 'react';
import { getMarketTrends } from '../services/geminiService';
import { MarketTrend } from '../types';
import { Loader2, TrendingUp, BarChart3, Globe } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

export const MarketInsights: React.FC = () => {
  const [trends, setTrends] = useState<MarketTrend[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTrends = async () => {
      const data = await getMarketTrends();
      setTrends(data);
      setLoading(false);
    };
    fetchTrends();
  }, []);

  const chartData = trends.map(t => ({
    name: t.role.split(' ')[0], // Short name
    growth: parseInt(t.growth.replace('%', '') || '0')
  }));

  const COLORS = ['#4F46E5', '#8B5CF6', '#EC4899', '#10B981'];

  return (
    <div className="space-y-6">
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
             <div className="bg-blue-100 p-2 rounded-lg">
                <Globe className="text-blue-600 h-6 w-6" />
             </div>
             Market Insights & Trends
          </h2>
          <p className="text-slate-500 mt-2 max-w-2xl">
            Real-time AI analysis of the current job market. Stay ahead by knowing which roles are in high demand and what skills are trending.
          </p>
        </div>
        <div className="text-right">
           <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Data Source</span>
           <p className="text-sm font-semibold text-slate-700 flex items-center gap-2 justify-end">
             <TrendingUp size={16} className="text-emerald-500"/> Live Market Analysis
           </p>
        </div>
      </div>

      {loading ? (
        <div className="h-64 flex flex-col items-center justify-center bg-white rounded-xl border border-slate-100">
          <Loader2 className="animate-spin h-8 w-8 text-indigo-600 mb-2" />
          <p className="text-slate-400">Scanning industry reports...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
           <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {trends.map((trend, idx) => (
                <div key={idx} className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow group">
                   <div className="flex justify-between items-start mb-4">
                      <div className="bg-indigo-50 p-2 rounded-lg group-hover:bg-indigo-100 transition-colors">
                        <BarChart3 className="text-indigo-600 h-6 w-6" />
                      </div>
                      <span className={`px-2 py-1 rounded text-xs font-bold ${
                        trend.demandLevel === 'High' ? 'bg-emerald-50 text-emerald-600' : 'bg-blue-50 text-blue-600'
                      }`}>
                        {trend.demandLevel} Demand
                      </span>
                   </div>
                   <h3 className="font-bold text-lg text-slate-800 mb-1">{trend.role}</h3>
                   <p className="text-sm text-emerald-600 font-semibold mb-4 flex items-center gap-1">
                     <TrendingUp size={14} /> {trend.growth} Growth YoY
                   </p>
                   
                   <div className="space-y-2">
                      <p className="text-xs text-slate-400 uppercase font-bold">Top Skills</p>
                      <div className="flex flex-wrap gap-2">
                        {trend.topSkills.map((skill, sIdx) => (
                          <span key={sIdx} className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded border border-slate-200">
                            {skill}
                          </span>
                        ))}
                      </div>
                   </div>
                </div>
              ))}
           </div>

           <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex flex-col">
              <h3 className="font-bold text-slate-800 mb-6">Growth Comparison</h3>
              <div className="flex-1 min-h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis hide />
                    <Tooltip cursor={{fill: '#f1f5f9'}} contentStyle={{borderRadius: '8px', border: 'none'}} />
                    <Bar dataKey="growth" radius={[4, 4, 0, 0]}>
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-4 p-4 bg-slate-50 rounded-lg">
                <p className="text-sm text-slate-600 text-center italic">
                  "Focus on roles with {'>'}15% growth for better placement ..."
                </p>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};
