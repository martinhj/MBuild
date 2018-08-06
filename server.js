// Do I need following to catch rest of exceptions?
/* process.on('uncaughtException', function(err) {
    console.error((err && err.stack) ? err.stack : err);
}); */
// (https://stackoverflow.com/questions/32719923/redirecting-stdout-to-file-nodejs#answer-35542360)

const net = require("net")
const path = require("path")
const os = require("os")
const fs = require("fs")
const { Writable } = require('stream');
const { socketName } = require("./shared/socketName")
const monkeyConsole = require("./lib/monkeyConsole")

monkeyC = new monkeyConsole()

function Mbuild(buildCallback) {
    this.server = net.createServer(async socket => {
        // for debugging
        console.log("Mbuild: client connected...")
        // for debugging

        monkeyC.hijack()
        monkeyC.stdout.pipe(socket)

        console.log(`first server test`)
        console.log(`second server test (before release)`)
        console.log(`third server test (after release)`)

        await buildCallback()

        // Push `null` to stream to end the streams?
        console.log('ending soon')

        monkeyC.release()
        socket.end()

        socket.on("end", () => {
            console.log("Mbuild: client disconnected...")
        })
    })

    this.server.listen(socketName)

    this.server.on("error", e => {
        if (e.code === "EADDRINUSE") {
            const testServerSocket = new net.Socket()
            testServerSocket.on("error", e => {
                if (e.code == "ECONNREFUSED") {
                    fs.unlinkSync(socketName)
                    this.server.listen(socketName)
                }
            })
            testServerSocket.connect(
                { path: socketName },
                function() {
                    console.log("A server is running, shutting down...")
                    process.exit(100)
                }
            )
        }
    })


    // nodemon restart handling
    process.once("SIGUSR2", () => {
        this.server.close()
        process.kill(process.pid, "SIGUSR2")
    })
}

exports.Mbuild = Mbuild
