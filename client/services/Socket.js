export default class Socket {
    constructor(uid, origin, onOpen, onIdentify, onUsers) {
        if (!uid) {
            throw new Error('No uid provided.');
        }

        if (!origin) {
            throw new Error('No origin provided.');
        }

        this.subscribe = this.subscribe.bind(this);
        this.close = this.close.bind(this);
        this.getUrl = this.getUrl.bind(this);

        this.socketUrl = createSocketUrl(origin, uid);
        this.socket = new WebSocket(this.socketUrl);

        this.socket.onopen = () => {
            onOpen(this);
        };

        this.socket.onmessage = (event) => {
            const message = JSON.parse(event.data);
            if (message) {
                if (message.type === 'identify' && message.data) {
                    onIdentify(message.data);
                }
                if (message.type === 'users' && message.data) {
                    onUsers(message.data);
                }
            }
        };
    }

    subscribe(name) {
        this.socket.send(JSON.stringify({ type: 'subscribe', name: name }));
    }

    close() {
        this.socket.close();
    }

    getUrl() {
        return this.socketUrl.replace(/^wss/, 'https').replace(/^ws/, 'http')
    }
}

function createSocketUrl(origin, uid) {
    return origin.replace(/^https/, 'wss').replace(/^http/, 'ws') + '/' + uid;
}