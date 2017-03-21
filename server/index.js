const path = require('path');
const url = require('url');
const express = require('express');
const WebSocket = require('ws');

const PORT = process.env.PORT || 8080
const app = express();

const sessions = [];

app.use(express.static(path.join(__dirname, '..', 'public')));

app.post('/api/session', (req, res) => {
    if (sessions.length === 5) {
        res.status(500).json({ error: 'Limit of 5 sessions reached.' });
        return;
    }
    const port = 8081 + sessions.length;
    const users = [];
    const hostname = url.parse(req.headers.origin).hostname;
    const socket = createSocket(hostname, port, users);
    sessions.push({
        port: port,
        users: users,
        socket: socket
    });
    res.status(200).json({ port: port });
});

app.get('*', (req, res) => {
    return res.sendFile(path.join(__dirname, '..', 'public/index.html'));
});

app.listen(PORT, () => {
    console.log('listening on ' + PORT);
});

function createSocket(hostname, port, users) {
    const socket = new WebSocket.Server({ host: hostname, port: port });

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