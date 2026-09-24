import api from './axios';
import { unwrapData } from './api-response';

/* =========================
   TYPES
========================= */

export interface DashboardOverview {
  tickets: {
    total: number;
    open: number;
    inProgress: number;
    waiting: number;
    resolved: number;
    closed: number;
  };

  customers: {
    total: number;
  };

  agents: {
    total: number;
    online: number;
    offline: number;
  };

  conversations: {
    active: number;
  };
}

export interface TicketsByDepartment {
  departmentId: string;
  departmentName: string;
  totalTickets: number;
}

export interface TicketsByPriority {
  priority:
    | 'LOW'
    | 'MEDIUM'
    | 'HIGH'
    | 'URGENT';

  total: number;
}

export interface TicketTrend {
  date: string;
  count: number;
}

export interface RecentTicket {
  id: string;
  subject: string;
  status: string;
  priority: string;
  createdAt: string;

  customer: {
    id: string;
    name: string;
  } | null;

  department: {
    id: string;
    name: string;
  } | null;

  assignedAgent: {
    id: string;
    name: string;
  } | null;
}

export interface AgentPerformance {
  agentId: string;
  name: string;
  email: string;
  isOnline: boolean;

  totalTickets: number;
  activeTickets: number;
  resolvedTickets: number;
  totalConversations: number;
}

/* =========================
   API
========================= */

export async function getDashboardOverview(): Promise<DashboardOverview> {
  const response = await api.get('/dashboard/overview');
  return unwrapData<DashboardOverview>(response.data);
}

export async function getTicketsByDepartment(): Promise<TicketsByDepartment[]> {
  const response = await api.get('/dashboard/tickets-by-department');
  const data = unwrapData<TicketsByDepartment[]>(response.data);
  return Array.isArray(data) ? data : [];
}

export async function getTicketsByPriority(): Promise<TicketsByPriority[]> {
  const response = await api.get('/dashboard/tickets-by-priority');
  const data = unwrapData<TicketsByPriority[]>(response.data);
  return Array.isArray(data) ? data : [];
}

export async function getTicketsByDay(): Promise<TicketTrend[]> {
  const response = await api.get('/dashboard/tickets-by-day');
  const data = unwrapData<TicketTrend[]>(response.data);
  return Array.isArray(data) ? data : [];
}

export async function getRecentTickets(): Promise<RecentTicket[]> {
  const response = await api.get('/dashboard/recent-tickets');
  const data = unwrapData<RecentTicket[]>(response.data);
  return Array.isArray(data) ? data : [];
}

export async function getAgentPerformance(): Promise<AgentPerformance[]> {
  const response = await api.get('/dashboard/agent-performance');
  const data = unwrapData<AgentPerformance[]>(response.data);
  return Array.isArray(data) ? data : [];
}