import React from 'react';
import UserListItem from './UserListItem';

const UserList = ({ users, currentUserId }) => {
    const userItems = users.map(user => <UserListItem key={user.id} user={user} currentUserId={currentUserId} />);
    return (
        <ul>
            {userItems}
        </ul>
    );
}
export default UserList;