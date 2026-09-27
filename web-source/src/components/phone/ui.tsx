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
                className="flex items-center -ml-1 mb-3 text-[15px] font-medium text-emerald-400 hover:text-emerald-300 active:opacity-60 transition-colors"
            >
                <ChevronLeft className="w-5 h-5 -ml-1" />
                <span>{backLabel ?? 'Back'}</span>
            </button>
        )}
        <div className="flex items-end justify-between gap-3">
            <div className="min-w-0">
                <h1 className="text-[26px] leading-tight font-bold tracking-tight text-foreground truncate">{title}</h1>
                {subtitle && <p className="text-[13px] text-muted-foreground mt-0.5 truncate">{subtitle}</p>}
            </div>
            {trailing && <div className="flex-shrink-0 pb-1.5">{trailing}</div>}
        </div>
    </div>
);

// Inset "grouped table" container, styled according to the laptop theme surfaces.
export const Card: React.FC<{ className?: string; children: React.ReactNode; onClick?: () => void }> = ({
    className = '',
    children,
    onClick,
}) => (
    <div
        onClick={onClick}
        className={`rounded-[18px] bg-secondary/35 border border-border/60 ${
            onClick ? 'active:scale-[0.985] active:border-emerald-500/40 transition-all cursor-pointer' : ''
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
        className={`flex items-center gap-3 px-4 py-3 ${!first ? 'border-t border-border/40' : ''} ${
            onClick ? 'active:bg-secondary/40 transition-colors cursor-pointer' : ''
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
            className={`w-full h-full rounded-full flex items-center justify-center font-bold text-foreground bg-muted border border-border ${className}`}
            style={{ fontSize: size * 0.4 }}
        >
            {name.charAt(0).toUpperCase()}
        </div>
        {online !== undefined && (
            <span
                className={`absolute bottom-0 right-0 block rounded-full border-2 border-card ${
                    online ? 'bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.7)]' : 'bg-muted-foreground/40'
                }`}
                style={{ width: size * 0.3, height: size * 0.3 }}
            />
        )}
    </div>
);

// Pill segmented control matching laptop theme's secondary tabs.
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
        <div className="flex items-center gap-0.5 p-1 rounded-full bg-secondary/40 border border-border/50">
            {options.map((opt) => (
                <button
                    key={opt.id}
                    onClick={() => onChange(opt.id)}
                    className={`relative flex-1 h-8 flex items-center justify-center px-2 text-[13px] font-semibold leading-none rounded-full whitespace-nowrap transition-colors ${
                        value === opt.id ? 'text-foreground font-bold' : 'text-muted-foreground hover:text-foreground'
                    }`}
                >
                    {value === opt.id && (
                        <motion.div
                            layoutId="ios-segment"
                            className="absolute inset-0 bg-secondary rounded-full border border-border/60 shadow-sm"
                            transition={springSoft}
                        />
                    )}
                    <span className="relative z-10">{opt.label}</span>
                </button>
            ))}
        </div>
    );
}

// iOS toggle switch aligned with laptop colors.
export const Switch: React.FC<{ checked: boolean; onChange: () => void; disabled?: boolean; activeClass?: string }> = ({
    checked,
    onChange,
    disabled,
    activeClass = 'bg-emerald-500',
}) => (
    <button
        onClick={disabled ? undefined : onChange}
        disabled={disabled}
        className={`w-[51px] h-[31px] rounded-full p-0.5 flex-shrink-0 transition-colors duration-300 ${
            checked ? activeClass : 'bg-muted border border-border/50'
        } ${disabled ? 'opacity-40' : ''}`}
    >
        <motion.div
            className="w-[27px] h-[27px] bg-white rounded-full shadow-md"
            animate={{ x: checked ? 20 : 0 }}
            transition={{ type: 'spring', stiffness: 500, damping: 32 }}
        />
    </button>
);

// Full-height primary action button matching laptop UI emerald gradients.
export const BigButton: React.FC<{
    children: React.ReactNode;
    onClick?: () => void;
    disabled?: boolean;
    variant?: 'primary' | 'neutral' | 'danger';
    className?: string;
    type?: 'button' | 'submit';
}> = ({ children, onClick, disabled, variant = 'primary', className = '', type = 'button' }) => {
    const styles: Record<string, string> = {
        primary: 'bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white font-bold shadow-lg shadow-emerald-500/20 active:opacity-90',
        neutral: 'bg-secondary hover:bg-muted text-foreground border border-border active:bg-secondary/70 font-semibold',
        danger: 'bg-red-600 hover:bg-red-500 text-white font-bold shadow-lg shadow-red-500/20 active:bg-red-700',
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

// Bottom sheet styled to match the dark phone theme.
export const Sheet: React.FC<{ children: React.ReactNode; onClose: () => void }> = ({ children, onClose }) => (
    <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 z-50 flex items-end justify-center bg-black/70"
    >
        <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', stiffness: 420, damping: 40 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-h-[92%] flex flex-col rounded-t-[28px] bg-background border-t border-border/80 shadow-2xl overflow-hidden relative"
        >
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-8 bg-emerald-500/10 blur-xl pointer-events-none" />
            <div className="flex-shrink-0 flex justify-center pt-2.5 pb-1 relative z-10">
                <div className="w-9 h-1 rounded-full bg-muted-foreground/30" />
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
