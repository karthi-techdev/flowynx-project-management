
import React from 'react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { MoreVertical, Edit2, Copy, ArrowRight, Trash2, ChevronRight, Link } from 'lucide-react';
import { useTasks } from '../context/TaskContext';

interface CardContextMenuProps {
  taskId: string;
  onEdit: () => void;
}

export const CardContextMenu: React.FC<CardContextMenuProps> = ({ taskId, onEdit }) => {
  const { deleteTask, duplicateTask, moveTask, columns, showToast } = useTasks();

  const handleCopyLink = () => {
    const dummyUrl = `https://clarity.app/task/${taskId}`;
    navigator.clipboard.writeText(dummyUrl);
    showToast('Link copied to clipboard');
  };

  const stopPropagation = (e: React.MouseEvent | React.PointerEvent) => {
    e.stopPropagation();
  };

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button 
          onClick={stopPropagation} 
          onPointerDown={stopPropagation}
          className="text-gray-400 hover:text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-gray-100 outline-none"
        >
          <MoreVertical size={16} />
        </button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content 
          className="min-w-[190px] bg-white rounded-xl shadow-2xl border border-gray-100 p-1.5 z-50 animate-in fade-in slide-in-from-top-1 duration-200"
          sideOffset={5}
          align="end"
          onCloseAutoFocus={(e) => e.preventDefault()}
          onClick={stopPropagation}
        >
          <DropdownMenu.Item 
            className="flex items-center gap-2.5 px-3 py-2.5 text-sm font-semibold text-gray-700 outline-none cursor-pointer rounded-lg hover:bg-brand-50 hover:text-brand-700 transition-colors"
            onSelect={(e) => {
              onEdit();
              showToast('Opening task editor');
            }}
            onClick={stopPropagation}
          >
            <Edit2 size={14} className="text-gray-400" />
            Edit Task
          </DropdownMenu.Item>

          <DropdownMenu.Sub>
            <DropdownMenu.SubTrigger 
              className="flex items-center justify-between px-3 py-2.5 text-sm font-semibold text-gray-700 outline-none cursor-pointer rounded-lg hover:bg-brand-50 hover:text-brand-700 transition-colors"
              onClick={stopPropagation}
            >
              <div className="flex items-center gap-2.5">
                <ArrowRight size={14} className="text-gray-400" />
                Move to...
              </div>
              <ChevronRight size={14} className="text-gray-300" />
            </DropdownMenu.SubTrigger>
            <DropdownMenu.Portal>
              <DropdownMenu.SubContent 
                className="min-w-[140px] bg-white rounded-xl shadow-2xl border border-gray-100 p-1.5 z-50 animate-in fade-in slide-in-from-left-1"
                sideOffset={2}
                onClick={stopPropagation}
              >
                {columns.map(col => (
                  <DropdownMenu.Item 
                    key={col.id}
                    className="flex items-center gap-2 px-3 py-2 text-sm font-semibold text-gray-700 outline-none cursor-pointer rounded-lg hover:bg-brand-50 hover:text-brand-700 transition-colors"
                    onSelect={() => moveTask(taskId, col.id)}
                    onClick={stopPropagation}
                  >
                    {col.title}
                  </DropdownMenu.Item>
                ))}
              </DropdownMenu.SubContent>
            </DropdownMenu.Portal>
          </DropdownMenu.Sub>

          <DropdownMenu.Item 
            className="flex items-center gap-2.5 px-3 py-2.5 text-sm font-semibold text-gray-700 outline-none cursor-pointer rounded-lg hover:bg-brand-50 hover:text-brand-700 transition-colors"
            onSelect={() => duplicateTask(taskId)}
            onClick={stopPropagation}
          >
            <Copy size={14} className="text-gray-400" />
            Duplicate
          </DropdownMenu.Item>

          <DropdownMenu.Item 
            className="flex items-center gap-2.5 px-3 py-2.5 text-sm font-semibold text-gray-700 outline-none cursor-pointer rounded-lg hover:bg-brand-50 hover:text-brand-700 transition-colors"
            onSelect={handleCopyLink}
            onClick={stopPropagation}
          >
            <Link size={14} className="text-gray-400" />
            Copy Link
          </DropdownMenu.Item>

          <DropdownMenu.Separator className="h-[1px] bg-gray-100 my-1 mx-1" />

          <DropdownMenu.Item 
            className="flex items-center gap-2.5 px-3 py-2.5 text-sm font-bold text-red-500 outline-none cursor-pointer rounded-lg hover:bg-red-50 transition-colors"
            onSelect={() => deleteTask(taskId)}
            onClick={stopPropagation}
          >
            <Trash2 size={14} />
            Delete
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
};
