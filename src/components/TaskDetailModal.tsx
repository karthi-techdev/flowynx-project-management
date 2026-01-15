
import React, { useState, useRef, useEffect, useMemo } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import * as Popover from '@radix-ui/react-popover';
import { 
  X, ChevronRight, MessageSquare, Plus, Clock, Paperclip, 
  CheckSquare, Calendar as CalendarIcon, Bold, Italic, List, Send, Image as ImageIcon, Check, Tag, Trash2, Edit2, UserPlus, ChevronLeft, Search
} from 'lucide-react';
import { DayPicker } from 'react-day-picker';
import { format, parse } from 'date-fns';
import { Task, Priority, StatusFlag, Label, ChecklistItem, Member } from '../types';
import { useTasks } from '../context/TaskContext';

interface RichTextEditorProps {
  value: string;
  onSave: (value: string) => void;
  placeholder?: string;
}

const RichTextEditor: React.FC<RichTextEditorProps> = ({ value, onSave, placeholder }) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [currentValue, setCurrentValue] = useState(value);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value;
      setCurrentValue(value);
    }
  }, [value]);

  const handleCommand = (command: string, value: string = '') => {
    document.execCommand(command, false, value);
    if (editorRef.current) {
      const html = editorRef.current.innerHTML;
      setCurrentValue(html);
      setHasChanges(true);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target?.result as string;
        handleCommand('insertImage', base64);
      };
      reader.readAsDataURL(file);
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    const items = e.clipboardData.items;
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf('image') !== -1) {
        const blob = items[i].getAsFile();
        if (blob) {
          const reader = new FileReader();
          reader.onload = (event) => {
            const base64 = event.target?.result as string;
            handleCommand('insertImage', base64);
          };
          reader.readAsDataURL(blob);
          e.preventDefault();
        }
      }
    }
  };

  const handleInput = () => {
    if (editorRef.current) {
      const html = editorRef.current.innerHTML;
      setCurrentValue(html);
      setHasChanges(true);
    }
  };

  const handleSave = () => {
    onSave(currentValue);
    setHasChanges(false);
  };

  return (
    <div className="space-y-3">
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
        className="hidden" 
        accept="image/*" 
      />
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm focus-within:border-brand-300 transition-all">
        <div className="flex items-center justify-between p-2.5 bg-white border-b border-gray-100">
          <div className="flex items-center gap-1">
            <button 
              onMouseDown={(e) => { e.preventDefault(); handleCommand('bold'); }}
              className="p-2 rounded-lg hover:bg-gray-50 text-gray-500 hover:text-brand-600 transition-all"
              title="Bold"
            >
              <Bold size={16} />
            </button>
            <button 
              onMouseDown={(e) => { e.preventDefault(); handleCommand('italic'); }}
              className="p-2 rounded-lg hover:bg-gray-50 text-gray-500 hover:text-brand-600 transition-all"
              title="Italic"
            >
              <Italic size={16} />
            </button>
            <button 
              onMouseDown={(e) => { e.preventDefault(); handleCommand('insertUnorderedList'); }}
              className="p-2 rounded-lg hover:bg-gray-50 text-gray-500 hover:text-brand-600 transition-all"
              title="Bullet List"
            >
              <List size={16} />
            </button>
            <div className="w-[1px] h-4 bg-gray-200 mx-1.5" />
            <button 
              onMouseDown={(e) => { e.preventDefault(); fileInputRef.current?.click(); }}
              className="p-2 rounded-lg hover:bg-gray-50 text-gray-500 hover:text-brand-600 transition-all"
              title="Insert Image"
            >
              <ImageIcon size={16} />
            </button>
          </div>
          
          {hasChanges && (
            <button 
              onClick={handleSave}
              className="flex items-center gap-1.5 px-4 py-1.5 bg-brand-500 text-white text-xs font-bold rounded-xl hover:bg-brand-600 transition-all shadow-md shadow-brand-100"
            >
              <Check size={14} />
              Save
            </button>
          )}
        </div>
        <div 
          ref={editorRef}
          contentEditable
          onInput={handleInput}
          onPaste={handlePaste}
          className="p-5 text-sm text-gray-700 min-h-[160px] outline-none leading-relaxed prose prose-sm max-w-none focus:ring-0 whitespace-pre-wrap selection:bg-brand-100"
          data-placeholder={placeholder}
        />
      </div>
    </div>
  );
};

