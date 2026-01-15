
export type Priority = 'High priority' | 'Medium priority' | 'Low priority';

export interface StatusFlag {
  id: string;
  name: string;
  color: string;
}

export type StatusChip = StatusFlag; 

export interface Label {
  id: string;
  name: string;
  color: string;
}

export interface Member {
  id: string;
  name: string;
  avatar: string;
  username: string;
  role: 'Admin' | 'Member' | 'Guest';
  status?: 'online' | 'offline';
}

export interface ChecklistItem {
  id: string;
  text: string;
  completed: boolean;
}

export interface Comment {
  id: string;
  user: {
    name: string;
    avatar: string;
  };
  text: string;
  timestamp: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  priority: Priority;
  labels: Label[];
  startDate?: string;
  dueDate: string;
  assignees: string[]; // URLs
  statusChip?: StatusFlag;
  attachments: number;
  checklist: ChecklistItem[];
  comments: Comment[];
}

export interface ColumnData {
  id: string;
  title: string;
  tasks: Task[];
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  type: 'info' | 'success' | 'warning' | 'error';
}

export interface AppState {
  columns: ColumnData[];
  notifications: AppNotification[];
  selectedTaskId: string | null;
}
