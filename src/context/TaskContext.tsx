
import React, { createContext, useContext, useState, ReactNode, useMemo, useEffect } from 'react';
import { ColumnData, Task, Priority, StatusFlag, ChecklistItem, Comment, Label, AppNotification, Member } from '../types';
import { INITIAL_DATA } from '../constants';
import { isBefore, isToday, parse, startOfDay } from 'date-fns';
import { arrayMove } from '@dnd-kit/sortable';

export interface ToastMessage {
  id: string;
  message: string;
  type?: 'info' | 'success' | 'warning' | 'error';
}

interface TaskContextType {
  columns: ColumnData[];
  setColumns: React.Dispatch<React.SetStateAction<ColumnData[]>>;
  updateTask: (taskId: string, updates: Partial<Task>) => void;
  deleteTask: (taskId: string) => void;
  duplicateTask: (taskId: string) => void;
  moveTask: (taskId: string, targetColumnId: string) => void;
  addTask: (columnId?: string) => string;
  addComment: (taskId: string, text: string) => void;
  addSubtask: (taskId: string, text: string) => void;
  updateSubtask: (taskId: string, subtaskId: string, updates: Partial<ChecklistItem>) => void;
  deleteSubtask: (taskId: string, subtaskId: string) => void;
  addLabel: (taskId: string, label: Label) => void;
  removeLabel: (taskId: string, labelId: string) => void;
  addAssignee: (taskId: string, avatarUrl: string) => void;
  removeAssignee: (taskId: string, avatarUrl: string) => void;
  availablePriorities: Priority[];
  availableStatusChips: StatusFlag[];
  availableMembers: Member[];
  boardMembers: Member[]; 
  toggleBoardMember: (memberId: string) => void;
  updateBoardMemberRole: (memberId: string, role: Member['role']) => void;
  inviteToBoard: (nameOrEmail: string, role: Member['role']) => void;
  availableLabels: Label[];
  addGlobalLabel: (label: Label) => void;
  addGlobalStatusChip: (chip: StatusFlag) => void;
  removeGlobalStatusChip: (chipId: string) => void;
  updateGlobalStatusChip: (chip: StatusFlag) => void;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  filterPriorities: Priority[];
  setFilterPriorities: (priorities: Priority[]) => void;
  filterLabels: string[];
  setFilterLabels: (labels: string[]) => void;
  filterStatusChips: string[];
  setFilterStatusChips: (chips: string[]) => void;
  filterMembers: string[];
  setFilterMembers: (members: string[]) => void;
  filterOverdue: boolean;
  setFilterOverdue: (overdue: boolean) => void;
  filterDueToday: boolean;
  setFilterDueToday: (dueToday: boolean) => void;
  filteredColumns: ColumnData[];
  selectedTaskId: string | null;
  setSelectedTaskId: (id: string | null) => void;
  notifications: AppNotification[];
  markNotificationAsRead: (id: string) => void;
  addNotification: (title: string, message: string, type?: AppNotification['type']) => void;
  clearNotifications: () => void;
  // Toasts
  toasts: ToastMessage[];
  showToast: (message: string, type?: ToastMessage['type']) => void;
  removeToast: (id: string) => void;
  // Column actions
  addColumn: (title: string) => void;
  renameColumn: (columnId: string, newTitle: string) => void;
  deleteColumn: (columnId: string) => void;
  clearColumn: (columnId: string) => void;
  moveColumn: (columnId: string, direction: 'left' | 'right') => void;
}

const TaskContext = createContext<TaskContextType | undefined>(undefined);

