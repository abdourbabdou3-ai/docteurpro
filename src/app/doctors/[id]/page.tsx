'use client';

import Link from 'next/link';
import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { formatDateAr, formatTimeAr, arabicDays, generateTimeSlots } from '@/lib/utils';
import Image from 'next/image';

interface Doctor {
    id: number;
    name: string;
    specialty: string;
    city: string;
    clinicAddress: string | null;
    workingHours: Record<string, { start: string; end: string } | null> | null;
    priceRange: string | null;
    profileImage: string | null;
    phone: string | null;
    bio: string | null;
    rating: number;
    reviewCount: number;
    reviews: Array<{
        id: number;
        patientName: string;
        rating: number;
        comment: string | null;
        createdAt: string;
    }>;
}

function Navbar() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    return (
        <nav className="navbar">
            <div className="container navbar-container">
                <Link href="/" className="navbar-brand">
                    <svg viewBox="0 0 40 40" fill="none">
                        <circle cx="20" cy="20" r="18" fill="#0066cc" />
                        <path d="M20 10V30M10 20H30" stroke="white" strokeWidth="4" strokeLinecap="round" />
                    </svg>
                    tabib-dz
                </Link>

                <ul className={`navbar-menu ${isMenuOpen ? 'open' : ''}`}>
                    <li><Link href="/" className="navbar-link" onClick={() => setIsMenuOpen(false)}>الرئيسية</Link></li>
                    <li><Link href="/doctors" className="navbar-link active" onClick={() => setIsMenuOpen(false)}>الأطباء</Link></li>
                    <li><Link href="/about" className="navbar-link" onClick={() => setIsMenuOpen(false)}>من نحن</Link></li>
                    <li className="show-mobile" style={{ marginTop: 'var(--spacing-md)' }}>
                        <Link href="/login" className="btn btn-ghost btn-block" onClick={() => setIsMenuOpen(false)}>تسجيل الدخول</Link>
                    </li>
                    <li className="show-mobile">
                        <Link href="/register" className="btn btn-primary btn-block" onClick={() => setIsMenuOpen(false)}>انضم كطبيب</Link>
                    </li>
                </ul>

                <div className="navbar-actions hidden-mobile">
                    {/* Placeholder for install button functionality if needed in this component */}
                    <Link href="/doctors" className="btn btn-ghost">رجوع للأطباء</Link>
                    <Link href="/login" className="btn btn-ghost">دخول</Link>
                </div>

                <button className="navbar-toggle" aria-label="القائمة" onClick={() => setIsMenuOpen(!isMenuOpen)}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        {isMenuOpen ? (
                            <path d="M18 6L6 18M6 6l12 12" />
                        ) : (
                            <path d="M3 12h18M3 6h18M3 18h18" />
                        )}
                    </svg>
                </button>
            </div>
        </nav>
    );
}

// Review Form Component
function ReviewForm({ doctorId, onSuccess }: { doctorId: number; onSuccess: () => void }) {
    const [showForm, setShowForm] = useState(false);
    const [rating, setRating] = useState(5);
    const [hoverRating, setHoverRating] = useState(0);
    const [patientName, setPatientName] = useState('');
    const [comment, setComment] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        setMessage({ type: '', text: '' });

        try {
            const res = await fetch('/api/reviews', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    doctorId,
                    patientName,
                    rating,
                    comment: comment || null,
                }),
            });

            const data = await res.json();

            if (data.success) {
                setMessage({ type: 'success', text: data.message });
                setPatientName('');
                setComment('');
                setRating(5);
                setShowForm(false);
                onSuccess();
            } else {
                setMessage({ type: 'error', text: data.error });
            }
        } catch {
            setMessage({ type: 'error', text: 'حدث خطأ. يرجى المحاولة مرة أخرى' });
        } finally {
            setSubmitting(false);
        }
    };

    if (!showForm) {
        return (
            <div style={{ marginBottom: 'var(--spacing-lg)' }}>
                {message.text && (
                    <div className={`alert ${message.type === 'success' ? 'alert-success' : 'alert-danger'} mb-md`}>
                        {message.text}
                    </div>
                )}
                <button className="btn btn-outline btn-block" onClick={() => setShowForm(true)}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                    </svg>
                    أضف تقييمك
                </button>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} style={{
            marginBottom: 'var(--spacing-lg)',
            padding: 'var(--spacing-md)',
            background: 'var(--bg-primary)',
            borderRadius: 'var(--border-radius)',
        }}>
            <h4 style={{ marginBottom: 'var(--spacing-md)' }}>أضف تقييمك</h4>

            {/* Star Rating */}
            <div className="form-group">
                <label className="form-label">التقييم *</label>
                <div className="flex gap-xs">
                    {[1, 2, 3, 4, 5].map((star) => (
                        <button
                            key={star}
                            type="button"
                            onClick={() => setRating(star)}
                            onMouseEnter={() => setHoverRating(star)}
                            onMouseLeave={() => setHoverRating(0)}
                            style={{
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer',
                                padding: '2px',
                                color: star <= (hoverRating || rating) ? 'var(--warning)' : 'var(--gray-300)',
                            }}
                        >
                            <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
                                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                            </svg>
                        </button>
                    ))}
                </div>
            </div>

            <div className="form-group">
                <label className="form-label">اسمك *</label>
                <input
                    type="text"
                    className="form-input"
                    placeholder="اسمك الكريم"
                    value={patientName}
                    onChange={(e) => setPatientName(e.target.value)}
                    required
                />
            </div>

            <div className="form-group">
                <label className="form-label">تعليقك (اختياري)</label>
                <textarea
                    className="form-textarea"
                    placeholder="شاركنا تجربتك مع الطبيب..."
                    rows={3}
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                />
            </div>

            <div className="flex gap-sm">
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                    {submitting ? 'جاري الإرسال...' : 'إرسال التقييم'}
                </button>
                <button type="button" className="btn btn-ghost" onClick={() => setShowForm(false)}>
                    إلغاء
                </button>
            </div>
        </form>
    );
}

