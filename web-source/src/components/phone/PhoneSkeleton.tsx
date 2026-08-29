import React from 'react';
import { motion } from 'framer-motion';

const Shimmer: React.FC<{ className?: string }> = ({ className = '' }) => (
    <div className={`relative overflow-hidden rounded-2xl bg-white/[0.05] ${className}`}>
        <motion.div
            className="absolute inset-0 -translate-x-full"
            animate={{ translateX: '100%' }}
            transition={{ duration: 1.4, repeat: Infinity, ease: 'linear' }}
            style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.06), transparent)' }}
        />
    </div>
);

export const PhoneSkeleton: React.FC = () => (
    <div className="flex-1 flex flex-col min-h-0">
        <div className="px-5 pt-3 pb-3 space-y-3">
            <Shimmer className="h-8 w-40 rounded-lg" />
            <Shimmer className="h-4 w-56 rounded-md" />
        </div>
        <div className="px-4 space-y-4 flex-1">
            <Shimmer className="h-44 w-full rounded-[22px]" />
            <Shimmer className="h-28 w-full rounded-[22px]" />
            <Shimmer className="h-28 w-full rounded-[22px]" />
        </div>
        <div className="px-3 pt-2 pb-4 border-t border-white/[0.06] flex justify-around">
            {[0, 1, 2].map((i) => (
                <Shimmer key={i} className="h-10 w-14 rounded-xl" />
            ))}
        </div>
    </div>
);
