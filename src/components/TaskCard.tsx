
import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Calendar, Paperclip, MessageSquare, CheckSquare } from 'lucide-react';
import { Task } from '../types';
import { AvatarStack } from './AvatarStack';
import { CardContextMenu } from './CardContextMenu';
import { useTasks } from '../context/TaskContext';

interface TaskCardProps {
  task: Task;
  columnTitle?: string;
}

export const TaskCard: React.FC<TaskCardProps> = ({ task, columnTitle = "To-do" }) => {
  const { selectedTaskId, setSelectedTaskId, availableMembers } = useTasks();
  const isSelected = selectedTaskId === task.id;

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: task.id,
    data: {
      type: 'Task',
      task,
    },
    disabled: isSelected,
  });

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
    opacity: isDragging ? 0.0 : 1,
  };

  const getPriorityStyles = (priority: string) => {
    switch (priority) {
      case 'High priority': return 'bg-priority-high-bg text-priority-high-text';
      case 'Medium priority': return 'bg-priority-medium-bg text-priority-medium-text';
      case 'Low priority': return 'bg-priority-low-bg text-priority-low-text';
      default: return 'bg-gray-50 text-gray-500';
    }
  };

  const stripHtml = (html: string) => {
    return html.replace(/<[^>]*>?/gm, ' ').replace(/\s+/g, ' ').trim();
  };

  const completedSubtasks = task.checklist.filter(item => item.completed).length;
  const totalSubtasks = task.checklist.length;

  const handleCardClick = (e: React.MouseEvent) => {
    // Prevent dragging or menu clicks from triggering the modal
    if ((e.target as HTMLElement).closest('button')) return;
    setSelectedTaskId(task.id);
  };

  const assigneeItems = task.assignees.map(url => {
    const member = availableMembers.find(m => m.avatar === url);
    return { url, name: member?.name || 'Unassigned' };
  });

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={handleCardClick}
      className={`group bg-white rounded-xl p-4 shadow-sm border mb-3 cursor-grab active:cursor-grabbing hover:border-brand-200 hover:shadow-md transition-all select-none touch-none relative ${isSelected ? 'border-brand-500 ring-2 ring-brand-100 shadow-brand-100' : 'border-gray-100'}`}
    >
      <div className="flex justify-between items-start mb-3">
        <div className="flex flex-wrap gap-1.5 max-w-[80%]">
          <span className={`text-[10px] lg:text-[11px] font-bold px-2 py-0.5 rounded-full ${getPriorityStyles(task.priority)}`}>
            {task.priority}
          </span>
          {task.labels?.map(label => (
            <span 
              key={label.id}
              className="text-[10px] lg:text-[11px] font-bold px-2 py-0.5 rounded-full"
              style={{ backgroundColor: `${label.color}15`, color: label.color }}
            >
              {label.name}
            </span>
          ))}
        </div>
        <CardContextMenu taskId={task.id} onEdit={() => setSelectedTaskId(task.id)} />
      </div>

      <h3 className="text-sm font-bold text-gray-900 mb-1 leading-snug">{task.title}</h3>
      <p className="text-[11px] text-gray-500 line-clamp-2 mb-4 font-medium leading-relaxed">
        {stripHtml(task.description)}
      </p>

      <div className="flex items-center justify-between mb-4">
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center text-gray-400 gap-1.5">
             <Calendar size={13} strokeWidth={2.5} />
             <span className="text-[11px] font-bold">{task.dueDate}</span>
          </div>
          {totalSubtasks > 0 && (
            <div className="flex items-center text-brand-600 gap-1.5">
               <CheckSquare size={13} strokeWidth={2.5} />
               <span className="text-[11px] font-bold">Checklist {completedSubtasks}/{totalSubtasks}</span>
            </div>
          )}
        </div>
        <AvatarStack items={assigneeItems} size="sm" />
      </div>

      {(task.statusChip || task.attachments > 0 || task.comments.length > 0 || totalSubtasks > 0) && (
        <div className="flex items-center justify-between pt-3 border-t border-gray-50">
          <div className="flex items-center gap-2">
            {task.statusChip && (
              <div 
                className="flex items-center gap-1.5 text-[10px] font-bold px-2 py-0.5 rounded-full border"
                style={{ backgroundColor: `${task.statusChip.color}15`, color: task.statusChip.color, borderColor: `${task.statusChip.color}25` }}
              >
                <span 
                  className="w-1.5 h-1.5 rounded-full" 
                  style={{ backgroundColor: task.statusChip.color }}
                />
                {task.statusChip.name}
              </div>
            )}
          </div>
          <div className="flex items-center gap-2.5 text-gray-400">
            <div className="flex items-center gap-1">
              <Paperclip size={13} strokeWidth={2.5} />
              <span className="text-[10px] lg:text-[11px] font-bold">{task.attachments}</span>
            </div>
            <div className="flex items-center gap-1">
              <MessageSquare size={13} strokeWidth={2.5} />
              <span className="text-[10px] lg:text-[11px] font-bold">{task.comments.length}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
