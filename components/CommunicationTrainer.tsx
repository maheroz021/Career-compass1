
import React, { useState, useRef, useEffect } from 'react';
import { Send, User, Bot, Languages, MessageCircle, Sparkles, Loader2, Book, Mic } from 'lucide-react';
import { chatWithLanguageTutor } from '../services/geminiService';
import { ChatMessage } from '../types';

export const CommunicationTrainer: React.FC = () => {
  const [nativeLanguage, setNativeLanguage] = useState<string>('Hindi');
  const [selectedTopic, setSelectedTopic] = useState<string>('Self Introduction');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const languages = ['Hindi', 'Kannada', 'Tamil', 'Telugu', 'Malayalam', 'Marathi', 'Bengali', 'Gujarati'];
  const topics = ['Self Introduction', 'Email Writing', 'Small Talk', 'Job Interview', 'Technical Explanation'];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Initial greeting when language or topic changes
  useEffect(() => {
    setMessages([
      {
        id: 'init',
        role: 'model',
        text: `Namaste! I am your English Tutor. I will help you practice "${selectedTopic}" in English. I will explain mistakes in ${nativeLanguage}. Shall we start?`,
        timestamp: new Date()
      }
    ]);
  }, [nativeLanguage, selectedTopic]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    const history = messages.map(m => ({ role: m.role, text: m.text }));
    const responseText = await chatWithLanguageTutor(history, userMsg.text, nativeLanguage, selectedTopic);

    const aiMsg: ChatMessage = {
      id: (Date.now() + 1).toString(),
      role: 'model',
      text: responseText || "Something went wrong. Please try again.",
      timestamp: new Date()
    };

    setMessages(prev => [...prev, aiMsg]);
    setIsLoading(false);
  };

  return (
    <div className="h-[calc(100vh-140px)] flex flex-col md:flex-row gap-6">
      
      {/* Sidebar / Settings */}
      <div className="w-full md:w-80 flex flex-col gap-4">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
           <div className="flex items-center gap-3 mb-6">
             <div className="bg-green-100 p-2 rounded-lg">
               <Languages className="h-6 w-6 text-green-600" />
             </div>
             <div>
               <h2 className="font-bold text-lg text-slate-800">Comm. Lab</h2>
               <p className="text-xs text-slate-500">Bilingual English Tutor</p>
             </div>
           </div>

           <div className="space-y-4">
             <div>
               <label className="block text-xs font-bold text-slate-400 uppercase mb-2">My Native Language</label>
               <select 
                 value={nativeLanguage} 
                 onChange={(e) => setNativeLanguage(e.target.value)}
                 className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
               >
                 {languages.map(lang => (
                   <option key={lang} value={lang}>{lang}</option>
                 ))}
               </select>
             </div>

             <div>
               <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Practice Topic</label>
               <div className="space-y-2">
                 {topics.map(topic => (
                   <button
                     key={topic}
                     onClick={() => setSelectedTopic(topic)}
                     className={`w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition-all flex items-center gap-2 ${
                       selectedTopic === topic 
                         ? 'bg-indigo-600 text-white shadow-md' 
                         : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                     }`}
                   >
                     <Book size={16} className={selectedTopic === topic ? 'text-indigo-200' : 'text-slate-400'} />
                     {topic}
                   </button>
                 ))}
               </div>
             </div>
           </div>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 bg-white rounded-2xl shadow-sm border border-slate-200 flex flex-col overflow-hidden">
        <div className="p-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
          <div className="flex items-center gap-2">
             <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
             <span className="text-sm font-semibold text-slate-700">Tutor ({nativeLanguage} Mode)</span>
          </div>
          <span className="text-xs px-2 py-1 bg-white border border-slate-200 rounded text-slate-500">
            {selectedTopic}
          </span>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/50">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex items-start gap-4 max-w-[85%] ${
                msg.role === 'user' ? 'ml-auto flex-row-reverse' : ''
              }`}
            >
              <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm ${
                msg.role === 'user' ? 'bg-indigo-600' : 'bg-green-600'
              }`}>
                {msg.role === 'user' ? <User size={18} className="text-white" /> : <Bot size={18} className="text-white" />}
              </div>
              <div
                className={`p-4 rounded-2xl text-sm leading-relaxed shadow-sm whitespace-pre-wrap ${
                  msg.role === 'user'
                    ? 'bg-indigo-600 text-white rounded-tr-none'
                    : 'bg-white text-slate-800 border border-slate-200 rounded-tl-none'
                }`}
              >
                {msg.text}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex items-center gap-2 text-slate-400 text-sm ml-14">
              <Loader2 className="animate-spin h-4 w-4" />
              <span>Analyzing grammar...</span>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="p-4 bg-white border-t border-slate-100">
          <div className="flex gap-2 relative">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder={`Type your answer in English...`}
              className="flex-1 p-4 pr-12 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50 outline-none transition-all"
            />
            <button
              onClick={handleSend}
              disabled={isLoading || !input.trim()}
              className="absolute right-2 top-2 bottom-2 aspect-square bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
            >
              <Send size={20} />
            </button>
          </div>
          <p className="text-center text-[10px] text-slate-400 mt-2">
            Tip: You can ask questions in {nativeLanguage} if you get stuck!
          </p>
        </div>
      </div>
    </div>
  );
};
