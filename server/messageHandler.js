(function () {
    'use strict';

    const types = {
        subscribe: 'subscribe'
    };

    const handleMessage = (type, message, action) => {
        if (!types[type]) {
            throw new Error('Unknown message type.');
        }
        const object = JSON.parse(message);
        if (object && object.type === type && object.data) {
            action(object.data);
        }
    }

    module.exports = {
        types: types,
        handleMessage: handleMessage
    };
})();