const LABEL_COLORS = [
  '#0EA5E9', '#8B5CF6', '#10B981', '#EF4444', 
  '#F59E0B', '#6366F1', '#EC4899', '#64748B',
];

interface MemberPickerProps {
  taskId: string;
  assignees: string[];
}

const MemberPicker: React.FC<MemberPickerProps> = ({ taskId, assignees }) => {
  const { availableMembers, addAssignee, removeAssignee } = useTasks();
  const [search, setSearch] = useState('');

  const toggleMember = (url: string) => {
    if (assignees.includes(url)) {
      removeAssignee(taskId, url);
    } else {
      addAssignee(taskId, url);
    }
  };

  const filtered = availableMembers.filter(m => 
    m.name.toLowerCase().includes(search.toLowerCase()) || 
    m.username.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="w-72 bg-white rounded-2xl shadow-2xl border border-gray-100 p-1.5 animate-in fade-in zoom-in-95 duration-200 z-[70]">
      <div className="p-3 border-b border-gray-50 flex flex-col gap-3">
        <span className="text-xs font-bold text-gray-900">Manage Assignees</span>
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input 
            autoFocus
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search team..."
            className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-100 rounded-xl text-xs font-medium outline-none focus:bg-white focus:border-brand-200 transition-all"
          />
        </div>
      </div>
      <div className="max-h-64 overflow-y-auto p-1 space-y-0.5 custom-scrollbar mt-1">
        {filtered.map((member) => (
          <button 
            key={member.id}
            onClick={() => toggleMember(member.avatar)}
            className={`w-full flex items-center justify-between px-3 py-2.5 text-xs font-bold text-gray-700 hover:bg-gray-50 rounded-xl transition-all ${assignees.includes(member.avatar) ? 'bg-brand-50' : ''}`}
          >
            <div className="flex items-center gap-3">
              <img src={member.avatar} className={`w-8 h-8 rounded-full border-2 transition-all shadow-sm object-cover ${assignees.includes(member.avatar) ? 'border-brand-500' : 'border-white'}`} alt={member.name} />
              <div className="text-left">
                <p className="text-gray-900 leading-tight">{member.name}</p>
                <p className="text-[10px] text-gray-400 font-medium">{member.username}</p>
              </div>
            </div>
            {assignees.includes(member.avatar) && <Check size={16} className="text-brand-600" />}
          </button>
        ))}
      </div>
    </div>
  );
};

const CustomCalendar: React.FC<{ selected?: Date, onSelect: (date: Date | undefined) => void }> = ({ selected, onSelect }) => {
  return (
    <DayPicker
      mode="single"
      selected={selected}
      onSelect={onSelect}
      showOutsideDays
      className="p-3 bg-white"
      classNames={{
        months: "flex flex-col space-y-4",
        month: "space-y-4",
        caption: "flex justify-start pt-1 relative items-center mb-2 px-1",
        caption_label: "text-sm font-bold text-gray-900",
        nav: "flex items-center gap-1 absolute right-1",
        nav_button: "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 transition-opacity flex items-center justify-center rounded-lg hover:bg-gray-50",
        nav_button_previous: "",
        nav_button_next: "",
        table: "w-full border-collapse space-y-1",
        head_row: "flex mb-2",
        head_cell: "text-gray-900 rounded-md w-9 font-bold text-[13px] uppercase tracking-tighter",
        row: "flex w-full mt-1",
        cell: "relative p-0 text-center text-sm focus-within:relative focus-within:z-20",
        day: "h-9 w-9 p-0 font-bold aria-selected:opacity-100 hover:bg-gray-50 rounded-lg transition-colors text-gray-900",
        day_selected: "bg-gray-900 text-white hover:bg-gray-900 hover:text-white focus:bg-gray-900 focus:text-white rounded-lg",
        day_today: "bg-gray-100 text-gray-900",
        day_outside: "text-gray-400 opacity-50",
        day_disabled: "text-gray-400 opacity-50",
        day_range_middle: "aria-selected:bg-accent aria-selected:text-accent-foreground",
        day_hidden: "invisible",
      }}
      components={{
        IconLeft: ({ ...props }) => <ChevronLeft className="h-4 w-4" />,
        IconRight: ({ ...props }) => <ChevronRight className="h-4 w-4" />,
      }}
    />
  );
};

