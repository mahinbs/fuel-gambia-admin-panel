// Admin Role Types
export enum AdminRole {
  SUPER_ADMIN = 'SUPER_ADMIN',
  GOVERNMENT_ADMIN = 'GOVERNMENT_ADMIN',
  STATION_HQ = 'STATION_HQ',
  STATION_BRANCH = 'STATION_BRANCH',
}

// User Types (from mobile app)
export enum UserRole {
  BENEFICIARY = 'BENEFICIARY',
  CUSTOMER = 'CUSTOMER',
  ATTENDANT = 'ATTENDANT',
}

export enum FuelType {
  PETROL = 'PETROL',
  DIESEL = 'DIESEL',
}

export enum TransactionMode {
  SUBSIDY = 'SUBSIDY',
  PAID = 'PAID',
}

export enum VerificationStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  SUCCESS = 'SUCCESS',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED',
  REFUNDED = 'REFUNDED',
}

// Admin User Interface
export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: AdminRole;
  permissions: string[];
  createdAt: string;
  lastLogin?: string;
  active: boolean;
  kycStatus?: 'PENDING' | 'APPROVED' | 'REJECTED';
  companyName?: string;
  departmentName?: string;
  stationName?: string;
  phoneNumber?: string;
  kycDocument1Url?: string;
  kycDocument2Url?: string;
  kycDocument3Url?: string;
  stationId?: string;
}

