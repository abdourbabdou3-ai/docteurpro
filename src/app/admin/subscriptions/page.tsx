'use client';

import { useEffect, useState } from 'react';
import { formatDateAr, formatCurrency, subscriptionStatusAr } from '@/lib/utils';

interface Subscription {
    id: number;
    status: string;
    createdAt: string;
    startDate: string | null;
    endDate: string | null;
    doctor: {
        name: string;
        user: { email: string };
    };
    plan: {
        name: string;
        nameAr: string;
        price: number;
    };
}

export default function AdminSubscriptionsPage() {
    const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('PENDING');

    useEffect(() => {
        fetchSubscriptions();
    }, [filter]);

    const fetchSubscriptions = async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/admin/subscriptions?status=${filter}`);
            const data = await res.json();
            if (data.success) {
                setSubscriptions(data.data.subscriptions);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleAction = async (id: number, action: string) => {
        if (!confirm(`هل أنت متأكد من هذا الإجراء؟`)) return;

        try {
            const res = await fetch(`/api/admin/subscriptions/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action, durationDays: 30 }),
            });
            const data = await res.json();
            if (data.success) {
                fetchSubscriptions();
            }
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <>
            <div className="flex-between mb-xl">
                <div>
                    <h1 style={{ marginBottom: 'var(--spacing-xs)' }}>إدارة الاشتراكات</h1>
                    <p className="text-muted">الموافقة على طلبات الاشتراك</p>
                </div>
            </div>

            {/* Filters */}
            <div className="card mb-lg" style={{ padding: 'var(--spacing-md)' }}>
                <div className="flex gap-sm">
                    {[
                        { value: 'PENDING', label: 'بانتظار الموافقة' },
                        { value: 'ACTIVE', label: 'نشط' },
                        { value: 'EXPIRED', label: 'منتهي' },
                        { value: 'CANCELLED', label: 'ملغي' },
                    ].map((opt) => (
                        <button
                            key={opt.value}
                            className={`btn btn-sm ${filter === opt.value ? 'btn-primary' : 'btn-ghost'}`}
                            onClick={() => setFilter(opt.value)}
                        >
                            {opt.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Subscriptions Table */}
            <div className="table-container">
                {loading ? (
                    <div className="flex-center" style={{ padding: 'var(--spacing-3xl)' }}>
                        <div className="spinner"></div>
                    </div>
                ) : subscriptions.length === 0 ? (
                    <div className="text-center" style={{ padding: 'var(--spacing-3xl)' }}>
                        <p className="text-muted">لا توجد اشتراكات</p>
                    </div>
                ) : (
                    <table className="table">
                        <thead>
                            <tr>
                                <th>الطبيب</th>
                                <th>البريد الإلكتروني</th>
                                <th>الباقة</th>
                                <th>السعر</th>
                                <th>الحالة</th>
                                <th>تاريخ الطلب</th>
                                <th>تاريخ البدء</th>
                                <th>تاريخ الانتهاء</th>
                                <th>الإجراءات</th>
                            </tr>
                        </thead>
                        <tbody>
                            {subscriptions.map((sub) => (
                                <tr key={sub.id}>
                                    <td><strong>{sub.doctor.name}</strong></td>
                                    <td>{sub.doctor.user.email}</td>
                                    <td>{sub.plan.nameAr}</td>
                                    <td>{formatCurrency(sub.plan.price)}</td>
                                    <td>
                                        <span className={`badge badge-${sub.status === 'PENDING' ? 'warning' :
                                                sub.status === 'ACTIVE' ? 'success' :
                                                    sub.status === 'EXPIRED' ? 'info' : 'danger'
                                            }`}>
                                            {subscriptionStatusAr[sub.status]}
                                        </span>
                                    </td>
                                    <td>{formatDateAr(sub.createdAt)}</td>
                                    <td>{sub.startDate ? formatDateAr(sub.startDate) : '-'}</td>
                                    <td>{sub.endDate ? formatDateAr(sub.endDate) : '-'}</td>
                                    <td>
                                        {sub.status === 'PENDING' && (
                                            <div className="flex gap-xs">
                                                <button
                                                    className="btn btn-success btn-sm"
                                                    onClick={() => handleAction(sub.id, 'approve')}
                                                >
                                                    موافقة
                                                </button>
                                                <button
                                                    className="btn btn-danger btn-sm"
                                                    onClick={() => handleAction(sub.id, 'reject')}
                                                >
                                                    رفض
                                                </button>
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </>
    );
}
