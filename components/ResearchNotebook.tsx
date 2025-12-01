import React, { useState, useEffect } from 'react';
import { Note } from '../types';
import { getNotes, saveNote } from '../services/mockDb';
import { generateAIResponse } from '../services/geminiService';
import { Save, Plus, FileText, Bold, Italic, List, Code, PanelLeftClose, PanelLeftOpen, Eye, Edit3, Type, Tag, Sparkles, Loader2, X, MoreVertical } from 'lucide-react';

interface Props {
  projectId: string;
  lang: 'fa' | 'en';
}

const ResearchNotebook: React.FC<Props> = ({ projectId, lang }) => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [activeNoteId, setActiveNoteId] = useState<string | null>(null);
  const [currentTitle, setCurrentTitle] = useState('');
  const [currentContent, setCurrentContent] = useState('');
  const [currentTags, setCurrentTags] = useState<string[]>([]);
  const [newTagInput, setNewTagInput] = useState('');
  
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [isAutoTagging, setIsAutoTagging] = useState(false);

  useEffect(() => {
    const loaded = getNotes(projectId);
    setNotes(loaded);
    if (loaded.length > 0 && !activeNoteId) {
      selectNote(loaded[0]);
    }
  }, [projectId]);

  const selectNote = (note: Note) => {
    setActiveNoteId(note.id);
    setCurrentTitle(note.title);
    setCurrentContent(note.content);
    setCurrentTags(note.tags || []);
    setIsPreviewMode(false);
  };

  const createNewNote = () => {
    const newNote: Note = {
      id: Date.now().toString(),
      projectId,
      title: lang === 'fa' ? 'یادداشت جدید' : 'Untitled Note',
      content: '',
      tags: [],
      updatedAt: new Date().toISOString(),
    };
    saveNote(newNote);
    const updated = getNotes(projectId);
    setNotes(updated);
    selectNote(newNote);
  };

  const handleSave = () => {
    if (!activeNoteId) return;
    const note: Note = {
      id: activeNoteId,
      projectId,
      title: currentTitle,
      content: currentContent,
      tags: currentTags,
      updatedAt: new Date().toISOString()
    };
    saveNote(note);
    setNotes(getNotes(projectId));
  };

  const handleAutoTag = async () => {
      if (!currentContent) return;
      setIsAutoTagging(true);
      try {
          const res = await generateAIResponse(currentContent, '', 'tagging');
          const generatedTags = JSON.parse(res);
          if (Array.isArray(generatedTags)) {
              const uniqueTags = Array.from(new Set([...currentTags, ...generatedTags]));
              setCurrentTags(uniqueTags);
          }
      } catch (e) {
          console.error("Tagging failed", e);
      } finally {
          setIsAutoTagging(false);
      }
  };

  const addTag = () => {
      if (newTagInput.trim()) {
          setCurrentTags([...currentTags, newTagInput.trim()]);
          setNewTagInput('');
      }
  };

  const removeTag = (tag: string) => {
      setCurrentTags(currentTags.filter(t => t !== tag));
  };

  const insertText = (wrapper: string, suffix: string = '') => {
      setCurrentContent(prev => prev + wrapper + (suffix || wrapper));
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-700 flex h-[750px] overflow-hidden transition-all duration-300 relative group/container">
      
      {/* Sidebar List */}
      <div className={`${isSidebarOpen ? 'w-80 opacity-100 translate-x-0' : 'w-0 opacity-0 -translate-x-10'} transition-all duration-500 ease-in-out border-e border-slate-100 dark:border-slate-700 flex flex-col bg-slate-50/80 dark:bg-[#0f172a]/50 backdrop-blur-sm overflow-hidden`}>
        <div className="p-6 flex justify-between items-center shrink-0">
          <span className="font-black text-slate-800 dark:text-white text-lg tracking-tight">{lang === 'fa' ? 'دفترچه' : 'Notebook'}</span>
          <button onClick={createNewNote} className="bg-indigo-600 text-white p-2.5 rounded-xl hover:bg-indigo-700 transition shadow-lg shadow-indigo-500/30 hover:scale-105 active:scale-95" title="New Note">
            <Plus size={18} strokeWidth={3} />
          </button>
        </div>
        
        <div className="overflow-y-auto flex-1 p-4 space-y-3 custom-scrollbar">
          {notes.map(note => (
            <div 
              key={note.id}
              onClick={() => selectNote(note)}
              className={`p-4 rounded-2xl cursor-pointer text-sm transition-all duration-200 group border relative ${
                activeNoteId === note.id 
                  ? 'bg-white dark:bg-slate-800 border-indigo-200 dark:border-indigo-900 shadow-lg shadow-slate-200/50 dark:shadow-none' 
                  : 'border-transparent hover:bg-white/60 dark:hover:bg-slate-800/60 text-slate-600 dark:text-slate-400 hover:shadow-sm'
              }`}
            >
              <div className={`font-bold truncate mb-1.5 text-base ${activeNoteId === note.id ? 'text-indigo-700 dark:text-indigo-400' : 'text-slate-700 dark:text-slate-300'}`}>
                  {note.title}
              </div>
              <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed mb-3">{note.content || 'Start writing...'}</p>
              <div className="flex flex-wrap gap-1.5">
                  {note.tags?.slice(0, 3).map(tag => (
                      <span key={tag} className={`text-[10px] px-2 py-0.5 rounded-md font-bold ${activeNoteId === note.id ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-300' : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400'}`}>
                          #{tag}
                      </span>
                  ))}
              </div>
            </div>
          ))}
          {notes.length === 0 && (
              <div className="flex flex-col items-center justify-center py-20 text-slate-400 text-sm">
                  <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-3">
                      <FileText className="opacity-30" size={24} />
                  </div>
                  No notes yet
              </div>
          )}
        </div>
      </div>

      {/* Editor Area */}
      <div className="flex-1 flex flex-col bg-white dark:bg-slate-800 relative min-w-0">
        
        {/* Top Navigation */}
        <div className="h-20 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between px-8 shrink-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur z-20">
           <div className="flex items-center gap-4">
                <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition">
                    {isSidebarOpen ? <PanelLeftClose size={20} /> : <PanelLeftOpen size={20} />}
                </button>
                <div className="flex items-center gap-2 text-slate-400 text-sm bg-slate-50 dark:bg-slate-900/50 px-3 py-1.5 rounded-lg border border-slate-100 dark:border-slate-700">
                    <span className={`w-2 h-2 rounded-full ${activeNoteId ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]' : 'bg-slate-300'}`}></span>
                    <span className="font-semibold">{activeNoteId ? (isPreviewMode ? 'Reading Mode' : 'Editing Mode') : 'Idle'}</span>
                </div>
           </div>

           <div className="flex items-center gap-3">
               <button onClick={() => setIsPreviewMode(!isPreviewMode)} className={`px-4 py-2 rounded-xl flex items-center gap-2 text-xs font-bold transition border ${isPreviewMode ? 'bg-indigo-50 border-indigo-200 text-indigo-600 dark:bg-indigo-900/30 dark:border-indigo-800 dark:text-indigo-400' : 'border-slate-200 dark:border-slate-700 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-700'}`}>
                   {isPreviewMode ? <Edit3 size={16} /> : <Eye size={16} />}
                   {isPreviewMode ? 'Edit' : 'Preview'}
               </button>
               <button onClick={handleSave} className="bg-slate-900 dark:bg-white dark:text-slate-900 text-white px-6 py-2 rounded-xl text-xs font-bold hover:bg-slate-700 dark:hover:bg-slate-200 transition flex items-center gap-2 shadow-lg shadow-slate-200 dark:shadow-none transform active:scale-95">
                   <Save size={16} /> {lang === 'fa' ? 'ذخیره' : 'Save'}
               </button>
           </div>
        </div>

        {activeNoteId ? (
          <div className="flex-1 overflow-hidden flex flex-col relative group">
            
            {/* Title Input */}
            <div className="px-8 pt-8 pb-4">
                <input 
                    className="w-full text-4xl font-black outline-none bg-transparent text-slate-800 dark:text-white placeholder-slate-300 dark:placeholder-slate-700 tracking-tight"
                    value={currentTitle}
                    onChange={(e) => setCurrentTitle(e.target.value)}
                    placeholder="Untitled Note"
                />
            </div>
            
            {/* Tags Input */}
            <div className="px-8 pb-6 flex flex-wrap items-center gap-2 border-b border-slate-50 dark:border-slate-700/50">
                {currentTags.map(tag => (
                    <span key={tag} className="inline-flex items-center gap-1 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-300 text-xs font-bold px-3 py-1 rounded-lg border border-indigo-100 dark:border-indigo-800 transition hover:bg-indigo-100">
                        #{tag}
                        <button onClick={() => removeTag(tag)} className="hover:text-red-500 ml-1"><X size={12}/></button>
                    </span>
                ))}
                
                <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-900/50 px-3 py-1 rounded-lg border border-slate-100 dark:border-slate-700 focus-within:border-indigo-300 transition">
                    <Tag size={12} className="text-slate-400" />
                    <input 
                        className="text-xs bg-transparent outline-none py-0.5 w-24 text-slate-600 dark:text-slate-400 placeholder-slate-400 font-medium"
                        placeholder="Add tag..."
                        value={newTagInput}
                        onChange={e => setNewTagInput(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && addTag()}
                    />
                </div>

                <button 
                    onClick={handleAutoTag} 
                    disabled={isAutoTagging || !currentContent}
                    className="ml-auto text-xs flex items-center gap-1.5 text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/30 px-3 py-1.5 rounded-full transition disabled:opacity-50 font-bold"
                >
                    {isAutoTagging ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
                    Auto Tag
                </button>
            </div>

            {/* Formatting Toolbar - Floating */}
            {!isPreviewMode && (
                <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-1 p-2 bg-slate-900/90 dark:bg-white/90 backdrop-blur-md rounded-2xl shadow-2xl z-30 transition-all duration-300 opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 scale-95 group-hover:scale-100">
                    <button onClick={() => insertText('**', '**')} className="p-2.5 text-slate-400 dark:text-slate-500 hover:bg-white/10 dark:hover:bg-black/10 rounded-xl hover:text-white dark:hover:text-black transition" title="Bold"><Bold size={18}/></button>
                    <button onClick={() => insertText('*', '*')} className="p-2.5 text-slate-400 dark:text-slate-500 hover:bg-white/10 dark:hover:bg-black/10 rounded-xl hover:text-white dark:hover:text-black transition" title="Italic"><Italic size={18}/></button>
                    <button onClick={() => insertText('## ', '')} className="p-2.5 text-slate-400 dark:text-slate-500 hover:bg-white/10 dark:hover:bg-black/10 rounded-xl hover:text-white dark:hover:text-black transition" title="Heading"><Type size={18}/></button>
                    <div className="w-px h-6 bg-slate-700 dark:bg-slate-300 mx-1"></div>
                    <button onClick={() => insertText('- ', '')} className="p-2.5 text-slate-400 dark:text-slate-500 hover:bg-white/10 dark:hover:bg-black/10 rounded-xl hover:text-white dark:hover:text-black transition" title="List"><List size={18}/></button>
                    <button onClick={() => insertText('```\n', '\n```')} className="p-2.5 text-slate-400 dark:text-slate-500 hover:bg-white/10 dark:hover:bg-black/10 rounded-xl hover:text-white dark:hover:text-black transition" title="Code"><Code size={18}/></button>
                </div>
            )}

            <div className="flex-1 overflow-y-auto px-8 py-6 custom-scrollbar">
                {isPreviewMode ? (
                    <div className="prose dark:prose-invert prose-indigo max-w-3xl mx-auto font-serif leading-loose text-lg">
                        {currentContent.split('\n').map((line, i) => (
                            <p key={i} className="min-h-[1em]">{line}</p>
                        ))}
                    </div>
                ) : (
                    <textarea
                        className="w-full h-full outline-none resize-none font-mono text-base leading-relaxed text-slate-700 dark:text-slate-300 bg-transparent placeholder-slate-300 dark:placeholder-slate-700"
                        value={currentContent}
                        onChange={(e) => setCurrentContent(e.target.value)}
                        placeholder={lang === 'fa' ? 'شروع به نوشتن کنید...' : 'Start writing your thoughts...'}
                        spellCheck={false}
                    />
                )}
            </div>

            <div className="h-10 border-t border-slate-50 dark:border-slate-800 flex items-center justify-between px-8 text-[10px] text-slate-400 bg-slate-50/50 dark:bg-slate-900/30 font-medium">
                <div className="flex gap-4 font-mono">
                    <span>{currentContent.length} chars</span>
                    <span>{currentContent.split(/\s+/).filter(w => w.length > 0).length} words</span>
                </div>
                <div>
                     Last Edited: {new Date().toLocaleTimeString()}
                </div>
            </div>

          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-300 dark:text-slate-600 bg-slate-50/30 dark:bg-slate-900/20">
            <div className="w-24 h-24 bg-white dark:bg-slate-800 rounded-full flex items-center justify-center mb-6 shadow-sm">
                <FileText size={48} strokeWidth={1.5} className="text-slate-200 dark:text-slate-700" />
            </div>
            <p className="text-xl font-bold text-slate-400">{lang === 'fa' ? 'یک یادداشت انتخاب کنید' : 'Select a note to begin'}</p>
            <button onClick={createNewNote} className="mt-4 text-indigo-600 font-bold text-sm hover:underline">Create new note</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResearchNotebook;