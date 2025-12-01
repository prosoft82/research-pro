import React, { useEffect, useState } from 'react';
import { Project } from '../types';
import { getReferences, getNotes, getTasks } from '../services/mockDb';
import { FileText, Book, CheckSquare, Clock, ArrowRight, Zap, Target, Calendar } from 'lucide-react';

interface Props {
  project: Project;
  lang: 'fa' | 'en';
  onChangeTab: (tab: any) => void;
}

const ProjectOverview: React.FC<Props> = ({ project, lang, onChangeTab }) => {
  const [counts, setCounts] = useState({ refs: 0, notes: 0, tasks: 0 });

  useEffect(() => {
    setCounts({
        refs: getReferences(project.id).length,
        notes: getNotes(project.id).length,
        tasks: getTasks(project.id).length
    });
  }, [project.id]);

  const cards = [
      { id: 'refs', label: lang === 'fa' ? 'منابع' : 'References', count: counts.refs, icon: Book, color: 'text-blue-600', bg: 'bg-blue-100 dark:bg-blue-900/30', border: 'border-blue-200 dark:border-blue-800' },
      { id: 'notebook', label: lang === 'fa' ? 'یادداشت‌ها' : 'Notes', count: counts.notes, icon: FileText, color: 'text-amber-600', bg: 'bg-amber-100 dark:bg-amber-900/30', border: 'border-amber-200 dark:border-amber-800' },
      { id: 'kanban', label: lang === 'fa' ? 'تسک‌ها' : 'Tasks', count: counts.tasks, icon: CheckSquare, color: 'text-emerald-600', bg: 'bg-emerald-100 dark:bg-emerald-900/30', border: 'border-emerald-200 dark:border-emerald-800' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        {/* Hero Header */}
        <div className="bg-white dark:bg-slate-800 p-8 md:p-10 rounded-[40px] shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-700 relative overflow-hidden group">
            <div className="relative z-10">
                <div className="inline-flex items-center gap-2 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-4">
                    <Target size={14} /> Active Research
                </div>
                <h1 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white mb-6 tracking-tight leading-tight max-w-4xl">{project.title}</h1>
                <p className="text-slate-600 dark:text-slate-300 text-lg leading-relaxed max-w-3xl font-medium">{project.description || 'No description added yet. Add a description to guide your AI assistant.'}</p>
                
                <div className="mt-10 flex flex-wrap items-center gap-4 text-sm font-medium">
                    <span className="flex items-center gap-2 bg-slate-50 dark:bg-slate-700/50 px-4 py-2 rounded-full border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300">
                        <Calendar size={16} className="text-slate-400"/> 
                        Started {new Date(project.createdAt).toLocaleDateString()}
                    </span>
                    <span className={`px-4 py-2 rounded-full uppercase tracking-wide text-xs font-bold border ${project.status === 'active' ? 'bg-green-50 border-green-200 text-green-700 dark:bg-green-900/20 dark:border-green-800 dark:text-green-400' : 'bg-slate-100'}`}>
                        {project.status}
                    </span>
                </div>
            </div>
            {/* Abstract bg shapes */}
            <div className="absolute right-0 top-0 w-96 h-96 bg-gradient-to-bl from-indigo-500/10 to-purple-500/10 rounded-full blur-3xl -mr-24 -mt-24 group-hover:scale-110 transition-transform duration-1000"></div>
        </div>

        {/* Quick Stats & Navigation */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {cards.map(card => (
                <div 
                    key={card.id} 
                    onClick={() => onChangeTab(card.id)}
                    className={`bg-white dark:bg-slate-800 p-8 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700 hover:shadow-xl hover:border-indigo-200 dark:hover:border-indigo-800 hover:-translate-y-1 transition-all duration-300 cursor-pointer group relative overflow-hidden`}
                >
                    <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-slate-50 to-transparent dark:from-slate-700/20 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-150"></div>

                    <div className="flex justify-between items-start mb-8 relative z-10">
                        <div className={`p-4 rounded-2xl ${card.bg} ${card.color} group-hover:scale-110 transition-transform shadow-sm`}>
                            <card.icon size={32} />
                        </div>
                        <div className="w-10 h-10 rounded-full bg-slate-50 dark:bg-slate-700/50 flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                            <ArrowRight size={18} />
                        </div>
                    </div>
                    <div className="relative z-10">
                        <span className="text-5xl font-black text-slate-800 dark:text-white tracking-tighter">{card.count}</span>
                        <h3 className="font-bold text-slate-500 dark:text-slate-400 text-sm uppercase tracking-wider mt-1">{card.label}</h3>
                    </div>
                </div>
            ))}
        </div>

        {/* Action Banner */}
        <div className="bg-gradient-to-r from-indigo-600 to-violet-700 rounded-[32px] p-10 text-white shadow-2xl shadow-indigo-500/30 relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8 group">
            <div className="relative z-10">
                <div className="flex items-center gap-2 mb-3 text-indigo-200 font-bold uppercase text-xs tracking-widest">
                    <Zap size={14} fill="currentColor" /> AI Powered Workflow
                </div>
                <h3 className="font-black text-3xl mb-3">{lang === 'fa' ? 'شروع نوشتن مقاله' : 'Draft Your Manuscript'}</h3>
                <p className="text-indigo-100 max-w-xl leading-relaxed font-medium opacity-90">{lang === 'fa' ? 'از ویزارد هوشمند برای نوشتن مقاله استفاده کنید' : 'Use the AI-guided wizard to structure and write your research paper step-by-step. Get real-time suggestions and improvements.'}</p>
            </div>
            <button 
                onClick={() => onChangeTab('manuscript')}
                className="relative z-10 bg-white text-indigo-600 px-10 py-4 rounded-2xl font-bold hover:bg-indigo-50 hover:scale-105 transition-all shadow-xl whitespace-nowrap"
            >
                {lang === 'fa' ? 'شروع کنید' : 'Open Wizard'}
            </button>
            
            {/* Background decoration */}
            <div className="absolute left-0 bottom-0 w-full h-full opacity-10 pointer-events-none mix-blend-overlay">
                 <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full"><path d="M0 100 C 30 20 70 20 100 100 Z" fill="white" /></svg>
            </div>
            <div className="absolute right-10 top-1/2 -translate-y-1/2 w-64 h-64 bg-indigo-400/30 rounded-full blur-3xl group-hover:scale-125 transition duration-700"></div>
        </div>
    </div>
  );
};

export default ProjectOverview;