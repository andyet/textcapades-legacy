var Config = require('getconfig');
exports[Config.getconfig.env === 'dev' ? 'development' : Config.getconfig.env] = Config.db;
