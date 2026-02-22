'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { formatDateAr, formatTimeAr, appointmentStatusAr, formatCurrency } from '@/lib/utils';

interface Stats {
    totalAppointments: number;
    todayAppointments: number;
    monthlyAppointments: number;
    pendingAppointments: number;
    completedAppointments: number;
    totalPatients: number;
    todayEarnings: number;
    monthlyEarnings: number;
    totalEarnings: number;
    recentAppointments: Array<{
        id: number;
        date: string;
        time: string;
        status: string;
        patient: { name: string; phone: string };
    }>;
}

export default function DashboardPage() {
    const [stats, setStats] = useState<Stats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const res = await fetch('/api/dashboard/stats');
            const data = await res.json();
            console.log('DASHBOARD_STATS:', data);
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
                    <h1 style={{ marginBottom: 'var(--spacing-xs)' }}>لوحة التحكم</h1>
                    <p className="text-muted">مرحباً بك! هنا نظرة عامة على نشاطك</p>
                </div>
            </div>

            {/* Subscription Premium Widget */}
            {(stats as any)?.subscription && (
                <div className="card mb-xl shadow-premium" style={{
                    background: 'rgba(255, 255, 255, 0.7)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255, 255, 255, 0.3)',
                    padding: 'var(--spacing-xl)',
                    position: 'relative',
                    overflow: 'hidden'
                }}>
                    {/* Decorative Background Element */}
                    <div style={{
                        position: 'absolute',
                        top: '-20px',
                        left: '-20px',
                        width: '100px',
                        height: '100px',
                        background: (stats as any).subscription.daysRemaining <= 2 ? 'rgba(239, 68, 68, 0.1)' : 'rgba(59, 130, 246, 0.1)',
                        borderRadius: '50%',
                        zIndex: 0
                    }}></div>

                    <div className="flex-between align-center" style={{ position: 'relative', zIndex: 1 }}>
                        <div className="flex flex-column gap-sm" style={{ flex: 1 }}>
                            <div className="flex align-center gap-sm">
                                <span className={`badge ${(stats as any).subscription.planName.includes('احترافي') ? 'badge-primary' : 'badge-success'}`}>
                                    {(stats as any).subscription.planName}
                                </span>
                                {(stats as any).subscription.totalDays <= 14 && (
                                    <span className="badge badge-warning" style={{ borderRadius: '20px', fontSize: '0.7rem' }}>نسخة تجريبية 14 يوم</span>
                                )}
                            </div>

                            <div className="mt-xs">
                                <h3 style={{ margin: 0, fontSize: '1.25rem' }}>
                                    {(stats as any).subscription.daysRemaining <= 0 ? (
                                        <span className="text-danger">توقف الاشتراك!</span>
                                    ) : (
                                        <>باقي <span className="text-primary" style={{ fontSize: '1.5rem' }}>{(stats as any).subscription.daysRemaining}</span> يوم على الانتهاء</>
                                    )}
                                </h3>
                                <p className="text-muted" style={{ margin: '4px 0 0 0', fontSize: '0.9rem' }}>
                                    ينتهي في: {formatDateAr((stats as any).subscription.endDate)}
                                </p>
                            </div>
                        </div>

                        <div style={{ flex: 1, maxWidth: '300px' }} className="hide-mobile">
                            <div className="flex-between mb-xs">
                                <span className="text-xs text-muted">الاستهلاك</span>
                                <span className="text-xs fw-bold">{Math.min(100, Math.round(((stats as any).subscription.usedDays / (stats as any).subscription.totalDays) * 100))}%</span>
                            </div>
                            <div style={{
                                width: '100%',
                                height: '8px',
                                background: 'var(--gray-100)',
                                borderRadius: '10px',
                                overflow: 'hidden'
                            }}>
                                <div style={{
                                    width: `${Math.min(100, ((stats as any).subscription.usedDays / (stats as any).subscription.totalDays) * 100)}%`,
                                    height: '100%',
                                    background: (stats as any).subscription.daysRemaining <= 2 ? 'var(--danger)' : 'linear-gradient(90deg, var(--primary), var(--secondary))',
                                    borderRadius: '10px',
                                    transition: 'width 1s ease-out'
                                }}></div>
                            </div>
                        </div>

                        <div className="flex align-center gap-md mr-xl">
                            <Link href="/dashboard/subscription" className={`btn ${(stats as any).subscription.daysRemaining <= 2 ? 'btn-danger' : 'btn-primary'}`}>
                                {(stats as any).subscription.daysRemaining <= 0 ? 'تجديد الآن' : 'تطوير الباقة'}
                            </Link>
                        </div>
                    </div>
                </div>
            )}

            {/* Earnings Cards */}
            <div className="grid grid-3 mb-xl">
                <div className="card" style={{
                    background: 'linear-gradient(135deg, #10b981, #059669)',
                    color: 'white',
                    padding: 'var(--spacing-xl)',
                }}>
                    <div className="flex-between" style={{ marginBottom: 'var(--spacing-md)' }}>
                        <span style={{ opacity: 0.9 }}>أرباح اليوم</span>
                        <div style={{
                            width: '40px',
                            height: '40px',
                            background: 'rgba(255,255,255,0.2)',
                            borderRadius: 'var(--border-radius-full)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                            </svg>
                        </div>
                    </div>
                    <div style={{ fontSize: 'var(--font-size-3xl)', fontWeight: '800' }}>
                        {formatCurrency(stats?.todayEarnings || 0)}
                    </div>
                </div>

                <div className="card" style={{
                    background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                    color: 'white',
                    padding: 'var(--spacing-xl)',
                }}>
                    <div className="flex-between" style={{ marginBottom: 'var(--spacing-md)' }}>
                        <span style={{ opacity: 0.9 }}>أرباح الشهر</span>
                        <div style={{
                            width: '40px',
                            height: '40px',
                            background: 'rgba(255,255,255,0.2)',
                            borderRadius: 'var(--border-radius-full)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                                <line x1="16" y1="2" x2="16" y2="6" />
                                <line x1="8" y1="2" x2="8" y2="6" />
                                <line x1="3" y1="10" x2="21" y2="10" />
                            </svg>
                        </div>
                    </div>
                    <div style={{ fontSize: 'var(--font-size-3xl)', fontWeight: '800' }}>
                        {formatCurrency(stats?.monthlyEarnings || 0)}
                    </div>
                </div>

                <div className="card" style={{
                    background: 'linear-gradient(135deg, #8b5cf6, #6d28d9)',
                    color: 'white',
                    padding: 'var(--spacing-xl)',
                }}>
                    <div className="flex-between" style={{ marginBottom: 'var(--spacing-md)' }}>
                        <span style={{ opacity: 0.9 }}>إجمالي الأرباح</span>
                        <div style={{
                            width: '40px',
                            height: '40px',
                            background: 'rgba(255,255,255,0.2)',
                            borderRadius: 'var(--border-radius-full)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <line x1="12" y1="1" x2="12" y2="23" />
                                <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                            </svg>
                        </div>
                    </div>
                    <div style={{ fontSize: 'var(--font-size-3xl)', fontWeight: '800' }}>
                        {formatCurrency(stats?.totalEarnings || 0)}
                    </div>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-card-icon primary">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                            <line x1="16" y1="2" x2="16" y2="6" />
                            <line x1="8" y1="2" x2="8" y2="6" />
                            <line x1="3" y1="10" x2="21" y2="10" />
                        </svg>
                    </div>
                    <div className="stat-card-value">{stats?.todayAppointments || 0}</div>
                    <div className="stat-card-label">مواعيد اليوم</div>
                </div>

                <div className="stat-card">
                    <div className="stat-card-icon warning">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="10" />
                            <polyline points="12,6 12,12 16,14" />
                        </svg>
                    </div>
                    <div className="stat-card-value">{stats?.pendingAppointments || 0}</div>
                    <div className="stat-card-label">بانتظار التأكيد</div>
                </div>

                <div className="stat-card">
                    <div className="stat-card-icon secondary">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
                            <circle cx="9" cy="7" r="4" />
                            <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
                        </svg>
                    </div>
                    <div className="stat-card-value">{stats?.totalPatients || 0}</div>
                    <div className="stat-card-label">إجمالي المرضى</div>
                </div>

                <div className="stat-card">
                    <div className="stat-card-icon danger">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                            <polyline points="22 4 12 14.01 9 11.01" />
                        </svg>
                    </div>
                    <div className="stat-card-value">{stats?.completedAppointments || 0}</div>
                    <div className="stat-card-label">مواعيد مكتملة</div>
                </div>
            </div>

            {/* Recent Appointments */}
            <div className="card mt-xl">
                <div className="card-header flex-between">
                    <h3 style={{ margin: 0 }}>المواعيد القادمة</h3>
                    <Link href="/dashboard/appointments" className="btn btn-ghost btn-sm">
                        عرض الكل
                    </Link>
                </div>
                <div className="card-body" style={{ padding: 0 }}>
                    {!stats?.recentAppointments?.length ? (
                        <div className="text-center" style={{ padding: 'var(--spacing-xl)' }}>
                            <p className="text-muted">لا توجد مواعيد قادمة</p>
                        </div>
                    ) : (
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>المريض</th>
                                    <th>التاريخ</th>
                                    <th>الوقت</th>
                                    <th>الحالة</th>
                                    <th>الإجراء</th>
                                </tr>
                            </thead>
                            <tbody>
                                {stats.recentAppointments.map((apt) => (
                                    <tr key={apt.id}>
                                        <td>
                                            <div>
                                                <strong>{apt.patient.name}</strong>
                                                <br />
                                                <small className="text-muted">{apt.patient.phone}</small>
                                            </div>
                                        </td>
                                        <td>{formatDateAr(apt.date)}</td>
                                        <td>{formatTimeAr(apt.time)}</td>
                                        <td>
                                            <span className={`badge badge-${apt.status === 'PENDING' ? 'warning' :
                                                apt.status === 'CONFIRMED' ? 'primary' :
                                                    apt.status === 'COMPLETED' ? 'success' : 'danger'
                                                }`}>
                                                {appointmentStatusAr[apt.status]}
                                            </span>
                                        </td>
                                        <td>
                                            <Link href={`/dashboard/appointments`} className="btn btn-ghost btn-sm">
                                                عرض
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-3 mt-xl">
                <Link href="/dashboard/appointments" className="card" style={{ padding: 'var(--spacing-xl)', textAlign: 'center', textDecoration: 'none' }}>
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
                            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                            <line x1="16" y1="2" x2="16" y2="6" />
                            <line x1="8" y1="2" x2="8" y2="6" />
                            <line x1="3" y1="10" x2="21" y2="10" />
                        </svg>
                    </div>
                    <h4 style={{ marginBottom: 'var(--spacing-xs)' }}>إدارة المواعيد</h4>
                    <p className="text-muted" style={{ marginBottom: 0 }}>عرض وتأكيد المواعيد</p>
                </Link>

                <Link href="/dashboard/patients" className="card" style={{ padding: 'var(--spacing-xl)', textAlign: 'center', textDecoration: 'none' }}>
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
                            <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
                            <circle cx="9" cy="7" r="4" />
                            <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
                        </svg>
                    </div>
                    <h4 style={{ marginBottom: 'var(--spacing-xs)' }}>المرضى</h4>
                    <p className="text-muted" style={{ marginBottom: 0 }}>عرض سجلات المرضى</p>
                </Link>

                <Link href="/dashboard/profile" className="card" style={{ padding: 'var(--spacing-xl)', textAlign: 'center', textDecoration: 'none' }}>
                    <div style={{
                        width: '60px',
                        height: '60px',
                        margin: '0 auto var(--spacing-md)',
                        background: 'rgba(255, 107, 53, 0.1)',
                        borderRadius: 'var(--border-radius-full)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'var(--accent)'
                    }}>
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                    </div>
                    <h4 style={{ marginBottom: 'var(--spacing-xs)' }}>الملف الشخصي</h4>
                    <p className="text-muted" style={{ marginBottom: 0 }}>تعديل بيانات الملف</p>
                </Link>
            </div>
        </>
    );
}
