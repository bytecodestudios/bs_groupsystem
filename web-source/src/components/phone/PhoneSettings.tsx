import React, { useState, useEffect } from 'react';
import { Shield, ShieldCheck, ShieldAlert, Cpu, KeyRound } from 'lucide-react';
import { useLocale } from '../../hooks/useLocale';
import { Card, Switch } from './ui';

interface Props {
    isVpnConnected: boolean;
    onVpnConnectionChange: (connected: boolean) => void;
    hasAccess?: boolean;
}

export const PhoneSettings: React.FC<Props> = ({ isVpnConnected, onVpnConnectionChange, hasAccess = true }) => {
    const { t } = useLocale();
    const [status, setStatus] = useState<'disconnected' | 'connecting' | 'connected'>(
        isVpnConnected ? 'connected' : 'disconnected'
    );

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
            }, 1200);
        } else if (status === 'connected') {
            setStatus('disconnected');
            onVpnConnectionChange(false);
        }
    };

    const connected = status === 'connected' && hasAccess;

    return (
        <div className="h-full overflow-y-auto no-scrollbar">
            {/* Header */}
            <div className="px-5 pt-3 pb-1.5 flex-shrink-0">
                <h1 className="text-[26px] leading-tight font-bold tracking-tight text-white">
                    {t('ui.groups.tab_settings')}
                </h1>
                <p className="text-[13px] text-white/45 mt-0.5">{t('ui.settings.network_desc')}</p>
            </div>

            <div className="px-4 pt-3 pb-12 space-y-4">
                {/* Fixed-Height Status Hero Card */}
                <Card
                    className={`p-5 h-[168px] flex flex-col items-center justify-center text-center transition-colors ${
                        !hasAccess ? 'bg-red-500/[0.04] border-red-500/20' : ''
                    }`}
                >
                    <div
                        className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 mb-2.5 transition-colors duration-300 ${
                            !hasAccess
                                ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                                : connected
                                ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/25'
                                : 'bg-white/[0.06] text-white/50 border border-white/10'
                        }`}
                    >
                        {!hasAccess ? (
                            <ShieldAlert className="w-6 h-6" />
                        ) : connected ? (
                            <ShieldCheck className="w-6 h-6" />
                        ) : (
                            <Shield className="w-6 h-6" />
                        )}
                    </div>

                    <div className="h-[24px] flex items-center justify-center flex-shrink-0">
                        <h2 className="text-[17px] font-bold tracking-tight text-white leading-none">
                            {!hasAccess
                                ? t('ui.settings.access_denied')
                                : connected
                                ? t('ui.settings.vpn_shield')
                                : t('ui.settings.disconnected')}
                        </h2>
                    </div>

                    <div className="h-[36px] flex items-center justify-center flex-shrink-0 mt-0.5">
                        <p className="text-[12.5px] text-white/45 max-w-[230px] leading-snug text-center">
                            {!hasAccess
                                ? t('ui.settings.no_hardware_msg')
                                : connected
                                ? t('ui.settings.tunnel_active')
                                : t('ui.settings.hardware_detected')}
                        </p>
                    </div>
                </Card>

                {/* Settings Section Header */}
                <div>
                    <h3 className="px-1 mb-1.5 text-[11px] font-bold uppercase tracking-wider text-white/40">
                        {t('ui.settings.network_access')}
                    </h3>

                    {/* Grouped Controls List */}
                    <Card className="overflow-hidden">
                        {/* VPN Switch Row */}
                        <div className="flex items-center justify-between px-3.5 py-3">
                            <div className="flex items-center gap-2.5 min-w-0 pr-2">
                                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center flex-shrink-0">
                                    <Shield className="w-3.5 h-3.5" />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-[13.5px] font-semibold text-white truncate">Private Network</p>
                                    <p className="text-[11.5px] text-white/40 truncate">
                                        {status === 'connecting'
                                            ? t('ui.settings.establishing')
                                            : connected
                                            ? t('ui.settings.tunnel_encrypted')
                                            : t('ui.settings.disconnected')}
                                    </p>
                                </div>
                            </div>

                            <Switch
                                checked={connected}
                                onChange={toggle}
                                disabled={!hasAccess || status === 'connecting'}
                            />
                        </div>

                        {/* Hardware Dongle Row */}
                        <div className="flex items-center justify-between px-3.5 py-3 border-t border-white/[0.06]">
                            <div className="flex items-center gap-2.5 min-w-0 pr-2">
                                <div className="w-8 h-8 rounded-lg bg-sky-500/10 text-sky-400 flex items-center justify-center flex-shrink-0">
                                    <Cpu className="w-3.5 h-3.5" />
                                </div>
                                <span className="text-[13.5px] font-medium text-white whitespace-nowrap">VPN Dongle</span>
                            </div>

                            <span
                                className={`ml-auto text-[10.5px] font-semibold px-2.5 py-0.5 rounded-full whitespace-nowrap flex-shrink-0 ${
                                    hasAccess
                                        ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20'
                                        : 'bg-red-500/15 text-red-400 border border-red-500/20'
                                }`}
                            >
                                {hasAccess ? 'Detected' : 'Missing'}
                            </span>
                        </div>

                        {/* Encryption Row */}
                        <div className="flex items-center justify-between px-3.5 py-3 border-t border-white/[0.06]">
                            <div className="flex items-center gap-2.5 min-w-0 pr-2">
                                <div className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center flex-shrink-0">
                                    <KeyRound className="w-3.5 h-3.5" />
                                </div>
                                <span className="text-[13.5px] font-medium text-white whitespace-nowrap">Encryption</span>
                            </div>

                            <span className="ml-auto text-[11.5px] text-white/40 font-medium whitespace-nowrap flex-shrink-0">
                                256-Bit AES
                            </span>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
};
