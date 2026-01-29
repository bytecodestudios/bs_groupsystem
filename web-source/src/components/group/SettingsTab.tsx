import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Bell, Shield, Volume2, Globe, Moon, Eye, Activity } from 'lucide-react';

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

export const SettingsTab: React.FC = () => {
    const [notifications, setNotifications] = useState(() => JSON.parse(localStorage.getItem('bsgroup_notifications') ?? 'true'));
    const [sounds, setSounds] = useState(() => JSON.parse(localStorage.getItem('bsgroup_sounds') ?? 'true'));
    const [publicProfile, setPublicProfile] = useState(() => JSON.parse(localStorage.getItem('bsgroup_publicProfile') ?? 'true'));
    const [doNotDisturb, setDoNotDisturb] = useState(() => JSON.parse(localStorage.getItem('bsgroup_doNotDisturb') ?? 'false'));
    const [activityStatus, setActivityStatus] = useState(() => JSON.parse(localStorage.getItem('bsgroup_activityStatus') ?? 'true'));

    React.useEffect(() => {
        localStorage.setItem('bsgroup_notifications', JSON.stringify(notifications));
        localStorage.setItem('bsgroup_sounds', JSON.stringify(sounds));
        localStorage.setItem('bsgroup_publicProfile', JSON.stringify(publicProfile));
        localStorage.setItem('bsgroup_doNotDisturb', JSON.stringify(doNotDisturb));
        localStorage.setItem('bsgroup_activityStatus', JSON.stringify(activityStatus));
    }, [notifications, sounds, publicProfile, doNotDisturb, activityStatus]);

    return (
        <div className="space-y-6 max-w-3xl mx-auto py-2">
            <div>
                <h3 className="text-lg font-bold text-foreground mb-1 px-1">General Preferences</h3>
                <p className="text-sm text-muted-foreground mb-4 px-1">Manage how the groups app behaves for you.</p>
                <div className="space-y-3">
                    <Toggle 
                        label="Group Notifications" 
                        description="Receive alerts for invites and group messages"
                        icon={Bell} 
                        checked={notifications} 
                        onChange={() => setNotifications(!notifications)} 
                    />
                    <Toggle 
                        label="App Sounds" 
                        description="Play sound effects for interactions"
                        icon={Volume2} 
                        checked={sounds} 
                        onChange={() => setSounds(!sounds)} 
                    />
                    <Toggle 
                        label="Do Not Disturb" 
                        description="Suppress all notifications while active"
                        icon={Shield} 
                        checked={doNotDisturb} 
                        onChange={() => setDoNotDisturb(!doNotDisturb)} 
                    />
                </div>
            </div>

            <div>
                <h3 className="text-lg font-bold text-foreground mb-1 px-1">Privacy & Visibility</h3>
                <p className="text-sm text-muted-foreground mb-4 px-1">Control who can see your activity.</p>
                <div className="space-y-3">
                    <Toggle 
                        label="Public Profile" 
                        description="Allow others to find you in search"
                        icon={Globe} 
                        checked={publicProfile} 
                        onChange={() => setPublicProfile(!publicProfile)} 
                    />
                    <Toggle 
                        label="Share Activity Status" 
                        description="Show when you are online to group members"
                        icon={Activity} 
                        checked={activityStatus} 
                        onChange={() => setActivityStatus(!activityStatus)} 
                    />
                </div>
            </div>
        </div>
    );
};
