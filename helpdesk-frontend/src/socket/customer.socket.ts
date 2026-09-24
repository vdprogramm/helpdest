import { io, type Socket } from 'socket.io-client';

let customerSocket: Socket | null = null;

export function getCustomerSocket() {
  if (!customerSocket) {
    customerSocket = io(
      `${import.meta.env.VITE_API_URL}/chat`,
      {
        autoConnect: false,
        transports: ['websocket', 'polling'],
        reconnection: true,
      },
    );
  }

  return customerSocket;
}

export function connectCustomerSocket() {
  const socket = getCustomerSocket();

  if (!socket.connected) {
    socket.connect();
  }

  return socket;
}

export function destroyCustomerSocket() {
  if (!customerSocket) return;

  customerSocket.removeAllListeners();
  customerSocket.disconnect();
  customerSocket = null;
}
