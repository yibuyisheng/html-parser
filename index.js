try {
    module.exports = require('./dist/parser');
} catch (e) {
    module.exports = require('./src/parser');
}
