
import React, { useState, useEffect } from 'react';
import { Manuscript, Project } from '../types';
import { getManuscript, saveManuscript } from '../services/mockDb';
import { generateAIResponse } from '../services/geminiService';
import { ChevronRight, ChevronLeft, Save, Sparkles, CheckCircle, Loader2 } from 'lucide-react';

interface Props {
  project: Project;
  lang: 'fa' | 'en';
}

const steps = [
    { id: 'topic', title: 'Topic & Title' },
    { id: 'outline', title: 'Outline' },
    { id: 'intro', title: 'Introduction' },
    { id: 'methods', title: 'Methods' },
    { id: 'results', title: 'Results' },
    { id: 'discussion', title: 'Discussion' },
];

const ManuscriptWizard: React.FC<Props> = ({ project, lang }) => {
  const [manuscript, setManuscript] = useState<Manuscript | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [isAIWorking, setIsAIWorking] = useState(false);

  // Editor content for current step
  const [stepContent, setStepContent] = useState('');

  useEffect(() => {
    let m = getManuscript(project.id);
    if (!m) {
        // Initialize new manuscript
        m = {
            id: Date.now().toString(),
            projectId: project.id,
            title: project.title,
            sections: steps.map(s => ({ id: s.id, title: s.title, content: '', status: 'draft' })),
            currentStep: 0,
            updatedAt: new Date().toISOString()
        };
        saveManuscript(m);
    }
    setManuscript(m);
    setCurrentStep(m.currentStep);
    setStepContent(m.sections[m.currentStep].content);
  }, [project.id]);

  const handleSaveStep = () => {
      if(!manuscript) return;
      const updatedSections = [...manuscript.sections];
      updatedSections[currentStep] = {
          ...updatedSections[currentStep],
          content: stepContent,
          status: 'complete'
      };
      const updatedManuscript: Manuscript = {
          ...manuscript,
          sections: updatedSections,
          updatedAt: new Date().toISOString()
      };
      saveManuscript(updatedManuscript);
      setManuscript(updatedManuscript);
  };

  const nextStep = () => {
      handleSaveStep();
      if(manuscript && currentStep < steps.length - 1) {
          const next = currentStep + 1;
          setCurrentStep(next);
          setStepContent(manuscript.sections[next].content);
          
          // Update DB cursor
          const m = { ...manuscript, currentStep: next };
          saveManuscript(m);
          setManuscript(m);
      }
  };

  const prevStep = () => {
    handleSaveStep();
    if(manuscript && currentStep > 0) {
        const prev = currentStep - 1;
        setCurrentStep(prev);
        setStepContent(manuscript.sections[prev].content);
    }
  };

  const getAICoaching = async () => {
      setIsAIWorking(true);
      const sectionName = steps[currentStep].title;
      try {
          const advice = await generateAIResponse(
              `I am writing the ${sectionName} section. Current content: "${stepContent}".`, 
              `Project: ${project.title}. Description: ${project.description}`,
              'manuscript_coach'
          );
          setStepContent(prev => prev + (prev ? '\n\n' : '') + advice);
      } catch(e) { console.error(e); }
      setIsAIWorking(false);
  };

  if(!manuscript) return <div>Loading...</div>;

  return (
    <div className="h-full flex flex-col bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
        {/* Progress Bar */}
        <div className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 p-4">
             <div className="flex items-center justify-between mb-4">
                 <h2 className="font-bold text-lg dark:text-white">{lang === 'fa' ? 'ویزارد مقاله‌نویسی' : 'Manuscript Wizard'}</h2>
                 <span className="text-sm text-slate-500">Step {currentStep + 1} of {steps.length}</span>
             </div>
             <div className="flex gap-1 h-2">
                 {steps.map((s, i) => (
                     <div 
                        key={s.id} 
                        className={`flex-1 rounded-full transition-colors ${i <= currentStep ? 'bg-indigo-600' : 'bg-slate-200 dark:bg-slate-700'}`}
                     />
                 ))}
             </div>
             <div className="mt-2 text-center font-semibold text-indigo-600 dark:text-indigo-400">
                 {steps[currentStep].title}
             </div>
        </div>

        {/* Editor */}
        <div className="flex-1 flex flex-col p-6">
            <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-medium text-slate-500 uppercase tracking-wide">Draft Content</label>
                <button 
                    onClick={getAICoaching}
                    disabled={isAIWorking}
                    className="flex items-center gap-2 text-xs bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 px-3 py-1.5 rounded-full hover:bg-purple-200 transition"
                >
                    {isAIWorking ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
                    {lang === 'fa' ? 'پیشنهاد هوش مصنوعی' : 'AI Suggest'}
                </button>
            </div>
            <textarea 
                className="flex-1 w-full border dark:border-slate-700 rounded-lg p-4 bg-slate-50 dark:bg-slate-900/50 resize-none outline-none focus:ring-2 focus:ring-indigo-500 dark:text-slate-200 font-serif leading-loose"
                placeholder={`Draft your ${steps[currentStep].title} here...`}
                value={stepContent}
                onChange={e => setStepContent(e.target.value)}
            />
        </div>

        {/* Navigation Footer */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-700 flex justify-between bg-white dark:bg-slate-800">
             <button 
                onClick={prevStep}
                disabled={currentStep === 0}
                className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-50 text-slate-600 dark:text-slate-300 transition"
             >
                 <ChevronLeft size={18} /> {lang === 'fa' ? 'قبلی' : 'Previous'}
             </button>
             
             <button 
                onClick={handleSaveStep}
                className="flex items-center gap-2 px-4 py-2 text-slate-500 hover:text-indigo-600 transition"
             >
                 <Save size={18} /> {lang === 'fa' ? 'ذخیره' : 'Save'}
             </button>

             <button 
                onClick={nextStep}
                disabled={currentStep === steps.length - 1}
                className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition shadow-lg shadow-indigo-200 dark:shadow-none"
             >
                 {lang === 'fa' ? 'بعدی' : 'Next'} <ChevronRight size={18} />
             </button>
        </div>
    </div>
  );
};

export default ManuscriptWizard;