export const TaskProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [columns, setColumns] = useState<ColumnData[]>(INITIAL_DATA);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  
  const showToast = (message: string, type: ToastMessage['type'] = 'info') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => removeToast(id), 3000);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const [availableMembers] = useState<Member[]>([
    { id: 'm0', name: 'Unassigned', username: '@unassigned', avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=U&backgroundColor=e5e7eb', role: 'Guest' },
    { id: 'm1', name: 'Karthi Rajendhiran', username: '@karthi_developer', avatar: 'https://picsum.photos/seed/1/40', role: 'Admin', status: 'online' },
    { id: 'm2', name: 'Kanika sri', username: '@kanikasri_developer', avatar: 'https://picsum.photos/seed/2/40', role: 'Member', status: 'offline' },
    { id: 'm3', name: 'Malini', username: '@malini_developer', avatar: 'https://picsum.photos/seed/3/40', role: 'Member', status: 'offline' },
    { id: 'm4', name: 'Mani S', username: '@mani_developer', avatar: 'https://picsum.photos/seed/4/40', role: 'Member', status: 'offline' },
    ...Array.from({ length: 15 }, (_, i) => ({
      id: `m${i + 5}`,
      name: `Team Member ${i + 5}`,
      username: `@member_${i + 5}`,
      avatar: `https://picsum.photos/seed/${i + 5}/40`,
      role: 'Member' as const,
      status: (Math.random() > 0.5 ? 'online' : 'offline') as 'online' | 'offline'
    }))
  ]);

  const [boardMembers, setBoardMembers] = useState<Member[]>(() => 
    availableMembers.slice(1, 8)
  );

  const [notifications, setNotifications] = useState<AppNotification[]>([
    { id: 'n1', title: 'New Comment', message: 'Chandrika mentioned you in "Design Login Screen"', timestamp: '2h ago', read: false, type: 'info' },
    { id: 'n2', title: 'Task Completed', message: 'Competetive Analysis PPT has been marked as completed', timestamp: '5h ago', read: false, type: 'success' },
    { id: 'n3', title: 'Due Date Approaching', message: 'UI/UX mockups is due in 24 hours', timestamp: '1d ago', read: true, type: 'warning' }
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterPriorities, setFilterPriorities] = useState<Priority[]>([]);
  const [filterLabels, setFilterLabels] = useState<string[]>([]);
  const [filterStatusChips, setFilterStatusChips] = useState<string[]>([]);
  const [filterMembers, setFilterMembers] = useState<string[]>([]);
  const [filterOverdue, setFilterOverdue] = useState(false);
  const [filterDueToday, setFilterDueToday] = useState(false);

  const [availableStatusChips, setAvailableStatusChips] = useState<StatusFlag[]>([
    { id: 'sf1', name: 'Risk of delay', color: '#0EA5E9' },
    { id: 'sf2', name: 'Needs splitting', color: '#8B5CF6' },
    { id: 'sf3', name: 'Overdue blocker', color: '#EF4444' },
    { id: 'sf4', name: 'Suggestions (2)', color: '#F59E0B' },
    { id: 'sf5', name: 'On track', color: '#10B981' }
  ]);

  const [availableLabels, setAvailableLabels] = useState<Label[]>(() => {
    const labelsMap = new Map<string, Label>();
    INITIAL_DATA.forEach(col => col.tasks.forEach(task => {
      task.labels.forEach(l => labelsMap.set(l.id, l));
    }));
    return Array.from(labelsMap.values());
  });

  const availablePriorities: Priority[] = ['High priority', 'Medium priority', 'Low priority'];

  const toggleBoardMember = (memberId: string) => {
    setBoardMembers(prev => {
      if (prev.some(m => m.id === memberId)) {
        return prev.filter(m => m.id !== memberId);
      }
      const memberToAdd = availableMembers.find(m => m.id === memberId);
      return memberToAdd ? [...prev, memberToAdd] : prev;
    });
  };

  const updateBoardMemberRole = (memberId: string, role: Member['role']) => {
    setBoardMembers(prev => prev.map(m => m.id === memberId ? { ...m, role } : m));
  };

  const inviteToBoard = (nameOrEmail: string, role: Member['role']) => {
    const found = availableMembers.find(m => 
      m.name.toLowerCase().includes(nameOrEmail.toLowerCase()) || 
      m.username.toLowerCase().includes(nameOrEmail.toLowerCase())
    );

    if (found) {
      setBoardMembers(prev => {
        if (prev.some(m => m.id === found.id)) return prev;
        return [...prev, { ...found, role }];
      });
      addNotification('Member Added', `${found.name} was added to the board.`, 'success');
      showToast(`${found.name} added to board`, 'success');
    } else {
      const newMember: Member = {
        id: `m-new-${Date.now()}`,
        name: nameOrEmail.split('@')[0],
        username: `@${nameOrEmail.split('@')[0]}`,
        avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${nameOrEmail}`,
        role: role,
        status: 'offline'
      };
      setBoardMembers(prev => [...prev, newMember]);
      addNotification('Invite Sent', `Invitation sent to ${nameOrEmail}.`, 'info');
      showToast(`Invite sent to ${nameOrEmail}`);
    }
  };

  const addNotification = (title: string, message: string, type: AppNotification['type'] = 'info') => {
    const newNotif: AppNotification = {
      id: `n-${Date.now()}`,
      title,
      message,
      timestamp: 'Just now',
      read: false,
      type
    };
    setNotifications(prev => [newNotif, ...prev]);
  };

  const markNotificationAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const clearNotifications = () => setNotifications([]);

  const addGlobalLabel = (label: Label) => {
    setAvailableLabels(prev => {
      if (prev.some(l => l.id === label.id)) {
        return prev.map(l => l.id === label.id ? label : l);
      }
      return [...prev, label];
    });
  };

  const addGlobalStatusChip = (chip: StatusFlag) => {
    setAvailableStatusChips(prev => [...prev, chip]);
  };

  const removeGlobalStatusChip = (chipId: string) => {
    setAvailableStatusChips(prev => prev.filter(c => c.id !== chipId));
    setColumns(prev => prev.map(col => ({
      ...col,
      tasks: col.tasks.map(task => task.statusChip?.id === chipId ? { ...task, statusChip: undefined } : task)
    })));
  };

  const updateGlobalStatusChip = (newChip: StatusFlag) => {
    setAvailableStatusChips(prev => prev.map(c => c.id === newChip.id ? newChip : c));
    setColumns(prev => prev.map(col => ({
      ...col,
      tasks: col.tasks.map(task => task.statusChip?.id === newChip.id ? { ...task, statusChip: newChip } : task)
    })));
  };

  const filteredColumns = useMemo(() => {
    const today = startOfDay(new Date());

    return columns.map(col => ({
      ...col,
      tasks: col.tasks.filter(task => {
        const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                             task.description.toLowerCase().includes(searchTerm.toLowerCase());
        if (!matchesSearch) return false;

        if (filterPriorities.length > 0 && !filterPriorities.includes(task.priority)) return false;

        if (filterLabels.length > 0) {
          const taskLabelIds = task.labels.map(l => l.id);
          if (!filterLabels.some(id => taskLabelIds.includes(id))) return false;
        }

        if (filterStatusChips.length > 0) {
          if (!task.statusChip || !filterStatusChips.includes(task.statusChip.id)) return false;
        }

        if (filterMembers.length > 0) {
          if (!task.assignees.some(member => filterMembers.includes(member))) return false;
        }

        const taskDueDate = parse(task.dueDate, 'dd.MM.yy', new Date());
        
        if (filterOverdue) {
          const isOverdue = isBefore(taskDueDate, today) && !isToday(taskDueDate) && col.id !== 'completed';
          if (!isOverdue) return false;
        }

        if (filterDueToday) {
          if (!isToday(taskDueDate)) return false;
        }

        return true;
      })
    }));
  }, [columns, searchTerm, filterPriorities, filterLabels, filterStatusChips, filterMembers, filterOverdue, filterDueToday]);

  const updateTask = (taskId: string, updates: Partial<Task>) => {
    setColumns(prev => prev.map(col => ({
      ...col,
      tasks: col.tasks.map(task => task.id === taskId ? { ...task, ...updates } : task)
    })));
  };

  const addTask = (columnId: string = 'todo'): string => {
    const newId = `task-${Date.now()}`;
    const newTask: Task = {
      id: newId,
      title: 'New Task',
      description: 'Enter description...',
      priority: 'Medium priority',
      labels: [],
      dueDate: format(new Date(), 'dd.MM.yy'),
      assignees: [availableMembers[1].avatar],
      attachments: 0,
      checklist: [],
      comments: []
    };

    setColumns(prev => prev.map(col => 
      col.id === columnId ? { ...col, tasks: [newTask, ...col.tasks] } : col
    ));
    addNotification('Task Created', `A new task "${newTask.title}" was added to ${columnId}`, 'success');
    showToast('Task created', 'success');
    return newId;
  };

  const addComment = (taskId: string, text: string) => {
    const newComment: Comment = {
      id: `comment-${Date.now()}`,
      user: { name: 'Chandrika M', avatar: 'https://picsum.photos/seed/user/64' },
      text,
      timestamp: 'Just now'
    };
    setColumns(prev => prev.map(col => ({
      ...col,
      tasks: col.tasks.map(task => task.id === taskId ? { ...task, comments: [newComment, ...task.comments] } : task)
    })));
  };

  const addSubtask = (taskId: string, text: string) => {
    const newItem: ChecklistItem = {
      id: `subtask-${Date.now()}`,
      text,
      completed: false
    };
    setColumns(prev => prev.map(col => ({
      ...col,
      tasks: col.tasks.map(task => task.id === taskId ? { ...task, checklist: [...task.checklist, newItem] } : task)
    })));
  };

  const updateSubtask = (taskId: string, subtaskId: string, updates: Partial<ChecklistItem>) => {
    setColumns(prev => prev.map(col => ({
      ...col,
      tasks: col.tasks.map(task => task.id === taskId ? {
        ...task,
        checklist: task.checklist.map(item => item.id === subtaskId ? { ...item, ...updates } : item)
      } : task)
    })));
  };

  const deleteSubtask = (taskId: string, subtaskId: string) => {
    setColumns(prev => prev.map(col => ({
      ...col,
      tasks: col.tasks.map(task => task.id === taskId ? {
        ...task,
        checklist: task.checklist.filter(item => item.id !== subtaskId)
      } : task)
    })));
  };

  const addLabel = (taskId: string, label: Label) => {
    addGlobalLabel(label);
    setColumns(prev => prev.map(col => ({
      ...col,
      tasks: col.tasks.map(task => task.id === taskId ? { 
        ...task, 
        labels: task.labels.some(l => l.id === label.id) 
          ? task.labels.map(l => l.id === label.id ? label : l)
          : [...task.labels, label]
      } : task)
    })));
  };

  const removeLabel = (taskId: string, labelId: string) => {
    setColumns(prev => prev.map(col => ({
      ...col,
      tasks: col.tasks.map(task => task.id === taskId ? { ...task, labels: task.labels.filter(l => l.id !== labelId) } : task)
    })));
  };

  const addAssignee = (taskId: string, avatarUrl: string) => {
    setColumns(prev => prev.map(col => ({
      ...col,
      tasks: col.tasks.map(task => task.id === taskId ? { 
        ...task, 
        assignees: task.assignees.includes(avatarUrl) ? task.assignees : [...task.assignees, avatarUrl] 
      } : task)
    })));
  };

  const removeAssignee = (taskId: string, avatarUrl: string) => {
    setColumns(prev => prev.map(col => ({
      ...col,
      tasks: col.tasks.map(task => task.id === taskId ? { 
        ...task, 
        assignees: task.assignees.filter(url => url !== avatarUrl) 
      } : task)
    })));
  };

  const deleteTask = (taskId: string) => {
    setColumns(prev => prev.map(col => ({
      ...col,
      tasks: col.tasks.filter(task => task.id !== taskId)
    })));
    addNotification('Task Deleted', 'A task has been removed from the board', 'warning');
    showToast('Task deleted', 'warning');
  };

  const duplicateTask = (taskId: string) => {
    setColumns(prev => {
      let taskToClone: Task | undefined;
      let targetColId: string = '';
      for (const col of prev) {
        taskToClone = col.tasks.find(t => t.id === taskId);
        if (taskToClone) {
          targetColId = col.id;
          break;
        }
      }
      if (!taskToClone) return prev;
      const newTask: Task = {
        ...taskToClone,
        id: `task-${Date.now()}`,
        title: `${taskToClone.title} (Copy)`,
        checklist: taskToClone.checklist.map(item => ({ ...item, id: `c-${Date.now()}-${Math.random()}` })),
        comments: taskToClone.comments.map(comment => ({ ...comment, id: `m-${Date.now()}-${Math.random()}` })),
        assignees: [...taskToClone.assignees],
        labels: taskToClone.labels.map(l => ({ ...l }))
      };
      showToast('Task duplicated', 'success');
      return prev.map(col => col.id === targetColId ? { ...col, tasks: [...col.tasks, newTask] } : col);
    });
  };

  const moveTask = (taskId: string, targetColumnId: string) => {
    setColumns(prev => {
      let taskToMove: Task | undefined;
      const targetCol = prev.find(c => c.id === targetColumnId);
      const filteredCols = prev.map(col => {
        const t = col.tasks.find(tk => tk.id === taskId);
        if (t) taskToMove = t;
        return { ...col, tasks: col.tasks.filter(tk => tk.id !== taskId) };
      });
      if (!taskToMove) return prev;
      showToast(`Moved to ${targetCol?.title || 'board'}`);
      return filteredCols.map(col => col.id === targetColumnId ? { ...col, tasks: [...col.tasks, taskToMove!] } : col);
    });
  };

  // NEW COLUMN ACTIONS
  const addColumn = (title: string) => {
    const newId = `col-${Date.now()}`;
    const newColumn: ColumnData = {
      id: newId,
      title: title || 'New Column',
      tasks: []
    };
    setColumns(prev => [...prev, newColumn]);
    addNotification('Column Created', `New column "${newColumn.title}" was added.`, 'success');
    showToast(`Board "${newColumn.title}" created`, 'success');
  };

  const renameColumn = (columnId: string, newTitle: string) => {
    setColumns(prev => prev.map(col => col.id === columnId ? { ...col, title: newTitle } : col));
  };

  const deleteColumn = (columnId: string) => {
    setColumns(prev => prev.filter(col => col.id !== columnId));
    addNotification('Column Deleted', 'Board column has been removed', 'warning');
    showToast('Board deleted', 'warning');
  };

  const clearColumn = (columnId: string) => {
    setColumns(prev => prev.map(col => col.id === columnId ? { ...col, tasks: [] } : col));
    addNotification('Column Cleared', 'All tasks removed from the column', 'info');
    showToast('Board cleared');
  };

  const moveColumn = (columnId: string, direction: 'left' | 'right') => {
    setColumns(prev => {
      const index = prev.findIndex(c => c.id === columnId);
      if (index === -1) return prev;
      if (direction === 'left' && index > 0) return arrayMove(prev, index, index - 1);
      if (direction === 'right' && index < prev.length - 1) return arrayMove(prev, index, index + 1);
      return prev;
    });
  };

  return (
    <TaskContext.Provider value={{ 
      columns, setColumns, updateTask, deleteTask, duplicateTask, moveTask, addTask,
      addComment, addSubtask, updateSubtask, deleteSubtask, addLabel, removeLabel, addAssignee, removeAssignee,
      availablePriorities, availableStatusChips, availableMembers, boardMembers, toggleBoardMember, updateBoardMemberRole, inviteToBoard, availableLabels,
      addGlobalLabel, addGlobalStatusChip, removeGlobalStatusChip, updateGlobalStatusChip,
      searchTerm, setSearchTerm, filterPriorities, setFilterPriorities, 
      filterLabels, setFilterLabels, filterStatusChips, setFilterStatusChips,
      filterMembers, setFilterMembers, filterOverdue, setFilterOverdue,
      filterDueToday, setFilterDueToday, filteredColumns,
      selectedTaskId, setSelectedTaskId, notifications, markNotificationAsRead, addNotification, clearNotifications,
      toasts, showToast, removeToast,
      addColumn, renameColumn, deleteColumn, clearColumn, moveColumn
    }}>
      {children}
    </TaskContext.Provider>
  );
};

export const useTasks = () => {
  const context = useContext(TaskContext);
  if (!context) throw new Error('useTasks must be used within a TaskProvider');
  return context;
};

function format(date: Date, pattern: string): string {
  const d = date.getDate().toString().padStart(2, '0');
  const m = (date.getMonth() + 1).toString().padStart(2, '0');
  const y = date.getFullYear().toString().slice(-2);
  return `${d}.${m}.${y}`;
}
