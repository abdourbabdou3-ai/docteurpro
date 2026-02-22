'use client';

import Link from 'next/link';
import { useState } from 'react';

export default function ContactPage() {
    const [form, setForm] = useState({
        name: '',
        email: '',
        subject: '',
        message: '',
    });
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const bodyContent = `الاسم: ${form.name}\nالبريد: ${form.email}\n\nالرسالة:\n${form.message}`;
        const mailtoUrl = `mailto:abdoudev88@gmail.com?subject=${encodeURIComponent(form.subject)}&body=${encodeURIComponent(bodyContent)}`;

        window.location.href = mailtoUrl;
        setSubmitted(true);
    };

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

                    <ul className="navbar-menu">
                        <li><Link href="/" className="navbar-link">الرئيسية</Link></li>
                        <li><Link href="/doctors" className="navbar-link">الأطباء</Link></li>
                        <li><Link href="/about" className="navbar-link">من نحن</Link></li>
                        <li><Link href="/contact" className="navbar-link active">تواصل معنا</Link></li>
                    </ul>

                    <div className="navbar-actions">
                        <Link href="/login" className="btn btn-ghost">تسجيل الدخول</Link>
                        <Link href="/register" className="btn btn-primary">انضم كطبيب</Link>
                    </div>
                </div>
            </nav>

            {/* Hero */}
            <section style={{
                background: 'linear-gradient(135deg, var(--bg-primary) 0%, var(--white) 100%)',
                padding: 'var(--spacing-3xl) 0'
            }}>
                <div className="container text-center">
                    <h1 style={{ marginBottom: 'var(--spacing-md)' }}>تواصل معنا</h1>
                    <p className="text-muted" style={{ maxWidth: '600px', margin: '0 auto' }}>
                        نحن هنا للإجابة على استفساراتك ومساعدتك
                    </p>
                </div>
            </section>

            {/* Content */}
            <section style={{ padding: 'var(--spacing-3xl) 0' }}>
                <div className="container">
                    <div className="grid" style={{ gridTemplateColumns: '1fr 400px', gap: 'var(--spacing-3xl)' }}>
                        {/* Contact Form */}
                        <div className="card">
                            <div className="card-header">
                                <h3 style={{ margin: 0 }}>أرسل رسالة</h3>
                            </div>
                            <div className="card-body">
                                {submitted ? (
                                    <div className="alert alert-success">
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginLeft: '10px' }}>
                                            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                                            <polyline points="22 4 12 14.01 9 11.01" />
                                        </svg>
                                        سيتم فتح تطبيق البريد الخاص بك لإرسال الرسالة. شكراً لتواصلك معنا!
                                        <br />
                                        <button
                                            className="btn btn-ghost btn-sm"
                                            style={{ marginTop: '10px', color: 'var(--primary)' }}
                                            onClick={() => setSubmitted(false)}
                                        >
                                            إرسال رسالة أخرى
                                        </button>
                                    </div>
                                ) : (
                                    <form onSubmit={handleSubmit}>
                                        <div className="grid grid-2">
                                            <div className="form-group">
                                                <label className="form-label">الاسم *</label>
                                                <input
                                                    type="text"
                                                    className="form-input"
                                                    placeholder="اسمك الكامل"
                                                    value={form.name}
                                                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                                                    required
                                                />
                                            </div>
                                            <div className="form-group">
                                                <label className="form-label">البريد الإلكتروني *</label>
                                                <input
                                                    type="email"
                                                    className="form-input"
                                                    placeholder="example@email.com"
                                                    value={form.email}
                                                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                                                    required
                                                />
                                            </div>
                                        </div>

                                        <div className="form-group">
                                            <label className="form-label">الموضوع *</label>
                                            <input
                                                type="text"
                                                className="form-input"
                                                placeholder="موضوع الرسالة"
                                                value={form.subject}
                                                onChange={(e) => setForm({ ...form, subject: e.target.value })}
                                                required
                                            />
                                        </div>

                                        <div className="form-group">
                                            <label className="form-label">الرسالة *</label>
                                            <textarea
                                                className="form-textarea"
                                                rows={6}
                                                placeholder="اكتب رسالتك هنا..."
                                                value={form.message}
                                                onChange={(e) => setForm({ ...form, message: e.target.value })}
                                                required
                                            />
                                        </div>

                                        <button type="submit" className="btn btn-primary btn-lg">
                                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <line x1="22" y1="2" x2="11" y2="13" />
                                                <polygon points="22 2 15 22 11 13 2 9 22 2" />
                                            </svg>
                                            فتح تطبيق البريد للإرسال
                                        </button>
                                    </form>
                                )}
                            </div>
                        </div>

                        {/* Contact Info */}
                        <div>
                            <div className="card" style={{ marginBottom: 'var(--spacing-lg)' }}>
                                <div className="card-body">
                                    <div className="flex gap-md" style={{ marginBottom: 'var(--spacing-lg)' }}>
                                        <div style={{
                                            width: '50px',
                                            height: '50px',
                                            borderRadius: 'var(--border-radius-full)',
                                            background: 'var(--bg-primary)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            color: 'var(--primary)',
                                            flexShrink: 0,
                                        }}>
                                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                                                <polyline points="22,6 12,13 2,6" />
                                            </svg>
                                        </div>
                                        <div>
                                            <h4 style={{ marginBottom: 'var(--spacing-xs)' }}>البريد الإلكتروني</h4>
                                            <a href="mailto:abdoudev88@gmail.com" className="text-primary" style={{ textDecoration: 'none' }}>abdoudev88@gmail.com</a>
                                        </div>
                                    </div>

                                    <div className="flex gap-md" style={{ marginBottom: 'var(--spacing-lg)' }}>
                                        <div style={{
                                            width: '50px',
                                            height: '50px',
                                            borderRadius: 'var(--border-radius-full)',
                                            background: 'var(--bg-secondary)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            color: 'var(--secondary)',
                                            flexShrink: 0,
                                        }}>
                                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                                            </svg>
                                        </div>
                                        <div>
                                            <h4 style={{ marginBottom: 'var(--spacing-xs)' }}>الهاتف</h4>
                                            <p className="text-muted" style={{ margin: 0 }}>0778996694</p>
                                        </div>
                                    </div>

                                    <div className="flex gap-md">
                                        <div style={{
                                            width: '50px',
                                            height: '50px',
                                            borderRadius: 'var(--border-radius-full)',
                                            background: 'rgba(255, 107, 53, 0.1)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            color: 'var(--accent)',
                                            flexShrink: 0,
                                        }}>
                                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                                                <circle cx="12" cy="10" r="3" />
                                            </svg>
                                        </div>
                                        <div>
                                            <h4 style={{ marginBottom: 'var(--spacing-xs)' }}>العنوان</h4>
                                            <p className="text-muted" style={{ margin: 0 }}>الجزائر العاصمة، الجزائر</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="card">
                                <div className="card-body">
                                    <h4 style={{ marginBottom: 'var(--spacing-md)' }}>ساعات العمل</h4>
                                    <div style={{
                                        position: 'relative',
                                        padding: 'var(--spacing-xl) var(--spacing-lg)',
                                        background: 'linear-gradient(135deg, var(--primary) 0%, #004c99 100%)',
                                        borderRadius: 'var(--border-radius-lg)',
                                        color: 'white',
                                        overflow: 'hidden',
                                        boxShadow: '0 10px 20px rgba(0, 102, 204, 0.2)'
                                    }}>
                                        {/* Decorative Circles */}
                                        <div style={{ position: 'absolute', top: '-10%', right: '-10%', width: '100px', height: '100px', background: 'rgba(255,255,255,0.1)', borderRadius: '50%' }}></div>
                                        <div style={{ position: 'absolute', bottom: '-20%', left: '-5%', width: '80px', height: '80px', background: 'rgba(255,255,255,0.05)', borderRadius: '50%' }}></div>

                                        <div style={{ position: 'relative', zIndex: 1 }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)', marginBottom: 'var(--spacing-sm)' }}>
                                                <div className="pulse" style={{ width: '10px', height: '10px', background: '#4ade80', borderRadius: '50%' }}></div>
                                                <span style={{ fontSize: '0.85rem', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px', opacity: 0.9 }}>نشط الآن</span>
                                            </div>

                                            <h2 style={{ margin: 0, fontSize: '2rem', fontWeight: '900', lineHeight: 1 }}>24/7</h2>
                                            <p style={{ margin: 'var(--spacing-xs) 0 0', fontWeight: 'bold', fontSize: '1.1rem' }}>نحن متاحون دائماً</p>

                                            <hr style={{ margin: 'var(--spacing-md) 0', border: 'none', borderTop: '2px solid rgba(255,255,255,0.3)' }} />

                                            <p style={{ margin: 0, fontSize: '0.95rem', lineHeight: 1.6, fontWeight: '500' }}>
                                                خدماتنا متاحة طوال أيام الأسبوع بصورة رقمية كاملة لاستقبال مواعيدكم.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <footer className="footer" style={{ marginTop: 'var(--spacing-3xl)' }}>
                <div className="container">
                    <div className="footer-grid">
                        <div>
                            <div className="footer-brand">دكتور</div>
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
                            <h4 className="footer-title">تواصل معنا</h4>
                            <ul className="footer-links">
                                <li>abdoudev88@gmail.com</li>
                                <li>0778996694</li>
                                <li>الجزائر العاصمة</li>
                            </ul>
                        </div>
                    </div>

                    <div className="footer-bottom">
                        <p>© 2024 دكتور. جميع الحقوق محفوظة</p>
                    </div>
                </div>
            </footer>
        </>
    );
}
