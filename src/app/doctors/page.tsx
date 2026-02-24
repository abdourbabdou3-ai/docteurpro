'use client';

import Link from 'next/link';
import { useEffect, useState, useCallback } from 'react';
import { algerianWilayas, medicalSpecialties } from '@/lib/utils';
import Image from 'next/image';

interface Doctor {
    id: number;
    name: string;
    specialty: string;
    city: string;
    rating: number;
    reviewCount: number;
    profileImage: string | null;
    priceRange: string | null;
    subscriptionEnd: string | null;
}

interface Pagination {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}

export default function DoctorsPage() {
    const [doctors, setDoctors] = useState<Doctor[]>([]);
    const [pagination, setPagination] = useState<Pagination | null>(null);
    const [loading, setLoading] = useState(true);
    const [specialties, setSpecialties] = useState<string[]>(medicalSpecialties);
    const [filters, setFilters] = useState({
        specialty: '',
        city: '',
        search: '',
        page: 1,
    });


    const [isMenuOpen, setIsMenuOpen] = useState(false);

    useEffect(() => {
        const fetchSpecialties = async () => {
            try {
                const res = await fetch('/api/specialties');
                const data = await res.json();
                if (data.success) {
                    setSpecialties(data.data);
                }
            } catch (err) {
                console.error(err);
            }
        };
        fetchSpecialties();
    }, []);

    const fetchDoctors = useCallback(async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (filters.specialty) params.append('specialty', filters.specialty);
            if (filters.city) params.append('city', filters.city);
            if (filters.search) params.append('search', filters.search);
            params.append('page', filters.page.toString());
            params.append('limit', '12');

            const res = await fetch(`/api/doctors?${params}`);
            const data = await res.json();

            if (data.success) {
                setDoctors(data.data.doctors);
                setPagination(data.data.pagination);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    }, [filters]);

    useEffect(() => {
        fetchDoctors();
    }, [fetchDoctors]);

    return (
        <>
            {/* Navigation */}
            <nav className="navbar">
                <div className="container navbar-container">
                    <Link href="/" className="navbar-brand">
                        <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <circle cx="20" cy="20" r="18" fill="#0066cc" />
                            <path d="M20 10V30M10 20H30" stroke="white" strokeWidth="4" strokeLinecap="round" />
                        </svg>
                        دكتور
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
                        <Link href="/login" className="btn btn-ghost">تسجيل الدخول</Link>
                        <Link href="/register" className="btn btn-primary">انضم كطبيب</Link>
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

            {/* Page Header */}
            <section style={{
                background: 'linear-gradient(135deg, var(--bg-primary) 0%, var(--white) 100%)',
                padding: 'var(--spacing-xl) 0 var(--spacing-2xl)'
            }}>
                <div className="container">
                    <h1 style={{ marginBottom: 'var(--spacing-md)' }}>دليل الأطباء</h1>
                    <p className="text-muted">ابحث عن الطبيب المناسب لك من بين أفضل الأطباء في الجزائر</p>
                </div>
            </section>

            {/* Filters */}
            <section style={{ padding: 'var(--spacing-xl) 0' }}>
                <div className="container">
                    <div className="card" style={{ padding: 'var(--spacing-lg)' }}>
                        <div className="grid grid-4" style={{ alignItems: 'end' }}>
                            <div className="form-group" style={{ margin: 0 }}>
                                <label className="form-label">البحث</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    placeholder="ابحث باسم الطبيب..."
                                    value={filters.search}
                                    onChange={(e) => setFilters({ ...filters, search: e.target.value, page: 1 })}
                                />
                            </div>

                            <div className="form-group" style={{ margin: 0 }}>
                                <label className="form-label">التخصص</label>
                                <select
                                    className="form-select"
                                    value={filters.specialty}
                                    onChange={(e) => setFilters({ ...filters, specialty: e.target.value, page: 1 })}
                                >
                                    <option value="">جميع التخصصات</option>
                                    {specialties.map((s) => (
                                        <option key={s} value={s}>{s}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="form-group" style={{ margin: 0 }}>
                                <label className="form-label">الولاية</label>
                                <select
                                    className="form-select"
                                    value={filters.city}
                                    onChange={(e) => setFilters({ ...filters, city: e.target.value, page: 1 })}
                                    style={{ minWidth: '150px' }}
                                >
                                    <option value="">جميع الولايات</option>
                                    {algerianWilayas.map((c) => (
                                        <option key={c} value={c}>{c}</option>
                                    ))}
                                </select>
                            </div>

                            <button
                                className="btn btn-outline"
                                onClick={() => setFilters({ specialty: '', city: '', search: '', page: 1 })}
                            >
                                إعادة تعيين
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Doctors Grid */}
            <section style={{ padding: '0 0 var(--spacing-3xl)' }}>
                <div className="container">
                    {loading ? (
                        <div className="flex-center" style={{ padding: 'var(--spacing-3xl)' }}>
                            <div className="spinner"></div>
                        </div>
                    ) : doctors.length === 0 ? (
                        <div className="card text-center" style={{ padding: 'var(--spacing-3xl)' }}>
                            <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="var(--gray-400)" strokeWidth="1.5" style={{ margin: '0 auto var(--spacing-lg)' }}>
                                <circle cx="11" cy="11" r="8" />
                                <path d="m21 21-4.3-4.3" />
                            </svg>
                            <h3>لا توجد نتائج</h3>
                            <p className="text-muted">جرب تعديل معايير البحث</p>
                        </div>
                    ) : (
                        <>
                            <p className="text-muted mb-lg">
                                تم العثور على <strong>{pagination?.total || 0}</strong> طبيب
                            </p>

                            <div className="grid grid-3">
                                {doctors.map((doctor) => (
                                    <div key={doctor.id} className="doctor-card">
                                        <div className="doctor-card-image" style={{ position: 'relative', height: '200px' }}>
                                            {doctor.profileImage ? (
                                                <Image
                                                    src={doctor.profileImage}
                                                    alt={doctor.name}
                                                    fill
                                                    style={{ objectFit: 'cover' }}
                                                />
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
                                            {doctor.subscriptionEnd && (
                                                (() => {
                                                    const days = Math.ceil((new Date(doctor.subscriptionEnd).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
                                                    if (days > 0 && days <= 2) {
                                                        return (
                                                            <div style={{
                                                                position: 'absolute',
                                                                top: '10px',
                                                                right: '10px',
                                                                background: 'var(--warning)',
                                                                color: 'white',
                                                                padding: '4px 8px',
                                                                borderRadius: 'var(--border-radius-sm)',
                                                                fontSize: '0.75rem',
                                                                fontWeight: 'bold',
                                                                boxShadow: 'var(--shadow-sm)',
                                                                zIndex: 1
                                                            }}>
                                                                قريباً سيصبح غير متاح
                                                            </div>
                                                        );
                                                    }
                                                    return null;
                                                })()
                                            )}
                                        </div>
                                        <div className="doctor-card-body">
                                            <h4 className="doctor-card-name">{doctor.name}</h4>
                                            <p className="doctor-card-specialty">{doctor.specialty}</p>
                                            <div className="doctor-card-location">
                                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                                                    <circle cx="12" cy="10" r="3" />
                                                </svg>
                                                {doctor.city}
                                            </div>
                                            <div className="doctor-card-rating">
                                                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                                                </svg>
                                                {doctor.rating.toFixed(1)}
                                                <span style={{ color: 'var(--gray-500)', marginRight: 'var(--spacing-xs)' }}>
                                                    ({doctor.reviewCount} تقييم)
                                                </span>
                                            </div>
                                        </div>
                                        <div className="doctor-card-footer">
                                            <span className="doctor-card-price">{doctor.priceRange || 'غير محدد'}</span>
                                            <Link href={`/doctors/${doctor.id}`} className="btn btn-primary btn-sm">
                                                عرض الملف
                                            </Link>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Pagination */}
                            {pagination && pagination.totalPages > 1 && (
                                <div className="flex-center gap-md mt-xl">
                                    <button
                                        className="btn btn-outline btn-sm"
                                        disabled={filters.page === 1}
                                        onClick={() => setFilters({ ...filters, page: filters.page - 1 })}
                                    >
                                        السابق
                                    </button>
                                    <span className="text-muted">
                                        صفحة {filters.page} من {pagination.totalPages}
                                    </span>
                                    <button
                                        className="btn btn-outline btn-sm"
                                        disabled={filters.page === pagination.totalPages}
                                        onClick={() => setFilters({ ...filters, page: filters.page + 1 })}
                                    >
                                        التالي
                                    </button>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </section>

            {/* Footer */}
            <footer className="footer" >
                <div className="container">
                    <div className="footer-bottom" style={{ border: 'none', paddingTop: 0 }}>
                        <p>© 2024 دكتور. جميع الحقوق محفوظة</p>
                    </div>
                </div>
            </footer >
        </>
    );
}
