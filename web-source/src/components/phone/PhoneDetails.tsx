import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Users, Bell, ClipboardEdit, Crown, UserX, UserPlus, UserCheck, CheckCircle2, Circle,
    Trash2, LogOut, Info, ChevronLeft, MoreHorizontal,
} from 'lucide-react';
import { Group, Member, GroupTask } from '../../utils/types';
import { fetchNui } from '../../utils/fetchNui';
import { transformSingleGroup } from '../../utils/groupUtils';
import { useNotifications } from '../misc/Notification';
import { useLocale } from '../../hooks/useLocale';
import { Card, Row, Avatar, Segmented, BigButton } from './ui';
import { PhoneInviteSheet, PhoneConfirmSheet } from './PhoneModals';

type TabId = 'members' | 'requests' | 'tasks';

interface Props {
    group: Group;
    citizenId: string | null;
    onBack: () => void;
    onUpdateGroup: (group: Group) => void;
    onDisbandOrLeave: () => void;
}

export const PhoneDetails: React.FC<Props> = ({ group, citizenId, onBack, onUpdateGroup, onDisbandOrLeave }) => {
    const { t } = useLocale();
    const { addNotification } = useNotifications();
    const isLeader = group.isLeader;

    const tabs = useMemo(() => {
        const base: { id: TabId; label: string; icon: React.ElementType }[] = [
            { id: 'members', label: t('ui.details.tab_members'), icon: Users },
        ];
        if (isLeader && group.joinType !== 'Closed') {
            base.push({ id: 'requests', label: group.joinType === 'Invite Only' ? 'Invites' : t('ui.details.tab_requests'), icon: Bell });
        }
        base.push({ id: 'tasks', label: t('ui.details.tab_group_tasks'), icon: ClipboardEdit });
        return base;
    }, [isLeader, group.joinType, t]);

    const [tab, setTab] = useState<TabId>(() => (isLeader && group.requests.length > 0 ? 'requests' : 'members'));
    const [inviteOpen, setInviteOpen] = useState(false);
    const [leaveOpen, setLeaveOpen] = useState(false);
    const [kickFor, setKickFor] = useState<{ id: string; name: string } | null>(null);
    const [menuFor, setMenuFor] = useState<string | null>(null);

    const memberAction = async (eventName: string, payload: object, memberName?: string) => {
        try {
            const response = await fetchNui<any>(`bsgroup:nui:${eventName}`, payload);
            if (response?.status && response.group && citizenId) {
                onUpdateGroup(transformSingleGroup(response.group, citizenId));
                if (eventName === 'promoteLeader') addNotification('info', t('ui.group_tabs.notif_leader_promoted'), t('ui.group_tabs.notif_leader_format', memberName || ''));
                else if (eventName === 'kickMember') addNotification('warning', t('ui.group_tabs.notif_member_kicked'), t('ui.group_tabs.notif_kicked_format', memberName || ''));
            } else if (response?.msg) {
                addNotification('error', t('ui.group_tabs.notif_failed'), response.msg);
            }
        } catch (err) {
            console.error(`${eventName} failed:`, err);
        }
    };

    const processRequest = async (requesterId: string, action: 'accept' | 'decline', requesterName: string) => {
        try {
            const response = await fetchNui<any>('bsgroup:nui:processRequest', { groupId: group.id, requestId: requesterId, action, requestName: requesterName });
            if (response?.status && response.group && citizenId) {
                onUpdateGroup(transformSingleGroup(response.group, citizenId));
                if (action === 'accept') addNotification('success', t('ui.group_tabs.notif_new_member'), t('ui.group_tabs.notif_new_member_format', requesterName));
                else addNotification('info', t('ui.group_tabs.notif_request_declined'), t('ui.group_tabs.notif_declined_format', requesterName));
            } else if (response?.msg) {
                addNotification('error', t('ui.group_tabs.notif_failed'), response.msg);
            }
        } catch (err) {
            console.error('Request process failed:', err);
        }
    };

    const isFull = group.members.length >= group.maxMembers;
    const completedTasks = group.partyTasks.filter((tk) => tk.completed).length;
    const progress = group.partyTasks.length > 0 ? (completedTasks / group.partyTasks.length) * 100 : 0;

    return (
        <div className="h-full flex flex-col min-h-0">
            {/* Nav */}
            <div className="flex-shrink-0 px-4 pt-3 pb-3">
                <button onClick={onBack} className="flex items-center -ml-1 mb-2 text-[15px] font-medium text-emerald-400 active:opacity-60">
                    <ChevronLeft className="w-5 h-5 -ml-1" />
                    <span>{t('ui.details.tab_members')}</span>
                </button>
                <div className="flex items-center justify-between gap-3">
                    <h1 className="text-[28px] font-bold tracking-tight truncate">{group.name}</h1>
                    <button
                        onClick={() => setLeaveOpen(true)}
                        className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[13px] font-semibold ${
                            isLeader ? 'bg-red-500/15 text-red-300' : 'bg-white/[0.08] text-white/70'
                        }`}
                    >
                        <LogOut className="w-3.5 h-3.5" />
                        {isLeader ? t('ui.details.disband_group') : t('ui.details.leave_group')}
                    </button>
                </div>
            </div>

            {/* Stat strip */}
            <div className="flex-shrink-0 px-4 pb-3">
                <Card className="flex items-stretch">
                    {[
                        { label: t('ui.details.status'), value: group.status, cls: 'text-emerald-400' },
                        { label: t('ui.details.members'), value: `${group.members.length}/${group.maxMembers}`, cls: 'text-white' },
                        { label: t('ui.details.join_type'), value: group.joinType, cls: 'text-sky-400' },
                    ].map((s, i) => (
                        <React.Fragment key={s.label}>
                            {i > 0 && <div className="w-px my-3 bg-white/[0.08]" />}
                            <div className="flex-1 py-3 text-center min-w-0">
                                <p className="text-[10px] uppercase tracking-wide text-white/40">{s.label}</p>
                                <p className={`text-[15px] font-bold truncate px-1 ${s.cls}`}>{s.value}</p>
                            </div>
                        </React.Fragment>
                    ))}
                </Card>
            </div>

            {/* Tabs */}
            <div className="flex-shrink-0 px-4 pb-3">
                <Segmented<TabId> value={tab} onChange={setTab} options={tabs.map((tb) => ({ id: tb.id, label: tb.label }))} />
            </div>

            {/* Content */}
            <div className="flex-1 min-h-0 overflow-y-auto no-scrollbar px-4 pb-6" onClick={() => setMenuFor(null)}>
                <AnimatePresence mode="wait">
                    <motion.div key={tab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.18 }}>
                        {tab === 'members' && (
                            <div className="space-y-3">
                                {isLeader && (
                                    <BigButton variant="primary" onClick={() => setInviteOpen(true)}>
                                        <span className="flex items-center justify-center gap-2"><UserPlus className="w-5 h-5" />{t('ui.group_tabs.invite_member')}</span>
                                    </BigButton>
                                )}
                                <Card className="overflow-visible">
                                    {group.members.map((m, i) => {
                                        const memberIsLeader = m.id === group.leader;
                                        return (
                                            <Row key={m.id} first={i === 0} className="relative">
                                                <Avatar name={m.name} size={42} online={m.isOnline} />
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-[15px] font-semibold flex items-center gap-1.5 truncate">
                                                        {m.name}
                                                        {memberIsLeader && <Crown className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />}
                                                    </p>
                                                    <p className="text-[12px] text-white/40">
                                                        {memberIsLeader ? t('ui.group_tabs.group_leader') : t('ui.group_tabs.member')}
                                                    </p>
                                                </div>
                                                {isLeader && !memberIsLeader && (
                                                    <div className="relative">
                                                        <button
                                                            onClick={(e) => { e.stopPropagation(); setMenuFor(menuFor === m.id ? null : m.id); }}
                                                            className="w-8 h-8 rounded-full bg-white/[0.06] flex items-center justify-center active:scale-90"
                                                        >
                                                            <MoreHorizontal className="w-4 h-4 text-white/60" />
                                                        </button>
                                                        <AnimatePresence>
                                                            {menuFor === m.id && (
                                                                <motion.div
                                                                    initial={{ opacity: 0, scale: 0.92, y: -4 }}
                                                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                                                    exit={{ opacity: 0, scale: 0.92 }}
                                                                    onClick={(e) => e.stopPropagation()}
                                                                    className="absolute right-0 top-10 z-20 w-44 p-1 rounded-2xl bg-[#1a1f28] border border-white/10"
                                                                >
                                                                    <button
                                                                        onClick={() => { memberAction('promoteLeader', { groupId: group.id, newLeaderId: m.id }, m.name); setMenuFor(null); }}
                                                                        className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-[14px] active:bg-white/[0.06]"
                                                                    >
                                                                        <Crown className="w-4 h-4 text-amber-400" />{t('ui.group_tabs.promote')}
                                                                    </button>
                                                                    <button
                                                                        onClick={() => { setKickFor({ id: m.id, name: m.name }); setMenuFor(null); }}
                                                                        className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-[14px] text-red-400 active:bg-red-500/10"
                                                                    >
                                                                        <UserX className="w-4 h-4" />{t('ui.group_tabs.kick')}
                                                                    </button>
                                                                </motion.div>
                                                            )}
                                                        </AnimatePresence>
                                                    </div>
                                                )}
                                            </Row>
                                        );
                                    })}
                                </Card>
                            </div>
                        )}

                        {tab === 'requests' && (
                            group.requests.length === 0 ? (
                                <EmptyState icon={Bell} title={t('ui.group_tabs.all_caught_up')} subtitle={t('ui.group_tabs.no_pending_requests')} />
                            ) : (
                                <div className="space-y-3">
                                    {isFull && (
                                        <div className="flex items-center gap-2.5 p-3 rounded-2xl bg-amber-500/10 border border-amber-500/25 text-amber-300 text-[13px]">
                                            <Info className="w-5 h-5 flex-shrink-0" />
                                            <span>{t('ui.group_tabs.group_full_warning')}</span>
                                        </div>
                                    )}
                                    {group.requests.map((req) => (
                                        <Card key={req.id} className="p-3.5">
                                            <div className="flex items-center gap-3 mb-3">
                                                <Avatar name={req.name} size={42} />
                                                <p className="text-[16px] font-semibold flex-1 truncate">{req.name}</p>
                                            </div>
                                            <div className="grid grid-cols-2 gap-2.5">
                                                <button
                                                    onClick={() => processRequest(req.id, 'decline', req.name)}
                                                    className="py-2.5 rounded-xl text-[14px] font-semibold bg-red-500/15 text-red-300 flex items-center justify-center gap-1.5 active:scale-95 transition-transform"
                                                >
                                                    <UserX className="w-4 h-4" />{t('ui.group_tabs.decline')}
                                                </button>
                                                <button
                                                    onClick={() => processRequest(req.id, 'accept', req.name)}
                                                    disabled={isFull}
                                                    className="py-2.5 rounded-xl text-[14px] font-semibold bg-emerald-500 text-black flex items-center justify-center gap-1.5 active:scale-95 transition-transform disabled:opacity-40"
                                                >
                                                    <UserCheck className="w-4 h-4" />{t('ui.group_tabs.accept')}
                                                </button>
                                            </div>
                                        </Card>
                                    ))}
                                </div>
                            )
                        )}

                        {tab === 'tasks' && (
                            <div className="space-y-3">
                                <Card className="p-4">
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-[14px] font-semibold">{t('ui.group_tabs.task_completion')}</span>
                                        <span className="text-[13px] text-white/50">{t('ui.group_tabs.done_format', String(completedTasks), String(group.partyTasks.length))}</span>
                                    </div>
                                    <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                                        <motion.div className="h-full rounded-full bg-emerald-400" initial={{ width: 0 }} animate={{ width: `${progress}%` }} transition={{ duration: 0.7, ease: 'easeOut' }} />
                                    </div>
                                </Card>
                                {group.partyTasks.length > 0 ? (
                                    <Card className="overflow-hidden">
                                        {group.partyTasks.map((task, i) => (
                                            <Row key={task.id} first={i === 0}>
                                                <div className="flex-shrink-0">
                                                    {task.completed ? <CheckCircle2 className="w-6 h-6 text-emerald-400" /> : <Circle className="w-6 h-6 text-white/25" />}
                                                </div>
                                                <span className={`flex-1 text-[15px] ${task.completed ? 'line-through text-white/35' : ''}`}>{task.title}</span>
                                            </Row>
                                        ))}
                                    </Card>
                                ) : (
                                    <EmptyState icon={ClipboardEdit} title={t('ui.group_tabs.no_tasks_title')} subtitle={t('ui.group_tabs.no_tasks_desc')} />
                                )}
                            </div>
                        )}
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* Sheets */}
            <AnimatePresence>
                {inviteOpen && <PhoneInviteSheet onClose={() => setInviteOpen(false)} onUpdateGroup={onUpdateGroup} citizenId={citizenId} />}
            </AnimatePresence>
            <AnimatePresence>
                {leaveOpen && (
                    <PhoneConfirmSheet
                        title={isLeader ? t('ui.details.disband_title') : t('ui.details.leave_title')}
                        message={<>{t('ui.details.confirm_action_prefix')} {isLeader ? t('ui.details.disband_action') : t('ui.details.leave_action')} <span className="font-semibold text-white">{group.name}</span>{t('ui.details.cannot_be_undone')}</>}
                        confirmText={isLeader ? t('ui.details.disband_confirm') : t('ui.details.leave_confirm')}
                        Icon={Trash2}
                        onConfirm={() => { onDisbandOrLeave(); setLeaveOpen(false); }}
                        onClose={() => setLeaveOpen(false)}
                    />
                )}
            </AnimatePresence>
            <AnimatePresence>
                {kickFor && (
                    <PhoneConfirmSheet
                        title={t('ui.group_tabs.kick_title')}
                        message={<>{t('ui.group_tabs.kick_message', kickFor.name)}</>}
                        confirmText={t('ui.group_tabs.confirm_kick')}
                        Icon={UserX}
                        onConfirm={async () => { await memberAction('kickMember', { groupId: group.id, memberId: kickFor.id }, kickFor.name); setKickFor(null); }}
                        onClose={() => setKickFor(null)}
                    />
                )}
            </AnimatePresence>
        </div>
    );
};

const EmptyState: React.FC<{ icon: React.ElementType; title: string; subtitle: string }> = ({ icon: Icon, title, subtitle }) => (
    <div className="py-16 flex flex-col items-center text-center">
        <div className="p-5 rounded-full bg-white/[0.04] mb-4">
            <Icon className="w-10 h-10 text-white/20" />
        </div>
        <h4 className="text-[17px] font-semibold">{title}</h4>
        <p className="text-[13px] text-white/40 mt-1">{subtitle}</p>
    </div>
);
