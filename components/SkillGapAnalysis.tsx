

import React, { useState } from 'react';
import { analyzeSkillGap } from '../services/geminiService';
import { Student, SkillGapAnalysisResult } from '../types';
import { Loader2, Zap, AlertTriangle, BookOpen, CheckCircle, ExternalLink } from 'lucide-react';

interface Props {
  student: Student;
}

export const SkillGapAnalysis: React.FC<Props> = ({ student }) => {
  const [targetRole, setTargetRole] = useState(student.targetRole || '');
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<SkillGapAnalysisResult | null>(null);

  const handleAnalyze = async () => {
    if (!targetRole.trim()) return;
    setLoading(true);
    const result = await analyzeSkillGap(student.skills, targetRole);
    setAnalysis(result);
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-indigo-600 to-purple-700 rounded-2xl p-8 text-white shadow-lg">
        <div className="flex items-start justify-between flex-col md:flex-row gap-6">
          <div>
            <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
              <Zap className="text-yellow-300" /> Skill Gap Analyzer
            </h2>
            <p className="text-indigo-100 max-w-xl">
              Compare your current skill set against industry standards for your dream role.
              Get personalized recommendations and course suggestions.
            </p>
          </div>
          <div className="bg-white/10 p-4 rounded-xl backdrop-blur-sm w-full md:w-auto">
            <label className="block text-xs font-semibold uppercase tracking-wider text-indigo-200 mb-2">Target Role</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
                className="bg-white/20 border border-white/30 rounded-lg px-3 py-2 text-white placeholder-indigo-200 focus:outline-none focus:ring-2 focus:ring-white/50 w-full md:w-64"
                placeholder="e.g. Frontend Developer"
              />
              <button
                onClick={handleAnalyze}
                disabled={loading || !targetRole}
                className="bg-white text-indigo-600 px-4 py-2 rounded-lg font-semibold hover:bg-indigo-50 disabled:opacity-50 transition-colors"
              >
                {loading ? <Loader2 className="animate-spin h-5 w-5" /> : 'Analyze'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {analysis && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-1 space-y-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
              <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                <CheckCircle className="text-emerald-500" size={20} /> On Track
              </h3>
              <div className="flex flex-wrap gap-2">
                {analysis.strengthSkills.length > 0 ? (
                  analysis.strengthSkills.map((skill, i) => (
                    <span key={i} className="bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full text-sm font-medium border border-emerald-100">
                      {skill}
                    </span>
                  ))
                ) : (
                  <p className="text-slate-500 text-sm italic">No direct matches found yet.</p>
                )}
              </div>
            </div>
            
            <div className="bg-indigo-50 p-6 rounded-xl border border-indigo-100">
              <h3 className="font-bold text-indigo-900 mb-2">Your Profile</h3>
              <p className="text-sm text-indigo-700 mb-4">
                Analysis based on {student.skills.length} verified skills in your repository.
              </p>
              <div className="text-xs text-indigo-600 font-mono bg-white/50 p-3 rounded-lg">
                {student.skills.map(s => s.name).join(', ')}
              </div>
            </div>
          </div>

          <div className="md:col-span-2">
            <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
              <AlertTriangle className="text-amber-500" /> Missing / Improvement Needed
            </h3>
            <div className="space-y-4">
              {analysis.missingSkills.map((skill, idx) => (
                <div key={idx} className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 flex flex-col gap-4 hover:border-indigo-300 transition-colors">
                  <div className="flex gap-4">
                    <div className={`p-3 rounded-lg flex-shrink-0 h-fit ${
                      skill.priority === 'High' ? 'bg-red-50 text-red-600' :
                      skill.priority === 'Medium' ? 'bg-amber-50 text-amber-600' :
                      'bg-blue-50 text-blue-600'
                    }`}>
                      <AlertTriangle size={24} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-bold text-lg text-slate-800">{skill.name}</h4>
                        <span className={`text-xs font-bold px-2 py-1 rounded uppercase tracking-wide ${
                          skill.priority === 'High' ? 'bg-red-100 text-red-700' :
                          skill.priority === 'Medium' ? 'bg-amber-100 text-amber-700' :
                          'bg-blue-100 text-blue-700'
                        }`}>
                          {skill.priority} Priority
                        </span>
                      </div>
                      <p className="text-slate-600 text-sm mb-3">{skill.reason}</p>
                      
                      <div className="bg-slate-50 p-3 rounded-lg mb-3">
                        <div className="flex gap-2 items-start">
                          <BookOpen className="text-indigo-500 mt-0.5 flex-shrink-0" size={16} />
                          <div>
                            <span className="text-xs font-bold text-indigo-600 uppercase block mb-0.5">Recommendation</span>
                            <p className="text-sm text-slate-700">{skill.recommendation}</p>
                          </div>
                        </div>
                      </div>

                      {skill.courses && skill.courses.length > 0 && (
                         <div className="mt-3">
                            <span className="text-xs font-semibold text-slate-400 uppercase mb-1.5 block">Recommended Courses</span>
                            <div className="flex flex-wrap gap-2">
                              {skill.courses.map((course, cIdx) => (
                                <a 
                                  key={cIdx} 
                                  href={`https://www.google.com/search?q=${encodeURIComponent(course + " course")}`} 
                                  target="_blank" 
                                  rel="noreferrer"
                                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 rounded-full text-xs font-medium text-slate-700 hover:text-indigo-600 hover:border-indigo-200 hover:shadow-sm hover:bg-indigo-50 transition-all"
                                >
                                  {course} <ExternalLink size={10} />
                                </a>
                              ))}
                            </div>
                         </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};