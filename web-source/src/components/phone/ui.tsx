import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft } from 'lucide-react';

/**
 * iOS-flavoured primitives for the phone front-end. Kept intentionally separate
 * from the laptop (`components/group`) look: large rounded surfaces, hairline
 * separators, blur, spring motion and a system font stack for a native feel.
 */

// System font stack so text renders like a stock iOS app inside the phone host.
export const IOS_FONT =
    '-apple-system, BlinkMacSystemFont, "SF Pro Text", "SF Pro Display", "Segoe UI", Roboto, sans-serif';

export const springSoft = { type: 'spring' as const, stiffness: 380, damping: 34 };

// Large iOS navigation header with an optional back button and trailing slot.
export const NavBar: React.FC<{
    title: string;
    subtitle?: string;
    onBack?: () => void;
    backLabel?: string;
    trailing?: React.ReactNode;
}> = ({ title, subtitle, onBack, backLabel, trailing }) => (
    <div className="flex-shrink-0 px-5 pt-3 pb-2">
        {onBack && (
            <button
                onClick={onBack}
                className="flex items-center -ml-1 mb-3 text-[15px] font-medium text-emerald-400 active:opacity-60 transition-opacity"
            >
                <ChevronLeft className="w-5 h-5 -ml-1" />
                <span>{backLabel ?? 'Back'}</span>
            </button>
        )}
        <div className="flex items-end justify-between gap-3">
            <div className="min-w-0">
                <h1 className="text-[26px] leading-tight font-bold tracking-tight text-white truncate">{title}</h1>
                {subtitle && <p className="text-[13px] text-white/45 mt-0.5 truncate">{subtitle}</p>}
            </div>
            {trailing && <div className="flex-shrink-0 pb-1.5">{trailing}</div>}
        </div>
    </div>
);

// Inset "grouped table" container, the classic iOS Settings list surface.
export const Card: React.FC<{ className?: string; children: React.ReactNode; onClick?: () => void }> = ({
    className = '',
    children,
    onClick,
}) => (
    <div
        onClick={onClick}
        className={`rounded-[18px] bg-white/[0.05] border border-white/[0.07] ${
            onClick ? 'active:scale-[0.985] transition-transform cursor-pointer' : ''
        } ${className}`}
    >
        {children}
    </div>
);

// A row inside a grouped list, with hairline separators between siblings.
export const Row: React.FC<{
    children: React.ReactNode;
    className?: string;
    onClick?: () => void;
    first?: boolean;
}> = ({ children, className = '', onClick, first }) => (
    <div
        onClick={onClick}
        className={`flex items-center gap-3 px-4 py-3 ${!first ? 'border-t border-white/[0.06]' : ''} ${
            onClick ? 'active:bg-white/[0.04] transition-colors cursor-pointer' : ''
        } ${className}`}
    >
        {children}
    </div>
);

// Circular monogram avatar with an online dot option.
export const Avatar: React.FC<{
    name: string;
    size?: number;
    online?: boolean;
    className?: string;
}> = ({ name, size = 40, online, className = '' }) => (
    <div className="relative flex-shrink-0" style={{ width: size, height: size }}>
        <div
            className={`w-full h-full rounded-full flex items-center justify-center font-semibold text-white bg-gradient-to-br from-white/25 to-white/5 border border-white/10 ${className}`}
            style={{ fontSize: size * 0.4 }}
        >
            {name.charAt(0).toUpperCase()}
        </div>
        {online !== undefined && (
            <span
                className={`absolute bottom-0 right-0 block rounded-full border-2 border-[#0a0e14] ${
                    online ? 'bg-emerald-400' : 'bg-white/25'
                }`}
                style={{ width: size * 0.3, height: size * 0.3 }}
            />
        )}
    </div>
);

// Pill segmented control (iOS style).
export function Segmented<T extends string>({
    options,
    value,
    onChange,
}: {
    options: { id: T; label: string }[];
    value: T;
    onChange: (v: T) => void;
}) {
    return (
        <div className="flex items-center gap-0.5 p-1 rounded-full bg-white/[0.06] border border-white/[0.06]">
            {options.map((opt) => (
                <button
                    key={opt.id}
                    onClick={() => onChange(opt.id)}
                    className={`relative flex-1 h-8 flex items-center justify-center px-2 text-[13px] font-semibold leading-none rounded-full whitespace-nowrap transition-colors ${
                        value === opt.id ? 'text-black' : 'text-white/50'
                    }`}
                >
                    {value === opt.id && (
                        <motion.div
                            layoutId="ios-segment"
                            className="absolute inset-0 bg-white rounded-full"
                            transition={springSoft}
                        />
                    )}
                    <span className="relative z-10">{opt.label}</span>
                </button>
            ))}
        </div>
    );
}

// iOS toggle switch.
export const Switch: React.FC<{ checked: boolean; onChange: () => void; disabled?: boolean }> = ({
    checked,
    onChange,
    disabled,
}) => (
    <button
        onClick={disabled ? undefined : onChange}
        disabled={disabled}
        className={`w-[51px] h-[31px] rounded-full p-0.5 flex-shrink-0 transition-colors duration-300 ${
            checked ? 'bg-emerald-500' : 'bg-white/15'
        } ${disabled ? 'opacity-40' : ''}`}
    >
        <motion.div
            className="w-[27px] h-[27px] bg-white rounded-full"
            animate={{ x: checked ? 20 : 0 }}
            transition={{ type: 'spring', stiffness: 500, damping: 32 }}
        />
    </button>
);

// Full-height primary action button.
export const BigButton: React.FC<{
    children: React.ReactNode;
    onClick?: () => void;
    disabled?: boolean;
    variant?: 'primary' | 'neutral' | 'danger';
    className?: string;
    type?: 'button' | 'submit';
}> = ({ children, onClick, disabled, variant = 'primary', className = '', type = 'button' }) => {
    const styles: Record<string, string> = {
        primary: 'bg-emerald-500 text-black active:bg-emerald-400',
        neutral: 'bg-white/[0.08] text-white active:bg-white/[0.14]',
        danger: 'bg-red-500 text-white active:bg-red-400',
    };
    return (
        <button
            type={type}
            onClick={onClick}
            disabled={disabled}
            className={`w-full py-3 rounded-xl text-[15px] font-semibold transition-all active:scale-[0.98] disabled:opacity-40 disabled:active:scale-100 ${styles[variant]} ${className}`}
        >
            {children}
        </button>
    );
};

// Bottom sheet that slides up from the bottom, iOS modal-card style.
export const Sheet: React.FC<{ children: React.ReactNode; onClose: () => void }> = ({ children, onClose }) => (
    <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 z-50 flex items-end justify-center bg-black/60"
    >
        <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', stiffness: 420, damping: 40 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-h-[92%] flex flex-col rounded-t-[28px] bg-[#12161d] border-t border-white/10 overflow-hidden"
        >
            <div className="flex-shrink-0 flex justify-center pt-2.5 pb-1">
                <div className="w-9 h-1 rounded-full bg-white/20" />
            </div>
            {children}
        </motion.div>
    </motion.div>
);

// Screen transition wrapper for pushing/popping detail views.
export const Screen: React.FC<{ children: React.ReactNode; keyId: string }> = ({ children, keyId }) => (
    <AnimatePresence mode="wait">
        <motion.div
            key={keyId}
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -24 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
            className="h-full flex flex-col min-h-0"
        >
            {children}
        </motion.div>
    </AnimatePresence>
);
