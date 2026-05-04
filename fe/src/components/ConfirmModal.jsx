import React from 'react';

const ConfirmModal = ({ isOpen, title, message, onConfirm, onCancel, confirmText = 'Xác nhận', cancelText = 'Hủy bỏ', type = 'warning' }) => {
    if (!isOpen) return null;

    const colors = {
        warning: {
            bg: 'bg-amber-50',
            text: 'text-amber-600',
            border: 'border-amber-100',
            button: 'bg-amber-500 hover:bg-amber-600 shadow-amber-200',
            icon: '⚠️'
        },
        danger: {
            bg: 'bg-rose-50',
            text: 'text-rose-600',
            border: 'border-rose-100',
            button: 'bg-rose-500 hover:bg-rose-600 shadow-rose-200',
            icon: '🗑️'
        },
        info: {
            bg: 'bg-blue-50',
            text: 'text-blue-600',
            border: 'border-blue-100',
            button: 'bg-blue-500 hover:bg-blue-600 shadow-blue-200',
            icon: 'ℹ️'
        }
    };

    const style = colors[type] || colors.warning;

    return (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" onClick={onCancel}></div>
            <div className="relative w-full max-w-sm overflow-hidden rounded-[2rem] bg-white p-8 shadow-2xl animate-fade-in border border-slate-100">
                <div className={`mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl ${style.bg} ${style.text} text-2xl`}>
                    {style.icon}
                </div>
                <div className="text-center">
                    <h3 className="mb-2 text-xl font-black text-slate-900">{title}</h3>
                    <p className="mb-8 text-sm font-medium leading-relaxed text-slate-500">{message}</p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={onCancel}
                        className="flex-1 rounded-2xl bg-slate-50 py-3 text-sm font-bold text-slate-500 transition-all hover:bg-slate-100 active:scale-95"
                    >
                        {cancelText}
                    </button>
                    <button
                        onClick={onConfirm}
                        className={`flex-1 rounded-2xl ${style.button} py-3 text-sm font-bold text-white shadow-lg transition-all hover:-translate-y-0.5 active:scale-95`}
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
            <style>{`
                @keyframes fade-in {
                    from { opacity: 0; transform: scale(0.95) translateY(10px); }
                    to { opacity: 1; transform: scale(1) translateY(0); }
                }
                .animate-fade-in {
                    animation: fade-in 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
                }
            `}</style>
        </div>
    );
};

export default ConfirmModal;
