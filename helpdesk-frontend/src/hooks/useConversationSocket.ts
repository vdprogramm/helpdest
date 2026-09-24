import {
  useEffect,
  useState,
} from 'react';

import type {
  Message,
} from '../api/messages.api';

import type {
  Conversation,
} from '../api/conversations.api';

import {
  connectChatSocket,
} from '../socket/chat.socket';

import {
  markConversationAsRead,
} from '../socket/conversation.socket';

interface ConversationAssignedEvent {
  conversationId: string;
  ticketId: string;

  conversation?: Conversation;

  agent?: {
    id: string;
    name: string;
    email: string;
  };
}

interface MessageNewEvent {
  message: Message;
}

interface TicketStatusEvent {
  conversationId: string;

  status:
    | 'OPEN'
    | 'IN_PROGRESS'
    | 'WAITING'
    | 'RESOLVED'
    | 'CLOSED';
}

interface ConversationClosedEvent {
  conversationId: string;
  conversation: Conversation;
}

interface ConversationTransferredEvent {
  conversationId: string;
  conversation: Conversation;
  fromAgentId: string;
  toAgentId: string;
}

interface AgentStatusEvent {
  agentId: string;
  status:
    | 'ONLINE'
    | 'OFFLINE';
}

interface SocketErrorEvent {
  message?: string;
}

interface MessageReadEvent {
  conversationId: string;
  readerId?: string;
  readerType?: string;
}

interface UseConversationSocketOptions {
  selectedConversationId:
    string | null;

  onMessage?: (
    message: Message,
  ) => void;

  onConversationAssigned?: (
    data: ConversationAssignedEvent,
  ) => void;

  onConversationClosed?: (
    data: ConversationClosedEvent,
  ) => void;

  onConversationTransferred?: (
    data: ConversationTransferredEvent,
  ) => void;

  onTicketStatus?: (
    data: TicketStatusEvent,
  ) => void;

  onAgentStatus?: (
    data: AgentStatusEvent,
  ) => void;

  onMessageRead?: (
    data: MessageReadEvent,
  ) => void;
}

export default function useConversationSocket({
  selectedConversationId,
  onMessage,
  onConversationAssigned,
  onConversationClosed,
  onConversationTransferred,
  onTicketStatus,
  onAgentStatus,
  onMessageRead,
}: UseConversationSocketOptions) {
  const [connected, setConnected] =
    useState(false);

  const [socketError, setSocketError] =
    useState('');

  useEffect(() => {
    const socket =
      connectChatSocket();

    const handleConnect = () => {
      setConnected(true);
      setSocketError('');
    };

    const handleDisconnect = () => {
      setConnected(false);
    };

    const handleConnectionSuccess =
      () => {
        setConnected(true);
        setSocketError('');
      };

    const handleAuthError = (
      data: SocketErrorEvent,
    ) => {
      setSocketError(
        data?.message ??
          'Socket authentication failed.',
      );

      setConnected(false);
    };

    const handleMessageError = (
      data: SocketErrorEvent,
    ) => {
      setSocketError(
        data?.message ??
          'Không thể xử lý tin nhắn.',
      );
    };

    const handleConversationError = (
      data: SocketErrorEvent,
    ) => {
      setSocketError(
        data?.message ??
          'Conversation xảy ra lỗi.',
      );
    };

    const handleMessageNew = (
      data: MessageNewEvent,
    ) => {
      if (!data?.message) {
        return;
      }

      onMessage?.(
        data.message,
      );
    };

    const handleAssigned = (
      data: ConversationAssignedEvent,
    ) => {
      onConversationAssigned?.(
        data,
      );
    };

    const handleClosed = (
      data: ConversationClosedEvent,
    ) => {
      onConversationClosed?.(
        data,
      );
    };

    const handleTransferred = (
      data: ConversationTransferredEvent,
    ) => {
      onConversationTransferred?.(
        data,
      );
    };

    const handleTicketStatus = (
      data: TicketStatusEvent,
    ) => {
      onTicketStatus?.(data);
    };

    const handleAgentStatus = (
      data: AgentStatusEvent,
    ) => {
      onAgentStatus?.(data);
    };

    const handleMessageRead = (
      data: MessageReadEvent,
    ) => {
      onMessageRead?.(data);
    };

    socket.on(
      'connect',
      handleConnect,
    );

    socket.on(
      'disconnect',
      handleDisconnect,
    );

    socket.on(
      'connection:success',
      handleConnectionSuccess,
    );

    socket.on(
      'auth:error',
      handleAuthError,
    );

    socket.on(
      'message:error',
      handleMessageError,
    );

    socket.on(
      'conversation:error',
      handleConversationError,
    );

    socket.on(
      'message:new',
      handleMessageNew,
    );

    socket.on(
      'conversation:assigned',
      handleAssigned,
    );

    socket.on(
      'conversation:closed',
      handleClosed,
    );

    socket.on(
      'conversation:transferred',
      handleTransferred,
    );

    socket.on(
      'ticket:status',
      handleTicketStatus,
    );

    socket.on(
      'agent:status',
      handleAgentStatus,
    );

    socket.on(
      'message:read:update',
      handleMessageRead,
    );

    return () => {
      socket.off(
        'connect',
        handleConnect,
      );

      socket.off(
        'disconnect',
        handleDisconnect,
      );

      socket.off(
        'connection:success',
        handleConnectionSuccess,
      );

      socket.off(
        'auth:error',
        handleAuthError,
      );

      socket.off(
        'message:error',
        handleMessageError,
      );

      socket.off(
        'conversation:error',
        handleConversationError,
      );

      socket.off(
        'message:new',
        handleMessageNew,
      );

      socket.off(
        'conversation:assigned',
        handleAssigned,
      );

      socket.off(
        'conversation:closed',
        handleClosed,
      );

      socket.off(
        'conversation:transferred',
        handleTransferred,
      );

      socket.off(
        'ticket:status',
        handleTicketStatus,
      );

      socket.off(
        'agent:status',
        handleAgentStatus,
      );

      socket.off(
        'message:read:update',
        handleMessageRead,
      );
    };
  }, [
    onMessage,
    onConversationAssigned,
    onConversationClosed,
    onConversationTransferred,
    onTicketStatus,
    onAgentStatus,
    onMessageRead,
  ]);

  useEffect(() => {
    if (
      !connected ||
      !selectedConversationId
    ) {
      return;
    }

    /*
     * Khi Agent mở conversation:
     * báo backend đánh dấu message đã đọc.
     */
    markConversationAsRead(
      selectedConversationId,
    );
  }, [
    connected,
    selectedConversationId,
  ]);

  return {
    connected,
    socketError,
  };
}
