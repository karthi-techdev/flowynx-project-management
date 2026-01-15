
import React, { useState } from 'react';
import { 
  format, 
  addMonths, 
  subMonths, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  isSameMonth, 
  isSameDay, 
  eachDayOfInterval,
  parse,
  isToday
} from 'date-fns';
import { ChevronLeft, ChevronRight, Plus, CheckSquare, MessageSquare, Paperclip, MoreHorizontal } from 'lucide-react';
import { useTasks } from '../context/TaskContext';
import { Task } from '../types';

export const CalendarView: React.FC = () => {
  const { filteredColumns, setSelectedTaskId, addTask, updateTask, availableMembers } = useTasks();
  const [currentMonth, setCurrentMonth] = useState(new Date());

  // Flatten all tasks from columns
  const allTasks = filteredColumns.flatMap(col => col.tasks);

  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const goToToday = () => setCurrentMonth(new Date());

  const handleQuickAddTask = (day: Date) => {
    const newTaskId = addTask('todo');
    updateTask(newTaskId, { dueDate: format(day, 'dd.MM.yy') });
    setSelectedTaskId(newTaskId);
  };

  const renderHeader = () => {
    return (
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 md:mb-8 animate-in fade-in duration-300">
        <h2 className="text-xl md:text-2xl font-bold text-gray-900 tracking-tight">
          {format(currentMonth, 'MMMM yyyy')}
        </h2>
        <div className="flex items-center gap-2 md:gap-3 bg-white border border-gray-100 rounded-2xl p-1 md:p-1.5 shadow-sm">
          <button 
            onClick={prevMonth}
            className="p-1.5 md:p-2 text-gray-400 hover:text-brand-600 hover:bg-brand-50 rounded-xl transition-all"
            title="Previous Month"
          >
            <ChevronLeft size={18} className="md:w-5" />
          </button>
          <button 
            onClick={goToToday}
            className="px-3 md:px-5 py-1.5 md:py-2 text-[10px] md:text-xs font-bold text-gray-500 hover:text-brand-600 hover:bg-brand-50 rounded-xl transition-all uppercase tracking-widest"
          >
            Today
          </button>
          <button 
            onClick={nextMonth}
            className="p-1.5 md:p-2 text-gray-400 hover:text-brand-600 hover:bg-brand-50 rounded-xl transition-all"
            title="Next Month"
          >
            <ChevronRight size={18} className="md:w-5" />
          </button>
        </div>
      </div>
    );
  };

  const renderDaysHeader = () => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return (
      <div className="grid grid-cols-7 border-b border-gray-100 bg-gray-50/40">
        {days.map(day => (
          <div key={day} className="py-2.5 md:py-4 text-center text-[9px] md:text-[11px] font-bold text-gray-400 uppercase tracking-[0.1em] md:tracking-[0.2em]">
            {day}
          </div>
        ))}
      </div>
    );
  };

  const renderCells = () => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

    const days = eachDayOfInterval({ start: startDate, end: endDate });

    const getTasksForDay = (day: Date) => {
      return allTasks.filter(task => {
        try {
          const taskDate = parse(task.dueDate, 'dd.MM.yy', new Date());
          return isSameDay(taskDate, day);
        } catch (e) {
          return false;
        }
      });
    };

    const getPriorityColor = (priority: string) => {
      switch (priority) {
        case 'High priority': return 'bg-red-500';
        case 'Medium priority': return 'bg-amber-500';
        case 'Low priority': return 'bg-emerald-500';
        default: return 'bg-gray-300';
      }
    };

    return (
      <div className="grid grid-cols-7 border-l border-gray-100 bg-gray-100/10">
        {days.map((day, i) => {
          const dayTasks = getTasksForDay(day);
          const isTodayDate = isToday(day);
          const isCurrentMonth = isSameMonth(day, monthStart);

          return (
            <div 
              key={day.toString()}
              className={`
                min-h-[100px] md:min-h-[160px] p-1.5 md:p-3 border-r border-b border-gray-100 flex flex-col gap-1 md:gap-2 transition-all relative group/cell
                ${!isCurrentMonth ? 'bg-gray-50/50 text-gray-300' : 'bg-white text-gray-700'}
                hover:bg-brand-50/5
              `}
            >
              <div className="flex justify-between items-center mb-0.5 md:mb-1">
                <span className={`
                  text-[11px] md:text-[13px] font-bold w-6 h-6 md:w-8 md:h-8 flex items-center justify-center rounded-lg md:rounded-xl transition-all
                  ${isTodayDate 
                    ? 'bg-brand-500 text-white shadow-lg shadow-brand-100 scale-105 md:scale-110 z-10' 
                    : isCurrentMonth ? 'text-gray-900 group-hover/cell:text-brand-600' : 'text-gray-300'}
                `}>
                  {format(day, 'd')}
                </span>
                
                {isCurrentMonth && (
                  <button 
                    onClick={() => handleQuickAddTask(day)}
                    className="opacity-0 group-hover/cell:opacity-100 p-1 text-gray-300 hover:text-brand-600 hover:bg-white rounded-lg transition-all shadow-sm z-10 hidden md:block"
                    title="Quick add task"
                  >
                    <Plus size={14} />
                  </button>
                )}
              </div>

              <div className="flex flex-col gap-1 md:gap-2 overflow-y-auto no-scrollbar flex-1 pb-1 md:pb-2 scroll-smooth">
                {dayTasks.map(task => (
                  <button
                    key={task.id}
                    onClick={() => setSelectedTaskId(task.id)}
                    className="flex flex-col gap-0.5 md:gap-1 text-left p-1.5 md:p-2.5 rounded-lg md:rounded-xl bg-white border border-gray-100 shadow-xs hover:border-brand-200 hover:shadow-md transition-all active:scale-[0.98] group/task relative overflow-hidden"
                  >
                    <div className={`absolute top-0 left-0 w-1 md:w-1.5 h-full ${getPriorityColor(task.priority)} opacity-80`} />
                    
                    <div className="flex items-center gap-1">
                      <span className="text-[9px] md:text-[11px] font-bold text-gray-900 line-clamp-1 group-hover/task:text-brand-600 transition-colors">
                        {task.title}
                      </span>
                    </div>

                    {task.statusChip && (
                      <div 
                        className="text-[7px] md:text-[9px] font-bold px-1.5 py-0.5 rounded-md inline-flex w-fit max-w-full truncate hidden md:block"
                        style={{ backgroundColor: `${task.statusChip.color}15`, color: task.statusChip.color }}
                      >
                        {task.statusChip.name}
                      </div>
                    )}

                    <div className="hidden md:flex items-center justify-between mt-1 pt-1 border-t border-gray-50/50">
                      <div className="flex items-center gap-2 text-gray-400">
                        {task.comments.length > 0 && (
                          <div className="flex items-center gap-0.5 text-[9px] font-bold">
                            <MessageSquare size={10} strokeWidth={3} />
                            {task.comments.length}
                          </div>
                        )}
                      </div>
                      <div className="flex -space-x-1.5">
                        {task.assignees.slice(0, 2).map((url, i) => (
                          <img 
                            key={i} 
                            src={url} 
                            className="w-3.5 h-3.5 rounded-full border border-white shadow-xs object-cover" 
                            alt="Assignee" 
                          />
                        ))}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full animate-in fade-in slide-in-from-bottom-3 duration-500 overflow-hidden pr-0.5 md:pr-1">
      {renderHeader()}
      <div className="flex-1 flex flex-col bg-white rounded-[1.5rem] md:rounded-[2.5rem] shadow-2xl shadow-gray-200/40 border border-gray-100 overflow-hidden mb-6 md:mb-10">
        <div className="overflow-x-auto no-scrollbar">
          <div className="min-w-[500px] md:min-w-full flex flex-col h-full">
            {renderDaysHeader()}
            <div className="flex-1 overflow-y-auto custom-scrollbar bg-white">
              {renderCells()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
