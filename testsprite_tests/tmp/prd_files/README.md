# دكتور - منصة حجز المواعيد الطبية

منصة SaaS متكاملة لربط الأطباء بالمرضى في الجزائر. واجهة عربية بالكامل مع RTL.

## المميزات

### للمرضى (بدون تسجيل)
- ✅ تصفح الأطباء حسب التخصص والمدينة
- ✅ عرض الملف الشخصي للطبيب والتقييمات
- ✅ حجز موعد بإدخال الاسم ورقم الهاتف فقط

### للأطباء
- ✅ لوحة تحكم كاملة
- ✅ إدارة المواعيد (تأكيد / إلغاء / إكمال)
- ✅ إدارة سجلات المرضى
- ✅ رفع ملفات المرضى (PDF / صور)
- ✅ تعديل الملف الشخصي ومواعيد العمل
- ✅ نظام اشتراكات شهري

### للمسؤول
- ✅ لوحة تحكم إدارية
- ✅ الموافقة على الأطباء أو رفضهم
- ✅ إدارة باقات الاشتراك
- ✅ الموافقة على طلبات الاشتراك
- ✅ إحصائيات المنصة

## التقنيات

- **Frontend**: Next.js 14 (App Router) + React 18
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL + Prisma ORM
- **Auth**: NextAuth.js (JWT)
- **Styling**: Vanilla CSS (RTL Arabic)

## التثبيت

### 1. تثبيت الحزم
```bash
npm install
```

### 2. إعداد قاعدة البيانات
عدّل ملف `.env` بمعلومات قاعدة البيانات الخاصة بك:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/docteur"
```

### 3. إنشاء الجداول
```bash
npx prisma db push
```

### 4. إضافة البيانات الأولية
```bash
npm run db:seed
```

### 5. تشغيل المشروع
```bash
npm run dev
```

## بيانات الدخول الافتراضية

| الدور | البريد | كلمة المرور |
|-------|--------|-------------|
| المسؤول | admin@docteur.dz | admin123 |
| طبيب تجريبي | doctor@example.com | doctor123 |

> ⚠️ **تحذير**: غيّر كلمات المرور الافتراضية في الإنتاج!

## هيكل المشروع

```
src/
├── app/
│   ├── api/            # Backend API routes
│   ├── admin/          # Admin dashboard
│   ├── dashboard/      # Doctor dashboard
│   ├── doctors/        # Public doctor pages
│   ├── login/          # Authentication
│   └── register/
├── components/         # Reusable components
├── lib/               # Utilities & Prisma
└── types/             # TypeScript types
```

## الدعم

للمساعدة أو الاستفسارات، تواصل معنا على contact@docteur.dz
