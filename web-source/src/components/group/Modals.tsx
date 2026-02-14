import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, FileText, Users, Globe, Lock, Mail, ShieldAlert } from 'lucide-react';
import { Group } from '../../utils/types';
import { useLocale } from '../../hooks/useLocale';

const MotionDiv = motion.div;

export const CreateGroupModal: React.FC<{ onClose: () => void, onCreate: (data: { name: string; joinType: Group['joinType']; maxMembers: number; isIllegal?: boolean; }) => void, isVpnConnected: boolean }> = ({ onClose, onCreate, isVpnConnected }) => {
    const [step, setStep] = useState<'input' | 'confirm'>('input');
    const [name, setName] = useState('');
    const [joinType, setJoinType] = useState<Group['joinType']>('Request to Join');
    const [maxMembers, setMaxMembers] = useState('5');
    const [isIllegal, setIsIllegal] = useState(false);
    const [error, setError] = useState('');
    const { t } = useLocale();

    const handleProceedToConfirm = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        const numMaxMembers = parseInt(maxMembers, 10);
        if (!name.trim()) { setError(t('modals.group_name_required')); return; }
        if (isNaN(numMaxMembers) || numMaxMembers < 2 || numMaxMembers > 10) { setError(t('modals.max_members_error')); return; }
        setStep('confirm');
    };

    const handleFinalCreate = () => {
        onCreate({ name: name.trim(), joinType, maxMembers: parseInt(maxMembers, 10), isIllegal });
    };

    return (
        <MotionDiv initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <MotionDiv initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} onClick={(e) => e.stopPropagation()} className="relative bg-card border border-border rounded-2xl w-full max-w-md shadow-2xl">
                <div className="flex justify-between items-center p-6 border-b border-border"><h3 className="text-lg font-bold text-foreground">{step === 'input' ? t('modals.create_new_group') : t('modals.confirm_details')}</h3><button onClick={onClose} className="p-1.5 rounded-full hover:bg-muted transition-colors"><X className="w-5 h-5 text-muted-foreground" /></button></div>
                <AnimatePresence mode="wait">
                    {step === 'input' ? (
                        <MotionDiv key="input" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
                            <form onSubmit={handleProceedToConfirm}>
                                <div className="p-6 space-y-6">
                                    <div className="flex space-x-4">
                                        <div className="flex-grow">
                                            <label className="block text-sm font-medium text-muted-foreground mb-2">{t('modals.group_name')}</label>
                                            <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder={t('modals.group_name_placeholder')} required className="w-full bg-input border-2 border-border focus:border-primary rounded-lg px-3 py-2 text-sm focus:ring-0 focus:outline-none transition-colors" />
                                        </div>
                                        <div className="w-28">
                                            <label className="block text-sm font-medium text-muted-foreground mb-2">{t('modals.max_members')}</label>
                                            <input type="number" value={maxMembers} onChange={(e) => setMaxMembers(e.target.value)} min="2" max="10" required className="w-full bg-input border-2 border-border focus:border-primary rounded-lg px-3 py-2 text-sm focus:ring-0 focus:outline-none transition-colors" />
                                        </div>
                                    </div>
                                    
                                    <div className="space-y-3">
                                        <label className="block text-sm font-medium text-muted-foreground">{t('modals.privacy_settings')}</label>
                                        <div className="grid grid-cols-3 gap-2">
                                            {[
                                                { id: 'Request to Join', icon: Globe, label: t('modals.privacy_public') },
                                                { id: 'Invite Only', icon: Mail, label: t('modals.privacy_invite') },
                                                { id: 'Closed', icon: Lock, label: t('modals.privacy_closed') }
                                            ].map((type) => (
                                                <button
                                                    key={type.id}
                                                    type="button"
                                                    onClick={() => setJoinType(type.id as Group['joinType'])}
                                                    className={`flex flex-col items-center justify-center p-3 rounded-lg border-2 transition-all ${
                                                        joinType === type.id 
                                                            ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400' 
                                                            : 'border-border bg-secondary/30 text-muted-foreground hover:bg-secondary/50 hover:border-border/80'
                                                    }`}
                                                >
                                                    <type.icon className="w-5 h-5 mb-1.5" />
                                                    <span className="text-xs font-semibold">{type.label}</span>
                                                </button>
                                            ))}
                                        </div>
                                    <p className="text-xs text-center text-muted-foreground h-4">
                                            {joinType === 'Request to Join' && t('modals.privacy_public_desc')}
                                            {joinType === 'Invite Only' && t('modals.privacy_invite_desc')}
                                            {joinType === 'Closed' && t('modals.privacy_closed_desc')}
                                        </p>
                                    </div>

                                    {/* Illegal Group Toggle - Only visible if VPN is connected */}
                                    {isVpnConnected && (
                                        <div className="space-y-2 pt-2 border-t border-border">
                                            <label className="flex items-center justify-between cursor-pointer p-3 rounded-lg border border-red-500/30 bg-red-500/5 hover:bg-red-500/10 transition-colors">
                                                <div className="flex items-center space-x-3">
                                                    <div className="bg-red-500/20 p-2 rounded-lg">
                                                        <ShieldAlert className="w-5 h-5 text-red-500" />
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-red-500 text-sm">{t('modals.illegal_network')}</p>
                                                        <p className="text-[10px] text-red-400/70">{t('modals.illegal_network_desc')}</p>
                                                    </div>
                                                </div>
                                                <div className={`w-10 h-5 rounded-full relative transition-colors ${isIllegal ? 'bg-red-500' : 'bg-secondary border border-border'}`} onClick={() => setIsIllegal(!isIllegal)}>
                                                    <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${isIllegal ? 'left-5' : 'left-0.5'}`} />
                                                </div>
                                            </label>
                                        </div>
                                    )}

                                    {error && <p className="text-xs text-red-500 text-center -mt-2">{error}</p>}
                                </div>
                                <div className="px-6 py-4 bg-secondary/30 border-t border-border flex justify-end"><button type="submit" className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors">{t('modals.continue')}</button></div>
                            </form>
                        </MotionDiv>
                    ) : (
                        <MotionDiv key="confirm" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                            <div className="p-6"><p className="text-sm text-center text-muted-foreground mb-4">{t('modals.review_details')}</p><div className="bg-secondary/50 border border-border rounded-lg p-4 space-y-3 text-sm"><div className="flex justify-between items-center"><span className="text-muted-foreground font-medium flex items-center"><FileText className="w-4 h-4 mr-2" />{t('modals.group_name')}</span><span className="font-semibold text-foreground">{name}</span></div><div className="flex justify-between items-center"><span className="text-muted-foreground font-medium flex items-center"><Users className="w-4 h-4 mr-2" />{t('modals.max_members')}</span><span className="font-semibold text-foreground">{maxMembers}</span></div><div className="flex justify-between items-center"><span className="text-muted-foreground font-medium flex items-center"><Globe className="w-4 h-4 mr-2" />{t('modals.privacy')}</span><span className="font-semibold text-foreground">{joinType}</span></div>
                            {isIllegal && <div className="flex justify-between items-center pt-2 border-t border-border/50"><span className="text-red-400 font-medium flex items-center"><ShieldAlert className="w-4 h-4 mr-2" />{t('modals.network')}</span><span className="font-bold text-red-500">{t('modals.illegal')}</span></div>}
                            </div></div>
                            <div className="px-6 py-4 bg-secondary/30 border-t border-border flex justify-end space-x-3 rounded-b-2xl"><button type="button" onClick={() => setStep('input')} className="px-4 py-2 text-sm font-semibold text-foreground bg-secondary hover:bg-muted border border-border rounded-lg transition-colors">{t('modals.back')}</button><button type="button" onClick={handleFinalCreate} className={`px-4 py-2 text-sm font-semibold text-white rounded-lg transition-colors ${isIllegal ? 'bg-red-600 hover:bg-red-700' : 'bg-emerald-600 hover:bg-emerald-700'}`}>{t('modals.confirm_create')}</button></div>
                        </MotionDiv>
                    )}
                </AnimatePresence>
            </MotionDiv>
        </MotionDiv>
    );
};

export const ConfirmationModal: React.FC<{ title: string; message: React.ReactNode; confirmText: string; confirmClass: string; onConfirm: () => void; onCancel: () => void; Icon: React.ElementType }> = ({ title, message, confirmText, confirmClass, onConfirm, onCancel, Icon }) => {
    const { t } = useLocale();
    return (
    <MotionDiv initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <MotionDiv initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} onClick={(e) => e.stopPropagation()} className="relative bg-card border border-border rounded-2xl w-full max-w-sm p-8 text-center">
            <Icon className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-foreground">{title}</h3>
            <div className="text-sm text-muted-foreground mt-2 mb-6">{message}</div>
            <div className="flex justify-center space-x-4"><button onClick={onCancel} className="px-6 py-2 text-sm font-semibold text-foreground bg-secondary hover:bg-muted border border-border rounded-lg transition-colors">{t('modals.cancel')}</button><button onClick={onConfirm} className={`px-6 py-2 text-sm font-semibold text-white rounded-lg transition-colors ${confirmClass}`}>{confirmText}</button></div>
        </MotionDiv>
    </MotionDiv>
    );
};