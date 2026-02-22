'use client';

import { useEffect, useState } from 'react';
import { formatDateAr, formatTimeAr, appointmentStatusAr, formatCurrency } from '@/lib/utils';

interface Appointment {
    id: number;
    date: string;
    time: string;
    status: string;
    notes: string | null;
    actualPrice: number | null;
    patient: {
        id: number;
        name: string;
        phone: string;
        email: string | null;
    };
    doctor?: {
        priceRange: string | null;
    };
}

export default function AppointmentsPage() {
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');

    // Complete modal state
    const [showCompleteModal, setShowCompleteModal] = useState(false);
    const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
    const [actualPrice, setActualPrice] = useState<string>('');
    const [completing, setCompleting] = useState(false);

    useEffect(() => {
        fetchAppointments();
    }, []);

    const fetchAppointments = async () => {
        try {
            const res = await fetch('/api/appointments');
            const data = await res.json();
            if (data.success) {
                setAppointments(data.data.appointments);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const updateStatus = async (id: number, status: string) => {
        try {
            const res = await fetch(`/api/appointments/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status }),
            });
            const data = await res.json();
            if (data.success) {
                fetchAppointments();
            }
        } catch (error) {
            console.error(error);
        }
    };

    const openCompleteModal = (apt: Appointment) => {
        setSelectedAppointment(apt);
        // Extract default price from doctor's priceRange (e.g., "2000-3000 دج" -> 2000)
        const priceMatch = apt.doctor?.priceRange?.match(/\d+/);
        setActualPrice(priceMatch ? priceMatch[0] : '');
        setShowCompleteModal(true);
    };

    const handleComplete = async () => {
        if (!selectedAppointment) return;

        setCompleting(true);
        try {
            const res = await fetch(`/api/appointments/${selectedAppointment.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    status: 'COMPLETED',
                    actualPrice: actualPrice ? parseFloat(actualPrice) : null,
                }),
            });
            const data = await res.json();
            if (data.success) {
                setShowCompleteModal(false);
                setSelectedAppointment(null);
                setActualPrice('');
                fetchAppointments();
            }
        } catch (error) {
            console.error(error);
        } finally {
            setCompleting(false);
        }
    };

    const filteredAppointments = appointments.filter((apt) => {
        if (filter === 'all') return true;
        return apt.status === filter;
    });

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
                    <h1 style={{ marginBottom: 'var(--spacing-xs)' }}>المواعيد</h1>
                    <p className="text-muted">إدارة جميع مواعيدك</p>
                </div>
            </div>

            {/* Filters */}
            <div className="card mb-lg" style={{ padding: 'var(--spacing-md)' }}>
                <div className="flex gap-sm flex-wrap">
                    {[
                        { value: 'all', label: 'الكل' },
                        { value: 'PENDING', label: 'بانتظار التأكيد' },
                        { value: 'CONFIRMED', label: 'مؤكد' },
                        { value: 'COMPLETED', label: 'مكتمل' },
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

            {/* Appointments Table */}
            <div className="table-container">
                {filteredAppointments.length === 0 ? (
                    <div className="text-center" style={{ padding: 'var(--spacing-3xl)' }}>
                        <p className="text-muted">لا توجد مواعيد</p>
                    </div>
                ) : (
                    <table className="table">
                        <thead>
                            <tr>
                                <th>المريض</th>
                                <th>رقم الهاتف</th>
                                <th>التاريخ</th>
                                <th>الوقت</th>
                                <th>الحالة</th>
                                <th>المبلغ</th>
                                <th>ملاحظات</th>
                                <th>الإجراءات</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredAppointments.map((apt) => (
                                <tr key={apt.id}>
                                    <td data-label="المريض">
                                        <strong>{apt.patient.name}</strong>
                                    </td>
                                    <td data-label="رقم الهاتف">{apt.patient.phone}</td>
                                    <td data-label="التاريخ">{formatDateAr(apt.date)}</td>
                                    <td data-label="الوقت">{formatTimeAr(apt.time)}</td>
                                    <td data-label="الحالة">
                                        <span className={`badge badge-${apt.status === 'PENDING' ? 'warning' :
                                            apt.status === 'CONFIRMED' ? 'primary' :
                                                apt.status === 'COMPLETED' ? 'success' : 'danger'
                                            }`}>
                                            {appointmentStatusAr[apt.status]}
                                        </span>
                                    </td>
                                    <td data-label="المبلغ">
                                        {apt.actualPrice ? (
                                            <span className="text-success" style={{ fontWeight: '600' }}>
                                                {formatCurrency(apt.actualPrice)}
                                            </span>
                                        ) : (
                                            <span className="text-muted">-</span>
                                        )}
                                    </td>
                                    <td data-label="ملاحظات">
                                        <span className="text-muted">
                                            {apt.notes || '-'}
                                        </span>
                                    </td>
                                    <td>
                                        <div className="flex gap-xs">
                                            {apt.status === 'PENDING' && (
                                                <>
                                                    <button
                                                        className="btn btn-success btn-sm"
                                                        onClick={() => updateStatus(apt.id, 'CONFIRMED')}
                                                    >
                                                        تأكيد
                                                    </button>
                                                    <button
                                                        className="btn btn-danger btn-sm"
                                                        onClick={() => updateStatus(apt.id, 'CANCELLED')}
                                                    >
                                                        إلغاء
                                                    </button>
                                                </>
                                            )}
                                            {apt.status === 'CONFIRMED' && (
                                                <button
                                                    className="btn btn-secondary btn-sm"
                                                    onClick={() => openCompleteModal(apt)}
                                                >
                                                    إتمام
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Complete Appointment Modal */}
            {showCompleteModal && selectedAppointment && (
                <div className="modal-overlay" onClick={() => setShowCompleteModal(false)}>
                    <div className="modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3 className="modal-title">إتمام الموعد</h3>
                            <button className="modal-close" onClick={() => setShowCompleteModal(false)}>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M18 6L6 18M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        <div className="modal-body">
                            <div style={{
                                padding: 'var(--spacing-md)',
                                background: 'var(--gray-50)',
                                borderRadius: 'var(--border-radius)',
                                marginBottom: 'var(--spacing-lg)',
                            }}>
                                <div className="flex-between mb-sm">
                                    <span className="text-muted">المريض:</span>
                                    <strong>{selectedAppointment.patient.name}</strong>
                                </div>
                                <div className="flex-between mb-sm">
                                    <span className="text-muted">التاريخ:</span>
                                    <span>{formatDateAr(selectedAppointment.date)}</span>
                                </div>
                                <div className="flex-between">
                                    <span className="text-muted">الوقت:</span>
                                    <span>{formatTimeAr(selectedAppointment.time)}</span>
                                </div>
                            </div>

                            <div className="form-group">
                                <label className="form-label">السعر الفعلي (دج) *</label>
                                <input
                                    type="number"
                                    className="form-input"
                                    placeholder="أدخل المبلغ المحصّل"
                                    value={actualPrice}
                                    onChange={(e) => setActualPrice(e.target.value)}
                                    min="0"
                                    style={{ fontSize: 'var(--font-size-xl)', textAlign: 'center' }}
                                />
                                {selectedAppointment.doctor?.priceRange && (
                                    <small className="text-muted">
                                        السعر الافتراضي: {selectedAppointment.doctor.priceRange}
                                    </small>
                                )}
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button
                                className="btn btn-success"
                                onClick={handleComplete}
                                disabled={completing || !actualPrice}
                            >
                                {completing ? 'جاري الإتمام...' : 'تأكيد الإتمام'}
                            </button>
                            <button className="btn btn-ghost" onClick={() => setShowCompleteModal(false)}>
                                إلغاء
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
