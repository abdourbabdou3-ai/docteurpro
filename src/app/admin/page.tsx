'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { formatCurrency } from '@/lib/utils';

interface Stats {
    totalDoctors: number;
    activeDoctors: number;
    pendingDoctors: number;
    totalPatients: number;
    totalAppointments: number;
    monthlyAppointments: number;
    pendingSubscriptions: number;
    activeSubscriptions: number;
    monthlyRevenue: number;
}

export default function AdminDashboardPage() {
    const [stats, setStats] = useState<Stats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const res = await fetch('/api/admin/stats');
            const data = await res.json();
            if (data.success) {
                setStats(data.data);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
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
            <div className="flex-between mb-xl">
                <div>
                    <h1 style={{ marginBottom: 'var(--spacing-xs)' }}>لوحة تحكم الإدارة</h1>
                    <p className="text-muted">نظرة عامة على المنصة</p>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
                <div className="stat-card">
                    <div className="stat-card-icon primary">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
                            <circle cx="9" cy="7" r="4" />
                        </svg>
                    </div>
                    <div className="stat-card-value">{stats?.totalDoctors || 0}</div>
                    <div className="stat-card-label">إجمالي الأطباء</div>
                </div>

                <div className="stat-card">
                    <div className="stat-card-icon warning">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="10" />
                            <path d="M12 6v6l4 2" />
                        </svg>
                    </div>
                    <div className="stat-card-value">{stats?.pendingDoctors || 0}</div>
                    <div className="stat-card-label">بانتظار الموافقة</div>
                </div>

                <div className="stat-card">
                    <div className="stat-card-icon secondary">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                    </div>
                    <div className="stat-card-value">{stats?.totalPatients || 0}</div>
                    <div className="stat-card-label">إجمالي المرضى</div>
                </div>

                <div className="stat-card">
                    <div className="stat-card-icon danger">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                            <line x1="16" y1="2" x2="16" y2="6" />
                            <line x1="8" y1="2" x2="8" y2="6" />
                            <line x1="3" y1="10" x2="21" y2="10" />
                        </svg>
                    </div>
                    <div className="stat-card-value">{stats?.totalAppointments || 0}</div>
                    <div className="stat-card-label">إجمالي المواعيد</div>
                </div>
            </div>

            {/* Revenue & Subscriptions */}
            <div className="grid grid-2 mb-xl">
                <div className="card">
                    <div className="card-header">
                        <h3 style={{ margin: 0 }}>الإيرادات الشهرية</h3>
                    </div>
                    <div className="card-body text-center">
                        <div style={{ fontSize: 'var(--font-size-4xl)', fontWeight: '800', color: 'var(--success)' }}>
                            {formatCurrency(stats?.monthlyRevenue || 0)}
                        </div>
                        <p className="text-muted mt-md">
                            إجمالي اشتراكات الشهر الحالي
                        </p>
                    </div>
                </div>

                <div className="card">
                    <div className="card-header">
                        <h3 style={{ margin: 0 }}>الاشتراكات</h3>
                    </div>
                    <div className="card-body">
                        <div className="flex-between mb-md">
                            <span>اشتراكات نشطة</span>
                            <span className="badge badge-success">{stats?.activeSubscriptions || 0}</span>
                        </div>
                        <div className="flex-between mb-md">
                            <span>اشتراكات معلقة</span>
                            <span className="badge badge-warning">{stats?.pendingSubscriptions || 0}</span>
                        </div>
                        <Link href="/admin/subscriptions" className="btn btn-primary btn-block mt-lg">
                            إدارة الاشتراكات
                        </Link>
                    </div>
                </div>
            </div>

            {/* Quick Actions */}
            <h3 className="mb-lg">إجراءات سريعة</h3>
            <div className="grid grid-3">
                <Link href="/admin/doctors?status=pending" className="card" style={{ padding: 'var(--spacing-xl)', textAlign: 'center', textDecoration: 'none' }}>
                    <div style={{
                        width: '60px',
                        height: '60px',
                        margin: '0 auto var(--spacing-md)',
                        background: 'rgba(255, 193, 7, 0.1)',
                        borderRadius: 'var(--border-radius-full)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'var(--warning)'
                    }}>
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="10" />
                            <path d="M12 6v6l4 2" />
                        </svg>
                    </div>
                    <h4 style={{ marginBottom: 'var(--spacing-xs)' }}>أطباء بانتظار الموافقة</h4>
                    <p className="text-muted" style={{ marginBottom: 0 }}>{stats?.pendingDoctors || 0} طبيب</p>
                </Link>

                <Link href="/admin/subscriptions" className="card" style={{ padding: 'var(--spacing-xl)', textAlign: 'center', textDecoration: 'none' }}>
                    <div style={{
                        width: '60px',
                        height: '60px',
                        margin: '0 auto var(--spacing-md)',
                        background: 'var(--bg-primary)',
                        borderRadius: 'var(--border-radius-full)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'var(--primary)'
                    }}>
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                        </svg>
                    </div>
                    <h4 style={{ marginBottom: 'var(--spacing-xs)' }}>طلبات الاشتراك</h4>
                    <p className="text-muted" style={{ marginBottom: 0 }}>{stats?.pendingSubscriptions || 0} طلب</p>
                </Link>

                <Link href="/admin/plans" className="card" style={{ padding: 'var(--spacing-xl)', textAlign: 'center', textDecoration: 'none' }}>
                    <div style={{
                        width: '60px',
                        height: '60px',
                        margin: '0 auto var(--spacing-md)',
                        background: 'var(--bg-secondary)',
                        borderRadius: 'var(--border-radius-full)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'var(--secondary)'
                    }}>
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                        </svg>
                    </div>
                    <h4 style={{ marginBottom: 'var(--spacing-xs)' }}>إدارة الباقات</h4>
                    <p className="text-muted" style={{ marginBottom: 0 }}>تعديل وإضافة باقات</p>
                </Link>
            </div>
        </>
    );
}
