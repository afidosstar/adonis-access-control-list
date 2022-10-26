const { iocTransformer } = require("@adonisjs/ioc-transformer");

module.exports = function () {
  return iocTransformer(require("typescript/lib/typescript"), { aliases: {} });
};
