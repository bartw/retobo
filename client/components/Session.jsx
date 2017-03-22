import React from 'react';
import UserList from './UserList';

export default class Session extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            name: ''
        };

        this.changeName = this.changeName.bind(this);
        this.setName = this.setName.bind(this);
    }

    changeName(e) {
        this.setState({ name: e.target.value });
    }

    setName() {
        this.props.onSetName(this.state.name);
        this.setState({ name: '' });
    }

    render() {
        return (
            <div>
                <div>
                    <input type="text" value={this.props.url} readOnly />
                </div>
                {!this.props.currentUserId && (
                    <div>
                        <input type="text" value={this.state.name} onChange={this.changeName} />
                        <button onClick={this.setName}>Go</button>
                    </div>
                )}
                <UserList users={this.props.users} currentUserId={this.props.currentUserId} />
                <button onClick={this.props.onClose}>Close session</button>
            </div>
        );
    }
}