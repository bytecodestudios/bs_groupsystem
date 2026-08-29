import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Globe, Mail, Lock, ShieldAlert, RefreshCw, Send, Users, Minus, Plus } from 'lucide-react';
import { fetchNui } from '../../utils/fetchNui';
import { transformSingleGroup } from '../../utils/groupUtils';
import { useNotifications } from '../misc/Notification';
import { Group } from '../../utils/types';
import { useLocale } from '../../hooks/useLocale';
import { Sheet, BigButton, Avatar, Switch } from './ui';

const SheetHeader: React.FC<{ title: string; onClose: () => void }> = ({ title, onClose }) => (
    <div className="flex-shrink-0 flex items-center justify-between px-5 py-3">
        <h3 className="text-[20px] font-bold tracking-tight">{title}</h3>
        <button onClick={onClose} className="w-8 h-8 rounded-full bg-white/[0.08] flex items-center justify-center active:scale-90 transition-transform">
            <X className="w-4 h-4 text-white/60" />
        </button>
    </div>
);

export const PhoneCreateSheet: React.FC<{
    onClose: () => void;
    onCreate: (data: { name: string; joinType: Group['joinType']; maxMembers: number; isIllegal?: boolean }) => Promise<boolean>;
    isVpnConnected: boolean;
}> = ({ onClose, onCreate, isVpnConnected }) => {
    const { t } = useLocale();
    const [name, setName] = useState('');
    const [joinType, setJoinType] = useState<Group['joinType']>('Request to Join');
    const [maxMembers, setMaxMembers] = useState(5);
    const [isIllegal, setIsIllegal] = useState(false);
    const [error, setError] = useState('');
    const [busy, setBusy] = useState(false);

    const privacy: { id: Group['joinType']; icon: React.ElementType; label: string; desc: string }[] = [
        { id: 'Request to Join', icon: Globe, label: t('ui.modals.privacy_public'), desc: t('ui.modals.privacy_public_desc') },
        { id: 'Invite Only', icon: Mail, label: t('ui.modals.privacy_invite'), desc: t('ui.modals.privacy_invite_desc') },
        { id: 'Closed', icon: Lock, label: t('ui.modals.privacy_closed'), desc: t('ui.modals.privacy_closed_desc') },
    ];

    const submit = async () => {
        setError('');
        if (!name.trim()) { setError(t('ui.modals.group_name_required')); return; }
        if (maxMembers < 2 || maxMembers > 10) { setError(t('ui.modals.max_members_error')); return; }
        setBusy(true);
        await onCreate({ name: name.trim(), joinType, maxMembers, isIllegal });
        setBusy(false);
    };

    return (
        <Sheet onClose={onClose}>
            <SheetHeader title={t('ui.modals.create_new_group')} onClose={onClose} />
            <div className="flex-1 overflow-y-auto no-scrollbar px-5 pb-5 space-y-5">
                {/* Name */}
                <div>
                    <label className="text-[13px] font-semibold text-white/45 mb-1.5 block">{t('ui.modals.group_name')}</label>
                    <input
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder={t('ui.modals.group_name_placeholder')}
                        className="w-full bg-white/[0.06] border border-white/[0.08] rounded-2xl px-4 py-3 text-[16px] placeholder:text-white/30 focus:outline-none focus:border-emerald-500/50"
                    />
                </div>

                {/* Max members stepper */}
                <div>
                    <label className="text-[13px] font-semibold text-white/45 mb-1.5 block">{t('ui.modals.max_members')}</label>
                    <div className="flex items-center justify-between bg-white/[0.06] border border-white/[0.08] rounded-2xl px-4 py-2.5">
                        <span className="text-[16px] font-semibold flex items-center gap-2"><Users className="w-4 h-4 text-white/40" />{maxMembers}</span>
                        <div className="flex items-center gap-2">
                            <button onClick={() => setMaxMembers((v) => Math.max(2, v - 1))} className="w-8 h-8 rounded-full bg-white/[0.08] flex items-center justify-center active:scale-90 transition-transform">
                                <Minus className="w-4 h-4" />
                            </button>
                            <button onClick={() => setMaxMembers((v) => Math.min(10, v + 1))} className="w-8 h-8 rounded-full bg-white/[0.08] flex items-center justify-center active:scale-90 transition-transform">
                                <Plus className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Privacy */}
                <div>
                    <label className="text-[13px] font-semibold text-white/45 mb-1.5 block">{t('ui.modals.privacy_settings')}</label>
                    <div className="grid grid-cols-3 gap-2">
                        {privacy.map((p) => (
                            <button
                                key={p.id}
                                onClick={() => setJoinType(p.id)}
                                className={`flex flex-col items-center gap-1.5 py-3.5 rounded-2xl border transition-all ${
                                    joinType === p.id ? 'border-emerald-500 bg-emerald-500/10 text-emerald-300' : 'border-white/[0.08] bg-white/[0.04] text-white/50'
                                }`}
                            >
                                <p.icon className="w-5 h-5" />
                                <span className="text-[12px] font-semibold">{p.label}</span>
                            </button>
                        ))}
                    </div>
                    <p className="text-[12px] text-white/40 text-center mt-2 h-4">{privacy.find((p) => p.id === joinType)?.desc}</p>
                </div>

                {/* Illegal toggle */}
                {isVpnConnected && (
                    <div className="flex items-center justify-between p-3.5 rounded-2xl border border-red-500/25 bg-red-500/[0.06]">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-xl bg-red-500/15">
                                <ShieldAlert className="w-5 h-5 text-red-400" />
                            </div>
                            <div>
                                <p className="text-[14px] font-bold text-red-400">{t('ui.modals.illegal_network')}</p>
                                <p className="text-[11px] text-red-400/60">{t('ui.modals.illegal_network_desc')}</p>
                            </div>
                        </div>
                        <Switch checked={isIllegal} onChange={() => setIsIllegal((v) => !v)} />
                    </div>
                )}

                {error && <p className="text-[13px] text-red-400 text-center">{error}</p>}
            </div>
            <div className="flex-shrink-0 px-5 pb-6 pt-1">
                <BigButton onClick={submit} disabled={busy} variant={isIllegal ? 'danger' : 'primary'}>
                    {t('ui.modals.confirm_create')}
                </BigButton>
            </div>
        </Sheet>
    );
};

