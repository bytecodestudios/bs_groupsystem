import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNuiEvent } from "../../hooks/useNuiEvent";
import { TaskDisplayProps } from "../../utils/types";
import { fetchNui } from "../../utils/fetchNui";
import { transformParties } from "../../utils/groupUtils";

const TaskDisplay: React.FC = () => {
    const [isVisible, setIsVisible] = useState(false);
    const [data, setData] = useState<TaskDisplayProps>({ title: "", content: "" });
    const [citizenId, setCitizenId] = useState<string | null>(null);
    const citizenIdRef = React.useRef<string | null>(null);

    const updateFromGroupData = (parties: any, currentCitizenId: string | null) => {
        const idToUse = currentCitizenId || citizenIdRef.current;
        if (!idToUse || !parties) {
            setIsVisible(false);
            return;
        }
        
        const transformed = transformParties(parties, idToUse);
        const { myGroup } = transformed;        
        if (myGroup) {
            const taskToShow = myGroup.partyTasks.find(t => t.status === 'current') ||  myGroup.partyTasks.find(t => t.status === 'pending');
            if (taskToShow) {
                setData({ title: myGroup.name, content: taskToShow.title });
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
                setCitizenId(playerData.citizenid);
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
                setCitizenId(playerData.citizenid);
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

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    id="taskdisplay"
                    initial={{ x: 60, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: -60, opacity: 0 }}
                    transition={{ type: "spring", stiffness: 180, damping: 22 }}
                    className="fixed top-[40%] left-6 -translate-y-1/2 w-64 z-[9999] pointer-events-none select-none font-sans"
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