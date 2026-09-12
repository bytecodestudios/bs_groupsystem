import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LayoutGrid, Compass, ShieldCheck } from 'lucide-react';
import { Group } from '../../utils/types';
import { useLocale } from '../../hooks/useLocale';
import { useGroupsController } from '../../hooks/useGroupsController';
import { IOS_FONT } from './ui';
import { PhoneDashboard } from './PhoneDashboard';
import { PhoneDiscover } from './PhoneDiscover';
import { PhoneSettings } from './PhoneSettings';
import { PhoneDetails } from './PhoneDetails';
import { PhoneCreateSheet } from './PhoneModals';
import { PhoneSkeleton } from './PhoneSkeleton';

type TabId = 'home' | 'discover' | 'settings';

const PhoneApp: React.FC = () => {
    const {
        isLoading,
        publicGroups,
        myGroup,
        selectedGroup,
        setSelectedGroup,
        sentRequests,
        isVpnConnected,
        hasVpnAccess,
        citizenId,
        handleVpnToggle,
        handleCreateGroup,
        handleRequestToJoin,
        handleResolveJobOffer,
        handleUpdateGroup,
        handleDisbandOrLeave,
    } = useGroupsController();

    const { t } = useLocale();
    const [tab, setTab] = useState<TabId>('home');
    const [createOpen, setCreateOpen] = useState(false);

    const tabs: { id: TabId; label: string; icon: React.ElementType }[] = [
        { id: 'home', label: t('ui.groups.tab_dashboard'), icon: LayoutGrid },
        { id: 'discover', label: t('ui.groups.tab_groups'), icon: Compass },
        { id: 'settings', label: t('ui.groups.tab_settings'), icon: ShieldCheck },
    ];

    const onCreate = async (data: { name: string; joinType: Group['joinType']; maxMembers: number; isIllegal?: boolean }) => {
        const ok = await handleCreateGroup(data);
        if (ok) {
            setCreateOpen(false);
            setTab('home');
        }
        return ok;
    };

    return (
        <div
            className="h-full w-full flex flex-col min-h-0 relative overflow-hidden text-white select-none"
            style={{
                fontFamily: IOS_FONT,
                paddingTop: 'max(env(safe-area-inset-top), 30px)',
                paddingBottom: 'max(env(safe-area-inset-bottom), 22px)',
                background: 'linear-gradient(180deg, #0b0f15 0%, #070a0f 100%)',
            }}
        >
            {isLoading ? (
                <PhoneSkeleton />
            ) : (
                <AnimatePresence mode="wait">
                    {selectedGroup ? (
                        <motion.div key="details" className="flex-1 min-h-0 flex flex-col" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                            <PhoneDetails
                                group={selectedGroup}
                                citizenId={citizenId}
                                onBack={() => setSelectedGroup(null)}
                                onUpdateGroup={handleUpdateGroup}
                                onDisbandOrLeave={handleDisbandOrLeave}
                            />
                        </motion.div>
                    ) : (
                        <motion.div key="tabs" className="flex-1 min-h-0 flex flex-col" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                            <div className="flex-1 min-h-0">
                                <AnimatePresence mode="wait">
                                    {tab === 'home' && (
                                        <motion.div key="home" className="h-full" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.18 }}>
                                            <PhoneDashboard
                                                myGroup={myGroup}
                                                allGroups={publicGroups}
                                                sentRequests={sentRequests}
                                                isVpnConnected={isVpnConnected}
                                                onSelectGroup={setSelectedGroup}
                                                onOpenCreate={() => setCreateOpen(true)}
                                                onRequestToJoin={handleRequestToJoin}
                                                onResolveJobOffer={handleResolveJobOffer}
                                                onGoDiscover={() => setTab('discover')}
                                            />
                                        </motion.div>
                                    )}
                                    {tab === 'discover' && (
                                        <motion.div key="discover" className="h-full" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.18 }}>
                                            <PhoneDiscover
                                                allGroups={publicGroups}
                                                isInGroup={!!myGroup}
                                                sentRequests={sentRequests}
                                                isVpnConnected={isVpnConnected}
                                                onRequestToJoin={handleRequestToJoin}
                                                onOpenCreate={() => setCreateOpen(true)}
                                            />
                                        </motion.div>
                                    )}
                                    {tab === 'settings' && (
                                        <motion.div key="settings" className="h-full" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.18 }}>
                                            <PhoneSettings
                                                isVpnConnected={isVpnConnected}
                                                onVpnConnectionChange={handleVpnToggle}
                                                hasAccess={hasVpnAccess}
                                            />
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>

                            {/* Floating pill bottom tab bar */}
                            <div className="flex-shrink-0 px-5 pt-1.5 pb-2">
                                <div className="flex items-center justify-around rounded-full bg-white/[0.06] border border-white/[0.08] px-2 py-1.5">
                                    {tabs.map((tb) => {
                                        const active = tab === tb.id;
                                        return (
                                            <button
                                                key={tb.id}
                                                onClick={() => setTab(tb.id)}
                                                className="relative flex flex-col items-center gap-0.5 flex-1 py-1 active:opacity-60 transition-opacity outline-none focus:outline-none focus-visible:outline-none"
                                            >
                                                <tb.icon
                                                    className="w-[20px] h-[20px] transition-colors"
                                                    strokeWidth={active ? 2.4 : 1.9}
                                                    style={{ color: active ? '#34d399' : 'rgba(255,255,255,0.4)' }}
                                                />
                                                <span
                                                    className="text-[10px] font-medium transition-colors"
                                                    style={{ color: active ? '#34d399' : 'rgba(255,255,255,0.4)' }}
                                                >
                                                    {tb.label}
                                                </span>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            )}

            <AnimatePresence>
                {createOpen && (
                    <PhoneCreateSheet onClose={() => setCreateOpen(false)} onCreate={onCreate} isVpnConnected={isVpnConnected} />
                )}
            </AnimatePresence>
        </div>
    );
};

export default PhoneApp;
