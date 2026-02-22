import Link from 'next/link';

export default function AboutPage() {
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
            <li><Link href="/about" className="navbar-link active">من نحن</Link></li>
            <li><Link href="/contact" className="navbar-link">تواصل معنا</Link></li>
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
          <h1 style={{ marginBottom: 'var(--spacing-md)' }}>من نحن</h1>
          <p className="text-muted" style={{ maxWidth: '600px', margin: '0 auto' }}>
            منصة دكتور هي الحل الرقمي الأول في الجزائر لربط الأطباء بالمرضى
          </p>
        </div>
      </section>

      {/* Content */}
      <section style={{ padding: 'var(--spacing-3xl) 0' }}>
        <div className="container">
          <div className="grid grid-2" style={{ gap: 'var(--spacing-3xl)', alignItems: 'center' }}>
            <div>
              <h2 style={{ marginBottom: 'var(--spacing-lg)' }}>رؤيتنا</h2>
              <p style={{ lineHeight: '1.8', marginBottom: 'var(--spacing-lg)' }}>
                نسعى لتحويل قطاع الرعاية الصحية في الجزائر من خلال توفير منصة رقمية سهلة الاستخدام
                تمكّن المرضى من الوصول إلى أفضل الأطباء بسهولة وسرعة، وتمكّن الأطباء من إدارة عياداتهم
                بكفاءة عالية.
              </p>
              <p style={{ lineHeight: '1.8' }}>
                نؤمن بأن الجميع يستحق الحصول على رعاية صحية متميزة، ونعمل على جعل ذلك ممكناً
                من خلال التكنولوجيا الحديثة.
              </p>
            </div>
            <div style={{
              background: 'linear-gradient(135deg, var(--primary-light), var(--secondary-light))',
              borderRadius: 'var(--border-radius-lg)',
              padding: 'var(--spacing-3xl)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: '300px'
            }}>
              <svg width="120" height="120" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 6v6l4 2" />
              </svg>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section style={{ padding: 'var(--spacing-3xl) 0', background: 'var(--white)' }}>
        <div className="container">
          <h2 className="text-center" style={{ marginBottom: 'var(--spacing-xl)' }}>قيمنا</h2>
          
          <div className="grid grid-3">
            <div className="card text-center" style={{ padding: 'var(--spacing-xl)' }}>
              <div style={{
                width: '70px',
                height: '70px',
                margin: '0 auto var(--spacing-lg)',
                background: 'var(--bg-primary)',
                borderRadius: 'var(--border-radius-full)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--primary)'
              }}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
              </div>
              <h3>الثقة</h3>
              <p className="text-muted">نحرص على بناء الثقة بين المرضى والأطباء من خلال التحقق والمراجعة</p>
            </div>

            <div className="card text-center" style={{ padding: 'var(--spacing-xl)' }}>
              <div style={{
                width: '70px',
                height: '70px',
                margin: '0 auto var(--spacing-lg)',
                background: 'var(--bg-secondary)',
                borderRadius: 'var(--border-radius-full)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--secondary)'
              }}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 6v6l4 2" />
                </svg>
              </div>
              <h3>السرعة</h3>
              <p className="text-muted">نوفر تجربة سريعة وسلسة للحجز في ثوانٍ معدودة</p>
            </div>

            <div className="card text-center" style={{ padding: 'var(--spacing-xl)' }}>
              <div style={{
                width: '70px',
                height: '70px',
                margin: '0 auto var(--spacing-lg)',
                background: 'rgba(255, 107, 53, 0.1)',
                borderRadius: 'var(--border-radius-full)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--accent)'
              }}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
              </div>
              <h3>الجودة</h3>
              <p className="text-muted">نختار أفضل الأطباء لضمان حصولك على أفضل رعاية</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <div className="footer-bottom" style={{ border: 'none', paddingTop: 0 }}>
            <p>© 2024 دكتور. جميع الحقوق محفوظة</p>
          </div>
        </div>
      </footer>
    </>
  );
}