export default function DoctorProfilePage() {
    const params = useParams();
    const router = useRouter();
    const [doctor, setDoctor] = useState<Doctor | null>(null);
    const [loading, setLoading] = useState(true);
    const [showBooking, setShowBooking] = useState(false);
    const [selectedDate, setSelectedDate] = useState('');
    const [selectedTime, setSelectedTime] = useState('');
    const [availableSlots, setAvailableSlots] = useState<string[]>([]);
    const [bookingForm, setBookingForm] = useState({
        patientName: '',
        patientPhone: '',
        patientEmail: '',
        notes: '',
    });
    const [submitting, setSubmitting] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    const fetchDoctor = useCallback(async () => {
        try {
            const res = await fetch(`/api/doctors/${params.id}`);
            const data = await res.json();

            if (data.success) {
                setDoctor(data.data);
            } else {
                router.push('/doctors');
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    }, [params.id, router]);

    useEffect(() => {
        if (params.id) {
            fetchDoctor();
        }
    }, [params.id, fetchDoctor]);

    useEffect(() => {
        if (selectedDate && doctor?.workingHours) {
            const date = new Date(selectedDate);
            const dayName = date.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
            const dayHours = doctor.workingHours[dayName];

            if (dayHours) {
                const slots = generateTimeSlots(dayHours.start, dayHours.end, 30);
                setAvailableSlots(slots);
            } else {
                setAvailableSlots([]);
            }
            setSelectedTime('');
        }
    }, [selectedDate, doctor?.workingHours]);

    const handleBooking = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        setMessage({ type: '', text: '' });

        try {
            const res = await fetch('/api/appointments', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    doctorId: doctor?.id,
                    patientName: bookingForm.patientName,
                    patientPhone: bookingForm.patientPhone,
                    patientEmail: bookingForm.patientEmail,
                    date: selectedDate,
                    time: selectedTime,
                    notes: bookingForm.notes,
                }),
            });

            const data = await res.json();

            if (data.success) {
                setMessage({ type: 'success', text: data.message });
                setShowBooking(false);
                setBookingForm({ patientName: '', patientPhone: '', patientEmail: '', notes: '' });
                setSelectedDate('');
                setSelectedTime('');
            } else {
                setMessage({ type: 'error', text: data.error });
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'حدث خطأ. يرجى المحاولة مرة أخرى' });
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="loading-overlay">
                <div className="spinner"></div>
            </div>
        );
    }

    if (!doctor) {
        return null;
    }

    // Get min date (today)
    const today = new Date().toISOString().split('T')[0];

    return (
        <>
            {/* Navigation */}
            <Navbar />

            <main style={{ minHeight: '80vh', padding: 'var(--spacing-xl) 0' }}>
                <div className="container">
                    {message.text && (
                        <div className={`alert ${message.type === 'success' ? 'alert-success' : 'alert-danger'}`}>
                            {message.text}
                        </div>
                    )}

                    <div className="profile-grid">
                        {/* Main Content */}
                        <div>
                            {/* Doctor Header */}
                            <div className="card" style={{ marginBottom: 'var(--spacing-lg)' }}>
                                <div className="doctor-profile-header-container" style={{ display: 'flex', gap: 'var(--spacing-xl)', padding: 'var(--spacing-xl)' }}>
                                    <div
                                        className="mobile-header-image"
                                        style={{
                                            width: '150px',
                                            height: '150px',
                                            borderRadius: 'var(--border-radius-lg)',
                                            overflow: 'hidden',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            flexShrink: 0,
                                            background: 'var(--gray-100)',
                                            margin: '0 auto var(--spacing-md)'
                                        }}
                                    >
                                        {doctor.profileImage ? (
                                            <div style={{ width: '100%', height: '100%', position: 'relative' }}>
                                                <Image
                                                    src={doctor.profileImage}
                                                    alt={doctor.name}
                                                    fill
                                                    style={{ objectFit: 'cover' }}
                                                />
                                            </div>
                                        ) : (
                                            <div style={{
                                                width: '100%',
                                                height: '100%',
                                                background: 'linear-gradient(135deg, var(--primary-light), var(--secondary-light))',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center'
                                            }}>
                                                <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5">
                                                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                                                    <circle cx="12" cy="7" r="4" />
                                                </svg>
                                            </div>
                                        )}
                                    </div>

                                    <div className="doctor-profile-header-content" style={{ flex: 1 }}>
                                        <h1 className="text-center-mobile" style={{ marginBottom: 'var(--spacing-sm)' }}>{doctor.name}</h1>
                                        <p className="text-primary text-center-mobile" style={{
                                            fontSize: 'var(--font-size-lg)',
                                            fontWeight: '600',
                                            marginBottom: 'var(--spacing-md)'
                                        }}>
                                            {doctor.specialty}
                                        </p>

                                        <div className="flex gap-lg flex-wrap justify-center-mobile">
                                            <div className="flex gap-sm" style={{ color: 'var(--gray-600)' }}>
                                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                                                    <circle cx="12" cy="10" r="3" />
                                                </svg>
                                                {doctor.city}
                                            </div>

                                            <div className="flex gap-sm" style={{ color: 'var(--warning)' }}>
                                                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                                                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                                                </svg>
                                                <strong>{doctor.rating.toFixed(1)}</strong>
                                                <span style={{ color: 'var(--gray-500)' }}>({doctor.reviewCount} تقييم)</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* About */}
                            {doctor.bio && (
                                <div className="card" style={{ marginBottom: 'var(--spacing-lg)' }}>
                                    <div className="card-header">
                                        <h3 style={{ margin: 0 }}>نبذة عن الطبيب</h3>
                                    </div>
                                    <div className="card-body">
                                        <p>{doctor.bio}</p>
                                    </div>
                                </div>
                            )}

                            {/* Working Hours */}
                            {doctor.workingHours && (
                                <div className="card" style={{ marginBottom: 'var(--spacing-lg)' }}>
                                    <div className="card-header">
                                        <h3 style={{ margin: 0 }}>مواعيد العمل</h3>
                                    </div>
                                    <div className="card-body">
                                        <div className="grid grid-2" style={{ gap: 'var(--spacing-sm)' }}>
                                            {Object.entries(arabicDays).map(([day, dayAr]) => {
                                                const hours = doctor.workingHours?.[day];
                                                return (
                                                    <div key={day} className="flex-between" style={{
                                                        padding: 'var(--spacing-sm) var(--spacing-md)',
                                                        background: hours ? 'var(--bg-primary)' : 'var(--gray-50)',
                                                        borderRadius: 'var(--border-radius)',
                                                    }}>
                                                        <span style={{ fontWeight: '600' }}>{dayAr}</span>
                                                        <span style={{ color: hours ? 'var(--primary)' : 'var(--gray-500)' }}>
                                                            {hours ? `${hours.start} - ${hours.end}` : 'مغلق'}
                                                        </span>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Reviews */}
                            <div className="card">
                                <div className="card-header flex-between">
                                    <h3 style={{ margin: 0 }}>التقييمات ({doctor.reviewCount})</h3>
                                </div>
                                <div className="card-body">
                                    {/* Add Review Form */}
                                    <ReviewForm doctorId={doctor.id} onSuccess={fetchDoctor} />

                                    {doctor.reviews.length === 0 ? (
                                        <p className="text-muted text-center">لا توجد تقييمات بعد</p>
                                    ) : (
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-lg)' }}>
                                            {doctor.reviews.map((review) => (
                                                <div key={review.id} style={{
                                                    padding: 'var(--spacing-md)',
                                                    background: 'var(--gray-50)',
                                                    borderRadius: 'var(--border-radius)',
                                                }}>
                                                    <div className="flex-between mb-sm">
                                                        <strong>{review.patientName}</strong>
                                                        <div className="flex gap-xs" style={{ color: 'var(--warning)' }}>
                                                            {[...Array(5)].map((_, i) => (
                                                                <svg key={i} width="14" height="14" viewBox="0 0 24 24" fill={i < review.rating ? 'currentColor' : 'none'} stroke="currentColor">
                                                                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                                                                </svg>
                                                            ))}
                                                        </div>
                                                    </div>
                                                    {review.comment && <p style={{ margin: 0 }}>{review.comment}</p>}
                                                    <small className="text-muted">{formatDateAr(review.createdAt)}</small>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Sidebar - Booking */}
                        <div className="card booking-sidebar">
                            <div className="card-header">
                                <h3 style={{ margin: 0 }}>احجز موعد</h3>
                            </div>
                            <div className="card-body">
                                {doctor.priceRange && (
                                    <div className="flex-between mb-lg" style={{
                                        padding: 'var(--spacing-md)',
                                        background: 'var(--bg-secondary)',
                                        borderRadius: 'var(--border-radius)',
                                    }}>
                                        <span>سعر الكشف</span>
                                        <strong className="text-secondary">{doctor.priceRange}</strong>
                                    </div>
                                )}

                                {doctor.clinicAddress && (
                                    <div className="flex gap-sm mb-lg" style={{ color: 'var(--gray-600)' }}>
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                                            <circle cx="12" cy="10" r="3" />
                                        </svg>
                                        {doctor.clinicAddress}
                                    </div>
                                )}

                                {doctor.phone && (
                                    <div className="flex gap-sm mb-lg" style={{ color: 'var(--gray-600)' }}>
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                                        </svg>
                                        {doctor.phone}
                                    </div>
                                )}

                                {!showBooking ? (
                                    <button
                                        className="btn btn-primary btn-block btn-lg"
                                        onClick={() => setShowBooking(true)}
                                    >
                                        احجز الآن
                                    </button>
                                ) : (
                                    <form onSubmit={handleBooking}>
                                        <div className="form-group">
                                            <label className="form-label">التاريخ *</label>
                                            <input
                                                type="date"
                                                className="form-input"
                                                min={today}
                                                value={selectedDate}
                                                onChange={(e) => setSelectedDate(e.target.value)}
                                                required
                                            />
                                        </div>

                                        {selectedDate && (
                                            <div className="form-group">
                                                <label className="form-label">الوقت *</label>
                                                {availableSlots.length === 0 ? (
                                                    <p className="text-danger" style={{ fontSize: 'var(--font-size-sm)' }}>
                                                        الطبيب غير متاح في هذا اليوم
                                                    </p>
                                                ) : (
                                                    <div className="flex flex-wrap gap-sm">
                                                        {availableSlots.map((slot) => (
                                                            <button
                                                                key={slot}
                                                                type="button"
                                                                className={`btn btn-sm ${selectedTime === slot ? 'btn-primary' : 'btn-outline'}`}
                                                                onClick={() => setSelectedTime(slot)}
                                                            >
                                                                {formatTimeAr(slot)}
                                                            </button>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        <div className="form-group">
                                            <label className="form-label">الاسم الكامل *</label>
                                            <input
                                                type="text"
                                                className="form-input"
                                                placeholder="مثال: محمد أحمد"
                                                value={bookingForm.patientName}
                                                onChange={(e) => setBookingForm({ ...bookingForm, patientName: e.target.value })}
                                                required
                                            />
                                        </div>

                                        <div className="form-group">
                                            <label className="form-label">رقم الهاتف *</label>
                                            <input
                                                type="tel"
                                                className="form-input"
                                                placeholder="0555123456"
                                                value={bookingForm.patientPhone}
                                                onChange={(e) => setBookingForm({ ...bookingForm, patientPhone: e.target.value })}
                                                required
                                            />
                                        </div>

                                        <div className="form-group">
                                            <label className="form-label">البريد الإلكتروني (اختياري)</label>
                                            <input
                                                type="email"
                                                className="form-input"
                                                placeholder="example@email.com"
                                                value={bookingForm.patientEmail}
                                                onChange={(e) => setBookingForm({ ...bookingForm, patientEmail: e.target.value })}
                                            />
                                        </div>

                                        <div className="form-group">
                                            <label className="form-label">ملاحظات (اختياري)</label>
                                            <textarea
                                                className="form-textarea"
                                                placeholder="أي معلومات إضافية..."
                                                rows={3}
                                                value={bookingForm.notes}
                                                onChange={(e) => setBookingForm({ ...bookingForm, notes: e.target.value })}
                                            />
                                        </div>

                                        <div className="flex gap-sm">
                                            <button
                                                type="submit"
                                                className="btn btn-primary btn-block"
                                                disabled={submitting || !selectedTime}
                                            >
                                                {submitting ? 'جاري الحجز...' : 'تأكيد الحجز'}
                                            </button>
                                            <button
                                                type="button"
                                                className="btn btn-ghost"
                                                onClick={() => setShowBooking(false)}
                                            >
                                                إلغاء
                                            </button>
                                        </div>
                                    </form>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            <footer className="footer">
                <div className="container">
                    <div className="footer-bottom" style={{ border: 'none', paddingTop: 0 }}>
                        <p>© 2024 tabib-dz. جميع الحقوق محفوظة</p>
                    </div>
                </div>
            </footer>
        </>
    );
}
