import api from './axios';
import { unwrapData } from './api-response';

export type ConversationStatus =
  | 'ACTIVE'
  | 'CLOSED';

export interface Conversation {
  id: string;
  ticketId: string;
  agentId: string | null;
  status: ConversationStatus;
  startedAt: string;
  endedAt: string | null;

  agent?: {
    id: string;
    name: string;
    email: string;
  } | null;

  ticket?: {
    id: string;
    subject: string;
    status: string;

    customer?: {
      id: string;
      name: string;
      email: string;
    };
  };
}

export async function getConversations():
Promise<Conversation[]> {
  const response =
    await api.get('/conversations');

  const data =
    unwrapData<Conversation[]>(
      response.data,
    );

  return Array.isArray(data)
    ? data
    : [];
}

export async function getConversationById(
  id: string,
): Promise<Conversation> {
  const response =
    await api.get(
      `/conversations/${id}`,
    );

  return unwrapData<Conversation>(
    response.data,
  );
}

export async function updateConversation(
  id: string,
  status: ConversationStatus,
): Promise<Conversation> {
  const response =
    await api.patch(
      `/conversations/${id}`,
      { status },
    );

  return unwrapData<Conversation>(
    response.data,
  );
}

export async function closeConversation(
  id: string,
): Promise<Conversation> {
  const response =
    await api.post(
      `/conversations/${id}/close`,
    );

  return unwrapData<Conversation>(
    response.data,
  );
}