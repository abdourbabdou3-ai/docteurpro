'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { signIn, useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
    const router = useRouter();
    const { data: session, status } = useSession();

    const [form, setForm] = useState({ email: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (status === 'authenticated') {
            if (session?.user?.role === 'ADMIN') {
                router.push('/admin');
            } else {
                router.push('/dashboard');
            }
        }
    }, [status, session, router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const result = await signIn('credentials', {
                email: form.email,
                password: form.password,
                redirect: false,
            });

            if (result?.error) {
                setError(result.error);
            } else {
                // Redirect based on role
                const res = await fetch('/api/auth/session');
                const session = await res.json();

                if (session?.user?.role === 'ADMIN') {
                    router.push('/admin');
                } else {
                    router.push('/dashboard');
                }
            }
        } catch (err) {
            setError('حدث خطأ. يرجى المحاولة مرة أخرى');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, var(--bg-primary) 0%, var(--white) 100%)',
            padding: 'var(--spacing-lg)',
        }}>
            <div className="card" style={{ width: '100%', maxWidth: '420px' }}>
                <div className="card-body" style={{ padding: 'var(--spacing-xl)' }}>
                    <div className="text-center mb-xl">
                        <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
                            <svg viewBox="0 0 40 40" fill="none" width="48" height="48">
                                <circle cx="20" cy="20" r="18" fill="#0066cc" />
                                <path d="M20 10V30M10 20H30" stroke="white" strokeWidth="4" strokeLinecap="round" />
                            </svg>
                        </Link>
                        <h2 style={{ marginTop: 'var(--spacing-md)', marginBottom: 'var(--spacing-xs)' }}>
                            تسجيل الدخول
                        </h2>
                        <p className="text-muted">أدخل بياناتك للوصول إلى لوحة التحكم</p>
                    </div>

                    {error && (
                        <div className="alert alert-danger">{error}</div>
                    )}

                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label className="form-label">البريد الإلكتروني</label>
                            <input
                                type="email"
                                className="form-input"
                                placeholder="example@email.com"
                                value={form.email}
                                onChange={(e) => setForm({ ...form, email: e.target.value })}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">كلمة المرور</label>
                            <input
                                type="password"
                                className="form-input"
                                placeholder="••••••••"
                                value={form.password}
                                onChange={(e) => setForm({ ...form, password: e.target.value })}
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            className="btn btn-primary btn-block btn-lg"
                            disabled={loading}
                        >
                            {loading ? 'جاري الدخول...' : 'دخول'}
                        </button>
                    </form>

                    <div className="text-center mt-lg">
                        <p className="text-muted">
                            ليس لديك حساب؟{' '}
                            <Link href="/register" className="text-primary">سجل كطبيب</Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
