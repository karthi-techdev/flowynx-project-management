
import React, { useState } from 'react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { useSortable, SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Plus, MoreHorizontal, Edit2, Trash2, ArrowLeft, ArrowRight, Eraser, Check } from 'lucide-react';
import { ColumnData } from '../types';
import { TaskCard } from './TaskCard';
import { useTasks } from '../context/TaskContext';

interface SortableColumnProps {
  column: ColumnData;
}

export const SortableColumn: React.FC<SortableColumnProps> = ({ column }) => {
  const { addTask, renameColumn, deleteColumn, clearColumn, moveColumn } = useTasks();
  const [isRenaming, setIsRenaming] = useState(false);
  const [newTitle, setNewTitle] = useState(column.title);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: column.id,
    data: {
      type: 'Column',
      column,
    },
    disabled: isRenaming
  });

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
    opacity: isDragging ? 0.3 : 1,
  };

  const handleRenameSubmit = () => {
    if (newTitle.trim()) {
      renameColumn(column.id, newTitle.trim());
    }
    setIsRenaming(false);
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="w-[280px] lg:w-72 flex flex-col h-auto"
    >
      <div 
        {...attributes} 
        {...listeners} 
        className="flex items-center justify-between mb-4 px-1 cursor-grab active:cursor-grabbing group select-none flex-shrink-0"
      >
        <div className="flex items-center gap-2 flex-1">
          {isRenaming ? (
            <div className="flex items-center gap-1 w-full" onClick={(e) => e.stopPropagation()}>
              <input 
                autoFocus
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                onBlur={handleRenameSubmit}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleRenameSubmit();
                  if (e.key === 'Escape') { setNewTitle(column.title); setIsRenaming(false); }
                }}
                className="text-xs lg:text-sm font-bold text-gray-900 border-b-2 border-brand-500 outline-none bg-transparent w-full"
              />
              <button onMouseDown={handleRenameSubmit} className="text-brand-600"><Check size={14} strokeWidth={3} /></button>
            </div>
          ) : (
            <>
              <h2 className="text-xs lg:text-sm font-bold text-gray-700 group-hover:text-brand-600 transition-colors">
                {column.title}
              </h2>
              <span className="w-5 h-5 flex items-center justify-center text-[10px] font-bold text-gray-400 bg-gray-100 rounded-full">
                {column.tasks.length}
              </span>
            </>
          )}
        </div>

        <DropdownMenu.Root>
          <DropdownMenu.Trigger asChild>
            <button 
              className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100 transition-colors"
              onClick={(e) => e.stopPropagation()}
            >
              <MoreHorizontal size={18} />
            </button>
          </DropdownMenu.Trigger>

          <DropdownMenu.Portal>
            <DropdownMenu.Content 
              className="min-w-[200px] bg-white rounded-2xl shadow-2xl border border-gray-100 p-1.5 z-50 animate-in fade-in zoom-in-95 duration-200"
              sideOffset={5}
              align="end"
              onCloseAutoFocus={(e) => e.preventDefault()}
            >
              <DropdownMenu.Item 
                className="flex items-center gap-2.5 px-3 py-2.5 text-xs lg:text-sm font-bold text-gray-700 outline-none cursor-pointer rounded-xl hover:bg-brand-50 hover:text-brand-700 transition-colors"
                onSelect={() => addTask(column.id)}
              >
                <Plus size={14} className="text-gray-400" />
                Add Task
              </DropdownMenu.Item>

              <DropdownMenu.Item 
                className="flex items-center gap-2.5 px-3 py-2.5 text-xs lg:text-sm font-bold text-gray-700 outline-none cursor-pointer rounded-xl hover:bg-brand-50 hover:text-brand-700 transition-colors"
                onSelect={() => { setTimeout(() => setIsRenaming(true), 100); }}
              >
                <Edit2 size={14} className="text-gray-400" />
                Rename Column
              </DropdownMenu.Item>

              <DropdownMenu.Separator className="h-[1px] bg-gray-100 my-1.5 mx-1" />

              <DropdownMenu.Item 
                className="flex items-center gap-2.5 px-3 py-2.5 text-xs lg:text-sm font-bold text-gray-700 outline-none cursor-pointer rounded-xl hover:bg-gray-50 transition-colors"
                onSelect={() => moveColumn(column.id, 'left')}
              >
                <ArrowLeft size={14} className="text-gray-400" />
                Move Left
              </DropdownMenu.Item>

              <DropdownMenu.Item 
                className="flex items-center gap-2.5 px-3 py-2.5 text-xs lg:text-sm font-bold text-gray-700 outline-none cursor-pointer rounded-xl hover:bg-gray-50 transition-colors"
                onSelect={() => moveColumn(column.id, 'right')}
              >
                <ArrowRight size={14} className="text-gray-400" />
                Move Right
              </DropdownMenu.Item>

              <DropdownMenu.Separator className="h-[1px] bg-gray-100 my-1.5 mx-1" />

              <DropdownMenu.Item 
                className="flex items-center gap-2.5 px-3 py-2.5 text-xs lg:text-sm font-bold text-gray-700 outline-none cursor-pointer rounded-xl hover:bg-amber-50 hover:text-amber-700 transition-colors"
                onSelect={() => clearColumn(column.id)}
              >
                <Eraser size={14} className="text-amber-400" />
                Clear All Tasks
              </DropdownMenu.Item>

              <DropdownMenu.Item 
                className="flex items-center gap-2.5 px-3 py-2.5 text-xs lg:text-sm font-bold text-red-500 outline-none cursor-pointer rounded-xl hover:bg-red-50 transition-colors"
                onSelect={() => deleteColumn(column.id)}
              >
                <Trash2 size={14} />
                Delete Board
              </DropdownMenu.Item>
            </DropdownMenu.Content>
          </DropdownMenu.Portal>
        </DropdownMenu.Root>
      </div>
      
      <div className={`rounded-xl bg-gray-50/50 p-2 border border-transparent min-h-[500px] flex flex-col transition-colors ${isDragging ? 'bg-gray-100/50' : ''}`}>
        <SortableContext items={column.tasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
          <div className="flex flex-col flex-1">
            {column.tasks.map(task => (
              <TaskCard key={task.id} task={task} columnTitle={column.title} />
            ))}
          </div>
        </SortableContext>
        
        <button 
          onClick={() => addTask(column.id)}
          className="mt-2 flex items-center gap-2 p-2.5 text-[11px] font-bold text-gray-400 hover:text-brand-600 hover:bg-white rounded-xl transition-all group"
        >
          <Plus size={14} className="group-hover:scale-110 transition-transform" />
          Add a task
        </button>
      </div>
    </div>
  );
};
