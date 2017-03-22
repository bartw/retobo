import React from 'react';
import UserList from './UserList';
import Socket from '../services/Socket';
import Start from './Start';

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
                this.setNewSocket(data.uid);
            })
            .catch(error => {
                console.log(error.message);
                this.setState({ socket: null, users: [] });
            })
    }

    changeName(e) {
        this.setState({ name: e.target.value });
    }

    setName() {
        this.state.socket.subscribe(this.state.name);
        this.setState({ name: '' });
    }

    closeSession() {
        this.state.socket.close();
        this.setState({ socket: null, users: [] });
    }

    setNewSocket(uid) {
        new Socket(
            uid,
            window.location.origin,
            (socket) => {
                this.setState({ socket: socket })
            },
            id => {
                this.setState({ currentUserId: id })
            },
            users => {
                this.setState({ users: users });
            });
    };

    componentDidMount() {
        if (window.location.pathname && window.location.pathname.length > 1) {
            const uid = window.location.pathname.replace('/', '');
            this.setNewSocket(uid);
        }
    }

    render() {
        return (
            <div>
                {!this.state.socket && <Start onCreateNewSession={this.createNewSession} />}
                {this.state.socket && (
                    <div>
                        <div>
                            <input type="text" value={this.state.socket.socketUrl.replace(/^wss/, 'https').replace(/^ws/, 'http')} readOnly />
                        </div>
                        {!this.state.currentUserId && (
                            <div>
                                <input type="text" value={this.state.name} onChange={this.changeName} />
                                <button onClick={this.setName}>Go</button>
                            </div>
                        )}
                        <UserList users={this.state.users} currentUserId={this.state.currentUserId} />
                        <button onClick={this.closeSession}>Close session</button>
                    </div>
                )}
            </div>
        );
    }
}