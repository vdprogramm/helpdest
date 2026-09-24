import {
  getChatSocket,
} from './chat.socket';

export interface TransferConversationPayload {
  conversationId: string;
  targetAgentId: string;
}

export function transferConversation(
  data: TransferConversationPayload,
): void {
  const socket = getChatSocket();

  if (!socket.connected) {
    throw new Error(
      'Chat Server chưa được kết nối.',
    );
  }

  socket.emit(
    'conversation:transfer',
    data,
  );
}

export function markConversationAsRead(
  conversationId: string,
): void {
  const socket = getChatSocket();

  if (!socket.connected) {
    return;
  }

  socket.emit('message:read', {
    conversationId,
  });
}
