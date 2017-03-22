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

        this.socketUrl = createSocketUrl(origin, uid);
        this.socket = new WebSocket(this.socketUrl);

        this.socket.onopen = () => {
            onOpen(this);
        };

        this.socket.onmessage = (event) => {
            const data = JSON.parse(event.data);
            if (data) {
                if (data.type === 'identify' && data.id) {
                    onIdentify(data.id);
                }
                if (data.type === 'users' && data.users) {
                    onUsers(data.users);
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
}

function createSocketUrl(origin, uid) {
    return origin.replace(/^https/, 'wss').replace(/^http/, 'ws') + '/' + uid;
}