// User Interfaces
export interface User {
  id: string;
  phoneNumber: string;
  role: UserRole;
  name?: string;
  email?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Beneficiary extends User {
  role: UserRole.BENEFICIARY;
  governmentId?: string;
  employmentLetter?: string;
  departmentName?: string;
  verificationStatus: VerificationStatus;
  monthlyAllocation: number;
  remainingBalance: number;
  fuelType: FuelType;
  expiryDate: string;
  documents?: Document[];
  rejectionReason?: string;
}

export interface Customer extends User {
  role: UserRole.CUSTOMER;
  walletBalance: number;
  totalSpend: number;
  status: 'ACTIVE' | 'SUSPENDED';
}

export interface Attendant extends User {
  role: UserRole.ATTENDANT;
  stationId: string;
  stationName: string;
  deviceId?: string;
  lastLogin?: string;
  status: 'ACTIVE' | 'SUSPENDED';
}

// Station Interface
export interface Station {
  id: string;
  name: string;
  stationCode?: string;
  location: string;
  managerId?: string;
  managerName?: string;
  fuelTypes: FuelType[];
  petrolStock: number;
  dieselStock: number;
  lowStockThreshold: number;
  status: 'ACTIVE' | 'INACTIVE' | 'MAINTENANCE';
  createdAt: string;
  lastSync?: string;
}

// Transaction Interface
export interface Transaction {
  id: string;
  userId: string;
  userName?: string;
  userRole: UserRole;
  stationId?: string;
  stationName?: string;
  fuelType: FuelType;
  amount: number;
  liters: number;
  mode: TransactionMode;
  status: PaymentStatus;
  qrCode?: string;
  qrPayload?: any;
  attendantId?: string;
  attendantName?: string;
  companyName?: string;
  branchCode?: string;
  createdAt: string;
  updatedAt: string;
}

// Payment Interface
export interface Payment {
  id: string;
  userId: string;
  userName?: string;
  transactionId: string;
  amount: number;
  fuelType: FuelType;
  status: PaymentStatus;
  paymentMethod?: string;
  gatewayResponse?: any;
  retryCount: number;
  refunded: boolean;
  createdAt: string;
  updatedAt: string;
}

// Inventory Interface
export interface Inventory {
  stationId: string;
  stationName: string;
  petrolStock: number;
  dieselStock: number;
  lastUpdated: string;
  syncStatus: 'SYNCED' | 'PENDING' | 'FAILED';
}

// Notification Interface
export interface Notification {
  id: string;
  userId?: string;
  type: 'BROADCAST' | 'USER_SPECIFIC' | 'LOW_BALANCE' | 'ALLOCATION' | 'PAYMENT' | 'VERIFICATION' | 'LOW_STOCK';
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
}

// QR Audit Interface
export interface QRAudit {
  id: string;
  qrCode: string;
  payload: any;
  scannedBy: string;
  stationId: string;
  stationName: string;
  redeemed: boolean;
  redemptionTimestamp?: string;
  fuelDispensed?: number;
  balanceChange?: number;
  createdAt: string;
}

// Document Interface
export interface Document {
  id: string;
  type: 'GOVERNMENT_ID' | 'EMPLOYMENT_LETTER' | 'OTHER';
  url: string;
  uploadedAt: string;
}

// Report Interface
export interface Report {
  id: string;
  type: 'DAILY' | 'MONTHLY' | 'STATION_PERFORMANCE' | 'DEPARTMENT_SUBSIDY' | 'REVENUE_SUMMARY';
  period: string;
  data: any;
  generatedAt: string;
  generatedBy: string;
}

// Dashboard Stats
export interface DashboardStats {
  totalBeneficiaries: number;
  pendingVerifications: number;
  totalSubsidyIssued: number;
  totalCommercialRevenue: number;
  todayTransactions: number;
  activeStations: number;
  lowInventoryAlerts: number;
  failedQRScans: number;
  paymentFailures: number;
}

// Chart Data
export interface ChartData {
  name?: string;
  label?: string;
  value?: number;
  [key: string]: any;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Form Types
export interface LoginForm {
  email: string;
  password: string;
}

export interface BeneficiaryVerificationForm {
  status: VerificationStatus;
  rejectionReason?: string;
}

export interface AllocationForm {
  monthlyAllocation: number;
  fuelType: FuelType;
}

export interface StationForm {
  name: string;
  location: string;
  stationCode: string;
  managerId?: string;
  fuelTypes: FuelType[];
  lowStockThreshold: number;
}

export interface InventoryForm {
  stationId: string;
  fuelType: FuelType;
  quantity: number;
  action: 'ADD' | 'DEDUCT';
}

export interface NotificationForm {
  type: Notification['type'];
  title: string;
  message: string;
  userId?: string;
  broadcast: boolean;
}

export interface PriceConfigForm {
  petrol: number;
  diesel: number;
}

export interface AllocationRuleForm {
  department: string;
  monthlyAllocation: number;
  fuelType: FuelType;
}

// Policy Management Types
export interface FuelPolicy {
  id: string;
  title: string;
  description?: string;
  policyType: string;
  value?: number;
  fuelType?: FuelType | 'ALL' | string;
  effectiveFrom: string;
  effectiveTo?: string;
  isActive: boolean;
  version: number;
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
  history?: PolicyVersion[];
}

export interface PolicyVersion {
  id: string;
  policyId: string;
  version: number;
  changes: string;
  changedBy: string;
  changedAt: string;
}

// Coupon Management Types
export interface Coupon {
  id: string;
  beneficiaryId: string;
  beneficiaryName?: string;
  fuelType: FuelType;
  amount: number; // GMD
  liters: number;
  remainingBalance?: number;
  status: 'ACTIVE' | 'USED' | 'EXPIRED' | 'CANCELLED';
  issuedAt?: string;
  expiresAt: string;
  usedAt?: string;
  transactions?: Transaction[];
  allocationId?: string;
  qrPayload?: string;
  usedAtStation?: string;
  createdAt: string;
}

// Audit & Fraud Detection Types
export interface FraudAlert {
  id: string;
  type: 'DUPLICATE_SCAN' | 'ABNORMAL_VOLUME' | 'SUSPICIOUS_PATTERN' | 'MULTIPLE_STATIONS';
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  description: string;
  transactionId?: string;
  userId?: string;
  stationId?: string;
  detectedAt: string;
  status: 'PENDING' | 'INVESTIGATING' | 'RESOLVED' | 'FALSE_POSITIVE';
  resolvedBy?: string;
  resolvedAt?: string;
  resolution?: string;
}

export interface AuditLog {
  id: string;
  action: string;
  entityType: string;
  entityId: string;
  userId: string;
  userName: string;
  userRole: AdminRole;
  changes?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  timestamp?: string;
  createdAt: string;
}

// Station Approval Types
export interface StationRequest {
  id: string;
  name: string;
  location: string;
  managerName: string;
  managerEmail: string;
  managerPhone: string;
  fuelTypes: FuelType[];
  documents: Document[];
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  stationCode?: string;
  submittedAt: string;
  reviewedBy?: string;
  reviewedAt?: string;
  rejectionReason?: string;
  stationId?: string; // Assigned after approval
}

// Monthly Settlement Types is now defined below as an extension of Reconciliation

// Department Types
export interface Department {
  id: string;
  name: string;
  code: string;
  headOfficerId?: string;
  headOfficerName?: string;
  totalBeneficiaries: number;
  monthlyBudget: number;
  usedBudget: number;
  remainingBudget: number;
  createdAt: string;
}

// Beneficiary Allocation Types
export interface BeneficiaryAllocation {
  id: string;
  beneficiaryId: string;
  beneficiaryName: string;
  departmentId: string;
  departmentName: string;
  fuelType: FuelType;
  monthlyAmount: number; // GMD
  monthlyLiters: number;
  usedAmount: number;
  usedLiters: number;
  remainingAmount: number;
  remainingLiters: number;
  status: 'ACTIVE' | 'SUSPENDED' | 'EXPIRED';
  startDate: string;
  endDate: string;
  createdAt: string;
  updatedAt: string;
}

// Dashboard Stats by Role
export interface SuperAdminDashboardStats {
  totalNationalBudget: number;
  totalFuelDispensed: number; // liters
  monthlySubsidyUtilization: number; // percentage
  activeFuelStations: number;
  fraudAlerts: number;
  pendingStationRequests: number;
  totalBeneficiaries: number;
  totalDepartmentOfficers: number;
  totalStationManagers: number;
  totalMobileUsers: number;
  totalBranchUsers: number;
  totalHQUsers: number;
  totalDeptUsers: number;
  totalCouponsUsed: number;
}

export interface GovernmentAdminDashboardStats {
  totalBeneficiaries: number;
  monthlyAllocatedFuel: number; // liters
  usedFuel: number;
  remainingFuel: number;
  pendingVerifications: number;
  activeCoupons: number;
  expiredCoupons: number;
  totalAllocations: number;
}

export interface StationAdminDashboardStats {
  todaySales: number; // GMD
  monthlyFuelDispensed: number; // liters
  petrolStock: number;
  dieselStock: number;
  lowStockAlerts: number;
  pendingReimbursements: number;
  todayTransactions: number;
  activeAttendants: number;
}

export interface Company {
  id: string;
  name: string;
  registrationNumber?: string;
  contactEmail?: string;
  contactPhone?: string;
  address?: string;
  status: 'ACTIVE' | 'INACTIVE' | 'PENDING';
  onboardedBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface StationOrder {
  id: string;
  stationId: string;
  orderedBy: string;
  fuelType: FuelType;
  orderedLiters: number;
  unitPrice?: number;
  totalCost?: number;
  supplierName?: string;
  expectedDeliveryDate?: string;
  actualDeliveryDate?: string;
  status: 'PENDING' | 'APPROVED' | 'DISPATCHED' | 'DELIVERED' | 'CANCELLED';
  deliveryId?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface FuelDelivery {
  id: string;
  stationId: string;
  receivedBy: string;
  deliveryDate: string;
  fuelType: FuelType;
  orderedLiters: number;
  deliveredLiters: number;
  varianceLiters?: number;
  deliveryNoteNumber?: string;
  supplierName?: string;
  preDeliveryStock?: number;
  postDeliveryStock?: number;
  notes?: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'DISPUTED';
  createdAt: string;
}

export interface Reconciliation {
  id: string;
  stationId: string;
  reconciledBy: string;
  periodMonth: number;
  periodYear: number;
  fuelType: FuelType;
  openingStock: number;
  totalOrdered: number;
  totalSold: number;
  theoreticalClosing: number;
  physicalClosing?: number;
  shortageLiters: number;
  shortageThreshold?: number;
  shortagePayable?: boolean;
  cashSales: number;
  couponSales: number;
  mobileMoneySales: number;
  totalCashCollected: number;
  bankDepositAmount: number;
  status: 'DRAFT' | 'SUBMITTED' | 'APPROVED' | 'REJECTED' | 'PAID';
  approvedBy?: string;
  approvedAt?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface MonthlySettlement extends Reconciliation {}

export interface BillingRecord {
  id: string;
  stationId?: string;
  departmentId?: string;
  billingPeriodStart: string;
  billingPeriodEnd: string;
  totalLitersBilled: number;
  totalAmount: number;
  paymentStatus: 'PENDING' | 'INVOICED' | 'PAID' | 'OVERDUE' | 'DISPUTED';
  invoiceNumber?: string;
  generatedBy?: string;
  paidAt?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CouponAllocation {
  id: string;
  beneficiaryId: string;
  allocatedBy?: string;
  fuelType: FuelType;
  allocatedLiters: number;
  usedLiters: number;
  remainingLiters: number;
  pricePerLiter: number;
  totalValue: number;
  validFrom: string;
  validUntil: string;
  status: 'ACTIVE' | 'USED' | 'EXPIRED' | 'CANCELLED';
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Shift {
  id: string;
  stationId: string;
  shiftDate: string;
  shiftType: 'MORNING' | 'AFTERNOON' | 'NIGHT';
  startTime?: string;
  endTime?: string;
  createdBy?: string;
  notes?: string;
  status: 'OPEN' | 'CLOSED';
  createdAt: string;
  updatedAt: string;
  pump_assignments?: any[];
}

export interface MeterReading {
  id: string;
  shiftId: string;
  pumpId: string;
  attendantId: string;
  readingType: 'OPENING' | 'CLOSING';
  petrolReading: number;
  dieselReading: number;
  recordedAt: string;
  notes?: string;
}

