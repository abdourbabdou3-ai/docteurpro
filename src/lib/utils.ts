import { type ClassValue, clsx } from 'clsx';

export function cn(...inputs: ClassValue[]) {
    return clsx(inputs);
}

// Format date to Arabic
export function formatDateAr(date: Date | string | null | undefined): string {
    if (!date) return '-';
    try {
        const d = new Date(date);
        if (isNaN(d.getTime())) return '-';
        return d.toLocaleDateString('ar-DZ', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    } catch (e) {
        return '-';
    }
}

// Format time to Arabic
export function formatTimeAr(time: string | null | undefined): string {
    if (!time) return '-';
    try {
        const parts = time.split(':');
        if (parts.length < 2) return time;
        const [hours, minutes] = parts;
        const h = parseInt(hours);
        const period = h >= 12 ? 'مساءً' : 'صباحًا';
        const displayHour = h > 12 ? h - 12 : h === 0 ? 12 : h;
        return `${displayHour}:${minutes} ${period}`;
    } catch (e) {
        return time || '-';
    }
}

// Format currency in DZD
export function formatCurrency(amount: number | null | undefined): string {
    const val = amount || 0;
    try {
        return new Intl.NumberFormat('ar-DZ', {
            style: 'currency',
            currency: 'DZD',
            maximumFractionDigits: 0,
        }).format(val);
    } catch (e) {
        return `${val} دج`;
    }
}

// Format file size
export function formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 بايت';
    const k = 1024;
    const sizes = ['بايت', 'كيلوبايت', 'ميغابايت', 'غيغابايت'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Arabic day names
export const arabicDays: Record<string, string> = {
    sunday: 'الأحد',
    monday: 'الإثنين',
    tuesday: 'الثلاثاء',
    wednesday: 'الأربعاء',
    thursday: 'الخميس',
    friday: 'الجمعة',
    saturday: 'السبت',
};

// Algerian Wilayas (58)
export const algerianWilayas = [
    '01. أدرار', '02. الشلف', '03. الأغواط', '04. أم البواقي', '05. باتنة',
    '06. بجاية', '07. بسكرة', '08. بشار', '09. البليدة', '10. البويرة',
    '11. تمنراست', '12. تبسة', '13. تلمسان', '14. تيارت', '15. تيزي وزو',
    '16. الجزائر', '17. الجلفة', '18. جيجل', '19. سطيف', '20. سعيدة',
    '21. سكيكدة', '22. سيدي بلعباس', '23. عنابة', '24. قالمة', '25. قسنطينة',
    '26. المدية', '27. مستغانم', '28. المسيلة', '29. معسكر', '30. ورقلة',
    '31. وهران', '32. البيض', '33. إليزي', '34. برج بوعريريج', '35. بومرداس',
    '36. الطارف', '37. تندوف', '38. تيسمسيلت', '39. الوادي', '40. خنشلة',
    '41. سوق أهراس', '42. تيبازة', '43. ميلة', '44. عين الدفلى', '45. النعامة',
    '46. عين تموشنت', '47. غرداية', '48. غليزان', '49. تيميمون', '50. برج باجي مختار',
    '51. أولاد جلال', '52. بني عباس', '53. عين صالح', '54. عين قزام', '55. تقرت',
    '56. جانت', '57. المغير', '58. المنيعة'
];

// Medical specialties in Arabic
export const medicalSpecialties = [
    'طب عام',
    'طب الأطفال',
    'طب النساء والتوليد',
    'جراحة عامة',
    'طب العيون',
    'طب الأسنان',
    'طب القلب والأوعية',
    'طب الجلد',
    'طب الأعصاب',
    'طب العظام',
    'طب الأنف والأذن والحنجرة',
    'طب الباطنية',
    'طب نفسي',
    'طب المسالك البولية',
    'طب الغدد الصماء',
    'طب الصدر والتنفس',
    'طب الجهاز الهضمي',
    'طب الروماتيزم',
    'جراحة التجميل',
    'طب الأورام',
];

// Appointment status in Arabic
export const appointmentStatusAr: Record<string, string> = {
    PENDING: 'قيد الانتظار',
    CONFIRMED: 'مؤكد',
    COMPLETED: 'مكتمل',
    CANCELLED: 'ملغي',
};

// Subscription status in Arabic
export const subscriptionStatusAr: Record<string, string> = {
    PENDING: 'قيد الانتظار',
    ACTIVE: 'نشط',
    EXPIRED: 'منتهي',
    CANCELLED: 'ملغي',
};

// User status in Arabic
export const userStatusAr: Record<string, string> = {
    PENDING: 'قيد المراجعة',
    ACTIVE: 'نشط',
    SUSPENDED: 'معلق',
};

// Generate time slots
export function generateTimeSlots(start: string, end: string, intervalMinutes: number = 30): string[] {
    const slots: string[] = [];
    const [startHour, startMin] = start.split(':').map(Number);
    const [endHour, endMin] = end.split(':').map(Number);

    let currentHour = startHour;
    let currentMin = startMin;

    while (currentHour < endHour || (currentHour === endHour && currentMin < endMin)) {
        slots.push(`${currentHour.toString().padStart(2, '0')}:${currentMin.toString().padStart(2, '0')}`);
        currentMin += intervalMinutes;
        if (currentMin >= 60) {
            currentHour += Math.floor(currentMin / 60);
            currentMin = currentMin % 60;
        }
    }

    return slots;
}

// Validate Algerian phone number
export function isValidAlgerianPhone(phone: string): boolean {
    const cleaned = phone.replace(/\s+/g, '');
    return /^(0|\+213)[567]\d{8}$/.test(cleaned);
}

// Validate email
export function isValidEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
