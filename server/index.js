const path = require('path');
const express = require('express');
const WebSocket = require('ws');

const app = express();

const sessions = [];

app.use(express.static(path.join(__dirname, '..', 'public')));

app.listen(3000, () => {
    console.log('listening on 3000');

    app.post('/api/session', (req, res) => {
        if (sessions.length === 5) {
            res.status(500).json({ error: 'Limit of 5 sessions reached.' });
            return;
        }
        const port = 8081 + sessions.length;
        const users = [];
        const socket = createSocket(port, users);
        sessions.push({
            port: port,
            users: users,
            socket: socket
        });
        console.log(port);
        res.status(200).json({ port: port });
    });

    app.get('*', (req, res) => {
        return res.sendFile(path.join(__dirname, '..', 'public/index.html'));
    });
});

function createSocket(port, users) {
    const socket = new WebSocket.Server({ port: port });

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
                users.push(jsonMessage.name);
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