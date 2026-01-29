import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MoreVertical, Crown, UserX, Bell, Info, UserCheck, CheckCircle, Circle, Trash2, ClipboardEdit } from 'lucide-react';
import { fetchNui } from '../../utils/fetchNui';
import { Group, Member, GroupTask } from '../../utils/types';
import { ConfirmationModal } from './Modals';
import { useNotifications } from '../misc/Notification';
import { transformSingleGroup } from '../../utils/groupUtils';

const MotionDiv = motion.div;
const MotionLi = motion.li;

export const MembersTab: React.FC<{ group: Group; onUpdateGroup: (group: Group) => void; citizenId: string | null; }> = ({ group, onUpdateGroup, citizenId }) => {
    const [menuOpenFor, setMenuOpenFor] = useState<number | null>(null);
    const [kickConfirmFor, setKickConfirmFor] = useState<Member | null>(null);
    const { addNotification } = useNotifications();

    const handleAction = async (eventName: string, payload: object, memberName?: string) => { 
        const prefixedEvent = eventName.startsWith('bsgroup:nui:') ? eventName : `bsgroup:nui:${eventName}`;
        console.log(`Action: ${prefixedEvent}`, payload);
        try { 
            const updatedResponse = await fetchNui<any>(prefixedEvent, payload); 
            if (updatedResponse && citizenId) {
                const transformed = transformSingleGroup(updatedResponse, citizenId);
                onUpdateGroup(transformed); 
                if (eventName === 'promoteLeader') {
                     addNotification('info', 'Leader Promoted', `${memberName} is now the group leader.`);
                } else if (eventName === 'kickMember') {
                     addNotification('warning', 'Member Kicked', `${memberName} has been removed from the group.`);
                }
            }
        } catch (err) { 
            console.error(`${eventName} failed:`, err); 
        } 
    };

    return (
        <div className="relative">
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                <AnimatePresence>
                    {group.members.map(member => (
                        <MotionDiv key={member.id} layout initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className={`relative bg-secondary/50 border rounded-lg p-4 flex items-center space-x-4 transition-colors group ${member.id === group.leader ? "border-amber-400/50 shadow-lg shadow-amber-500/5" : "border-border hover:border-primary/50"}`}>
                            {group.isLeader && member.id !== group.leader && (<div className="absolute top-2 right-2"><button onClick={() => setMenuOpenFor(menuOpenFor === member.id ? null : member.id)} className="p-2 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground"><MoreVertical className="w-4 h-4" /></button><AnimatePresence>{menuOpenFor === member.id && (<MotionDiv initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="absolute right-0 mt-1 w-48 bg-card border border-border rounded-lg shadow-xl z-10 origin-top-right p-1"><ul className="text-sm"><li><button onClick={() => handleAction("promoteLeader", { groupId: group.id, newLeaderId: member.id }, member.name)} className="w-full text-left px-3 py-1.5 rounded-md hover:bg-secondary flex items-center"><Crown className="w-4 h-4 mr-2 text-yellow-400" />Promote</button></li><li><button onClick={() => setKickConfirmFor(member)} className="w-full text-left px-3 py-1.5 rounded-md hover:bg-red-500/20 text-red-400 flex items-center"><UserX className="w-4 h-4 mr-2" />Kick</button></li></ul></MotionDiv>)}</AnimatePresence></div>)}
                            <div className="relative"><div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center text-xl font-bold border-2 border-border">{member.name.charAt(0).toUpperCase()}</div><span className={`absolute bottom-0 right-0 block h-3.5 w-3.5 rounded-full border-2 border-secondary/50 ${member.isOnline ? "bg-green-500 shadow-[0_0_5px_theme(colors.green.500)]" : "bg-gray-500"}`}></span></div>
                            <div className="flex-grow"><p className="font-bold text-foreground flex items-center">{member.name}{member.id === group.leader && <Crown className="w-4 h-4 ml-1.5 text-yellow-400" />}</p><p className="text-xs text-muted-foreground">{member.id === group.leader ? "Group Leader" : "Member"}</p></div>
                        </MotionDiv>
                    ))}
                </AnimatePresence>
            </div>
            <AnimatePresence>{kickConfirmFor && <ConfirmationModal title="Kick Member?" message={<>Kick <span className="font-semibold text-foreground">{kickConfirmFor.name}</span> from the group?</>} confirmText="Confirm Kick" confirmClass="bg-red-600 hover:bg-red-700" onConfirm={() => handleAction("kickMember", { groupId: group.id, memberId: kickConfirmFor.id }, kickConfirmFor.name).finally(() => setKickConfirmFor(null))} onCancel={() => setKickConfirmFor(null)} Icon={UserX} />}</AnimatePresence>
        </div>
    );
};

