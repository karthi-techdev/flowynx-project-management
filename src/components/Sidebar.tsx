
import React, { useState } from 'react';
import { 
  LayoutGrid, FolderKanban, ListTodo, Calendar, Users, Settings, 
  HelpCircle, ChevronDown, ChevronRight, Plus, Hash, X
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState('Tasks');
  const [justBasicsOpen, setJustBasicsOpen] = useState(true);

  const navItems = [
    { name: 'Dashboard', icon: LayoutGrid },
    { name: 'Projects', icon: FolderKanban },
    { name: 'Tasks', icon: ListTodo },
    { name: 'Calendar', icon: Calendar },
    { name: 'Teams', icon: Users },
    { name: 'Settings', icon: Settings },
  ];

  return (
    <aside className={`
      fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-100 flex flex-col h-full transition-transform duration-300 ease-in-out
      lg:static lg:translate-x-0
      ${isOpen ? 'translate-x-0' : '-translate-x-full'}
    `}>
      <div className="p-6 pb-2">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-brand-500 rounded-lg flex items-center justify-center text-white shadow-lg shadow-brand-100">
              <Hash size={20} strokeWidth={3} />
            </div>
            <span className="text-xl font-bold tracking-tight text-gray-900">Clarity</span>
          </div>
          <button 
            onClick={onClose}
            className="lg:hidden p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="space-y-1 mb-8">
          {navItems.map((item) => (
            <button
              key={item.name}
              onClick={() => setActiveTab(item.name)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                activeTab === item.name 
                  ? 'bg-brand-50 text-brand-700 shadow-sm' 
                  : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <item.icon size={18} strokeWidth={activeTab === item.name ? 2.5 : 2} />
              {item.name}
            </button>
          ))}
        </nav>

        <div className="mb-4">
          <div className="flex items-center justify-between px-3 mb-2">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Projects</span>
            <button className="text-gray-400 hover:text-gray-600"><Plus size={14} /></button>
          </div>
          
          <div className="space-y-1">
            <div className="px-3">
              <button 
                onClick={() => setJustBasicsOpen(!justBasicsOpen)}
                className="w-full flex items-center gap-2 py-2 text-sm font-semibold text-gray-700 bg-gray-50 px-2 rounded-md justify-between"
              >
                <div className="flex items-center gap-2">
                   <FolderKanban size={16} />
                   Just Basics
                </div>
                <ChevronDown size={14} className={`transition-transform ${!justBasicsOpen ? '-rotate-90' : ''}`} />
              </button>
              
              {justBasicsOpen && (
                <div className="mt-1 ml-4 border-l-2 border-gray-100 pl-4 space-y-1">
                  <button className="w-full text-left py-2 text-sm font-medium text-gray-400 hover:text-gray-900">Website</button>
                  <button className="w-full text-left py-2 text-sm font-semibold text-gray-900 bg-brand-50 text-brand-800 px-3 -ml-3 rounded-md">Mobile App</button>
                </div>
              )}
            </div>

            <div className="px-3 mt-2">
               <button className="w-full flex items-center gap-2 py-2 text-sm font-medium text-gray-500 hover:text-gray-900 justify-between">
                <div className="flex items-center gap-2">
                   <FolderKanban size={16} />
                   Intex Launch
                </div>
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-auto p-4 space-y-4">
        <button className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-gray-500 hover:text-gray-900 w-full transition-colors">
          <HelpCircle size={18} />
          Help or Support
        </button>

        <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 flex items-center gap-3 cursor-pointer hover:bg-gray-100 transition-colors">
          <img src="https://picsum.photos/seed/user/64" className="w-10 h-10 rounded-lg object-cover shadow-sm" alt="Profile" />
          <div className="flex-1 overflow-hidden">
            <p className="text-sm font-bold text-gray-900 truncate">Chandrika M</p>
            <p className="text-[10px] text-gray-500 truncate font-medium">chandrika@gmail.com</p>
          </div>
          <div className="flex flex-col gap-0.5">
            <ChevronDown size={12} className="text-gray-400" />
            <ChevronRight size={12} className="text-gray-400 rotate-90" />
          </div>
        </div>
      </div>
    </aside>
  );
};
