'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { formatDateAr, userStatusAr } from '@/lib/utils';

interface Doctor {
    id: number;
    name: string;
    specialty: string;
    city: string;
    approved: boolean;
    createdAt: string;
    user: {
        id: number;
        email: string;
        status: string;
        createdAt: string;
    };
    subscriptions: Array<{
        plan: { nameAr: string };
    }>;
    daysRemaining: number | null;
    _count: {
        appointments: number;
        reviews: number;
    };
}

export default function AdminDoctorsPage() {
    const searchParams = useSearchParams();
    const [doctors, setDoctors] = useState<Doctor[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState(searchParams.get('status') || 'all');
    const [search, setSearch] = useState('');

    useEffect(() => {
        fetchDoctors();
    }, [filter, search]);

    const fetchDoctors = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (filter !== 'all') params.append('status', filter);
            if (search) params.append('search', search);

            const res = await fetch(`/api/admin/doctors?${params}`);
            const data = await res.json();
            if (data.success) {
                setDoctors(data.data.doctors);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleAction = async (doctorId: number, action: string) => {
        if (!confirm(`هل أنت متأكد من هذا الإجراء؟`)) return;

        try {
            const res = await fetch(`/api/admin/doctors/${doctorId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action }),
            });
            const data = await res.json();
            if (data.success) {
                fetchDoctors();
            }
        } catch (error) {
            console.error(error);
        }
    };

    const handleDelete = async (doctorId: number) => {
        if (!confirm('تحذير: سيتم حذف الطبيب وجميع بياناته (المواعيد، الفواتير، السجلات) بشكل نهائي. هل أنت متأكد؟')) return;

        try {
            const res = await fetch(`/api/admin/doctors/${doctorId}`, {
                method: 'DELETE',
            });
            const data = await res.json();
            if (data.success) {
                fetchDoctors();
            }
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <>
            <div className="flex-between mb-xl">
                <div>
                    <h1 style={{ marginBottom: 'var(--spacing-xs)' }}>إدارة الأطباء</h1>
                    <p className="text-muted">الموافقة على الأطباء وإدارة حساباتهم</p>
                </div>
            </div>

            {/* Filters */}
            <div className="card mb-lg" style={{ padding: 'var(--spacing-md)' }}>
                <div className="flex gap-lg flex-wrap" style={{ alignItems: 'center' }}>
                    <input
                        type="text"
                        className="form-input"
                        placeholder="البحث بالاسم أو البريد..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        style={{ maxWidth: '300px' }}
                    />

                    <div className="flex gap-sm">
                        {[
                            { value: 'all', label: 'الكل' },
                            { value: 'pending', label: 'بانتظار الموافقة' },
                            { value: 'active', label: 'نشط' },
                            { value: 'suspended', label: 'معلق' },
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
            </div>

            {/* Doctors Table */}
            <div className="table-container">
                {loading ? (
                    <div className="flex-center" style={{ padding: 'var(--spacing-3xl)' }}>
                        <div className="spinner"></div>
                    </div>
                ) : doctors.length === 0 ? (
                    <div className="text-center" style={{ padding: 'var(--spacing-3xl)' }}>
                        <p className="text-muted">لا يوجد أطباء</p>
                    </div>
                ) : (
                    <table className="table">
                        <thead>
                            <tr>
                                <th>الطبيب</th>
                                <th>البريد الإلكتروني</th>
                                <th>التخصص</th>
                                <th>المدينة</th>
                                <th>الاشتراك</th>
                                <th>الحالة</th>
                                <th>تاريخ التسجيل</th>
                                <th>الإجراءات</th>
                            </tr>
                        </thead>
                        <tbody>
                            {doctors.map((doctor) => (
                                <tr key={doctor.id}>
                                    <td>
                                        <div className="flex gap-sm">
                                            <div style={{
                                                width: '40px',
                                                height: '40px',
                                                borderRadius: 'var(--border-radius-full)',
                                                background: 'var(--bg-primary)',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                color: 'var(--primary)',
                                                flexShrink: 0,
                                            }}>
                                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                    <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
                                                    <circle cx="12" cy="7" r="4" />
                                                </svg>
                                            </div>
                                            <div>
                                                <strong>{doctor.name}</strong>
                                                <br />
                                                <small className="text-muted">
                                                    {doctor._count.appointments} موعد • {doctor._count.reviews} تقييم
                                                </small>
                                            </div>
                                        </div>
                                    </td>
                                    <td>{doctor.user.email}</td>
                                    <td>{doctor.specialty}</td>
                                    <td>{doctor.city}</td>
                                    <td>
                                        {doctor.subscriptions[0] ? (
                                            <div className="flex flex-column gap-xs">
                                                <span className="badge badge-success">{doctor.subscriptions[0].plan.nameAr}</span>
                                                {doctor.daysRemaining !== null && (
                                                    <span className={`text-xs ${doctor.daysRemaining <= 2 ? 'text-danger fw-bold' : 'text-muted'}`} style={{ fontSize: '0.75rem' }}>
                                                        باقي {doctor.daysRemaining} يوم
                                                    </span>
                                                )}
                                            </div>
                                        ) : (
                                            <span className="badge badge-info">لا يوجد</span>
                                        )}
                                    </td>
                                    <td>
                                        {!doctor.approved ? (
                                            <span className="badge badge-warning">بانتظار الموافقة</span>
                                        ) : doctor.user.status === 'ACTIVE' ? (
                                            <span className="badge badge-success">نشط</span>
                                        ) : (
                                            <span className="badge badge-danger">معلق</span>
                                        )}
                                    </td>
                                    <td>{formatDateAr(doctor.createdAt)}</td>
                                    <td>
                                        <div className="flex gap-xs">
                                            {!doctor.approved && (
                                                <>
                                                    <button
                                                        className="btn btn-success btn-sm"
                                                        onClick={() => handleAction(doctor.id, 'approve')}
                                                    >
                                                        موافقة
                                                    </button>
                                                    <button
                                                        className="btn btn-danger btn-sm"
                                                        onClick={() => handleAction(doctor.id, 'reject')}
                                                    >
                                                        رفض
                                                    </button>
                                                </>
                                            )}
                                            {doctor.approved && doctor.user.status === 'ACTIVE' && (
                                                <button
                                                    className="btn btn-warning btn-sm"
                                                    onClick={() => handleAction(doctor.id, 'suspend')}
                                                >
                                                    تعليق
                                                </button>
                                            )}
                                            {doctor.user.status === 'SUSPENDED' && (
                                                <button
                                                    className="btn btn-success btn-sm"
                                                    onClick={() => handleAction(doctor.id, 'activate')}
                                                >
                                                    تفعيل
                                                </button>
                                            )}
                                            <button
                                                className="btn btn-danger btn-sm"
                                                style={{ padding: '0.5rem' }}
                                                onClick={() => handleDelete(doctor.id)}
                                                title="حذف نهائي"
                                            >
                                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                    <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                                                </svg>
                                            </button>
                                        </div>
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
