'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AuthHeader from '@/components/AuthHeader';
import { useFirebaseAuth } from '@/hooks/useFirebaseAuth';

const RegisterForm: React.FC = () => {
    const router = useRouter();
    const { register, isLoggedIn, isLoading, getErrorMessage } = useFirebaseAuth();
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: ''
    });
    const [errors, setErrors] = useState({
        username: '',
        email: '',
        password: ''
    });
    const [errorMessage, setErrorMessage] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    const validateUsername = (username: string) => {
        if (!username) return 'ユーザーネームを入力してください';
        if (username.length > 20) return '20文字以内で入力してください';
        return '';
    };

    const validateEmail = (email: string) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!email) return 'メールアドレスを入力してください';
        if (!emailRegex.test(email)) return '正しいメール形式で入力してください';
        return '';
    };

    const validatePassword = (password: string) => {
        if (!password) return 'パスワードを入力してください';
        if (password.length < 6) return '6文字以上で入力してください';
        return '';
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));

        // リアルタイムバリデーション
        if (name === 'username') {
            setErrors(prev => ({ ...prev, username: validateUsername(value) }));
        }
        if (name === 'email') {
            setErrors(prev => ({ ...prev, email: validateEmail(value) }));
        }
        if (name === 'password') {
            setErrors(prev => ({ ...prev, password: validatePassword(value) }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        const usernameError = validateUsername(formData.username);
        const emailError = validateEmail(formData.email);
        const passwordError = validatePassword(formData.password);
        
        setErrors({
            username: usernameError,
            email: emailError,
            password: passwordError
        });

        if (usernameError || emailError || passwordError) return;

        try {
            setErrorMessage('');
            setSuccessMessage('');

            await register(formData.email.trim(), formData.password, formData.username.trim());

            setSuccessMessage('新規登録が完了しました！ホーム画面に移動します...');
            
            // フォームリセット
            setFormData({ username: '', email: '', password: '' });

            setTimeout(() => {
                router.push('/');
            }, 1200);
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
                    新規登録
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
                            type="text"
                            name="username"
                            placeholder="ユーザーネーム"
                            value={formData.username}
                            onChange={handleChange}
                            maxLength={20}
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
                        {errors.username && (
                            <div style={{
                                background: 'linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)',
                                color: '#dc2626',
                                padding: '8px 12px',
                                borderRadius: '8px',
                                fontSize: '14px',
                                border: '1px solid rgba(220, 38, 38, 0.2)'
                            }}>
                                {errors.username}
                            </div>
                        )}
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <input
                            type="email"
                            name="email"
                            placeholder="メールアドレス"
                            value={formData.email}
                            onChange={handleChange}
                            autoComplete="email"
                            autoCapitalize="off"
                            spellCheck={false}
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
                            placeholder="パスワード (6文字以上)"
                            value={formData.password}
                            onChange={handleChange}
                            minLength={6}
                            autoComplete="new-password"
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
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #ce57f5ff 100%)',
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
                        {isLoading ? '登録中...' : '新規登録'}
                    </button>
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

                {successMessage && (
                    <div style={{
                        background: 'linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)',
                        color: '#059669',
                        padding: '12px',
                        borderRadius: '12px',
                        marginTop: '16px',
                        fontSize: '14px',
                        textAlign: 'center',
                        border: '1px solid rgba(5, 150, 105, 0.2)'
                    }}>
                        {successMessage}
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

export default RegisterForm;