export const PhoneInviteSheet: React.FC<{
    onClose: () => void;
    onUpdateGroup: (group: Group) => void;
    citizenId: string | null;
}> = ({ onClose, onUpdateGroup, citizenId }) => {
    const { t } = useLocale();
    const { addNotification } = useNotifications();
    const [players, setPlayers] = useState<{ source: number; name: string; citizenid: string }[]>([]);
    const [loading, setLoading] = useState(true);
    const [inviting, setInviting] = useState<number | null>(null);

    const fetchPlayers = async () => {
        setLoading(true);
        try {
            const result = await fetchNui<any>('bsgroup:nui:getNearbyPlayers');
            if (result) setPlayers(result);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchPlayers(); }, []);

    const invite = async (source: number, playerName: string) => {
        setInviting(source);
        try {
            const response = await fetchNui<any>('bsgroup:nui:invitePlayer', { targetSource: source });
            if (response?.status) {
                addNotification('success', 'Invitation Sent', `A group invitation has been sent to ${playerName}.`);
                if (response.group && citizenId) onUpdateGroup(transformSingleGroup(response.group, citizenId));
            } else {
                addNotification('error', 'Failed to Invite', response?.msg || 'An error occurred');
            }
        } finally {
            setInviting(null);
        }
    };

    return (
        <Sheet onClose={onClose}>
            <SheetHeader title={t('ui.group_tabs.invite_member')} onClose={onClose} />
            <div className="flex-1 overflow-y-auto no-scrollbar px-5 pb-6 min-h-[240px]">
                <div className="flex items-center justify-between mb-3">
                    <p className="text-[13px] text-white/45">Nearby players (15m)</p>
                    <button onClick={fetchPlayers} className={`p-2 rounded-full bg-white/[0.06] text-white/50 ${loading ? 'animate-spin' : ''}`}>
                        <RefreshCw className="w-4 h-4" />
                    </button>
                </div>
                {loading ? (
                    <div className="py-16 flex flex-col items-center gap-3">
                        <div className="w-9 h-9 border-[3px] border-emerald-500/20 border-t-emerald-400 rounded-full animate-spin" />
                        <p className="text-[13px] text-white/40">Scanning area...</p>
                    </div>
                ) : players.length > 0 ? (
                    <div className="space-y-2">
                        {players.map((p) => (
                            <motion.div key={p.source} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-3 p-3 rounded-2xl bg-white/[0.05] border border-white/[0.06]">
                                <Avatar name={p.name} size={40} />
                                <div className="flex-1 min-w-0">
                                    <p className="text-[15px] font-semibold truncate">{p.name}</p>
                                    <p className="text-[11px] text-white/35 uppercase tracking-wide">ID: {p.source}</p>
                                </div>
                                <button
                                    onClick={() => invite(p.source, p.name)}
                                    disabled={inviting !== null}
                                    className={`w-10 h-10 rounded-full flex items-center justify-center transition-all active:scale-90 ${
                                        inviting === p.source ? 'bg-emerald-500 text-black' : 'bg-emerald-500/15 text-emerald-300'
                                    } disabled:opacity-50`}
                                >
                                    {inviting === p.source ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                                </button>
                            </motion.div>
                        ))}
                    </div>
                ) : (
                    <div className="py-16 flex flex-col items-center gap-3">
                        <Users className="w-12 h-12 text-white/15" />
                        <p className="text-[14px] text-white/40">No players found nearby</p>
                    </div>
                )}
            </div>
        </Sheet>
    );
};

export const PhoneConfirmSheet: React.FC<{
    title: string;
    message: React.ReactNode;
    confirmText: string;
    danger?: boolean;
    onConfirm: () => void;
    onClose: () => void;
    Icon: React.ElementType;
}> = ({ title, message, confirmText, danger = true, onConfirm, onClose, Icon }) => {
    const { t } = useLocale();
    return (
        <Sheet onClose={onClose}>
            <div className="px-6 pt-3 pb-7 text-center">
                <div className={`inline-flex p-4 rounded-3xl mb-4 ${danger ? 'bg-red-500/15' : 'bg-emerald-500/15'}`}>
                    <Icon className={`w-8 h-8 ${danger ? 'text-red-400' : 'text-emerald-400'}`} />
                </div>
                <h3 className="text-[20px] font-bold tracking-tight">{title}</h3>
                <div className="text-[14px] text-white/50 mt-2 mb-6 leading-relaxed">{message}</div>
                <div className="space-y-2.5">
                    <BigButton variant={danger ? 'danger' : 'primary'} onClick={onConfirm}>{confirmText}</BigButton>
                    <BigButton variant="neutral" onClick={onClose}>{t('ui.modals.cancel')}</BigButton>
                </div>
            </div>
        </Sheet>
    );
};
