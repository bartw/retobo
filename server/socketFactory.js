(function () {
    'use strict';

    const WebSocket = require('ws');
    const User = require('./User.js');
    const messageFactory = require('./messageFactory.js');
    const messageHandler = require('./messageHandler.js');

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
                messageHandler.handleMessage(
                    messageHandler.types.subscribe,
                    message,
                    (data) => {
                        const user = new User(data);
                        users.push(user);
                        ws.send(messageFactory.createMessage(messageFactory.types.identify, user.id));
                        socket.broadcast(messageFactory.createMessage(messageFactory.types.users, users));
                    });
            });

            socket.broadcast(messageFactory.createMessage(messageFactory.types.users, users));
        });

        return socket;
    }

    module.exports = {
        createSocket: createSocket
    };
})();