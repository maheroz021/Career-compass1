
import React, { useState } from 'react';
import { Play, Send, Loader2, CheckCircle2, Mic } from 'lucide-react';
import { generateInterviewQuestions, evaluateInterviewAnswer } from '../services/geminiService';
import { InterviewQuestion, InterviewFeedback } from '../types';

export const MockInterview: React.FC = () => {
  const [role, setRole] = useState('');
  const [isStarted, setIsStarted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [questions, setQuestions] = useState<InterviewQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answer, setAnswer] = useState('');
  const [feedback, setFeedback] = useState<InterviewFeedback | null>(null);
  const [evaluating, setEvaluating] = useState(false);

  const startInterview = async () => {
    if (!role.trim()) return;
    setLoading(true);
    const generatedQuestions = await generateInterviewQuestions(role);
    setQuestions(generatedQuestions);
    setLoading(false);
    setIsStarted(true);
    setCurrentQuestionIndex(0);
    setFeedback(null);
    setAnswer('');
  };

  const handleSubmitAnswer = async () => {
    if (!answer.trim()) return;
    setEvaluating(true);
    const currentQ = questions[currentQuestionIndex];
    const result = await evaluateInterviewAnswer(currentQ.question, answer);
    setFeedback(result);
    setEvaluating(false);
  };

  const nextQuestion = () => {
    setCurrentQuestionIndex(prev => prev + 1);
    setAnswer('');
    setFeedback(null);
  };

  const resetInterview = () => {
    setIsStarted(false);
    setQuestions([]);
    setFeedback(null);
    setAnswer('');
  };

  if (!isStarted) {
    return (
      <div className="max-w-2xl mx-auto py-12">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 text-center">
          <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Mic className="h-8 w-8 text-indigo-600" />
          </div>
          <h2 className="text-3xl font-bold text-slate-900 mb-3">AI Mock Interview</h2>
          <p className="text-slate-500 mb-8 max-w-lg mx-auto">
            Practice makes perfect. Select a role, and our AI will conduct a mock interview with real-time feedback on your answers.
          </p>
          
          <div className="flex gap-3 max-w-md mx-auto">
            <input 
              type="text" 
              value={role}
              onChange={(e) => setRole(e.target.value)}
              placeholder="Target Role (e.g., Data Analyst)"
              className="flex-1 p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
            />
            <button 
              onClick={startInterview}
              disabled={loading || !role.trim()}
              className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-2 transition-colors"
            >
              {loading ? <Loader2 className="animate-spin h-5 w-5" /> : 'Start'}
              {!loading && <Play size={16} fill="currentColor" />}
            </button>
          </div>
        </div>
      </div>
    );
  }

  const currentQ = questions[currentQuestionIndex];
  const isFinished = currentQuestionIndex >= questions.length;

  if (isFinished) {
    return (
      <div className="max-w-2xl mx-auto py-12 text-center">
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
          <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="h-8 w-8 text-emerald-600" />
          </div>
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Interview Completed!</h2>
          <p className="text-slate-500 mb-6">Great job practicing. Review your feedback and try again to improve your score.</p>
          <button 
            onClick={resetInterview}
            className="text-indigo-600 font-semibold hover:bg-indigo-50 px-6 py-2 rounded-lg transition-colors"
          >
            Start New Session
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between text-sm text-slate-500 mb-2">
        <span>Role: <strong className="text-slate-800">{role}</strong></span>
        <span>Question {currentQuestionIndex + 1} of {questions.length}</span>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <span className="inline-block px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-xs font-semibold mb-3">
          {currentQ.topic}
        </span>
        <h3 className="text-xl font-bold text-slate-800 mb-6 leading-relaxed">
          {currentQ.question}
        </h3>

        {!feedback ? (
          <div className="space-y-4">
            <textarea
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder="Type your answer here..."
              className="w-full h-40 p-4 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none resize-none text-slate-700"
            />
            <div className="flex justify-end">
              <button 
                onClick={handleSubmitAnswer}
                disabled={evaluating || !answer.trim()}
                className="bg-indigo-600 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-2"
              >
                {evaluating ? <Loader2 className="animate-spin h-4 w-4" /> : 'Submit Answer'}
                {!evaluating && <Send size={16} />}
              </button>
            </div>
          </div>
        ) : (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className={`p-4 rounded-xl border mb-6 ${
              feedback.score >= 7 ? 'bg-emerald-50 border-emerald-100' : 'bg-amber-50 border-amber-100'
            }`}>
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold text-slate-700">AI Feedback</span>
                <span className={`font-bold text-lg ${
                  feedback.score >= 7 ? 'text-emerald-700' : 'text-amber-700'
                }`}>
                  Score: {feedback.score}/10
                </span>
              </div>
              <p className="text-slate-700 mb-3 text-sm">{feedback.feedback}</p>
              <div className="flex gap-2 items-start">
                <div className="bg-white p-1 rounded-full mt-0.5 shadow-sm">
                  <CheckCircle2 size={12} className="text-indigo-600" />
                </div>
                <p className="text-xs text-slate-500 font-medium pt-0.5">
                  <span className="uppercase text-indigo-600 font-bold">Tip: </span> 
                  {feedback.improvementTip}
                </p>
              </div>
            </div>
            
            <div className="flex justify-end">
              <button 
                onClick={nextQuestion}
                className="bg-slate-900 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-slate-800 flex items-center gap-2"
              >
                Next Question
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
