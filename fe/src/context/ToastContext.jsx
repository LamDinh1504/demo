import React, { createContext, useContext, useState, useCallback } from 'react';

const ToastContext = createContext();

export const ToastProvider = ({ children }) => {
    const [toasts, setToasts] = useState([]);

    const addToast = useCallback((message, type = 'info') => {
        const id = Math.random().toString(36).substr(2, 9);
        setToasts(prev => [...prev, { id, message, type }]);
        
        // Auto remove after 5 seconds
        setTimeout(() => {
            setToasts(prev => prev.filter(t => t.id !== id));
        }, 5000);
    }, []);

    const removeToast = useCallback((id) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    }, []);

    return (
        <ToastContext.Provider value={{ addToast }}>
            {children}
            <div className="fixed top-24 right-6 z-[9999] flex flex-col gap-4 pointer-events-none">
                {toasts.map((toast) => (
                    <ToastItem 
                        key={toast.id} 
                        {...toast} 
                        onClose={() => removeToast(toast.id)} 
                    />
                ))}
            </div>
        </ToastContext.Provider>
    );
};

const ToastItem = ({ message, type, onClose }) => {
    const icons = {
        success: '✅',
        error: '❌',
        warning: '⚠️',
        info: 'ℹ️'
    };

    const colors = {
        success: 'border-green-400 bg-green-50/90 text-green-800',
        error: 'border-red-400 bg-red-50/90 text-red-800',
        warning: 'border-yellow-400 bg-yellow-50/90 text-yellow-800',
        info: 'border-blue-400 bg-blue-50/90 text-blue-800'
    };

    return (
        <div 
            className={`pointer-events-auto min-w-[300px] max-w-[450px] p-4 rounded-2xl border-l-4 shadow-2xl backdrop-blur-md flex items-start gap-4 animate-toast-in ${colors[type]}`}
            style={{
                animation: 'toastIn 0.5s cubic-bezier(0.68, -0.55, 0.27, 1.55) forwards'
            }}
        >
            <span className="text-xl">{icons[type]}</span>
            <div className="flex-1">
                <p className="text-sm font-bold leading-tight">{message}</p>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
                ✕
            </button>
            <style>
                {`
                    @keyframes toastIn {
                        from { opacity: 0; transform: translateX(100%) scale(0.9); }
                        to { opacity: 1; transform: translateX(0) scale(1); }
                    }
                `}
            </style>
        </div>
    );
};

export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) throw new Error('useToast must be used within ToastProvider');
    return context;
};
