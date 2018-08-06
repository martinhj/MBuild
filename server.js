// Do I need following to catch rest of exceptions?
/* process.on('uncaughtException', function(err) {
    console.error((err && err.stack) ? err.stack : err);
}); */
// (https://stackoverflow.com/questions/32719923/redirecting-stdout-to-file-nodejs#answer-35542360)

// const stdOutSocketName = require("./shared/socketName")
// const errOutSocketName = require("./shared/socketName")
const { outStream } = require("./outputReflector.js")
const { socketName } = require("./shared/socketName")

const { Writable } = require('stream');

const monkeyConsole = require("./lib/monkeyConsole")

const net = require("net")
const path = require("path")
const os = require("os")
const fs = require("fs")

const intercept = require("intercept-stdout")
const { removeTrailingNewLine } = require("./lib/remove-trailing-new-line.js")

const oldstdout = process.stdout

const STDOUT = "stdout"
const STDERR = "stderr"

monkeyC = new monkeyConsole()
function Mbuild(callback) {
    this.callback = callback
    this.server = net.createServer(async socket => {
        // for debugging
        console.log("Mbuild: client connected...")
        // for debugging
        socket.on("end", () => {
            console.log("Mbuild: client disconnected...")
        })

        // const unhookIntercept = this.intercept(writeMessage)

        // inspired by https://gist.github.com/benbuckman/2758563
        // and https://github.com/sfarthin/intercept-stdout#readme

        // const oldStdoutWrite = process.stdout.write
        // const oldStderrWrite = process.stderr.write

        /* process.stdout.write = (function(write) {
            return function(chunk, encoding, fd) {
                const args = Array.from(arguments)
                socket.write(chunk)
                write.apply(process.stdout, args);
            };
        }(process.stdout.write)) */

        /* process.stderr.write = (write => {
            return (chunk, encoding, fd) => {
                const args = Array.from(arguments)
                socket.write(chunk)
                write.apply(process.stderr, args)
            }
        })(process.stderr.write) */

        monkeyC.hijack()
        monkeyC.stdout.pipe(socket)

        console.log(`first server test`)
        console.log(`second server test (before release)`)
        console.log(`third server test (after release)`)

        await callback()

        // Push `null` to stream to end the streams?
        console.log('ending soon')
        // process.stdout.write = oldStdoutWrite
        // process.stderr.write = oldStderrWrite

        monkeyC.release()
        socket.end()

    })

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

    this.server.on('listening', (m) => {
        // console.info('Mbuild server listetning on what:', socketName)
    })

    this.server.listen(socketName)

    process.once("SIGUSR2", () => {
      this.server.close()
      process.kill(process.pid, "SIGUSR2")
    })
}

exports.Mbuild = Mbuild
