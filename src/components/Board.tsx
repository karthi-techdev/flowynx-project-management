
import React, { useState, useMemo } from 'react';
import * as Popover from '@radix-ui/react-popover';
import { 
  DndContext, 
  DragOverlay, 
  closestCorners, 
  KeyboardSensor, 
  PointerSensor, 
  useSensor, 
  useSensors, 
  DragStartEvent,
  DragOverEvent,
  DragEndEvent,
  defaultDropAnimationSideEffects,
  MeasuringStrategy
} from '@dnd-kit/core';
import { 
  arrayMove, 
  SortableContext, 
  sortableKeyboardCoordinates, 
  horizontalListSortingStrategy 
} from '@dnd-kit/sortable';
import { Plus, Filter, LayoutList, Kanban, Calendar as CalendarIcon, Sparkles, Check, User, Tag, Clock, AlertCircle, X } from 'lucide-react';
import { Task, ColumnData } from '../types';
import { TaskCard } from './TaskCard';
import { SortableColumn } from './SortableColumn';
import { CalendarView } from './CalendarView';
import { ListView } from './ListView';
import { TaskDetailModal } from './TaskDetailModal';
import { useTasks } from '../context/TaskContext';

export const Board: React.FC = () => {
  const { 
    filteredColumns, 
    setColumns, 
    addTask, 
    addColumn,
    selectedTaskId,
    setSelectedTaskId,
    filterPriorities, setFilterPriorities, availablePriorities,
    filterLabels, setFilterLabels, availableLabels,
    filterStatusChips, setFilterStatusChips, availableStatusChips,
    filterMembers, setFilterMembers, availableMembers,
    filterOverdue, setFilterOverdue,
    filterDueToday, setFilterDueToday
  } = useTasks();

  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [activeColumn, setActiveColumn] = useState<ColumnData | null>(null);
  const [activeTab, setActiveTab] = useState('Kanban View');
  const [isAddingColumn, setIsAddingColumn] = useState(false);
  const [newColumnTitle, setNewColumnTitle] = useState('');

  // Global Task Resolution for Modal
  const selectedTaskData = useMemo(() => {
    if (!selectedTaskId) return null;
    for (const column of filteredColumns) {
      const task = column.tasks.find(t => t.id === selectedTaskId);
      if (task) return { task, columnTitle: column.title };
    }
    return null;
  }, [selectedTaskId, filteredColumns]);

  const activeFiltersCount = (
    filterPriorities.length + 
    filterLabels.length + 
    filterStatusChips.length + 
    filterMembers.length + 
    (filterOverdue ? 1 : 0) + 
    (filterDueToday ? 1 : 0)
  );

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleAddColumn = () => {
    if (newColumnTitle.trim()) {
      addColumn(newColumnTitle.trim());
      setNewColumnTitle('');
      setIsAddingColumn(false);
    }
  };

  const onDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const type = active.data.current?.type;
    
    if (type === 'Task') {
      setActiveTask(active.data.current.task);
      setActiveColumn(null);
    } else if (type === 'Column') {
      setActiveColumn(active.data.current.column);
      setActiveTask(null);
    }
  };

  const onDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id;
    const overId = over.id;
    if (activeId === overId) return;

    const activeType = active.data.current?.type;
    if (activeType !== 'Task') return;

    const activeTaskColumn = filteredColumns.find(c => c.tasks.some(t => t.id === activeId));
    const overTaskColumn = filteredColumns.find(c => 
      c.id === overId || c.tasks.some(t => t.id === overId)
    );

    if (!activeTaskColumn || !overTaskColumn || activeTaskColumn === overTaskColumn) return;

    setColumns(prev => {
      const activeTaskColumnInReal = prev.find(c => c.id === activeTaskColumn.id);
      const overTaskColumnInReal = prev.find(c => c.id === overTaskColumn.id);
      
      if (!activeTaskColumnInReal || !overTaskColumnInReal) return prev;

      const activeTasks = [...activeTaskColumnInReal.tasks];
      const overTasks = [...overTaskColumnInReal.tasks];
      
      const activeIndex = activeTasks.findIndex(t => t.id === activeId);
      const overIndexInFiltered = overTaskColumn.id === overId 
        ? overTaskColumn.tasks.length 
        : overTaskColumn.tasks.findIndex(t => t.id === overId);
      
      const overIndex = overTaskColumn.id === overId
        ? overTasks.length
        : overTasks.findIndex(t => t.id === overTaskColumn.tasks[overIndexInFiltered]?.id || '');

      const [removed] = activeTasks.splice(activeIndex, 1);
      
      // Safety check for splice position
      const finalOverIndex = overIndex === -1 ? overTasks.length : overIndex;
      overTasks.splice(finalOverIndex, 0, removed);

      return prev.map(c => {
        if (c.id === activeTaskColumn.id) return { ...c, tasks: activeTasks };
        if (c.id === overTaskColumn.id) return { ...c, tasks: overTasks };
        return c;
      });
    });
  };

  const onDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    const activeType = active.data.current?.type;

    if (!over) {
      setActiveTask(null);
      setActiveColumn(null);
      return;
    }

    const activeId = active.id;
    const overId = over.id;

    if (activeType === 'Column') {
      if (activeId !== overId) {
        setColumns(prev => {
          const activeIndex = prev.findIndex(c => c.id === activeId);
          const overIndex = prev.findIndex(c => c.id === overId);
          return arrayMove(prev, activeIndex, overIndex);
        });
      }
    } else if (activeType === 'Task') {
      const activeTaskColumn = filteredColumns.find(c => c.tasks.some(t => t.id === activeId));
      if (activeTaskColumn) {
        const activeIndex = activeTaskColumn.tasks.findIndex(t => t.id === activeId);
        const overIndex = activeTaskColumn.tasks.findIndex(t => t.id === overId);

        if (activeIndex !== overIndex && overIndex !== -1) {
          setColumns(prev => prev.map(c => {
            if (c.id === activeTaskColumn.id) {
              const realActiveIdx = c.tasks.findIndex(t => t.id === activeId);
              const realOverIdx = c.tasks.findIndex(t => t.id === overId);
              return { ...c, tasks: arrayMove(c.tasks, realActiveIdx, realOverIdx) };
            }
            return c;
          }));
        }
      }
    }

    setActiveTask(null);
    setActiveColumn(null);
  };

  const toggleFilter = (list: any[], setList: (val: any[]) => void, item: any) => {
    if (list.includes(item)) {
      setList(list.filter(i => i !== item));
    } else {
      setList([...list, item]);
    }
  };

  const clearAllFilters = () => {
    setFilterPriorities([]);
    setFilterLabels([]);
    setFilterStatusChips([]);
    setFilterMembers([]);
    setFilterOverdue(false);
    setFilterDueToday(false);
  };

  return (
    <div className="flex-1 flex flex-col min-w-0 bg-app-bg overflow-hidden">
      <div className="px-4 lg:px-8 pt-6 lg:pt-8 pb-4 flex-shrink-0">
        <h1 className="text-xl lg:text-2xl font-bold text-gray-900 mb-4 lg:mb-6">Mobile App</h1>
        
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-1 border-b border-gray-100 overflow-x-auto no-scrollbar">
            {['List View', 'Kanban View', 'Calendar View'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex items-center gap-2 px-3 lg:px-4 py-3 text-xs lg:text-sm font-bold transition-all relative whitespace-nowrap ${
                  activeTab === tab ? 'text-brand-600' : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                {tab === 'List View' && <LayoutList size={16} className="lg:w-[18px]" />}
                {tab === 'Kanban View' && <Kanban size={16} className="lg:w-[18px]" />}
                {tab === 'Calendar View' && <CalendarIcon size={16} className="lg:w-[18px]" />}
                {tab}
                {activeTab === tab && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-600 rounded-full" />}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 lg:gap-3 overflow-x-auto no-scrollbar pb-1 lg:pb-0">
            <Popover.Root>
              <Popover.Trigger asChild>
                <button className={`flex items-center gap-2 px-3 lg:px-4 py-2 text-xs lg:text-sm font-bold transition-all whitespace-nowrap border rounded-lg shadow-sm ${activeFiltersCount > 0 ? 'bg-brand-50 text-brand-700 border-brand-200' : 'bg-white text-gray-600 border-gray-100'}`}>
                  <Filter size={16} className="lg:w-[18px]" />
                  Filter {activeFiltersCount > 0 ? `(${activeFiltersCount})` : ''}
                </button>
              </Popover.Trigger>
              <Popover.Portal>
                <Popover.Content className="w-[320px] max-h-[80vh] bg-white rounded-2xl shadow-2xl border border-gray-100 p-1 z-50 animate-in fade-in zoom-in-95 duration-200 overflow-y-auto custom-scrollbar" align="end" sideOffset={8}>
                  <div className="p-4 border-b border-gray-50 flex items-center justify-between">
                    <span className="text-xs font-bold text-gray-900">Filters</span>
                    {activeFiltersCount > 0 && (
                      <button 
                        onClick={clearAllFilters}
                        className="text-[10px] font-bold text-brand-600 hover:text-brand-700 uppercase tracking-wider"
                      >
                        Reset All
                      </button>
                    )}
                  </div>

                  <div className="p-2 space-y-4">
                    {/* Priority Section */}
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 px-2 py-1 mb-1">
                        <AlertCircle size={14} className="text-gray-400" />
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Priority</span>
                      </div>
                      <div className="grid grid-cols-1 gap-1">
                        {availablePriorities.map(p => (
                          <button
                            key={p}
                            onClick={() => toggleFilter(filterPriorities, setFilterPriorities, p)}
                            className="flex items-center justify-between px-3 py-2 text-xs font-bold text-gray-700 hover:bg-gray-50 rounded-lg transition-colors group"
                          >
                            <div className="flex items-center gap-2">
                              <div className={`w-2 h-2 rounded-full ${
                                p === 'High priority' ? 'bg-red-500' : p === 'Medium priority' ? 'bg-amber-500' : 'bg-emerald-500'
                              }`} />
                              {p}
                            </div>
                            {filterPriorities.includes(p) && <Check size={14} className="text-brand-600" />}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Labels Section */}
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 px-2 py-1 mb-1">
                        <Tag size={14} className="text-gray-400" />
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Labels</span>
                      </div>
                      <div className="flex flex-wrap gap-1 px-2">
                        {availableLabels.map(l => (
                          <button
                            key={l.id}
                            onClick={() => toggleFilter(filterLabels, setFilterLabels, l.id)}
                            className={`px-2.5 py-1 text-[10px] font-bold rounded-full border transition-all ${
                              filterLabels.includes(l.id) 
                                ? 'bg-brand-500 text-white border-brand-500 shadow-sm scale-105' 
                                : 'bg-gray-50 text-gray-600 border-gray-100 hover:border-brand-200'
                            }`}
                          >
                            {l.name}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Members Section */}
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 px-2 py-1 mb-1">
                        <User size={14} className="text-gray-400" />
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Members</span>
                      </div>
                      <div className="space-y-1">
                        {availableMembers.map(member => (
                          <button
                            key={member.avatar}
                            onClick={() => toggleFilter(filterMembers, setFilterMembers, member.avatar)}
                            className={`w-full flex items-center justify-between px-3 py-2 text-xs font-bold text-gray-700 hover:bg-gray-50 rounded-xl transition-all ${filterMembers.includes(member.avatar) ? 'bg-brand-50' : ''}`}
                          >
                            <div className="flex items-center gap-3">
                              {member.name === 'Unassigned' ? (
                                <div className="w-7 h-7 rounded-full border border-gray-100 bg-gray-50 flex items-center justify-center text-[8px] font-bold text-gray-300">U</div>
                              ) : (
                                <img src={member.avatar} className="w-7 h-7 rounded-full border border-white shadow-sm" alt={member.name} />
                              )}
                              <span className={member.name === 'Unassigned' ? 'text-gray-400 italic font-medium' : ''}>{member.name}</span>
                            </div>
                            {filterMembers.includes(member.avatar) && <Check size={14} className="text-brand-600" />}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Status Flag Section */}
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 px-2 py-1 mb-1">
                        <LayoutList size={14} className="text-gray-400" />
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Status Flags</span>
                      </div>
                      <div className="grid grid-cols-1 gap-1">
                        {availableStatusChips.map(s => (
                          <button
                            key={s.id}
                            onClick={() => toggleFilter(filterStatusChips, setFilterStatusChips, s.id)}
                            className="flex items-center justify-between px-3 py-2 text-xs font-bold text-gray-700 hover:bg-gray-50 rounded-lg transition-colors group"
                          >
                            <div className="flex items-center gap-2">
                              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: s.color }} />
                              {s.name}
                            </div>
                            {filterStatusChips.includes(s.id) && <Check size={14} className="text-brand-600" />}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Dates Section */}
                    <div className="space-y-1 pt-2 border-t border-gray-50">
                      <div className="flex items-center gap-2 px-2 py-1 mb-1">
                        <Clock size={14} className="text-gray-400" />
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Date Conditions</span>
                      </div>
                      <div className="grid grid-cols-1 gap-1">
                        <button
                          onClick={() => setFilterOverdue(!filterOverdue)}
                          className="flex items-center justify-between px-3 py-2 text-xs font-bold text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                        >
                          <div className="flex items-center gap-2">
                             <div className={`w-4 h-4 rounded border flex items-center justify-center ${filterOverdue ? 'bg-red-500 border-red-500 text-white' : 'bg-white border-gray-300'}`}>
                               {filterOverdue && <Check size={10} strokeWidth={4} />}
                             </div>
                             Overdue Tasks
                          </div>
                        </button>
                        <button
                          onClick={() => setFilterDueToday(!filterDueToday)}
                          className="flex items-center justify-between px-3 py-2 text-xs font-bold text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                        >
                          <div className="flex items-center gap-2">
                             <div className={`w-4 h-4 rounded border flex items-center justify-center ${filterDueToday ? 'bg-brand-500 border-brand-500 text-white' : 'bg-white border-gray-300'}`}>
                               {filterDueToday && <Check size={10} strokeWidth={4} />}
                             </div>
                             Due Today
                          </div>
                        </button>
                      </div>
                    </div>
                  </div>
                </Popover.Content>
              </Popover.Portal>
            </Popover.Root>

            <button 
              onClick={() => addTask('todo')}
              className="flex items-center gap-2 px-3 lg:px-4 py-2 text-xs lg:text-sm font-bold text-gray-600 bg-white border border-gray-200 hover:bg-gray-50 rounded-lg transition-all shadow-sm whitespace-nowrap"
            >
              <Plus size={16} className="lg:w-[18px]" />
              Add Task
            </button>
            <button className="flex items-center gap-2 px-3 lg:px-4 py-2 text-xs lg:text-sm font-bold text-white bg-brand-500 hover:bg-brand-600 rounded-lg transition-all shadow-md shadow-brand-100 whitespace-nowrap">
              <Sparkles size={16} className="lg:w-[18px]" />
              View AI Insights
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-4 lg:p-8 custom-scrollbar pt-0 scroll-smooth-touch">
        {activeTab === 'Kanban View' && (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCorners}
            measuring={{
              droppable: {
                strategy: MeasuringStrategy.Always,
              },
            }}
            onDragStart={onDragStart}
            onDragOver={onDragOver}
            onDragEnd={onDragEnd}
          >
            <div className="flex items-start gap-4 lg:gap-6 pb-4 min-w-max">
              <SortableContext items={filteredColumns.map(c => c.id)} strategy={horizontalListSortingStrategy}>
                {filteredColumns.map(column => (
                  <SortableColumn key={column.id} column={column} />
                ))}
              </SortableContext>
              
              {/* Add Board (Column) Button */}
              <div className="w-[280px] lg:w-72 flex-shrink-0">
                {!isAddingColumn ? (
                  <button 
                    onClick={() => setIsAddingColumn(true)}
                    className="w-full flex items-center gap-3 p-4 bg-gray-50/50 hover:bg-gray-100 rounded-2xl border-2 border-dashed border-gray-200 text-gray-500 transition-all group"
                  >
                    <div className="w-8 h-8 rounded-lg bg-white border border-gray-100 flex items-center justify-center group-hover:bg-brand-50 group-hover:border-brand-100 group-hover:text-brand-600 transition-all">
                      <Plus size={18} />
                    </div>
                    <span className="text-sm font-bold group-hover:text-gray-900 transition-colors">Add another board</span>
                  </button>
                ) : (
                  <div className="w-full bg-white p-4 rounded-2xl border border-brand-200 shadow-xl animate-in fade-in zoom-in-95 duration-200">
                    <input 
                      autoFocus
                      placeholder="Enter board title..."
                      value={newColumnTitle}
                      onChange={(e) => setNewColumnTitle(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleAddColumn()}
                      className="w-full text-sm font-bold p-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:bg-white focus:border-brand-300 transition-all mb-3"
                    />
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={handleAddColumn}
                        disabled={!newColumnTitle.trim()}
                        className="flex-1 bg-brand-500 hover:bg-brand-600 disabled:opacity-50 text-white py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-brand-100 transition-all active:scale-95"
                      >
                        Add board
                      </button>
                      <button 
                        onClick={() => { setIsAddingColumn(false); setNewColumnTitle(''); }}
                        className="p-2.5 text-gray-400 hover:text-gray-900 hover:bg-gray-50 rounded-xl transition-all"
                      >
                        <X size={20} />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <DragOverlay dropAnimation={{
              sideEffects: defaultDropAnimationSideEffects({
                styles: { active: { opacity: '0.5' } },
              }),
            }}>
              {activeTask && (
                <div className="w-[280px] lg:w-72 scale-105 rotate-2 shadow-2xl">
                  <TaskCard task={activeTask} />
                </div>
              )}
              {activeColumn && (
                <div className="w-[280px] lg:w-72 scale-[1.02] shadow-2xl pointer-events-none opacity-90">
                  <SortableColumn column={activeColumn} />
                </div>
              )}
            </DragOverlay>
          </DndContext>
        )}

        {activeTab === 'Calendar View' && <CalendarView />}
        {activeTab === 'List View' && <ListView />}
      </div>

      {/* Global Task Detail Modal */}
      {selectedTaskData && (
        <TaskDetailModal 
          task={selectedTaskData.task} 
          isOpen={true} 
          onOpenChange={(open) => !open && setSelectedTaskId(null)} 
          columnTitle={selectedTaskData.columnTitle}
        />
      )}
    </div>
  );
};
