const http = require('http');

const server = http.createServer();
// eslint-disable-next-line import/no-extraneous-dependencies
const socketIo = require('socket.io');

server.listen(3088);
const io = socketIo();
io.attach(server);
io.on('connection', socket => {
    const { token } = socket.handshake.query;
    console.log(`Socket connected: ${socket.id}`, token);
    socket.emit('connect', { type: 'connect', state: 'success' });

    socket.on('action', action => {
        console.log('data: ', action);
        if (action.type === 'message') {
            socket.emit('action', { type: 'message', msgType: 'user', content: `${action.content} back-end` });
        }
    });
});
