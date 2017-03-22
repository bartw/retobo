(function () {
    'use strict';

    const WebSocket = require('ws');
    const User = require('./User.js');
    const messageFactory = require('./messageFactory.js');

    const createSocket = (path, users) => {
        const socket = new WebSocket.Server({ noServer: true });

        socket.broadcast = (data) => {
            socket.clients.forEach((client) => {
                if (client.readyState === WebSocket.OPEN) {
                    client.send(data);
                }
            });
        };

        socket.on('connection', (ws) => {
            ws.on('message', (message) => {
                const jsonMessage = JSON.parse(message);
                if (jsonMessage && jsonMessage.type === 'subscribe' && jsonMessage.name) {
                    const user = new User(jsonMessage.name);
                    users.push(user);
                    ws.send(messageFactory.createMessage(messageFactory.types.identify, user.id));
                    socket.broadcast(messageFactory.createMessage(messageFactory.types.users, users));
                }
            });

            socket.broadcast(messageFactory.createMessage(messageFactory.types.users, users));
        });

        return socket;
    }

    module.exports = {
        createSocket: createSocket
    };
})();