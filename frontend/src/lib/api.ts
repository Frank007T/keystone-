import axios, { type AxiosResponse } from 'axios';

// ==========================================
// TYPE DEFINITIONS
// ==========================================

export interface SignupPayload {
  fullName: string;
  companyName: string;
  email: string;
  phone: string;
  password: string;
  role: 'customer';
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  email: string;
  role: string;
}

export interface Manager {
  id: number;
  fullName: string;
  email: string;
  phone: string;
  zoneId: number;
  enabled: boolean;
  createdAt: string;
}

export interface Dispatcher {
  id: number;
  fullName: string;
  email: string;
  phone: string;
  managerId: number;
  zoneId: number;
  enabled: boolean;
  createdAt: string;
}

export interface Technician {
  id: number;
  fullName: string;
  email: string;
  phone: string;
  managerId: number;
  dispatcherId: number;
  zoneId: number;
  enabled: boolean;
  createdAt: string;
}

export interface User {
  fullName: string;
  companyName: string;
  email: string;
  phone: string;
  role: string;
  enabled: boolean;
  managerEmail?: string;
  createdAt: string;
}

export interface Site {
  id: number;
  name: string;
  address: string;
  contactName: string;
  contactPhone: string;
  status: string;
  customerEmail: string;
}

export interface CreateSitePayload {
  name: string;
  address: string;
  contactName: string;
  contactPhone: string;
  status?: string;
}

export interface WorkOrder {
  id: number;
  title: string;
  description: string;
  siteName: string;
  customerEmail: string;
  assignedToEmail?: string;
  priority: string;
  status: string;
  dueDate?: string;
  createdAt: string;
}

export interface Invoice {
  invoiceNumber: string;
  invoiceDate?: string;
  amount: number;
  status: string;
  customerEmail: string;
  dueDate?: string;
}

export interface Notification {
  id?: number;
  workOrderId?: number;
  senderEmail?: string;
  senderRole?: string;
  recipientEmail?: string;
  recipientRole?: string;
  title?: string;
  message: string;
  isRead?: boolean;
  createdAt?: string;
}

export interface Part {
  id?: number;
  name: string;
  sku: string;
  category: string;
  stock: number;
  unitPrice: number;
  createdAt?: string;
}

export interface PartRequest {
  name: string;
  sku: string;
  category: string;
  stock: number;
  unitPrice: number;
}

export interface TimeLog {
  workOrderId: number;
  technicianEmail: string;
  startTime: string;
  endTime?: string;
  notes: string;
}

export interface CreateRequestPayload {
  title: string;
  description: string;
  siteName: string;
  priority: string;
  dueDate?: string;
}

export interface DashboardMetrics {
  totalManagers: number;
  totalDispatchers: number;
  totalTechnicians: number;
  totalRequests: number;
  managersGrowth?: number;
  dispatchersGrowth?: number;
  techniciansGrowth?: number;
  requestsGrowth?: number;
}

export interface UserDistribution {
  managers: number;
  dispatchers: number;
  technicians: number;
  customers: number;
  total: number;
}

export interface RecentActivity {
  id: string | number;
  message: string;
  timestamp: string;
  type?: string;
}

export interface AdminDashboardResponse {
  metrics: DashboardMetrics;
  distribution: UserDistribution;
  activities: RecentActivity[];
  requests: WorkOrder[];
  totalRequestCount: number;
}

// ==========================================
// AXIOS CLIENT CONFIGURATION
// ==========================================

const API_BASE_URL = (import.meta.env as any).VITE_API_URL || 'http://localhost:8080';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('keystoneToken');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

async function handleResponse<T>(promise: Promise<AxiosResponse<T>>): Promise<T> {
  try {
    const response = await promise;
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      const errorData = error.response.data;
      const message =
        typeof errorData === 'object' && errorData.message
          ? errorData.message
          : String(errorData) || error.message;
      throw new Error(message);
    }
    throw new Error('Unexpected API error');
  }
}

// ==========================================
// AUTH & APPROVAL ENDPOINTS
// ==========================================

export function signup(payload: SignupPayload) {
  return handleResponse<string>(api.post('/api/auth/signup', payload));
}

export function verifyOtp(email: string, otp: string) {
  return handleResponse<string>(api.post('/api/auth/verify-otp', { email, otp }));
}

export function login(payload: LoginPayload) {
  return handleResponse<LoginResponse>(api.post('/api/auth/login', payload));
}

