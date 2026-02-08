const { iocTransformer } = require("@adonisjs/ioc-transformer");

console.log("IoC Transformer loaded");

module.exports = function () {
  return iocTransformer(require("typescript/lib/typescript"), { aliases: {} });
};
