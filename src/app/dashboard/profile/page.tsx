'use client';

import { useEffect, useState, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { algerianWilayas, medicalSpecialties, arabicDays } from '@/lib/utils';
import Image from 'next/image';

interface Doctor {
    id: number;
    name: string;
    specialty: string;
    city: string;
    clinicAddress: string | null;
    workingHours: Record<string, { start: string; end: string } | null> | null;
    priceRange: string | null;
    phone: string | null;
    bio: string | null;
    profileImage: string | null;
}

export default function ProfilePage() {
    const { data: session } = useSession();
    const [doctor, setDoctor] = useState<Doctor | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [isCustomSpecialty, setIsCustomSpecialty] = useState(false);
    const [customSpecialty, setCustomSpecialty] = useState('');
    const [form, setForm] = useState({
        name: '',
        specialty: '',
        city: '',
        clinicAddress: '',
        phone: '',
        bio: '',
        priceRange: '',
        profileImage: '',
        workingHours: {} as Record<string, { start: string; end: string } | null>,
    });

    const fetchProfile = useCallback(async () => {
        try {
            const res = await fetch(`/api/doctors/${session?.user.doctorId}`);
            const data = await res.json();
            if (data.success) {
                const currentSpecialty = data.data.specialty || '';
                const isCustom = currentSpecialty && !medicalSpecialties.includes(currentSpecialty);

                setDoctor(data.data);
                setForm({
                    name: data.data.name || '',
                    specialty: isCustom ? 'OTHER' : currentSpecialty,
                    city: data.data.city || '',
                    clinicAddress: data.data.clinicAddress || '',
                    phone: data.data.phone || '',
                    bio: data.data.bio || '',
                    priceRange: data.data.priceRange || '',
                    profileImage: data.data.profileImage || '',
                    workingHours: data.data.workingHours || {},
                });
                setIsCustomSpecialty(isCustom);
                setCustomSpecialty(isCustom ? currentSpecialty : '');
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    }, [session?.user.doctorId]);

    useEffect(() => {
        if (session?.user.doctorId) {
            fetchProfile();
        }
    }, [session?.user.doctorId, fetchProfile]);

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate image type
        if (!file.type.startsWith('image/')) {
            setMessage({ type: 'error', text: 'الملف يجب أن يكون صورة' });
            return;
        }

        setUploading(true);
        setMessage({ type: '', text: '' });

        try {
            const { getCloudinaryUploadUrl, cloudinaryConfig } = await import('@/lib/cloudinary');

            const formData = new FormData();
            formData.append('file', file);
            formData.append('upload_preset', cloudinaryConfig.uploadPreset);

            const uploadRes = await fetch(getCloudinaryUploadUrl(file.type), {
                method: 'POST',
                body: formData,
            });

            const uploadData = await uploadRes.json();

            if (!uploadRes.ok) {
                throw new Error(uploadData.error?.message || 'فشل تحميل الصورة إلى Cloudinary');
            }

            const publicUrl = uploadData.secure_url;

            // Notify API
            const res = await fetch('/api/upload', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ url: publicUrl }),
            });

            const data = await res.json();
            if (data.success) {
                setForm(prev => ({ ...prev, profileImage: data.url }));
                setMessage({ type: 'success', text: 'تم تحميل الصورة بنجاح. لا تنسى حفظ التغييرات' });
            } else {
                setMessage({ type: 'error', text: data.error });
            }
        } catch (error: any) {
            console.error('Upload error:', error);
            setMessage({ type: 'error', text: 'حدث خطأ أثناء تحميل الصورة: ' + (error.message || '') });
        } finally {
            setUploading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setMessage({ type: '', text: '' });

        const finalSpecialty = isCustomSpecialty ? customSpecialty : form.specialty;

        try {
            const res = await fetch(`/api/doctors/${session?.user.doctorId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...form,
                    specialty: finalSpecialty
                }),
            });
            const data = await res.json();

            if (data.success) {
                setMessage({ type: 'success', text: data.message });
                fetchProfile();
            } else {
                setMessage({ type: 'error', text: data.error });
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'حدث خطأ. يرجى المحاولة مرة أخرى' });
        } finally {
            setSaving(false);
        }
    };

    const toggleDay = (day: string) => {
        setForm((prev) => ({
            ...prev,
            workingHours: {
                ...prev.workingHours,
                [day]: prev.workingHours[day] ? null : { start: '09:00', end: '17:00' },
            },
        }));
    };

    const updateDayHours = (day: string, field: 'start' | 'end', value: string) => {
        setForm((prev) => ({
            ...prev,
            workingHours: {
                ...prev.workingHours,
                [day]: { ...prev.workingHours[day]!, [field]: value },
            },
        }));
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
            <div className="mb-xl">
                <h1 style={{ marginBottom: 'var(--spacing-xs)' }}>الملف الشخصي</h1>
                <p className="text-muted">تعديل بيانات ملفك الشخصي وصورتك</p>
            </div>

            {message.text && (
                <div className={`alert ${message.type === 'success' ? 'alert-success' : 'alert-danger'} mb-lg`}>
                    {message.text}
                </div>
            )}

            <form onSubmit={handleSubmit}>
                <div className="grid" style={{ gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-xl)' }}>
                    {/* Basic Info & Image */}
                    <div>
                        <div className="card mb-lg">
                            <div className="card-header">
                                <h3 style={{ margin: 0 }}>الصورة الشخصية</h3>
                            </div>
                            <div className="card-body text-center">
                                <div style={{
                                    width: '150px',
                                    height: '150px',
                                    borderRadius: 'var(--border-radius-full)',
                                    margin: '0 auto var(--spacing-md)',
                                    overflow: 'hidden',
                                    border: '4px solid var(--white)',
                                    boxShadow: 'var(--shadow-md)',
                                    background: 'var(--gray-100)',
                                    position: 'relative'
                                }}>
                                    {form.profileImage ? (
                                        <Image
                                            src={form.profileImage}
                                            alt="Profile"
                                            fill
                                            style={{ objectFit: 'cover' }}
                                        />
                                    ) : (
                                        <div className="flex-center" style={{ height: '100%', color: 'var(--gray-400)' }}>
                                            <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                                                <circle cx="12" cy="7" r="4" />
                                            </svg>
                                        </div>
                                    )}
                                    {uploading && (
                                        <div className="loading-overlay" style={{ position: 'absolute', background: 'rgba(255,255,255,0.7)' }}>
                                            <div className="spinner" style={{ width: '30px', height: '30px' }}></div>
                                        </div>
                                    )}
                                </div>
                                <label className="btn btn-outline btn-sm">
                                    تغيير الصورة
                                    <input type="file" hidden accept="image/*" onChange={handleImageUpload} disabled={uploading} />
                                </label>
                            </div>
                        </div>

                        <div className="card">
                            <div className="card-header">
                                <h3 style={{ margin: 0 }}>المعلومات الأساسية</h3>
                            </div>
                            <div className="card-body">
                                <div className="form-group">
                                    <label className="form-label">الاسم الكامل *</label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        value={form.name}
                                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="form-label">التخصص *</label>
                                    <select
                                        className="form-select"
                                        value={isCustomSpecialty ? 'OTHER' : form.specialty}
                                        onChange={(e) => {
                                            if (e.target.value === 'OTHER') {
                                                setIsCustomSpecialty(true);
                                                setForm({ ...form, specialty: '' });
                                            } else {
                                                setIsCustomSpecialty(false);
                                                setForm({ ...form, specialty: e.target.value });
                                            }
                                        }}
                                        required
                                    >
                                        <option value="">اختر التخصص</option>
                                        {medicalSpecialties.map((s) => (
                                            <option key={s} value={s}>{s}</option>
                                        ))}
                                        <option value="OTHER" style={{ fontWeight: 'bold' }}>أخرى... (تخصص جديد)</option>
                                    </select>
                                </div>

                                {isCustomSpecialty && (
                                    <div className="form-group fade-in">
                                        <label className="form-label">اكتب تخصصك هنا *</label>
                                        <input
                                            type="text"
                                            className="form-input"
                                            placeholder="مثال: طب الأعشاب..."
                                            value={customSpecialty}
                                            onChange={(e) => setCustomSpecialty(e.target.value)}
                                            required
                                        />
                                    </div>
                                )}

                                <div className="form-group">
                                    <label className="form-label">الولاية *</label>
                                    <select
                                        className="form-select"
                                        value={form.city}
                                        onChange={(e) => setForm({ ...form, city: e.target.value })}
                                        required
                                    >
                                        <option value="">اختر الولاية</option>
                                        {algerianWilayas.map((c) => (
                                            <option key={c} value={c}>{c}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label className="form-label">عنوان العيادة</label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        value={form.clinicAddress}
                                        onChange={(e) => setForm({ ...form, clinicAddress: e.target.value })}
                                        placeholder="مثال: شارع ديدوش مراد، رقم 45"
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="form-label">رقم الهاتف</label>
                                    <input
                                        type="tel"
                                        className="form-input"
                                        value={form.phone}
                                        onChange={(e) => setForm({ ...form, phone: e.target.value })}
                                        placeholder="0555123456"
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="form-label">سعر الكشف</label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        value={form.priceRange}
                                        onChange={(e) => setForm({ ...form, priceRange: e.target.value })}
                                        placeholder="مثال: 2000-3000 دج"
                                    />
                                </div>

                                <div className="form-group" style={{ marginBottom: 0 }}>
                                    <label className="form-label">نبذة عنك</label>
                                    <textarea
                                        className="form-textarea"
                                        rows={4}
                                        value={form.bio}
                                        onChange={(e) => setForm({ ...form, bio: e.target.value })}
                                        placeholder="اكتب نبذة قصيرة عن خبرتك وتخصصك..."
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Working Hours */}
                    <div className="card">
                        <div className="card-header">
                            <h3 style={{ margin: 0 }}>مواعيد العمل</h3>
                        </div>
                        <div className="card-body">
                            <p className="text-muted mb-lg">حدد أيام وساعات العمل الخاصة بك</p>

                            {Object.entries(arabicDays).map(([day, dayAr]) => {
                                const isActive = !!form.workingHours[day];
                                return (
                                    <div key={day} style={{
                                        padding: 'var(--spacing-md)',
                                        marginBottom: 'var(--spacing-sm)',
                                        background: isActive ? 'var(--bg-primary)' : 'var(--gray-50)',
                                        borderRadius: 'var(--border-radius)',
                                        transition: 'all 0.3s ease'
                                    }}>
                                        <div className="flex-between mb-sm">
                                            <label style={{ fontWeight: '600' }}>{dayAr}</label>
                                            <button
                                                type="button"
                                                className={`btn btn-sm ${isActive ? 'btn-danger' : 'btn-success'}`}
                                                onClick={() => toggleDay(day)}
                                            >
                                                {isActive ? 'إغلاق' : 'فتح'}
                                            </button>
                                        </div>
                                        {isActive && (
                                            <div className="flex gap-md">
                                                <div style={{ flex: 1 }}>
                                                    <label className="text-muted" style={{ fontSize: 'var(--font-size-xs)' }}>من</label>
                                                    <input
                                                        type="time"
                                                        className="form-input"
                                                        value={form.workingHours[day]?.start || '09:00'}
                                                        onChange={(e) => updateDayHours(day, 'start', e.target.value)}
                                                    />
                                                </div>
                                                <div style={{ flex: 1 }}>
                                                    <label className="text-muted" style={{ fontSize: 'var(--font-size-xs)' }}>إلى</label>
                                                    <input
                                                        type="time"
                                                        className="form-input"
                                                        value={form.workingHours[day]?.end || '17:00'}
                                                        onChange={(e) => updateDayHours(day, 'end', e.target.value)}
                                                    />
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                <div className="mt-xl">
                    <button
                        type="submit"
                        className="btn btn-primary btn-lg"
                        disabled={saving}
                        style={{ minWidth: '200px' }}
                    >
                        {saving ? 'جاري الحفظ...' : 'حفظ التغييرات'}
                    </button>
                </div>
            </form>
        </>
    );
}
