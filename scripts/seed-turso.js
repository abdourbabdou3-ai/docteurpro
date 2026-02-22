const { createClient } = require('@libsql/client');
const bcrypt = require('bcryptjs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const url = process.env.TURSO_DATABASE_URL;
const authToken = process.env.TURSO_AUTH_TOKEN;

if (!url || !authToken) {
    console.error('Missing TURSO_DATABASE_URL or TURSO_AUTH_TOKEN');
    process.exit(1);
}

const db = createClient({ url, authToken });

async function seed() {
    console.log('🌱 Seeding Turso database...');

    const workingHours = JSON.stringify({
        sunday: { start: '08:00', end: '16:00' },
        monday: { start: '08:00', end: '16:00' },
        tuesday: { start: '08:00', end: '16:00' },
        wednesday: { start: '08:00', end: '16:00' },
        thursday: { start: '08:00', end: '12:00' },
        friday: null,
        saturday: null,
    });

    const now = new Date().toISOString();
    const future = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

    // --- Admin user ---
    const adminHash = await bcrypt.hash('admin123', 12);
    await db.execute({ sql: `INSERT OR IGNORE INTO users (email, password_hash, role, status) VALUES (?, ?, 'ADMIN', 'ACTIVE')`, args: ['admin@docteur.dz', adminHash] });
    console.log('✅ Admin user created: admin@docteur.dz');

    // --- Subscription plans ---
    await db.execute({ sql: `INSERT OR IGNORE INTO subscription_plans (id, name, name_ar, description, description_ar, price, max_appointments, max_storage_mb, priority, active) VALUES (1,'Basic','أساسي','Perfect for starting doctors','مثالي للأطباء المبتدئين',2000,50,100,1,1)`, args: [] });
    await db.execute({ sql: `INSERT OR IGNORE INTO subscription_plans (id, name, name_ar, description, description_ar, price, max_appointments, max_storage_mb, priority, active) VALUES (2,'Professional','احترافي','For growing medical practices','للعيادات المتنامية',5000,200,500,2,1)`, args: [] });
    await db.execute({ sql: `INSERT OR IGNORE INTO subscription_plans (id, name, name_ar, description, description_ar, price, max_appointments, max_storage_mb, priority, active) VALUES (3,'Enterprise','مؤسسي','Unlimited access for large clinics','وصول غير محدود للعيادات الكبيرة',10000,1000,2000,3,1)`, args: [] });
    console.log('✅ Subscription plans created');

    // --- Sample doctor user ---
    const doctorHash = await bcrypt.hash('doctor123', 12);
    await db.execute({ sql: `INSERT OR IGNORE INTO users (email, password_hash, role, status) VALUES (?, ?, 'DOCTOR', 'ACTIVE')`, args: ['doctor@example.com', doctorHash] });
    const doctorUserRow = await db.execute({ sql: `SELECT id FROM users WHERE email = ?`, args: ['doctor@example.com'] });
    const doctorUserId = doctorUserRow.rows[0].id;

    await db.execute({ sql: `INSERT OR IGNORE INTO doctors (user_id, name, specialty, city, clinic_address, phone, bio, price_range, working_hours, approved) VALUES (?,?,?,?,?,?,?,?,?,1)`, args: [doctorUserId, 'د. أحمد بن علي', 'طب عام', 'الجزائر العاصمة', 'شارع ديدوش مراد، رقم 45', '0555123456', 'طبيب عام ذو خبرة 15 سنة في الممارسة الطبية', '1500-3000 دج', workingHours] });
    const doctorRow = await db.execute({ sql: `SELECT id FROM doctors WHERE user_id = ?`, args: [doctorUserId] });
    const doctorId = doctorRow.rows[0].id;
    console.log('✅ Sample doctor created');

    // --- Sample patient ---
    await db.execute({ sql: `INSERT OR IGNORE INTO patients (id, name, phone, email, notes) VALUES (1,?,?,?,?)`, args: ['محمد العربي', '0551234567', 'patient@example.com', 'مريض منتظم'] });
    console.log('✅ Sample patient created');

    // --- Doctor subscription ---
    await db.execute({ sql: `INSERT OR IGNORE INTO doctor_subscriptions (id, doctor_id, plan_id, status, start_date, end_date) VALUES (1,?,2,'ACTIVE',?,?)`, args: [doctorId, now, future] });
    console.log('✅ Doctor subscription created');

    // --- Sample appointment ---
    await db.execute({ sql: `INSERT OR IGNORE INTO appointments (id, doctor_id, patient_id, date, time, status, notes) VALUES (1,?,1,?,'10:00','PENDING',?)`, args: [doctorId, now, 'فحص عام'] });
    console.log('✅ Sample appointment created');

    // --- Sample review ---
    await db.execute({ sql: `INSERT OR IGNORE INTO reviews (id, doctor_id, patient_name, rating, comment) VALUES (1,?,'كريم',5,?)`, args: [doctorId, 'طبيب ممتاز ومعاملة راقية'] });
    console.log('✅ Sample review created');

    // --- Specific doctor account (abdourbab3@gmail.com) ---
    const specificHash = await bcrypt.hash('1234567', 12);
    await db.execute({ sql: `INSERT OR IGNORE INTO users (email, password_hash, role, status) VALUES (?, ?, 'DOCTOR', 'ACTIVE')`, args: ['abdourbab3@gmail.com', specificHash] });
    const specificUserRow = await db.execute({ sql: `SELECT id FROM users WHERE email = ?`, args: ['abdourbab3@gmail.com'] });
    const specificUserId = specificUserRow.rows[0].id;

    await db.execute({ sql: `INSERT OR IGNORE INTO doctors (user_id, name, specialty, city, clinic_address, phone, bio, price_range, working_hours, approved) VALUES (?,?,?,?,?,?,?,?,?,1)`, args: [specificUserId, 'د. عبدو رباب', 'طب عام', 'الجزائر العاصمة', 'شارع الجزائر', '0555000000', 'طبيب عام', '1500-2500 دج', workingHours] });
    const specificDoctorRow = await db.execute({ sql: `SELECT id FROM doctors WHERE user_id = ?`, args: [specificUserId] });
    const specificDoctorId = specificDoctorRow.rows[0].id;

    await db.execute({ sql: `INSERT OR IGNORE INTO doctor_subscriptions (id, doctor_id, plan_id, status, start_date, end_date) VALUES (2,?,2,'ACTIVE',?,?)`, args: [specificDoctorId, now, future] });
    console.log('✅ Specific doctor (abdourbab3@gmail.com) created');

    console.log('\n🎉 Database seeding completed!');
    console.log('\n📋 Default credentials:');
    console.log('   Admin:  admin@docteur.dz / admin123');
    console.log('   Doctor: doctor@example.com / doctor123');
    console.log('   User:   abdourbab3@gmail.com / 1234567');

    db.close();
}

seed().catch(e => {
    console.error('❌ Seeding failed:', e);
    db.close();
    process.exit(1);
});
