var config = require('../config');

var route_loader = function (app,router) {
    for (var i = 0; i < config.router_info.length; i++) {
        var curItem = config.router_info[i];
        var curmodule = require(curItem.file);
        router.route(curItem.path).post(curmodule[curItem.method]);
        router.route(curItem.path).get(curmodule[curItem.method]);

    }
    app.use(router);
}
module.exports = route_loader;