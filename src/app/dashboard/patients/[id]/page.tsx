'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { formatDateAr, formatTimeAr, formatFileSize, appointmentStatusAr } from '@/lib/utils';

interface Patient {
    id: number;
    name: string;
    phone: string;
    email: string | null;
    notes: string | null;
    createdAt: string;
    appointments: Array<{
        id: number;
        date: string;
        time: string;
        status: string;
        notes: string | null;
    }>;
    files: Array<{
        id: number;
        fileName: string;
        fileType: string;
        fileSize: number;
        filePath: string;
        uploadedAt: string;
    }>;
}

export default function PatientDetailPage() {
    const params = useParams();
    const [patient, setPatient] = useState<Patient | null>(null);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [editNotes, setEditNotes] = useState(false);
    const [notes, setNotes] = useState('');

    const fetchPatient = useCallback(async () => {
        try {
            const res = await fetch(`/api/patients/${params.id}`);
            const data = await res.json();
            if (data.success) {
                setPatient(data.data);
                setNotes(data.data.notes || '');
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    }, [params.id]);

    useEffect(() => {
        if (params.id) {
            fetchPatient();
        }
    }, [params.id, fetchPatient]);

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Basic client-side validation
        if (file.size > 10 * 1024 * 1024) {
            alert('حجم الملف يجب أن يكون أقل من 10 ميغابايت');
            return;
        }

        setUploading(true);

        try {
            // Import supabase dynamically to avoid issues
            const { supabase } = await import('@/lib/supabase');

            // Generate unique filename
            const ext = file.name.split('.').pop();
            const filename = `${Date.now()}-${Math.random().toString(36).substring(7)}.${ext}`;
            const filePath = `patient-files/${filename}`;

            // Upload directly to Supabase
            const { data: uploadData, error: uploadError } = await supabase.storage
                .from('patient-files')
                .upload(filename, file);

            if (uploadError) throw uploadError;

            // Get public URL
            const { data: { publicUrl } } = supabase.storage
                .from('patient-files')
                .getPublicUrl(filename);

            // Notify our API to save the record
            const res = await fetch('/api/files', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    patientId: params.id,
                    filePath: publicUrl,
                    fileName: file.name,
                    fileType: file.type,
                    fileSize: file.size,
                }),
            });

            const data = await res.json();
            if (data.success) {
                fetchPatient();
            } else {
                alert(data.error);
            }
        } catch (error: any) {
            console.error('Upload error:', error);
            alert('حدث خطأ أثناء الرفع: ' + (error.message || error));
        } finally {
            setUploading(false);
        }
    };

    const handleDeleteFile = async (fileId: number) => {
        if (!confirm('هل أنت متأكد من حذف هذا الملف؟')) return;

        try {
            const res = await fetch(`/api/files/${fileId}`, { method: 'DELETE' });
            const data = await res.json();
            if (data.success) {
                fetchPatient();
            }
        } catch (error) {
            console.error(error);
        }
    };

    const saveNotes = async () => {
        try {
            const res = await fetch(`/api/patients/${params.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ notes }),
            });
            const data = await res.json();
            if (data.success) {
                setEditNotes(false);
                fetchPatient();
            }
        } catch (error) {
            console.error(error);
        }
    };

    if (loading) {
        return (
            <div className="flex-center" style={{ padding: 'var(--spacing-3xl)' }}>
                <div className="spinner"></div>
            </div>
        );
    }

    if (!patient) {
        return (
            <div className="card text-center" style={{ padding: 'var(--spacing-3xl)' }}>
                <p>المريض غير موجود</p>
                <Link href="/dashboard/patients" className="btn btn-primary mt-md">
                    العودة للمرضى
                </Link>
            </div>
        );
    }

    return (
        <>
            <div className="flex-between mb-xl">
                <div>
                    <Link href="/dashboard/patients" className="text-muted" style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--spacing-xs)', marginBottom: 'var(--spacing-sm)' }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M19 12H5M12 19l7-7-7-7" />
                        </svg>
                        العودة للمرضى
                    </Link>
                    <h1 style={{ marginBottom: 0 }}>{patient.name}</h1>
                </div>
            </div>

            <div className="grid" style={{ gridTemplateColumns: '1fr 350px', gap: 'var(--spacing-xl)', alignItems: 'start' }}>
                {/* Main Content */}
                <div>
                    {/* Appointments History */}
                    <div className="card mb-lg">
                        <div className="card-header">
                            <h3 style={{ margin: 0 }}>سجل المواعيد ({patient.appointments.length})</h3>
                        </div>
                        <div className="card-body" style={{ padding: 0 }}>
                            {patient.appointments.length === 0 ? (
                                <p className="text-muted text-center" style={{ padding: 'var(--spacing-xl)' }}>لا توجد مواعيد</p>
                            ) : (
                                <table className="table">
                                    <thead>
                                        <tr>
                                            <th>التاريخ</th>
                                            <th>الوقت</th>
                                            <th>الحالة</th>
                                            <th>ملاحظات</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {patient.appointments.map((apt) => (
                                            <tr key={apt.id}>
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
                                                <td className="text-muted">{apt.notes || '-'}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </div>

                    {/* Files */}
                    <div className="card">
                        <div className="card-header flex-between">
                            <h3 style={{ margin: 0 }}>الملفات ({patient.files.length})</h3>
                            <label className="btn btn-primary btn-sm" style={{ cursor: 'pointer' }}>
                                {uploading ? 'جاري الرفع...' : 'رفع ملف'}
                                <input
                                    type="file"
                                    accept=".pdf,.jpg,.jpeg,.png,.webp"
                                    onChange={handleFileUpload}
                                    disabled={uploading}
                                    style={{ display: 'none' }}
                                />
                            </label>
                        </div>
                        <div className="card-body">
                            {patient.files.length === 0 ? (
                                <p className="text-muted text-center">لا توجد ملفات</p>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-sm)' }}>
                                    {patient.files.map((file) => (
                                        <div key={file.id} className="flex-between" style={{
                                            padding: 'var(--spacing-md)',
                                            background: 'var(--gray-50)',
                                            borderRadius: 'var(--border-radius)',
                                        }}>
                                            <div className="flex gap-md">
                                                <div style={{
                                                    width: '40px',
                                                    height: '40px',
                                                    borderRadius: 'var(--border-radius)',
                                                    background: file.fileType.includes('pdf') ? 'rgba(220, 53, 69, 0.1)' : 'rgba(0, 102, 204, 0.1)',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    color: file.fileType.includes('pdf') ? 'var(--danger)' : 'var(--primary)',
                                                }}>
                                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                                                        <polyline points="14 2 14 8 20 8" />
                                                    </svg>
                                                </div>
                                                <div>
                                                    <strong style={{ fontSize: 'var(--font-size-sm)' }}>{file.fileName}</strong>
                                                    <p className="text-muted" style={{ margin: 0, fontSize: 'var(--font-size-xs)' }}>
                                                        {formatFileSize(file.fileSize)} • {formatDateAr(file.uploadedAt)}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex gap-xs">
                                                <a href={`/api/files/${file.id}`} target="_blank" className="btn btn-ghost btn-sm">
                                                    عرض
                                                </a>
                                                <button className="btn btn-ghost btn-sm" onClick={() => handleDeleteFile(file.id)}>
                                                    حذف
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Sidebar */}
                <div className="card" style={{ position: 'sticky', top: '20px' }}>
                    <div className="card-body">
                        <div style={{
                            width: '80px',
                            height: '80px',
                            margin: '0 auto var(--spacing-lg)',
                            borderRadius: 'var(--border-radius-full)',
                            background: 'var(--bg-primary)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'var(--primary)',
                        }}>
                            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
                                <circle cx="12" cy="7" r="4" />
                            </svg>
                        </div>

                        <h3 className="text-center" style={{ marginBottom: 'var(--spacing-lg)' }}>{patient.name}</h3>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
                            <div>
                                <label className="text-muted" style={{ fontSize: 'var(--font-size-sm)' }}>رقم الهاتف</label>
                                <p style={{ margin: 0, fontWeight: '600' }}>{patient.phone}</p>
                            </div>

                            {patient.email && (
                                <div>
                                    <label className="text-muted" style={{ fontSize: 'var(--font-size-sm)' }}>البريد الإلكتروني</label>
                                    <p style={{ margin: 0 }}>{patient.email}</p>
                                </div>
                            )}

                            <div>
                                <label className="text-muted" style={{ fontSize: 'var(--font-size-sm)' }}>تاريخ التسجيل</label>
                                <p style={{ margin: 0 }}>{formatDateAr(patient.createdAt)}</p>
                            </div>

                            <div>
                                <div className="flex-between mb-sm">
                                    <label className="text-muted" style={{ fontSize: 'var(--font-size-sm)' }}>الملاحظات</label>
                                    {!editNotes && (
                                        <button className="btn btn-ghost btn-sm" onClick={() => setEditNotes(true)}>
                                            تعديل
                                        </button>
                                    )}
                                </div>
                                {editNotes ? (
                                    <>
                                        <textarea
                                            className="form-textarea"
                                            rows={4}
                                            value={notes}
                                            onChange={(e) => setNotes(e.target.value)}
                                        />
                                        <div className="flex gap-sm mt-sm">
                                            <button className="btn btn-primary btn-sm" onClick={saveNotes}>
                                                حفظ
                                            </button>
                                            <button className="btn btn-ghost btn-sm" onClick={() => setEditNotes(false)}>
                                                إلغاء
                                            </button>
                                        </div>
                                    </>
                                ) : (
                                    <p style={{ margin: 0 }}>{patient.notes || 'لا توجد ملاحظات'}</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
