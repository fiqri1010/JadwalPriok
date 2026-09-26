import React from 'react';
import { Check, Undo2 } from 'lucide-react';

interface ToastNotificationProps {
    message: string | null;
    lastResetBackupState: { year: number; month: number } | null;
    areAllLocked: boolean;
    onUndoReset: () => void;
}

export const ToastNotification: React.FC<ToastNotificationProps> = ({
    message,
    lastResetBackupState,
    areAllLocked,
    onUndoReset,
}) => {
    if (!message) return null;

    return (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 sm:left-auto sm:right-6 sm:translate-x-0 z-[100001] flex items-center space-x-3 rounded-2xl bg-slate-900 px-4 py-3 text-white shadow-2xl border border-slate-700 animate-in fade-in slide-in-from-top-4 duration-200 max-w-[92vw] sm:max-w-md">
            <Check className="h-5 w-5 text-emerald-400 shrink-0" />
            <span className="text-xs sm:text-sm font-bold">{message}</span>
            {lastResetBackupState !== null && !areAllLocked && (
                <button
                    type="button"
                    onClick={onUndoReset}
                    className="ml-2 rounded-lg bg-amber-500 hover:bg-amber-600 px-2.5 py-1 text-xs font-black text-white transition-colors cursor-pointer shadow-xs flex items-center gap-1 shrink-0"
                >
                    <Undo2 className="h-3 w-3" />
                    <span>Batal</span>
                </button>
            )}
        </div>
    );
};
