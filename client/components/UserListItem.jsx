import React from 'react';

const UserListItem = ({ user, currentUserId }) => {
    return <li>{user.name} {user.id == currentUserId && <span>this is me!</span>}</li>;
}
export default UserListItem;