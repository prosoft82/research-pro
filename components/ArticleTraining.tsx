
import React, { useState } from 'react';
import { generateAIResponse } from '../services/geminiService';
import { 
  BookOpen, ChevronRight, HelpCircle, Loader2, PlayCircle, CheckCircle, 
  GraduationCap, Lightbulb, Target, Search, Database, PenTool, Layout, 
  FileText, Anchor, Sparkles, ChevronLeft, Medal, ArrowRight, Play, Book,
  CheckCircle2, Circle, AlertTriangle, Zap
} from 'lucide-react';

interface Props {
  lang: 'fa' | 'en';
}

const steps = [
  { id: 1, icon: HelpCircle, title: 'پیدایش مسئله', enTitle: 'Problem Identification', desc: 'شناسایی شکاف‌های تحقیقاتی و نیازهای واقعی', duration: '5 min' },
  { id: 2, icon: Target, title: 'انتخاب موضوع', enTitle: 'Topic Selection', desc: 'محدود کردن مسئله به یک موضوع قابل تحقیق', duration: '10 min' },
  { id: 3, icon: PenTool, title: 'انتخاب عنوان', enTitle: 'Title Selection', desc: 'نگارش عنوانی جذاب، مختصر و دقیق', duration: '5 min' },
  { id: 4, icon: FileText, title: 'بیان مسئله', enTitle: 'Problem Statement', desc: 'تبیین شفاف چرایی و چیستی تحقیق', duration: '15 min' },
  { id: 5, icon: Anchor, title: 'کلیدواژه', enTitle: 'Keywords', desc: 'انتخاب واژگان کلیدی برای دیده‌شدن مقاله', duration: '5 min' },
  { id: 6, icon: Search, title: 'پیدا کردن منابع', enTitle: 'Finding Sources', desc: 'استراتژی‌های جستجو در پایگاه‌های داده', duration: '20 min' },
  { id: 7, icon: Database, title: 'دسترسی به منابع', enTitle: 'Primary Sources', desc: 'تکنیک‌های دسترسی به فول‌تکست مقالات معتبر', duration: '10 min' },
  { id: 8, icon: BookOpen, title: 'نوت برداری', enTitle: 'Note Taking', desc: 'روش‌های خلاصه نویسی و فیش برداری موثر', duration: '15 min' },
  { id: 9, icon: Layout, title: 'دسته بندی مطالب', enTitle: 'Categorization', desc: 'سازماندهی یادداشت‌ها بر اساس تم‌های اصلی', duration: '10 min' },
  { id: 10, icon: Layout, title: 'بخش بندی مقاله', enTitle: 'Structure (IMRaD)', desc: 'آشنایی با ساختار استاندارد مقالات علمی', duration: '10 min' },
  { id: 11, icon: PlayCircle, title: 'نوشتن مقدمه', enTitle: 'Introduction', desc: 'هنر نگارش مقدمه‌ای گیرا و منطقی', duration: '20 min' },
  { id: 12, icon: FileText, title: 'نوشتن بدنه مقاله', enTitle: 'Body Paragraphs', desc: 'توسعه استدلال‌ها، روش‌ها و یافته‌ها', duration: '25 min' },
  { id: 13, icon: CheckCircle, title: 'نوشتن نتیجه گیری', enTitle: 'Conclusion', desc: 'جمع‌بندی نهایی و بیان پیشنهادات آتی', duration: '10 min' },
  { id: 14, icon: BookOpen, title: 'نوشتن منابع', enTitle: 'References', desc: 'مدیریت استنادها به روش‌های استاندارد (APA, etc)', duration: '15 min' },
  { id: 15, icon: Anchor, title: 'آدرس دهی در مقاله', enTitle: 'Citation', desc: 'ارجاع‌دهی درون متنی و اخلاق پژوهش', duration: '10 min' },
];

