import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Hash, BarChart3 } from 'lucide-react';
import { GroupTask } from '../../utils/types';
import { useNuiEvent } from "../../hooks/useNuiEvent";
import { fetchNui } from "../../utils/fetchNui";
import { transformParties } from "../../utils/groupUtils";
import { useLocale } from "../../hooks/useLocale";

interface TaskWidgetProps {}

export const TaskWidget: React.FC<TaskWidgetProps> = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [tasks, setTasks] = useState<GroupTask[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const citizenIdRef = useRef<string | null>(null);
  const { t } = useLocale();

  const updateFromGroupData = (parties: any, currentCitizenId: string | null) => {
      const idToUse = currentCitizenId || citizenIdRef.current;
      if (!idToUse || !parties) {
          setIsVisible(false);
          return;
      }
      
      const transformed = transformParties(parties, idToUse);
      const { myGroup } = transformed;        
      
      if (myGroup && myGroup.partyTasks.length > 0) {
        // Find the "current" task or the first "pending" task
        const currentTaskIndex = myGroup.partyTasks.findIndex(t => t.status === 'current');
        const firstPendingIndex = myGroup.partyTasks.findIndex(t => t.status === 'pending');
        
        let newActiveIndex = -1;

        if (currentTaskIndex !== -1) {
            newActiveIndex = currentTaskIndex;
        } else if (firstPendingIndex !== -1) {
            newActiveIndex = firstPendingIndex;
        } else if (myGroup.partyTasks.every(t => t.completed)) {
             // All tasks are done
             newActiveIndex = myGroup.partyTasks.length;
        }

        // Only show if we have a valid index or all are done
        if (newActiveIndex !== -1) {
            setTasks(myGroup.partyTasks);
            setActiveIndex(newActiveIndex);
            setIsVisible(true);
            return;
        }
      }
      
      setIsVisible(false);
  };

  // Get initial player data
  useEffect(() => {
    const loadPlayerData = async () => {
        const playerData = await fetchNui<{ citizenid: string }>("bsgroup:nui:getPlayerData", {});
        if (playerData?.citizenid) {
            citizenIdRef.current = playerData.citizenid;
            
            // Initial fetch
            const response = await fetchNui<{ status: boolean, data: any }>("bsgroup:nui:fetchParties", {});
            if (response?.status) {
                updateFromGroupData(response.data.parties, playerData.citizenid);
            }
        }
    };

    loadPlayerData();
  }, []);

  const ensureCitizenId = async () => {
      if (!citizenIdRef.current) {
          const playerData = await fetchNui<{ citizenid: string }>("bsgroup:nui:getPlayerData", {});
          if (playerData?.citizenid) {
              citizenIdRef.current = playerData.citizenid;
              return playerData.citizenid;
          }
      }
      return citizenIdRef.current;
  };

  useNuiEvent<any>('refreshParties', async (response) => {
      const id = await ensureCitizenId();
      updateFromGroupData(response.data, id);
  });

  useNuiEvent<any>('refreshTasksDetail', async (response) => {
      const id = await ensureCitizenId();
      updateFromGroupData(response.data, id);
  });

  useNuiEvent<any>('backToParties', async (response) => {
      const id = await ensureCitizenId();
      updateFromGroupData(response.data, id);
  });

  if (!isVisible) return null;
  
  // Calculate dynamic spacing based on active task content
  const activeTask = tasks[activeIndex];
  let extraHeight = 0;
  
  if (activeTask && !activeTask.completed) {
    // Estimate text height for wrapping
    // Assuming approx 22 chars per line for the given width (160px) and font size (text-sm)
    const charsPerLine = 22; 
    const estimatedLines = Math.ceil(activeTask.title.length / charsPerLine);
    // Limit to reasonable max for visual sanity
    const lines = Math.max(1, Math.min(estimatedLines, 10));
    
    // Base height for single line is covered by the default 36px offset. 
    // We add spacing for extra lines. Approx 18px per extra line.
    if (lines > 1) {
      extraHeight += (lines - 1) * 18;
    }
  }

  return (
    <AnimatePresence>
    {isVisible && (
    <motion.div 
      initial={{ x: -40, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: -40, opacity: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="fixed left-0 top-0 h-full w-full max-w-[16rem] pointer-events-none flex flex-col justify-center pl-5 md:pl-10 z-10"
    >
      {/* Widget Container */}
      <div className="relative pointer-events-auto">
        
        {/* Header / Title Line */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-4 pl-[9px]"
        >
          <div className="flex items-center gap-2 mb-1">
            <div className="w-1.5 h-1.5 bg-blue-400 rounded-full"></div>
            <h2 
              className="text-xs font-bold tracking-[0.2em] text-blue-400 uppercase"
              style={{ textShadow: '0px 1px 4px rgba(0,0,0,0.95), 0px 0px 6px rgba(0,0,0,0.95)' }}
            >
              {t('ui.task_widget.available_tasks')}
            </h2>
          </div>
          {/* Increased width from w-8 to w-24 */}
          <div className="h-[1px] w-28 bg-gradient-to-r from-blue-500 to-transparent"></div>
        </motion.div>

        {/* Task List Container */}
        <div className="relative h-[180px] w-full perspective-[1000px]">
          <AnimatePresence initial={false}>
            {tasks.map((task, i) => {
              const offset = i - activeIndex;
              
              // Only render: 1 Done (-1), Active (0), 1 Pending (1)
              if (offset < -1 || offset > 1) return null;

              const isActive = offset === 0;
              const isDone = offset < 0;
              
              // Calculate dynamic styles based on position
              let yPos = 0;
              let opacity = 1;

              if (offset === -1) { // Done (Above)
                yPos = -42;
                opacity = 0.85;
              } else if (offset === 0) { // Active
                yPos = 0;
                opacity = 1;
              } else if (offset === 1) { // Next
                yPos = 42 + extraHeight; // Push down by extra content height
                opacity = 0.85;
              }

              return (
                <motion.div
                  key={task.id}
                  layoutId={String(task.id)}
                  initial={{ opacity: 0, y: yPos + 20 }}
                  animate={{
                    y: yPos,
                    x: 0,
                    scale: 1,
                    opacity: opacity,
                    zIndex: 50 - Math.abs(offset),
                  }}
                  exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.3 } }}
                  transition={{
                    type: "spring",
                    stiffness: 180, // Lower stiffness for more fluid motion
                    damping: 24,    // Lower damping for smoother settling
                    mass: 1
                  }}
                  className="absolute top-[60px] left-0 w-full flex items-center gap-4 origin-left will-change-transform"
                >
                  {/* Status Indicator Container */}
                  <div className="relative w-6 h-6 shrink-0 flex items-center justify-center">
                    
                    {/* Vertical connecting line logic - only connect if next one is visible (offset < 1) */}
                    {offset < 1 && i < tasks.length - 1 && (
                       <motion.div 
                         initial={{ height: 0 }}
                         animate={{ height: 18 + (isActive ? extraHeight : 0) }}
                         className="absolute top-full left-1/2 -translate-x-1/2 w-[1px] bg-slate-300/60 -z-10" 
                       />
                    )}

                    {/* Icon Switching Logic */}
                    <AnimatePresence mode="popLayout">
                        {isDone ? (
                            <motion.div 
                                key="done"
                                initial={{ scale: 0, rotate: -45 }}
                                animate={{ scale: 1, rotate: 0 }}
                                exit={{ scale: 0 }}
                                className="text-emerald-400"
                                style={{ filter: 'drop-shadow(0px 1px 3px rgba(0,0,0,0.9))' }}
                            >
                                <Check size={18} strokeWidth={3} />
                            </motion.div>
                        ) : isActive ? (
                            <motion.div 
                                key="active"
                                layoutId="activeRing"
                                className="relative w-full h-full flex items-center justify-center"
                            >
                                {/* Rotating Gradient Ring */}
                                <motion.svg 
                                    viewBox="0 0 24 24" 
                                    className="w-[140%] h-[140%] absolute"
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                                >
                                    <defs>
                                        <linearGradient id="activeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                            <stop offset="0%" stopColor="#3b82f6" stopOpacity="0" />
                                            <stop offset="50%" stopColor="#60a5fa" stopOpacity="0.8" />
                                            <stop offset="100%" stopColor="#93c5fd" stopOpacity="1" />
                                        </linearGradient>
                                    </defs>
                                    <circle cx="12" cy="12" r="10" stroke="url(#activeGradient)" strokeWidth="2" fill="none" strokeLinecap="round" />
                                </motion.svg>

                                {/* Inner Core */}
                                <div className="w-1.5 h-1.5 bg-white rounded-full z-10" />
                            </motion.div>
                        ) : (
                            <motion.div 
                                key="pending"
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 0.95, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.8 }}
                                transition={{ duration: 0.4 }}
                                className="text-slate-100"
                            >
                                {/* Differentiate Pending Icons based on type */}
                                {task.type === 'numerical' ? (
                                    <div><Hash size={14} /></div>
                                ) : task.type === 'numerical-progress' ? (
                                    <div><BarChart3 size={14} /></div>
                                ) : (
                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeDasharray="4 4" className="rotate-45">
                                      <circle cx="12" cy="12" r="10" />
                                    </svg>
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>
                  </div>

                  {/* Task Content */}
                  <motion.div 
                    layout 
                    className={`flex flex-col transition-colors duration-500 ${
                      isActive 
                        ? 'text-white font-bold' 
                        : isDone 
                        ? 'text-emerald-300 font-semibold line-through decoration-emerald-400' 
                        : 'text-slate-100 font-semibold'
                    }`}
                  >
                    <span 
                      className={`tracking-tight max-w-[200px] block ${
                        isActive 
                          ? 'text-base font-bold text-white leading-tight' 
                          : 'text-xs font-semibold truncate'
                      }`}
                      style={{ textShadow: '0px 1px 3px rgba(0,0,0,0.95), 0px 0px 5px rgba(0,0,0,0.95)' }}
                    >
                      {task.title}
                    </span>
                  </motion.div>
                </motion.div>
              );
            })}
          </AnimatePresence>
          
          {/* Completed State Message */}
          {tasks.length > 0 && activeIndex >= tasks.length && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="absolute top-[60px] left-5 text-emerald-400 flex items-center gap-1.5"
              >
                <Check size={16} />
                <span className="font-semibold text-xs">{t('ui.task_widget.all_completed')}</span>
              </motion.div>
          )}

           {tasks.length === 0 && (
              <div className="absolute top-[60px] left-0 text-slate-600 italic text-xs pl-2">
                {t('ui.task_widget.no_active_tasks')}
              </div>
          )}
        </div>
      </div>
    </motion.div>
    )}
    </AnimatePresence>
  );
};
