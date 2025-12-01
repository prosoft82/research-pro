
import React, { useState, useEffect } from 'react';
import { User, Project, Language, Theme, Reference } from './types';
import { login, logout, getCurrentUser, getProjects, saveProject } from './services/mockDb';
import Dashboard from './components/Dashboard';
import ReferenceManager from './components/ReferenceManager';
import ResearchNotebook from './components/ResearchNotebook';
import KanbanBoard from './components/KanbanBoard';
import AIAssistant from './components/AIAssistant';
import SmartReader from './components/SmartReader';
import SemanticSearchModal from './components/SemanticSearchModal';
import QuickNoteFab from './components/QuickNoteFab';
import ProjectOverview from './components/ProjectOverview';
import ManuscriptWizard from './components/ManuscriptWizard';
import ArticleTraining from './components/ArticleTraining';
import { LayoutDashboard, BookOpen, LogOut, Globe, Moon, Sun, ArrowRight, Database, FileText, Search, PenTool, Home, Sparkles, ChevronRight, Menu, Layers, GraduationCap, Bot } from 'lucide-react';

// --- Sidebar Component ---
const SidebarItem = ({ icon: Icon, label, active, onClick, collapsed }: any) => (
  <button 
    onClick={onClick}
    className={`group relative w-full flex items-center gap-3 px-3 py-3 rounded-2xl transition-all duration-300 ${
      active 
        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30' 
        : 'text-slate-500 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-800 hover:text-indigo-600 dark:hover:text-indigo-400 hover:shadow-sm'
    }`}
    title={collapsed ? label : ''}
  >
    <Icon size={20} strokeWidth={active ? 2.5 : 2} className="shrink-0 transition-transform group-hover:scale-110" />
    {!collapsed && <span className="font-medium text-sm whitespace-nowrap">{label}</span>}
  </button>
);

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [view, setView] = useState<'dashboard' | 'project'>('dashboard');
  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  const [lang, setLang] = useState<Language>('fa');
  const [theme, setTheme] = useState<Theme>('light');
  const [activeTab, setActiveTab] = useState<'overview' | 'refs' | 'notebook' | 'kanban' | 'manuscript' | 'training'>('overview');
  const [showNewProjectModal, setShowNewProjectModal] = useState(false);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [isAIOpen, setIsAIOpen] = useState(false);
  
  // Reader State
  const [readingRef, setReadingRef] = useState<Reference | null>(null);

  // New Project Form
  const [newProjectTitle, setNewProjectTitle] = useState('');
  const [newProjectDesc, setNewProjectDesc] = useState('');
  const [refreshKey, setRefreshKey] = useState(0); 

  // Hydration
  useEffect(() => {
    const u = getCurrentUser();
    if (u) setUser(u);
    
    document.documentElement.dir = lang === 'fa' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;

    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
       toggleTheme('dark');
    }
  }, [lang]);

  useEffect(() => {
      const handleKeyDown = (e: KeyboardEvent) => {
          if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
              e.preventDefault();
              setShowSearchModal(true);
          }
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const toggleTheme = (forcedTheme?: Theme) => {
    const newTheme = forcedTheme ? forcedTheme : (theme === 'light' ? 'dark' : 'light');
    setTheme(newTheme);
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const handleLogin = async () => {
    const u = await login('researcher@university.edu');
    setUser(u);
  };

  const handleLogout = () => {
    logout();
    setUser(null);
    setView('dashboard');
  };

  const handleCreateProject = () => {
    if(!newProjectTitle) return;
    const p: Project = {
      id: Date.now().toString(),
      title: newProjectTitle,
      description: newProjectDesc,
      status: 'active',
      progress: 0,
      createdAt: new Date().toISOString()
    };
    saveProject(p);
    setShowNewProjectModal(false);
    setNewProjectTitle('');
    setNewProjectDesc('');
    setRefreshKey(prev => prev + 1);
  };

  const handleSelectProject = (id: string) => {
    const projects = getProjects();
    const p = projects.find(proj => proj.id === id);
    if(p) {
        setCurrentProject(p);
        setView('project');
        setActiveTab('overview');
    }
  };

  // --- Auth Screen ---
  if (!user) {
    return (
      <div className="min-h-screen bg-[#f8fafc] dark:bg-[#0f172a] flex flex-col justify-center items-center p-6 relative overflow-hidden">
        {/* Background Blobs */}
        <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-indigo-500/20 rounded-full blur-[100px] -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-purple-500/20 rounded-full blur-[100px] translate-x-1/2 translate-y-1/2"></div>

        <div className="glass-panel p-10 rounded-[32px] shadow-2xl max-w-md w-full text-center relative z-10 animate-in fade-in zoom-in-95 duration-500">
           <div className="w-24 h-24 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl mx-auto mb-8 flex items-center justify-center text-white shadow-xl shadow-indigo-500/30 transform rotate-3 hover:rotate-6 transition duration-300">
             <BookOpen size={44} />
           </div>
           <h1 className="text-4xl font-black text-slate-800 dark:text-white mb-2 tracking-tight">Academia<span className="text-indigo-600">Pro</span></h1>
           <p className="text-slate-500 dark:text-slate-400 mb-10 text-lg">Your Intelligent Research Companion</p>
           
           <button 
             onClick={handleLogin}
             className="w-full group relative bg-slate-900 dark:bg-white text-white dark:text-slate-900 py-4 rounded-xl font-bold hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-3 overflow-hidden"
           >
             <span className="relative z-10">{lang === 'fa' ? 'ورود به حساب کاربری' : 'Enter Dashboard'}</span>
             <ArrowRight size={20} className={`relative z-10 transition-transform group-hover:translate-x-1 ${lang === 'fa' ? 'rotate-180 group-hover:-translate-x-1' : ''}`} />
           </button>
           
           <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-800 flex justify-center gap-8 text-sm font-medium text-slate-500">
             <button className="hover:text-indigo-600 dark:hover:text-indigo-400 flex items-center gap-2 transition" onClick={() => setLang(l => l === 'fa' ? 'en' : 'fa')}>
                <Globe size={18} /> <span>{lang === 'fa' ? 'English' : 'فارسی'}</span>
             </button>
             <button className="hover:text-indigo-600 dark:hover:text-indigo-400 flex items-center gap-2 transition" onClick={() => toggleTheme()}>
                {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
                <span>{theme === 'light' ? 'Dark' : 'Light'}</span>
             </button>
           </div>
        </div>
      </div>
    );
  }

  // --- Main Layout ---
  return (
    <div className="flex h-screen overflow-hidden bg-[#f0f4f8] dark:bg-[#020617] text-slate-900 dark:text-slate-100 font-sans p-2 sm:p-4 gap-4">
      
      {/* Sidebar - Floating */}
      <aside className={`${collapsed ? 'w-20' : 'w-72'} glass-panel rounded-3xl hidden md:flex flex-col justify-between transition-all duration-300 z-30 shadow-xl shadow-slate-200/50 dark:shadow-none`}>
        <div className="p-4 flex flex-col h-full">
          <div className="flex items-center gap-3 mb-8 px-2 mt-4">
             <div onClick={() => {setView('dashboard'); setCurrentProject(null);}} className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-violet-600 text-white rounded-xl flex items-center justify-center shrink-0 shadow-lg shadow-indigo-500/30 cursor-pointer hover:scale-105 transition-transform">
                 <Layers size={22} strokeWidth={2.5} />
             </div>
             {!collapsed && (
                 <div className="flex flex-col cursor-pointer overflow-hidden" onClick={() => {setView('dashboard'); setCurrentProject(null);}}>
                     <span className="font-extrabold text-xl tracking-tight text-slate-800 dark:text-white truncate">Academia<span className="text-indigo-600">Pro</span></span>
                 </div>
             )}
          </div>

          <nav className="space-y-2 flex-1 overflow-y-auto hide-scrollbar px-1">
            <SidebarItem 
              icon={LayoutDashboard} 
              label={lang === 'fa' ? 'داشبورد' : 'Dashboard'} 
              active={view === 'dashboard'} 
              onClick={() => { setView('dashboard'); setCurrentProject(null); }}
              collapsed={collapsed}
            />
            {currentProject && (
              <>
                <div className="my-6 border-t border-slate-200 dark:border-slate-700/50 mx-2"></div>
                {!collapsed && <div className="px-3 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-3 opacity-80">{lang === 'fa' ? 'پروژه' : 'Workspace'}</div>}
                
                <SidebarItem collapsed={collapsed} icon={Home} label={lang === 'fa' ? 'نمای کلی' : 'Overview'} active={activeTab === 'overview'} onClick={() => setActiveTab('overview')} />
                <SidebarItem collapsed={collapsed} icon={Database} label={lang === 'fa' ? 'منابع' : 'References'} active={activeTab === 'refs'} onClick={() => setActiveTab('refs')} />
                <SidebarItem collapsed={collapsed} icon={FileText} label={lang === 'fa' ? 'دفترچه یادداشت' : 'Notebook'} active={activeTab === 'notebook'} onClick={() => setActiveTab('notebook')} />
                <SidebarItem collapsed={collapsed} icon={LayoutDashboard} label={lang === 'fa' ? 'مدیریت کارها' : 'Tasks'} active={activeTab === 'kanban'} onClick={() => setActiveTab('kanban')} />
                <SidebarItem collapsed={collapsed} icon={PenTool} label={lang === 'fa' ? 'مقاله نویس' : 'Manuscript'} active={activeTab === 'manuscript'} onClick={() => setActiveTab('manuscript')} />
                <SidebarItem collapsed={collapsed} icon={GraduationCap} label={lang === 'fa' ? 'آموزش مقاله نویسی' : 'Article Training'} active={activeTab === 'training'} onClick={() => setActiveTab('training')} />
              </>
            )}
          </nav>

          <div className="mt-auto pt-4 border-t border-slate-200 dark:border-slate-700/50">
               <button onClick={handleLogout} className={`flex items-center gap-3 text-slate-500 hover:text-red-500 dark:text-slate-400 dark:hover:text-red-400 transition p-3 w-full rounded-2xl hover:bg-red-50 dark:hover:bg-red-900/10 ${collapsed ? 'justify-center' : ''}`}>
                   <LogOut size={20} />
                   {!collapsed && <span className="font-medium text-sm">{lang === 'fa' ? 'خروج' : 'Sign Out'}</span>}
               </button>
               <button onClick={() => setCollapsed(!collapsed)} className="mt-2 w-full flex items-center justify-center p-2 text-slate-400 hover:text-indigo-600 transition">
                   <Menu size={16} />
               </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-hidden relative h-full flex flex-col glass-panel rounded-3xl shadow-xl shadow-slate-200/50 dark:shadow-none">
        {/* Top Navigation Bar */}
        <header className="sticky top-0 h-20 px-6 flex items-center justify-between border-b border-slate-200/50 dark:border-slate-700/50 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm z-40">
           <div className="flex items-center gap-3 text-slate-500 text-sm">
             {view === 'project' && currentProject ? (
               <div className="flex items-center gap-2 animate-in fade-in slide-in-from-left-4">
                  <span onClick={() => { setView('dashboard'); setCurrentProject(null); }} className="hover:text-indigo-600 dark:hover:text-indigo-400 cursor-pointer transition font-medium">{lang === 'fa' ? 'داشبورد' : 'Dashboard'}</span>
                  <ChevronRight size={14} className="text-slate-300 rtl:rotate-180" />
                  <span className="font-bold text-slate-800 dark:text-white bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full">{currentProject.title}</span>
               </div>
             ) : (
                <div className="font-bold text-slate-800 dark:text-white text-lg">{lang === 'fa' ? 'داشبورد تحقیقاتی' : 'Research Dashboard'}</div>
             )}
           </div>
           
           <div 
                className="flex-1 max-w-lg mx-6 relative group hidden sm:block"
                onClick={() => setShowSearchModal(true)}
            >
               <div className="relative bg-slate-100/80 dark:bg-slate-800/80 rounded-2xl px-4 py-2.5 text-sm text-slate-400 flex items-center gap-3 cursor-text transition-all hover:bg-white dark:hover:bg-slate-700 hover:shadow-md ring-1 ring-transparent hover:ring-indigo-100 dark:hover:ring-indigo-900">
                  <Search size={18} className="text-indigo-500" />
                  <span className="flex-1">{lang === 'fa' ? 'جستجوی هوشمند (Ctrl+K)' : 'Smart Search...'}</span>
                  <div className="flex gap-1">
                      <kbd className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-bold text-slate-500 bg-slate-200 dark:bg-slate-600 rounded-md">Ctrl K</kbd>
                  </div>
               </div>
           </div>

           <div className="flex items-center gap-4">
              <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-full">
                  <button onClick={() => toggleTheme()} className="p-2 rounded-full hover:bg-white dark:hover:bg-slate-700 text-slate-500 hover:text-indigo-600 transition shadow-sm">
                      {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
                  </button>
                  <button onClick={() => setLang(l => l === 'fa' ? 'en' : 'fa')} className="p-2 rounded-full hover:bg-white dark:hover:bg-slate-700 text-slate-500 hover:text-indigo-600 transition shadow-sm">
                      <Globe size={18} />
                  </button>
              </div>
              <div className="flex items-center gap-3 pl-4 border-l border-slate-200 dark:border-slate-700">
                <div className="text-right hidden lg:block">
                    <div className="text-sm font-bold text-slate-800 dark:text-white">{user.name}</div>
                    <div className="text-xs text-slate-500">PhD Researcher</div>
                </div>
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 p-0.5 shadow-md hover:scale-105 transition-transform cursor-pointer">
                    <img src={user.avatar} alt="User" className="w-full h-full rounded-full object-cover border-2 border-white dark:border-slate-900" />
                </div>
              </div>
           </div>
        </header>

        {/* View Content */}
        <div className="flex-1 p-6 md:p-8 overflow-y-auto custom-scrollbar">
          {view === 'dashboard' && (
            <Dashboard 
              key={refreshKey}
              user={user} 
              projects={getProjects()} 
              lang={lang} 
              onCreateProject={() => setShowNewProjectModal(true)}
              onSelectProject={handleSelectProject}
            />
          )}

          {view === 'project' && currentProject && (
            <div className="h-[calc(100vh-8rem)] relative">
              {/* Main Workspace - Full Width */}
              <div className="h-full flex flex-col overflow-hidden">
                <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar pb-20">
                    {activeTab === 'overview' && <ProjectOverview project={currentProject} lang={lang} onChangeTab={setActiveTab} />}
                    {activeTab === 'refs' && <ReferenceManager projectId={currentProject.id} lang={lang} onOpenReader={setReadingRef} />}
                    {activeTab === 'notebook' && <ResearchNotebook projectId={currentProject.id} lang={lang} />}
                    {activeTab === 'kanban' && <KanbanBoard projectId={currentProject.id} lang={lang} />}
                    {activeTab === 'manuscript' && <ManuscriptWizard project={currentProject} lang={lang} />}
                    {activeTab === 'training' && <ArticleTraining lang={lang} />}
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Modals */}
      {readingRef && <SmartReader reference={readingRef} onClose={() => setReadingRef(null)} lang={lang} />}
      {showSearchModal && <SemanticSearchModal onClose={() => setShowSearchModal(false)} lang={lang} />}
      <QuickNoteFab lang={lang} />

      {/* Floating AI Button & Window */}
      {view === 'project' && currentProject && (
        <>
            <button 
                onClick={() => setIsAIOpen(!isAIOpen)}
                className="fixed bottom-6 right-24 w-14 h-14 bg-gradient-to-br from-indigo-600 to-violet-600 hover:scale-110 active:scale-95 text-white rounded-full shadow-xl shadow-indigo-500/30 flex items-center justify-center transition-all z-40 group"
                title={lang === 'fa' ? 'دستیار هوشمند' : 'AI Assistant'}
            >
                <Bot size={28} className="group-hover:rotate-12 transition-transform" />
            </button>
            
            {isAIOpen && (
                <div className="fixed bottom-24 right-6 w-[400px] h-[600px] max-h-[70vh] shadow-2xl z-50 rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-700 animate-in slide-in-from-bottom-10 fade-in duration-300">
                    <AIAssistant 
                        lang={lang} 
                        context={`Project: ${currentProject.title}. Description: ${currentProject.description}. Active Tab: ${activeTab}`} 
                        onClose={() => setIsAIOpen(false)}
                    />
                </div>
            )}
        </>
      )}

      {/* New Project Modal */}
      {showNewProjectModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
           <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-lg p-8 animate-in zoom-in-95 duration-300 border border-slate-200 dark:border-slate-700 shadow-2xl relative overflow-hidden">
             <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-indigo-500 to-purple-500"></div>
             
             <div className="mb-8">
                 <h3 className="text-2xl font-black text-slate-800 dark:text-white flex items-center gap-2 mb-2">
                     <Sparkles className="text-indigo-500" strokeWidth={2.5} />
                     {lang === 'fa' ? 'ایجاد پروژه جدید' : 'Create New Project'}
                 </h3>
                 <p className="text-slate-500 font-medium">{lang === 'fa' ? 'فضای کاری جدید برای تحقیقات شما' : 'Set up a new workspace for your research.'}</p>
             </div>

             <div className="space-y-6">
                 <div>
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">{lang === 'fa' ? 'عنوان پروژه' : 'Project Title'}</label>
                    <input 
                    className="w-full border border-slate-200 dark:border-slate-700 rounded-2xl p-4 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none transition font-medium text-lg" 
                    placeholder="e.g. Neural Networks in Healthcare"
                    value={newProjectTitle}
                    onChange={e => setNewProjectTitle(e.target.value)}
                    autoFocus
                    />
                 </div>
                 <div>
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">{lang === 'fa' ? 'توضیحات (اختیاری)' : 'Description (Optional)'}</label>
                    <textarea 
                    className="w-full border border-slate-200 dark:border-slate-700 rounded-2xl p-4 h-32 resize-none bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none transition" 
                    placeholder="Brief objective..."
                    value={newProjectDesc}
                    onChange={e => setNewProjectDesc(e.target.value)}
                    />
                 </div>
             </div>

             <div className="flex justify-end gap-3 mt-10">
               <button onClick={() => setShowNewProjectModal(false)} className="px-6 py-3 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition font-bold">{lang === 'fa' ? 'انصراف' : 'Cancel'}</button>
               <button onClick={handleCreateProject} className="px-8 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition shadow-lg shadow-indigo-500/30 font-bold transform active:scale-95">{lang === 'fa' ? 'ایجاد پروژه' : 'Create Project'}</button>
             </div>
           </div>
        </div>
      )}

    </div>
  );
}
