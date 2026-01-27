import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LayoutDashboard, Users, Settings } from 'lucide-react';
import { fetchNui } from '../../utils/fetchNui';
import { useNuiEvent } from '../../hooks/useNuiEvent';
import { Group } from '../../utils/types';
import { DashboardView, GroupsView } from './Dashboard';
import GroupDetails from './Details';
import { CreateGroupModal } from './Modals';
import { SettingsTab } from './SettingsTab';
import { useNotifications } from '../misc/Notification';

const MotionDiv = motion.div;

const SkeletonPlaceholder: React.FC<{ className?: string }> = ({ className }) => (
    <div className={`relative bg-muted/30 overflow-hidden rounded ${className}`}>
        <MotionDiv
            className="absolute inset-0 -translate-x-full"
            animate={{ translateX: '100%' }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
            style={{ background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.05), transparent)' }}
        />
    </div>
);

const GroupsSkeletonLoader: React.FC = () => (
    <div className="h-full flex flex-col p-6 bg-background rounded-b-2xl font-sans relative overflow-hidden">
        {/* Tab Navigation Skeleton */}
        <div className="flex-shrink-0 flex justify-center mb-8">
             <div className="p-1 bg-secondary/30 rounded-xl border border-border/50 flex space-x-2">
                <SkeletonPlaceholder className="h-9 w-24 rounded-lg" />
                <SkeletonPlaceholder className="h-9 w-24 rounded-lg" />
                <SkeletonPlaceholder className="h-9 w-24 rounded-lg" />
             </div>
        </div>

        {/* Dashboard View Skeleton */}
        <main className="flex-grow flex flex-col space-y-6">
             {/* Header */}
             <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
                <div className="lg:col-span-2 space-y-6 flex flex-col">
                    <div className="flex justify-between items-center">
                        <SkeletonPlaceholder className="h-8 w-48 rounded-lg" />
                    </div>
                    {/* My Group Card Skeleton */}
                    <div className="bg-secondary/20 border border-border/50 rounded-xl p-6 h-56 relative overflow-hidden flex flex-col justify-between">
                         <div className="flex justify-between items-start">
                            <div className="space-y-2">
                                <SkeletonPlaceholder className="h-8 w-40 rounded-md" />
                                <SkeletonPlaceholder className="h-4 w-24 rounded-md" />
                            </div>
                            <SkeletonPlaceholder className="h-6 w-20 rounded-full" />
                         </div>
                         <div className="space-y-2">
                             <div className="flex justify-between">
                                 <SkeletonPlaceholder className="h-3 w-16 rounded" />
                                 <SkeletonPlaceholder className="h-3 w-10 rounded" />
                             </div>
                             <SkeletonPlaceholder className="h-2 w-full rounded-full" />
                         </div>
                         <div className="flex justify-between items-center pt-2">
                             <div className="flex -space-x-2">
                                <SkeletonPlaceholder className="h-8 w-8 rounded-full border-2 border-background" />
                                <SkeletonPlaceholder className="h-8 w-8 rounded-full border-2 border-background" />
                                <SkeletonPlaceholder className="h-8 w-8 rounded-full border-2 border-background" />
                             </div>
                             <SkeletonPlaceholder className="h-4 w-24 rounded" />
                         </div>
                    </div>
                    
                    {/* Missions Skeleton */}
                    <div className="bg-secondary/20 border border-border/50 rounded-xl p-5 flex-grow relative overflow-hidden">
                        <div className="flex justify-between mb-4">
                            <SkeletonPlaceholder className="h-5 w-32 rounded" />
                            <SkeletonPlaceholder className="h-5 w-16 rounded-full" />
                        </div>
                        <div className="space-y-3">
                            <SkeletonPlaceholder className="h-10 w-full rounded-lg" />
                            <SkeletonPlaceholder className="h-10 w-full rounded-lg" />
                            <SkeletonPlaceholder className="h-10 w-full rounded-lg" />
                        </div>
                    </div>
                </div>

                {/* Right Column Skeleton */}
                <div className="space-y-4 h-full flex flex-col">
                     <div className="bg-secondary/20 border border-border/50 rounded-xl p-5 h-full relative overflow-hidden flex flex-col">
                        <SkeletonPlaceholder className="h-5 w-36 mb-6 rounded" />
                        
                        <div className="space-y-6 flex-grow">
                             <div className="space-y-3">
                                <div className="flex justify-between">
                                    <SkeletonPlaceholder className="h-3 w-20 rounded" />
                                    <SkeletonPlaceholder className="h-4 w-6 rounded" />
                                </div>
                                <div className="space-y-2">
                                    <SkeletonPlaceholder className="h-12 w-full rounded-lg" />
                                    <SkeletonPlaceholder className="h-12 w-full rounded-lg" />
                                </div>
                             </div>

                             <div className="space-y-3">
                                <div className="flex justify-between">
                                    <SkeletonPlaceholder className="h-3 w-24 rounded" />
                                    <SkeletonPlaceholder className="h-4 w-6 rounded" />
                                </div>
                                <div className="space-y-2">
                                    <SkeletonPlaceholder className="h-12 w-full rounded-lg" />
                                    <SkeletonPlaceholder className="h-12 w-full rounded-lg" />
                                    <SkeletonPlaceholder className="h-12 w-full rounded-lg" />
                                </div>
                             </div>
                        </div>
                     </div>
                </div>
             </div>
        </main>
    </div>
);

type TabId = 'dashboard' | 'groups' | 'settings';

const Groups = () => {
    const [isLoading, setIsLoading] = useState(true);
    const [publicGroups, setPublicGroups] = useState<Group[]>([]);
    const [myGroup, setMyGroup] = useState<Group | null>(null);
    const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
    const [isCreateModalOpen, setCreateModalOpen] = useState(false);
    const [sentRequests, setSentRequests] = useState<Set<string>>(new Set());
    const [activeTab, setActiveTab] = useState<TabId>('dashboard');
    
    const { addNotification } = useNotifications();

    const tabs = [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'groups', label: 'Groups', icon: Users },
        { id: 'settings', label: 'Settings', icon: Settings },
    ];

    const fetchGroupsData = async () => {
        const response = await fetchNui<{ status: boolean, groups: Group[], myGroup: Group | null }>("fetchGroups", {});
        if (response?.status) {
            setPublicGroups(response.groups);
            setMyGroup(response.myGroup);
        }
    };

    useEffect(() => {
        setIsLoading(true);
        fetchGroupsData().finally(() => setTimeout(() => setIsLoading(false), 800));
    }, []);

    useNuiEvent<any>('refreshGroup', (data) => {
        if (selectedGroup && data.groupId === selectedGroup.id) {
            fetchNui<any>("fetchSingleGroup", { groupId: selectedGroup.id }).then(res => {
                if (res?.status) setSelectedGroup(res.group);
            });
        }
        if (myGroup && data.groupId === myGroup.id) {
            fetchGroupsData();
        }
    });

    const handleCreateGroup = async (data: { name: string; joinType: Group['joinType']; maxMembers: number; }) => {
        const response = await fetchNui<{ status: boolean }>("createGroup", data);
        if (response?.status) {
            fetchGroupsData();
            setCreateModalOpen(false);
            setActiveTab('dashboard'); // Switch to dashboard to see new group
            addNotification('success', 'Group Established', `Successfully created ${data.name}. You are now the leader.`);
        }
    };

    const handleRequestToJoin = async (groupId: string) => {
        const response = await fetchNui<{ status: boolean }>("requestToJoin", { groupId });
        if (response?.status) {
            setSentRequests(prev => new Set(prev).add(groupId));
            addNotification('info', 'Application Sent', 'Your request to join has been submitted.');
        }
    };

    const handleUpdateGroup = (updatedGroup: Group) => {
        fetchGroupsData();
        setSelectedGroup(updatedGroup);
    };

    const handleDisbandOrLeave = async () => {
        if (!selectedGroup) return;
        const isLeader = selectedGroup.isLeader;
        const groupName = selectedGroup.name;
        
        const eventName = isLeader ? "disbandGroup" : "kartik-groups:client:leaveGroup";
        const response = await fetchNui<{ status: boolean }>(eventName, { groupId: selectedGroup.id });
        if (response?.status) {
            setSelectedGroup(null);
            fetchGroupsData();
            if (isLeader) {
                addNotification('warning', 'Group Disbanded', `${groupName} has been permanently disbanded.`);
            } else {
                addNotification('info', 'Left Group', `You have left ${groupName}.`);
            }
        }
    };

    if (isLoading) return <GroupsSkeletonLoader />;
    
    return (
        <div className="h-full relative bg-background text-white font-sans flex flex-col overflow-hidden rounded-b-2xl">
            <AnimatePresence mode="wait">
                {selectedGroup ? (
                    <MotionDiv key="details" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} transition={{ duration: 0.2 }} className="h-full">
                        <GroupDetails group={selectedGroup} onBack={() => setSelectedGroup(null)} onUpdateGroup={handleUpdateGroup} onDisbandOrLeave={handleDisbandOrLeave} />
                    </MotionDiv>
                ) : (
                    <MotionDiv key="tabs-view" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col h-full p-6">
                        {/* Tab Navigation */}
                        <div className="flex-shrink-0 flex justify-center mb-6">
                            <div className="flex p-1 bg-secondary/30 backdrop-blur-md rounded-xl border border-border/50">
                                {tabs.map((tab) => (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id as TabId)}
                                        className={`relative px-4 py-2 text-sm font-medium rounded-xl transition-colors focus:outline-none ${activeTab === tab.id ? 'text-white' : 'text-muted-foreground hover:text-white'}`}
                                    >
                                        {activeTab === tab.id && (
                                            <motion.div
                                                layoutId="active-tab-pill"
                                                className="absolute inset-0 bg-secondary rounded-lg shadow-sm"
                                                transition={{ type: "spring", stiffness: 300, damping: 25 }}
                                            />
                                        )}
                                        <span className="relative z-10 flex items-center space-x-2">
                                            <tab.icon className="w-4 h-4" />
                                            <span>{tab.label}</span>
                                        </span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Tab Content */}
                        <div className="flex-grow overflow-hidden relative">
                            <AnimatePresence mode="wait">
                                {activeTab === 'dashboard' && (
                                    <MotionDiv key="dashboard" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} transition={{ duration: 0.2 }} className="h-full">
                                        <DashboardView 
                                            myGroup={myGroup} 
                                            allGroups={publicGroups}
                                            onSelectGroup={setSelectedGroup} 
                                            onOpenCreateModal={() => setCreateModalOpen(true)}
                                            onRequestToJoin={handleRequestToJoin}
                                            sentRequests={sentRequests}
                                        />
                                    </MotionDiv>
                                )}
                                {activeTab === 'groups' && (
                                    <MotionDiv key="groups" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} transition={{ duration: 0.2 }} className="h-full">
                                        <GroupsView allGroups={publicGroups} onRequestToJoin={handleRequestToJoin} sentRequests={sentRequests} onOpenCreateModal={() => setCreateModalOpen(true)} />
                                    </MotionDiv>
                                )}
                                {activeTab === 'settings' && (
                                    <MotionDiv key="settings" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ duration: 0.2 }} className="h-full overflow-y-auto">
                                        <SettingsTab />
                                    </MotionDiv>
                                )}
                            </AnimatePresence>
                        </div>
                    </MotionDiv>
                )}
            </AnimatePresence>
            <AnimatePresence>
                {isCreateModalOpen && <CreateGroupModal onClose={() => setCreateModalOpen(false)} onCreate={handleCreateGroup} />}
            </AnimatePresence>
        </div>
    );
};

export default Groups;