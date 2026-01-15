
import React, { useState } from 'react';
import { useTasks } from '../context/TaskContext';
import { 
  Calendar, MessageSquare, CheckSquare, Paperclip, ChevronRight, 
  MoreHorizontal, Plus, Copy, Trash2, Edit2, ChevronDown, GripVertical, Check
} from 'lucide-react';
import { Task } from '../types';

export const ListView: React.FC = () => {
  const { filteredColumns, setSelectedTaskId, addTask, duplicateTask, deleteTask } = useTasks();
  const [collapsedSections, setCollapsedSections] = useState<string[]>([]);
  const [quickAddColumnId, setQuickAddColumnId] = useState<string | null>(null);
  const [newTitle, setNewTitle] = useState('');

  const toggleSection = (columnId: string) => {
    setCollapsedSections(prev => 
      prev.includes(columnId) ? prev.filter(id => id !== columnId) : [...prev, columnId]
    );
  };

  const handleQuickAdd = (columnId: string) => {
    if (newTitle.trim()) {
      const newId = addTask(columnId);
      setNewTitle('');
      setQuickAddColumnId(null);
    }
  };

  const getPriorityStyles = (priority: string) => {
    switch (priority) {
      case 'High priority': return 'bg-priority-high-bg text-priority-high-text';
      case 'Medium priority': return 'bg-priority-medium-bg text-priority-medium-text';
      case 'Low priority': return 'bg-priority-low-bg text-priority-low-text';
      default: return 'bg-gray-50 text-gray-500';
    }
  };

  return (
    <div className="flex flex-col gap-6 md:gap-8 pb-20 animate-in fade-in duration-500 overflow-y-auto custom-scrollbar pr-1 md:pr-2">
      {filteredColumns.map(column => (
        <div key={column.id} className="space-y-3 md:space-y-4">
          <div className="flex items-center justify-between px-2">
            <div className="flex items-center gap-3">
              <button 
                onClick={() => toggleSection(column.id)}
                className={`p-1 rounded-lg hover:bg-gray-100 transition-all ${collapsedSections.includes(column.id) ? '-rotate-90' : ''}`}
              >
                <ChevronDown size={18} className="text-gray-400" />
              </button>
              <h2 className="text-[11px] md:text-[13px] font-bold text-gray-900 uppercase tracking-widest">{column.title}</h2>
              <span className="text-[9px] md:text-[10px] font-bold text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">{column.tasks.length}</span>
            </div>
            <button 
              onClick={() => { setQuickAddColumnId(column.id); setNewTitle(''); }}
              className="text-gray-400 hover:text-brand-600 p-1 rounded-lg hover:bg-white transition-all"
            >
              <Plus size={18} />
            </button>
          </div>
          
          {!collapsedSections.includes(column.id) && (
            <div className="bg-white rounded-[1.25rem] md:rounded-[1.5rem] border border-gray-100 shadow-sm overflow-hidden animate-in slide-in-from-top-2 duration-300">
              <div className="hidden md:grid grid-cols-12 px-6 py-3.5 border-b border-gray-50 text-[10px] font-bold text-gray-400 uppercase tracking-[0.1em] bg-gray-50/30">
                <div className="col-span-6">Task Name</div>
                <div className="col-span-2">Priority</div>
                <div className="col-span-2">Due Date</div>
                <div className="col-span-2 text-right">Activity</div>
              </div>
              
              <div className="divide-y divide-gray-50">
                {column.tasks.map(task => (
                  <div 
                    key={task.id}
                    className="grid grid-cols-12 w-full px-4 md:px-6 py-3 md:py-4 items-center hover:bg-gray-50/30 transition-all group relative"
                  >
                    <div 
                      className="col-span-9 md:col-span-6 flex items-center gap-3 md:gap-4 min-w-0 cursor-pointer"
                      onClick={() => setSelectedTaskId(task.id)}
                    >
                      <div className="w-1.5 h-8 rounded-full bg-gray-100 opacity-0 group-hover:opacity-100 transition-opacity absolute left-0.5 md:left-1" />
                      <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400 shrink-0 group-hover:bg-brand-50 group-hover:text-brand-600 transition-all duration-300">
                        <CheckSquare size={16} className="md:w-[18px]" />
                      </div>
                      <div className="min-w-0 pr-2">
                        <p className="text-[13px] md:text-[14px] font-bold text-gray-900 truncate group-hover:text-brand-600 transition-colors leading-tight">{task.title}</p>
                        <p className="text-[10px] md:text-[11px] text-gray-400 font-medium truncate mt-0.5">{task.description}</p>
                      </div>
                    </div>
                    
                    <div className="hidden md:block col-span-2">
                      <span className={`text-[10px] font-bold px-3 py-1 rounded-full border border-transparent group-hover:border-white shadow-sm transition-all ${getPriorityStyles(task.priority)}`}>
                        {task.priority}
                      </span>
                    </div>
                    
                    <div className="col-span-3 md:col-span-2 flex items-center justify-end md:justify-start gap-1 md:gap-2 text-gray-500 font-bold text-[10px] md:text-xs">
                      <Calendar size={12} className="text-gray-300 shrink-0" />
                      {task.dueDate}
                    </div>
                    
                    <div className="hidden md:flex col-span-2 items-center justify-end gap-3 text-gray-400 relative">
                      <div className="flex items-center gap-3 group-hover:opacity-0 transition-opacity">
                        <div className="flex items-center gap-1.5">
                          <MessageSquare size={14} />
                          <span className="text-[10px] font-bold">{task.comments.length}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Paperclip size={14} />
                          <span className="text-[10px] font-bold">{task.attachments}</span>
                        </div>
                      </div>

                      {/* Hover actions */}
                      <div className="absolute inset-0 flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-all">
                        <button 
                          onClick={() => setSelectedTaskId(task.id)}
                          className="p-1.5 md:p-2 text-gray-400 hover:text-brand-600 hover:bg-white rounded-xl shadow-sm border border-transparent hover:border-brand-100 transition-all"
                          title="Edit Task"
                        >
                          <Edit2 size={14} className="md:w-4" />
                        </button>
                        <button 
                          onClick={() => duplicateTask(task.id)}
                          className="p-1.5 md:p-2 text-gray-400 hover:text-brand-600 hover:bg-white rounded-xl shadow-sm border border-transparent hover:border-brand-100 transition-all"
                          title="Duplicate Task"
                        >
                          <Copy size={14} className="md:w-4" />
                        </button>
                        <button 
                          onClick={() => deleteTask(task.id)}
                          className="p-1.5 md:p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl shadow-sm border border-transparent hover:border-red-100 transition-all"
                          title="Delete Task"
                        >
                          <Trash2 size={14} className="md:w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}

                {/* Quick Add Row */}
                {quickAddColumnId === column.id ? (
                  <div className="px-4 md:px-6 py-3 md:py-4 bg-brand-50/30 animate-in fade-in duration-200">
                    <div className="flex items-center gap-3 md:gap-4">
                      <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl bg-white border border-brand-200 flex items-center justify-center text-brand-600 shadow-sm shrink-0">
                        <Plus size={16} className="md:w-5" />
                      </div>
                      <input 
                        autoFocus
                        value={newTitle}
                        onChange={(e) => setNewTitle(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleQuickAdd(column.id);
                          if (e.key === 'Escape') setQuickAddColumnId(null);
                        }}
                        onBlur={() => !newTitle && setQuickAddColumnId(null)}
                        placeholder="What needs to be done?"
                        className="flex-1 bg-transparent border-none outline-none text-[13px] md:text-[14px] font-bold text-gray-900 placeholder:text-gray-400"
                      />
                      <div className="flex items-center gap-1.5 md:gap-2">
                        <button 
                          onClick={() => handleQuickAdd(column.id)}
                          disabled={!newTitle.trim()}
                          className="bg-brand-500 text-white p-1.5 md:p-2 rounded-xl shadow-lg shadow-brand-100 hover:bg-brand-600 disabled:opacity-50 transition-all"
                        >
                          <Check size={16} className="md:w-[18px]" />
                        </button>
                        <button 
                          onClick={() => setQuickAddColumnId(null)}
                          className="p-1.5 md:p-2 text-gray-400 hover:text-gray-900 rounded-xl hover:bg-white transition-all"
                        >
                          <Plus size={16} className="rotate-45 md:w-[18px]" />
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <button 
                    onClick={() => { setQuickAddColumnId(column.id); setNewTitle(''); }}
                    className="w-full px-4 md:px-6 py-3 md:py-4 flex items-center gap-3 md:gap-4 text-gray-400 hover:text-brand-600 hover:bg-gray-50/30 transition-all group"
                  >
                    <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl border border-dashed border-gray-200 flex items-center justify-center group-hover:border-brand-200 group-hover:bg-white transition-all shrink-0">
                      <Plus size={16} className="md:w-[18px]" />
                    </div>
                    <span className="text-[10px] md:text-[11px] font-bold uppercase tracking-widest text-left">Add a task to {column.title}</span>
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};
