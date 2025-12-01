import React, { useEffect, useState } from 'react';
import { Project, User } from '../types';
import { Clock, Folder, CheckCircle, TrendingUp, Plus, ArrowUpRight, Zap } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

interface Props {
  user: User;
  projects: Project[];
  lang: 'fa' | 'en';
  onCreateProject: () => void;
  onSelectProject: (id: string) => void;
}

const Dashboard: React.FC<Props> = ({ user, projects, lang, onCreateProject, onSelectProject }) => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsMounted(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const stats = [
    { label: lang === 'fa' ? 'پروژه‌های فعال' : 'Active Projects', value: projects.length, icon: Folder, color: 'text-indigo-600', bg: 'bg-indigo-50 dark:bg-indigo-500/10', border: 'border-indigo-100 dark:border-indigo-500/20' },
    { label: lang === 'fa' ? 'نزدیک ددلاین' : 'Upcoming Deadlines', value: 2, icon: Clock, color: 'text-orange-600', bg: 'bg-orange-50 dark:bg-orange-500/10', border: 'border-orange-100 dark:border-orange-500/20' },
    { label: lang === 'fa' ? 'وظایف تکمیل شده' : 'Tasks Completed', value: 14, icon: CheckCircle, color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-500/10', border: 'border-emerald-100 dark:border-emerald-500/20' },
    { label: lang === 'fa' ? 'بازدهی' : 'Productivity', value: '+24%', icon: TrendingUp, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-500/10', border: 'border-blue-100 dark:border-blue-500/20' },
  ];

  const chartData = projects.map(p => ({
    name: p.title.length > 15 ? p.title.substring(0, 15) + '...' : p.title,
    progress: p.progress,
    tasks: Math.floor(Math.random() * 20)
  }));

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10">
      
      {/* Welcome Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 bg-gradient-to-r from-indigo-500 to-violet-600 p-8 rounded-3xl text-white shadow-xl shadow-indigo-500/20 relative overflow-hidden group">
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2 text-indigo-100 font-bold uppercase tracking-wider text-xs">
              <Zap size={14} fill="currentColor" /> Daily Insight
          </div>
          <h1 className="text-4xl font-black mb-2 tracking-tight">
            {lang === 'fa' ? `سلام، ${user.name}` : `Welcome back, ${user.name}`}
          </h1>
          <p className="text-indigo-100 font-medium max-w-lg leading-relaxed opacity-90">
            {lang === 'fa' ? 'امروز روز خوبی برای پیشرفت در تحقیقات است.' : 'Ready to make some breakthroughs today? Your research is waiting.'}
          </p>
        </div>
        <button 
          onClick={onCreateProject}
          className="relative z-10 bg-white text-indigo-600 px-6 py-3.5 rounded-2xl shadow-lg flex items-center justify-center gap-2 transition-all hover:scale-105 active:scale-95 font-bold whitespace-nowrap"
        >
          <Plus size={20} strokeWidth={3} />
          {lang === 'fa' ? 'پروژه جدید' : 'New Project'}
        </button>

        {/* Decor */}
        <div className="absolute right-0 top-0 w-64 h-64 bg-white opacity-5 rounded-full blur-3xl -mr-16 -mt-16 group-hover:opacity-10 transition duration-1000"></div>
        <div className="absolute left-0 bottom-0 w-48 h-48 bg-purple-900 opacity-20 rounded-full blur-2xl -ml-10 -mb-10"></div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {stats.map((stat, i) => (
          <div key={i} className={`bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-sm border ${stat.border} flex flex-col justify-between hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group`}>
            <div className="flex justify-between items-start mb-4">
                <div className={`p-3.5 rounded-2xl ${stat.bg} ${stat.color} group-hover:scale-110 transition-transform shadow-inner`}>
                    <stat.icon size={24} strokeWidth={2.5} />
                </div>
                <div className="bg-slate-50 dark:bg-slate-700/50 p-1.5 rounded-lg">
                    <ArrowUpRight size={16} className="text-slate-400 group-hover:text-indigo-500 transition" />
                </div>
            </div>
            <div>
              <p className="text-3xl font-black text-slate-800 dark:text-white mb-1">{stat.value}</p>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wide">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Projects List */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-800 p-6 md:p-8 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700/50">
          <div className="flex justify-between items-center mb-8">
              <h2 className="text-xl font-bold text-slate-800 dark:text-white">{lang === 'fa' ? 'پروژه‌های اخیر' : 'Recent Projects'}</h2>
              <button className="text-sm text-indigo-600 font-bold hover:bg-indigo-50 dark:hover:bg-slate-700 px-3 py-1 rounded-lg transition">View All</button>
          </div>
          
          {projects.length === 0 ? (
             <div className="flex flex-col items-center justify-center py-16 text-slate-400 dark:text-slate-500 bg-slate-50 dark:bg-slate-900/30 rounded-3xl border border-dashed border-slate-200 dark:border-slate-700/50">
                <Folder size={48} className="mb-4 opacity-30" />
                <p className="font-medium">{lang === 'fa' ? 'هنوز پروژه‌ای ندارید.' : 'No projects yet. Start your first research.'}</p>
             </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {projects.map(p => (
                <div 
                  key={p.id} 
                  onClick={() => onSelectProject(p.id)}
                  className="group relative bg-slate-50/50 dark:bg-slate-800/50 p-6 rounded-3xl border border-slate-200 dark:border-slate-700 hover:border-indigo-200 dark:hover:border-indigo-800 hover:bg-white dark:hover:bg-slate-800 hover:shadow-xl hover:shadow-indigo-500/5 cursor-pointer transition-all duration-300 overflow-hidden"
                >
                  <div className="flex justify-between items-start mb-4 relative z-10">
                    <div className="w-14 h-14 rounded-2xl bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-black text-2xl shadow-sm group-hover:bg-indigo-600 group-hover:text-white transition-colors duration-300">
                        {p.title.substring(0, 1)}
                    </div>
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${p.status === 'active' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-slate-100 text-slate-600'}`}>
                      {p.status}
                    </span>
                  </div>
                  
                  <div className="relative z-10">
                    <h3 className="font-bold text-lg text-slate-800 dark:text-white mb-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition">{p.title}</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 truncate mb-6 leading-relaxed">{p.description || 'No description provided.'}</p>
                    
                    <div className="flex items-center gap-3">
                        <div className="flex-1 h-2.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full transition-all duration-1000" style={{ width: `${p.progress}%` }}></div>
                        </div>
                        <span className="text-xs font-bold text-slate-600 dark:text-slate-300">{p.progress}%</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Analytics Chart */}
        <div className="bg-white dark:bg-slate-800 p-6 md:p-8 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700/50 flex flex-col h-full">
           <div className="mb-6">
               <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-1">{lang === 'fa' ? 'آمار پیشرفت' : 'Analytics'}</h2>
               <p className="text-sm text-slate-400 font-medium">Tasks completion & activity</p>
           </div>
           
           <div className="flex-1 w-full relative min-h-[250px] bg-slate-50 dark:bg-slate-900/50 rounded-2xl p-4 border border-slate-100 dark:border-slate-700/30">
             {projects.length > 0 && isMounted ? (
               <div className="absolute inset-0 top-4 right-4 left-0 bottom-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }} barSize={24}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(148, 163, 184, 0.2)" />
                      <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} dy={10} />
                      <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                      <Tooltip 
                        cursor={{fill: 'rgba(99, 102, 241, 0.05)', radius: 8}} 
                        contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px -5px rgb(0 0 0 / 0.1)', padding: '12px', background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(4px)' }}
                      />
                      <Bar dataKey="progress" fill="#6366f1" radius={[6, 6, 6, 6]} />
                      <Bar dataKey="tasks" fill="#cbd5e1" radius={[6, 6, 6, 6]} />
                    </BarChart>
                  </ResponsiveContainer>
               </div>
             ) : (
                <div className="flex flex-col items-center justify-center h-full text-slate-300">
                   <div className="w-16 h-16 bg-white dark:bg-slate-800 rounded-full flex items-center justify-center mb-3 shadow-sm">
                     <TrendingUp size={24} />
                   </div>
                   <span className="text-sm font-medium">Not enough data to display</span>
                </div>
             )}
           </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;