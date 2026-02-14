import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Shield, Power, Lock, Cpu, GlobeLock } from 'lucide-react';
import { useLocale } from '../../hooks/useLocale';

interface SettingsTabProps {
    isVpnConnected: boolean;
    onVpnConnectionChange: (connected: boolean) => void;
    hasAccess?: boolean;
}

const Toggle: React.FC<{ label: string; checked: boolean; onChange: () => void; icon: React.ElementType, description?: string }> = ({ label, checked, onChange, icon: Icon, description }) => (
    <div className="flex items-center justify-between p-4 bg-secondary/30 rounded-lg border border-border hover:bg-secondary/50 transition-colors">
        <div className="flex items-center space-x-4">
            <div className="p-2.5 bg-secondary rounded-lg text-foreground">
                <Icon className="w-5 h-5" />
            </div>
            <div>
                <span className="font-medium text-foreground block">{label}</span>
                {description && <span className="text-xs text-muted-foreground">{description}</span>}
            </div>
        </div>
        <button
            onClick={onChange}
            className={`w-12 h-6 rounded-full p-1 transition-colors duration-300 ${checked ? 'bg-emerald-500' : 'bg-muted'}`}
        >
            <motion.div
                className="w-4 h-4 bg-white rounded-full shadow-sm"
                animate={{ x: checked ? 24 : 0 }}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
            />
        </button>
    </div>
);

export const SettingsTab: React.FC<SettingsTabProps> = ({ isVpnConnected, onVpnConnectionChange, hasAccess = true }) => {
    const [status, setStatus] = useState<'disconnected' | 'connecting' | 'connected'>(isVpnConnected ? 'connected' : 'disconnected');
    const { t } = useLocale();

    useEffect(() => {
        // Sync internal state if prop changes
        if (isVpnConnected && status !== 'connected') setStatus('connected');
        if (!isVpnConnected && status === 'connected') setStatus('disconnected');
    }, [isVpnConnected]);

    const handleToggle = () => {
        if (!hasAccess) return;

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

    return (
        <div className="space-y-6 max-w-3xl mx-auto py-2">
            {/* VPN Shield Section */}
            <div>
                <h3 className="text-lg font-bold text-foreground mb-1 px-1">{t('settings.network_access')}</h3>
                <p className="text-sm text-muted-foreground mb-4 px-1">{t('settings.network_desc')}</p>
                
                <div className={`relative w-full border rounded-2xl p-6 flex flex-col items-center backdrop-blur-md overflow-hidden transition-all duration-500 ${!hasAccess ? 'bg-secondary/10 border-red-500/20 grayscale' : 'bg-secondary/30 border-border/50'}`}>
                    
                    {/* Background ambient glow */}
                    <div className={`absolute inset-0 transition-opacity duration-1000 ${status === 'connected' && hasAccess ? 'opacity-100' : 'opacity-0'}`}>
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-emerald-500/10 blur-[80px] rounded-full pointer-events-none" />
                    </div>

                    <div className="z-10 flex flex-col items-center w-full">
                        <div className="absolute top-4 right-4 flex items-center space-x-2">
                            <span className={`text-[10px] font-bold tracking-tighter ${hasAccess ? 'text-emerald-500' : 'text-red-500'}`}>HW_OK</span>
                            <Cpu className={`w-3 h-3 ${hasAccess ? 'text-emerald-500' : 'text-red-500'}`} />
                        </div>

                        <div className={`mb-6 p-4 rounded-2xl border shadow-inner transition-colors duration-500 ${!hasAccess ? 'bg-red-500/5 border-red-500/20' : 'bg-background/50 border-white/5'}`}>
                            {!hasAccess ? (
                                 <Lock className="w-10 h-10 text-red-500/50" />
                            ) : (
                                 <GlobeLock className={`w-10 h-10 transition-colors duration-500 ${status === 'connected' ? 'text-emerald-500' : 'text-muted-foreground'}`} />
                            )}
                        </div>

                        <h2 className={`text-xl font-black tracking-tight mb-1 ${!hasAccess ? 'text-muted-foreground' : 'text-foreground'}`}>
                            {!hasAccess ? t('settings.access_denied') : t('settings.vpn_shield')}
                        </h2>
                        <p className="text-xs text-muted-foreground text-center mb-6 max-w-[200px]">
                            {!hasAccess 
                                ? t('settings.no_hardware_msg')
                                : (status === 'connected' 
                                    ? t('settings.tunnel_active')
                                    : t('settings.hardware_detected'))}
                        </p>

                        <button
                            onClick={status === 'connecting' || !hasAccess ? undefined : handleToggle}
                            disabled={!hasAccess}
                            className={`group relative w-20 h-20 rounded-full flex items-center justify-center transition-all duration-500 ${
                                !hasAccess
                                ? 'bg-secondary/20 border-2 border-red-500/10 cursor-not-allowed opacity-50'
                                : status === 'connected' 
                                    ? 'bg-emerald-500 shadow-[0_0_30px_-5px_rgba(16,185,129,0.5)] border-emerald-400/50 border-4' 
                                    : 'bg-secondary border-2 border-border hover:border-emerald-500/50 hover:bg-secondary/80 shadow-lg'
                            }`}
                        >
                             {/* Simple Pulse Ring when connecting */}
                             {(status === 'connecting' || status === 'connected') && hasAccess && (
                                <>
                                    <motion.div
                                        className="absolute inset-0 rounded-full border-2 border-emerald-500/50"
                                        initial={{ scale: 1, opacity: 0.5 }}
                                        animate={{ scale: status === 'connecting' ? 1.4 : 1.1, opacity: 0 }}
                                        transition={{ duration: 1.5, repeat: Infinity, ease: "easeOut" }}
                                    />
                                    <motion.div
                                        className="absolute inset-0 rounded-full border border-emerald-500/30"
                                        initial={{ scale: 1, opacity: 0.5 }}
                                        animate={{ scale: status === 'connecting' ? 1.6 : 1.2, opacity: 0 }}
                                        transition={{ duration: 1.5, delay: 0.4, repeat: Infinity, ease: "easeOut" }}
                                    />
                                </>
                            )}

                            <Power className={`w-8 h-8 transition-all duration-300 ${
                                !hasAccess ? 'text-red-500/50' :
                                status === 'connected' ? 'text-white drop-shadow-[0_0_8px_white]' : 
                                status === 'connecting' ? 'text-emerald-500' : 
                                'text-muted-foreground group-hover:text-foreground'
                            }`} />
                        </button>

                        <div className={`mt-6 flex items-center space-x-3 px-4 py-2 rounded-full border transition-all duration-300 ${!hasAccess ? 'bg-red-500/5 border-red-500/10' : (status === 'connected' ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-black/20 border-white/5')}`}>
                            <div className={`w-2 h-2 rounded-full transition-colors duration-300 ${
                                !hasAccess ? 'bg-red-500/50' :
                                status === 'connected' ? 'bg-emerald-500 shadow-[0_0_8px_#10b981]' : 
                                status === 'connecting' ? 'bg-amber-500 animate-pulse' : 'bg-red-500'
                            }`} />
                            <span className={`text-xs font-bold uppercase tracking-widest ${!hasAccess ? 'text-red-500/50' : (status === 'connected' ? 'text-emerald-400' : 'text-muted-foreground')}`}>
                                {!hasAccess ? t('settings.no_hardware') : (status === 'connected' ? t('settings.tunnel_encrypted') : status === 'connecting' ? t('settings.establishing') : t('settings.disconnected'))}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* VPN Shield Section Only - General Preferences Removed */}
        </div>
    );
};
