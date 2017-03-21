import React from 'react';

export default class App extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            socket: null,
            name: '',
            users: []
        };

        this.createNewSession = this.createNewSession.bind(this);
        this.changeName = this.changeName.bind(this);
        this.setName = this.setName.bind(this);
        this.closeSession = this.closeSession.bind(this);
        this.createSocketUrl = this.createSocketUrl.bind(this);
        this.setNewSocket = this.setNewSocket.bind(this);
    }

    createNewSession() {
        fetch('/api/session', { method: 'POST' })
            .then(response => {
                if (response.ok) {
                    return response.text();
                }
                throw new Error('Network response was not ok.');
            })
            .then(responseText => {
                const data = JSON.parse(responseText);
                const socketUrl = this.createSocketUrl(data.port);
                this.setNewSocket(socketUrl);
            })
            .catch(error => {
                console.log(error.message);
                this.setState({ socketUrl: null, socket: null, users: [] });
            })
    }

    changeName(e) {
        this.setState({ name: e.target.value });
    }

    setName() {
        this.state.socket.send(JSON.stringify({ type: 'subscribe', name: this.state.name }));
        this.setState({ name: '' });
    }

    closeSession() {
        this.state.socket.close();
        this.setState({ socketUrl: null, socket: null, users: [] });
    }

    createSocketUrl(port) {
        return location.origin.replace(/^https/, 'wss').replace(/^http/, 'ws') + '/' + port;
    }

    setNewSocket(socketUrl) {
        const socket = new WebSocket(socketUrl);
        socket.onopen = () => {
            this.setState({ socketUrl: socketUrl, socket: socket });
        };
        socket.onmessage = (event) => {
            const data = JSON.parse(event.data);
            if (data && data.type === 'users' && data.users) {
                this.setState({ users: data.users });
            }
        };
        return socket;
    };

    componentDidMount() {
        if (window.location.pathname && window.location.pathname.length > 1) {
            const port = window.location.pathname.replace('/', '');
            const socketUrl = this.createSocketUrl(port);
            this.setNewSocket(socketUrl);
        }
    }

    render() {
        const users = this.state.users.map(user => <li key={user}>{user}</li>);
        return (
            <div>
                {!this.state.socket && <button onClick={this.createNewSession}>Create new session</button>}
                {this.state.socket && (
                    <div>
                        <input type="text" value={this.state.socketUrl} readOnly />
                        <input type="text" value={this.state.name} onChange={this.changeName} />
                        <button onClick={this.setName}>Go</button>
                        <ul>
                            {users}
                        </ul>
                        <button onClick={this.closeSession}>Close session</button>
                    </div>
                )}
            </div>
        );
    }
}