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
  id: string;
  name:string;
  isOnline: boolean;
}

export interface GroupTask {
  id: number;
  title: string;
  completed: boolean;
  status: 'pending' | 'current' | 'done';
  type?: 'checkbox' | 'numerical' | 'numerical-progress';
  progress?: {
    current: number;
    target: number;
    unit: string;
  };
}

export interface Group {
  id: string;
  name: string;
  joinType: 'Request to Join' | 'Invite Only' | 'Closed';
  leader: string;
  members: Member[];
  maxMembers: number;
  status: 'Recruiting' | 'Full' | 'Active';
  partyTasks: GroupTask[];
  requests: Member[];
  jobOffer?: JobOffer | null;
  isLeader?: boolean;
  isIllegal?: boolean;
}

export interface JobOffer {
  job: string;
  title: string;
  description: string;
  icon?: string;
  confirmLabel?: string;
  cancelLabel?: string;
}

// Active Tasks UI
export interface Task {
  id: string;
  title: string;
  status: 'done' | 'active' | 'pending';
  type: 'checkbox' | 'numerical' | 'numerical-progress';
  progress?: {
    current: number;
    target: number;
    unit: string;
  };
}
