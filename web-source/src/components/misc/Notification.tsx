import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle2, AlertTriangle, Info, XCircle } from 'lucide-react';
import { isPhoneEnv } from '../../utils/phone';
import { fetchNui } from '../../utils/fetchNui';

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
  const phoneMode = isPhoneEnv();

  const addNotification = useCallback((type: NotificationType, title: string, message: string, duration = 4000) => {
    // If running in a phone host (sd-phone / lb-phone), trigger the phone's native iOS-style banner
    const phoneNotify = (window as any).SendNotification || (window as any).sendNotification;
    if (typeof phoneNotify === 'function') {
      try {
        phoneNotify({
          title,
          content: message,
        });
        return;
      } catch (err) {
        console.error('[Notification] Phone notification call failed:', err);
      }
    }

    if (phoneMode) {
      // In phone mode without direct SendNotification on window, route via NUI to client Apps.notify
      fetchNui('bsgroup:nui:notify', { title, message, type });
      return;
    }

    const id = Math.random().toString(36).substring(7);
    const newNotification = { id, type, title, message, duration };
    
    setNotifications((prev) => [newNotification, ...prev]);

    if (duration > 0) {
      setTimeout(() => {
        setNotifications((prev) => prev.filter((n) => n.id !== id));
      }, duration);
    }
  }, [phoneMode]);

  const removeNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  return (
    <NotificationContext.Provider value={{ addNotification, removeNotification }}>
      {children}
      {/* Global Notification Container: only displayed on non-phone hosts (laptop/standalone) */}
      {!phoneMode && (
        <div className="fixed top-8 right-8 z-[99999] flex flex-col gap-3 w-80 pointer-events-none">
          <AnimatePresence mode="popLayout">
            {notifications.map((notif) => (
              <NotificationToast key={notif.id} notification={notif} phoneMode={false} />
            ))}
          </AnimatePresence>
        </div>
      )}
    </NotificationContext.Provider>
  );
};

const NotificationToast: React.FC<{ notification: NotificationItem; phoneMode?: boolean }> = ({ notification, phoneMode }) => {
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
      initial={phoneMode ? { opacity: 0, y: -16, scale: 0.98 } : { opacity: 0, x: 20, scale: 0.95 }}
      animate={{ opacity: 1, x: 0, y: 0, scale: 1 }}
      exit={phoneMode ? { opacity: 0, y: -16, scale: 0.98 } : { opacity: 0, x: 20, scale: 0.95 }}
      transition={{ duration: 0.2 }}
      className={`pointer-events-auto bg-[#020610] border border-white/10 shadow-xl flex items-start gap-3 w-full ${
        phoneMode ? 'rounded-xl p-3' : 'rounded-lg p-4'
      }`}
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
