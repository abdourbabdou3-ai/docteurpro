'use client';

import Link from 'next/link';
import { useEffect, useState, useCallback } from 'react';
import { formatDateAr } from '@/lib/utils';

interface Patient {
    id: number;
    name: string;
    phone: string;
    email: string | null;
    notes: string | null;
    createdAt: string;
    appointmentCount: number;
    lastAppointment: { date: string } | null;
}

export default function PatientsPage() {
    const [patients, setPatients] = useState<Patient[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [mounted, setMounted] = useState(false);

    const fetchPatients = useCallback(async () => {
        try {
            const params = search ? `?search=${encodeURIComponent(search)}` : '';
            const res = await fetch(`/api/patients${params}`);
            if (!res.ok) throw new Error('Failed to fetch data');
            const data = await res.json();
            if (data.success && data.data?.patients) {
                setPatients(data.data.patients);
            }
        } catch (error) {
            console.error('Fetch Error:', error);
        } finally {
            setLoading(false);
        }
    }, [search]);

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        fetchPatients();
    }, [fetchPatients]);

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchPatients();
        }, 300);
        return () => clearTimeout(timer);
    }, [search, fetchPatients]);

    if (!mounted || loading) {
        return (
            <div className="flex-center" style={{ height: '60vh' }}>
                <div className="spinner"></div>
            </div>
        );
    }

    return (
        <>
            <div className="flex-between mb-xl">
                <div>
                    <h1 style={{ marginBottom: 'var(--spacing-xs)' }}>المرضى</h1>
                    <p className="text-muted">إدارة سجلات المرضى</p>
                </div>
            </div>

            {/* Search */}
            <div className="card mb-lg" style={{ padding: 'var(--spacing-md)' }}>
                <input
                    type="text"
                    className="form-input"
                    placeholder="ابحث بالاسم أو رقم الهاتف..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    style={{ maxWidth: '400px' }}
                />
            </div>

            {/* Patients List */}
            {patients.length === 0 ? (
                <div className="card text-center" style={{ padding: 'var(--spacing-3xl)' }}>
                    <div style={{ opacity: 0.3, marginBottom: 'var(--spacing-md)' }}>
                        <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                            <path d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                    </div>
                    <p className="text-muted">لا يوجد مرضى بعد</p>
                </div>
            ) : (
                <>
                    {/* Desktop Table */}
                    <div className="table-container hidden-mobile">
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>المريض</th>
                                    <th>رقم الهاتف</th>
                                    <th>إحصائيات</th>
                                    <th>آخر زيارة</th>
                                    <th>الإجراءات</th>
                                </tr>
                            </thead>
                            <tbody>
                                {patients.map((patient) => (
                                    <tr key={patient.id}>
                                        <td><strong>{patient?.name || 'غير معروف'}</strong></td>
                                        <td>{patient?.phone || '-'}</td>
                                        <td>{patient?.appointmentCount || 0} زيارات</td>
                                        <td>{patient?.lastAppointment?.date ? formatDateAr(patient.lastAppointment.date) : '-'}</td>
                                        <td>
                                            <Link href={`/dashboard/patients/${patient.id}`} className="btn btn-sm btn-outline">
                                                عرض السجل
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Mobile Cards */}
                    <div className="show-mobile">
                        {patients.map((patient) => (
                            <div key={patient.id} className="card mb-md" style={{ padding: 'var(--spacing-md)' }}>
                                <div className="flex-between mb-sm">
                                    <strong>{patient?.name || 'غير معروف'}</strong>
                                    <span className="badge badge-info">{patient?.appointmentCount || 0} زيارات</span>
                                </div>
                                <div className="text-muted mb-sm" style={{ fontSize: 'var(--font-size-sm)' }}>
                                    {patient?.phone}
                                </div>
                                <div className="flex-between align-center">
                                    <div className="text-muted" style={{ fontSize: 'var(--font-size-xs)' }}>
                                        آخر زيارة: {patient?.lastAppointment?.date ? formatDateAr(patient.lastAppointment.date) : '-'}
                                    </div>
                                    <Link href={`/dashboard/patients/${patient.id}`} className="btn btn-sm btn-outline">
                                        السجل
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                </>
            )}
        </>
    );
}
