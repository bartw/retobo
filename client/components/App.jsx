import React from 'react';
import Socket from '../services/Socket';
import Start from './Start';
import Session from './Session';

export default class App extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            socket: null,
            users: []
        };

        this.createNewSession = this.createNewSession.bind(this);
        this.closeSession = this.closeSession.bind(this);
        this.setNewSocket = this.setNewSocket.bind(this);
        this.setName = this.setName.bind(this);
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

    closeSession() {
        this.state.socket.close();
        this.setState({ socket: null, users: [] });
    }

    setName(name) {
        this.state.socket.subscribe(name);
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
                {this.state.socket && <Session currentUserId={this.state.currentUserId} onSetName={this.setName} onClose={this.closeSession} url={this.state.socket.getUrl()} users={this.state.users} />}
            </div>
        );
    }
}