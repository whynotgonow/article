let Application = require('./application');
let Router = require('./router/index.js');

function createApplication() {
    return new Application();
}

createApplication.Router = Router;
module.exports = createApplication;
