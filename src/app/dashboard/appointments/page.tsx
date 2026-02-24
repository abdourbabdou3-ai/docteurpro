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

    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        fetchAppointments();
    }, []);

    const fetchAppointments = async () => {
        try {
            const res = await fetch('/api/appointments');
            if (!res.ok) throw new Error('Failed to fetch data');
            const data = await res.json();
            if (data.success && data.data?.appointments) {
                setAppointments(data.data.appointments);
            }
        } catch (error) {
            console.error('Fetch Error:', error);
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
                    <h1 style={{ marginBottom: 'var(--spacing-xs)' }}>المواعيد</h1>
                    <p className="text-muted">إدارة جميع مواعيدك</p>
                </div>
            </div>

            {/* Filters */}
            <div className="card mb-lg" style={{ padding: 'var(--spacing-md)', overflowX: 'auto' }}>
                <div className="flex gap-sm" style={{ flexWrap: 'nowrap', minWidth: 'max-content' }}>
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

            {/* Appointments View */}
            <div className="appointments-content">
                {filteredAppointments.length === 0 ? (
                    <div className="card text-center" style={{ padding: 'var(--spacing-3xl)' }}>
                        <div style={{ opacity: 0.3, marginBottom: 'var(--spacing-md)' }}>
                            <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                                <path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                        </div>
                        <p className="text-muted">لا توجد مواعيد حالياً</p>
                    </div>
                ) : (
                    <>
                        {/* Desktop Table - Hidden on small mobile */}
                        <div className="table-container hidden-mobile">
                            <table className="table">
                                <thead>
                                    <tr>
                                        <th>المريض</th>
                                        <th>التاريخ / الوقت</th>
                                        <th>الحالة</th>
                                        <th>المبلغ</th>
                                        <th>الإجراءات</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredAppointments.map((apt) => (
                                        <tr key={apt.id}>
                                            <td>
                                                <strong>{apt.patient?.name || 'غير معروف'}</strong>
                                                <div className="text-muted" style={{ fontSize: 'var(--font-size-xs)' }}>{apt.patient?.phone || '-'}</div>
                                            </td>
                                            <td>
                                                <div>{formatDateAr(apt.date)}</div>
                                                <div className="text-muted">{formatTimeAr(apt.time)}</div>
                                            </td>
                                            <td>
                                                <span className={`badge badge-${apt.status === 'PENDING' ? 'warning' :
                                                    apt.status === 'CONFIRMED' ? 'primary' :
                                                        apt.status === 'COMPLETED' ? 'success' : 'danger'
                                                    }`}>
                                                    {appointmentStatusAr[apt.status] || apt.status}
                                                </span>
                                            </td>
                                            <td>{apt.actualPrice ? formatCurrency(apt.actualPrice) : '-'}</td>
                                            <td>
                                                <div className="flex gap-xs">
                                                    {apt.status === 'PENDING' && (
                                                        <>
                                                            <button className="btn btn-success btn-sm" onClick={() => updateStatus(apt.id, 'CONFIRMED')}>تأكيد</button>
                                                            <button className="btn btn-danger btn-sm" onClick={() => updateStatus(apt.id, 'CANCELLED')}>إلغاء</button>
                                                        </>
                                                    )}
                                                    {apt.status === 'CONFIRMED' && (
                                                        <button className="btn btn-secondary btn-sm" onClick={() => openCompleteModal(apt)}>إتمام</button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Mobile Cards - Shown only on mobile */}
                        <div className="show-mobile">
                            {filteredAppointments.map((apt) => (
                                <div key={apt.id} className="card mb-md" style={{ padding: 'var(--spacing-md)' }}>
                                    <div className="flex-between mb-sm">
                                        <strong>{apt.patient?.name || 'غير معروف'}</strong>
                                        <span className={`badge badge-${apt.status === 'PENDING' ? 'warning' :
                                            apt.status === 'CONFIRMED' ? 'primary' :
                                                apt.status === 'COMPLETED' ? 'success' : 'danger'
                                            }`}>
                                            {appointmentStatusAr[apt.status] || apt.status}
                                        </span>
                                    </div>
                                    <div className="text-muted mb-sm" style={{ fontSize: 'var(--font-size-sm)' }}>
                                        {apt.patient?.phone}
                                    </div>
                                    <div className="flex-between mb-md">
                                        <div>
                                            <div style={{ fontSize: 'var(--font-size-sm)' }}>{formatDateAr(apt.date)}</div>
                                            <div className="text-muted" style={{ fontSize: 'var(--font-size-xs)' }}>{formatTimeAr(apt.time)}</div>
                                        </div>
                                        {apt.actualPrice && (
                                            <div className="text-success" style={{ fontWeight: '600' }}>{formatCurrency(apt.actualPrice)}</div>
                                        )}
                                    </div>
                                    <div className="flex gap-sm">
                                        {apt.status === 'PENDING' && (
                                            <>
                                                <button className="btn btn-success btn-sm flex-1" onClick={() => updateStatus(apt.id, 'CONFIRMED')}>تأكيد</button>
                                                <button className="btn btn-danger btn-sm flex-1" onClick={() => updateStatus(apt.id, 'CANCELLED')}>إلغاء</button>
                                            </>
                                        )}
                                        {apt.status === 'CONFIRMED' && (
                                            <button className="btn btn-secondary btn-sm btn-block" onClick={() => openCompleteModal(apt)}>إتمام الموعد</button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
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
                                    <strong>{selectedAppointment.patient?.name || 'غير معروف'}</strong>
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
