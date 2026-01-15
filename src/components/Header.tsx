
import React, { useState } from 'react';
import * as Popover from '@radix-ui/react-popover';
import * as Dialog from '@radix-ui/react-dialog';
import { Search, Bell, ChevronRight, Share2, Menu, X, Sparkles, ChevronDown, Link as LinkIcon, MoreHorizontal, Check, Info, AlertTriangle, CheckCircle2, AlertCircle, Trash2, UserPlus } from 'lucide-react';
import { AvatarStack } from './AvatarStack';
import { useTasks } from '../context/TaskContext';
import { Member, AppNotification } from '../types';

interface HeaderProps {
  onMenuClick: () => void;
}

const NotificationIcon = ({ type }: { type: AppNotification['type'] }) => {
  switch (type) {
    case 'success': return <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600"><CheckCircle2 size={16} /></div>;
    case 'warning': return <div className="w-8 h-8 rounded-full bg-amber-50 flex items-center justify-center text-amber-600"><AlertTriangle size={16} /></div>;
    case 'error': return <div className="w-8 h-8 rounded-full bg-red-50 flex items-center justify-center text-red-600"><AlertCircle size={16} /></div>;
    default: return <div className="w-8 h-8 rounded-full bg-brand-50 flex items-center justify-center text-brand-600"><Info size={16} /></div>;
  }
};

