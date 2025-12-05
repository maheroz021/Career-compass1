

import React, { useState } from 'react';
import { MOCK_STUDENT } from '../services/mockData';
import { getJobMatches } from '../services/geminiService';
import { JobMatch } from '../types';
import { Briefcase, Loader2, Award, Building2, Code2, BookOpen, ExternalLink } from 'lucide-react';

export const JobMatcher: React.FC = () => {
  const [matches, setMatches] = useState<JobMatch[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const handleMatch = async () => {
    setLoading(true);
    setHasSearched(true);
    const result = await getJobMatches(MOCK_STUDENT.projects || []);
    setMatches(result);
    setLoading(false);
  };

  return (
    <div className="space-y-8">
      <div className="bg-slate-900 text-white rounded-2xl p-8 shadow-xl relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <h2 className="text-3xl font-bold mb-4">Project-Based Job Matcher</h2>
          <p className="text-slate-300 mb-8 text-lg">
            Don't just apply blindly. Let our AI analyze your projects and tech stack to find roles where you'll naturally excel.
          </p>
          <button
            onClick={handleMatch}
            disabled={loading}
            className="bg-indigo-500 hover:bg-indigo-600 text-white px-8 py-3 rounded-xl font-bold transition-all transform active:scale-95 disabled:opacity-50 flex items-center gap-2"
          >
            {loading ? <Loader2 className="animate-spin" /> : <Briefcase size={20} />}
            Find My Matches
          </button>
        </div>
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-indigo-600/10 skew-x-12 transform translate-x-12" />
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1">
          <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
            <Code2 className="text-indigo-600" /> Your Portfolio
          </h3>
          <div className="space-y-4">
            {MOCK_STUDENT.projects?.map((proj, idx) => (
              <div key={idx} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                <h4 className="font-semibold text-slate-800 mb-1">{proj.title}</h4>
                <p className="text-xs text-slate-500 mb-2 line-clamp-2">{proj.desc}</p>
                <div className="flex flex-wrap gap-1">
                  {proj.tech.split(',').map((t, i) => (
                    <span key={i} className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
                      {t.trim()}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="md:col-span-2">
          <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
            <Award className="text-indigo-600" /> AI Recommended Roles
          </h3>
          
          {loading && (
            <div className="h-48 flex items-center justify-center bg-white rounded-xl border border-slate-100 border-dashed">
              <Loader2 className="animate-spin text-indigo-600 h-8 w-8" />
            </div>
          )}

          {!loading && !hasSearched && (
            <div className="h-48 flex flex-col items-center justify-center bg-white rounded-xl border border-slate-100 border-dashed text-slate-400">
              <Briefcase className="h-12 w-12 mb-2 opacity-20" />
              <p>Click "Find My Matches" to see results</p>
            </div>
          )}

          {!loading && hasSearched && matches.map((match, idx) => (
             <div key={idx} className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 mb-4 relative overflow-hidden group hover:border-indigo-300 transition-colors">
               <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                 <Briefcase size={80} />
               </div>
               
               <div className="flex justify-between items-start mb-2">
                 <h4 className="text-xl font-bold text-slate-800">{match.jobTitle}</h4>
                 <div className="bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full text-sm font-bold border border-emerald-100">
                   {match.matchScore}% Match
                 </div>
               </div>
               
               <p className="text-slate-600 mb-4 text-sm leading-relaxed">{match.reason}</p>
               
               <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                 <div>
                   <div className="flex items-center gap-2 mb-2">
                     <Building2 size={14} className="text-slate-400" />
                     <span className="text-xs font-semibold text-slate-400 uppercase">Target Companies</span>
                   </div>
                   <div className="flex flex-wrap gap-2">
                     {match.recommendedCompanies.map((co, cIdx) => (
                       <span key={cIdx} className="text-xs bg-slate-100 text-slate-700 px-2 py-1 rounded font-medium border border-slate-200">
                         {co}
                       </span>
                     ))}
                   </div>
                 </div>

                 <div>
                    <div className="flex items-center gap-2 mb-2">
                       <BookOpen size={14} className="text-slate-400" />
                       <span className="text-xs font-semibold text-slate-400 uppercase">Recommended Prep</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {match.recommendedCourses?.map((course, cIdx) => (
                        <a 
                          key={cIdx}
                          href={`https://www.google.com/search?q=${encodeURIComponent(course)}`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-xs flex items-center gap-1 text-indigo-700 bg-indigo-50 px-2 py-1 rounded hover:bg-indigo-100 border border-indigo-100 hover:shadow-sm transition-all"
                        >
                          {course}
                          <ExternalLink size={10} />
                        </a>
                      ))}
                    </div>
                 </div>
               </div>
             </div>
          ))}
        </div>
      </div>
    </div>
  );
};