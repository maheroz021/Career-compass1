
import React, { useState, useEffect } from 'react';
import { Student, RepoFile, PostIdea, Project, ResumeData, Education, Experience, ATSAnalysisResult } from '../types';
import { generateSocialPostIdeas, calculateATSScore } from '../services/geminiService';
import { db } from '../services/db';
import { 
  FileText, Folder, Award, Github, Linkedin, ExternalLink, UserCheck, Loader2, 
  Upload, File, Trash2, Plus, ShieldCheck, ShieldAlert, Share2, Sparkles, 
  Edit2, Save, X, Printer, LayoutTemplate, ScanLine, Briefcase, GraduationCap, Download, Check
} from 'lucide-react';

interface Props {
  student: Student;
}

export const Repository: React.FC<Props> = ({ student }) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'resume' | 'files' | 'brand'>('profile');
  
  // -- PROFILE STATES --
  const [skills, setSkills] = useState(student.skills);
  const [verifyingSkill, setVerifyingSkill] = useState<string | null>(null);
  const [isEditingAcademic, setIsEditingAcademic] = useState(false);
  const [tempCGPA, setTempCGPA] = useState(student.cgpa.toString());
  const [isAddingProject, setIsAddingProject] = useState(false);
  const [newProject, setNewProject] = useState<Project>({ title: '', tech: '', desc: '' });
  const [localProjects, setLocalProjects] = useState<Project[]>(student.projects || []);

  // -- RESUME STATES --
  const [resume, setResume] = useState<ResumeData>({
    fullName: student.name,
    email: student.email || '',
    phone: '',
    linkedin: '',
    summary: 'Motivated computer science student with a strong foundation in web development.',
    education: [{ id: '1', degree: student.branch, institution: 'University of Tech', year: student.batch, score: `${student.cgpa} CGPA` }],
    experience: [],
    skills: student.skills.map(s => s.name),
    projects: student.projects || []
  });
  const [atsResult, setAtsResult] = useState<ATSAnalysisResult | null>(null);
  const [isAnalyzingATS, setIsAnalyzingATS] = useState(false);
  const [targetRole, setTargetRole] = useState(student.targetRole || '');
  const [newSkillInput, setNewSkillInput] = useState('');
  
  // Resume Edit States
  const [editingSection, setEditingSection] = useState<string | null>(null);
  const [newEdu, setNewEdu] = useState<Education>({ id: '', degree: '', institution: '', year: '', score: '' });

  // -- FILES STATES --
  const [files, setFiles] = useState<RepoFile[]>(student.repositoryFiles || []);
  const [isUploading, setIsUploading] = useState(false);

  // -- BRAND STATES --
  const [postIdeas, setPostIdeas] = useState<PostIdea[]>([]);
  const [generatingPosts, setGeneratingPosts] = useState(false);

  useEffect(() => {
    // Sync props to state on load
    setFiles(student.repositoryFiles || []);
    setSkills(student.skills);
    setLocalProjects(student.projects || []);
    
    const savedResume = db.getResume(student.id);
    if (savedResume) {
      setResume(savedResume);
    } else {
      setResume(prev => ({
        ...prev,
        fullName: student.name,
        email: student.email || '',
        skills: student.skills.map(s => s.name),
        projects: student.projects || []
      }));
    }
  }, [student]);

  // --- Handlers ---

  const handleVerifySkill = (skillName: string) => {
    setVerifyingSkill(skillName);
    setTimeout(() => {
      db.verifySkill(student.id, skillName);
      setSkills(prev => prev.map(s => s.name === skillName ? { ...s, verified: true } : s));
      setVerifyingSkill(null);
    }, 1500);
  };

  const saveAcademicChanges = () => {
    const newCGPA = parseFloat(tempCGPA);
    if (!isNaN(newCGPA) && newCGPA >= 0 && newCGPA <= 10) {
      db.updateStudent(student.id, { cgpa: newCGPA });
      setIsEditingAcademic(false);
    }
  };

  const saveNewProject = () => {
    if (!newProject.title) return;
    db.addProject(student.id, newProject);
    setLocalProjects(prev => [...prev, newProject]);
    setResume(prev => ({ ...prev, projects: [...prev.projects, newProject] })); // Auto update resume
    setNewProject({ title: '', tech: '', desc: '' });
    setIsAddingProject(false);
  };

  const handleFileUpload = () => {
    setIsUploading(true);
    setTimeout(() => {
      const newFile: RepoFile = {
        id: Date.now().toString(),
        name: `Document_${files.length + 1}.pdf`,
        type: 'Certification',
        dateAdded: new Date().toISOString().split('T')[0]
      };
      db.addFile(student.id, newFile);
      setFiles(prev => [...prev, newFile]);
      setIsUploading(false);
    }, 1000);
  };

  const handleGeneratePosts = async () => {
    setGeneratingPosts(true);
    const ideas = await generateSocialPostIdeas(localProjects, skills);
    setPostIdeas(ideas);
    setGeneratingPosts(false);
  };

  const handleSaveResume = () => {
    db.saveResume(student.id, resume);
    alert("Resume Draft Saved!");
  };

  const handleAddResumeSkill = () => {
    if (newSkillInput.trim() && !resume.skills.includes(newSkillInput.trim())) {
      setResume(prev => ({ ...prev, skills: [...prev.skills, newSkillInput.trim()] }));
      setNewSkillInput('');
    }
  };

  const handleRemoveResumeSkill = (skill: string) => {
    setResume(prev => ({ ...prev, skills: prev.skills.filter(s => s !== skill) }));
  };

  const handleAddEducation = () => {
    if (newEdu.degree) {
      setResume(prev => ({
        ...prev,
        education: [...prev.education, { ...newEdu, id: Date.now().toString() }]
      }));
      setNewEdu({ id: '', degree: '', institution: '', year: '', score: '' });
      setEditingSection(null);
    }
  };

  const handleRemoveEducation = (id: string) => {
    setResume(prev => ({ ...prev, education: prev.education.filter(e => e.id !== id) }));
  };

  const handleAnalyzeATS = async () => {
    if (!targetRole) {
      alert("Please enter a target role for ATS scanning.");
      return;
    }
    setIsAnalyzingATS(true);
    const result = await calculateATSScore(resume, targetRole);
    setAtsResult(result);
    setIsAnalyzingATS(false);
  };

  const handlePrint = () => {
    window.print();
  };

  // --- Render Sections ---

  const renderProfileTab = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
       {/* Academic Records */}
       <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
           <div className="flex items-center justify-between mb-4">
             <div className="flex items-center gap-2">
               <FileText className="text-indigo-600" size={20} />
               <h3 className="font-bold text-lg text-slate-800">Academic Records</h3>
             </div>
             {!isEditingAcademic ? (
               <button onClick={() => setIsEditingAcademic(true)} className="text-slate-400 hover:text-indigo-600 transition-colors">
                 <Edit2 size={16} />
               </button>
             ) : (
               <div className="flex gap-2">
                 <button onClick={saveAcademicChanges} className="text-emerald-600 hover:bg-emerald-50 p-1 rounded">
                   <Save size={18} />
                 </button>
                 <button onClick={() => setIsEditingAcademic(false)} className="text-red-600 hover:bg-red-50 p-1 rounded">
                   <X size={18} />
                 </button>
               </div>
             )}
           </div>
           <div className="space-y-4">
             <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                <span className="text-slate-600">Current CGPA</span>
                {isEditingAcademic ? (
                  <input 
                    type="number" 
                    step="0.1" 
                    max="10"
                    value={tempCGPA}
                    onChange={(e) => setTempCGPA(e.target.value)}
                    className="w-20 p-1 text-right border border-indigo-300 rounded focus:ring-2 focus:ring-indigo-50 outline-none font-bold text-slate-900"
                  />
                ) : (
                  <span className="font-bold text-slate-900">{isEditingAcademic ? tempCGPA : student.cgpa} / 10.0</span>
                )}
             </div>
             <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                <span className="text-slate-600">Batch</span>
                <span className="font-bold text-slate-900">{student.batch}</span>
             </div>
             <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                <span className="text-slate-600">Branch</span>
                <span className="font-bold text-slate-900">{student.branch}</span>
             </div>
           </div>
        </div>

        {/* Projects */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex flex-col">
           <div className="flex items-center justify-between mb-4">
             <div className="flex items-center gap-2">
               <Folder className="text-blue-500" size={20} />
               <h3 className="font-bold text-lg text-slate-800">Projects</h3>
             </div>
             <button onClick={() => setIsAddingProject(true)} className="flex items-center gap-1 text-xs bg-indigo-50 text-indigo-700 px-2 py-1 rounded hover:bg-indigo-100 transition-colors font-medium">
               <Plus size={14} /> Add Project
             </button>
           </div>
           
           {isAddingProject && (
             <div className="mb-4 p-4 border border-indigo-100 bg-indigo-50/30 rounded-lg animate-in fade-in slide-in-from-top-2">
               <div className="space-y-2">
                 <input placeholder="Title" value={newProject.title} onChange={e => setNewProject({...newProject, title: e.target.value})} className="w-full p-2 text-xs border rounded" />
                 <input placeholder="Tech" value={newProject.tech} onChange={e => setNewProject({...newProject, tech: e.target.value})} className="w-full p-2 text-xs border rounded" />
                 <textarea placeholder="Desc" value={newProject.desc} onChange={e => setNewProject({...newProject, desc: e.target.value})} className="w-full p-2 text-xs border rounded" />
                 <div className="flex gap-2 justify-end">
                   <button onClick={() => setIsAddingProject(false)} className="px-2 py-1 text-xs text-slate-500">Cancel</button>
                   <button onClick={saveNewProject} className="px-2 py-1 text-xs bg-indigo-600 text-white rounded">Save</button>
                 </div>
               </div>
             </div>
           )}

           <div className="space-y-3 max-h-[300px] overflow-y-auto">
             {localProjects.map((p, i) => (
               <div key={i} className="border border-slate-100 p-3 rounded-lg hover:border-indigo-200">
                 <h4 className="font-semibold text-sm">{p.title}</h4>
                 <p className="text-xs text-slate-500">{p.desc}</p>
                 <div className="mt-1 flex flex-wrap gap-1">
                   {p.tech.split(',').map((t, ti) => (
                     <span key={ti} className="text-[10px] bg-slate-100 px-1.5 py-0.5 rounded text-slate-500">{t.trim()}</span>
                   ))}
                 </div>
               </div>
             ))}
           </div>
        </div>

        {/* Skills Matrix */}
        <div className="md:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <div className="flex items-center gap-2 mb-4">
            <Award className="text-indigo-600" size={24} />
            <h3 className="font-bold text-lg text-slate-800">Skills Matrix</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {skills.map((skill, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 border border-slate-100 rounded-lg bg-slate-50">
                <div>
                  <h4 className="font-semibold text-slate-800">{skill.name}</h4>
                  <p className="text-xs text-slate-500">{skill.level}</p>
                </div>
                {skill.verified ? (
                  <span className="flex items-center gap-1 text-[10px] font-bold bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full">
                    <ShieldCheck size={12} /> Verified
                  </span>
                ) : (
                  <button 
                    onClick={() => handleVerifySkill(skill.name)}
                    disabled={verifyingSkill === skill.name}
                    className="text-[10px] font-bold bg-white border border-slate-200 text-slate-600 px-2 py-1 rounded-full hover:bg-indigo-50 hover:text-indigo-600 transition-colors flex items-center gap-1"
                  >
                     {verifyingSkill === skill.name ? <Loader2 size={12} className="animate-spin"/> : 'Verify'}
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
    </div>
  );

  const renderResumeTab = () => (
    <div className="flex flex-col md:flex-row gap-6 h-full">
      {/* Resume Editor Sidebar */}
      <div className="w-full md:w-80 flex flex-col gap-4 overflow-y-auto print:hidden">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
            <Edit2 size={16} /> Resume Editor
          </h3>
          
          <div className="space-y-4">
            {/* Contact Info */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase">Contact Info</label>
              <input 
                className="w-full p-2 text-sm border rounded" 
                placeholder="Full Name"
                value={resume.fullName}
                onChange={e => setResume({...resume, fullName: e.target.value})}
              />
              <input 
                className="w-full p-2 text-sm border rounded" 
                placeholder="Email"
                value={resume.email}
                onChange={e => setResume({...resume, email: e.target.value})}
              />
              <input 
                className="w-full p-2 text-sm border rounded" 
                placeholder="Phone"
                value={resume.phone}
                onChange={e => setResume({...resume, phone: e.target.value})}
              />
              <input 
                className="w-full p-2 text-sm border rounded" 
                placeholder="LinkedIn URL"
                value={resume.linkedin}
                onChange={e => setResume({...resume, linkedin: e.target.value})}
              />
            </div>

            {/* Summary */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase">Summary</label>
              <textarea 
                className="w-full p-2 text-sm border rounded h-24" 
                placeholder="Professional summary..."
                value={resume.summary}
                onChange={e => setResume({...resume, summary: e.target.value})}
              />
            </div>

            {/* Skills Edit */}
            <div className="space-y-2">
               <label className="text-xs font-bold text-slate-400 uppercase">Skills</label>
               <div className="flex gap-1 mb-2">
                 <input 
                   className="flex-1 p-2 text-sm border rounded" 
                   placeholder="Add skill..."
                   value={newSkillInput}
                   onChange={e => setNewSkillInput(e.target.value)}
                 />
                 <button onClick={handleAddResumeSkill} className="bg-slate-100 p-2 rounded hover:bg-slate-200"><Plus size={16}/></button>
               </div>
               <div className="flex flex-wrap gap-1">
                 {resume.skills.map((skill, i) => (
                   <span key={i} className="text-xs bg-slate-100 px-2 py-1 rounded flex items-center gap-1 group">
                     {skill}
                     <button onClick={() => handleRemoveResumeSkill(skill)} className="text-slate-400 hover:text-red-500"><X size={10}/></button>
                   </span>
                 ))}
               </div>
            </div>

            {/* Education Edit */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold text-slate-400 uppercase">Education</label>
                <button onClick={() => setEditingSection('education')} className="text-xs text-indigo-600 flex items-center gap-1"><Plus size={12}/> Add</button>
              </div>
              
              {editingSection === 'education' && (
                <div className="p-3 bg-slate-50 rounded border border-slate-200 space-y-2 mb-2">
                  <input placeholder="Degree" className="w-full p-1 text-xs border rounded" value={newEdu.degree} onChange={e => setNewEdu({...newEdu, degree: e.target.value})} />
                  <input placeholder="Institution" className="w-full p-1 text-xs border rounded" value={newEdu.institution} onChange={e => setNewEdu({...newEdu, institution: e.target.value})} />
                  <div className="flex gap-2">
                    <input placeholder="Year" className="w-1/2 p-1 text-xs border rounded" value={newEdu.year} onChange={e => setNewEdu({...newEdu, year: e.target.value})} />
                    <input placeholder="Score" className="w-1/2 p-1 text-xs border rounded" value={newEdu.score} onChange={e => setNewEdu({...newEdu, score: e.target.value})} />
                  </div>
                  <button onClick={handleAddEducation} className="w-full bg-indigo-600 text-white text-xs py-1 rounded">Add</button>
                </div>
              )}

              {resume.education.map((edu) => (
                <div key={edu.id} className="p-2 border rounded bg-slate-50 relative group">
                  <p className="text-xs font-bold">{edu.degree}</p>
                  <p className="text-[10px] text-slate-500">{edu.institution} | {edu.year}</p>
                  <button onClick={() => handleRemoveEducation(edu.id)} className="absolute top-2 right-2 text-slate-400 hover:text-red-500 hidden group-hover:block"><Trash2 size={12}/></button>
                </div>
              ))}
            </div>

          </div>
          
          <div className="mt-4 pt-4 border-t border-slate-100 flex gap-2">
             <button onClick={handleSaveResume} className="flex-1 bg-indigo-600 text-white py-2 rounded-lg text-sm font-bold flex items-center justify-center gap-2 hover:bg-indigo-700">
               <Save size={16} /> Save Draft
             </button>
          </div>
        </div>
      </div>

      {/* Preview & Actions */}
      <div className="flex-1 flex flex-col gap-4 overflow-hidden">
         {/* Actions Bar */}
         <div className="bg-white p-3 rounded-xl border border-slate-200 flex justify-between items-center print:hidden">
            <div className="flex gap-2">
               <input 
                 className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-sm w-48 focus:ring-2 focus:ring-indigo-500 outline-none" 
                 placeholder="Target Role for ATS..."
                 value={targetRole}
                 onChange={e => setTargetRole(e.target.value)}
               />
               <button 
                  onClick={handleAnalyzeATS}
                  disabled={isAnalyzingATS}
                  className="bg-emerald-600 text-white px-3 py-1.5 rounded-lg text-sm font-semibold flex items-center gap-2 hover:bg-emerald-700"
                >
                 {isAnalyzingATS ? <Loader2 size={16} className="animate-spin" /> : <ScanLine size={16} />} 
                 ATS Check
               </button>
            </div>
            <button onClick={handlePrint} className="text-slate-600 hover:text-indigo-600 flex items-center gap-2 font-medium text-sm">
               <Printer size={16} /> Print / PDF
            </button>
         </div>
         
         {/* ATS Score Display */}
         {atsResult && (
           <div className="bg-slate-800 text-white p-4 rounded-xl flex items-center justify-between shadow-lg print:hidden animate-in slide-in-from-top-2">
              <div className="flex items-center gap-4">
                 <div className={`w-12 h-12 rounded-full border-4 flex items-center justify-center font-bold text-lg ${
                   atsResult.score >= 80 ? 'border-emerald-500 text-emerald-400' : 
                   atsResult.score >= 60 ? 'border-yellow-500 text-yellow-400' : 'border-red-500 text-red-400'
                 }`}>
                   {atsResult.score}
                 </div>
                 <div>
                   <h4 className="font-bold">ATS Compatibility: {atsResult.matchStatus}</h4>
                   <p className="text-xs text-slate-300 max-w-md line-clamp-1">{atsResult.summaryFeedback}</p>
                 </div>
              </div>
              <div className="text-right text-xs">
                <p className="text-slate-400">Missing Keywords:</p>
                <div className="flex gap-1 justify-end mt-1">
                  {atsResult.missingKeywords.slice(0, 3).map((k, i) => (
                    <span key={i} className="bg-red-500/20 px-2 py-0.5 rounded text-red-200">{k}</span>
                  ))}
                  {atsResult.missingKeywords.length > 3 && <span className="text-slate-500">+{atsResult.missingKeywords.length - 3}</span>}
                </div>
              </div>
           </div>
         )}

         {/* Resume A4 Preview */}
         <div className="flex-1 overflow-y-auto bg-slate-100 p-4 rounded-xl print:bg-white print:p-0 print:overflow-visible">
            <div className="bg-white shadow-lg mx-auto max-w-[210mm] min-h-[297mm] p-[15mm] print:shadow-none print:w-full text-slate-900" id="resume-preview">
                {/* Resume Header */}
                <div className="border-b-2 border-slate-800 pb-6 mb-6">
                   <h1 className="text-3xl font-bold uppercase tracking-wide text-slate-900 mb-2">{resume.fullName}</h1>
                   <div className="flex flex-wrap gap-4 text-sm text-slate-600">
                      {resume.email && <span>{resume.email}</span>}
                      {resume.phone && <span>• {resume.phone}</span>}
                      {resume.linkedin && <span>• {resume.linkedin}</span>}
                   </div>
                </div>

                {/* Summary */}
                {resume.summary && (
                  <div className="mb-6">
                    <h2 className="text-sm font-bold uppercase tracking-wider text-indigo-800 border-b border-indigo-100 mb-3 pb-1">Professional Summary</h2>
                    <p className="text-sm text-slate-700 leading-relaxed">{resume.summary}</p>
                  </div>
                )}

                {/* Skills */}
                <div className="mb-6">
                   <h2 className="text-sm font-bold uppercase tracking-wider text-indigo-800 border-b border-indigo-100 mb-3 pb-1">Technical Skills</h2>
                   <div className="flex flex-wrap gap-2">
                      {resume.skills.map((s, i) => (
                        <span key={i} className="text-sm text-slate-700 bg-slate-50 px-2 py-1 rounded border border-slate-100">{s}</span>
                      ))}
                   </div>
                </div>

                {/* Experience */}
                {resume.experience.length > 0 && (
                   <div className="mb-6">
                      <h2 className="text-sm font-bold uppercase tracking-wider text-indigo-800 border-b border-indigo-100 mb-3 pb-1">Experience</h2>
                      <div className="space-y-4">
                        {resume.experience.map((exp, i) => (
                           <div key={i}>
                              <div className="flex justify-between items-baseline mb-1">
                                 <h3 className="font-bold text-slate-800">{exp.role}</h3>
                                 <span className="text-sm text-slate-500">{exp.duration}</span>
                              </div>
                              <p className="text-sm font-semibold text-slate-600 mb-1">{exp.company}</p>
                              <p className="text-sm text-slate-600">{exp.description}</p>
                           </div>
                        ))}
                      </div>
                   </div>
                )}

                {/* Projects */}
                {resume.projects.length > 0 && (
                   <div className="mb-6">
                      <h2 className="text-sm font-bold uppercase tracking-wider text-indigo-800 border-b border-indigo-100 mb-3 pb-1">Projects</h2>
                      <div className="space-y-4">
                        {resume.projects.map((proj, i) => (
                           <div key={i}>
                              <h3 className="font-bold text-slate-800 text-sm">{proj.title}</h3>
                              <p className="text-xs text-indigo-600 mb-1">{proj.tech}</p>
                              <p className="text-sm text-slate-600">{proj.desc}</p>
                           </div>
                        ))}
                      </div>
                   </div>
                )}

                {/* Education */}
                <div className="mb-6">
                   <h2 className="text-sm font-bold uppercase tracking-wider text-indigo-800 border-b border-indigo-100 mb-3 pb-1">Education</h2>
                   <div className="space-y-3">
                     {resume.education.map((edu, i) => (
                        <div key={i} className="flex justify-between items-start">
                           <div>
                              <h3 className="font-bold text-slate-800 text-sm">{edu.institution}</h3>
                              <p className="text-sm text-slate-600">{edu.degree}</p>
                           </div>
                           <div className="text-right">
                              <p className="text-sm text-slate-500">{edu.year}</p>
                              <p className="text-sm font-semibold text-slate-700">{edu.score}</p>
                           </div>
                        </div>
                     ))}
                   </div>
                </div>
            </div>
         </div>
      </div>
    </div>
  );

  const renderFilesTab = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-indigo-50 p-6 rounded-xl border border-indigo-100">
        <div>
           <h3 className="font-bold text-xl text-indigo-900 mb-1">Digital Locker</h3>
           <p className="text-indigo-700 text-sm">Securely store your certifications, project reports, and other documents.</p>
        </div>
        <button 
          onClick={handleFileUpload}
          disabled={isUploading}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-semibold flex items-center gap-2 hover:bg-indigo-700 transition-colors"
        >
          {isUploading ? <Loader2 className="animate-spin" /> : <Upload size={18} />}
          Upload File
        </button>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        {files.map((file) => (
          <div key={file.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow group relative">
             <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 ${
               file.type === 'Certification' ? 'bg-amber-100 text-amber-600' : 
               file.type === 'Project' ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-600'
             }`}>
               <FileText size={20} />
             </div>
             <h4 className="font-bold text-slate-800 text-sm truncate pr-6">{file.name}</h4>
             <p className="text-xs text-slate-500 mt-1">{file.type} • {file.dateAdded}</p>
             
             <button 
               onClick={() => {
                  db.removeFile(student.id, file.id);
                  setFiles(prev => prev.filter(f => f.id !== file.id));
               }}
               className="absolute top-2 right-2 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all p-1"
             >
               <Trash2 size={14} />
             </button>
          </div>
        ))}
        {files.length === 0 && (
          <div className="col-span-full py-12 text-center text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-200">
            <File className="mx-auto mb-2 opacity-50" size={32} />
            <p>No files uploaded yet.</p>
          </div>
        )}
      </div>
    </div>
  );

  const renderBrandTab = () => (
     <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
           {/* Stats Card */}
           <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              <h3 className="font-bold text-lg text-slate-800 mb-6 flex items-center gap-2">
                <Linkedin className="text-blue-600" /> LinkedIn Activity Tracker
              </h3>
              <div className="flex items-center gap-8">
                 <div className="text-center">
                    <p className="text-3xl font-bold text-slate-800">{student.socialActivity?.postsThisWeek || 0}</p>
                    <p className="text-xs text-slate-500 uppercase font-semibold mt-1">Posts This Week</p>
                 </div>
                 <div className="text-center">
                    <p className="text-3xl font-bold text-slate-400">/{student.socialActivity?.goalPerWeek || 2}</p>
                    <p className="text-xs text-slate-500 uppercase font-semibold mt-1">Weekly Goal</p>
                 </div>
                 <div className="flex-1">
                    {(student.socialActivity?.postsThisWeek || 0) < (student.socialActivity?.goalPerWeek || 2) ? (
                      <div className="bg-amber-50 p-3 rounded-lg border border-amber-100 flex items-start gap-2 text-amber-700 text-sm">
                         <ShieldAlert className="flex-shrink-0 mt-0.5" size={16} />
                         <p>You are behind schedule! Post <strong>{(student.socialActivity?.goalPerWeek || 2) - (student.socialActivity?.postsThisWeek || 0)}</strong> more updates this week to build your brand.</p>
                      </div>
                    ) : (
                      <div className="bg-emerald-50 p-3 rounded-lg border border-emerald-100 flex items-start gap-2 text-emerald-700 text-sm">
                         <ShieldCheck className="flex-shrink-0 mt-0.5" size={16} />
                         <p>Great job! You've met your posting goal this week. Keep it up!</p>
                      </div>
                    )}
                 </div>
              </div>
           </div>

           {/* Post Generator */}
           <div className="bg-gradient-to-br from-indigo-600 to-indigo-800 p-6 rounded-xl text-white shadow-lg">
              <h3 className="font-bold text-lg mb-2 flex items-center gap-2">
                <Sparkles className="text-yellow-300" /> AI Post Generator
              </h3>
              <p className="text-indigo-100 text-sm mb-6">
                Stuck on what to share? Let AI generate professional post drafts based on your recent projects and skills.
              </p>
              <button 
                onClick={handleGeneratePosts}
                disabled={generatingPosts}
                className="w-full bg-white text-indigo-700 font-bold py-3 rounded-lg shadow-md hover:bg-indigo-50 transition-colors flex items-center justify-center gap-2"
              >
                {generatingPosts ? <Loader2 className="animate-spin" /> : 'Generate Ideas'}
              </button>
           </div>
        </div>

        {postIdeas.length > 0 && (
           <div className="space-y-4 animate-in slide-in-from-bottom-4">
             <h3 className="font-bold text-slate-800">Generated Drafts</h3>
             <div className="grid gap-4">
               {postIdeas.map((idea, idx) => (
                 <div key={idx} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:border-indigo-300 transition-colors">
                    <div className="flex justify-between items-start mb-2">
                       <span className="bg-indigo-50 text-indigo-700 text-xs px-2 py-1 rounded font-bold uppercase">{idea.topic}</span>
                       <button className="text-slate-400 hover:text-blue-600" title="Copy to Clipboard">
                         <Share2 size={16} />
                       </button>
                    </div>
                    <p className="text-slate-700 text-sm mb-4 whitespace-pre-line">{idea.content}</p>
                    <div className="flex flex-wrap gap-2">
                      {idea.hashtags.map((tag, tIdx) => (
                        <span key={tIdx} className="text-xs text-blue-500 font-medium">{tag}</span>
                      ))}
                    </div>
                 </div>
               ))}
             </div>
           </div>
        )}
     </div>
  );

  return (
    <div className="h-full flex flex-col">
      {/* Header Tabs */}
      <div className="bg-white border-b border-slate-200 px-6 pt-4 flex gap-6 print:hidden">
        <button 
          onClick={() => setActiveTab('profile')}
          className={`pb-4 text-sm font-semibold flex items-center gap-2 border-b-2 transition-colors ${activeTab === 'profile' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
        >
          <UserCheck size={18} /> Profile Overview
        </button>
        <button 
          onClick={() => setActiveTab('resume')}
          className={`pb-4 text-sm font-semibold flex items-center gap-2 border-b-2 transition-colors ${activeTab === 'resume' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
        >
          <FileText size={18} /> Resume Studio
        </button>
        <button 
          onClick={() => setActiveTab('files')}
          className={`pb-4 text-sm font-semibold flex items-center gap-2 border-b-2 transition-colors ${activeTab === 'files' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
        >
          <Folder size={18} /> Digital Locker
        </button>
        <button 
          onClick={() => setActiveTab('brand')}
          className={`pb-4 text-sm font-semibold flex items-center gap-2 border-b-2 transition-colors ${activeTab === 'brand' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
        >
          <Linkedin size={18} /> Brand Builder
        </button>
      </div>

      {/* Tab Content */}
      <div className="flex-1 p-6 overflow-y-auto">
        {activeTab === 'profile' && renderProfileTab()}
        {activeTab === 'resume' && renderResumeTab()}
        {activeTab === 'files' && renderFilesTab()}
        {activeTab === 'brand' && renderBrandTab()}
      </div>
    </div>
  );
};
