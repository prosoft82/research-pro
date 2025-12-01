
import React, { useState } from 'react';
import { generateAIResponse } from '../services/geminiService';
import { getAllReferences, getAllNotes } from '../services/mockDb';
import { Search, Loader2, FileText, BookOpen, X, Sparkles, BrainCircuit } from 'lucide-react';

interface Props {
  onClose: () => void;
  lang: 'fa' | 'en';
}

const SemanticSearchModal: React.FC<Props> = ({ onClose, lang }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
      if(!query) return;
      setLoading(true);

      // Prepare data for AI
      // Limit corpus size to avoid token limits in this demo
      const refs = getAllReferences().slice(0, 15).map(r => ({ id: r.id, type: 'ref', title: r.title, content: r.abstract || r.title }));
      const notes = getAllNotes().slice(0, 15).map(n => ({ id: n.id, type: 'note', title: n.title, content: n.content }));
      const corpus = [...refs, ...notes];

      const context = JSON.stringify(corpus);
      
      try {
        const responseText = await generateAIResponse(
            query,
            context,
            'semantic_search'
        );
        
        let matchedIds: string[] = [];
        try {
            // Attempt to clean markdown if present
            const cleanJson = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
            matchedIds = JSON.parse(cleanJson);
        } catch (e) {
            console.error("Failed to parse AI search results", responseText);
        }

        const filtered = corpus.filter(item => matchedIds.includes(item.id));
        setResults(filtered);
      } catch (e) {
          console.error(e);
      } finally {
          setLoading(false);
      }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-start justify-center pt-20 p-4 animate-in fade-in duration-200">
        <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden flex flex-col max-h-[80vh]">
            <div className="p-4 border-b dark:border-slate-800 flex gap-3 items-center">
                <BrainCircuit className="text-indigo-500" size={24} />
                <input 
                    autoFocus
                    value={query}
                    onChange={e => setQuery(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleSearch()}
                    placeholder={lang === 'fa' ? 'هر چه می‌خواهید بپرسید (جستجوی معنایی)...' : 'Ask anything (Semantic Search)...'}
                    className="flex-1 text-lg bg-transparent outline-none text-slate-800 dark:text-white placeholder-slate-400"
                />
                <button onClick={onClose}><X className="text-slate-400 hover:text-slate-600" /></button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-2 bg-slate-50 dark:bg-slate-950/50 min-h-[300px]">
                {loading ? (
                    <div className="flex flex-col items-center justify-center h-full text-slate-400 gap-3">
                        <Loader2 className="animate-spin" size={32} />
                        <span className="text-sm">Finding conceptual matches...</span>
                    </div>
                ) : results.length > 0 ? (
                    <div className="space-y-2">
                        <div className="px-2 py-1 text-xs font-bold text-slate-400 uppercase flex items-center gap-1">
                            <Sparkles size={10} /> AI Matches
                        </div>
                        {results.map(item => (
                            <div key={item.id} className="p-3 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 hover:border-indigo-400 cursor-pointer transition flex items-start gap-3">
                                <div className="mt-1 text-slate-400">
                                    {item.type === 'ref' ? <BookOpen size={18}/> : <FileText size={18}/>}
                                </div>
                                <div>
                                    <div className="font-semibold text-slate-800 dark:text-slate-200 text-sm">{item.title}</div>
                                    <div className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mt-1 opacity-80">{item.content}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center h-full text-slate-400 opacity-50">
                        <Search size={48} className="mb-2"/>
                        <p>{query ? 'No semantic matches found.' : 'Search across all your knowledge base.'}</p>
                    </div>
                )}
            </div>
            
            <div className="p-2 bg-white dark:bg-slate-900 border-t dark:border-slate-800 text-xs text-slate-400 flex justify-between px-4">
                <span>Powered by Gemini 2.5 Embeddings</span>
                <span>Press Enter to search</span>
            </div>
        </div>
    </div>
  );
};

export default SemanticSearchModal;