export const RequestsTab: React.FC<{ group: Group; onUpdateGroup: (group: Group) => void; citizenId: string | null }> = ({ group, onUpdateGroup, citizenId }) => {
    const isGroupFull = group.members.length >= group.maxMembers;
    const { addNotification } = useNotifications();

    const handleProcessRequest = async (requesterId: number, action: "accept" | "decline", requesterName: string) => { 
        try { 
            const updatedGroup = await fetchNui<Group>("processRequest", { groupId: group.id, requesterId, action }); 
            if (updatedGroup) {
                onUpdateGroup(updatedGroup); 
                if (action === 'accept') {
                    addNotification('success', 'New Member Joined', `${requesterName} is now part of the squad.`);
                } else {
                    addNotification('info', 'Request Declined', `Declined request from ${requesterName}.`);
                }
            }
        } catch (err) { 
            console.error("Request process failed:", err); 
        } 
    };

    if (group.requests.length === 0) return <div className="text-center py-16 text-muted-foreground flex flex-col items-center justify-center"><Bell className="w-16 h-16 mx-auto mb-4 opacity-30" /><h4 className="text-xl font-semibold text-foreground">All Caught Up</h4><p className="text-sm mt-1">There are no pending requests to join your group.</p></div>;
    return (
        <div className="space-y-4">
            {isGroupFull && <MotionDiv initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-yellow-500/20 border border-yellow-400/30 text-yellow-300 text-sm p-3 rounded-lg flex items-center space-x-3"><Info className="w-5 h-5 flex-shrink-0" /><span>This group is full. You cannot accept new members.</span></MotionDiv>}
            <ul className="space-y-3"><AnimatePresence>{group.requests.map(req => <MotionLi key={req.id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center justify-between bg-secondary/50 p-4 rounded-lg border border-border"><div className="flex items-center space-x-4"><div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-lg font-bold">{req.name.charAt(0).toUpperCase()}</div><p className="font-semibold text-foreground">{req.name}</p></div><div className="flex space-x-3"><button onClick={() => handleProcessRequest(req.id, "decline", req.name)} className="px-4 py-2 text-sm font-semibold rounded-lg flex items-center justify-center space-x-2 w-32 bg-destructive/20 text-destructive-foreground hover:bg-destructive/30 transition-colors"><UserX className="w-4 h-4" /><span>Decline</span></button><button onClick={() => handleProcessRequest(req.id, "accept", req.name)} disabled={isGroupFull} className="px-4 py-2 text-sm font-semibold rounded-lg flex items-center justify-center space-x-2 w-32 bg-green-500/20 text-green-300 hover:bg-green-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"><UserCheck className="w-4 h-4" /><span>Accept</span></button></div></MotionLi>)}</AnimatePresence></ul>
        </div>
    );
};

export const TasksTab: React.FC<{ group: Group, onUpdateGroup: (group: Group) => void, citizenId: string | null }> = ({ group, onUpdateGroup, citizenId }) => {
    const completedTasks = group.partyTasks.filter(t => t.completed).length;
    const progress = group.partyTasks.length > 0 ? (completedTasks / group.partyTasks.length) * 100 : 0;
    const { addNotification } = useNotifications();
    
    const handleUpdateTasks = (newTasks: GroupTask[]) => {
        onUpdateGroup({ ...group, partyTasks: newTasks });
    };

    const handleToggleTask = (task: GroupTask) => {
        const isCompleting = !task.completed;
        handleUpdateTasks(group.partyTasks.map(t => t.id === task.id ? { ...t, completed: isCompleting } : t));
        if (isCompleting) {
            addNotification('success', 'Task Completed', `"${task.title}" marked as complete.`);
        }
    };

    const handleDeleteTask = (taskId: number) => {
        handleUpdateTasks(group.partyTasks.filter(t => t.id !== taskId));
    };

    return (
        <div>
            <div className="mb-8 p-6 bg-secondary/30 rounded-lg border border-border">
                <div className="flex justify-between items-center mb-2"><span className="text-md font-bold text-foreground">Task Completion</span><span className="text-sm font-semibold text-foreground">{completedTasks} / {group.partyTasks.length} Done</span></div>
                <div className="w-full bg-muted rounded-full h-3"><MotionDiv className="bg-gradient-to-r from-emerald-500 to-green-500 h-3 rounded-full" initial={{ width: 0 }} animate={{ width: `${progress}%` }} transition={{ duration: 0.8, ease: "easeOut" }} /></div>
            </div>
            {group.partyTasks.length > 0 ? <ul className="space-y-3"><AnimatePresence>{group.partyTasks.map(task => <MotionLi key={task.id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center bg-secondary/50 p-4 rounded-lg text-sm group border border-border"><button onClick={() => handleToggleTask(task)} className="mr-4 flex-shrink-0">{task.completed ? <CheckCircle className="w-6 h-6 text-green-500" /> : <Circle className="w-6 h-6 text-muted-foreground transition-colors group-hover:text-foreground" />}</button><span className={`flex-grow font-medium ${task.completed ? 'line-through text-muted-foreground' : 'text-foreground'}`}>{task.title}</span>{group.isLeader && <button onClick={() => handleDeleteTask(task.id)} className="ml-4 text-muted-foreground hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 className="w-4 h-4" /></button>}</MotionLi>)}</AnimatePresence></ul> : <div className="text-center py-16 text-muted-foreground flex flex-col items-center justify-center"><ClipboardEdit className="w-16 h-16 mx-auto mb-4 opacity-30" /><h4 className="text-xl font-semibold text-foreground">No Tasks Assigned</h4><p className="text-sm mt-1">No tasks have been assigned to this group yet.</p></div>}
        </div>
    );
};