const web4 = require('web4-near')

module.exports = function (app) {
    // Proxy to web4 gateway when the path starts with /web4
    const web4Callback = web4.callback();
    app.use((req, res, next) => {
        if (req.url.startsWith('/web4')) {
            web4Callback(req, res, next);
            return;
        }

        next();
    });
}
