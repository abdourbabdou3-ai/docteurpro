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

    const fetchPatients = useCallback(async () => {
        try {
            const params = search ? `?search=${encodeURIComponent(search)}` : '';
            const res = await fetch(`/api/patients${params}`);
            const data = await res.json();
            if (data.success && data.data?.patients) {
                setPatients(data.data.patients);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    }, [search]);

    useEffect(() => {
        fetchPatients();
    }, [fetchPatients]);

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchPatients();
        }, 300);
        return () => clearTimeout(timer);
    }, [search, fetchPatients]);

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

            {/* Patients List/Grid */}
            {patients.length === 0 ? (
                <div className="card text-center" style={{ padding: 'var(--spacing-3xl)' }}>
                    <p className="text-muted">لا يوجد مرضى بعد</p>
                </div>
            ) : (
                <div className="table-container">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>اسم المريض</th>
                                <th>رقم الهاتف</th>
                                <th>الإيميل</th>
                                <th>عدد الزيارات</th>
                                <th>آخر زيارة</th>
                                <th>الإجراءات</th>
                            </tr>
                        </thead>
                        <tbody>
                            {patients.map((patient) => (
                                <tr key={patient.id}>
                                    <td data-label="اسم المريض">
                                        <strong>{patient?.name || 'غير معروف'}</strong>
                                    </td>
                                    <td data-label="رقم الهاتف">{patient?.phone || '-'}</td>
                                    <td data-label="الإيميل">{patient?.email || '-'}</td>
                                    <td data-label="عدد الزيارات">{patient?.appointmentCount || 0}</td>
                                    <td data-label="آخر زيارة">
                                        {patient?.lastAppointment?.date ? formatDateAr(patient.lastAppointment.date) : '-'}
                                    </td>
                                    <td data-label="الإجراءات">
                                        <Link href={`/dashboard/patients/${patient.id}`} className="btn btn-sm btn-outline">
                                            عرض السجل
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </>
    );
}
