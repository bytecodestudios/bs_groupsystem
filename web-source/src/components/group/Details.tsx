import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Bell, ClipboardEdit, LogOut, ArrowLeft, Trash2 } from 'lucide-react';
import { Group } from '../../utils/types';
import { MembersTab, RequestsTab, TasksTab } from './GroupTabs';
import { ConfirmationModal } from './Modals';

const MotionDiv = motion.div;

const GroupDetails: React.FC<{ group: Group, onBack: () => void, onUpdateGroup: (group: Group) => void, onDisbandOrLeave: () => void, citizenId: string | null }> = ({ group, onBack, onUpdateGroup, onDisbandOrLeave, citizenId }) => {
    const isLeader = group.isLeader;
    const [activeTab, setActiveTab] = useState(() => {
        if (isLeader && group.requests.length > 0) {
            return 'requests';
        }
        return 'members';
    });
    const [isConfirmModalOpen, setConfirmModalOpen] = useState(false);

    const tabs = useMemo(() => {
        let baseTabs = [{ id: 'members', name: 'Members', icon: Users }, { id: 'partyTasks', name: 'Group Tasks', icon: ClipboardEdit }];
        if (isLeader) baseTabs.splice(1, 0, { id: 'requests', name: 'Requests', icon: Bell });
        return baseTabs;
    }, [isLeader]);

    return (
        <div className="h-full flex flex-col bg-background rounded-b-2xl">
            <header className="flex-shrink-0 p-4 flex items-center justify-between"><button onClick={onBack} className="flex items-center space-x-2 text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors"><ArrowLeft className="w-5 h-5" /><span>Back to Dashboard</span></button><h2 className="text-xl font-bold text-foreground">{group.name}</h2><div className="w-40" /></header>
            <div className="p-6 pt-2"><div className="p-4 bg-secondary/30 rounded-lg flex justify-around items-center text-center"><div className="w-1/3"><p className="text-xs text-muted-foreground font-semibold uppercase">Status</p><p className="text-lg font-bold text-green-400">{group.status}</p></div><div className="w-px h-8 bg-border" /><div className="w-1/3"><p className="text-xs text-muted-foreground font-semibold uppercase">Members</p><p className="text-lg font-bold text-foreground">{group.members.length}/{group.maxMembers}</p></div><div className="w-px h-8 bg-border" /><div className="w-1/3"><p className="text-xs text-muted-foreground font-semibold uppercase">Join Type</p><p className="text-lg font-bold text-blue-400">{group.joinType}</p></div></div></div>
            <div className="px-6 py-2 border-b border-border flex justify-between items-center">
                <div className="flex items-center space-x-2">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`relative flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                                activeTab === tab.id
                                    ? 'bg-secondary text-foreground border border-foreground/30'
                                    : 'text-muted-foreground hover:bg-secondary/70 hover:text-foreground'
                            }`}
                        >
                            <tab.icon className="w-5 h-5" />
                            <span>{tab.name}</span>
                            {tab.id === 'requests' && group.requests.length > 0 && (
                                <span className="ml-2 flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">
                                    {group.requests.length}
                                </span>
                            )}
                        </button>
                    ))}
                </div>
                <button onClick={() => setConfirmModalOpen(true)} className={`flex items-center space-x-2 px-3 py-1.5 text-sm font-semibold rounded-lg transition-colors ${isLeader ? 'bg-red-600/20 text-red-300 hover:bg-red-600/30' : 'bg-secondary hover:bg-muted'}`}><LogOut className="w-4 h-4" /><span>{isLeader ? 'Disband Group' : 'Leave Group'}</span></button>
            </div>
            <main className="flex-grow overflow-y-auto bg-black/20"><AnimatePresence mode="wait"><MotionDiv key={activeTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="p-6">{activeTab === 'members' && <MembersTab group={group} onUpdateGroup={onUpdateGroup} citizenId={citizenId} />}{activeTab === 'requests' && <RequestsTab group={group} onUpdateGroup={onUpdateGroup} citizenId={citizenId} />}{activeTab === 'partyTasks' && <TasksTab group={group} onUpdateGroup={onUpdateGroup} citizenId={citizenId} />}</MotionDiv></AnimatePresence></main>
            <AnimatePresence>{isConfirmModalOpen && <ConfirmationModal title={isLeader ? "Disband Group?" : "Leave Group?"} message={<>Are you sure you want to {isLeader ? 'disband' : 'leave'} <span className="font-semibold text-foreground">{group.name}</span>? This cannot be undone.</>} confirmText={isLeader ? "Confirm Disband" : "Confirm Leave"} confirmClass={isLeader ? "bg-red-600 hover:bg-red-700" : "bg-red-600 hover:bg-red-700"} onConfirm={() => { onDisbandOrLeave(); setConfirmModalOpen(false); }} onCancel={() => setConfirmModalOpen(false)} Icon={Trash2} />}</AnimatePresence>
        </div>
    );
};

export default GroupDetails;