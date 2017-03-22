(function () {
    'use strict';

    const generateUid = require('./uidGenerator.js');

    function User(name) {
        this.id = generateUid();
        this.name = name;
    }

    module.exports = User;
})();