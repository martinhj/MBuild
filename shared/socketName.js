const os = require("os")
const path = require("path")
const packageConfig = require('../package.json')

const socketName = path.join(
    os.tmpdir(),
    `${packageConfig.name}-${packageConfig.version}.socks`
)

exports.socketName = socketName
// exports.stdOutSocketName = require("./shared/socketName")
// const errOutSocketName = require("./shared/socketName")
