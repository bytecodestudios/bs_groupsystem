import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Bell, ClipboardEdit, LogOut, ArrowLeft, Trash2 } from 'lucide-react';
import { Group } from '../../utils/types';
import { MembersTab, RequestsTab, TasksTab } from './GroupTabs';
import { ConfirmationModal } from './Modals';
import { useLocale } from '../../hooks/useLocale';

const MotionDiv = motion.div;

const GroupDetails: React.FC<{ group: Group, onBack: () => void, onUpdateGroup: (group: Group) => void, onDisbandOrLeave: () => void, citizenId: string | null }> = ({ group, onBack, onUpdateGroup, onDisbandOrLeave, citizenId }) => {
    const isLeader = group.isLeader;
    const { t } = useLocale();
    const [activeTab, setActiveTab] = useState(() => {
        if (isLeader && group.requests.length > 0) {
            return 'requests';
        }
        return 'members';
    });
    const [isConfirmModalOpen, setConfirmModalOpen] = useState(false);

    const tabs = useMemo(() => {
        let baseTabs = [{ id: 'members', name: t('details.tab_members'), icon: Users }, { id: 'partyTasks', name: t('details.tab_group_tasks'), icon: ClipboardEdit }];
        if (isLeader) baseTabs.splice(1, 0, { id: 'requests', name: t('details.tab_requests'), icon: Bell });
        return baseTabs;
    }, [isLeader, t]);

    return (
        <div className="h-full flex flex-col bg-background rounded-b-2xl">
            <header className="flex-shrink-0 p-4 flex items-center justify-between"><button onClick={onBack} className="flex items-center space-x-2 text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors"><ArrowLeft className="w-5 h-5" /><span>{t('details.back_to_dashboard')}</span></button><h2 className="text-xl font-bold text-foreground">{group.name}</h2><div className="w-40" /></header>
            <div className="p-6 pt-2"><div className="p-4 bg-secondary/30 rounded-lg flex justify-around items-center text-center"><div className="w-1/3"><p className="text-xs text-muted-foreground font-semibold uppercase">{t('details.status')}</p><p className="text-lg font-bold text-green-400">{group.status}</p></div><div className="w-px h-8 bg-border" /><div className="w-1/3"><p className="text-xs text-muted-foreground font-semibold uppercase">{t('details.members')}</p><p className="text-lg font-bold text-foreground">{group.members.length}/{group.maxMembers}</p></div><div className="w-px h-8 bg-border" /><div className="w-1/3"><p className="text-xs text-muted-foreground font-semibold uppercase">{t('details.join_type')}</p><p className="text-lg font-bold text-blue-400">{group.joinType}</p></div></div></div>
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
                <button onClick={() => setConfirmModalOpen(true)} className={`flex items-center space-x-2 px-3 py-1.5 text-sm font-semibold rounded-lg transition-colors ${isLeader ? 'bg-red-600/20 text-red-300 hover:bg-red-600/30' : 'bg-secondary hover:bg-muted'}`}><LogOut className="w-4 h-4" /><span>{isLeader ? t('details.disband_group') : t('details.leave_group')}</span></button>
            </div>
            <main className="flex-grow overflow-y-auto bg-black/20"><AnimatePresence mode="wait"><MotionDiv key={activeTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="p-6">{activeTab === 'members' && <MembersTab group={group} onUpdateGroup={onUpdateGroup} citizenId={citizenId} />}{activeTab === 'requests' && <RequestsTab group={group} onUpdateGroup={onUpdateGroup} citizenId={citizenId} />}{activeTab === 'partyTasks' && <TasksTab group={group} onUpdateGroup={onUpdateGroup} citizenId={citizenId} />}</MotionDiv></AnimatePresence></main>
            <AnimatePresence>{isConfirmModalOpen && <ConfirmationModal title={isLeader ? t('details.disband_title') : t('details.leave_title')} message={<>{t('details.confirm_action_prefix')} {isLeader ? t('details.disband_action') : t('details.leave_action')} <span className="font-semibold text-foreground">{group.name}</span>{t('details.cannot_be_undone')}</>} confirmText={isLeader ? t('details.disband_confirm') : t('details.leave_confirm')} confirmClass={isLeader ? "bg-red-600 hover:bg-red-700" : "bg-red-600 hover:bg-red-700"} onConfirm={() => { onDisbandOrLeave(); setConfirmModalOpen(false); }} onCancel={() => setConfirmModalOpen(false)} Icon={Trash2} />}</AnimatePresence>
        </div>
    );
};

export default GroupDetails;