interface LabelEditorProps {
  label?: Label;
  onSave: (label: Label) => void;
  onDelete?: () => void;
  onClose: () => void;
}

const LabelEditor: React.FC<LabelEditorProps> = ({ label, onSave, onDelete, onClose }) => {
  const [name, setName] = useState(label?.name || '');
  const [color, setColor] = useState(label?.color || LABEL_COLORS[0]);

  return (
    <div className="p-4 w-64 bg-white rounded-xl shadow-2xl border border-gray-100 space-y-4 animate-in fade-in zoom-in-95 duration-200 z-[70]">
      <div className="space-y-2">
        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Label Name</label>
        <input 
          autoFocus
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Design"
          className="w-full text-sm font-bold p-2.5 bg-white border border-gray-100 rounded-xl outline-none focus:border-brand-300 transition-all shadow-sm"
        />
      </div>
      <div className="space-y-2">
        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Pick Color</label>
        <div className="grid grid-cols-4 gap-2">
          {LABEL_COLORS.map(c => (
            <button 
              key={c}
              onClick={() => setColor(c)}
              className={`w-full aspect-square rounded-lg transition-transform hover:scale-110 flex items-center justify-center ${color === c ? 'ring-2 ring-offset-2 ring-gray-200 shadow-md' : 'shadow-sm'}`}
              style={{ backgroundColor: c }}
            >
              {color === c && <Check size={14} className="text-white" />}
            </button>
          ))}
        </div>
      </div>
      <div className="flex flex-col gap-2 pt-2">
        <div className="flex gap-2">
          <button onClick={onClose} className="flex-1 px-3 py-2 text-xs font-bold text-gray-500 hover:bg-gray-100 rounded-lg transition-all">Cancel</button>
          <button 
            disabled={!name.trim()}
            onClick={() => onSave({ id: label?.id || `l-${Date.now()}`, name, color })}
            className="flex-1 px-3 py-2 text-xs font-bold text-white bg-brand-500 hover:bg-brand-600 rounded-lg shadow-md transition-all disabled:opacity-50"
          >
            {label ? 'Update' : 'Add'}
          </button>
        </div>
        {label && onDelete && (
          <button onClick={onDelete} className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-bold text-red-500 hover:bg-red-50 rounded-lg transition-all">
            <Trash2 size={14} /> Remove Label
          </button>
        )}
      </div>
    </div>
  );
};

interface LabelPickerProps {
  taskId: string;
  onClose: () => void;
}

const LabelPicker: React.FC<LabelPickerProps> = ({ taskId, onClose }) => {
  const { availableLabels, addLabel } = useTasks();
  const [isCreating, setIsCreating] = useState(false);

  if (isCreating) {
    return <LabelEditor onSave={(l) => { addLabel(taskId, l); onClose(); }} onClose={() => setIsCreating(false)} />;
  }

  return (
    <div className="w-64 bg-white rounded-2xl shadow-2xl border border-gray-100 p-1 animate-in fade-in zoom-in-95 duration-200 z-[70]">
      <div className="p-3 border-b border-gray-50 flex items-center justify-between">
        <span className="text-xs font-bold text-gray-900">Labels</span>
        <button 
          onClick={() => setIsCreating(true)}
          className="p-1.5 text-brand-600 hover:bg-brand-50 rounded-lg transition-colors"
        >
          <Plus size={16} />
        </button>
      </div>
      <div className="max-h-64 overflow-y-auto p-1 space-y-1 custom-scrollbar">
        {availableLabels.length === 0 ? (
          <div className="px-3 py-4 text-center">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">No Labels Found</p>
            <button 
              onClick={() => setIsCreating(true)}
              className="text-xs font-bold text-brand-600 hover:underline"
            >
              Create your first label
            </button>
          </div>
        ) : (
          availableLabels.map(label => (
            <button 
              key={label.id}
              onClick={() => { addLabel(taskId, label); onClose(); }}
              className="w-full flex items-center gap-2.5 px-3 py-2.5 text-xs font-bold text-gray-700 hover:bg-gray-50 rounded-xl transition-all"
            >
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: label.color }} />
              <span>{label.name}</span>
            </button>
          ))
        )}
      </div>
    </div>
  );
};

interface StatusFlagManagerProps {
  currentChip?: StatusFlag;
  onSelect: (chip?: StatusFlag) => void;
}

