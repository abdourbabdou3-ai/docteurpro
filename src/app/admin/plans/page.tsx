'use client';

import { useEffect, useState } from 'react';
import { formatCurrency } from '@/lib/utils';

interface Plan {
    id: number;
    name: string;
    nameAr: string;
    description: string | null;
    descriptionAr: string | null;
    price: number;
    maxAppointments: number;
    maxStorageMb: number;
    priority: number;
    active: boolean;
}

export default function AdminPlansPage() {
    const [plans, setPlans] = useState<Plan[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editPlan, setEditPlan] = useState<Plan | null>(null);
    const [form, setForm] = useState({
        name: '',
        nameAr: '',
        description: '',
        descriptionAr: '',
        price: 0,
        maxAppointments: 100,
        maxStorageMb: 100,
        priority: 0,
    });
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchPlans();
    }, []);

    const fetchPlans = async () => {
        try {
            const res = await fetch('/api/subscriptions/plans');
            const data = await res.json();
            if (data.success) {
                setPlans(data.data);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const openModal = (plan?: Plan) => {
        if (plan) {
            setEditPlan(plan);
            setForm({
                name: plan.name,
                nameAr: plan.nameAr,
                description: plan.description || '',
                descriptionAr: plan.descriptionAr || '',
                price: plan.price,
                maxAppointments: plan.maxAppointments,
                maxStorageMb: plan.maxStorageMb,
                priority: plan.priority,
            });
        } else {
            setEditPlan(null);
            setForm({
                name: '',
                nameAr: '',
                description: '',
                descriptionAr: '',
                price: 0,
                maxAppointments: 100,
                maxStorageMb: 100,
                priority: 0,
            });
        }
        setShowModal(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);

        try {
            const url = editPlan
                ? `/api/subscriptions/plans/${editPlan.id}`
                : '/api/subscriptions/plans';

            const res = await fetch(url, {
                method: editPlan ? 'PUT' : 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form),
            });

            const data = await res.json();
            if (data.success) {
                setShowModal(false);
                fetchPlans();
            }
        } catch (error) {
            console.error(error);
        } finally {
            setSaving(false);
        }
    };

    const togglePlan = async (plan: Plan) => {
        try {
            const res = await fetch(`/api/subscriptions/plans/${plan.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ active: !plan.active }),
            });
            const data = await res.json();
            if (data.success) {
                fetchPlans();
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

    return (
        <>
            <div className="flex-between mb-xl">
                <div>
                    <h1 style={{ marginBottom: 'var(--spacing-xs)' }}>إدارة الباقات</h1>
                    <p className="text-muted">إنشاء وتعديل باقات الاشتراك</p>
                </div>
                <button className="btn btn-primary" onClick={() => openModal()}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M12 5v14M5 12h14" />
                    </svg>
                    إضافة باقة جديدة
                </button>
            </div>

            {/* Plans Grid */}
            <div className="grid grid-3">
                {plans.map((plan) => (
                    <div key={plan.id} className="card" style={{ opacity: plan.active ? 1 : 0.6 }}>
                        <div className="card-body text-center">
                            {!plan.active && (
                                <span className="badge badge-danger mb-md">غير نشط</span>
                            )}
                            <h3 style={{ marginBottom: 'var(--spacing-xs)' }}>{plan.nameAr}</h3>
                            <p className="text-muted" style={{ fontSize: 'var(--font-size-sm)' }}>
                                {plan.descriptionAr || plan.name}
                            </p>

                            <div style={{ margin: 'var(--spacing-lg) 0' }}>
                                <span style={{ fontSize: 'var(--font-size-4xl)', fontWeight: '800', color: 'var(--primary)' }}>
                                    {formatCurrency(plan.price)}
                                </span>
                                <span className="text-muted"> / شهرياً</span>
                            </div>

                            <ul style={{ listStyle: 'none', textAlign: 'right', marginBottom: 'var(--spacing-lg)' }}>
                                <li style={{ padding: 'var(--spacing-sm) 0', borderBottom: '1px solid var(--gray-100)' }}>
                                    حتى <strong>{plan.maxAppointments}</strong> موعد شهرياً
                                </li>
                                <li style={{ padding: 'var(--spacing-sm) 0', borderBottom: '1px solid var(--gray-100)' }}>
                                    <strong>{plan.maxStorageMb}</strong> ميغابايت تخزين
                                </li>
                                <li style={{ padding: 'var(--spacing-sm) 0' }}>
                                    أولوية العرض: <strong>{plan.priority}</strong>
                                </li>
                            </ul>

                            <div className="flex gap-sm">
                                <button className="btn btn-outline btn-sm" onClick={() => openModal(plan)}>
                                    تعديل
                                </button>
                                <button
                                    className={`btn btn-sm ${plan.active ? 'btn-danger' : 'btn-success'}`}
                                    onClick={() => togglePlan(plan)}
                                >
                                    {plan.active ? 'إلغاء التفعيل' : 'تفعيل'}
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Modal */}
            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3 className="modal-title">{editPlan ? 'تعديل الباقة' : 'إضافة باقة جديدة'}</h3>
                            <button className="modal-close" onClick={() => setShowModal(false)}>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M18 6L6 18M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="modal-body">
                                <div className="grid grid-2">
                                    <div className="form-group">
                                        <label className="form-label">الاسم (English)</label>
                                        <input
                                            type="text"
                                            className="form-input"
                                            value={form.name}
                                            onChange={(e) => setForm({ ...form, name: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">الاسم (عربي) *</label>
                                        <input
                                            type="text"
                                            className="form-input"
                                            value={form.nameAr}
                                            onChange={(e) => setForm({ ...form, nameAr: e.target.value })}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label className="form-label">الوصف (عربي)</label>
                                    <textarea
                                        className="form-textarea"
                                        rows={2}
                                        value={form.descriptionAr}
                                        onChange={(e) => setForm({ ...form, descriptionAr: e.target.value })}
                                    />
                                </div>

                                <div className="grid grid-2">
                                    <div className="form-group">
                                        <label className="form-label">السعر (دج) *</label>
                                        <input
                                            type="number"
                                            className="form-input"
                                            value={form.price}
                                            onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">أولوية العرض</label>
                                        <input
                                            type="number"
                                            className="form-input"
                                            value={form.priority}
                                            onChange={(e) => setForm({ ...form, priority: Number(e.target.value) })}
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-2">
                                    <div className="form-group">
                                        <label className="form-label">الحد الأقصى للمواعيد *</label>
                                        <input
                                            type="number"
                                            className="form-input"
                                            value={form.maxAppointments}
                                            onChange={(e) => setForm({ ...form, maxAppointments: Number(e.target.value) })}
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">مساحة التخزين (MB) *</label>
                                        <input
                                            type="number"
                                            className="form-input"
                                            value={form.maxStorageMb}
                                            onChange={(e) => setForm({ ...form, maxStorageMb: Number(e.target.value) })}
                                            required
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="submit" className="btn btn-primary" disabled={saving}>
                                    {saving ? 'جاري الحفظ...' : 'حفظ'}
                                </button>
                                <button type="button" className="btn btn-ghost" onClick={() => setShowModal(false)}>
                                    إلغاء
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}
