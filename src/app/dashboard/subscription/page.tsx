'use client';

import { useEffect, useState } from 'react';
import { formatDateAr, formatCurrency, subscriptionStatusAr } from '@/lib/utils';

interface Plan {
    id: number;
    name: string;
    nameAr: string;
    description: string | null;
    descriptionAr: string | null;
    price: number;
    maxAppointments: number;
    maxStorageMb: number;
}

interface Subscription {
    id: number;
    status: string;
    startDate: string | null;
    endDate: string | null;
    plan: Plan;
}

interface Usage {
    appointmentsUsed: number;
    appointmentsMax: number;
    storageMbUsed: number;
    storageMbMax: number;
}

export default function SubscriptionPage() {
    const [subscription, setSubscription] = useState<Subscription | null>(null);
    const [usage, setUsage] = useState<Usage | null>(null);
    const [plans, setPlans] = useState<Plan[]>([]);
    const [loading, setLoading] = useState(true);
    const [requesting, setRequesting] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [subRes, plansRes] = await Promise.all([
                fetch('/api/subscriptions/doctor'),
                fetch('/api/subscriptions/plans'),
            ]);

            const subData = await subRes.json();
            const plansData = await plansRes.json();

            if (subData.success) {
                setSubscription(subData.data.subscription);
                setUsage(subData.data.usage);
            }
            if (plansData.success) {
                setPlans(plansData.data);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const requestSubscription = async (planId: number) => {
        setRequesting(true);
        setMessage({ type: '', text: '' });

        try {
            const res = await fetch('/api/subscriptions/doctor', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ planId }),
            });
            const data = await res.json();

            if (data.success) {
                setMessage({ type: 'success', text: data.message });
                fetchData();
            } else {
                setMessage({ type: 'error', text: data.error });
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'حدث خطأ. يرجى المحاولة مرة أخرى' });
        } finally {
            setRequesting(false);
        }
    };

    if (loading) {
        return (
            <div className="flex-center" style={{ padding: 'var(--spacing-3xl)' }}>
                <div className="spinner"></div>
            </div>
        );
    }

    return (
        <>
            <div className="mb-xl">
                <h1 style={{ marginBottom: 'var(--spacing-xs)' }}>الاشتراك</h1>
                <p className="text-muted">إدارة باقة اشتراكك</p>
            </div>

            {message.text && (
                <div className={`alert ${message.type === 'success' ? 'alert-success' : 'alert-danger'} mb-lg`}>
                    {message.text}
                </div>
            )}

            {/* Current Subscription */}
            {subscription && subscription.status === 'ACTIVE' && (
                <div className="card mb-xl">
                    <div className="card-header flex-between">
                        <h3 style={{ margin: 0 }}>اشتراكك الحالي</h3>
                        <span className="badge badge-success">نشط</span>
                    </div>
                    <div className="card-body">
                        <div className="grid grid-4" style={{ textAlign: 'center' }}>
                            <div>
                                <p className="text-muted mb-xs">الباقة</p>
                                <h4 style={{ margin: 0 }}>{subscription.plan.nameAr}</h4>
                            </div>
                            <div>
                                <p className="text-muted mb-xs">السعر الشهري</p>
                                <h4 style={{ margin: 0, color: 'var(--secondary)' }}>{formatCurrency(subscription.plan.price)}</h4>
                            </div>
                            <div>
                                <p className="text-muted mb-xs">تاريخ البدء</p>
                                <h4 style={{ margin: 0 }}>{subscription.startDate ? formatDateAr(subscription.startDate) : '-'}</h4>
                            </div>
                            <div>
                                <p className="text-muted mb-xs">تاريخ الانتهاء</p>
                                <h4 style={{ margin: 0 }}>{subscription.endDate ? formatDateAr(subscription.endDate) : '-'}</h4>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {subscription && subscription.status === 'PENDING' && (
                <div className="alert alert-warning mb-xl">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10" />
                        <path d="M12 6v6l4 2" />
                    </svg>
                    طلب اشتراكك في باقة <strong>{subscription.plan.nameAr}</strong> قيد المراجعة
                </div>
            )}

            {/* Usage */}
            {usage && subscription?.status === 'ACTIVE' && (
                <div className="grid grid-2 mb-xl">
                    <div className="card">
                        <div className="card-body">
                            <div className="flex-between mb-md">
                                <span>المواعيد المستخدمة</span>
                                <span className="text-primary">
                                    <strong>{usage.appointmentsUsed}</strong> / {usage.appointmentsMax}
                                </span>
                            </div>
                            <div style={{
                                height: '8px',
                                background: 'var(--gray-200)',
                                borderRadius: 'var(--border-radius-full)',
                                overflow: 'hidden',
                            }}>
                                <div style={{
                                    height: '100%',
                                    width: `${Math.min((usage.appointmentsUsed / usage.appointmentsMax) * 100, 100)}%`,
                                    background: 'var(--primary)',
                                    borderRadius: 'var(--border-radius-full)',
                                    transition: 'width var(--transition)',
                                }} />
                            </div>
                        </div>
                    </div>

                    <div className="card">
                        <div className="card-body">
                            <div className="flex-between mb-md">
                                <span>مساحة التخزين</span>
                                <span className="text-secondary">
                                    <strong>{usage.storageMbUsed.toFixed(1)}</strong> / {usage.storageMbMax} ميغابايت
                                </span>
                            </div>
                            <div style={{
                                height: '8px',
                                background: 'var(--gray-200)',
                                borderRadius: 'var(--border-radius-full)',
                                overflow: 'hidden',
                            }}>
                                <div style={{
                                    height: '100%',
                                    width: `${Math.min((usage.storageMbUsed / usage.storageMbMax) * 100, 100)}%`,
                                    background: 'var(--secondary)',
                                    borderRadius: 'var(--border-radius-full)',
                                    transition: 'width var(--transition)',
                                }} />
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Available Plans */}
            <h3 className="mb-lg">باقات الاشتراك المتاحة</h3>
            <div className="grid grid-3">
                {plans.map((plan) => (
                    <div key={plan.id} className="card" style={{
                        border: subscription?.plan.id === plan.id ? '2px solid var(--primary)' : 'none',
                    }}>
                        <div className="card-body text-center">
                            <h3 style={{ marginBottom: 'var(--spacing-xs)' }}>{plan.nameAr}</h3>
                            <p className="text-muted" style={{ fontSize: 'var(--font-size-sm)' }}>
                                {plan.descriptionAr || plan.description}
                            </p>

                            <div style={{ margin: 'var(--spacing-lg) 0' }}>
                                <span style={{ fontSize: 'var(--font-size-4xl)', fontWeight: '800', color: 'var(--primary)' }}>
                                    {formatCurrency(plan.price)}
                                </span>
                                <span className="text-muted"> / شهرياً</span>
                            </div>

                            <ul style={{
                                listStyle: 'none',
                                textAlign: 'right',
                                marginBottom: 'var(--spacing-lg)',
                            }}>
                                <li style={{ padding: 'var(--spacing-sm) 0', borderBottom: '1px solid var(--gray-100)' }}>
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--success)" strokeWidth="2" style={{ marginLeft: 'var(--spacing-sm)' }}>
                                        <polyline points="20 6 9 17 4 12" />
                                    </svg>
                                    حتى <strong>{plan.maxAppointments}</strong> موعد شهرياً
                                </li>
                                <li style={{ padding: 'var(--spacing-sm) 0', borderBottom: '1px solid var(--gray-100)' }}>
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--success)" strokeWidth="2" style={{ marginLeft: 'var(--spacing-sm)' }}>
                                        <polyline points="20 6 9 17 4 12" />
                                    </svg>
                                    <strong>{plan.maxStorageMb}</strong> ميغابايت تخزين
                                </li>
                                <li style={{ padding: 'var(--spacing-sm) 0' }}>
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--success)" strokeWidth="2" style={{ marginLeft: 'var(--spacing-sm)' }}>
                                        <polyline points="20 6 9 17 4 12" />
                                    </svg>
                                    دعم فني
                                </li>
                            </ul>

                            {subscription?.plan.id === plan.id && subscription.status === 'ACTIVE' ? (
                                <span className="badge badge-primary">باقتك الحالية</span>
                            ) : subscription?.plan.id === plan.id && subscription.status === 'PENDING' ? (
                                <span className="badge badge-warning">قيد المراجعة</span>
                            ) : (
                                <button
                                    className="btn btn-primary btn-block"
                                    onClick={() => requestSubscription(plan.id)}
                                    disabled={requesting}
                                >
                                    {requesting ? 'جاري الطلب...' : 'اشترك الآن'}
                                </button>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </>
    );
}
