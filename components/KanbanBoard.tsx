import React, { useState, useEffect } from 'react';
import { Task, TaskStatus } from '../types';
import { getTasks, saveTask, deleteTask } from '../services/mockDb';
import { Plus, X, MoreHorizontal, Circle, CheckCircle2, Clock, PlayCircle } from 'lucide-react';

interface Props {
  projectId: string;
  lang: 'fa' | 'en';
}

const KanbanBoard: React.FC<Props> = ({ projectId, lang }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTaskTitle, setNewTaskTitle] = useState('');

  useEffect(() => {
    setTasks(getTasks(projectId));
  }, [projectId]);

  const addTask = (status: TaskStatus) => {
    if (!newTaskTitle) return;
    const task: Task = {
      id: Date.now().toString(),
      projectId,
      title: newTaskTitle,
      status,
    };
    saveTask(task);
    setTasks(getTasks(projectId));
    setNewTaskTitle('');
  };

  const moveTask = (task: Task, newStatus: TaskStatus) => {
    const updated = { ...task, status: newStatus };
    saveTask(updated);
    setTasks(getTasks(projectId));
  };

  const removeTask = (id: string) => {
      deleteTask(id);
      setTasks(getTasks(projectId));
  }

  const columns: { id: TaskStatus; label: string; bg: string; border: string; icon: any; accent: string }[] = [
    { id: 'todo', label: lang === 'fa' ? 'برای انجام' : 'To Do', bg: 'bg-slate-50/50 dark:bg-slate-800/30', border: 'border-slate-200 dark:border-slate-700', icon: Circle, accent: 'text-slate-500' },
    { id: 'in-progress', label: lang === 'fa' ? 'در حال انجام' : 'In Progress', bg: 'bg-blue-50/50 dark:bg-blue-900/10', border: 'border-blue-100 dark:border-blue-900/30', icon: PlayCircle, accent: 'text-blue-500' },
    { id: 'done', label: lang === 'fa' ? 'انجام شده' : 'Done', bg: 'bg-green-50/50 dark:bg-green-900/10', border: 'border-green-100 dark:border-green-900/30', icon: CheckCircle2, accent: 'text-green-500' },
  ];

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center gap-3 mb-8 bg-white dark:bg-slate-800 p-2 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm max-w-xl">
        <div className="bg-indigo-50 dark:bg-indigo-900/30 p-2.5 rounded-xl text-indigo-600 dark:text-indigo-400">
            <Plus size={20} />
        </div>
        <input 
          value={newTaskTitle}
          onChange={(e) => setNewTaskTitle(e.target.value)}
          placeholder={lang === 'fa' ? 'افزودن تسک جدید...' : 'Add a new task to your board...'}
          className="flex-1 bg-transparent outline-none dark:text-white font-medium"
          onKeyDown={(e) => e.key === 'Enter' && addTask('todo')}
        />
        <button onClick={() => addTask('todo')} className="bg-indigo-600 text-white px-4 py-2 rounded-xl hover:bg-indigo-700 transition font-bold text-sm shadow-md shadow-indigo-500/20">
          {lang === 'fa' ? 'افزودن' : 'Add Task'}
        </button>
      </div>

      <div className="flex gap-6 overflow-x-auto pb-6 h-[650px] snap-x scroll-pl-6">
        {columns.map(col => (
          <div key={col.id} className={`flex-1 min-w-[320px] snap-center ${col.bg} rounded-[32px] p-2 flex flex-col border ${col.border} backdrop-blur-sm transition-all hover:shadow-lg`}>
            <div className="flex justify-between items-center mb-4 px-4 pt-4">
                <div className="flex items-center gap-2">
                    <col.icon size={18} className={col.accent} strokeWidth={2.5} />
                    <h4 className="font-extrabold text-slate-700 dark:text-slate-200 text-sm uppercase tracking-wider">
                        {col.label}
                    </h4>
                </div>
                <span className="bg-white dark:bg-slate-700 px-3 py-1 rounded-full text-xs font-bold text-slate-500 dark:text-slate-300 shadow-sm border border-slate-100 dark:border-slate-600">
                    {tasks.filter(t => t.status === col.id).length}
                </span>
            </div>
            
            <div className="space-y-3 overflow-y-auto flex-1 px-2 pb-2 custom-scrollbar">
              {tasks.filter(t => t.status === col.id).map(task => (
                <div key={task.id} className="bg-white dark:bg-slate-800 p-5 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 cursor-grab active:cursor-grabbing group relative hover:shadow-md hover:-translate-y-1 transition-all duration-300">
                  <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 leading-relaxed">{task.title}</p>
                  
                  <button onClick={() => removeTask(task.id)} className='absolute top-3 right-3 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition p-1 hover:bg-red-50 rounded-lg'>
                      <X size={14} />
                  </button>

                  <div className="mt-4 flex gap-2 justify-end opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                     {col.id !== 'todo' && (
                         <button onClick={() => moveTask(task, 'todo')} className="text-[10px] font-bold bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-3 py-1.5 rounded-lg hover:bg-slate-200 transition">To Do</button>
                     )}
                     {col.id !== 'in-progress' && (
                         <button onClick={() => moveTask(task, 'in-progress')} className="text-[10px] font-bold bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-300 px-3 py-1.5 rounded-lg hover:bg-blue-100 transition">In Progress</button>
                     )}
                     {col.id !== 'done' && (
                         <button onClick={() => moveTask(task, 'done')} className="text-[10px] font-bold bg-green-50 text-green-600 dark:bg-green-900/30 dark:text-green-300 px-3 py-1.5 rounded-lg hover:bg-green-100 transition">Done</button>
                     )}
                  </div>
                </div>
              ))}
              {tasks.filter(t => t.status === col.id).length === 0 && (
                  <div className="h-32 border-2 border-dashed border-slate-200/50 dark:border-slate-700/50 rounded-2xl flex flex-col items-center justify-center text-slate-400 gap-2">
                      <span className="text-xs font-medium opacity-50">Drop task here</span>
                  </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default KanbanBoard;