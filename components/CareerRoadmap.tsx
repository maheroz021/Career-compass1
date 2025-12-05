

import React, { useState } from 'react';
import { generateCareerRoadmap, generateCompanyRoadmap } from '../services/geminiService';
import { RoadmapItem, CompanyPrepGuide } from '../types';
import { Loader2, Map, Target, Calendar, Building, Info, CheckSquare, List, BookOpen, ExternalLink, Video } from 'lucide-react';

export const CareerRoadmap: React.FC = () => {
  const [mode, setMode] = useState<'role' | 'company'>('role');
  const [query, setQuery] = useState('');
  const [degree, setDegree] = useState('B.Tech Computer Science');
  const [currentYear, setCurrentYear] = useState<number>(2);
  const [loading, setLoading] = useState(false);
  const [roleRoadmap, setRoleRoadmap] = useState<RoadmapItem[]>([]);
  const [companyGuide, setCompanyGuide] = useState<CompanyPrepGuide | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  const handleGenerate = async () => {
    if (!query.trim()) return;
    setLoading(true);
    setHasSearched(true);
    setRoleRoadmap([]);
    setCompanyGuide(null);

    if (mode === 'role') {
      const result = await generateCareerRoadmap(query, currentYear, degree);
      setRoleRoadmap(result);
    } else {
      const result = await generateCompanyRoadmap(query, currentYear);
      setCompanyGuide(result);
    }
    setLoading(false);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 text-center">
        <div className="inline-flex items-center justify-center p-3 bg-indigo-50 rounded-full mb-4">
          <Map className="h-8 w-8 text-indigo-600" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">
          {mode === 'role' ? 'Learning Path & Roadmap Generator' : 'Dream Company Guide'}
        </h2>
        <p className="text-slate-500 mb-8 max-w-lg mx-auto">
          {mode === 'role' 
            ? 'Get a personalized 4-year learning guide with specific courses, books, and actions based on your degree.'
            : 'Enter your dream company and get a tailored guide on their interview process, values, and required skills.'}
        </p>

        <div className="flex justify-center mb-6">
          <div className="bg-slate-100 p-1 rounded-lg inline-flex">
            <button
              onClick={() => { setMode('role'); setHasSearched(false); setQuery(''); }}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                mode === 'role' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              Learning Path
            </button>
            <button
              onClick={() => { setMode('company'); setHasSearched(false); setQuery(''); }}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                mode === 'company' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              Company Guide
            </button>
          </div>
        </div>

        <div className="space-y-4 max-w-md mx-auto">
          {mode === 'role' && (
             <div className="grid grid-cols-2 gap-3 text-left">
               <div>
                 <label className="block text-xs font-semibold text-slate-500 mb-1">Current Degree</label>
                 <input 
                   type="text"
                   value={degree}
                   onChange={(e) => setDegree(e.target.value)}
                   className="w-full p-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                   placeholder="e.g. BCA, B.Tech ECE"
                 />
               </div>
               <div>
                 <label className="block text-xs font-semibold text-slate-500 mb-1">Current Year</label>
                 <select 
                    value={currentYear}
                    onChange={(e) => setCurrentYear(Number(e.target.value))}
                    className="w-full p-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
                 >
                   {[1, 2, 3, 4].map(y => <option key={y} value={y}>Year {y}</option>)}
                 </select>
               </div>
             </div>
          )}

          <div className="flex gap-3">
            <input 
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={mode === 'role' ? "Job Interest (e.g. AI Engineer)" : "Dream Company (e.g. Google)"}
              className="flex-1 p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
              onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
            />
            <button 
              onClick={handleGenerate}
              disabled={loading || !query.trim()}
              className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-indigo-700 disabled:opacity-50 transition-colors flex items-center gap-2"
            >
              {loading ? <Loader2 className="animate-spin h-5 w-5" /> : 'Generate'}
            </button>
          </div>
        </div>
      </div>

      {loading && (
        <div className="text-center py-12">
          <Loader2 className="animate-spin h-8 w-8 text-indigo-600 mx-auto mb-4" />
          <p className="text-slate-500">Curating your personalized {mode === 'role' ? 'learning guide' : 'prep guide'}...</p>
        </div>
      )}

      {!loading && hasSearched && roleRoadmap.length === 0 && !companyGuide && (
        <div className="text-center py-12 text-slate-500 bg-white rounded-xl border border-slate-100">
          <p>Could not generate a result. Please try a different query or check your connection.</p>
        </div>
      )}

      {/* Role Based Results (Learning Guide) */}
      {!loading && mode === 'role' && roleRoadmap.length > 0 && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-xl text-slate-800">Learning Path: {query} for {degree}</h3>
            <span className="text-sm bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full font-medium">
              Start from Year {currentYear}
            </span>
          </div>
          
          <div className="grid gap-6">
            {roleRoadmap.map((item, idx) => (
              <div key={idx} className="bg-white rounded-xl p-6 border-l-4 border-indigo-500 shadow-sm relative hover:shadow-md transition-shadow">
                <div className="absolute top-6 right-6 text-slate-300 font-bold text-4xl opacity-10 select-none">
                  Year {item.year}
                </div>
                
                <div className="flex flex-col md:flex-row md:items-center gap-4 mb-6 border-b border-slate-100 pb-4">
                   <div className="bg-slate-900 text-white px-4 py-1.5 rounded-lg text-sm font-bold shadow-sm">
                     Year {item.year} - {item.term}
                   </div>
                   <div className="flex items-center gap-2 text-indigo-600 text-sm font-bold bg-indigo-50 px-3 py-1.5 rounded-lg">
                     <Target size={16} />
                     Focus: {item.focusArea}
                   </div>
                </div>
                
                <div className="grid md:grid-cols-2 gap-8">
                  <div>
                    <h4 className="font-bold text-slate-800 mb-3 flex items-center gap-2 text-sm uppercase tracking-wide">
                       <CheckSquare size={16} className="text-emerald-500" /> Action Items
                    </h4>
                    <ul className="space-y-3">
                      {item.actionItems.map((action, i) => (
                        <li key={i} className="flex items-start gap-3 text-slate-600 text-sm">
                          <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-emerald-400 flex-shrink-0" />
                          <span>{action}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                     <h4 className="font-bold text-slate-800 mb-3 flex items-center gap-2 text-sm uppercase tracking-wide">
                        <BookOpen size={16} className="text-blue-500" /> Recommended Resources
                     </h4>
                     <div className="space-y-2">
                        {item.resources && item.resources.length > 0 ? (
                           item.resources.map((res, i) => (
                             <a 
                               key={i}
                               href={`https://www.google.com/search?q=${encodeURIComponent(res.title + " " + res.platform)}`}
                               target="_blank" 
                               rel="noreferrer"
                               className="flex items-center gap-3 p-3 rounded-lg border border-slate-100 bg-slate-50 hover:bg-blue-50 hover:border-blue-200 transition-colors group"
                             >
                                <div className={`p-2 rounded-lg ${
                                  res.type === 'Video' ? 'bg-red-100 text-red-600' : 
                                  res.type === 'Book' ? 'bg-amber-100 text-amber-600' :
                                  'bg-blue-100 text-blue-600'
                                }`}>
                                   {res.type === 'Video' ? <Video size={14} /> : <BookOpen size={14} />}
                                </div>
                                <div className="flex-1">
                                   <p className="text-sm font-semibold text-slate-700 group-hover:text-blue-700">{res.title}</p>
                                   <p className="text-xs text-slate-500 flex items-center gap-1">
                                     {res.type} {res.platform && `• ${res.platform}`} <ExternalLink size={10} />
                                   </p>
                                </div>
                             </a>
                           ))
                        ) : (
                          <p className="text-sm text-slate-400 italic">No specific resources found.</p>
                        )}
                     </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Company Based Results */}
      {!loading && mode === 'company' && companyGuide && (
        <div className="space-y-6">
          
          {/* Company Overview Card */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="bg-indigo-600 p-6 text-white">
              <div className="flex items-center gap-3 mb-2">
                <Building className="h-6 w-6" />
                <h3 className="text-2xl font-bold">{companyGuide.companyName} Preparation Guide</h3>
              </div>
              <p className="text-indigo-100 opacity-90">{companyGuide.summary}</p>
            </div>
            
            <div className="p-6 grid md:grid-cols-2 gap-8">
              <div>
                <h4 className="font-bold text-slate-800 mb-3 flex items-center gap-2">
                  <CheckSquare size={18} className="text-emerald-500" /> Key Skills Required
                </h4>
                <div className="flex flex-wrap gap-2">
                  {companyGuide.keySkills.map((skill, idx) => (
                    <span key={idx} className="bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full text-sm font-medium border border-emerald-100">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-bold text-slate-800 mb-3 flex items-center gap-2">
                  <List size={18} className="text-blue-500" /> Interview Process
                </h4>
                <ul className="space-y-2">
                  {companyGuide.interviewProcess.map((round, idx) => (
                    <li key={idx} className="flex items-center gap-2 text-sm text-slate-600">
                      <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold flex-shrink-0">
                        {idx + 1}
                      </span>
                      {round}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          <h3 className="font-bold text-xl text-slate-800 mt-8">Preparation Timeline</h3>
          <div className="grid gap-6">
            {companyGuide.roadmap.map((item, idx) => (
              <div key={idx} className="bg-white rounded-xl p-6 border-l-4 border-indigo-500 shadow-sm relative">
                <div className="flex items-center gap-4 mb-4">
                   <div className="bg-slate-100 px-3 py-1 rounded text-sm font-bold text-slate-700">
                     Year {item.year} - {item.term}
                   </div>
                   <div className="flex items-center gap-2 text-indigo-600 text-sm font-medium">
                     <Target size={16} />
                     Focus: {item.focusArea}
                   </div>
                </div>
                
                <ul className="space-y-3">
                  {item.actionItems.map((action, i) => (
                    <li key={i} className="flex items-start gap-3 text-slate-600">
                      <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-indigo-400 flex-shrink-0" />
                      <span>{action}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};