const ArticleTraining: React.FC<Props> = ({ lang }) => {
  const [selectedStep, setSelectedStep] = useState(steps[0]);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [aiAdvice, setAiAdvice] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'concept' | 'examples' | 'mistakes'>('concept');

  const progress = Math.round((completedSteps.length / steps.length) * 100);

  const toggleComplete = (id: number) => {
      if (completedSteps.includes(id)) {
          setCompletedSteps(prev => prev.filter(s => s !== id));
      } else {
          setCompletedSteps(prev => [...prev, id]);
          // Auto advance if not last step
          if (id < steps.length && id === selectedStep.id) {
             // Optional: setTimeout(() => setSelectedStep(steps[id]), 500); 
          }
      }
  };

  const getAITutorHelp = async (mode: 'concept' | 'examples' | 'mistakes') => {
      setActiveTab(mode);
      setLoading(true);
      setAiAdvice(''); // Clear previous advice to show loading state specifically for new content
      
      let prompt = '';
      if (mode === 'concept') {
          prompt = `Explain the concept of "${selectedStep.enTitle}" (${selectedStep.title}) in academic research. What is its purpose? Why is it critical? Provide a concise overview.`;
      } else if (mode === 'examples') {
          prompt = `Provide 3 concrete examples of "${selectedStep.enTitle}" (${selectedStep.title}). Show a "Poor Example" vs a "Good Example" for each case to illustrate the difference.`;
      } else if (mode === 'mistakes') {
          prompt = `List 5 common mistakes students make when doing "${selectedStep.enTitle}" (${selectedStep.title}). Explain why these are mistakes and how to avoid them.`;
      }

      try {
          const res = await generateAIResponse(prompt, '', 'training_coach');
          setAiAdvice(res);
      } catch (error) {
          console.error(error);
      } finally {
          setLoading(false);
      }
  };

  const handleNext = () => {
      const idx = steps.findIndex(s => s.id === selectedStep.id);
      if (idx < steps.length - 1) {
          setSelectedStep(steps[idx + 1]);
          setAiAdvice('');
          setActiveTab('concept');
      }
  };

  const handlePrev = () => {
      const idx = steps.findIndex(s => s.id === selectedStep.id);
      if (idx > 0) {
          setSelectedStep(steps[idx - 1]);
          setAiAdvice('');
          setActiveTab('concept');
      }
  };

  return (
    <div className="h-full flex flex-col md:flex-row gap-6 animate-in fade-in duration-500">
        {/* Sidebar Curriculum */}
        <div className="md:w-80 bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 overflow-hidden flex flex-col shadow-sm shrink-0">
            <div className="p-6 bg-slate-900 dark:bg-slate-950 text-white relative overflow-hidden">
                <div className="relative z-10">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-2 bg-white/10 rounded-xl backdrop-blur-sm">
                            <GraduationCap size={24} className="text-indigo-300" />
                        </div>
                        <div className="text-right">
                             <div className="text-2xl font-black">{progress}%</div>
                             <div className="text-[10px] text-slate-400 uppercase tracking-wider">{lang === 'fa' ? 'پیشرفت دوره' : 'Course Progress'}</div>
                        </div>
                    </div>
                    
                    {/* Progress Bar */}
                    <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden mb-2">
                        <div className="h-full bg-indigo-500 transition-all duration-1000 ease-out" style={{ width: `${progress}%` }}></div>
                    </div>
                    <div className="flex justify-between text-xs text-slate-400 font-medium">
                        <span>0%</span>
                        <span>100%</span>
                    </div>
                </div>
                {/* Decor */}
                <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-indigo-500/20 rounded-full blur-2xl"></div>
            </div>
            
            <div className="overflow-y-auto flex-1 p-2 space-y-1 custom-scrollbar bg-slate-50 dark:bg-slate-900/50">
                {steps.map((step, idx) => {
                    const isCompleted = completedSteps.includes(step.id);
                    const isSelected = selectedStep.id === step.id;
                    
                    return (
                        <button
                            key={step.id}
                            onClick={() => { setSelectedStep(step); setAiAdvice(''); setActiveTab('concept'); }}
                            className={`w-full text-left rtl:text-right p-3 rounded-2xl flex items-center gap-3 transition-all duration-200 border group ${
                                isSelected
                                ? 'bg-white dark:bg-slate-800 border-indigo-200 dark:border-indigo-600 shadow-md z-10' 
                                : 'bg-transparent border-transparent hover:bg-white/60 dark:hover:bg-slate-800/50 hover:border-slate-200 dark:hover:border-slate-700'
                            }`}
                        >
                            <div className={`relative w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 transition-colors ${
                                isCompleted 
                                    ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400' 
                                    : isSelected 
                                        ? 'bg-indigo-600 text-white' 
                                        : 'bg-slate-200 dark:bg-slate-700 text-slate-500'
                            }`}>
                                {isCompleted ? <CheckCircle2 size={16} /> : idx + 1}
                            </div>
                            
                            <div className="flex-1 min-w-0">
                                <h4 className={`font-bold text-sm truncate ${isSelected ? 'text-indigo-700 dark:text-indigo-300' : 'text-slate-700 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white'}`}>
                                    {step.title}
                                </h4>
                                <div className="flex items-center gap-2 mt-0.5">
                                    <span className="text-[10px] text-slate-400 flex items-center gap-1">
                                        <PlayCircle size={8} /> {step.duration}
                                    </span>
                                </div>
                            </div>
                            
                            {isSelected && <ChevronRight size={16} className="text-indigo-500 rtl:rotate-180 animate-in slide-in-from-left-2" />}
                        </button>
                    );
                })}
            </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 flex flex-col bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden relative">
            
            {/* Header Banner */}
            <div className="relative bg-white dark:bg-slate-800 border-b border-slate-100 dark:border-slate-700">
                 <div className="px-8 py-8 relative z-10">
                     <div className="flex items-center justify-between mb-4">
                        <div className="inline-flex items-center gap-2 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                            <selectedStep.icon size={14} />
                            <span>Step {selectedStep.id}</span>
                        </div>
                        <button 
                            onClick={() => toggleComplete(selectedStep.id)}
                            className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold transition border ${
                                completedSteps.includes(selectedStep.id)
                                ? 'bg-green-100 border-green-200 text-green-700 dark:bg-green-900/30 dark:border-green-800 dark:text-green-400'
                                : 'bg-white border-slate-200 text-slate-500 hover:border-green-300 hover:text-green-600'
                            }`}
                        >
                            {completedSteps.includes(selectedStep.id) ? (
                                <><CheckCircle2 size={14} /> Completed</>
                            ) : (
                                <><Circle size={14} /> Mark as Complete</>
                            )}
                        </button>
                     </div>
                     
                     <h1 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white mb-2 tracking-tight">{selectedStep.title}</h1>
                     <h2 className="text-lg text-slate-500 font-medium mb-6 font-mono">{selectedStep.enTitle}</h2>
                     <p className="text-slate-600 dark:text-slate-300 leading-relaxed max-w-3xl">
                         {selectedStep.desc}. {lang === 'fa' 
                            ? `در این مرحله، شما یاد خواهید گرفت که چگونه این بخش را به طور موثر در مقاله خود پیاده‌سازی کنید.`
                            : `In this step, you will learn how to effectively implement this section in your manuscript.`}
                     </p>
                 </div>
                 {/* Header Bg decoration */}
                 <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-slate-100 to-transparent dark:from-slate-700/20 rounded-bl-full -mr-16 -mt-16 pointer-events-none"></div>
            </div>

            {/* Main Content Body */}
            <div className="flex-1 overflow-y-auto custom-scrollbar bg-slate-50/50 dark:bg-slate-900/50">
                <div className="p-8 max-w-5xl mx-auto space-y-8">
                    
                    {/* Learning Modes Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <button 
                            onClick={() => getAITutorHelp('concept')}
                            className={`p-4 rounded-2xl border text-left rtl:text-right transition-all group ${
                                activeTab === 'concept' && aiAdvice
                                ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-500/30'
                                : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-700 hover:shadow-md'
                            }`}
                        >
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${
                                activeTab === 'concept' && aiAdvice ? 'bg-white/20' : 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400'
                            }`}>
                                <Lightbulb size={20} />
                            </div>
                            <h3 className={`font-bold mb-1 ${activeTab === 'concept' && aiAdvice ? 'text-white' : 'text-slate-800 dark:text-white'}`}>{lang === 'fa' ? 'مفهوم اصلی' : 'Core Concept'}</h3>
                            <p className={`text-xs ${activeTab === 'concept' && aiAdvice ? 'text-indigo-100' : 'text-slate-500'}`}>{lang === 'fa' ? 'توضیح کامل چیستی و چرایی' : 'Explain the what and why'}</p>
                        </button>

                        <button 
                            onClick={() => getAITutorHelp('examples')}
                            className={`p-4 rounded-2xl border text-left rtl:text-right transition-all group ${
                                activeTab === 'examples' && aiAdvice
                                ? 'bg-emerald-600 border-emerald-600 text-white shadow-lg shadow-emerald-500/30'
                                : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-emerald-300 dark:hover:border-emerald-700 hover:shadow-md'
                            }`}
                        >
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${
                                activeTab === 'examples' && aiAdvice ? 'bg-white/20' : 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400'
                            }`}>
                                <Zap size={20} />
                            </div>
                            <h3 className={`font-bold mb-1 ${activeTab === 'examples' && aiAdvice ? 'text-white' : 'text-slate-800 dark:text-white'}`}>{lang === 'fa' ? 'مثال‌ها' : 'Real Examples'}</h3>
                            <p className={`text-xs ${activeTab === 'examples' && aiAdvice ? 'text-emerald-100' : 'text-slate-500'}`}>{lang === 'fa' ? 'نمونه‌های خوب و بد' : 'See good vs bad cases'}</p>
                        </button>

                        <button 
                            onClick={() => getAITutorHelp('mistakes')}
                            className={`p-4 rounded-2xl border text-left rtl:text-right transition-all group ${
                                activeTab === 'mistakes' && aiAdvice
                                ? 'bg-orange-500 border-orange-500 text-white shadow-lg shadow-orange-500/30'
                                : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-orange-300 dark:hover:border-orange-700 hover:shadow-md'
                            }`}
                        >
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${
                                activeTab === 'mistakes' && aiAdvice ? 'bg-white/20' : 'bg-orange-50 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400'
                            }`}>
                                <AlertTriangle size={20} />
                            </div>
                            <h3 className={`font-bold mb-1 ${activeTab === 'mistakes' && aiAdvice ? 'text-white' : 'text-slate-800 dark:text-white'}`}>{lang === 'fa' ? 'اشتباهات رایج' : 'Common Pitfalls'}</h3>
                            <p className={`text-xs ${activeTab === 'mistakes' && aiAdvice ? 'text-orange-100' : 'text-slate-500'}`}>{lang === 'fa' ? 'نبایدهای این مرحله' : 'What to avoid'}</p>
                        </button>
                    </div>

                    {/* AI Output Area */}
                    <div className="min-h-[400px]">
                        {loading ? (
                            <div className="flex flex-col items-center justify-center h-64 text-slate-400 bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700">
                                <Loader2 size={32} className="animate-spin text-indigo-500 mb-4" />
                                <p className="font-medium animate-pulse">{lang === 'fa' ? 'مربی هوشمند در حال نوشتن...' : 'AI Mentor is typing...'}</p>
                            </div>
                        ) : aiAdvice ? (
                            <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <div className="p-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 opacity-20"></div>
                                <div className="p-8">
                                    <div className="prose dark:prose-invert prose-indigo max-w-none">
                                        <div className="whitespace-pre-wrap leading-loose font-serif text-lg">
                                            {aiAdvice}
                                        </div>
                                    </div>
                                    
                                    <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-700 flex justify-end">
                                        <button 
                                            onClick={() => setAiAdvice('')} 
                                            className="text-sm font-bold text-slate-400 hover:text-indigo-600 transition"
                                        >
                                            {lang === 'fa' ? 'پاک کردن' : 'Clear Content'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-64 text-slate-400 border-2 border-dashed border-slate-200 dark:border-slate-700/50 rounded-3xl">
                                <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
                                    <Sparkles size={24} className="text-slate-300" />
                                </div>
                                <p className="font-medium">{lang === 'fa' ? 'یک حالت یادگیری را از بالا انتخاب کنید' : 'Select a learning mode above to start'}</p>
                            </div>
                        )}
                    </div>

                </div>
            </div>

            {/* Footer Navigation */}
            <div className="p-4 bg-white dark:bg-slate-800 border-t border-slate-100 dark:border-slate-700 flex justify-between items-center z-10">
                <button 
                    onClick={handlePrev}
                    disabled={selectedStep.id === 1}
                    className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-30 transition"
                >
                    <ChevronLeft size={20} className="rtl:rotate-180" /> {lang === 'fa' ? 'قبلی' : 'Previous'}
                </button>
                
                <div className="hidden md:flex gap-1">
                    {steps.map(s => (
                        <div key={s.id} className={`w-2 h-2 rounded-full ${s.id === selectedStep.id ? 'bg-indigo-600' : completedSteps.includes(s.id) ? 'bg-green-400' : 'bg-slate-200 dark:bg-slate-700'}`} />
                    ))}
                </div>

                <button 
                    onClick={handleNext}
                    disabled={selectedStep.id === steps.length}
                    className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50 transition shadow-lg shadow-indigo-200 dark:shadow-none"
                >
                    {lang === 'fa' ? 'بعدی' : 'Next'} <ChevronRight size={20} className="rtl:rotate-180" />
                </button>
            </div>
        </div>
    </div>
  );
};

export default ArticleTraining;
