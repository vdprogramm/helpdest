const { io } = require('socket.io-client');

const socket = io('http://localhost:3005/chat', {
    transports: ['websocket'],
    reconnection: false,
});

socket.on('connect', () => {
    console.log('Customer connected:', socket.id);

    socket.emit('customer:connect', {
        name: 'Nguyễn Văn Customer',
        email: 'customer@test.com',
        phone: '0901234567',
    });
});

socket.on('customer:ready', (data) => {
    console.log('customer:ready:', data);
});

socket.on('customer:connected', (data) => {
    console.log('customer:connected:', data);
});

socket.on('customer:error', (data) => {
    console.error('customer:error:', data);
});

socket.on('pong', (data) => {
    console.log('pong:', data);
});

socket.on('connect_error', (error) => {
    console.error('connect_error:', error.message);
});

socket.on('disconnect', (reason) => {
    console.log('Disconnected:', reason);
});