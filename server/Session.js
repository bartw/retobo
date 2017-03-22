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
})();