(function () {
    const generateUid = () => 'xxxx4xxxyxxx'.replace(/[xy]/g, (c) => {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
    module.exports = generateUid;
})();