'use client';

import { useEffect, useState, useCallback } from 'react';
import { formatDateAr, formatCurrency, appointmentStatusAr } from '@/lib/utils';

interface ReportData {
    period: string;
    totalAppointments: number;
    completedAppointments: number;
    cancelledAppointments: number;
    pendingAppointments: number;
    totalEarnings: number;
    newPatients: number;
    appointments: Array<{
        id: number;
        date: string;
        time: string;
        status: string;
        actualPrice: number | null;
        patient: { name: string; phone: string };
    }>;
}

export default function ReportsPage() {
    const [loading, setLoading] = useState(true);
    const [generating, setGenerating] = useState(false);
    const [data, setData] = useState<ReportData | null>(null);
    const [month, setMonth] = useState(() => {
        const now = new Date();
        return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    });

    const fetchReportData = useCallback(async () => {
        setLoading(true);
        try {
            const [year, monthNum] = month.split('-').map(Number);
            const startDate = new Date(year, monthNum - 1, 1);
            const endDate = new Date(year, monthNum, 0);
            endDate.setHours(23, 59, 59, 999);

            const res = await fetch(
                `/api/appointments?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}&limit=1000`
            );
            const result = await res.json();

            if (result.success) {
                const appointments = result.data.appointments;
                const completed = appointments.filter((a: any) => a.status === 'COMPLETED');
                const cancelled = appointments.filter((a: any) => a.status === 'CANCELLED');
                const pending = appointments.filter((a: any) => a.status === 'PENDING');
                const earnings = completed.reduce((sum: number, a: any) => sum + (Number(a.actualPrice) || 0), 0);

                setData({
                    period: new Date(year, monthNum - 1).toLocaleDateString('ar-DZ', { month: 'long', year: 'numeric' }),
                    totalAppointments: appointments.length,
                    completedAppointments: completed.length,
                    cancelledAppointments: cancelled.length,
                    pendingAppointments: pending.length,
                    totalEarnings: earnings,
                    newPatients: new Set(appointments.map((a: any) => a.patient.id)).size,
                    appointments: appointments.sort((a: any, b: any) =>
                        new Date(a.date).getTime() - new Date(b.date).getTime()
                    ),
                });
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    }, [month]);

    useEffect(() => {
        fetchReportData();
    }, [fetchReportData]);

    const generatePDF = async () => {
        if (!data) return;

        const element = document.getElementById('report-content');
        if (!element) return;

        setGenerating(true);

        try {
            const html2canvas = (await import('html2canvas')).default;
            const { jsPDF } = await import('jspdf');

            const canvas = await html2canvas(element, {
                scale: 2, // Higher resolution
                useCORS: true,
                logging: false,
                windowWidth: element.scrollWidth,
                windowHeight: element.scrollHeight
            });

            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('p', 'mm', 'a4');

            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();
            const imgWidth = canvas.width;
            const imgHeight = canvas.height;
            const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);

            const finalWidth = imgWidth * ratio;
            const finalHeight = imgHeight * ratio;

            pdf.addImage(imgData, 'PNG', (pdfWidth - finalWidth) / 2, 0, finalWidth, finalHeight);
            pdf.save(`report-${month}.pdf`);
        } catch (error) {
            console.error('Error generating PDF:', error);
            alert('حدث خطأ أثناء إنشاء ملف PDF. يرجى المحاولة مرة أخرى.');
        } finally {
            setGenerating(false);
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
            <div className="flex-between mb-xl flex-wrap gap-md">
                <div>
                    <h1 style={{ marginBottom: 'var(--spacing-xs)' }}>التقارير</h1>
                    <p className="text-muted">تقارير شهرية مفصلة</p>
                </div>
                <div className="flex gap-md flex-wrap">
                    <input
                        type="month"
                        className="form-input"
                        value={month}
                        onChange={(e) => setMonth(e.target.value)}
                        style={{ width: 'auto' }}
                    />
                    <button
                        className="btn btn-primary"
                        onClick={generatePDF}
                        disabled={generating || !data}
                    >
                        {generating ? 'جاري التحميل...' : 'تحميل PDF'}
                    </button>
                </div>
            </div>

            {data && (
                <div id="report-content" style={{ background: 'var(--white)', padding: 'var(--spacing-md)', borderRadius: 'var(--border-radius-lg)' }}>
                    <div className="mb-xl">
                        <h2 style={{ color: 'var(--primary)' }}>تقرير شهر {data.period}</h2>
                        <hr style={{ border: 'none', borderTop: '1px solid var(--gray-200)', marginTop: 'var(--spacing-sm)' }} />
                    </div>
                    {/* Summary Cards */}
                    <div className="grid grid-3 mb-xl">
                        <div className="card" style={{ background: 'linear-gradient(135deg, #10b981, #059669)', color: 'white', padding: 'var(--spacing-lg)' }}>
                            <div style={{ fontSize: 'var(--font-size-sm)', opacity: 0.9, marginBottom: 'var(--spacing-xs)' }}>
                                إجمالي الأرباح
                            </div>
                            <div style={{ fontSize: 'var(--font-size-2xl)', fontWeight: '800' }}>
                                {formatCurrency(data.totalEarnings)}
                            </div>
                        </div>

                        <div className="card" style={{ background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)', color: 'white', padding: 'var(--spacing-lg)' }}>
                            <div style={{ fontSize: 'var(--font-size-sm)', opacity: 0.9, marginBottom: 'var(--spacing-xs)' }}>
                                إجمالي المواعيد
                            </div>
                            <div style={{ fontSize: 'var(--font-size-2xl)', fontWeight: '800' }}>
                                {data.totalAppointments}
                            </div>
                        </div>

                        <div className="card" style={{ background: 'linear-gradient(135deg, #8b5cf6, #6d28d9)', color: 'white', padding: 'var(--spacing-lg)' }}>
                            <div style={{ fontSize: 'var(--font-size-sm)', opacity: 0.9, marginBottom: 'var(--spacing-xs)' }}>
                                مرضى جدد
                            </div>
                            <div style={{ fontSize: 'var(--font-size-2xl)', fontWeight: '800' }}>
                                {data.newPatients}
                            </div>
                        </div>
                    </div>

                    {/* Stats Breakdown */}
                    <div className="grid grid-4 mb-xl">
                        <div className="card text-center" style={{ padding: 'var(--spacing-lg)' }}>
                            <div className="text-success" style={{ fontSize: 'var(--font-size-2xl)', fontWeight: '800' }}>
                                {data.completedAppointments}
                            </div>
                            <div className="text-muted">مكتمل</div>
                        </div>
                        <div className="card text-center" style={{ padding: 'var(--spacing-lg)' }}>
                            <div className="text-warning" style={{ fontSize: 'var(--font-size-2xl)', fontWeight: '800' }}>
                                {data.pendingAppointments}
                            </div>
                            <div className="text-muted">قيد الانتظار</div>
                        </div>
                        <div className="card text-center" style={{ padding: 'var(--spacing-lg)' }}>
                            <div className="text-danger" style={{ fontSize: 'var(--font-size-2xl)', fontWeight: '800' }}>
                                {data.cancelledAppointments}
                            </div>
                            <div className="text-muted">ملغي</div>
                        </div>
                        <div className="card text-center" style={{ padding: 'var(--spacing-lg)' }}>
                            <div className="text-primary" style={{ fontSize: 'var(--font-size-2xl)', fontWeight: '800' }}>
                                {data.completedAppointments > 0 ? formatCurrency(data.totalEarnings / data.completedAppointments) : '0'}
                            </div>
                            <div className="text-muted">متوسط السعر</div>
                        </div>
                    </div>

                    {/* Appointments Table */}
                    <div className="card">
                        <div className="card-header">
                            <h3 style={{ margin: 0 }}>تفاصيل المواعيد</h3>
                        </div>
                        <div className="table-container">
                            <table className="table">
                                <thead>
                                    <tr>
                                        <th>المريض</th>
                                        <th>الهاتف</th>
                                        <th>التاريخ</th>
                                        <th>الوقت</th>
                                        <th>الحالة</th>
                                        <th>المبلغ</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {data.appointments.map((apt) => (
                                        <tr key={apt.id}>
                                            <td><strong>{apt.patient.name}</strong></td>
                                            <td>{apt.patient.phone}</td>
                                            <td>{formatDateAr(apt.date)}</td>
                                            <td>{apt.time}</td>
                                            <td>
                                                <span className={`badge badge-${apt.status === 'COMPLETED' ? 'success' :
                                                    apt.status === 'CANCELLED' ? 'danger' :
                                                        apt.status === 'CONFIRMED' ? 'primary' : 'warning'
                                                    }`}>
                                                    {appointmentStatusAr[apt.status]}
                                                </span>
                                            </td>
                                            <td>
                                                {apt.actualPrice ? (
                                                    <span className="text-success" style={{ fontWeight: '600' }}>
                                                        {formatCurrency(apt.actualPrice)}
                                                    </span>
                                                ) : '-'}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
