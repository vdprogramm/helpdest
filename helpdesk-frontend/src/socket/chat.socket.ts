import {
  io,
  type Socket,
} from 'socket.io-client';

let chatSocket: Socket | null =
  null;

export function getChatSocket(): Socket {
  if (chatSocket) {
    return chatSocket;
  }

  const apiUrl =
    import.meta.env.VITE_API_URL;

  chatSocket = io(
    `${apiUrl}/chat`,
    {
      autoConnect: false,

      transports: [
        'websocket',
        'polling',
      ],

      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
    },
  );

  return chatSocket;
}

export function connectChatSocket(): Socket {
  const socket =
    getChatSocket();

  const token =
    localStorage.getItem(
      'accessToken',
    );

  if (!token) {
    return socket;
  }

  /*
   * Quan trọng:
   * Backend đọc:
   * client.handshake.auth.token
   */
  socket.auth = {
    token,
  };

  if (!socket.connected) {
    socket.connect();
  }

  return socket;
}

export function disconnectChatSocket() {
  if (!chatSocket) {
    return;
  }

  chatSocket.disconnect();
}

export function destroyChatSocket() {
  if (!chatSocket) {
    return;
  }

  chatSocket.removeAllListeners();
  chatSocket.disconnect();

  chatSocket = null;
}
