(function () {
    'use strict';

    const types = {
        identify: 'identify',
        users: 'users'
    };

    const createMessage = (type, data) => {
        if (!types[type]) {
            throw new Error('Unknown message type.');
        }
        return JSON.stringify({type: types[type], data: data});
    }

    module.exports = {
        types: types,
        createMessage: createMessage
    };
})();