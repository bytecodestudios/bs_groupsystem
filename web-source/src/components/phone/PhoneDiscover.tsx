import React, { useState, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Plus, ShieldAlert, Users2 } from 'lucide-react';
import { Group } from '../../utils/types';
import { useLocale } from '../../hooks/useLocale';
import { Card, Avatar, Segmented } from './ui';

interface Props {
    allGroups: Group[];
    isInGroup: boolean;
    sentRequests: Set<string>;
    isVpnConnected: boolean;
    onRequestToJoin: (id: string) => void;
    onOpenCreate: () => void;
}

type Filter = 'all' | 'Recruiting' | 'Active' | 'Full';

const JoinButton: React.FC<{ group: Group; isInGroup: boolean; hasSentRequest: boolean; onRequestToJoin: (id: string) => void }> = ({
    group,
    isInGroup,
    hasSentRequest,
    onRequestToJoin,
}) => {
    const { t } = useLocale();
    const isFull = group.members.length >= group.maxMembers;

    let text = t('ui.group_card.request_to_join');
    let disabled = false;
    let cls = 'bg-emerald-500 text-black active:bg-emerald-400 px-3 py-1.5 text-[12px]';

    if (isInGroup) { text = 'Joined'; disabled = true; }
    else if (isFull) { text = t('ui.group_card.group_is_full'); disabled = true; }
    else if (hasSentRequest) { text = t('ui.group_card.request_sent'); disabled = true; cls = 'bg-sky-400/15 text-sky-300 px-2.5 py-1 text-[11px]'; }
    else if (group.joinType === 'Closed') { text = t('ui.group_card.closed'); disabled = true; }
    else if (group.joinType === 'Invite Only') { text = t('ui.group_card.invite_only'); disabled = true; }
    else if (group.status !== 'Recruiting') { text = t('ui.group_card.not_recruiting'); disabled = true; }

    if (disabled && cls.startsWith('bg-emerald')) cls = 'bg-white/[0.06] text-white/40 px-2.5 py-1 text-[11px]';

    return (
        <button
            onClick={() => !disabled && onRequestToJoin(group.id)}
            disabled={disabled}
            className={`flex-shrink-0 rounded-lg text-[12px] font-semibold whitespace-nowrap transition-all active:scale-95 disabled:active:scale-100 ${cls}`}
        >
            {text}
        </button>
    );
};

export const PhoneDiscover: React.FC<Props> = ({
    allGroups,
    isInGroup,
    sentRequests,
    isVpnConnected,
    onRequestToJoin,
    onOpenCreate,
}) => {
    const { t } = useLocale();
    const [query, setQuery] = useState('');
    const [filter, setFilter] = useState<Filter>('all');
    const [illegalOnly, setIllegalOnly] = useState(false);

    useEffect(() => {
        if (!isVpnConnected && illegalOnly) setIllegalOnly(false);
    }, [isVpnConnected, illegalOnly]);

    const filtered = useMemo(() => {
        return allGroups.filter((g) => {
            if (g.isIllegal && !isVpnConnected) return false;
            if (illegalOnly && !g.isIllegal) return false;
            if (query && !g.name.toLowerCase().includes(query.toLowerCase())) return false;
            if (filter !== 'all' && g.status !== filter) return false;
            return true;
        });
    }, [allGroups, query, filter, illegalOnly, isVpnConnected]);

    return (
        <div className="h-full flex flex-col min-h-0">
            <div className="flex-shrink-0 px-5 pt-3 pb-3">
                <div className="flex items-center justify-between">
                    <h1 className="text-[32px] leading-none font-bold tracking-tight">{t('ui.dashboard.discover_groups')}</h1>
                    <button
                        onClick={onOpenCreate}
                        className="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center active:scale-90 transition-transform"
                    >
                        <Plus className="w-6 h-6 text-black" strokeWidth={2.6} />
                    </button>
                </div>
            </div>

            {/* Search */}
            <div className="flex-shrink-0 px-4 pb-3">
                <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-2xl bg-white/[0.07] border border-white/[0.06]">
                    <Search className="w-[18px] h-[18px] text-white/40" />
                    <input
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder={t('ui.dashboard.search_placeholder')}
                        className="flex-1 bg-transparent text-[15px] placeholder:text-white/35 focus:outline-none"
                    />
                </div>
            </div>

            {/* Filters */}
            <div className="flex-shrink-0 px-4 pb-3 space-y-2">
                <Segmented<Filter>
                    value={filter}
                    onChange={setFilter}
                    options={[
                        { id: 'all', label: t('ui.dashboard.filter_all') },
                        { id: 'Recruiting', label: 'Recruiting' },
                        { id: 'Active', label: 'Active' },
                        { id: 'Full', label: 'Full' },
                    ]}
                />
                {isVpnConnected && (
                    <button
                        onClick={() => setIllegalOnly((v) => !v)}
                        className={`w-full flex items-center justify-center gap-2 py-2 rounded-full text-[13px] font-semibold transition-colors ${
                            illegalOnly ? 'bg-red-500/15 text-red-300 border border-red-500/25' : 'bg-white/[0.05] text-red-400/70'
                        }`}
                    >
                        <ShieldAlert className="w-4 h-4" /> {t('ui.dashboard.filter_illegal')}
                    </button>
                )}
            </div>

            {/* List */}
            <div className="flex-1 min-h-0 overflow-y-auto no-scrollbar px-4 pb-6">
                {filtered.length > 0 ? (
                    <div className="space-y-2.5">
                        {filtered.map((g, i) => (
                            <motion.div key={g.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: Math.min(i * 0.03, 0.3) }}>
                                <Card className="p-3.5">
                                    <div className="flex items-center justify-between gap-3">
                                        <div className="flex items-center gap-3 min-w-0 flex-1">
                                            <Avatar name={g.name} size={40} className="flex-shrink-0" />
                                            <div className="min-w-0 flex-1">
                                                <div className="flex items-center gap-2">
                                                    <div className="text-[15px] font-bold text-white truncate">{g.name}</div>
                                                    {g.isIllegal && (
                                                        <span className="px-1.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-red-500/15 text-red-400 border border-red-500/20 flex items-center gap-0.5 flex-shrink-0">
                                                            <ShieldAlert className="w-2.5 h-2.5 text-red-400" />
                                                            Illegal
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-1.5 text-[11px] text-white/40 mt-0.5">
                                                    <Users2 className="w-3.5 h-3.5 flex-shrink-0 text-white/35" />
                                                    <span>{g.members.length}/{g.maxMembers}</span>
                                                    <span className="w-1 h-1 rounded-full bg-white/20" />
                                                    <span>{g.status}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <JoinButton
                                            group={g}
                                            isInGroup={isInGroup}
                                            hasSentRequest={sentRequests.has(g.id)}
                                            onRequestToJoin={onRequestToJoin}
                                        />
                                    </div>
                                </Card>
                            </motion.div>
                        ))}
                    </div>
                ) : (
                    <div className="mt-16 flex flex-col items-center text-center px-8">
                        <div className="p-5 rounded-full bg-white/[0.04] mb-4">
                            <Users2 className="w-10 h-10 text-white/20" />
                        </div>
                        <p className="text-[15px] text-white/45">
                            {allGroups.length === 0 ? t('ui.dashboard.no_public_groups') : t('ui.dashboard.no_match')}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};
