import api from './axios';
import { unwrapData } from './api-response';

export type TicketStatus =
  | 'OPEN'
  | 'IN_PROGRESS'
  | 'WAITING'
  | 'RESOLVED'
  | 'CLOSED';

export type TicketPriority =
  | 'LOW'
  | 'MEDIUM'
  | 'HIGH'
  | 'URGENT';

export interface Ticket {
  id: string;
  subject: string;
  status: TicketStatus;
  priority: TicketPriority;

  customerId: string;
  departmentId: string;
  assignedAgentId: string | null;

  createdAt: string;
  updatedAt: string;
  closedAt: string | null;

  customer?: {
    id: string;
    name: string;
    email: string;
  };

  assignedAgent?: {
    id: string;
    name: string;
    email: string;
  } | null;

  department?: {
    id: string;
    name: string;
  };
}

export interface CreateTicketRequest {
  subject: string;
  customerId: string;
  departmentId: string;
  priority?: TicketPriority;
}

export interface UpdateTicketRequest {
  status?: TicketStatus;
  priority?: TicketPriority;
}

export async function getTickets(): Promise<Ticket[]> {
  const response =
    await api.get('/tickets');

  const data =
    unwrapData<Ticket[]>(
      response.data,
    );

  return Array.isArray(data)
    ? data
    : [];
}

export async function getTicketById(
  id: string,
): Promise<Ticket> {
  const response =
    await api.get(
      `/tickets/${id}`,
    );

  return unwrapData<Ticket>(
    response.data,
  );
}

export async function createTicket(
  data: CreateTicketRequest,
): Promise<Ticket> {
  const response =
    await api.post(
      '/tickets',
      data,
    );

  return unwrapData<Ticket>(
    response.data,
  );
}

export async function updateTicket(
  id: string,
  data: UpdateTicketRequest,
): Promise<Ticket> {
  const response =
    await api.patch(
      `/tickets/${id}`,
      data,
    );

  return unwrapData<Ticket>(
    response.data,
  );
}

export async function assignTicket(
  ticketId: string,
  agentId: string,
): Promise<Ticket> {
  const response =
    await api.patch(
      `/tickets/${ticketId}/assign/${agentId}`,
    );

  return unwrapData<Ticket>(
    response.data,
  );
}