const NotificationDropdown = () => {
  const { notifications, markNotificationAsRead, clearNotifications } = useTasks();

  return (
    <div className="w-80 bg-white rounded-2xl shadow-2xl border border-gray-100 flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200 z-[70]">
      <div className="p-4 border-b border-gray-50 flex items-center justify-between bg-white sticky top-0">
        <span className="text-sm font-bold text-gray-900">Notifications</span>
        <div className="flex items-center gap-3">
          <button 
            onClick={clearNotifications}
            className="text-[10px] font-bold text-gray-400 hover:text-red-500 uppercase tracking-wider transition-colors"
          >
            Clear all
          </button>
        </div>
      </div>

      <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
        {notifications.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-3 border border-gray-100/50">
              <Bell size={20} className="text-gray-300" />
            </div>
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">No new notifications</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {notifications.map((notification) => (
              <button
                key={notification.id}
                onClick={() => markNotificationAsRead(notification.id)}
                className={`w-full flex gap-3 p-4 text-left transition-colors hover:bg-gray-50/50 relative group ${!notification.read ? 'bg-brand-50/20' : ''}`}
              >
                <NotificationIcon type={notification.type} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-0.5">
                    <p className={`text-xs font-bold truncate ${!notification.read ? 'text-gray-900' : 'text-gray-600'}`}>
                      {notification.title}
                    </p>
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter shrink-0 ml-2">
                      {notification.timestamp}
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-500 font-medium line-clamp-2 leading-relaxed">
                    {notification.message}
                  </p>
                </div>
                {!notification.read && (
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-brand-500 rounded-full" />
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {notifications.length > 0 && (
        <div className="p-3 bg-gray-50/50 border-t border-gray-50">
          <button className="w-full py-2 text-[11px] font-bold text-brand-600 hover:text-brand-700 bg-white border border-gray-100 rounded-xl shadow-sm transition-all active:scale-95">
            View All Activity
          </button>
        </div>
      )}
    </div>
  );
};

const RoleDropdown: React.FC<{ 
  currentRole: Member['role']; 
  onSelect: (role: Member['role']) => void;
  className?: string;
}> = ({ currentRole, onSelect, className }) => {
  return (
    <Popover.Root>
      <Popover.Trigger asChild>
        <button className={`flex items-center gap-1.5 transition-all outline-none ${className}`}>
          {currentRole} <ChevronDown size={14} className="text-gray-300" />
        </button>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content className="bg-white border border-gray-100 rounded-xl shadow-xl p-1.5 z-[120] min-w-[120px] animate-in fade-in zoom-in-95" sideOffset={5} align="end">
          {(['Admin', 'Member', 'Guest'] as Member['role'][]).map(role => (
            <button 
              key={role}
              onClick={() => onSelect(role)}
              className={`w-full text-left px-3 py-2 text-xs font-bold rounded-lg flex items-center justify-between transition-colors ${currentRole === role ? 'bg-brand-50 text-brand-700' : 'text-gray-700 hover:bg-gray-50'}`}
            >
              {role}
              {currentRole === role && <Check size={12} strokeWidth={3} />}
            </button>
          ))}
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
};

const ShareBoardModal: React.FC<{ isOpen: boolean; onOpenChange: (open: boolean) => void }> = ({ isOpen, onOpenChange }) => {
  const { boardMembers, inviteToBoard, updateBoardMemberRole, toggleBoardMember } = useTasks();
  const [activeTab, setActiveTab] = useState<'members' | 'requests'>('members');
  const [inviteValue, setInviteValue] = useState('');
  const [inviteRole, setInviteRole] = useState<Member['role']>('Member');
  const [linkCopied, setLinkCopied] = useState(false);

  const handleInvite = () => {
    if (!inviteValue.trim()) return;
    inviteToBoard(inviteValue, inviteRole);
    setInviteValue('');
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText('https://clarity.app/invite/board-123');
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 2000);
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100] animate-in fade-in duration-300" />
        <Dialog.Content className="fixed top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] w-[95vw] max-w-[540px] bg-white rounded-2xl shadow-2xl z-[101] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200 border border-gray-100 focus:outline-none text-gray-900 font-sans">
          
          <div className="flex items-center justify-between px-6 py-5 border-b border-gray-50">
            <Dialog.Title className="text-xl font-bold tracking-tight text-gray-900">Share board</Dialog.Title>
            <Dialog.Close className="p-2 text-gray-400 hover:text-gray-900 transition-colors rounded-lg hover:bg-gray-100">
              <X size={20} />
            </Dialog.Close>
          </div>

          <div className="px-6 py-6 space-y-6 overflow-y-auto custom-scrollbar max-h-[80vh]">
            <div className="bg-purple-50 rounded-xl p-4 flex items-center justify-between border border-purple-100 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="text-purple-600 bg-purple-100 p-2 rounded-lg">
                  <Sparkles size={18} strokeWidth={2.5} />
                </div>
                <p className="text-[13px] font-bold text-purple-900">Upgrade to share boards with unlimited collaborators!</p>
              </div>
              <button className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-[13px] font-bold transition-all active:scale-95 shadow-sm">
                Upgrade
              </button>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex-1 relative group">
                <input 
                  type="text" 
                  value={inviteValue}
                  onChange={(e) => setInviteValue(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleInvite()}
                  placeholder="Email address or name"
                  className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm outline-none focus:border-brand-300 focus:bg-white placeholder:text-gray-400 font-medium transition-all shadow-sm"
                />
              </div>
              
              <RoleDropdown 
                currentRole={inviteRole} 
                onSelect={setInviteRole} 
                className="bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-700 font-bold hover:bg-gray-50 shadow-sm"
              />

              <button 
                onClick={handleInvite}
                disabled={!inviteValue.trim()}
                className="bg-brand-500 hover:bg-brand-600 text-white px-6 py-3 rounded-xl text-sm font-bold transition-all shadow-lg shadow-brand-100 active:scale-95 disabled:opacity-50 disabled:shadow-none"
              >
                Share
              </button>
            </div>

            <div className="flex items-center gap-4 p-4 bg-gray-50/50 rounded-2xl border border-gray-100 border-dashed">
              <div className="w-10 h-10 bg-white border border-gray-100 rounded-xl flex items-center justify-center text-gray-400 shadow-sm">
                {linkCopied ? <Check size={18} className="text-emerald-500" /> : <LinkIcon size={18} />}
              </div>
              <div className="flex-1">
                <p className="text-[14px] font-bold text-gray-900">Share this board with a link</p>
                <button 
                  onClick={handleCopyLink}
                  className="text-brand-600 text-xs font-bold hover:underline"
                >
                  {linkCopied ? 'Copied!' : 'Create link'}
                </button>
              </div>
            </div>

            <div className="border-b border-gray-100 flex gap-8 pt-2">
              <button 
                onClick={() => setActiveTab('members')}
                className={`pb-3 text-[14px] font-bold relative transition-colors ${activeTab === 'members' ? 'text-brand-600' : 'text-gray-400 hover:text-gray-700'}`}
              >
                Board members <span className={`px-2 py-0.5 rounded-lg ml-1 text-[11px] ${activeTab === 'members' ? 'bg-brand-50 text-brand-700' : 'bg-gray-100 text-gray-500'}`}>{boardMembers.length}</span>
                {activeTab === 'members' && <div className="absolute bottom-[-1px] left-0 right-0 h-[3px] bg-brand-600 rounded-t-full" />}
              </button>
              <button 
                onClick={() => setActiveTab('requests')}
                className={`pb-3 text-[14px] font-bold relative transition-colors ${activeTab === 'requests' ? 'text-brand-600' : 'text-gray-400 hover:text-gray-700'}`}
              >
                Join requests
                {activeTab === 'requests' && <div className="absolute bottom-[-1px] left-0 right-0 h-[3px] bg-brand-600 rounded-t-full" />}
              </button>
            </div>

            <div className="space-y-4 pt-2">
              {activeTab === 'members' ? (
                boardMembers.map((member, idx) => {
                  const initials = member.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
                  const colors = ['bg-[#0EA5E9]', 'bg-[#FF7452]', 'bg-[#10B981]', 'bg-[#8B5CF6]', 'bg-[#EF4444]'];
                  const bgColor = colors[idx % colors.length];

                  return (
                    <div key={member.id} className="flex items-center justify-between group p-1.5 hover:bg-gray-50/80 rounded-2xl transition-all">
                      <div className="flex items-center gap-4">
                        <div className="relative">
                          {member.avatar.includes('dicebear') ? (
                             <div className={`w-11 h-11 ${bgColor} rounded-full flex items-center justify-center text-[14px] font-bold shadow-sm text-white border-2 border-white`}>
                              {initials}
                            </div>
                          ) : (
                            <img src={member.avatar} className="w-11 h-11 rounded-full border-2 border-white shadow-sm object-cover" alt={member.name} />
                          )}
                          <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-[2.5px] border-white ${
                            member.status === 'online' ? 'bg-emerald-500' : 'bg-red-500'
                          }`} />
                        </div>
                        <div className="min-w-0">
                          <p className="text-[14px] font-bold text-gray-900 truncate leading-tight flex items-center gap-1.5">
                            {member.name} {member.id === 'm1' && <span className="text-[10px] bg-gray-100 text-gray-400 px-1.5 py-0.5 rounded-md font-bold uppercase tracking-tighter">You</span>}
                          </p>
                          <p className="text-[11px] text-gray-400 truncate font-semibold mt-0.5 tracking-wide">{member.username} • Workspace admin</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <RoleDropdown 
                          currentRole={member.role} 
                          onSelect={(role) => updateBoardMemberRole(member.id, role)}
                          className="px-3 py-1.5 rounded-xl text-[12px] font-bold text-gray-500 hover:bg-white hover:text-gray-900 hover:shadow-sm"
                        />
                        {member.id !== 'm1' && (
                          <button 
                            onClick={() => toggleBoardMember(member.id)}
                            className="p-1.5 text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all rounded-lg hover:bg-red-50"
                            title="Remove from board"
                          >
                            <Trash2Icon size={16} />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="px-6 py-12 text-center">
                  <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-gray-100/50">
                    <UserPlusIcon size={24} className="text-gray-200" />
                  </div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">No join requests</p>
                </div>
              )}
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

const Trash2Icon: React.FC<{ size?: number; className?: string }> = ({ size = 20, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M3 6h18m-2 0v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6m3 0V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2M10 11v6M14 11v6" />
  </svg>
);

const UserPlusIcon: React.FC<{ size?: number; className?: string }> = ({ size = 20, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="8.5" cy="7" r="4" />
    <line x1="20" y1="8" x2="20" y2="14" />
    <line x1="17" y1="11" x2="23" y2="11" />
  </svg>
);

const MemberFilterDropdown: React.FC<{ 
  members: Member[]; 
}> = ({ members }) => {
  const { filterMembers, setFilterMembers } = useTasks();

  const toggleFilter = (avatarUrl: string) => {
    if (filterMembers.includes(avatarUrl)) {
      setFilterMembers(filterMembers.filter(url => url !== avatarUrl));
    } else {
      setFilterMembers([...filterMembers, avatarUrl]);
    }
  };

  return (
    <div className="w-64 bg-white rounded-xl shadow-2xl border border-gray-100 p-1.5 animate-in fade-in zoom-in-95 duration-200 z-[70]">
      <div className="max-h-[300px] overflow-y-auto custom-scrollbar space-y-0.5">
        {members.map((member) => {
          const isSelected = filterMembers.includes(member.avatar);

          return (
            <button 
              key={member.id}
              onClick={() => toggleFilter(member.avatar)}
              className={`w-full flex items-center justify-between px-3 py-2 text-sm transition-all rounded-lg group ${isSelected ? 'bg-brand-50 text-brand-700 font-semibold' : 'hover:bg-gray-50 text-gray-700 font-medium'}`}
            >
              <div className="flex items-center gap-2.5">
                <img src={member.avatar} className={`w-8 h-8 rounded-full object-cover shadow-sm ${isSelected ? 'ring-2 ring-brand-400' : ''}`} alt={member.name} />
                <span className="truncate">{member.name}</span>
              </div>
              {isSelected && (
                <div className="w-2 h-2 bg-brand-500 rounded-full" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
  const { 
    searchTerm, 
    setSearchTerm, 
    boardMembers,
    filterMembers,
    setFilterMembers,
    notifications,
  } = useTasks();

  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const unreadCount = notifications.filter(n => !n.read).length;

  const handleAvatarFilterToggle = (url: string) => {
    if (filterMembers.includes(url)) {
      setFilterMembers(filterMembers.filter(m => m !== url));
    } else {
      setFilterMembers([...filterMembers, url]);
    }
  };

  const boardMemberItems = boardMembers.map(m => ({ url: m.avatar, name: m.name }));

  return (
    <header className="h-16 bg-white border-b border-gray-100 flex items-center justify-between px-6 sticky top-0 z-20 shadow-sm">
      <div className="flex items-center gap-2.5 text-sm font-medium">
        <button 
          onClick={onMenuClick}
          className="lg:hidden p-1.5 text-gray-500 hover:text-gray-900 hover:bg-gray-50 rounded-lg mr-1"
        >
          <Menu size={20} />
        </button>
        <div className="hidden sm:flex items-center gap-2 text-gray-400">
          <div className="w-5 h-5 bg-gray-100 rounded flex items-center justify-center text-[10px] font-bold">🏢</div>
          <span className="text-[13px] font-medium">Just Basics</span>
        </div>
        <ChevronRight size={14} className="hidden sm:block text-gray-300" />
        <span className="text-gray-900 font-bold tracking-tight text-[15px]">Mobile App</span>
      </div>

      <div className="flex items-center gap-5">
        <div className="relative group hidden sm:block">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search Tasks" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 bg-[#F6F8FA] border-none rounded-xl text-[13px] w-48 lg:w-56 focus:bg-white focus:ring-1 focus:ring-brand-200 transition-all outline-none font-medium text-gray-700 placeholder:text-gray-400"
          />
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <AvatarStack 
              items={boardMemberItems} 
              size="md" 
              limit={5}
              activeAvatars={filterMembers}
              onAvatarClick={handleAvatarFilterToggle}
              renderBadge={(count) => (
                <Popover.Root>
                  <Popover.Trigger asChild>
                    <button className="w-9 h-9 rounded-full border-2 border-white bg-gray-100 flex items-center justify-center text-[11px] font-bold text-gray-500 hover:bg-gray-200 transition-all focus:outline-none shadow-sm">
                      +{count}
                    </button>
                  </Popover.Trigger>
                  <Popover.Portal>
                    <Popover.Content side="bottom" align="center" sideOffset={12} className="z-[70] outline-none">
                      <MemberFilterDropdown members={boardMembers.slice(5)} />
                    </Popover.Content>
                  </Popover.Portal>
                </Popover.Root>
              )}
            />
          </div>

          <div className="h-6 w-[1px] bg-gray-200 hidden sm:block mx-2"></div>

          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsShareModalOpen(true)}
              className="hidden sm:flex items-center gap-2.5 px-6 py-2.5 border border-gray-100 rounded-full text-[14px] font-bold text-[#0065FF] hover:bg-gray-50 hover:border-gray-200 transition-all shadow-sm bg-white active:scale-95"
            >
              <Share2 size={18} className="text-[#0065FF]" />
              Invite
            </button>

            <Popover.Root>
              <Popover.Trigger asChild>
                <button className="relative p-1 text-gray-400 hover:text-gray-600 transition-all focus:outline-none active:scale-90">
                  <Bell size={24} strokeWidth={2} />
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-[#EF4444] rounded-full border-2 border-white animate-in fade-in zoom-in duration-300"></span>
                  )}
                </button>
              </Popover.Trigger>
              <Popover.Portal>
                <Popover.Content align="end" sideOffset={16} className="z-[70] outline-none">
                  <NotificationDropdown />
                </Popover.Content>
              </Popover.Portal>
            </Popover.Root>
          </div>
        </div>
      </div>

      <ShareBoardModal isOpen={isShareModalOpen} onOpenChange={setIsShareModalOpen} />
    </header>
  );
};
