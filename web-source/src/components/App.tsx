import React, { useState } from 'react';
import Groups from './group/Groups';
import { motion, AnimatePresence } from "framer-motion"
import { X } from 'lucide-react';
import { NotificationProvider } from './misc/Notification';
import { fetchNui } from '../utils/fetchNui';
import { useNuiEvent } from '../hooks/useNuiEvent';
import { TaskWidget } from './misc/TaskWidget';

function App() {
  const [visible, setVisible] = useState(false);

  useNuiEvent('setVisible', (data: boolean) => {
    setVisible(data);
  });

  const closeUI = async () => {
    setVisible(false);
    await fetchNui<any>("bsgroup:nui:closeUI", {});
  }

  return (
    <motion.div className="h-screen w-screen antialiased relative">
      <NotificationProvider>
        {/* Task Widget */}
        <TaskWidget />

        {/* Groups */}
        <AnimatePresence>
          {visible && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="absolute inset-0 bg-card rounded-2xl shadow-2xl flex flex-col z-20 m-5"
            >
              <div className="h-10 bg-card border-b rounded-t-2xl border-border flex items-center justify-between px-4 flex-shrink-0">
                <div className="flex items-center space-x-3">
                  <div onClick={() => closeUI()} className="w-4 h-4 bg-gradient-to-br from-red-500 to-red-500 rounded-full">
                    <X className="w-4 h-4 text-transparent hover:text-black cursor-pointer" />
                  </div>
                  <div className="w-4 h-4 bg-gradient-to-br from-yellow-500 to-yellow-500 rounded-full" />
                  <div className="w-4 h-4 bg-gradient-to-br from-emerald-500 to-green-500 rounded-full" />
                  <span className="text-md font-medium text-white">Groups</span>
                </div>
              </div>

              <div className="flex-grow min-h-0">
                <Groups />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </NotificationProvider>
    </motion.div>
  );
}

export default App;