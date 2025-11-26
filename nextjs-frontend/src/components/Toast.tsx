'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

type ToastProps = {
    message: string;
    type?: 'error' | 'success';
    top?: number;          // 画面上からのオフセット(px)
    duration?: number;     // 自動で消えるまでのミリ秒。0なら自動で消えない
    onClose?: () => void;  // 手動クローズ用
};

export default function Toast({
    message,
    type = 'error',
    top = 16,
    duration = 3000,
    onClose,
}: ToastProps) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        if (duration > 0) {
            const t = setTimeout(() => onClose?.(), duration);
            return () => clearTimeout(t);
        }
    }, [duration, onClose]);

    if (!mounted) return null;

    return createPortal(
        <div
            role="status"
            aria-live="polite"
            style={{
                position: 'fixed',
                left: '50%',
                top,
                transform: 'translateX(-50%)',
                zIndex: 10000,
                maxWidth: 'min(90vw, 560px)',
                padding: '10px 14px',
                borderRadius: 8,
                color: '#fff',
                background: type === 'error' ? '#7f1d1d' : '#065f46',
                boxShadow: '0 6px 18px rgba(0,0,0,.25)',
                pointerEvents: 'auto',
                opacity: 0.98,
                backdropFilter: 'blur(6px)',
            }}
            onClick={onClose}
            title="クリックで閉じる"
        >
            {message}
        </div>,
        document.body
    );
}
