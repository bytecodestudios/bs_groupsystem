import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Search, Plus, ChevronLeft, ChevronRight, LayoutDashboard, Activity, AlertCircle, TrendingUp, CheckCircle2, ListTodo, Users, ArrowUpRight, Clock, Send } from 'lucide-react';
import { Group } from '../../utils/types';
import { MyGroupCard, PublicGroupCard } from './GroupCard';

const MotionDiv = motion.div;
const MotionButton = motion.button;

export const DashboardView: React.FC<{ 
    myGroup: Group | null, 
    allGroups: Group[], 
    onSelectGroup: (group: Group) => void, 
    onOpenCreateModal: () => void,
    onRequestToJoin: (groupId: string) => void,
    sentRequests: Set<string>
}> = ({ myGroup, allGroups, onSelectGroup, onOpenCreateModal, onRequestToJoin, sentRequests }) => {
    
    // Derived Stats
    const tasksTotal = myGroup?.partyTasks.length || 0;
    const tasksCompleted = myGroup?.partyTasks.filter(t => t.completed).length || 0;

    const featuredGroups = useMemo(() => {
        return allGroups
            .filter(g => g.status === 'Recruiting')
            .sort(() => 0.5 - Math.random()) // Simple shuffle
            .slice(0, 3);
    }, [allGroups]);
    
    const pendingIncomingRequests = myGroup?.requests || [];
    const pendingOutgoingRequests = useMemo(() => {
        return allGroups.filter(g => sentRequests.has(g.id));
    }, [allGroups, sentRequests]);

    return (
        <div className="h-full flex flex-col space-y-6 overflow-y-auto pr-2 pb-2">
             {myGroup ? (
                 <div className="space-y-6">
                    {/* Header / Main Card */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-2 space-y-6">
                            <header className="flex justify-between items-center">
                                <h2 className="text-xl font-bold text-foreground flex items-center">
                                    <Shield className="w-6 h-6 mr-3 text-emerald-400" /> 
                                    My Group
                                </h2>
                            </header>
                            <MyGroupCard group={myGroup} onSelectGroup={onSelectGroup} />
                            
                            {/* Mission Status / Tasks Preview */}
                            <div className="bg-secondary/20 border border-border rounded-xl p-5">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="text-sm font-bold text-foreground flex items-center"><ListTodo className="w-4 h-4 mr-2 text-blue-400"/>Active Missions</h3>
                                    <span className="text-xs font-semibold text-blue-300 bg-blue-500/10 px-2 py-0.5 rounded-full">{tasksCompleted}/{tasksTotal} Done</span>
                                </div>
                                {myGroup.partyTasks.length > 0 ? (
                                    <div className="space-y-2">
                                        {myGroup.partyTasks.slice(0, 3).map(task => (
                                            <div key={task.id} className="flex items-center space-x-3 text-sm p-2 rounded hover:bg-secondary/40 transition-colors">
                                                {task.completed ? <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" /> : <div className="w-4 h-4 rounded-full border-2 border-muted-foreground shrink-0" />}
                                                <span className={`${task.completed ? 'text-muted-foreground line-through' : 'text-foreground'}`}>{task.title}</span>
                                            </div>
                                        ))}
                                        {myGroup.partyTasks.length > 3 && <p className="text-xs text-center text-muted-foreground pt-1">+{myGroup.partyTasks.length - 3} more tasks...</p>}
                                    </div>
                                ) : (
                                    <p className="text-sm text-muted-foreground italic">No active missions assigned.</p>
                                )}
                            </div>
                        </div>

                        {/* Right Column: Pending Requests */}
                        <div className="space-y-4">
                             <div className="bg-secondary/20 border border-border rounded-xl p-5 h-full flex flex-col">
                                <h3 className="text-sm font-bold text-foreground flex items-center mb-4">
                                    <Clock className="w-4 h-4 mr-2 text-amber-400"/>
                                    Pending Actions
                                </h3>
                                
                                <div className="space-y-6 flex-grow">
                                    {/* Incoming Requests (Only if Leader) */}
                                    {myGroup.isLeader && (
                                        <div className="space-y-3">
                                            <div className="flex items-center justify-between">
                                                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Join Requests</p>
                                                <span className="text-xs bg-secondary px-1.5 py-0.5 rounded text-foreground">{pendingIncomingRequests.length}</span>
                                            </div>
                                            
                                            {pendingIncomingRequests.length > 0 ? (
                                                <div className="space-y-2">
                                                    {pendingIncomingRequests.map(req => (
                                                        <div key={req.id} className="flex items-center justify-between p-2.5 bg-secondary/40 rounded-lg border border-border/50">
                                                            <div className="flex items-center space-x-2.5">
                                                                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-xs font-bold text-white shadow-sm">
                                                                    {req.name.charAt(0).toUpperCase()}
                                                                </div>
                                                                <span className="text-sm font-medium">{req.name}</span>
                                                            </div>
                                                            <div className="w-2 h-2 rounded-full bg-amber-400 shadow-[0_0_5px_theme(colors.amber.400)]"></div>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <div className="p-3 bg-secondary/20 rounded-lg border border-border/30 text-center">
                                                    <p className="text-xs text-muted-foreground italic">No new recruits waiting.</p>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* Outgoing Requests */}
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between">
                                             <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Sent Requests</p>
                                             <span className="text-xs bg-secondary px-1.5 py-0.5 rounded text-foreground">{pendingOutgoingRequests.length}</span>
                                        </div>
                                       
                                        {pendingOutgoingRequests.length > 0 ? (
                                            <div className="space-y-2">
                                                {pendingOutgoingRequests.map(group => (
                                                    <div key={group.id} className="flex items-center justify-between p-2.5 bg-secondary/40 rounded-lg border border-border/50">
                                                        <div className="flex items-center space-x-2.5">
                                                            <div className="w-7 h-7 rounded-full bg-blue-500/20 text-blue-300 flex items-center justify-center border border-blue-500/30">
                                                                <Send className="w-3 h-3"/>
                                                            </div>
                                                            <div className="flex flex-col">
                                                                <span className="text-sm font-medium leading-none">{group.name}</span>
                                                                <span className="text-[10px] text-muted-foreground mt-0.5">Application sent</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="p-3 bg-secondary/20 rounded-lg border border-border/30 text-center">
                                                <p className="text-xs text-muted-foreground italic">No active applications.</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                 </div>
             ) : (
                 <div className="flex flex-col h-full">
                     {/* Hero Section */}
                     <div className="relative bg-gradient-to-br from-emerald-900/40 to-green-900/20 rounded-2xl border border-emerald-500/30 p-8 text-center space-y-6 overflow-hidden mb-8">
                         <div className="absolute top-0 right-0 p-32 bg-emerald-500/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
                         <div className="relative z-10">
                            <div className="inline-flex p-4 bg-emerald-500/20 rounded-full mb-4 shadow-[0_0_15px_rgba(16,185,129,0.3)]">
                                <LayoutDashboard className="w-8 h-8 text-emerald-300" />
                            </div>
                            <h3 className="text-3xl font-bold text-white mb-2">Find Your Squad</h3>
                            <p className="text-base text-gray-300 max-w-md mx-auto leading-relaxed">
                                Join an elite group to access exclusive missions, share resources, and dominate the city. Or start your own legacy today.
                            </p>
                            <div className="pt-6">
                                <button onClick={onOpenCreateModal} className="px-8 py-3 bg-white text-emerald-900 rounded-lg font-bold shadow-lg hover:bg-gray-100 transition-all transform hover:scale-105 active:scale-95 flex items-center mx-auto">
                                    <Plus className="w-5 h-5 mr-2" />
                                    Create New Group
                                </button>
                            </div>
                         </div>
                     </div>

                     {/* Featured Groups */}
                     {featuredGroups.length > 0 && (
                         <div className="space-y-4">
                             <div className="flex justify-between items-center px-1">
                                 <h3 className="text-lg font-bold text-foreground flex items-center"><TrendingUp className="w-5 h-5 mr-2 text-amber-400"/>Trending Squads</h3>
                                 <span className="text-xs text-muted-foreground">Featured recruiting groups</span>
                             </div>
                             <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                 {featuredGroups.map(group => (
                                     <PublicGroupCard key={group.id} group={group} onRequestToJoin={onRequestToJoin} hasSentRequest={sentRequests.has(group.id)} />
                                 ))}
                             </div>
                         </div>
                     )}
                 </div>
             )}
        </div>
    );
};

export const GroupsView: React.FC<{ allGroups: Group[], onRequestToJoin: (groupId: string) => void, sentRequests: Set<string>, onOpenCreateModal: () => void }> = ({ allGroups, onRequestToJoin, sentRequests, onOpenCreateModal }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [showOpenOnly, setShowOpenOnly] = useState(false);
    const [statusFilter, setStatusFilter] = useState<'all' | 'Recruiting' | 'Active' | 'Full'>('all');
    const [currentPage, setCurrentPage] = useState(1);
    const GROUPS_PER_PAGE = 6;

    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery, showOpenOnly, statusFilter]);
    
    const filteredGroups = useMemo(() => {
        return allGroups.filter(group => {
            if (searchQuery && !group.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
            if (statusFilter !== 'all' && group.status !== statusFilter) return false;
            if (showOpenOnly && group.members.length >= group.maxMembers) return false;
            return true;
        });
    }, [allGroups, searchQuery, statusFilter, showOpenOnly]);

    const totalPages = Math.ceil(filteredGroups.length / GROUPS_PER_PAGE);
    const paginatedPublicGroups = filteredGroups.slice((currentPage - 1) * GROUPS_PER_PAGE, currentPage * GROUPS_PER_PAGE);

    return (
        <div className="h-full flex flex-col relative">
            <div className="flex-shrink-0 space-y-4 mb-6">
                <header className="flex justify-between items-center">
                    <h2 className="text-xl font-bold text-foreground flex items-center">
                        <Search className="w-6 h-6 mr-3 text-blue-400" /> Discover Groups
                    </h2>
                    <button onClick={onOpenCreateModal} className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white text-sm font-bold rounded-lg shadow-lg shadow-emerald-500/20 transition-all hover:scale-105 active:scale-95">
                        <Plus className="w-4 h-4" />
                        <span>Create Group</span>
                    </button>
                </header>
                
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="relative flex-grow md:flex-grow-0">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <input type="text" placeholder="Search by group name..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full md:w-64 bg-input border-2 border-transparent focus:border-border rounded-lg pl-9 pr-4 py-1.5 text-sm focus:ring-0 focus:outline-none transition-colors"/>
                    </div>
                    <div className="flex items-center space-x-2 bg-secondary/30 p-1 rounded-lg">
                        {(['all', 'Recruiting', 'Active', 'Full'] as const).map(status => (
                            <button key={status} onClick={() => setStatusFilter(status)} className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${statusFilter === status ? 'bg-primary text-background shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}>{status === 'all' ? 'All' : status}</button>
                        ))}
                        <div className="h-4 w-px bg-border mx-1"></div>
                        <button onClick={() => setShowOpenOnly(!showOpenOnly)} className={`flex items-center space-x-2 px-3 py-1 text-xs font-semibold rounded-md transition-colors ${showOpenOnly ? 'bg-green-500/20 text-green-300' : 'text-muted-foreground hover:text-foreground'}`}>
                            <div className={`w-1.5 h-1.5 rounded-full ${showOpenOnly ? 'bg-green-400' : 'bg-gray-500'}`}></div>
                            <span>Open Slots</span>
                        </button>
                    </div>
                </div>
            </div>
            
            <div className="flex-grow overflow-y-auto pr-2 pb-20">
                {allGroups.length > 0 ? (
                    filteredGroups.length > 0 ? (
                        <>
                            <AnimatePresence mode="wait">
                                <MotionDiv key={currentPage} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {paginatedPublicGroups.map(group => <PublicGroupCard key={group.id} group={group} onRequestToJoin={onRequestToJoin} hasSentRequest={sentRequests.has(group.id)} />)}
                                </MotionDiv>
                            </AnimatePresence>
                            {totalPages > 1 && (<div className="mt-6 flex items-center justify-between"><button onClick={() => setCurrentPage(p => p - 1)} disabled={currentPage === 1} className="px-3 py-1.5 flex items-center space-x-2 text-sm bg-secondary border border-border rounded-md disabled:opacity-50 hover:bg-muted transition-colors font-semibold"><ChevronLeft className="w-4 h-4" /><span>Prev</span></button><span className="text-sm text-muted-foreground">Page {currentPage} of {totalPages}</span><button onClick={() => setCurrentPage(p => p + 1)} disabled={currentPage === totalPages} className="px-3 py-1.5 flex items-center space-x-2 text-sm bg-secondary border border-border rounded-md disabled:opacity-50 hover:bg-muted transition-colors font-semibold"><span>Next</span><ChevronRight className="w-4 h-4" /></button></div>)}
                        </>
                    ) : (
                        <div className="text-center py-16 bg-secondary/10 rounded-xl border border-dashed border-border"><p className="text-muted-foreground">No groups match your search criteria.</p></div>
                    )
                ) : <div className="text-center py-16 bg-secondary/10 rounded-xl border border-dashed border-border"><p className="text-muted-foreground">There are no public groups available.</p></div>}
            </div>
            
        </div>
    );
};
