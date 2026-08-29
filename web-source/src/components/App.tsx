import React, { useEffect, useState } from 'react';
import Groups from './group/Groups';
import PhoneApp from './phone/PhoneApp';
import { motion, AnimatePresence } from "framer-motion"
import { X } from 'lucide-react';
import { fetchNui } from '../utils/fetchNui';
import { useNuiEvent } from '../hooks/useNuiEvent';
import { TaskWidget } from './misc/TaskWidget';
import { useNotifications } from './misc/Notification';
import { useLocale } from '../hooks/useLocale';
import { isPhoneEnv } from '../utils/phone';

function App() {
  // Inside a phone the app is shown the moment its host opens it, and it has no
  // window chrome of its own (the phone frames it). Phone hosts may inject their
  // helpers slightly after first render, so also re-check on `componentsLoaded`.
  const [phoneMode, setPhoneMode] = useState(isPhoneEnv());
  const [visible, setVisible] = useState(phoneMode);
  const [devAppMode, setDevAppMode] = useState(!(window as any).GetParentResourceName);
  const appMode = phoneMode || (import.meta.env.MODE === "development" ? devAppMode : !(window as any).GetParentResourceName);
  const { addNotification } = useNotifications();
  const { t } = useLocale();

  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      if (event.data === 'componentsLoaded' && isPhoneEnv()) {
        setPhoneMode(true);
        setVisible(true);
      }
    };
    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, []);

  useNuiEvent('setVisible', (data: boolean) => {
    setVisible(data);
  });

  useNuiEvent('notification', (data: { type: any, title: string, message: string }) => {
    addNotification(data.type, data.title, data.message);
  });

  const closeUI = async () => {
    setVisible(false);
    await fetchNui<any>("bsgroup:nui:closeUI", {});
  }

    return (
    <motion.div className="h-full w-full antialiased relative overflow-hidden">
        {/* Task Widget — an always-on HUD that belongs to the standalone game
            overlay. Inside a phone the app is framed by the host and tasks are
            shown in the phone UI itself, so don't render the floating HUD there. */}
        {!phoneMode && <TaskWidget />}

        {/* Groups */}
        <AnimatePresence>
          {visible && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className={`absolute inset-0 bg-card flex flex-col z-20 ${appMode ? '' : 'rounded-2xl shadow-2xl m-5'}`}
            >
              {!appMode && (
                <div className="h-10 bg-card border-b rounded-t-2xl border-border flex items-center justify-between px-4 flex-shrink-0">
                  <div className="flex items-center space-x-3">
                    <div onClick={() => closeUI()} className="w-4 h-4 bg-gradient-to-br from-red-500 to-red-500 rounded-full">
                      <X className="w-4 h-4 text-transparent hover:text-black cursor-pointer" />
                    </div>
                    <div className="w-4 h-4 bg-gradient-to-br from-yellow-500 to-yellow-500 rounded-full" />
                    <div className="w-4 h-4 bg-gradient-to-br from-emerald-500 to-green-500 rounded-full" />
                    <span className="text-md font-medium text-white">{t('ui.app.title')}</span>
                  </div>
                </div>
              )}

              {/* Phone hosts get the dedicated iOS-style app; the laptop/computer
                  keeps the original desktop Groups layout. */}
              <div className="flex-grow min-h-0">
                {phoneMode ? <PhoneApp /> : <Groups />}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Dev Mode Toolbar */}
        {import.meta.env.MODE === "development" && (
          <div className="absolute bottom-4 right-4 flex flex-col space-y-2 z-50 bg-black/80 p-2 rounded-lg backdrop-blur-md text-white text-xs">
            <div className="flex space-x-2">
              <button
                onClick={() => { setPhoneMode(false); setVisible(false); }}
                className={`px-3 py-1 rounded ${!phoneMode && !visible ? 'bg-blue-500' : 'bg-gray-700 hover:bg-gray-600'}`}
              >
                Task View
              </button>
              <button
                onClick={() => { setPhoneMode(false); setVisible(true); }}
                className={`px-3 py-1 rounded ${!phoneMode && visible ? 'bg-blue-500' : 'bg-gray-700 hover:bg-gray-600'}`}
              >
                Laptop UI
              </button>
              <button
                onClick={() => { setPhoneMode(true); setVisible(true); }}
                className={`px-3 py-1 rounded ${phoneMode && visible ? 'bg-blue-500' : 'bg-gray-700 hover:bg-gray-600'}`}
              >
                Phone UI
              </button>
            </div>
            {!phoneMode && visible && (
              <div className="flex space-x-2">
                <button
                  onClick={() => setDevAppMode(false)}
                  className={`px-3 py-1 rounded flex-1 ${!devAppMode ? 'bg-blue-500' : 'bg-gray-700 hover:bg-gray-600'}`}
                >
                  Show Window Chrome
                </button>
                <button
                  onClick={() => setDevAppMode(true)}
                  className={`px-3 py-1 rounded flex-1 ${devAppMode ? 'bg-blue-500' : 'bg-gray-700 hover:bg-gray-600'}`}
                >
                  Hide Window Chrome
                </button>
              </div>
            )}
          </div>
        )}
    </motion.div>
  );
}

export default App;