const StatusFlagManager: React.FC<StatusFlagManagerProps> = ({ currentChip, onSelect }) => {
  const { availableStatusChips, addGlobalStatusChip, removeGlobalStatusChip, updateGlobalStatusChip } = useTasks();
  const [isAdding, setIsAdding] = useState(false);
  const [editingChip, setEditingChip] = useState<StatusFlag | null>(null);
  
  const [inputValue, setInputValue] = useState('');
  const [inputColor, setInputColor] = useState(LABEL_COLORS[0]);

  const handleAdd = () => {
    if (inputValue.trim()) {
      addGlobalStatusChip({ id: `sf-${Date.now()}`, name: inputValue.trim(), color: inputColor });
      reset();
    }
  };

  const handleUpdate = () => {
    if (editingChip && inputValue.trim()) {
      updateGlobalStatusChip({ ...editingChip, name: inputValue.trim(), color: inputColor });
      reset();
    }
  };

  const reset = () => {
    setIsAdding(false);
    setEditingChip(null);
    setInputValue('');
    setInputColor(LABEL_COLORS[0]);
  };

  const startEditing = (chip: StatusFlag) => {
    setEditingChip(chip);
    setInputValue(chip.name);
    setInputColor(chip.color);
    setIsAdding(false);
  };

  return (
    <div className="w-72 bg-white rounded-2xl shadow-2xl border border-gray-100 p-1 overflow-hidden animate-in fade-in zoom-in-95 duration-200 z-[70]">
      <div className="p-3 border-b border-gray-50 flex items-center justify-between">
        <span className="text-xs font-bold text-gray-900">Status Flags</span>
        {!isAdding && !editingChip && (
          <button onClick={() => setIsAdding(true)} className="p-1.5 text-brand-600 hover:bg-brand-50 rounded-lg transition-colors"><Plus size={16} /></button>
        )}
      </div>
      
      {!isAdding && !editingChip ? (
        <div className="max-h-64 overflow-y-auto p-1 space-y-1 custom-scrollbar">
          <button onClick={() => onSelect(undefined)} className={`w-full flex items-center gap-3 px-3 py-2 text-xs font-bold text-gray-500 hover:bg-gray-50 rounded-xl transition-all ${!currentChip ? 'bg-gray-50 ring-1 ring-inset ring-gray-100' : ''}`}>
            <div className="w-4 h-4 rounded-full border-2 border-dashed border-gray-300" />
            No Flag
          </button>
          {availableStatusChips.map(chip => (
            <div key={chip.id} className="group relative">
              <button onClick={() => onSelect(chip)} className={`w-full flex items-center gap-3 px-3 py-2 text-xs font-bold text-gray-700 hover:bg-gray-50 rounded-xl transition-all ${currentChip?.id === chip.id ? 'bg-brand-50' : ''}`}>
                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: chip.color }} />
                <span className="truncate max-w-[150px]">{chip.name}</span>
              </button>
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={(e) => { e.stopPropagation(); startEditing(chip); }} className="p-1 text-gray-400 hover:text-brand-600 hover:bg-white rounded shadow-sm transition-all">
                  <Edit2 size={12} />
                </button>
                <button onClick={(e) => { e.stopPropagation(); removeGlobalStatusChip(chip.id); }} className="p-1 text-gray-400 hover:text-red-600 hover:bg-white rounded shadow-sm transition-all">
                  <Trash2 size={12} />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="p-4 space-y-4 animate-in slide-in-from-top-1 duration-200">
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Flag Name</label>
            <input 
              autoFocus 
              value={inputValue} 
              onChange={(e) => setInputValue(e.target.value)} 
              placeholder="e.g. Blocker" 
              className="w-full text-xs font-bold p-2.5 bg-white border border-gray-100 rounded-xl outline-none focus:border-brand-300 transition-all shadow-sm" 
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Flag Color</label>
            <div className="grid grid-cols-4 gap-2">
              {LABEL_COLORS.map(c => (
                <button 
                  key={c}
                  onClick={() => setInputColor(c)}
                  className={`w-full aspect-square rounded-lg transition-transform hover:scale-110 flex items-center justify-center ${inputColor === c ? 'ring-2 ring-offset-2 ring-gray-200 shadow-md' : 'shadow-sm'}`}
                  style={{ backgroundColor: c }}
                >
                  {inputColor === c && <Check size={14} className="text-white" />}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <button onClick={reset} className="flex-1 px-3 py-2 text-[10px] font-bold text-gray-500 hover:bg-gray-100 rounded-lg transition-all">Cancel</button>
            <button 
              onClick={isAdding ? handleAdd : handleUpdate} 
              disabled={!inputValue.trim()} 
              className="flex-1 px-3 py-2 text-[10px] font-bold text-white bg-brand-500 hover:bg-brand-600 rounded-lg shadow-md transition-all disabled:opacity-50"
            >
              Save
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

interface ChecklistItemComponentProps {
  taskId: string;
  item: ChecklistItem;
}

const ChecklistItemComponent: React.FC<ChecklistItemComponentProps> = ({ taskId, item }) => {
  const { updateSubtask, deleteSubtask } = useTasks();
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(item.text);

  const handleSave = () => {
    if (editText.trim() && editText !== item.text) {
      updateSubtask(taskId, item.id, { text: editText.trim() });
    }
    setIsEditing(false);
  };

  const handleToggle = () => {
    updateSubtask(taskId, item.id, { completed: !item.completed });
  };

  if (isEditing) {
    return (
      <div className="flex items-center gap-3 p-3 bg-white border border-brand-200 rounded-xl shadow-sm animate-in fade-in duration-200">
        <div 
          onClick={(e) => { e.stopPropagation(); handleToggle(); }}
          className={`w-5 h-5 rounded border flex items-center justify-center transition-colors cursor-pointer ${item.completed ? 'bg-brand-500 border-brand-500 text-white' : 'bg-white border-gray-300'}`}
        >
          {item.completed && <X size={12} strokeWidth={4} />}
        </div>
        <input 
          autoFocus
          value={editText}
          onChange={(e) => setEditText(e.target.value)}
          onBlur={handleSave}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSave();
            if (e.key === 'Escape') { setEditText(item.text); setIsEditing(false); }
          }}
          className="flex-1 text-sm font-medium outline-none bg-transparent"
        />
        <div className="flex items-center gap-1">
          <button onClick={handleSave} className="p-1 text-brand-600 hover:bg-brand-50 rounded">
            <Check size={14} strokeWidth={3} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3 p-3 bg-white border border-gray-100 rounded-xl hover:border-brand-200 transition-all cursor-pointer group shadow-sm">
      <div 
        onClick={(e) => { e.stopPropagation(); handleToggle(); }}
        className={`w-5 h-5 rounded border flex items-center justify-center transition-colors flex-shrink-0 ${item.completed ? 'bg-brand-500 border-brand-500 text-white' : 'bg-white border-gray-300 group-hover:border-brand-400'}`}
      >
        {item.completed && <X size={12} strokeWidth={4} />}
      </div>
      <span 
        onClick={() => setIsEditing(true)}
        className={`flex-1 text-sm ${item.completed ? 'text-gray-400 line-through font-normal' : 'text-gray-700 font-medium'}`}
      >
        {item.text}
      </span>
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button 
          onClick={(e) => { e.stopPropagation(); setIsEditing(true); }}
          className="p-1.5 text-gray-400 hover:text-brand-600 hover:bg-gray-50 rounded-lg transition-colors"
        >
          <Edit2 size={14} />
        </button>
        <button 
          onClick={(e) => { e.stopPropagation(); deleteSubtask(taskId, item.id); }}
          className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
        >
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  );
};

interface TaskDetailModalProps {
  task: Task;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  columnTitle: string;
}

export const TaskDetailModal: React.FC<TaskDetailModalProps> = ({ task, isOpen, onOpenChange, columnTitle }) => {
  const { updateTask, addComment, addSubtask, addLabel, removeLabel, availablePriorities, removeAssignee, setSelectedTaskId, availableMembers } = useTasks();
  const [newComment, setNewComment] = useState('');
  const [newSubtask, setNewSubtask] = useState('');
  const [isAddingSubtask, setIsAddingSubtask] = useState(false);
  const [isLabelPickerOpen, setIsLabelPickerOpen] = useState(false);
  const [editingLabel, setEditingLabel] = useState<Label | null>(null);
  const [isStatusPickerOpen, setIsStatusPickerOpen] = useState(false);

  const handleAddComment = () => {
    if (!newComment.trim()) return;
    addComment(task.id, newComment);
    setNewComment('');
  };

  const handleAddSubtaskSubmit = () => {
    if (!newSubtask.trim()) return;
    addSubtask(task.id, newSubtask);
    setNewSubtask('');
    setIsAddingSubtask(false);
  };

  const completedCount = task.checklist.filter(i => i.completed).length;
  const totalCount = task.checklist.length;

  return (
    <Dialog.Root open={isOpen} onOpenChange={(open) => {
      onOpenChange(open);
      if (!open) setSelectedTaskId(null);
    }}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 animate-in fade-in duration-300" />
        <Dialog.Content className="fixed top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] w-[95vw] max-w-4xl max-h-[90vh] bg-white rounded-2xl shadow-2xl z-50 flex flex-col overflow-hidden animate-in zoom-in-95 duration-200 focus:outline-none">
          <Dialog.Title className="sr-only">Task Details: {task.title}</Dialog.Title>
          <Dialog.Description className="sr-only">Detailed view for task information, subtasks, and comments.</Dialog.Description>
          
          <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-white sticky top-0 z-10">
            <div className="flex flex-col gap-1 w-full mr-8">
              <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                <span>Just Basics</span><ChevronRight size={12} /><span>Mobile App</span><ChevronRight size={12} /><span className="text-brand-600">{columnTitle}</span>
              </div>
              <input value={task.title} onChange={(e) => updateTask(task.id, { title: e.target.value })} className="text-2xl font-bold text-gray-900 border-none outline-none focus:ring-0 p-0 w-full bg-transparent rounded hover:bg-gray-50/50 transition-colors" />
            </div>
            <Dialog.Close className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-lg flex-shrink-0 transition-colors"><X size={20} /></Dialog.Close>
          </div>
          <div className="flex-1 overflow-y-auto flex flex-col md:flex-row custom-scrollbar">
            <div className="flex-[3] p-8 space-y-8 border-r border-gray-100 bg-white">
              <section className="space-y-4">
                <div className="flex items-center gap-2 text-sm font-bold text-gray-900"><Clock size={16} className="text-gray-400" />Description</div>
                <RichTextEditor value={task.description} onSave={(val) => updateTask(task.id, { description: val })} placeholder="Describe this task in detail..." />
              </section>
              <section className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm font-bold text-gray-900"><CheckSquare size={16} className="text-gray-400" />Checklist</div>
                  <span className="text-[10px] font-bold text-brand-600 bg-brand-50 px-3 py-1 rounded-full border border-brand-100 shadow-sm">{completedCount} of {totalCount} Completed</span>
                </div>
                <div className="space-y-2">
                  {task.checklist.map(item => (
                    <ChecklistItemComponent key={item.id} taskId={task.id} item={item} />
                  ))}
                  {isAddingSubtask ? (
                    <div className="p-1 flex gap-2 animate-in slide-in-from-top-1 duration-200">
                      <input 
                        autoFocus 
                        value={newSubtask} 
                        onChange={(e) => setNewSubtask(e.target.value)} 
                        onKeyDown={(e) => e.key === 'Enter' && handleAddSubtaskSubmit()} 
                        onBlur={() => !newSubtask.trim() && setIsAddingSubtask(false)}
                        placeholder="What needs to be done?" 
                        className="flex-1 text-sm font-medium border border-gray-100 bg-white rounded-xl px-4 py-2.5 outline-none focus:border-brand-300 transition-all shadow-sm" 
                      />
                      <button onClick={handleAddSubtaskSubmit} className="bg-brand-500 text-white px-4 py-2.5 rounded-xl text-xs font-bold hover:bg-brand-600 shadow-sm transition-all">Save</button>
                    </div>
                  ) : (
                    <button onClick={() => setIsAddingSubtask(true)} className="flex items-center gap-2 text-[11px] font-bold text-brand-600 px-3 py-2 hover:bg-brand-50 rounded-lg transition-colors"><Plus size={14} /> Add checklist item</button>
                  )}
                </div>
              </section>
              <section className="space-y-4">
                <div className="flex items-center gap-2 text-sm font-bold text-gray-900"><MessageSquare size={16} className="text-gray-400" />Activity & Comments</div>
                <div className="space-y-5">
                   {task.comments.map(comment => (
                     <div key={comment.id} className="flex gap-4"><img src={comment.user.avatar} className="w-8 h-8 rounded-full border shadow-sm flex-shrink-0 object-cover" alt={comment.user.name} /><div className="flex-1"><div className="flex items-center gap-2 mb-1.5"><span className="text-xs font-bold text-gray-900">{comment.user.name}</span><span className="text-[10px] text-gray-400 font-medium uppercase tracking-tighter">{comment.timestamp}</span></div><div className="bg-gray-50/50 p-3 rounded-2xl rounded-tl-none text-sm text-gray-700 font-medium shadow-sm border border-gray-100/50">{comment.text}</div></div></div>
                   ))}
                   <div className="flex gap-4 pt-2 pb-2">
                     <div className="w-8 h-8 bg-brand-100 rounded-full flex items-center justify-center text-brand-600 font-bold text-xs flex-shrink-0">CM</div>
                     <div className="flex-1 relative">
                       <input value={newComment} onChange={(e) => setNewComment(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleAddComment()} placeholder="Write a comment..." className="w-full bg-white border border-gray-100 rounded-full px-5 py-2.5 text-sm outline-none focus:border-brand-200 transition-all pr-24 shadow-sm font-medium" />
                       <button onClick={handleAddComment} className="absolute right-1.5 top-1/2 -translate-y-1/2 flex items-center gap-1.5 px-4 py-1.5 bg-brand-500 text-white text-xs font-bold rounded-full hover:bg-brand-600 disabled:bg-gray-200 transition-all shadow-sm" disabled={!newComment.trim()}>Post <Send size={14} /></button>
                     </div>
                   </div>
                </div>
              </section>
            </div>
            <div className="flex-1 bg-gray-50/50 p-8 space-y-8 min-w-[300px]">
               <div className="space-y-6">
                  <div className="space-y-3">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">Priority</label>
                    <div className="relative group">
                      <select value={task.priority} onChange={(e) => updateTask(task.id, { priority: e.target.value as Priority })} className="w-full p-3 bg-white border border-gray-100 rounded-xl text-sm font-bold text-gray-700 shadow-sm outline-none appearance-none cursor-pointer pr-10 hover:border-brand-200 transition-all">
                        {availablePriorities.map(p => (<option key={p} value={p}>{p}</option>))}
                      </select>
                      <ChevronRight size={16} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 rotate-90 pointer-events-none group-hover:text-brand-500 transition-colors" />
                    </div>
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">Status Flag</label>
                    <Popover.Root open={isStatusPickerOpen} onOpenChange={setIsStatusPickerOpen}>
                      <Popover.Trigger asChild>
                        <button className="w-full flex items-center justify-between p-3 bg-white border border-gray-100 rounded-xl text-sm font-bold text-gray-700 shadow-sm hover:border-brand-200 transition-all outline-none">
                          <div className="flex items-center gap-2">
                            {task.statusChip ? (
                              <div className="flex items-center gap-2">
                                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: task.statusChip.color }} />
                                <span className="truncate max-w-[160px]">{task.statusChip.name}</span>
                              </div>
                            ) : (
                              <span className="text-gray-400 font-medium italic">No Flag Set</span>
                            )}
                          </div>
                          <ChevronRight size={16} className="text-gray-400 rotate-90" />
                        </button>
                      </Popover.Trigger>
                      <Popover.Portal><Popover.Content side="bottom" align="start" sideOffset={5} className="z-[70]"><StatusFlagManager currentChip={task.statusChip} onSelect={(chip) => { updateTask(task.id, { statusChip: chip }); setIsStatusPickerOpen(false); }} /></Popover.Content></Popover.Portal>
                    </Popover.Root>
                  </div>
                  <div className="space-y-4">
                    <div className="space-y-3">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">Start Date</label>
                      <Popover.Root>
                        <Popover.Trigger asChild>
                          <button className="flex items-center justify-between w-full p-3 bg-white border border-gray-100 rounded-xl text-sm font-bold text-gray-700 shadow-sm hover:bg-gray-50 transition-colors">
                            {task.startDate || 'Select Date'}
                            <CalendarIcon size={18} className="text-gray-400" />
                          </button>
                        </Popover.Trigger>
                        <Popover.Portal>
                          <Popover.Content className="bg-white p-0 rounded-2xl shadow-2xl border border-gray-100 z-[60] overflow-hidden animate-in fade-in zoom-in-95" align="start" sideOffset={8}>
                            <CustomCalendar 
                              selected={task.startDate ? parse(task.startDate, 'dd.MM.yy', new Date()) : undefined} 
                              onSelect={(date) => date && updateTask(task.id, { startDate: format(date, 'dd.MM.yy') })} 
                            />
                          </Popover.Content>
                        </Popover.Portal>
                      </Popover.Root>
                    </div>
                    <div className="space-y-3">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">Due Date</label>
                      <Popover.Root>
                        <Popover.Trigger asChild>
                          <button className="flex items-center justify-between w-full p-3 bg-white border border-gray-100 rounded-xl text-sm font-bold text-gray-700 shadow-sm hover:bg-gray-50 transition-colors">
                            {task.dueDate}
                            <CalendarIcon size={18} className="text-gray-400" />
                          </button>
                        </Popover.Trigger>
                        <Popover.Portal>
                          <Popover.Content className="bg-white p-0 rounded-2xl shadow-2xl border border-gray-100 z-[60] overflow-hidden animate-in fade-in zoom-in-95" align="start" sideOffset={8}>
                            <CustomCalendar 
                              selected={parse(task.dueDate, 'dd.MM.yy', new Date())} 
                              onSelect={(date) => date && updateTask(task.id, { dueDate: format(date, 'dd.MM.yy') })} 
                            />
                          </Popover.Content>
                        </Popover.Portal>
                      </Popover.Root>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">Assignees</label>
                    <div className="flex flex-wrap items-center gap-3">
                      {task.assignees.map((url, i) => {
                        const member = availableMembers.find(m => m.avatar === url);
                        return (
                          <div key={i} className="relative group">
                            <img src={url} className="w-10 h-10 rounded-full border-2 border-white shadow-md hover:scale-110 transition-transform cursor-pointer object-cover" alt={member?.name || 'Assignee'} />
                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-[10px] font-bold rounded-lg opacity-0 group-hover:opacity-100 transition-all pointer-events-none whitespace-nowrap z-10 shadow-xl">
                              {member?.name || 'Unknown'}
                              <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900" />
                            </div>
                            <button onClick={() => removeAssignee(task.id, url)} className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity shadow-sm hover:bg-red-600 scale-90">
                              <X size={10} strokeWidth={4} />
                            </button>
                          </div>
                        );
                      })}
                      <Popover.Root>
                        <Popover.Trigger asChild>
                          <button className="w-10 h-10 rounded-full border-2 border-dashed border-gray-200 flex items-center justify-center text-gray-300 hover:text-brand-500 hover:border-brand-500 hover:bg-brand-50 transition-all shadow-sm bg-white group active:scale-95">
                            <UserPlus size={20} className="group-hover:scale-110 transition-transform" />
                          </button>
                        </Popover.Trigger>
                        <Popover.Portal>
                          <Popover.Content side="top" align="center" sideOffset={12} className="z-[70] outline-none">
                            <MemberPicker taskId={task.id} assignees={task.assignees} />
                          </Popover.Content>
                        </Popover.Portal>
                      </Popover.Root>
                    </div>
                  </div>
               </div>
               <div className="pt-8 border-t border-gray-100 space-y-3">
                  <button onClick={() => setIsAddingSubtask(true)} className="w-full flex items-center gap-3.5 p-3.5 text-xs font-bold text-gray-600 hover:text-gray-900 hover:bg-white rounded-[1.25rem] transition-all shadow-sm bg-white/60 border border-transparent hover:border-gray-100 group"><CheckSquare size={18} className="text-gray-400 group-hover:text-brand-500 transition-colors" /> Add Checklist</button>
                  <button className="w-full flex items-center gap-3.5 p-3.5 text-xs font-bold text-gray-600 hover:text-gray-900 hover:bg-white rounded-[1.25rem] transition-all shadow-sm bg-white/60 border border-transparent hover:border-gray-100 group"><Paperclip size={18} className="text-gray-400 group-hover:text-brand-500 transition-colors" /> Attach Files</button>
                  <button onClick={() => { onOpenChange(false); }} className="w-full flex items-center gap-3.5 p-3.5 text-xs font-bold text-red-500 hover:bg-red-50 rounded-[1.25rem] transition-all border border-transparent hover:border-red-100 group"><Trash2 size={18} className="group-hover:scale-110 transition-transform" /> Archive Task</button>
               </div>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};
