// FIX: Import 'React' and 'LucideIcon' types to resolve TypeScript errors.
import type React from 'react';
import type { LucideIcon } from 'lucide-react';

// General
export interface AppDefinition {
  id: string;
  name: string;
  icon: React.ElementType | LucideIcon;
  color: string;
  isTaskbar: boolean;
  action: () => void;
  isCustom?: boolean;
  url?: string;
  isNetworkStatusRequired?: boolean;
}

export interface NetworkStatus {
  isConnected: boolean;
  signalStrength: number;
}

// Groups App
export interface Member {
  id: number;
  name:string;
  isOnline: boolean;
}

export interface GroupTask {
  id: number;
  title: string;
  completed: boolean;
  status: 'pending' | 'current' | 'done';
}

export interface Group {
  id: string;
  name: string;
  joinType: 'Request to Join' | 'Invite Only' | 'Closed';
  leader: number; // member id
  members: Member[];
  maxMembers: number;
  status: 'Recruiting' | 'Full' | 'Active';
  partyTasks: GroupTask[];
  requests: Member[];
  isLeader?: boolean;
}

// Active Tasks UI
export interface TaskDisplayProps {
  title: string;
  content: string;
}