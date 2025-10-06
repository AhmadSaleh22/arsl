export enum UserRole {
  PATIENT = 'patient',
  STUDENT = 'student',
  DOCTOR = 'doctor',
  NURSE = 'nurse',
  ADMIN = 'admin',
  GUEST = 'guest',
}

export enum UserStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
  PENDING_VERIFICATION = 'pending_verification',
}

export enum AppointmentStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  CANCELLED = 'cancelled',
  COMPLETED = 'completed',
  NO_SHOW = 'no_show',
}

export enum ConsultationType {
  IN_PERSON = 'in_person',
  VIDEO = 'video',
  AUDIO = 'audio',
  TEXT = 'text',
}

export enum PaymentMethod {
  WALLET = 'wallet',
  CARD = 'card',
  CASH = 'cash',
}

export enum PaymentStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  FAILED = 'failed',
  REFUNDED = 'refunded',
}

export enum EmergencyStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

export enum HomeVisitType {
  GENERAL_DOCTOR = 'general_doctor',
  NURSING = 'nursing',
  PHYSIOTHERAPY = 'physiotherapy',
  SAMPLE_COLLECTION = 'sample_collection',
  POST_SURGERY_CARE = 'post_surgery_care',
}

export enum NotificationType {
  APPOINTMENT_REMINDER = 'appointment_reminder',
  MEDICATION_REMINDER = 'medication_reminder',
  GENERAL = 'general',
  EMERGENCY = 'emergency',
  PROMOTIONAL = 'promotional',
}

export enum Language {
  AR = 'ar',
  EN = 'en',
}
