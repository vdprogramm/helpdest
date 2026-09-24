const { io } = require('socket.io-client');

const TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJlYjViOGFlNS0yM2U3LTQ5YzctYjc1Yy1lZTU2YmJlN2Q0MWYiLCJlbWFpbCI6ImFnZW50MkB0ZXN0LmNvbSIsInJvbGUiOiJBR0VOVCIsImlhdCI6MTc5MDE4OTAyMiwiZXhwIjoxNzkwMjc1NDIyfQ.pztUjTuSz780AnPfGlXiU2t-45vR8UhNGC8jnC0CVjg';

const socket = io('http://localhost:3005/chat', {
    transports: ['websocket'],

    auth: {
        token: TOKEN,
    },
});

socket.on('connect', () => {
    console.log('Connected:', socket.id);

    socket.emit('ping', {
        hello: 'world',
    });
});

socket.on('connection:success', (data) => {
    console.log(
        'connection:success:',
        data,
    );
});

socket.on('auth:error', (data) => {
    console.log(
        'auth:error:',
        data,
    );
});

socket.on('pong', (data) => {
    console.log(
        'pong:',
        data,
    );
});

socket.on('connect_error', (error) => {
    console.error(
        'connect_error:',
        error.message,
    );
});

socket.on('disconnect', (reason) => {
    console.log(
        'Disconnected:',
        reason,
    );
});