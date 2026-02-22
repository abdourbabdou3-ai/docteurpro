// Common types used throughout the application

export interface WorkingHours {
    [day: string]: {
        start: string;
        end: string;
    } | null;
}

export interface DoctorPublic {
    id: number;
    name: string;
    specialty: string;
    city: string;
    clinicAddress: string | null;
    workingHours: WorkingHours | null;
    priceRange: string | null;
    profileImage: string | null;
    phone: string | null;
    bio: string | null;
    rating: number;
    reviewCount: number;
}

export interface PatientData {
    id: number;
    name: string;
    phone: string;
    email: string | null;
    notes: string | null;
    createdAt: Date;
    appointmentCount?: number;
}

export interface AppointmentData {
    id: number;
    doctorId: number;
    patientId: number;
    date: Date;
    time: string;
    status: 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED';
    notes: string | null;
    patient?: PatientData;
    doctor?: DoctorPublic;
}

export interface SubscriptionPlanData {
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

export interface DoctorSubscriptionData {
    id: number;
    doctorId: number;
    planId: number;
    status: 'PENDING' | 'ACTIVE' | 'EXPIRED' | 'CANCELLED';
    startDate: Date | null;
    endDate: Date | null;
    plan?: SubscriptionPlanData;
}

export interface ReviewData {
    id: number;
    doctorId: number;
    patientName: string;
    rating: number;
    comment: string | null;
    createdAt: Date;
}

export interface PatientFileData {
    id: number;
    patientId: number;
    doctorId: number;
    filePath: string;
    fileName: string;
    fileType: string;
    fileSize: number;
    uploadedAt: Date;
}

export interface DashboardStats {
    totalAppointments: number;
    todayAppointments: number;
    totalPatients: number;
    monthlyRevenue: number;
    pendingAppointments: number;
    completedAppointments: number;
}

export interface AdminStats {
    totalDoctors: number;
    activeDoctors: number;
    pendingDoctors: number;
    totalPatients: number;
    totalAppointments: number;
    monthlyRevenue: number;
    pendingSubscriptions: number;
}

export interface ApiResponse<T = unknown> {
    success: boolean;
    data?: T;
    error?: string;
    message?: string;
}