export function forgotPassword(email: string) {
  return handleResponse<string>(api.post('/api/auth/forgot-password', { email }));
}

export function resetPassword(email: string, otp: string, newPassword: string) {
  return handleResponse<string>(api.post('/api/auth/reset-password', { email, otp, newPassword }));
}

// ==========================================
// ADMIN USER MANAGEMENT ENDPOINTS
// ==========================================

export function createManager(payload: { fullName: string; email: string; phone: string; zoneId: number }) {
  return handleResponse<Manager>(api.post('/api/admin/managers', payload));
}

export function listManagers() {
  return handleResponse<Manager[]>(api.get('/api/admin/managers'));
}

export function editManager(id: number, payload: { fullName: string; phone: string; zoneId?: number }) {
  return handleResponse<Manager>(api.put(`/api/admin/managers/${id}`, payload));
}

export const updateManager = editManager;

export function deleteManager(id: number) {
  return handleResponse<void>(api.delete(`/api/admin/managers/${id}`));
}

export function resetManagerPassword(id: number) {
  return handleResponse<string>(api.post(`/api/admin/managers/${id}/reset-password`));
}

export function fetchAllUsers(role: string = 'all') {
  return handleResponse<User[]>(api.get('/api/admin/users', { params: { role } }));
}

export function fetchAdminDashboard(page: number = 1, limit: number = 5) {
  return handleResponse<AdminDashboardResponse>(
    api.get(`/api/admin/dashboard`, { params: { page, limit } })
  );
}

export function deleteRequest(id: number | string) {
  return handleResponse<void>(api.delete(`/api/admin/requests/${id}`));
}

// ==========================================
// MANAGER & DISPATCHER USER MANAGEMENT ENDPOINTS
// ==========================================

export function fetchManagerUsers() {
  return handleResponse<User[]>(api.get('/api/data/manager/users'));
}

export function createDispatcher(fullName: string, email: string, phone: string, zoneId: number) {
  return handleResponse<Dispatcher>(api.post('/api/admin/dispatchers', { fullName, email, phone, zoneId }));
}

export function listDispatchers() {
  return handleResponse<Dispatcher[]>(api.get('/api/admin/dispatchers'));
}

export function editDispatcher(id: number, fullName: string, phone: string, zoneId?: number) {
  return handleResponse<Dispatcher>(api.put(`/api/admin/dispatchers/${id}`, { fullName, phone, zoneId }));
}

export function deleteDispatcher(id: number) {
  return handleResponse<void>(api.delete(`/api/admin/dispatchers/${id}`));
}

export function resetDispatcherPassword(id: number) {
  return handleResponse<string>(api.post(`/api/admin/dispatchers/${id}/reset-password`));
}

export function createTechnician(payload: { fullName: string; email: string; phone: string; dispatcherId: number; zoneId: number }) {
  return handleResponse<Technician>(api.post('/api/admin/technicians', payload));
}

export function listTechnicians() {
  return handleResponse<Technician[]>(api.get('/api/admin/technicians'));
}

export function editTechnician(id: number, fullName: string, phone: string, dispatcherId?: number, zoneId?: number) {
  return handleResponse<Technician>(api.put(`/api/admin/technicians/${id}`, { fullName, phone, dispatcherId, zoneId }));
}

export function deleteTechnician(id: number) {
  return handleResponse<void>(api.delete(`/api/admin/technicians/${id}`));
}

export function resetTechnicianPassword(id: number) {
  return handleResponse<string>(api.post(`/api/admin/technicians/${id}/reset-password`));
}

export function fetchManagerCustomers() {
  return handleResponse<User[]>(api.get('/api/data/manager/customers'));
}

export function fetchDispatcherCustomers() {
  return handleResponse<User[]>(api.get('/api/data/dispatcher/customers'));
}

export function fetchManagerTechnicians() {
  return handleResponse<User[]>(api.get('/api/data/manager/technicians'));
}

export function fetchDispatcherTechnicians() {
  return handleResponse<User[]>(api.get('/api/data/dispatcher/technicians'));
}

export function fetchManagerDispatchers() {
  return handleResponse<User[]>(api.get('/api/data/manager/dispatchers'));
}

// ==========================================
// DATA & DOMAIN ENDPOINTS
// ==========================================

export function fetchCurrentUser() {
  return handleResponse<User>(api.get('/api/data/me'));
}

export function fetchMySites() {
  return handleResponse<Site[]>(api.get('/api/data/sites'));
}

