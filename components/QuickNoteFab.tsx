
import React, { useState } from 'react';
import { PenTool, X, Save, Loader2, Sparkles } from 'lucide-react';
import { generateAIResponse } from '../services/geminiService';
import { saveNote } from '../services/mockDb';
import { Note } from '../types';

interface Props {
  lang: 'fa' | 'en';
}

const QuickNoteFab: React.FC<Props> = ({ lang }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [content, setContent] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (!content.trim()) return;
    setIsSaving(true);
    
    // Auto Tagging via AI
    let tags: string[] = [];
    try {
        const res = await generateAIResponse(content, '', 'tagging');
        tags = JSON.parse(res);
        if (!Array.isArray(tags)) tags = ['QuickNote'];
    } catch (e) {
        tags = ['QuickNote'];
    }

    const newNote: Note = {
        id: Date.now().toString(),
        projectId: 'general', // Default bucket
        title: content.split('\n')[0].substring(0, 30) + '...',
        content: content,
        tags: tags,
        updatedAt: new Date().toISOString()
    };
    
    saveNote(newNote);
    
    setIsSaving(false);
    setContent('');
    setIsOpen(false);
    
    // Optional: Toast notification here
  };

  return (
    <>
      {/* FAB Button */}
      <button 
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full shadow-lg shadow-indigo-500/40 flex items-center justify-center transition-transform hover:scale-105 z-40"
        title={lang === 'fa' ? 'یادداشت سریع' : 'Quick Note'}
      >
        <PenTool size={24} />
      </button>

      {/* Modal */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-[2px] z-50 flex items-end sm:items-center justify-center sm:justify-end p-4 sm:p-6 animate-in fade-in duration-200">
           <div className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-4 flex flex-col gap-3 animate-in slide-in-from-bottom-10">
              <div className="flex justify-between items-center border-b dark:border-slate-800 pb-2">
                 <h3 className="font-bold text-slate-800 dark:text-white flex items-center gap-2">
                    <Sparkles size={16} className="text-yellow-500"/>
                    {lang === 'fa' ? 'یادداشت هوشمند' : 'Smart Capture'}
                 </h3>
                 <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-slate-600"><X size={18}/></button>
              </div>
              
              <textarea 
                autoFocus
                className="w-full h-32 bg-slate-50 dark:bg-slate-950/50 rounded-lg p-3 outline-none text-slate-800 dark:text-slate-200 resize-none border border-transparent focus:border-indigo-500 transition text-sm"
                placeholder={lang === 'fa' ? 'چه فکری در سر دارید؟...' : 'Capture idea...'}
                value={content}
                onChange={e => setContent(e.target.value)}
              />

              <div className="flex justify-between items-center text-xs text-slate-400">
                 <span>AI will auto-tag this note</span>
                 <button 
                    onClick={handleSave}
                    disabled={isSaving || !content}
                    className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition flex items-center gap-2 font-medium"
                 >
                    {isSaving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                    {lang === 'fa' ? 'ذخیره' : 'Save'}
                 </button>
              </div>
           </div>
        </div>
      )}
    </>
  );
};

export default QuickNoteFab;
