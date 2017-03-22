(function () {
    'use strict';

    const generateUid = require('./uidGenerator.js');
    const socketFactory = require('./SocketFactory.js');

    function Session() {
        const uid = generateUid();
        const users = [];
        const webSocket = socketFactory.createSocket(uid, users);
        
        this.getUid = () => uid;
        this.getPathName = () => '/' + uid;
        this.handleUpgrade = (request, socket, head) => {
            webSocket.handleUpgrade(request, socket, head, (ws) => {
                webSocket.emit('connection', ws);
            });
        }
    }

    module.exports = Session;

    function createSocket(path, users) {
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
                    const user = {
                        id: generateUid(),
                        name: jsonMessage.name
                    };
                    users.push(user);

                    ws.send(JSON.stringify({ type: 'identify', id: user.id }));

                    socket.broadcast(JSON.stringify({
                        type: 'users',
                        users: users
                    }));
                }
            });

            socket.broadcast(JSON.stringify({
                type: 'users',
                users: users
            }));
        });

        return socket;
    }
})();