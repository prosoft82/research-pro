import React, { useState, useEffect } from 'react';
import { Reference, ReferenceType } from '../types';
import { getReferences, addReference, deleteReference } from '../services/mockDb';
import { fetchPaperMetadata, generateAIResponse } from '../services/geminiService';
import { Plus, Trash2, Book, Globe, FileText, Copy, Upload, Search, Wand2, Loader2, Eye, DownloadCloud, ChevronRight, X, Filter, BookOpen, Layers, RefreshCw } from 'lucide-react';

interface Props {
  projectId: string;
  lang: 'fa' | 'en';
  onOpenReader: (ref: Reference) => void;
}

const ReferenceManager: React.FC<Props> = ({ projectId, lang, onOpenReader }) => {
  const [refs, setRefs] = useState<Reference[]>([]);
  const [activeTab, setActiveTab] = useState<'library' | 'find'>('library');
  const [isLoadingMeta, setIsLoadingMeta] = useState(false);
  
  // Add Manual
  const [isAdding, setIsAdding] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newAuthors, setNewAuthors] = useState('');
  const [newYear, setNewYear] = useState('');
  const [newType, setNewType] = useState<ReferenceType>('journal');
  const [newAbstract, setNewAbstract] = useState('');

  // Find Papers
  const [searchTopic, setSearchTopic] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchType, setSearchType] = useState<'journal' | 'book'>('journal');
  const [searchLangPriority, setSearchLangPriority] = useState<'mixed' | 'en'>('mixed');
  const [hasSearched, setHasSearched] = useState(false);

  // Import
  const [importId, setImportId] = useState('');

  // Selection for Related Work
  const [selectedRefs, setSelectedRefs] = useState<Set<string>>(new Set());
  const [isGeneratingRW, setIsGeneratingRW] = useState(false);
  const [relatedWorkResult, setRelatedWorkResult] = useState('');

  useEffect(() => {
    setRefs(getReferences(projectId));
  }, [projectId]);

  const handleManualAdd = () => {
    if (!newTitle || !newYear) return;
    
    const newRef: Reference = {
      id: Date.now().toString(),
      projectId,
      type: newType,
      title: newTitle,
      authors: newAuthors.split(',').map(a => a.trim()),
      year: newYear,
      abstract: newAbstract,
      addedAt: new Date().toISOString(),
      hasPdf: true, 
    };

    addReference(newRef);
    setRefs(getReferences(projectId));
    resetForm();
    setIsAdding(false);
  };

  const handleSaveSearchResult = (result: any) => {
    const newRef: Reference = {
        id: Date.now().toString(),
        projectId,
        type: searchType, // Use the current search type (book or journal)
        title: result.title,
        authors: result.authors,
        year: result.year,
        publication: result.publication,
        abstract: result.abstract,
        addedAt: new Date().toISOString(),
        hasPdf: false
    };
    addReference(newRef);
    setRefs(getReferences(projectId));
    setSearchResults(prev => prev.filter(p => p.title !== result.title));
  };

  const handleFindPapers = async () => {
      if(!searchTopic) return;
      setIsSearching(true);
      setSearchResults([]);
      setHasSearched(true);
      
      try {
          // Pass structured query to support language and type filtering
          const queryPayload = JSON.stringify({
              topic: searchTopic,
              type: searchType,
              language: searchLangPriority
          });

          const res = await generateAIResponse(queryPayload, '', 'find_papers');
          
          let parsedResults: any[] = [];

          try {
             // Handle potential Markdown wrapping from AI
             const cleanJson = res.replace(/```json/g, '').replace(/```/g, '').trim();
             const parsed = JSON.parse(cleanJson);
             
             // Handle both Array and Object { papers: [] } formats
             if (Array.isArray(parsed)) {
                 parsedResults = parsed;
             } else if (parsed && Array.isArray(parsed.papers)) {
                 parsedResults = parsed.papers;
             } else if (parsed && Array.isArray(parsed.results)) {
                 parsedResults = parsed.results;
             }
          } catch(e) {
             console.error("JSON Parse Error", e);
             parsedResults = [];
          }
          
          setSearchResults(parsedResults);
      } catch (e) {
          console.error(e);
      } finally {
          setIsSearching(false);
      }
  };

  const handleImport = async () => {
      if(!importId) return;
      setIsLoadingMeta(true);
      const meta = await fetchPaperMetadata(importId);
      if(meta && meta.title) {
          setNewTitle(meta.title);
          setNewAuthors(meta.authors.join(', '));
          setNewYear(meta.year);
          setNewAbstract(meta.abstract || '');
          setNewType('journal');
      }
      setIsLoadingMeta(false);
  };

  const resetForm = () => {
    setNewTitle('');
    setNewAuthors('');
    setNewYear('');
    setNewAbstract('');
    setImportId('');
  }

  const handleDelete = (id: string) => {
    deleteReference(id);
    setRefs(getReferences(projectId));
    const newSet = new Set(selectedRefs);
    newSet.delete(id);
    setSelectedRefs(newSet);
  };

  const toggleSelection = (id: string) => {
      const newSet = new Set(selectedRefs);
      if(newSet.has(id)) newSet.delete(id);
      else newSet.add(id);
      setSelectedRefs(newSet);
  };

  const generateRelatedWork = async () => {
      if(selectedRefs.size === 0) return;
      setIsGeneratingRW(true);
      const selectedPapers = refs.filter(r => selectedRefs.has(r.id));
      const context = JSON.stringify(selectedPapers.map(p => ({
          title: p.title,
          author: p.authors[0],
          year: p.year,
          abstract: p.abstract
      })));
      
      const result = await generateAIResponse(
          "Generate a related work section.", 
          context, 
          'related_work'
      );
      setRelatedWorkResult(result);
      setIsGeneratingRW(false);
  };

  const formatCitation = (r: Reference, style: 'APA' | 'IEEE') => {
    const authorText = r.authors.length > 0 ? r.authors.join(', ') : 'Unknown';
    if (style === 'APA') {
      return `${authorText} (${r.year}). ${r.title}.`;
    }
    return `[1] ${authorText}, "${r.title}," ${r.year}.`;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
      <div className="lg:col-span-2 flex flex-col h-full bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
        {/* Modern Tabs */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 px-6 pt-2">
            <div className="flex gap-6">
                <button 
                    onClick={() => setActiveTab('library')}
                    className={`pb-3 px-2 text-sm font-bold transition border-b-2 ${activeTab === 'library' ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400' : 'border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'}`}
                >
                    {lang === 'fa' ? 'کتابخانه من' : 'My Library'}
                </button>
                <button 
                    onClick={() => setActiveTab('find')}
                    className={`pb-3 px-2 text-sm font-bold transition border-b-2 ${activeTab === 'find' ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400' : 'border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'}`}
                >
                    {lang === 'fa' ? 'یافتن منابع' : 'Find Sources'}
                </button>
            </div>
            
            {activeTab === 'library' && (
                 <div className="py-2">
                    <button onClick={() => setIsAdding(!isAdding)} className="text-sm bg-indigo-600 text-white px-4 py-2 rounded-xl hover:bg-indigo-700 transition flex items-center gap-2 shadow-lg shadow-indigo-500/20 font-semibold transform active:scale-95">
                         <Plus size={16} /> {lang === 'fa' ? 'منبع جدید' : 'New Reference'}
                    </button>
                 </div>
            )}
        </div>

        <div className="p-6 flex-1 overflow-y-auto custom-scrollbar bg-slate-50/50 dark:bg-slate-800/50">
            {activeTab === 'library' && (
                <>
                     {isAdding && (
                        <div className="mb-6 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-indigo-100 dark:border-slate-700 shadow-xl animate-in fade-in slide-in-from-top-4">
                            <div className="flex justify-between items-center mb-6">
                                <h4 className="font-bold text-lg text-slate-800 dark:text-white flex items-center gap-2">
                                    <span className="w-8 h-8 rounded-full bg-indigo-50 dark:bg-slate-800 flex items-center justify-center text-indigo-600"><Book size={16}/></span>
                                    Add New Reference
                                </h4>
                                <button onClick={() => setIsAdding(false)} className="bg-slate-100 dark:bg-slate-800 p-2 rounded-full hover:bg-slate-200 transition"><X size={18} className="text-slate-500"/></button>
                            </div>
                            
                            {/* DOI Import */}
                            <div className="flex gap-2 mb-8 bg-slate-50 dark:bg-slate-800 p-3 rounded-2xl border border-slate-200 dark:border-slate-700">
                                <Search className="text-slate-400 ml-2" />
                                <input 
                                    placeholder={lang === 'fa' ? 'وارد کردن DOI, PMID, arXiv ID...' : 'Paste DOI, PMID, or arXiv ID to autofill...'}
                                    className="flex-1 bg-transparent outline-none text-sm text-slate-700 dark:text-white font-medium placeholder-slate-400"
                                    value={importId}
                                    onChange={e => setImportId(e.target.value)}
                                />
                                <button 
                                    onClick={handleImport}
                                    disabled={isLoadingMeta}
                                    className="bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 px-4 py-1.5 rounded-xl border border-slate-200 dark:border-slate-600 hover:border-indigo-400 transition text-sm flex items-center gap-2 shadow-sm font-bold"
                                >
                                    {isLoadingMeta ? <Loader2 size={14} className="animate-spin"/> : null}
                                    {lang === 'fa' ? 'فراخوانی' : 'Fetch Metadata'}
                                </button>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="text-xs font-bold text-slate-500 uppercase ml-1">Title</label>
                                    <input 
                                    className="w-full mt-1 p-3 border border-slate-200 dark:border-slate-700 rounded-xl dark:bg-slate-800 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none transition font-medium"
                                    value={newTitle} onChange={e => setNewTitle(e.target.value)}
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-xs font-bold text-slate-500 uppercase ml-1">Authors</label>
                                        <input 
                                        className="w-full mt-1 p-3 border border-slate-200 dark:border-slate-700 rounded-xl dark:bg-slate-800 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none transition"
                                        value={newAuthors} onChange={e => setNewAuthors(e.target.value)}
                                        />
                                    </div>
                                    <div className="flex gap-4">
                                        <div className="w-24">
                                            <label className="text-xs font-bold text-slate-500 uppercase ml-1">Year</label>
                                            <input 
                                            className="w-full mt-1 p-3 border border-slate-200 dark:border-slate-700 rounded-xl dark:bg-slate-800 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none transition text-center"
                                            value={newYear} onChange={e => setNewYear(e.target.value)}
                                            />
                                        </div>
                                        <div className="flex-1">
                                            <label className="text-xs font-bold text-slate-500 uppercase ml-1">Type</label>
                                            <select 
                                            className="w-full mt-1 p-3 border border-slate-200 dark:border-slate-700 rounded-xl dark:bg-slate-800 dark:text-white outline-none bg-white dark:bg-slate-800"
                                            value={newType} 
                                            onChange={e => setNewType(e.target.value as ReferenceType)}
                                            >
                                            <option value="journal">Journal Article</option>
                                            <option value="book">Book</option>
                                            <option value="conference">Conference Paper</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="mt-8 flex justify-end">
                                <button onClick={handleManualAdd} className="bg-slate-900 dark:bg-indigo-600 text-white px-8 py-3 rounded-xl hover:bg-slate-800 dark:hover:bg-indigo-700 shadow-lg shadow-slate-300 dark:shadow-indigo-500/30 font-bold transition transform active:scale-95">{lang === 'fa' ? 'ذخیره منبع' : 'Save to Library'}</button>
                            </div>
                        </div>
                    )}

                    <div className="space-y-4">
                        {refs.length > 0 && (
                            <div className="flex items-center justify-between mb-2 px-2">
                                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{refs.length} References Found</span>
                                <button className="text-xs flex items-center gap-1 text-slate-500 hover:text-indigo-600"><Filter size={12}/> Sort by Year</button>
                            </div>
                        )}
                        {refs.map(r => (
                            <div key={r.id} className={`group relative flex gap-4 p-5 rounded-3xl border transition-all duration-300 ${selectedRefs.has(r.id) ? 'bg-indigo-50/80 dark:bg-indigo-900/20 border-indigo-200 dark:border-indigo-800 ring-1 ring-indigo-200 dark:ring-indigo-800' : 'bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700/50 hover:border-indigo-200 dark:hover:border-slate-600 hover:shadow-lg hover:shadow-indigo-500/5'}`}>
                                <div className="pt-1">
                                    <div className="relative flex items-center justify-center">
                                      <input 
                                          type="checkbox" 
                                          checked={selectedRefs.has(r.id)}
                                          onChange={() => toggleSelection(r.id)}
                                          className="peer h-6 w-6 cursor-pointer appearance-none rounded-lg border-2 border-slate-300 dark:border-slate-600 checked:border-indigo-600 checked:bg-indigo-600 transition-all hover:border-indigo-400"
                                      />
                                      <CheckCircleIcon className="pointer-events-none absolute w-4 h-4 text-white opacity-0 peer-checked:opacity-100 transition-opacity" />
                                    </div>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-start">
                                        <div className="pr-4">
                                            <h4 className="font-bold text-slate-800 dark:text-slate-100 text-base mb-1.5 leading-snug group-hover:text-indigo-700 dark:group-hover:text-indigo-400 transition">{r.title}</h4>
                                            <div className="flex flex-wrap items-center gap-2 text-sm text-slate-500 dark:text-slate-400 font-medium">
                                                <span className="text-slate-700 dark:text-slate-300">{r.authors[0]} et al.</span>
                                                <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                                                <span className="bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded text-xs">{r.year}</span>
                                                <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                                                <span className="uppercase text-xs tracking-wider">{r.type}</span>
                                            </div>
                                        </div>
                                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all translate-x-2 group-hover:translate-x-0">
                                            <button onClick={() => onOpenReader(r)} className="text-slate-400 hover:text-white bg-white dark:bg-slate-700 hover:bg-indigo-600 dark:hover:bg-indigo-500 p-2.5 rounded-xl border border-slate-100 dark:border-slate-600 hover:border-indigo-600 transition shadow-sm" title="Smart Read">
                                                <Eye size={18} />
                                            </button>
                                            <button onClick={() => handleDelete(r.id)} className="text-slate-400 hover:text-white bg-white dark:bg-slate-700 hover:bg-red-500 p-2.5 rounded-xl border border-slate-100 dark:border-slate-600 hover:border-red-500 transition shadow-sm">
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </div>
                                    <div className="mt-4 flex items-center gap-3">
                                        <div className="text-[11px] text-slate-500 dark:text-slate-400 font-mono bg-slate-50 dark:bg-slate-900/50 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 inline-flex items-center gap-2 cursor-pointer hover:bg-white dark:hover:bg-slate-800 transition max-w-full"
                                            onClick={() => navigator.clipboard.writeText(formatCitation(r, 'APA'))}>
                                            <span className="truncate">{formatCitation(r, 'APA')}</span>
                                            <Copy size={12} className="shrink-0" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                        {refs.length === 0 && (
                            <div className="flex flex-col items-center justify-center py-20 text-slate-400 dark:text-slate-500 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-3xl bg-slate-50/50 dark:bg-slate-900/20">
                                <div className="w-20 h-20 bg-white dark:bg-slate-800 rounded-full flex items-center justify-center mb-4 shadow-sm">
                                    <Book size={32} className="opacity-50" />
                                </div>
                                <p className="font-medium">{lang === 'fa' ? 'کتابخانه خالی است' : 'Your library is empty'}</p>
                                <button onClick={() => setIsAdding(true)} className="mt-4 text-indigo-600 font-bold text-sm hover:underline">Add your first paper</button>
                            </div>
                        )}
                    </div>
                </>
            )}

            {activeTab === 'find' && (
                <div className="space-y-8">
                    <div className="bg-gradient-to-br from-indigo-600 to-violet-700 p-8 rounded-3xl text-center text-white shadow-xl shadow-indigo-500/20 relative overflow-hidden">
                        <div className="relative z-10">
                            <h3 className="text-3xl font-black mb-3">
                                {lang === 'fa' ? 'جستجوی مقالات علمی' : 'AI Research Finder'}
                            </h3>
                            <p className="text-indigo-100 mb-8 max-w-lg mx-auto text-sm opacity-90 font-medium leading-relaxed">
                                {lang === 'fa' ? 'موضوع خود را وارد کنید تا هوش مصنوعی منابع معتبر را بیابد.' : 'Enter your topic. Our AI scans academic databases to find the most relevant papers for your work.'}
                            </p>
                            
                            {/* Search Options */}
                            <div className="flex flex-wrap justify-center gap-3 mb-6">
                                <button 
                                    onClick={() => setSearchType('journal')}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition ${searchType === 'journal' ? 'bg-white text-indigo-600 shadow-md' : 'bg-indigo-800/50 text-indigo-200 hover:bg-indigo-700'}`}
                                >
                                    <FileText size={14} /> {lang === 'fa' ? 'جستجوی مقالات' : 'Search Articles'}
                                </button>
                                <button 
                                    onClick={() => setSearchType('book')}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition ${searchType === 'book' ? 'bg-white text-indigo-600 shadow-md' : 'bg-indigo-800/50 text-indigo-200 hover:bg-indigo-700'}`}
                                >
                                    <BookOpen size={14} /> {lang === 'fa' ? 'جستجوی کتاب' : 'Search Books'}
                                </button>
                                <div className="w-px h-6 bg-indigo-500/50 mx-1"></div>
                                <button 
                                    onClick={() => setSearchLangPriority('mixed')}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition ${searchLangPriority === 'mixed' ? 'bg-white text-indigo-600 shadow-md' : 'bg-indigo-800/50 text-indigo-200 hover:bg-indigo-700'}`}
                                >
                                    <Globe size={14} /> {lang === 'fa' ? 'اول فارسی (ترکیبی)' : 'Persian First'}
                                </button>
                                <button 
                                    onClick={() => setSearchLangPriority('en')}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition ${searchLangPriority === 'en' ? 'bg-white text-indigo-600 shadow-md' : 'bg-indigo-800/50 text-indigo-200 hover:bg-indigo-700'}`}
                                >
                                    <Globe size={14} /> {lang === 'fa' ? 'فقط انگلیسی' : 'English Only'}
                                </button>
                            </div>

                            <div className="flex gap-2 max-w-xl mx-auto bg-white p-2 rounded-2xl shadow-lg transform transition-transform focus-within:scale-105">
                                <input 
                                    value={searchTopic}
                                    onChange={e => setSearchTopic(e.target.value)}
                                    onKeyDown={e => e.key === 'Enter' && handleFindPapers()}
                                    placeholder={lang === 'fa' ? 'موضوع مورد نظر...' : 'e.g., Deep Learning in Medical Imaging...'}
                                    className="flex-1 px-4 py-2 bg-transparent text-slate-800 placeholder-slate-400 outline-none font-medium"
                                />
                                <button 
                                    onClick={handleFindPapers}
                                    disabled={isSearching || !searchTopic}
                                    className="bg-indigo-600 text-white px-6 py-2 rounded-xl hover:bg-indigo-700 disabled:opacity-50 transition font-bold shadow-md"
                                >
                                    {isSearching ? <Loader2 size={20} className="animate-spin"/> : <Search size={20} />}
                                </button>
                            </div>
                        </div>
                        {/* Decor */}
                        <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                    </div>

                    <div className="space-y-4">
                         {searchResults.map((paper, i) => (
                             <div key={i} className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200 dark:border-slate-700 hover:shadow-xl hover:-translate-y-1 transition duration-300 group">
                                 <div className="flex justify-between gap-6">
                                     <div>
                                         <h4 className="font-bold text-slate-800 dark:text-white text-lg group-hover:text-indigo-600 transition mb-2" dir="auto">{paper.title}</h4>
                                         <div className="flex flex-wrap gap-2 text-xs font-bold text-slate-500 mt-2 mb-4">
                                            <span className="bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 px-3 py-1 rounded-full">{paper.year}</span>
                                            <span className="bg-slate-100 dark:bg-slate-700 px-3 py-1 rounded-full">{paper.publication}</span>
                                            <span className="flex items-center px-2">{paper.authors.join(', ')}</span>
                                            {searchType === 'book' && <span className="bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 px-2 py-1 rounded border border-orange-100 dark:border-orange-800">Book</span>}
                                         </div>
                                         <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-3 leading-relaxed" dir="auto">{paper.abstract}</p>
                                     </div>
                                     <button 
                                        onClick={() => handleSaveSearchResult(paper)}
                                        className="text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20 hover:bg-indigo-600 hover:text-white p-4 rounded-2xl h-fit transition shrink-0 shadow-sm" 
                                        title="Add to Library"
                                     >
                                         <DownloadCloud size={24} />
                                     </button>
                                 </div>
                             </div>
                         ))}
                         
                         {hasSearched && searchResults.length === 0 && !isSearching && (
                             <div className="text-center py-12 px-6 rounded-3xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800">
                                <div className="inline-flex p-4 rounded-full bg-slate-100 dark:bg-slate-800 mb-4 text-slate-400">
                                   <Search size={32} />
                                </div>
                                <p className="text-slate-600 dark:text-slate-400 font-bold mb-2">{lang === 'fa' ? 'متاسفانه منبعی یافت نشد' : 'No results found'}</p>
                                <p className="text-slate-500 text-sm max-w-md mx-auto">{lang === 'fa' ? 'لطفا کلمات کلیدی خود را تغییر دهید یا از عبارت‌های کلی‌تر استفاده کنید.' : 'Please try different keywords or broader terms.'}</p>
                             </div>
                         )}
                    </div>
                </div>
            )}
        </div>
      </div>

      {/* Tools Column */}
      <div className="flex flex-col h-full gap-6">
         <div className="bg-gradient-to-b from-indigo-50 to-white dark:from-slate-800 dark:to-slate-900 rounded-3xl border border-indigo-100 dark:border-slate-700 p-6 flex flex-col h-full shadow-sm relative overflow-hidden">
             <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-200/20 rounded-full blur-3xl -mr-10 -mt-10"></div>
             
             <div className="flex items-center gap-3 mb-6 text-indigo-800 dark:text-indigo-300 font-bold text-lg relative z-10">
                 <div className="p-2.5 bg-white dark:bg-slate-800 rounded-xl shadow-sm text-indigo-600">
                    <Wand2 size={20} />
                 </div>
                 <h3>{lang === 'fa' ? 'نویسنده خودکار' : 'AI Synthesis'}</h3>
             </div>
             
             <div className="flex-1 flex flex-col relative z-10">
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-8 leading-relaxed font-medium">
                    {lang === 'fa' 
                    ? `با انتخاب ${selectedRefs.size} مقاله، می‌توانید یک متن مرور ادبیات (Literature Review) منسجم تولید کنید.`
                    : `Select papers from your library to generate a coherent Literature Review section automatically.`}
                </p>
                
                <div className="flex items-center justify-between mb-4 p-4 bg-white dark:bg-slate-800/50 rounded-2xl border border-indigo-50 dark:border-slate-700 shadow-sm">
                    <span className="text-sm font-bold text-slate-700 dark:text-slate-300">Selected Papers</span>
                    <span className="bg-indigo-600 text-white text-xs font-bold px-3 py-1 rounded-lg shadow-md shadow-indigo-200 dark:shadow-none">{selectedRefs.size}</span>
                </div>

                <button 
                    onClick={generateRelatedWork}
                    disabled={selectedRefs.size < 2 || isGeneratingRW}
                    className="w-full bg-slate-900 dark:bg-white dark:text-slate-900 text-white py-4 rounded-2xl font-bold shadow-xl shadow-slate-300 dark:shadow-slate-900/20 hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex justify-center items-center gap-2 mb-6"
                >
                    {isGeneratingRW ? <Loader2 size={18} className="animate-spin" /> : <Wand2 size={18} />}
                    {lang === 'fa' ? 'تولید متن' : 'Generate Review'}
                </button>

                {relatedWorkResult && (
                    <div className="flex-1 overflow-hidden flex flex-col bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm animate-in fade-in slide-in-from-bottom-4">
                        <div className="p-3 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center bg-slate-50 dark:bg-slate-900/50">
                            <span className="text-xs font-bold uppercase text-slate-400 tracking-wider">Draft Result</span>
                            <button onClick={() => navigator.clipboard.writeText(relatedWorkResult)} className="text-slate-400 hover:text-indigo-600"><Copy size={14}/></button>
                        </div>
                        <div className="p-5 overflow-y-auto custom-scrollbar flex-1">
                            <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap font-serif">
                                {relatedWorkResult}
                            </p>
                        </div>
                    </div>
                )}
             </div>
         </div>
      </div>
    </div>
  );
};

// Icon helper
const CheckCircleIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
);

export default ReferenceManager;