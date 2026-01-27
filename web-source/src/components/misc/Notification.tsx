import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle2, AlertTriangle, Info, XCircle } from 'lucide-react';

const MotionDiv = motion.div;

export type NotificationType = 'success' | 'warning' | 'info' | 'error';

export interface NotificationItem {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  duration?: number;
}

interface NotificationContextType {
  addNotification: (type: NotificationType, title: string, message: string, duration?: number) => void;
  removeNotification: (id: string) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  const addNotification = useCallback((type: NotificationType, title: string, message: string, duration = 4000) => {
    const id = Math.random().toString(36).substring(7);
    const newNotification = { id, type, title, message, duration };
    
    setNotifications((prev) => [newNotification, ...prev]);

    if (duration > 0) {
      setTimeout(() => {
        setNotifications((prev) => prev.filter((n) => n.id !== id));
      }, duration);
    }
  }, []);

  const removeNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  return (
    <NotificationContext.Provider value={{ addNotification, removeNotification }}>
      {children}
      {/* Global Notification Container - Positioned Top Right */}
      <div className="fixed top-8 right-8 z-[99999] flex flex-col gap-3 w-80 pointer-events-none">
        <AnimatePresence mode="popLayout">
          {notifications.map((notif) => (
            <NotificationToast key={notif.id} notification={notif} />
          ))}
        </AnimatePresence>
      </div>
    </NotificationContext.Provider>
  );
};

const NotificationToast: React.FC<{ notification: NotificationItem }> = ({ notification }) => {
  const config = {
    success: { 
        icon: <CheckCircle2 className="w-5 h-5 text-emerald-500" />,
        titleColor: 'text-emerald-500' 
    },
    warning: { 
        icon: <AlertTriangle className="w-5 h-5 text-amber-500" />,
        titleColor: 'text-amber-500'
    },
    error: { 
        icon: <XCircle className="w-5 h-5 text-red-500" />,
        titleColor: 'text-red-500'
    },
    info: { 
        icon: <Info className="w-5 h-5 text-blue-500" />,
        titleColor: 'text-blue-500'
    },
  };

  const { icon, titleColor } = config[notification.type];

  return (
    <MotionDiv
      layout
      initial={{ opacity: 0, x: 20, scale: 0.95 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 20, scale: 0.95 }}
      transition={{ duration: 0.2 }}
      className="pointer-events-auto bg-[#020610] border border-white/10 rounded-lg shadow-xl p-4 flex items-start gap-3 w-full"
    >
      <div className="shrink-0 mt-0.5">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <h4 className={`text-sm font-bold ${titleColor} mb-0.5 leading-none`}>{notification.title}</h4>
        <p className="text-sm text-gray-300 leading-snug">{notification.message}</p>
      </div>
    </MotionDiv>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

// Deprecated container for backward compatibility if needed, but the new one is built into Provider
export const NotificationLaptopContainer: React.FC = () => null;
