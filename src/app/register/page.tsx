'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { algerianWilayas, medicalSpecialties } from '@/lib/utils';

export default function RegisterPage() {
    const router = useRouter();
    const [form, setForm] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        specialty: '',
        city: '',
        phone: '',
    });
    const [specialties, setSpecialties] = useState<string[]>(medicalSpecialties);
    const [isCustomSpecialty, setIsCustomSpecialty] = useState(false);
    const [customSpecialty, setCustomSpecialty] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchSpecialties = async () => {
            try {
                const res = await fetch('/api/specialties');
                const data = await res.json();
                if (data.success) {
                    setSpecialties(data.data);
                }
            } catch (err) {
                console.error('Error fetching specialties:', err);
            }
        };
        fetchSpecialties();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (form.password !== form.confirmPassword) {
            setError('كلمتا المرور غير متطابقتين');
            return;
        }

        if (form.password.length < 6) {
            setError('كلمة المرور يجب أن تكون 6 أحرف على الأقل');
            return;
        }

        const finalSpecialty = isCustomSpecialty ? customSpecialty : form.specialty;
        if (!finalSpecialty) {
            setError('يرجى اختيار أو كتابة التخصص');
            return;
        }

        setLoading(true);

        try {
            const res = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: form.name,
                    email: form.email,
                    password: form.password,
                    specialty: finalSpecialty,
                    city: form.city,
                    phone: form.phone,
                }),
            });

            const data = await res.json();

            if (data.success) {
                setSuccess(data.message);
                setTimeout(() => router.push('/login'), 3000);
            } else {
                setError(data.error);
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
            <div className="card" style={{ width: '100%', maxWidth: '500px' }}>
                <div className="card-body" style={{ padding: 'var(--spacing-xl)' }}>
                    <div className="text-center mb-xl">
                        <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
                            <svg viewBox="0 0 40 40" fill="none" width="48" height="48">
                                <circle cx="20" cy="20" r="18" fill="#0066cc" />
                                <path d="M20 10V30M10 20H30" stroke="white" strokeWidth="4" strokeLinecap="round" />
                            </svg>
                        </Link>
                        <h2 style={{ marginTop: 'var(--spacing-md)', marginBottom: 'var(--spacing-xs)' }}>
                            انضم كطبيب
                        </h2>
                        <p className="text-muted">أنشئ حسابك وابدأ باستقبال المرضى</p>
                    </div>

                    {error && <div className="alert alert-danger">{error}</div>}
                    {success && <div className="alert alert-success">{success}</div>}

                    <form onSubmit={handleSubmit}>
                        <div className="grid grid-2">
                            <div className="form-group">
                                <label className="form-label">الاسم الكامل *</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    placeholder="د. أحمد محمد"
                                    value={form.name}
                                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">رقم الهاتف</label>
                                <input
                                    type="tel"
                                    className="form-input"
                                    placeholder="0555123456"
                                    value={form.phone}
                                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label className="form-label">البريد الإلكتروني *</label>
                            <input
                                type="email"
                                className="form-input"
                                placeholder="doctor@example.com"
                                value={form.email}
                                onChange={(e) => setForm({ ...form, email: e.target.value })}
                                required
                            />
                        </div>

                        <div className="grid grid-2">
                            <div className="form-group">
                                <label className="form-label">التخصص *</label>
                                <select
                                    className="form-select"
                                    value={isCustomSpecialty ? 'OTHER' : form.specialty}
                                    onChange={(e) => {
                                        if (e.target.value === 'OTHER') {
                                            setIsCustomSpecialty(true);
                                            setForm({ ...form, specialty: '' });
                                        } else {
                                            setIsCustomSpecialty(false);
                                            setForm({ ...form, specialty: e.target.value });
                                        }
                                    }}
                                    required
                                >
                                    <option value="">اختر التخصص</option>
                                    {specialties.map((s) => (
                                        <option key={s} value={s}>{s}</option>
                                    ))}
                                    <option value="OTHER" style={{ fontWeight: 'bold' }}>أخرى... (إضافة تخصص جديد)</option>
                                </select>
                            </div>

                            <div className="form-group">
                                <label className="form-label">الولاية *</label>
                                <select
                                    className="form-select"
                                    value={form.city}
                                    onChange={(e) => setForm({ ...form, city: e.target.value })}
                                    required
                                >
                                    <option value="">اختر الولاية</option>
                                    {algerianWilayas.map((c) => (
                                        <option key={c} value={c}>{c}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {isCustomSpecialty && (
                            <div className="form-group fade-in">
                                <label className="form-label">اكتب تخصصك هنا *</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    placeholder="مثال: طب الأعشاب، طب الفضاء..."
                                    value={customSpecialty}
                                    onChange={(e) => setCustomSpecialty(e.target.value)}
                                    required
                                />
                            </div>
                        )}

                        <div className="grid grid-2">
                            <div className="form-group">
                                <label className="form-label">كلمة المرور *</label>
                                <input
                                    type="password"
                                    className="form-input"
                                    placeholder="••••••••"
                                    value={form.password}
                                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">تأكيد كلمة المرور *</label>
                                <input
                                    type="password"
                                    className="form-input"
                                    placeholder="••••••••"
                                    value={form.confirmPassword}
                                    onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                                    required
                                />
                            </div>
                        </div>

                        <div className="alert alert-info mb-lg">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="12" cy="12" r="10" />
                                <path d="M12 16v-4M12 8h.01" />
                            </svg>
                            سيتم مراجعة حسابك من قبل الإدارة قبل التفعيل
                        </div>

                        <button
                            type="submit"
                            className="btn btn-primary btn-block btn-lg"
                            disabled={loading}
                        >
                            {loading ? 'جاري التسجيل...' : 'إنشاء الحساب'}
                        </button>
                    </form>

                    <div className="text-center mt-lg">
                        <p className="text-muted">
                            لديك حساب بالفعل؟{' '}
                            <Link href="/login" className="text-primary">تسجيل الدخول</Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
