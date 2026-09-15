export type UserRole = 'EMPLOYEE' | 'FOUNDER_DIRECTOR';

export const isFounder = (role: UserRole | string): boolean =>
  role === 'FOUNDER_DIRECTOR' || role === 'founder';

export const isEmployee = (role: UserRole | string): boolean =>
  role === 'EMPLOYEE' || role === 'employee';

export interface AuthTokenPayload {
  sub: string; // userId
  email: string;
  role: UserRole;
  name: string;
  iat: number;
  exp: number;
}

export interface AuthSession {
  token: string;
  user: User;
  expiresAt: string;
  mustChangePassword?: boolean;
}

export interface UserCredential {
  userId: string;
  email: string;
  salt: string;
  passwordHash: string;
  mustChangePassword?: boolean; // true for newly created employees until they change password
}

export interface CreateEmployeeInput {
  name: string;
  personalEmail: string; // Employee's original personal email
  email?: string; // Generated or custom office email
  password?: string;
  department: string;
  designation: string;
  phone?: string;
  address?: string;
  emergencyContactName?: string;
  emergencyContactRelationship?: string;
  emergencyContactPhone?: string;
  joiningDate?: string;
  reportingPerson?: string;
  employmentStatus?: 'Full-Time' | 'Probation' | 'Contract' | 'Part-Time';
  avatarUrl?: string;
}

export interface User {
  id: string;
  email: string; // Corporate office email
  personalEmail?: string; // Original personal email
  name: string;
  role: UserRole;
  status: 'active' | 'inactive';
  avatarUrl: string;
  lastLogin: string;
  department: string;
  designation: string;
}

export interface DispatchedEmail {
  id: string;
  recipientName: string;
  personalEmail: string;
  officeEmail: string;
  tempPassword?: string;
  subject: string;
  body: string;
  dispatchedAt: string;
  type: 'WELCOME_CREDENTIALS' | 'PASSWORD_RESET';
  resetToken?: string;
  status: 'DELIVERED' | 'QUEUED';
}

export interface PasswordResetToken {
  token: string;
  userId: string;
  personalEmail: string;
  officeEmail: string;
  expiresAt: number;
}

export interface EmployeeProfile {
  userId: string;
  employeeId: string;
  name: string;
  email: string;
  personalEmail?: string;
  phone: string;
  address: string;
  emergencyContact: {
    name: string;
    relationship: string;
    phone: string;
  };
  photo: string;
}

export interface EmploymentDetails {
  employeeId: string;
  joiningDate: string;
  designation: string;
  department: string;
  reportingPerson: string;
  employmentStatus: 'Full-Time' | 'Probation' | 'Contract' | 'Part-Time';
  // Protected fields managed by Founder/Director:
  compensation?: string;
  bankAccountMasked?: string;
  taxIdentifier?: string;
  lastReviewDate?: string;
}

export interface Team {
  id: string;
  name: string;
  leadName: string;
  memberCount: number;
}

export type TaskStatus = 'not_started' | 'in_progress' | 'blocked' | 'completed';
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface Task {
  id: string;
  title: string;
  description: string;
  assigneeId: string;
  assigneeName: string;
  creatorId: string;
  priority: TaskPriority;
  status: TaskStatus;
  dueDate: string;
  progress: number; // 0 - 100
  assignedDate: string;
  completedAt?: string;
  completionNotes?: string;
}

export interface TaskUpdate {
  id: string;
  taskId: string;
  authorName: string;
  updateText: string;
  progress: number;
  timestamp: string;
}

export type WorkHourRecordingMethod = 'clock_in_out' | 'manual' | 'timesheet';
export type WorkHourStatus = 'pending' | 'approved' | 'rejected';

export interface WorkHour {
  id: string;
  employeeId: string;
  employeeName?: string;
  date: string;
  clockIn?: string;
  clockOut?: string;
  totalHours: number;
  status: WorkHourStatus;
  notes?: string;
  recordingMethod?: WorkHourRecordingMethod;
  approvedBy?: string;
  approvedAt?: string;
}

export interface ActiveClockSession {
  employeeId: string;
  clockInTime: string; // ISO string
  date: string;
  notes?: string;
}

export type DocumentCategory = 'Offer Letter' | 'ID Proofs' | 'Policies' | 'Tax Forms';

export interface EmployeeDocument {
  id: string;
  employeeId: string;
  category: DocumentCategory;
  name: string;
  fileName: string;
  fileSize: string;
  uploadDate: string;
  version: string;
  uploaderName: string;
  privateUrl: string;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  authorName: string;
  publishTime: string;
  priority: 'normal' | 'important' | 'urgent';
  acknowledgedUserIds: string[];
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  recipientId: string;
  content: string;
  timestamp: string;
  read: boolean;
}

export type RoadmapStatus = 'planned' | 'in_progress' | 'at_risk' | 'completed' | 'on_hold';

export interface RoadmapItem {
  id: string;
  title: string;
  description: string;
  targetDate: string;
  priority: 'low' | 'medium' | 'high';
  status: RoadmapStatus;
  notes: string;
  updatedAt: string;
  updatedBy: string;
}

export interface FinanceTransaction {
  id: string;
  type: 'inflow' | 'outflow' | 'investment';
  date: string;
  amount: number;
  category: string;
  description: string;
  reference: string;
  creatorName: string;
}

export interface GrowthMetric {
  period: string; // e.g. "Q1 2026", "Q2 2026", "2025"
  revenue: number;
  burnRate: number;
  netMargin: number;
  growthPercentage: number;
}

export interface BalanceSheetEntry {
  id: string;
  period: string; // e.g., "August 2026" or "Q3 2026"
  category: 'Current Assets' | 'Non-Current Assets' | 'Current Liabilities' | 'Long-Term Liabilities' | 'Equity';
  lineItem: string;
  openingValue: number;
  movementValue: number;
  closingValue: number;
  notes?: string;
}

export interface AuditLog {
  id: string;
  user: string;
  action: string;
  entity: string;
  entityId: string;
  changeSummary: string;
  timestamp: string;
}
