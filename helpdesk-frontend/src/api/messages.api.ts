import api from './axios';
import { unwrapData } from './api-response';

export type MessageType =
  | 'TEXT'
  | 'IMAGE'
  | 'FILE'
  | 'SYSTEM';

export type SenderType =
  | 'CUSTOMER'
  | 'AGENT'
  | 'SYSTEM';

export interface Message {
  id: string;
  conversationId: string;
  senderId: string | null;
  senderType: SenderType;
  content: string;
  messageType: MessageType;
  isRead?: boolean;
  createdAt: string;
}

export interface SendMessageRequest {
  content: string;
  messageType?: MessageType;
}

interface MessagesResponse {
  total: number;
  messages: Message[];
}

export async function getMessages(
  conversationId: string,
): Promise<Message[]> {
  const response =
    await api.get(
      `/conversations/${conversationId}/messages`,
    );

  /*
   * Backend hiện trả:
   *
   * {
   *   total: 2,
   *   messages: [...]
   * }
   */
  const data =
    unwrapData<MessagesResponse>(
      response.data,
    );

  if (
    data &&
    Array.isArray(data.messages)
  ) {
    return data.messages;
  }

  return [];
}

export async function sendMessage(
  conversationId: string,
  data: SendMessageRequest,
): Promise<Message> {
  const response =
    await api.post(
      `/conversations/${conversationId}/messages`,
      {
        content: data.content,
        messageType:
          data.messageType ?? 'TEXT',
      },
    );

  return unwrapData<Message>(
    response.data,
  );
}