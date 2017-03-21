const path = require('path');
const url = require('url');
const express = require('express');
const http = require('http');
const WebSocket = require('ws');

const PORT = process.env.PORT || 8080
const app = express();
const server = http.createServer(app);

const sessions = [];

app.use(express.static(path.join(__dirname, '..', 'public')));

app.post('/api/session', (req, res) => {
    if (sessions.length === 5) {
        res.status(500).json({ error: 'Limit of 5 sessions reached.' });
        return;
    }
    const uid = createUid();
    const users = [];
    const socket = createSocket(uid, users);
    sessions.push({
        uid: uid,
        users: users,
        socket: socket
    });
    res.status(200).json({ uid: uid });
});

app.get('*', (req, res) => {
    return res.sendFile(path.join(__dirname, '..', 'public/index.html'));
});

server.listen(PORT, () => {
    console.log('listening on ' + PORT);
});

server.on('upgrade', (request, socket, head) => {
    const pathname = url.parse(request.url).pathname;
    const session = sessions.find(session => '/' + session.uid === pathname);

    if (!session) {
        socket.destroy();
        return;
    }

    session.socket.handleUpgrade(request, socket, head, (ws) => {
        session.socket.emit('connection', ws);
    });
});

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
                    id: createUid(),
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

function createUid() {
    return 'xxxx4xxxyxxx'.replace(/[xy]/g, function (c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}