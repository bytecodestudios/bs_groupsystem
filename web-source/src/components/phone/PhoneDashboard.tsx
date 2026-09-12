import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Plus, ChevronRight, CheckCircle2, Circle, Clock, Send, Users, ShieldAlert, Briefcase } from 'lucide-react';
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
    onGoDiscover,
}) => {
    const { t } = useLocale();

    const featured = useMemo(
        () =>
            allGroups
                .filter((g) => g.status === 'Recruiting' && (isVpnConnected ? true : !g.isIllegal))
                .slice(0, 4),
        [allGroups, isVpnConnected]
    );

    const outgoing = useMemo(() => allGroups.filter((g) => sentRequests.has(g.id)), [allGroups, sentRequests]);
    const incoming = myGroup?.requests || [];

    return (
        <div className="h-full overflow-y-auto no-scrollbar">
            {/* Large iOS title */}
            <div className="px-5 pt-3 pb-1">
                <h1 className="text-[27px] leading-none font-bold tracking-tight">{t('ui.groups.tab_dashboard')}</h1>
            </div>

            {myGroup ? (
                <div className="px-4 pb-6 space-y-4">
                    {/* Group hero card */}
                    <Card
                        onClick={() => onSelectGroup(myGroup)}
                        className="p-4 relative overflow-hidden"
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
                                    <h2 className="text-[22px] font-bold tracking-tight truncate mt-0.5">{myGroup.name}</h2>
                                    <p className="text-[13px] text-white/45">
                                        {myGroup.isLeader ? t('ui.group_card.you_are_leader') : t('ui.group_card.you_are_member')}
                                    </p>
                                </div>
                                <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-emerald-400/15 text-emerald-300">
                                    {myGroup.status}
                                </span>
                            </div>

                            {/* Member progress */}
                            <div className="mt-4">
                                <div className="flex justify-between text-[12px] mb-1.5">
                                    <span className="text-white/45">{t('ui.group_card.members')}</span>
                                    <span className="font-semibold">
                                        {myGroup.members.length} / {myGroup.maxMembers}
                                    </span>
                                </div>
                                <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
                                    <motion.div
                                        className="h-full rounded-full bg-emerald-400"
                                        initial={{ width: 0 }}
                                        animate={{ width: `${(myGroup.members.length / myGroup.maxMembers) * 100}%` }}
                                        transition={{ duration: 0.7, ease: 'easeOut' }}
                                    />
                                </div>
                            </div>

                            <div className="mt-4 flex items-center justify-between">
                                <div className="flex -space-x-2.5">
                                    {myGroup.members.slice(0, 5).map((m) => (
                                        <Avatar key={m.id} name={m.name} size={30} className="!border-2 !border-[#11151c]" />
                                    ))}
                                    {myGroup.members.length > 5 && (
                                        <div className="w-[30px] h-[30px] rounded-full bg-white/10 border-2 border-[#11151c] flex items-center justify-center text-[11px] font-bold">
                                            +{myGroup.members.length - 5}
                                        </div>
                                    )}
                                </div>
                                <span className="flex items-center text-[14px] font-semibold text-white/60">
                                    {t('ui.group_card.view_details')} <ChevronRight className="w-4 h-4" />
                                </span>
                            </div>
                        </div>
                    </Card>

                    {/* Missions */}
                    <div>
                        <p className="px-2 mb-2 text-[13px] font-semibold text-white/40 uppercase tracking-wide">
                            {t('ui.dashboard.active_missions')}
                        </p>
                        <Card className="overflow-hidden">
                            {myGroup.partyTasks.length > 0 ? (
                                myGroup.partyTasks.slice(0, 4).map((task, i) => (
                                    <Row key={task.id} first={i === 0}>
                                        {task.completed ? (
                                            <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                                        ) : (
                                            <Circle className="w-5 h-5 text-white/25 flex-shrink-0" />
                                        )}
                                        <span className={`text-[15px] truncate ${task.completed ? 'line-through text-white/35' : ''}`}>
                                            {task.title}
                                        </span>
                                    </Row>
                                ))
                            ) : (
                                <Row first>
                                    <span className="text-[15px] text-white/40">{t('ui.dashboard.no_active_missions')}</span>
                                </Row>
                            )}
                        </Card>
                    </div>

                    {/* Job offer (leader only) */}
                    {myGroup.isLeader && myGroup.jobOffer && (
                        <div>
                            <p className="px-2 mb-2 text-[13px] font-semibold text-white/40 uppercase tracking-wide flex items-center gap-1.5">
                                <Briefcase className="w-3.5 h-3.5" /> {t('ui.joboffer.section')}
                            </p>
                            <Card className="p-4 !border-emerald-500/25">
                                <div className="flex items-start gap-3">
                                    <div className="w-[38px] h-[38px] rounded-full bg-emerald-400/15 flex items-center justify-center flex-shrink-0">
                                        <Briefcase className="w-[18px] h-[18px] text-emerald-300" />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-[15px] font-semibold truncate">{myGroup.jobOffer.title}</p>
                                        <p className="text-[13px] text-white/50 leading-snug mt-0.5">{myGroup.jobOffer.description}</p>
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
                            <p className="px-2 mb-2 text-[13px] font-semibold text-white/40 uppercase tracking-wide flex items-center gap-1.5">
                                <Clock className="w-3.5 h-3.5" /> {t('ui.dashboard.pending_actions')}
                            </p>
                            <Card className="overflow-hidden">
                                {myGroup.isLeader && incoming.length > 0 &&
                                    incoming.map((req, i) => (
                                        <Row key={req.id} first={i === 0}>
                                            <Avatar name={req.name} size={34} />
                                            <div className="flex-1 min-w-0">
                                                <p className="text-[15px] font-medium truncate">{req.name}</p>
                                                <p className="text-[12px] text-amber-400">{t('ui.dashboard.join_requests')}</p>
                                            </div>
                                            <span className="w-2 h-2 rounded-full bg-amber-400" />
                                        </Row>
                                    ))}
                                {outgoing.map((g, i) => (
                                    <Row key={g.id} first={i === 0 && !(myGroup.isLeader && incoming.length > 0)}>
                                        <div className="w-[34px] h-[34px] rounded-full bg-sky-400/15 flex items-center justify-center flex-shrink-0">
                                            <Send className="w-4 h-4 text-sky-300" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-[15px] font-medium truncate">{g.name}</p>
                                            <p className="text-[12px] text-white/40">{t('ui.dashboard.application_sent')}</p>
                                        </div>
                                    </Row>
                                ))}
                                {myGroup.isLeader && incoming.length === 0 && outgoing.length === 0 && (
                                    <Row first>
                                        <span className="text-[15px] text-white/40">{t('ui.dashboard.no_new_recruits')}</span>
                                    </Row>
                                )}
                            </Card>
                        </div>
                    )}
                </div>
            ) : (
                <div className="px-4 pb-6 space-y-4 min-h-full flex flex-col justify-center -mt-10">
                    {/* Empty hero */}
                    <Card className="p-5 text-center relative overflow-hidden">
                        <div className="relative">
                            <div className="inline-flex p-3 rounded-2xl bg-emerald-500/15 mb-3">
                                <Users className="w-6 h-6 text-emerald-300" />
                            </div>
                            <h2 className="text-[20px] font-bold tracking-tight mb-1">{t('ui.dashboard.find_your_squad')}</h2>
                            <p className="text-[13px] text-white/50 leading-relaxed mb-5">{t('ui.dashboard.find_your_squad_desc')}</p>
                            <BigButton onClick={onOpenCreate}>
                                <span className="flex items-center justify-center gap-2">
                                    <Plus className="w-5 h-5" /> {t('ui.dashboard.create_new_group')}
                                </span>
                            </BigButton>
                        </div>
                    </Card>

                    {/* Trending */}
                    {featured.length > 0 && (
                        <div>
                            <div className="px-2 mb-2 flex items-center justify-between">
                                <p className="text-[13px] font-semibold text-white/40 uppercase tracking-wide">
                                    {t('ui.dashboard.trending_squads')}
                                </p>
                                <button onClick={onGoDiscover} className="text-[13px] font-semibold text-emerald-400 active:opacity-60">
                                    {t('ui.dashboard.discover_groups')}
                                </button>
                            </div>
                            <Card className="overflow-hidden">
                                {featured.map((g, i) => (
                                    <Row key={g.id} first={i === 0} onClick={onGoDiscover}>
                                        <Avatar name={g.name} size={40} />
                                        <div className="flex-1 min-w-0">
                                            <p className="text-[15px] font-semibold truncate">
                                                {g.name}
                                            </p>
                                            <div className="flex items-center gap-1.5 text-[12px] text-white/40 mt-0.5">
                                                <span>{t('ui.group_card.members_format', String(g.members.length), String(g.maxMembers))}</span>
                                                {g.isIllegal && (
                                                    <>
                                                        <span className="w-1 h-1 rounded-full bg-white/20" />
                                                        <span className="px-1.5 py-0.2 rounded text-[9px] font-bold uppercase tracking-wider bg-red-500/15 text-red-400 border border-red-500/20 flex items-center gap-0.5">
                                                            <ShieldAlert className="w-2.5 h-2.5 text-red-400" />
                                                            Illegal
                                                        </span>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                        <ChevronRight className="w-5 h-5 text-white/25" />
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
