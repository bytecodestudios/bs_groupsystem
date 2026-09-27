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
                <h1 className="text-[26px] leading-tight font-bold tracking-tight text-foreground">
                    {t('ui.groups.tab_settings')}
                </h1>
                <p className="text-[13px] text-muted-foreground mt-0.5">{t('ui.settings.network_desc')}</p>
            </div>

            <div className="px-4 pt-3 pb-12 space-y-4">
                {/* Status Hero Card matching laptop VPN shield card */}
                <div
                    className={`relative p-5 rounded-[18px] border flex flex-col items-center justify-center text-center overflow-hidden transition-all duration-300 ${
                        !hasAccess
                            ? 'bg-secondary/10 border-red-500/20 grayscale'
                            : 'bg-secondary/30 border-border/50'
                    }`}
                >
                    <div className="relative z-10 flex flex-col items-center">
                        <div
                            className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 mb-2.5 transition-colors duration-300 ${
                                !hasAccess
                                    ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                                    : connected
                                    ? 'bg-background/60 text-emerald-400 border border-emerald-500/30'
                                    : 'bg-background/60 text-muted-foreground border border-border'
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
                            <h2 className="text-[17px] font-bold tracking-tight text-foreground leading-none">
                                {!hasAccess
                                    ? t('ui.settings.access_denied')
                                    : connected
                                    ? t('ui.settings.vpn_shield')
                                    : t('ui.settings.disconnected')}
                            </h2>
                        </div>

                        <div className="h-[36px] flex items-center justify-center flex-shrink-0 mt-0.5">
                            <p className="text-[12.5px] text-muted-foreground max-w-[230px] leading-snug text-center">
                                {!hasAccess
                                    ? t('ui.settings.no_hardware_msg')
                                    : connected
                                    ? t('ui.settings.tunnel_active')
                                    : t('ui.settings.hardware_detected')}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Settings Section Header */}
                <div>
                    <h3 className="px-1 mb-1.5 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                        {t('ui.settings.network_access')}
                    </h3>

                    {/* Grouped Controls List */}
                    <Card className="overflow-hidden">
                        {/* VPN Switch Row */}
                        <div className="flex items-center justify-between px-3.5 py-3">
                            <div className="flex items-center gap-2.5 min-w-0 pr-2">
                                <div className="w-8 h-8 rounded-lg bg-secondary text-foreground border border-border flex items-center justify-center flex-shrink-0">
                                    <Shield className="w-4 h-4 text-emerald-400" />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-[13.5px] font-semibold text-foreground truncate">Private Network</p>
                                    <p className="text-[11.5px] text-muted-foreground truncate">
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
                        <div className="flex items-center justify-between px-3.5 py-3 border-t border-border/40">
                            <div className="flex items-center gap-2.5 min-w-0 pr-2">
                                <div className="w-8 h-8 rounded-lg bg-secondary text-foreground border border-border flex items-center justify-center flex-shrink-0">
                                    <Cpu className="w-4 h-4 text-blue-400" />
                                </div>
                                <span className="text-[13.5px] font-medium text-foreground whitespace-nowrap">VPN Dongle</span>
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
                        <div className="flex items-center justify-between px-3.5 py-3 border-t border-border/40">
                            <div className="flex items-center gap-2.5 min-w-0 pr-2">
                                <div className="w-8 h-8 rounded-lg bg-secondary text-foreground border border-border flex items-center justify-center flex-shrink-0">
                                    <KeyRound className="w-4 h-4 text-amber-400" />
                                </div>
                                <span className="text-[13.5px] font-medium text-foreground whitespace-nowrap">Encryption</span>
                            </div>

                            <span className="ml-auto text-[11.5px] text-muted-foreground font-medium whitespace-nowrap flex-shrink-0">
                                256-Bit AES
                            </span>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
};