export function fetchAllSites() {
  return handleResponse<Site[]>(api.get('/api/data/sites/all'));
}

export function createSite(payload: CreateSitePayload) {
  return handleResponse<Site>(api.post('/api/data/sites', payload));
}

export function updateSite(id: number, payload: CreateSitePayload) {
  return handleResponse<Site>(api.put(`/api/data/sites/${id}`, payload));
}

export function deleteSite(id: number) {
  return handleResponse<void>(api.delete(`/api/data/sites/${id}`));
}

export function fetchMyRequests() {
  return handleResponse<WorkOrder[]>(api.get('/api/data/requests'));
}

export function fetchWorkOrders() {
  return handleResponse<WorkOrder[]>(api.get('/api/data/work-orders'));
}

export function fetchTechnicianJobs() {
  return handleResponse<WorkOrder[]>(api.get('/api/data/technician/jobs'));
}

export function fetchDispatcherWorkOrders() {
  return handleResponse<WorkOrder[]>(api.get('/api/data/dispatcher/work-orders'));
}

export function fetchManagerWorkOrders() {
  return handleResponse<WorkOrder[]>(api.get('/api/data/manager/work-orders'));
}

export function assignWorkOrder(workOrderId: number, technicianEmail: string) {
  return handleResponse<WorkOrder>(
    api.put(`/api/data/dispatcher/work-orders/${workOrderId}/assign`, { technicianEmail })
  );
}

export function fetchMyInvoices() {
  return handleResponse<Invoice[]>(api.get('/api/data/invoices'));
}

export function fetchMyNotifications() {
  return handleResponse<Notification[]>(api.get('/api/data/notifications'));
}

export function fetchMyTimeLogs() {
  return handleResponse<TimeLog[]>(api.get('/api/data/technician/time-logs'));
}

export function fetchTimeLogs() {
  return fetchMyTimeLogs();
}

export function fetchPartsUsed() {
  return handleResponse<Part[]>(api.get('/api/data/technician/parts-used'));
}

export function createRequest(payload: CreateRequestPayload) {
  return handleResponse<string>(api.post('/api/data/requests', payload));
}

export async function fetchPartInventory(search?: string): Promise<Part[]> {
  const response = await api.get('/api/parts', {
    params: { search, size: 50, sort: 'name,asc' },
  });
  return response.data.content ? response.data.content : response.data;
}

export async function createPart(partData: PartRequest): Promise<Part> {
  const response = await api.post('/api/parts', partData);
  return response.data;
}

export async function updatePart(id: number, partData: PartRequest): Promise<Part> {
  const response = await api.put(`/api/parts/${id}`, partData);
  return response.data;
}

export async function deletePart(id: number): Promise<void> {
  await api.delete(`/api/parts/${id}`);
}

export function fetchRequestsByZone(zoneId?: number) {
  return handleResponse<WorkOrder[]>(
    api.get('/api/data/manager/work-orders', { params: { zoneId } })
  );
}

// ==========================================
// SEPARATED CHAT ENDPOINTS
// ==========================================

export function fetchManagerDispatcherMessages(workOrderId: number) {
  return handleResponse<Notification[]>(
    api.get(`/api/chat/manager-dispatcher/${workOrderId}`)
  );
}

export function sendManagerDispatcherMessage(workOrderId: number, message: string, recipientEmail?: string) {
  return handleResponse<Notification>(
    api.post(`/api/chat/manager-dispatcher/${workOrderId}`, { message, recipientEmail })
  );
}

export function fetchAdminManagerMessages(workOrderId: number) {
  return handleResponse<Notification[]>(
    api.get(`/api/chat/admin-manager/${workOrderId}`)
  );
}

export function sendAdminManagerMessage(workOrderId: number, message: string, recipientEmail?: string) {
  return handleResponse<Notification>(
    api.post(`/api/chat/admin-manager/${workOrderId}`, { message, recipientEmail })
  );
}

export function fetchDispatcherTechnicianMessages(workOrderId: number) {
  return handleResponse<Notification[]>(
    api.get(`/api/chat/dispatcher-technician/${workOrderId}`)
  );
}

export function sendDispatcherTechnicianMessage(workOrderId: number, message: string, recipientEmail?: string) {
  return handleResponse<Notification>(
    api.post(`/api/chat/dispatcher-technician/${workOrderId}`, { message, recipientEmail })
  );
}

export default api;