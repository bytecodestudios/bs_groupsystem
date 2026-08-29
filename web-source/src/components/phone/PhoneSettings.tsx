import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Power, Lock, GlobeLock, Cpu } from 'lucide-react';
import { useLocale } from '../../hooks/useLocale';
import { Card } from './ui';

interface Props {
    isVpnConnected: boolean;
    onVpnConnectionChange: (connected: boolean) => void;
    hasAccess?: boolean;
}

export const PhoneSettings: React.FC<Props> = ({ isVpnConnected, onVpnConnectionChange, hasAccess = true }) => {
    const { t } = useLocale();
    const [status, setStatus] = useState<'disconnected' | 'connecting' | 'connected'>(isVpnConnected ? 'connected' : 'disconnected');

    useEffect(() => {
        if (isVpnConnected && status !== 'connected') setStatus('connected');
        if (!isVpnConnected && status === 'connected') setStatus('disconnected');
    }, [isVpnConnected]);

    const toggle = () => {
        if (!hasAccess || status === 'connecting') return;
        if (status === 'disconnected') {
            setStatus('connecting');
            setTimeout(() => {
                setStatus('connected');
                onVpnConnectionChange(true);
            }, 1500);
        } else if (status === 'connected') {
            setStatus('disconnected');
            onVpnConnectionChange(false);
        }
    };

    const connected = status === 'connected' && hasAccess;

    return (
        <div className="h-full overflow-y-auto no-scrollbar">
            <div className="px-5 pt-3 pb-2">
                <h1 className="text-[32px] leading-none font-bold tracking-tight">{t('ui.groups.tab_settings')}</h1>
                <p className="text-[14px] text-white/45 mt-1.5">{t('ui.settings.network_desc')}</p>
            </div>

            <div className="px-4 pt-4 pb-6">
                <Card className={`p-7 flex flex-col items-center relative overflow-hidden ${!hasAccess ? '!border-red-500/20' : ''}`}>
                    {/* Hardware status chip */}
                    <div className="absolute top-4 right-4 flex items-center gap-1.5">
                        <span className={`text-[10px] font-bold ${hasAccess ? 'text-emerald-400' : 'text-red-400'}`}>HW_OK</span>
                        <Cpu className={`w-3 h-3 ${hasAccess ? 'text-emerald-400' : 'text-red-400'}`} />
                    </div>

                    {/* Ambient glow when connected */}
                    <div
                        className="absolute top-1/3 left-1/2 -translate-x-1/2 w-56 h-56 rounded-full blur-3xl pointer-events-none transition-opacity duration-700"
                        style={{ background: 'rgba(16,185,129,0.18)', opacity: connected ? 1 : 0 }}
                    />

                    <div className="relative flex flex-col items-center">
                        <div className={`mb-5 p-4 rounded-3xl border ${!hasAccess ? 'bg-red-500/5 border-red-500/15' : 'bg-white/[0.04] border-white/[0.06]'}`}>
                            {!hasAccess ? (
                                <Lock className="w-9 h-9 text-red-400/50" />
                            ) : (
                                <GlobeLock className={`w-9 h-9 transition-colors duration-500 ${connected ? 'text-emerald-400' : 'text-white/40'}`} />
                            )}
                        </div>

                        <h2 className={`text-[20px] font-bold tracking-tight ${!hasAccess ? 'text-white/50' : ''}`}>
                            {!hasAccess ? t('ui.settings.access_denied') : t('ui.settings.vpn_shield')}
                        </h2>
                        <p className="text-[13px] text-white/45 text-center mt-1 mb-7 max-w-[220px]">
                            {!hasAccess
                                ? t('ui.settings.no_hardware_msg')
                                : connected
                                ? t('ui.settings.tunnel_active')
                                : t('ui.settings.hardware_detected')}
                        </p>

                        {/* Power button */}
                        <button
                            onClick={toggle}
                            disabled={!hasAccess}
                            className={`relative w-24 h-24 rounded-full flex items-center justify-center transition-all duration-500 ${
                                !hasAccess
                                    ? 'bg-white/[0.03] border-2 border-red-500/10 cursor-not-allowed'
                                    : connected
                                    ? 'bg-emerald-500 border-4 border-emerald-400/40'
                                    : 'bg-white/[0.06] border-2 border-white/10 active:bg-white/[0.1]'
                            }`}
                        >
                            {(status === 'connecting' || connected) && hasAccess && (
                                <>
                                    <motion.div
                                        className="absolute inset-0 rounded-full border-2 border-emerald-400/50"
                                        initial={{ scale: 1, opacity: 0.5 }}
                                        animate={{ scale: status === 'connecting' ? 1.5 : 1.15, opacity: 0 }}
                                        transition={{ duration: 1.5, repeat: Infinity, ease: 'easeOut' }}
                                    />
                                    <motion.div
                                        className="absolute inset-0 rounded-full border border-emerald-400/30"
                                        initial={{ scale: 1, opacity: 0.4 }}
                                        animate={{ scale: status === 'connecting' ? 1.7 : 1.25, opacity: 0 }}
                                        transition={{ duration: 1.5, delay: 0.4, repeat: Infinity, ease: 'easeOut' }}
                                    />
                                </>
                            )}
                            <Power
                                className={`w-9 h-9 transition-all duration-300 ${
                                    !hasAccess
                                        ? 'text-red-400/40'
                                        : connected
                                        ? 'text-black'
                                        : status === 'connecting'
                                        ? 'text-emerald-400'
                                        : 'text-white/60'
                                }`}
                                strokeWidth={2.4}
                            />
                        </button>

                        {/* Status pill */}
                        <div
                            className={`mt-7 flex items-center gap-2.5 px-4 py-2 rounded-full border ${
                                !hasAccess
                                    ? 'bg-red-500/5 border-red-500/10'
                                    : connected
                                    ? 'bg-emerald-500/10 border-emerald-500/25'
                                    : 'bg-white/[0.03] border-white/[0.06]'
                            }`}
                        >
                            <span
                                className={`w-2 h-2 rounded-full ${
                                    !hasAccess
                                        ? 'bg-red-400/50'
                                        : connected
                                        ? 'bg-emerald-400'
                                        : status === 'connecting'
                                        ? 'bg-amber-400 animate-pulse'
                                        : 'bg-red-400'
                                }`}
                            />
                            <span
                                className={`text-[11px] font-bold uppercase tracking-widest ${
                                    !hasAccess ? 'text-red-400/50' : connected ? 'text-emerald-300' : 'text-white/45'
                                }`}
                            >
                                {!hasAccess
                                    ? t('ui.settings.no_hardware')
                                    : connected
                                    ? t('ui.settings.tunnel_encrypted')
                                    : status === 'connecting'
                                    ? t('ui.settings.establishing')
                                    : t('ui.settings.disconnected')}
                            </span>
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    );
};
