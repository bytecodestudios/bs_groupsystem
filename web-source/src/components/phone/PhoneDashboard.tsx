import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, ChevronRight, CheckCircle2, Circle, Clock, Send, Users, ShieldAlert, Briefcase, UserCheck, UserX } from 'lucide-react';
import { Group } from '../../utils/types';
import { useLocale } from '../../hooks/useLocale';
import { Card, Row, Avatar, BigButton } from './ui';

interface Props {
    myGroup: Group | null;
    allGroups: Group[];
    sentRequests: Set<string>;
    isVpnConnected: boolean;
    onSelectGroup: (g: Group) => void;
    onOpenCreate: () => void;
    onRequestToJoin: (id: string) => void;
    onResolveJobOffer: (accept: boolean) => void;
    onProcessRequest: (groupId: string, requestId: string, action: 'accept' | 'decline', requestName: string) => void | Promise<void>;
    onGoDiscover: () => void;
}

export const PhoneDashboard: React.FC<Props> = ({
    myGroup,
    allGroups,
    sentRequests,
    isVpnConnected,
    onSelectGroup,
    onOpenCreate,
    onResolveJobOffer,
    onProcessRequest,
    onGoDiscover,
}) => {
    const { t } = useLocale();
    // Locks the row's buttons while the NUI round-trip is in flight so a leader
    // can't double-accept the same applicant.
    const [busyRequest, setBusyRequest] = useState<string | null>(null);

    const featured = useMemo(
        () =>
            allGroups
                .filter((g) => g.status === 'Recruiting' && (isVpnConnected ? true : !g.isIllegal))
                .slice(0, 4),
        [allGroups, isVpnConnected]
    );

    const outgoing = useMemo(() => allGroups.filter((g) => sentRequests.has(g.id)), [allGroups, sentRequests]);
    const incoming = myGroup?.requests || [];
    const isFull = !!myGroup && myGroup.members.length >= myGroup.maxMembers;

    const resolveRequest = async (requestId: string, action: 'accept' | 'decline', requestName: string) => {
        if (!myGroup || busyRequest) return;
        setBusyRequest(requestId);
        try {
            await onProcessRequest(myGroup.id, requestId, action, requestName);
        } finally {
            setBusyRequest(null);
        }
    };

    return (
        <div className="h-full overflow-y-auto no-scrollbar">
            {/* Header title */}
            <div className="px-5 pt-3 pb-1">
                <h1 className="text-[27px] leading-none font-bold tracking-tight text-foreground">{t('ui.groups.tab_dashboard')}</h1>
            </div>

            {myGroup ? (
                <div className="px-4 pb-6 space-y-4">
                    {/* Group hero card matching laptop MyGroupCard */}
                    <Card
                        onClick={() => onSelectGroup(myGroup)}
                        className="p-4 relative overflow-hidden group hover:border-emerald-400/50 transition-colors"
                    >
                        <div className="relative">
                            <div className="flex items-start justify-between">
                                <div className="min-w-0">
                                    {myGroup.isIllegal ? (
                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-red-500/15 text-red-400 border border-red-500/20 mb-1">
                                            <ShieldAlert className="w-3 h-3 text-red-400" />
                                            {t('ui.dashboard.illegal_group')}
                                        </span>
                                    ) : (
                                        <p className="text-[12px] font-semibold uppercase tracking-wide text-emerald-400">
                                            {t('ui.dashboard.my_group')}
                                        </p>
                                    )}
                                    <h2 className="text-[22px] font-bold tracking-tight truncate mt-0.5 text-foreground group-hover:text-emerald-300 transition-colors">{myGroup.name}</h2>
                                    <p className="text-[13px] text-muted-foreground">
                                        {myGroup.isLeader ? t('ui.group_card.you_are_leader') : t('ui.group_card.you_are_member')}
                                    </p>
                                </div>
                                <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-green-500/20 text-green-300">
                                    {myGroup.status}
                                </span>
                            </div>

                            {/* Member progress */}
                            <div className="mt-4">
                                <div className="flex justify-between text-[12px] mb-1.5">
                                    <span className="text-muted-foreground">{t('ui.group_card.members')}</span>
                                    <span className="font-semibold text-foreground">
                                        {myGroup.members.length} / {myGroup.maxMembers}
                                    </span>
                                </div>
                                <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                                    <motion.div
                                        className="h-full rounded-full bg-emerald-500"
                                        initial={{ width: 0 }}
                                        animate={{ width: `${(myGroup.members.length / myGroup.maxMembers) * 100}%` }}
                                        transition={{ duration: 0.7, ease: 'easeOut' }}
                                    />
                                </div>
                            </div>

                            <div className="mt-4 flex items-center justify-between">
                                <div className="flex -space-x-2.5">
                                    {myGroup.members.slice(0, 5).map((m) => (
                                        <Avatar key={m.id} name={m.name} size={30} className="!border-2 !border-secondary" />
                                    ))}
                                    {myGroup.members.length > 5 && (
                                        <div className="w-[30px] h-[30px] rounded-full bg-card border-2 border-secondary flex items-center justify-center text-[11px] font-bold text-foreground">
                                            +{myGroup.members.length - 5}
                                        </div>
                                    )}
                                </div>
                                <span className="flex items-center text-[14px] font-semibold text-muted-foreground group-hover:text-emerald-300 transition-colors">
                                    {t('ui.group_card.view_details')} <ChevronRight className="w-4 h-4 ml-0.5" />
                                </span>
                            </div>
                        </div>
                    </Card>

                    {/* Missions */}
                    <div>
                        <div className="flex justify-between items-center px-1 mb-2">
                            <p className="text-[13px] font-semibold text-muted-foreground uppercase tracking-wide">
                                {t('ui.dashboard.active_missions')}
                            </p>
                            <span className="text-[11px] font-semibold text-blue-300 bg-blue-500/10 px-2 py-0.5 rounded-full">
                                {myGroup.partyTasks.filter((tk) => tk.completed).length}/{myGroup.partyTasks.length}
                            </span>
                        </div>
                        <Card className="overflow-hidden">
                            {myGroup.partyTasks.length > 0 ? (
                                myGroup.partyTasks.slice(0, 4).map((task, i) => (
                                    <Row key={task.id} first={i === 0}>
                                        {task.completed ? (
                                            <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                                        ) : (
                                            <div className="w-4 h-4 rounded-full border-2 border-muted-foreground shrink-0" />
                                        )}
                                        <span className={`text-[15px] truncate ${task.completed ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
                                            {task.title}
                                        </span>
                                    </Row>
                                ))
                            ) : (
                                <Row first>
                                    <span className="text-[15px] text-muted-foreground italic">{t('ui.dashboard.no_active_missions')}</span>
                                </Row>
                            )}
                        </Card>
                    </div>

                    {/* Job offer (leader only) */}
                    {myGroup.isLeader && myGroup.jobOffer && (
                        <div>
                            <p className="px-2 mb-2 text-[13px] font-semibold text-emerald-300 uppercase tracking-wide flex items-center gap-1.5">
                                <Briefcase className="w-3.5 h-3.5" /> {t('ui.joboffer.section')}
                            </p>
                            <Card className="p-4 bg-emerald-500/5 !border-emerald-500/25">
                                <div className="flex items-start gap-3">
                                    <div className="w-[38px] h-[38px] rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
                                        <Briefcase className="w-[18px] h-[18px] text-emerald-300" />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-[15px] font-semibold text-foreground truncate">{myGroup.jobOffer.title}</p>
                                        <p className="text-[13px] text-muted-foreground leading-snug mt-0.5">{myGroup.jobOffer.description}</p>
                                    </div>
                                </div>
                                <div className="flex gap-2.5 mt-4">
                                    <BigButton variant="neutral" onClick={() => onResolveJobOffer(false)}>
                                        {myGroup.jobOffer.cancelLabel || t('ui.joboffer.decline')}
                                    </BigButton>
                                    <BigButton variant="primary" onClick={() => onResolveJobOffer(true)}>
                                        {myGroup.jobOffer.confirmLabel || t('ui.joboffer.accept')}
                                    </BigButton>
                                </div>
                            </Card>
                        </div>
                    )}

                    {/* Pending */}
                    {(myGroup.isLeader || outgoing.length > 0) && (
                        <div>
                            <p className="px-2 mb-2 text-[13px] font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-1.5">
                                <Clock className="w-3.5 h-3.5 text-amber-400" /> {t('ui.dashboard.pending_actions')}
                            </p>
                            <Card className="overflow-hidden">
                                {myGroup.isLeader && incoming.length > 0 &&
                                    incoming.map((req, i) => (
                                        <Row key={req.id} first={i === 0}>
                                            <Avatar name={req.name} size={34} />
                                            <div className="flex-1 min-w-0">
                                                <p className="text-[15px] font-medium text-foreground truncate">{req.name}</p>
                                                <p className="text-[12px] text-amber-400">{t('ui.dashboard.join_requests')}</p>
                                            </div>
                                            <div className="flex items-center gap-2 flex-shrink-0">
                                                <button
                                                    aria-label={t('ui.group_tabs.decline')}
                                                    onClick={() => resolveRequest(req.id, 'decline', req.name)}
                                                    disabled={busyRequest !== null}
                                                    className="w-[34px] h-[34px] rounded-full bg-red-500/15 text-red-300 hover:bg-red-500/25 flex items-center justify-center active:scale-95 transition-all disabled:opacity-40"
                                                >
                                                    <UserX className="w-[17px] h-[17px]" />
                                                </button>
                                                <button
                                                    aria-label={t('ui.group_tabs.accept')}
                                                    onClick={() => resolveRequest(req.id, 'accept', req.name)}
                                                    disabled={busyRequest !== null || isFull}
                                                    className="w-[34px] h-[34px] rounded-full bg-emerald-600 hover:bg-emerald-500 text-white flex items-center justify-center active:scale-95 transition-all disabled:opacity-40"
                                                >
                                                    <UserCheck className="w-[17px] h-[17px]" />
                                                </button>
                                            </div>
                                        </Row>
                                    ))}
                                {outgoing.map((g, i) => (
                                    <Row key={g.id} first={i === 0 && !(myGroup.isLeader && incoming.length > 0)}>
                                        <div className="w-[34px] h-[34px] rounded-full bg-blue-500/20 text-blue-300 flex items-center justify-center flex-shrink-0 border border-blue-500/30">
                                            <Send className="w-4 h-4 text-blue-300" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-[15px] font-medium text-foreground truncate">{g.name}</p>
                                            <p className="text-[12px] text-muted-foreground">{t('ui.dashboard.application_sent')}</p>
                                        </div>
                                    </Row>
                                ))}
                                {myGroup.isLeader && incoming.length === 0 && outgoing.length === 0 && (
                                    <Row first>
                                        <span className="text-[15px] text-muted-foreground italic">{t('ui.dashboard.no_new_recruits')}</span>
                                    </Row>
                                )}
                            </Card>
                        </div>
                    )}
                </div>
            ) : (
                <div className="px-4 pb-6 space-y-4 min-h-full flex flex-col justify-center -mt-6">
                    <Card className="p-6 text-center space-y-4">
                        <div>
                            <div className="inline-flex p-3 bg-emerald-500/10 rounded-full mb-3 text-emerald-400">
                                <Users className="w-7 h-7" />
                            </div>
                            <h2 className="text-[20px] font-bold text-white tracking-tight mb-1">{t('ui.dashboard.find_your_squad')}</h2>
                            <p className="text-[13px] text-gray-300 leading-relaxed mb-5">{t('ui.dashboard.find_your_squad_desc')}</p>
                            <button
                                onClick={onOpenCreate}
                                className="w-full py-3 bg-white text-emerald-950 rounded-xl font-bold shadow-md hover:bg-gray-100 transition-all active:scale-95 flex items-center justify-center gap-2"
                            >
                                <Plus className="w-5 h-5 text-emerald-900" />
                                <span>{t('ui.dashboard.create_new_group')}</span>
                            </button>
                        </div>
                    </Card>

                    {/* Trending */}
                    {featured.length > 0 && (
                        <div>
                            <div className="px-2 mb-2 flex items-center justify-between">
                                <p className="text-[13px] font-semibold text-muted-foreground uppercase tracking-wide">
                                    {t('ui.dashboard.trending_squads')}
                                </p>
                                <button onClick={onGoDiscover} className="text-[13px] font-semibold text-emerald-400 hover:text-emerald-300 active:opacity-60 transition-colors">
                                    {t('ui.dashboard.discover_groups')}
                                </button>
                            </div>
                            <Card className="overflow-hidden">
                                {featured.map((g, i) => (
                                    <Row key={g.id} first={i === 0} onClick={onGoDiscover}>
                                        <Avatar name={g.name} size={40} />
                                        <div className="flex-1 min-w-0">
                                            <p className="text-[15px] font-semibold text-foreground truncate">
                                                {g.name}
                                            </p>
                                            <div className="flex items-center gap-1.5 text-[12px] text-muted-foreground mt-0.5">
                                                <span>{t('ui.group_card.members_format', String(g.members.length), String(g.maxMembers))}</span>
                                                {g.isIllegal && (
                                                    <>
                                                        <span className="w-1 h-1 rounded-full bg-border" />
                                                        <span className="px-1.5 py-0.2 rounded text-[9px] font-bold uppercase tracking-wider bg-red-500/15 text-red-400 border border-red-500/20 flex items-center gap-0.5">
                                                            <ShieldAlert className="w-2.5 h-2.5 text-red-400" />
                                                            Illegal
                                                        </span>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                        <ChevronRight className="w-5 h-5 text-muted-foreground" />
                                    </Row>
                                ))}
                            </Card>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};
