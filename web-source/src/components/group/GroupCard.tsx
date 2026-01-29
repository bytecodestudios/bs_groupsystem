import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Group } from '../../utils/types';

const MotionDiv = motion.div;

export const MyGroupCard: React.FC<{ group: Group, onSelectGroup: (group: Group) => void }> = ({ group, onSelectGroup }) => {
    const memberPercentage = (group.members.length / group.maxMembers) * 100;
    return (
        <MotionDiv layoutId={`group-card-${group.id}`} onClick={() => onSelectGroup(group)} className="bg-secondary/50 border border-border rounded-lg p-6 cursor-pointer group hover:border-emerald-400/50 transition-colors">
            <div className="flex justify-between items-start">
                <div>
                    <h3 className="font-bold text-foreground text-2xl group-hover:text-emerald-300 transition-colors">{group.name}</h3>
                    <p className="text-sm text-muted-foreground">{group.isLeader ? "You are the leader" : "You are a member"}</p>
                </div>
                <span className="text-xs font-bold px-2 py-1 rounded-full bg-green-500/20 text-green-300">{group.status}</span>
            </div>
            <div className="mt-6">
                <div className="flex justify-between items-center mb-1"><span className="text-xs font-semibold text-muted-foreground">Members</span><span className="text-xs font-semibold text-foreground">{group.members.length} / {group.maxMembers}</span></div>
                <div className="w-full bg-muted rounded-full h-2"><MotionDiv className="bg-emerald-500 h-2 rounded-full" initial={{ width: 0 }} animate={{ width: `${memberPercentage}%` }} /></div>
            </div>
            <div className="flex justify-between items-end mt-4">
                <div className="flex items-center -space-x-3">
                    {group.members.slice(0, 5).map(m => <div key={m.id} className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-sm font-bold border-2 border-secondary/50" title={m.name}>{m.name.charAt(0).toUpperCase()}</div>)}
                    {group.members.length > 5 && <div className="w-8 h-8 rounded-full bg-card flex items-center justify-center text-xs font-bold border-2 border-secondary/50">+{group.members.length - 5}</div>}
                </div>
                <span className="text-sm font-semibold text-foreground group-hover:text-emerald-300 transition-colors">View Details &rarr;</span>
            </div>
        </MotionDiv>
    );
};

export const PublicGroupCard: React.FC<{ group: Group, onRequestToJoin: (groupId: string) => void, hasSentRequest: boolean, isInGroup?: boolean }> = ({ group, onRequestToJoin, hasSentRequest, isInGroup }) => {
    const isFull = group.members.length >= group.maxMembers;
    const buttonState = useMemo(() => {
        if (isInGroup) return { text: "Already in Group", disabled: true, style: "bg-secondary text-muted-foreground cursor-not-allowed opacity-70" };
        if (isFull) return { text: "Group is Full", disabled: true, style: "bg-yellow-500/20 text-yellow-300 cursor-not-allowed" };
        if (hasSentRequest) return { text: "Request Sent", disabled: true, style: "bg-blue-500/20 text-blue-300 cursor-not-allowed" };
        
        if (group.joinType === 'Closed') return { text: "Closed", disabled: true, style: "bg-secondary text-muted-foreground cursor-not-allowed opacity-70" };
        if (group.joinType === 'Invite Only') return { text: "Invite Only", disabled: true, style: "bg-secondary text-muted-foreground cursor-not-allowed opacity-70" };

        if (group.status !== 'Recruiting') return { text: "Not Recruiting", disabled: true, style: "bg-secondary text-muted-foreground cursor-not-allowed" };
        return { text: 'Request to Join', disabled: false, style: "bg-secondary hover:bg-muted text-foreground border border-border transition-colors" };
    }, [isFull, hasSentRequest, group.status, group.joinType]);

    return (
        <MotionDiv layout initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-secondary/50 border border-border rounded-lg p-4 flex flex-col justify-between space-y-3">
            <div>
                <div className="flex justify-between items-start"><h3 className="font-bold text-foreground text-lg">{group.name}</h3><span className="text-xs font-bold px-2 py-1 rounded-full bg-green-500/20 text-green-300">{group.status}</span></div>
                <div className="flex items-center -space-x-2 mt-3">
                    {group.members.slice(0, 5).map(m => <div key={m.id} className="w-7 h-7 rounded-full bg-muted flex items-center justify-center text-xs font-bold border-2 border-secondary/50" title={m.name}>{m.name.charAt(0).toUpperCase()}</div>)}
                </div>
            </div>
            <p className="text-sm font-semibold text-muted-foreground">{group.members.length} / {group.maxMembers} members</p>
            <button onClick={() => onRequestToJoin(group.id)} disabled={buttonState.disabled} className={`w-full text-center py-2 text-sm font-semibold rounded-lg ${buttonState.style}`}>{buttonState.text}</button>
        </MotionDiv>
    );
};