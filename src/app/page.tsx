'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

interface Doctor {
    id: number;
    name: string;
    specialty: string;
    city: string;
    rating: number;
    reviewCount: number;
    profileImage: string | null;
    priceRange: string | null;
}

export default function HomePage() {
    const [doctors, setDoctors] = useState<Doctor[]>([]);
    const [loading, setLoading] = useState(true);

    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
    const [showInstallBtn, setShowInstallBtn] = useState(false);

    useEffect(() => {
        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            setDeferredPrompt(e);
            setShowInstallBtn(true);
        });

        window.addEventListener('appinstalled', () => {
            setShowInstallBtn(false);
            setDeferredPrompt(null);
        });
    }, []);

    const handleInstallClick = async () => {
        if (!deferredPrompt) return;
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === 'accepted') {
            setShowInstallBtn(false);
        }
        setDeferredPrompt(null);
    };

    useEffect(() => {
        fetch('/api/doctors?limit=6')
            .then((res) => res.json())
            .then((data) => {
                if (data.success) {
                    setDoctors(data.data.doctors);
                }
            })
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

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
                        tabib-dz
                    </Link>

                    <ul className={`navbar-menu ${isMenuOpen ? 'open' : ''}`}>
                        <li><Link href="/" className="navbar-link active" onClick={() => setIsMenuOpen(false)}>الرئيسية</Link></li>
                        <li><Link href="/doctors" className="navbar-link" onClick={() => setIsMenuOpen(false)}>الأطباء</Link></li>
                        <li><Link href="/about" className="navbar-link" onClick={() => setIsMenuOpen(false)}>من نحن</Link></li>
                        <li><Link href="/contact" className="navbar-link" onClick={() => setIsMenuOpen(false)}>تواصل معنا</Link></li>
                        <li className="show-mobile" style={{ marginTop: 'var(--spacing-md)' }}>
                            <Link href="/login" className="btn btn-ghost btn-block" onClick={() => setIsMenuOpen(false)}>تسجيل الدخول</Link>
                        </li>
                        <li className="show-mobile">
                            <Link href="/register" className="btn btn-primary btn-block" onClick={() => setIsMenuOpen(false)}>انضم كطبيب</Link>
                        </li>
                    </ul>

                    <div className="navbar-actions hidden-mobile">
                        {showInstallBtn && (
                            <button
                                onClick={handleInstallClick}
                                className="btn btn-outline"
                                style={{ gap: 'var(--spacing-xs)', borderColor: 'var(--primary)', color: 'var(--primary)' }}
                            >
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" />
                                </svg>
                                تثبيت التطبيق
                            </button>
                        )}
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

            {/* Hero Section */}
            <section className="hero">
                <div className="container">
                    <h1 className="hero-title">
                        احجز موعدك مع <span>أفضل الأطباء</span>
                        <br />في الجزائر
                    </h1>
                    <p className="hero-subtitle">
                        منصة رقمية متكاملة تربط الأطباء بالمرضى. ابحث عن طبيبك المفضل واحجز موعدك في ثوانٍ
                    </p>
                    <div className="hero-actions">
                        <Link href="/doctors" className="btn btn-primary btn-lg">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="11" cy="11" r="8" />
                                <path d="m21 21-4.3-4.3" />
                            </svg>
                            ابحث عن طبيب
                        </Link>
                        <Link href="/register" className="btn btn-outline btn-lg">
                            انضم كطبيب
                        </Link>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section style={{ padding: 'var(--spacing-3xl) 0', background: 'var(--white)' }}>
                <div className="container">
                    <h2 className="text-center mb-xl">لماذا تختار منصة tabib-dz؟</h2>

                    <div className="grid grid-3">
                        <div className="card" style={{ textAlign: 'center', padding: 'var(--spacing-xl)' }}>
                            <div style={{
                                width: '80px',
                                height: '80px',
                                margin: '0 auto var(--spacing-lg)',
                                background: 'linear-gradient(135deg, var(--primary-light), var(--primary))',
                                borderRadius: 'var(--border-radius-full)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}>
                                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                                    <circle cx="12" cy="12" r="10" />
                                    <path d="M12 6v6l4 2" />
                                </svg>
                            </div>
                            <h3>حجز سريع</h3>
                            <p>احجز موعدك في ثوانٍ معدودة دون الحاجة لإنشاء حساب</p>
                        </div>

                        <div className="card" style={{ textAlign: 'center', padding: 'var(--spacing-xl)' }}>
                            <div style={{
                                width: '80px',
                                height: '80px',
                                margin: '0 auto var(--spacing-lg)',
                                background: 'linear-gradient(135deg, var(--secondary-light), var(--secondary))',
                                borderRadius: 'var(--border-radius-full)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}>
                                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                                    <circle cx="9" cy="7" r="4" />
                                    <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
                                </svg>
                            </div>
                            <h3>أطباء موثوقون</h3>
                            <p>جميع الأطباء معتمدون ومراجعون من قبل فريقنا</p>
                        </div>

                        <div className="card" style={{ textAlign: 'center', padding: 'var(--spacing-xl)' }}>
                            <div style={{
                                width: '80px',
                                height: '80px',
                                margin: '0 auto var(--spacing-lg)',
                                background: 'linear-gradient(135deg, #ff8c66, var(--accent))',
                                borderRadius: 'var(--border-radius-full)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}>
                                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                                </svg>
                            </div>
                            <h3>معلوماتك آمنة</h3>
                            <p>نحافظ على خصوصية بياناتك الشخصية والطبية</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Top Doctors Section */}
            <section style={{ padding: 'var(--spacing-3xl) 0' }}>
                <div className="container">
                    <div className="flex-between mb-xl">
                        <h2>أبرز الأطباء</h2>
                        <Link href="/doctors" className="btn btn-outline">
                            عرض الكل
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M19 12H5M12 19l-7-7 7-7" />
                            </svg>
                        </Link>
                    </div>

                    {loading ? (
                        <div className="flex-center" style={{ padding: 'var(--spacing-3xl)' }}>
                            <div className="spinner"></div>
                        </div>
                    ) : (
                        <div className="grid grid-3">
                            {doctors.map((doctor) => (
                                <div key={doctor.id} className="doctor-card">
                                    <div
                                        className="doctor-card-image"
                                        style={{
                                            backgroundImage: doctor.profileImage
                                                ? `url(${doctor.profileImage})`
                                                : 'linear-gradient(135deg, var(--primary-light), var(--secondary-light))',
                                            backgroundSize: 'cover',
                                            backgroundPosition: 'center',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center'
                                        }}
                                    >
                                        {!doctor.profileImage && (
                                            <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5">
                                                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                                                <circle cx="12" cy="7" r="4" />
                                            </svg>
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
                                            احجز موعد
                                        </Link>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </section>

            {/* How it Works */}
            <section style={{ padding: 'var(--spacing-3xl) 0', background: 'var(--white)' }}>
                <div className="container">
                    <h2 className="text-center mb-xl">كيف يعمل؟</h2>

                    <div className="grid grid-4" style={{ textAlign: 'center' }}>
                        <div style={{ padding: 'var(--spacing-lg)' }}>
                            <div style={{
                                width: '60px',
                                height: '60px',
                                margin: '0 auto var(--spacing-md)',
                                background: 'var(--primary)',
                                color: 'var(--white)',
                                borderRadius: 'var(--border-radius-full)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: 'var(--font-size-2xl)',
                                fontWeight: '800'
                            }}>1</div>
                            <h4>ابحث عن طبيب</h4>
                            <p className="text-muted">اختر التخصص والمدينة المناسبة</p>
                        </div>

                        <div style={{ padding: 'var(--spacing-lg)' }}>
                            <div style={{
                                width: '60px',
                                height: '60px',
                                margin: '0 auto var(--spacing-md)',
                                background: 'var(--primary)',
                                color: 'var(--white)',
                                borderRadius: 'var(--border-radius-full)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: 'var(--font-size-2xl)',
                                fontWeight: '800'
                            }}>2</div>
                            <h4>اختر الموعد</h4>
                            <p className="text-muted">حدد التاريخ والوقت المناسب لك</p>
                        </div>

                        <div style={{ padding: 'var(--spacing-lg)' }}>
                            <div style={{
                                width: '60px',
                                height: '60px',
                                margin: '0 auto var(--spacing-md)',
                                background: 'var(--primary)',
                                color: 'var(--white)',
                                borderRadius: 'var(--border-radius-full)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: 'var(--font-size-2xl)',
                                fontWeight: '800'
                            }}>3</div>
                            <h4>أدخل بياناتك</h4>
                            <p className="text-muted">الاسم ورقم الهاتف فقط</p>
                        </div>

                        <div style={{ padding: 'var(--spacing-lg)' }}>
                            <div style={{
                                width: '60px',
                                height: '60px',
                                margin: '0 auto var(--spacing-md)',
                                background: 'var(--secondary)',
                                color: 'var(--white)',
                                borderRadius: 'var(--border-radius-full)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: 'var(--font-size-2xl)',
                                fontWeight: '800'
                            }}>✓</div>
                            <h4>تم الحجز!</h4>
                            <p className="text-muted">سيتم تأكيد موعدك قريباً</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA for Doctors */}
            <section style={{
                padding: 'var(--spacing-3xl) 0',
                background: 'linear-gradient(135deg, var(--primary), var(--primary-dark))',
                color: 'var(--white)',
                textAlign: 'center'
            }}>
                <div className="container">
                    <h2 style={{ color: 'var(--white)' }}>هل أنت طبيب؟</h2>
                    <p style={{
                        maxWidth: '500px',
                        margin: '0 auto var(--spacing-xl)',
                        opacity: 0.9
                    }}>
                        انضم إلى منصتنا ووسّع قاعدة مرضاك. احصل على أدوات احترافية لإدارة عيادتك
                    </p>
                    <Link href="/register" className="btn btn-lg" style={{
                        background: 'var(--white)',
                        color: 'var(--primary)'
                    }}>
                        سجل الآن مجاناً
                    </Link>
                </div>
            </section>

            {/* Footer */}
            <footer className="footer">
                <div className="container">
                    <div className="footer-grid">
                        <div>
                            <div className="footer-brand">tabib-dz</div>
                            <p style={{ color: 'var(--gray-400)', marginBottom: 'var(--spacing-md)' }}>
                                منصة رقمية متكاملة لحجز المواعيد الطبية في الجزائر
                            </p>
                            <div className="flex gap-sm">
                                <a href="https://wa.me/213778996694" target="_blank" rel="noopener noreferrer" className="social-link" title="WhatsApp">
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
                                    </svg>
                                </a>
                                <a href="https://www.instagram.com/abdou_dev2025/" target="_blank" rel="noopener noreferrer" className="social-link" title="Instagram">
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                                        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                                        <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                                    </svg>
                                </a>
                                <a href="https://www.tiktok.com/@abdoudev2" target="_blank" rel="noopener noreferrer" className="social-link" title="TikTok">
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" />
                                    </svg>
                                </a>
                            </div>
                        </div>

                        <div>
                            <h4 className="footer-title">روابط سريعة</h4>
                            <ul className="footer-links">
                                <li><Link href="/">الرئيسية</Link></li>
                                <li><Link href="/doctors">الأطباء</Link></li>
                                <li><Link href="/about">من نحن</Link></li>
                                <li><Link href="/contact">تواصل معنا</Link></li>
                            </ul>
                        </div>

                        <div>
                            <h4 className="footer-title">للأطباء</h4>
                            <ul className="footer-links">
                                <li><Link href="/register">التسجيل</Link></li>
                                <li><Link href="/login">تسجيل الدخول</Link></li>
                                <li><Link href="/pricing">باقات الاشتراك</Link></li>
                            </ul>
                        </div>

                        <div>
                            <h4 className="footer-title">تواصل معنا</h4>
                            <ul className="footer-links">
                                <li>abdoudev88@gmail.com</li>
                                <li>0778996694</li>
                                <li>الجزائر العاصمة</li>
                            </ul>
                        </div>
                    </div>

                    <div className="footer-bottom">
                        <p>© 2024 tabib-dz. جميع الحقوق محفوظة</p>
                    </div>
                </div>
            </footer>
        </>
    );
}
