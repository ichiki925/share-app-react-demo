'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AuthHeader from '@/components/AuthHeader';
import { useFirebaseAuth } from '@/hooks/useFirebaseAuth';
import { getAuth } from 'firebase/auth';

const LoginForm: React.FC = () => {
    const router = useRouter();
    const { login, isLoggedIn, isLoading, getErrorMessage } = useFirebaseAuth();
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [errors, setErrors] = useState({
        email: '',
        password: ''
    });
    const [errorMessage, setErrorMessage] = useState('');

    const validateEmail = (email: string) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!email) return 'メールアドレスを入力してください';
        if (!emailRegex.test(email)) return '正しいメール形式で入力してください';
        return '';
    };

    const validatePassword = (password: string) => {
        if (!password) return 'パスワードを入力してください';
        return '';
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));

        // リアルタイムバリデーション
        if (name === 'email') {
            setErrors(prev => ({ ...prev, email: validateEmail(value) }));
        }
        if (name === 'password') {
            setErrors(prev => ({ ...prev, password: validatePassword(value) }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const emailError = validateEmail(formData.email);
        const passwordError = validatePassword(formData.password);

        setErrors({
            email: emailError,
            password: passwordError
        });

        if (emailError || passwordError) return;

        try {
            setErrorMessage('');
            await login(formData.email.trim(), formData.password);
            router.push('/');
        } catch (error: any) {
            const msg = getErrorMessage(error);
            setErrorMessage(msg);
        }
    };

    const handleDemoLogin = async (demoEmail: string, demoPassword: string, displayName: string) => {
        try {
            setErrorMessage('');

            // まずログイン
            await login(demoEmail, demoPassword);

            // ログイン後、displayNameを設定
            const auth = getAuth();
            const user = auth.currentUser;
            if (user && !user.displayName) {
                const { updateProfile } = await import('firebase/auth');
                await updateProfile(user, { displayName });
            }

            // demo1の場合のみリセット（ログイン後にUIDを取得）
            if (demoEmail === 'demo1@example.com' && user) {
                await fetch('http://localhost/api/demo/reset', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        firebase_uid: user.uid
                    })
                });
            }

            router.push('/');
        } catch (error: any) {
            const msg = getErrorMessage(error);
            setErrorMessage(msg);
        }
    };

    useEffect(() => {
        if (isLoggedIn) {
            router.push('/');
        }
    }, [isLoggedIn, router]);

    return (
        <div 
            style={{
                minHeight: '100vh',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 25%, #f093fb 50%, #f5576c 75%, #4facfe 100%)',
                backgroundSize: '400% 400%',
                animation: 'gradientShift 15s ease infinite',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '1rem'
            }}
        >
            <AuthHeader />

            <div 
                style={{
                    background: 'rgba(255, 255, 255, 0.95)',
                    backdropFilter: 'blur(10px)',
                    borderRadius: '1rem',
                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                    padding: '2rem',
                    width: '100%',
                    maxWidth: '28rem',
                    border: '1px solid rgba(255, 255, 255, 0.2)'
                }}
            >
                <h2 
                    style={{
                        fontSize: '1.5rem',
                        fontWeight: '700',
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f5576c 100%)',
                        backgroundClip: 'text',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        textAlign: 'center',
                        margin: '0 0 1.5rem 0'
                    }}
                >
                    ログイン
                </h2>

                <form 
                    onSubmit={handleSubmit}
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '1rem'
                    }}
                >
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <input
                            type="email"
                            name="email"
                            placeholder="メールアドレス"
                            value={formData.email}
                            onChange={handleChange}
                            style={{
                                width: '100%',
                                padding: '0.75rem 1rem',
                                border: '1px solid rgba(102, 126, 234, 0.3)',
                                borderRadius: '0.75rem',
                                fontSize: '1rem',
                                outline: 'none',
                                boxSizing: 'border-box',
                                background: 'rgba(255, 255, 255, 0.8)',
                                display: 'block',
                                marginBottom: '0.5rem'
                            }}
                        />
                        {errors.email && (
                            <div style={{
                                background: 'linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)',
                                color: '#dc2626',
                                padding: '8px 12px',
                                borderRadius: '8px',
                                fontSize: '14px',
                                border: '1px solid rgba(220, 38, 38, 0.2)'
                            }}>
                                {errors.email}
                            </div>
                        )}
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <input
                            type="password"
                            name="password"
                            placeholder="パスワード"
                            value={formData.password}
                            onChange={handleChange}
                            style={{
                                width: '100%',
                                padding: '0.75rem 1rem',
                                border: '1px solid rgba(102, 126, 234, 0.3)',
                                borderRadius: '0.75rem',
                                fontSize: '1rem',
                                outline: 'none',
                                boxSizing: 'border-box',
                                background: 'rgba(255, 255, 255, 0.8)',
                                display: 'block',
                                marginBottom: '0.5rem'
                            }}
                        />
                        {errors.password && (
                            <div style={{
                                background: 'linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)',
                                color: '#dc2626',
                                padding: '8px 12px',
                                borderRadius: '8px',
                                fontSize: '14px',
                                border: '1px solid rgba(220, 38, 38, 0.2)'
                            }}>
                                {errors.password}
                            </div>
                        )}
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        style={{
                            width: '40%',
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #d857f5ff 100%)',
                            color: 'white',
                            padding: '12px 24px',
                            border: 'none',
                            borderRadius: '25px',
                            fontSize: '1rem',
                            fontWeight: '600',
                            cursor: 'pointer',
                            margin: '1rem auto 0',
                            display: 'block',
                            boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)',
                            opacity: isLoading ? 0.6 : 1
                        }}
                    >
                        {isLoading ? 'ログイン中...' : 'ログイン'}
                    </button>

                    <div style={{
                        marginTop: '1.5rem',
                        padding: '1rem',
                        background: 'linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)',
                        borderRadius: '0.75rem',
                        border: '1px solid rgba(20, 184, 166, 0.3)'
                    }}>
                        <p style={{
                            fontSize: '0.875rem',
                            color: '#065f46',
                            marginBottom: '0.75rem',
                            textAlign: 'center',
                            fontWeight: '600'
                        }}>
                            🔑 デモアカウントでログイン
                        </p>
                        <div style={{
                            display: 'flex',
                            gap: '0.5rem',
                            flexDirection: 'column'
                        }}>
                            <button
                                type="button"
                                onClick={() => handleDemoLogin('demo1@example.com', 'demo-password-123', 'デモユーザー1')}
                                style={{
                                    width: '100%',
                                    background: 'linear-gradient(135deg, #14b8a6 0%, #0d9488 100%)',
                                    color: '#ffffff',
                                    padding: '0.75rem',
                                    border: 'none',
                                    borderRadius: '0.5rem',
                                    fontSize: '0.875rem',
                                    fontWeight: '600',
                                    cursor: 'pointer',
                                    boxShadow: '0 2px 8px rgba(20, 184, 166, 0.3)'
                                }}
                            >
                                デモユーザー1でログイン
                            </button>

                        </div>
                        <p style={{
                            fontSize: '0.75rem',
                            color: '#065f46',
                            marginTop: '0.75rem',
                            textAlign: 'center'
                        }}>
                            ※ デモ用アカウントで自動ログインします
                        </p>
                    </div>
                </form>

                {errorMessage && (
                    <div style={{
                        background: 'linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)',
                        color: '#dc2626',
                        padding: '12px',
                        borderRadius: '12px',
                        marginTop: '16px',
                        fontSize: '14px',
                        textAlign: 'center',
                        border: '1px solid rgba(220, 38, 38, 0.2)'
                    }}>
                        {errorMessage}
                    </div>
                )}
            </div>

            <style jsx>{`
                @keyframes gradientShift {
                    0% {
                        background-position: 0% 50%;
                    }
                    50% {
                        background-position: 100% 50%;
                    }
                    100% {
                        background-position: 0% 50%;
                    }
                }
            `}</style>
        </div>
    );
};

export default LoginForm;