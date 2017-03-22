(function () {
    'use strict';

    const path = require('path');
    const url = require('url');
    const express = require('express');
    const http = require('http');
    const Session = require('./Session.js');

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
        const session = new Session();
        sessions.push(session);
        res.status(200).json({ uid: session.getUid() });
    });

    app.get('*', (req, res) => {
        return res.sendFile(path.join(__dirname, '..', 'public/index.html'));
    });

    server.listen(PORT, () => {
        console.log('listening on ' + PORT);
    });

    server.on('upgrade', (request, socket, head) => {
        const pathname = url.parse(request.url).pathname;
        const session = sessions.find(session => session.getPathName() === pathname);

        if (!session) {
            socket.destroy();
            return;
        }

        session.handleUpgrade(request, socket, head);
    });
})();