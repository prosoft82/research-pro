
import React, { useState, useRef, useEffect } from 'react';
import { Reference, Annotation, PdfAnnotation } from '../types';
import { getAnnotations, saveAnnotation, updateReference } from '../services/mockDb';
import { X, Highlighter, MessageSquare, StickyNote, ZoomIn, ZoomOut, UploadCloud, FileText, Eye, AlertCircle, Pen, Type, Eraser, Undo, Download, MousePointer2, ChevronLeft, ChevronRight } from 'lucide-react';
// @ts-ignore
import * as pdfjsLib from 'pdfjs-dist';

// Set worker for PDF.js
if (pdfjsLib.GlobalWorkerOptions) {
    pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/build/pdf.worker.min.js';
}

interface Props {
  reference: Reference;
  onClose: () => void;
  lang: 'fa' | 'en';
}

type Tool = 'cursor' | 'pen' | 'highlight' | 'text' | 'eraser';

const SmartReader: React.FC<Props> = ({ reference, onClose, lang }) => {
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const [selection, setSelection] = useState<{text: string, top: number, left: number} | null>(null);
  const [zoom, setZoom] = useState(100);
  const [pdfData, setPdfData] = useState<string | null>(reference.pdfData || null);
  const [viewMode, setViewMode] = useState<'text' | 'pdf'>('text');
  const [uploadError, setUploadError] = useState('');

  // PDF & Annotation State
  const [pdfDoc, setPdfDoc] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [numPages, setNumPages] = useState(0);
  const [pdfAnnotations, setPdfAnnotations] = useState<PdfAnnotation[]>(reference.pdfAnnotations || []);
  const [activeTool, setActiveTool] = useState<Tool>('cursor');
  const [toolColor, setToolColor] = useState('#facc15'); // Yellow default
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentPath, setCurrentPath] = useState<{x: number, y: number}[]>([]);
  
  // Refs
  const contentRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const annotationCanvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setAnnotations(getAnnotations(reference.id));
  }, [reference.id]);

  // Load PDF when data or mode changes
  useEffect(() => {
      if (viewMode === 'pdf' && pdfData) {
          const loadPdf = async () => {
              try {
                  const loadingTask = pdfjsLib.getDocument(pdfData);
                  const pdf = await loadingTask.promise;
                  setPdfDoc(pdf);
                  setNumPages(pdf.numPages);
                  setCurrentPage(1);
              } catch (e) {
                  console.error("Error loading PDF", e);
                  setUploadError("Failed to load PDF. File might be corrupted.");
              }
          };
          loadPdf();
      }
  }, [viewMode, pdfData]);

  // Render PDF Page
  useEffect(() => {
      if (!pdfDoc || !canvasRef.current) return;

      const renderPage = async () => {
          try {
              const page = await pdfDoc.getPage(currentPage);
              const viewport = page.getViewport({ scale: zoom / 100 });
              
              const canvas = canvasRef.current!;
              const context = canvas.getContext('2d');
              if (!context) return;

              canvas.height = viewport.height;
              canvas.width = viewport.width;

              // Also resize annotation canvas
              if (annotationCanvasRef.current) {
                  annotationCanvasRef.current.height = viewport.height;
                  annotationCanvasRef.current.width = viewport.width;
                  drawAnnotations(); // Redraw annotations after resize
              }

              const renderContext = {
                  canvasContext: context,
                  viewport: viewport,
              };
              await page.render(renderContext).promise;
          } catch (e) {
              console.error("Render error", e);
          }
      };
      renderPage();
  }, [pdfDoc, currentPage, zoom]);

  // Redraw annotations when they change or zoom changes
  useEffect(() => {
      drawAnnotations();
  }, [pdfAnnotations, zoom, currentPage]); // Re-draw when these change

  const handleTextSelection = () => {
      if (viewMode !== 'text') return;
      const sel = window.getSelection();
      if (sel && sel.toString().trim().length > 0 && contentRef.current?.contains(sel.anchorNode)) {
          const range = sel.getRangeAt(0);
          const rect = range.getBoundingClientRect();
          const containerRect = contentRef.current.getBoundingClientRect();
          setSelection({
              text: sel.toString().trim(),
              top: rect.top - containerRect.top - 50,
              left: rect.left - containerRect.left + (rect.width / 2)
          });
      } else {
          setSelection(null);
      }
  };

  const addTextAnnotation = (color: string) => {
      if(!selection) return;
      const newAnn: Annotation = {
          id: Date.now().toString(),
          referenceId: reference.id,
          text: selection.text,
          comment: '',
          color,
          createdAt: new Date().toISOString()
      };
      saveAnnotation(newAnn);
      setAnnotations(getAnnotations(reference.id));
      setSelection(null);
      window.getSelection()?.removeAllRanges();
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      if (file.type !== 'application/pdf') {
          setUploadError('Only PDF files are supported.');
          return;
      }
      if (file.size > 5 * 1024 * 1024) { 
           setUploadError('Limit: PDF must be under 5MB.');
           return;
      }
      const reader = new FileReader();
      reader.onload = (ev) => {
          const result = ev.target?.result as string;
          setPdfData(result);
          setUploadError('');
          const updatedRef = { ...reference, pdfData: result, hasPdf: true };
          updateReference(updatedRef);
          setViewMode('pdf');
      };
      reader.readAsDataURL(file);
  };

  // --- PDF Annotation Logic ---

  const getCanvasCoordinates = (e: React.MouseEvent | React.TouchEvent) => {
      if (!annotationCanvasRef.current) return { x: 0, y: 0 };
      const rect = annotationCanvasRef.current.getBoundingClientRect();
      const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;
      return {
          x: clientX - rect.left,
          y: clientY - rect.top
      };
  };

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
      if (activeTool === 'cursor') return;
      if (activeTool === 'text') {
          handleTextClick(e);
          return;
      }
      setIsDrawing(true);
      const { x, y } = getCanvasCoordinates(e);
      setCurrentPath([{ x, y }]);
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
      if (!isDrawing || activeTool === 'cursor' || activeTool === 'text') return;
      
      const { x, y } = getCanvasCoordinates(e);
      const newPath = [...currentPath, { x, y }];
      setCurrentPath(newPath);

      // Render LIVE drawing stroke
      const ctx = annotationCanvasRef.current?.getContext('2d');
      if (ctx) {
          ctx.beginPath();
          ctx.moveTo(currentPath[currentPath.length - 1].x, currentPath[currentPath.length - 1].y);
          ctx.lineTo(x, y);
          ctx.strokeStyle = activeTool === 'eraser' ? 'rgba(255,255,255,0.5)' : toolColor;
          ctx.lineWidth = activeTool === 'highlight' ? 20 : (activeTool === 'eraser' ? 20 : 2);
          if (activeTool === 'highlight') ctx.globalAlpha = 0.3;
          else ctx.globalAlpha = 1;
          ctx.lineCap = 'round';
          ctx.lineJoin = 'round';
          if (activeTool === 'eraser') ctx.globalCompositeOperation = 'destination-out';
          else ctx.globalCompositeOperation = 'source-over';
          ctx.stroke();
      }
  };

  const stopDrawing = () => {
      if (!isDrawing) return;
      setIsDrawing(false);
      
      if (currentPath.length > 1) {
          const newAnn: PdfAnnotation = {
              id: Date.now().toString(),
              type: activeTool === 'highlight' ? 'highlight' : 'path',
              page: currentPage,
              color: toolColor,
              points: currentPath,
              lineWidth: activeTool === 'highlight' ? 20 : 2
          };
          
          if (activeTool !== 'eraser') {
              const updated = [...pdfAnnotations, newAnn];
              setPdfAnnotations(updated);
              savePdfAnnotations(updated);
          }
      }
      setCurrentPath([]);
      // If eraser, we don't save a path, we just modified the canvas. 
      // But for proper state, 'Eraser' should ideally remove underlying data.
      // For this simple implementation, 'Eraser' is just a visual tool or we implement "Undo".
      if (activeTool === 'eraser') {
          // Trigger redraw to clear up artifacts if we only visually erased
          drawAnnotations(); 
      }
  };

  const handleTextClick = (e: React.MouseEvent | React.TouchEvent) => {
      const { x, y } = getCanvasCoordinates(e);
      const text = prompt("Enter text annotation:", "");
      if (text) {
          const newAnn: PdfAnnotation = {
              id: Date.now().toString(),
              type: 'text',
              page: currentPage,
              color: toolColor,
              x,
              y,
              text,
              fontSize: 16
          };
          const updated = [...pdfAnnotations, newAnn];
          setPdfAnnotations(updated);
          savePdfAnnotations(updated);
      }
  };

  const savePdfAnnotations = (anns: PdfAnnotation[]) => {
      const updatedRef = { ...reference, pdfAnnotations: anns };
      updateReference(updatedRef);
  };

  const drawAnnotations = () => {
      const canvas = annotationCanvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw all annotations for current page
      pdfAnnotations.filter(a => a.page === currentPage).forEach(ann => {
          if (ann.type === 'text' && ann.text && ann.x !== undefined && ann.y !== undefined) {
              ctx.font = `bold ${ann.fontSize || 16}px sans-serif`;
              ctx.fillStyle = ann.color;
              ctx.globalAlpha = 1;
              ctx.fillText(ann.text, ann.x, ann.y);
          } else if ((ann.type === 'path' || ann.type === 'highlight') && ann.points) {
              ctx.beginPath();
              ctx.moveTo(ann.points[0].x, ann.points[0].y);
              for (let i = 1; i < ann.points.length; i++) {
                  ctx.lineTo(ann.points[i].x, ann.points[i].y);
              }
              ctx.strokeStyle = ann.color;
              ctx.lineWidth = ann.lineWidth || 2;
              ctx.lineCap = 'round';
              ctx.lineJoin = 'round';
              ctx.globalAlpha = ann.type === 'highlight' ? 0.3 : 1;
              ctx.globalCompositeOperation = 'source-over';
              ctx.stroke();
          }
      });
  };

  const undoLastAnnotation = () => {
      const pageAnns = pdfAnnotations.filter(a => a.page === currentPage);
      if (pageAnns.length === 0) return;
      
      const lastAnn = pageAnns[pageAnns.length - 1];
      const updated = pdfAnnotations.filter(a => a.id !== lastAnn.id);
      setPdfAnnotations(updated);
      savePdfAnnotations(updated);
  };

  const renderTextContent = () => {
      // Mock content for demo
      const baseText = `
        <h1 class="text-3xl font-bold mb-4 leading-tight">${reference.title}</h1>
        <div class="text-sm text-slate-500 mb-8 italic">Published in: ${reference.publication || 'Journal of Advanced Research'} • ${reference.year}</div>
        <h3 class="font-bold text-lg mt-6 mb-2">ABSTRACT</h3>
        <p class="mb-4">${reference.abstract || 'No abstract available.'}</p>
        <h3 class="font-bold text-lg mt-6 mb-2">1. INTRODUCTION</h3>
        <p class="mb-4">This simulates the extracted text content of the paper. In a real application, OCR would process the PDF.</p>
        <p class="mb-4">The exponential growth of academic literature necessitates advanced tools. Our solution leverages Large Language Models (LLMs).</p>
      `;
      let highlightedHtml = baseText;
      annotations.forEach(ann => {
          const highlightSpan = `<span class="${ann.color} px-0.5 rounded border-b border-yellow-500/50" title="Note: ${ann.comment}">${ann.text}</span>`;
          const safeText = ann.text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
          highlightedHtml = highlightedHtml.replace(new RegExp(safeText, 'g'), highlightSpan);
      });
      return <div dangerouslySetInnerHTML={{ __html: highlightedHtml }} />;
  };

  return (
    <div className="fixed inset-0 bg-slate-100 dark:bg-slate-950 z-50 flex flex-col animate-in fade-in duration-200">
      {/* Header */}
      <div className="h-14 bg-white dark:bg-slate-900 border-b dark:border-slate-800 flex items-center justify-between px-4 shadow-sm z-10 shrink-0">
         <div className="flex items-center gap-4">
             <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition">
                 <X size={20} className="text-slate-600 dark:text-slate-300"/>
             </button>
             <div className="flex flex-col">
                 <h2 className="font-bold text-sm text-slate-800 dark:text-white truncate max-w-xs md:max-w-md">{reference.title}</h2>
                 <span className="text-xs text-slate-500">{reference.authors[0]} et al. ({reference.year})</span>
             </div>
         </div>
         
         <div className="flex items-center gap-3">
             <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
                 <button onClick={() => setViewMode('text')} className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition ${viewMode === 'text' ? 'bg-white dark:bg-slate-700 shadow text-indigo-600 dark:text-indigo-300' : 'text-slate-500'}`}>
                    <FileText size={14} /> {lang === 'fa' ? 'متن هوشمند' : 'Smart Text'}
                 </button>
                 <button onClick={() => setViewMode('pdf')} className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition ${viewMode === 'pdf' ? 'bg-white dark:bg-slate-700 shadow text-indigo-600 dark:text-indigo-300' : 'text-slate-500'}`}>
                    <Eye size={14} /> {lang === 'fa' ? 'فایل PDF' : 'PDF File'}
                 </button>
             </div>
             {viewMode === 'pdf' && (
                 <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 rounded-lg p-1 hidden md:flex">
                     <button onClick={() => setZoom(z => Math.max(50, z - 10))} className="p-1.5 hover:bg-white dark:hover:bg-slate-700 rounded"><ZoomOut size={16}/></button>
                     <span className="text-xs w-10 text-center font-mono">{zoom}%</span>
                     <button onClick={() => setZoom(z => Math.min(200, z + 10))} className="p-1.5 hover:bg-white dark:hover:bg-slate-700 rounded"><ZoomIn size={16}/></button>
                 </div>
             )}
         </div>
      </div>

      <div className="flex-1 flex overflow-hidden relative">
         {/* Main Content */}
         <div className="flex-1 bg-slate-200 dark:bg-slate-950 overflow-y-auto flex flex-col items-center relative" onClick={() => {if(viewMode==='text') setSelection(null)}}>
            
            {viewMode === 'text' ? (
                <div ref={contentRef} onMouseUp={handleTextSelection} style={{ width: `${800 * (zoom/100)}px` }} className="bg-white text-slate-900 min-h-[1000px] shadow-2xl p-12 select-text transition-all duration-200 ease-out origin-top my-8">
                    <div className="font-serif leading-loose whitespace-pre-line text-justify">{renderTextContent()}</div>
                </div>
            ) : (
                <div className="w-full h-full flex flex-col items-center p-4 relative">
                    {pdfData ? (
                         <div ref={containerRef} className="relative shadow-2xl my-4 bg-white" style={{ minHeight: '800px' }}>
                             {/* Tools Palette - Floating */}
                             <div className="fixed top-20 left-4 md:left-auto md:right-80 z-50 flex flex-col gap-2 bg-white dark:bg-slate-800 p-2 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 animate-in slide-in-from-right-10">
                                 <button onClick={() => setActiveTool('cursor')} className={`p-3 rounded-xl transition ${activeTool === 'cursor' ? 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/50 dark:text-indigo-300' : 'text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'}`} title="Cursor"><MousePointer2 size={20}/></button>
                                 <div className="w-full h-px bg-slate-200 dark:bg-slate-700 my-1"></div>
                                 <button onClick={() => setActiveTool('pen')} className={`p-3 rounded-xl transition ${activeTool === 'pen' ? 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/50 dark:text-indigo-300' : 'text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'}`} title="Pen"><Pen size={20}/></button>
                                 <button onClick={() => setActiveTool('highlight')} className={`p-3 rounded-xl transition ${activeTool === 'highlight' ? 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/50 dark:text-indigo-300' : 'text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'}`} title="Highlighter"><Highlighter size={20}/></button>
                                 <button onClick={() => setActiveTool('text')} className={`p-3 rounded-xl transition ${activeTool === 'text' ? 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/50 dark:text-indigo-300' : 'text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'}`} title="Text"><Type size={20}/></button>
                                 <div className="w-full h-px bg-slate-200 dark:bg-slate-700 my-1"></div>
                                 <div className="flex gap-1 justify-center p-1">
                                     <button onClick={() => setToolColor('#ef4444')} className={`w-4 h-4 rounded-full bg-red-500 ${toolColor==='#ef4444' ? 'ring-2 ring-offset-1 ring-red-500':''}`}></button>
                                     <button onClick={() => setToolColor('#facc15')} className={`w-4 h-4 rounded-full bg-yellow-400 ${toolColor==='#facc15' ? 'ring-2 ring-offset-1 ring-yellow-400':''}`}></button>
                                     <button onClick={() => setToolColor('#22c55e')} className={`w-4 h-4 rounded-full bg-green-500 ${toolColor==='#22c55e' ? 'ring-2 ring-offset-1 ring-green-500':''}`}></button>
                                 </div>
                                 <div className="w-full h-px bg-slate-200 dark:bg-slate-700 my-1"></div>
                                 <button onClick={undoLastAnnotation} className="p-3 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 transition" title="Undo"><Undo size={20}/></button>
                             </div>

                             {/* PDF Rendering Canvas */}
                             <canvas ref={canvasRef} className="block" />
                             
                             {/* Annotation Overlay Canvas */}
                             <canvas 
                                ref={annotationCanvasRef}
                                className={`absolute top-0 left-0 cursor-${activeTool === 'cursor' ? 'default' : 'crosshair'}`}
                                onMouseDown={startDrawing}
                                onMouseMove={draw}
                                onMouseUp={stopDrawing}
                                onMouseLeave={stopDrawing}
                                onTouchStart={startDrawing}
                                onTouchMove={draw}
                                onTouchEnd={stopDrawing}
                             />

                             {/* Page Navigation Overlay */}
                             <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-4 bg-slate-900/80 text-white px-4 py-2 rounded-full backdrop-blur-sm shadow-xl z-10">
                                 <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage <= 1} className="hover:text-indigo-300 disabled:opacity-30"><ChevronLeft size={20}/></button>
                                 <span className="text-sm font-mono">{currentPage} / {numPages}</span>
                                 <button onClick={() => setCurrentPage(p => Math.min(numPages, p + 1))} disabled={currentPage >= numPages} className="hover:text-indigo-300 disabled:opacity-30"><ChevronRight size={20}/></button>
                             </div>
                         </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center text-slate-400 mt-20">
                             <div className="w-20 h-20 bg-slate-100 dark:bg-slate-900 rounded-full flex items-center justify-center mb-4">
                                 <UploadCloud size={32} />
                             </div>
                             <p className="font-medium text-slate-600 dark:text-slate-300 mb-2">PDF not available</p>
                             <input type="file" accept="application/pdf" ref={fileInputRef} className="hidden" onChange={handleFileUpload} />
                             <button onClick={() => fileInputRef.current?.click()} className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition shadow-lg">Upload PDF</button>
                             {uploadError && <div className="mt-4 flex items-center gap-2 text-red-500 text-sm bg-red-50 dark:bg-red-900/20 px-3 py-2 rounded"><AlertCircle size={16} /> {uploadError}</div>}
                        </div>
                    )}
                </div>
            )}

            {/* Selection Text Tooltip */}
            {selection && viewMode === 'text' && (
                <div style={{ top: selection.top + 50, left: selection.left }} className="absolute bg-slate-900 text-white p-1 rounded-lg shadow-xl flex gap-1 z-50 animate-in zoom-in-95 -translate-x-1/2" onMouseDown={(e) => e.stopPropagation()}>
                    <button onClick={() => addTextAnnotation('bg-yellow-200')} className="p-2 hover:bg-slate-700 rounded text-yellow-300 transition"><Highlighter size={16}/></button>
                    <button onClick={() => addTextAnnotation('bg-green-200')} className="p-2 hover:bg-slate-700 rounded text-green-300 transition"><StickyNote size={16}/></button>
                    <button onClick={() => addTextAnnotation('bg-blue-200')} className="p-2 hover:bg-slate-700 rounded text-blue-300 transition"><MessageSquare size={16}/></button>
                </div>
            )}
         </div>

         {/* Sidebar */}
         <div className="w-80 bg-white dark:bg-slate-900 border-l dark:border-slate-800 flex flex-col shrink-0">
            <div className="p-4 border-b dark:border-slate-800 font-bold text-slate-700 dark:text-slate-200 flex justify-between items-center">
                <span>{viewMode === 'text' ? 'Text Notes' : 'PDF Annotations'}</span>
                <span className="bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full text-xs text-slate-500">
                    {viewMode === 'text' ? annotations.length : pdfAnnotations.length}
                </span>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {viewMode === 'text' ? annotations.map(ann => (
                    <div key={ann.id} className="bg-slate-50 dark:bg-slate-800 p-3 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm">
                        <div className={`text-[10px] px-2 py-0.5 rounded mb-2 w-fit font-bold uppercase ${ann.color === 'bg-yellow-200' ? 'bg-yellow-100 text-yellow-700' : 'bg-blue-100 text-blue-700'}`}>Note</div>
                        <p className="text-sm italic text-slate-600 dark:text-slate-300 mb-3 border-l-2 border-slate-300 pl-2">"{ann.text}"</p>
                        <textarea className="w-full text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded p-2 outline-none h-16 resize-none" defaultValue={ann.comment} placeholder="Add comment..." />
                    </div>
                )) : pdfAnnotations.filter(a => a.type === 'text' || a.type === 'highlight').map(ann => (
                     <div key={ann.id} className="bg-slate-50 dark:bg-slate-800 p-3 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm flex items-start gap-2">
                         <div className="mt-1" style={{ color: ann.color }}>
                            {ann.type === 'text' ? <Type size={16}/> : <Highlighter size={16}/>}
                         </div>
                         <div>
                             <div className="text-xs font-bold text-slate-500 uppercase mb-1">Page {ann.page}</div>
                             <p className="text-sm text-slate-700 dark:text-slate-300">{ann.type === 'text' ? ann.text : 'Highlight'}</p>
                         </div>
                     </div>
                ))}
                {viewMode === 'pdf' && pdfAnnotations.length === 0 && (
                     <div className="text-center text-slate-400 mt-10">
                         <Pen size={32} className="mx-auto mb-2 opacity-50"/>
                         <p className="text-sm">Use tools to draw or highlight on PDF</p>
                     </div>
                )}
            </div>
         </div>
      </div>
    </div>
  );
};

export default SmartReader;
