import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNuiEvent } from "../../hooks/useNuiEvent";
import { TaskDisplayProps } from "../../utils/types";

const TaskDisplay: React.FC = () => {
    const [isVisible, setIsVisible] = useState(false);
    const [data, setData] = useState<TaskDisplayProps>({ title: "", content: "" });

    useNuiEvent<TaskDisplayProps>('showTask', (newData) => {
        setData(newData);
        setIsVisible(true);
    });

    useNuiEvent('hideTask', () => {
        setIsVisible(false);
    });

    // Mock for development: Cycle through tasks to demonstrate fluid transitions
    useEffect(() => {
        const timer1 = setTimeout(() => {
            setData({ title: "HEIST PREP", content: "Locate the security access panel." });
            setIsVisible(true);
        }, 1000);

        const timer2 = setTimeout(() => {
            setData({ title: "HEIST PREP", content: "Hack the terminal.\nProgress: 45%" });
        }, 4000);

        const timer3 = setTimeout(() => {
             setData({ title: "HEIST PREP", content: "Acquire thermal charges.\n(1/4)" });
        }, 7000);

        return () => {
            clearTimeout(timer1);
            clearTimeout(timer2);
            clearTimeout(timer3);
        };
    }, []);

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    id="taskdisplay"
                    initial={{ x: 60, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: -60, opacity: 0 }}
                    transition={{ type: "spring", stiffness: 180, damping: 22 }}
                    className="fixed top-[40%] left-6 -translate-y-1/2 w-64 z-50 pointer-events-none select-none font-sans"
                >
                    <div className="flex flex-col items-start">
                        {/* Title - Moves from right to left */}
                        <AnimatePresence mode="wait">
                            <motion.h2 
                                key={data.title}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.25, ease: "easeOut" }}
                                className="font-display font-black text-lg text-blue-400 uppercase tracking-wider leading-none"
                                style={{ 
                                    textShadow: '0 2px 4px rgba(0,0,0,0.8), 0 0 15px rgba(59, 130, 246, 0.4)' 
                                }}
                            >
                                {data.title}
                            </motion.h2>
                        </AnimatePresence>

                        {/* Thin Separator Line - Switched to blue gradient */}
                        <motion.div 
                            initial={{ width: 0, opacity: 0 }}
                            animate={{ width: "100%", opacity: 1 }}
                            className="h-[1px] bg-gradient-to-r from-blue-500 to-transparent my-1 shadow-sm"
                        />

                        {/* Content Body - Moves from right to left */}
                        <div className="pl-0.5">
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={data.content}
                                    initial={{ opacity: 0, x: 30 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -30 }}
                                    transition={{ duration: 0.35, ease: "easeOut" }}
                                    className="text-sm font-bold text-white leading-tight whitespace-pre-wrap"
                                    style={{ 
                                        textShadow: '0 1px 2px rgba(0,0,0,0.9), 0 0 8px rgba(0,0,0,0.5)' 
                                    }}
                                >
                                    {data.content}
                                </motion.div>
                            </AnimatePresence>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}

export default TaskDisplay;