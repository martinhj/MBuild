const { socketName } = require("./shared/socketName")
const net = require("net")

/*
const STDOUT = 'stdout'
const STDERR = 'stderr'
*/

const clientSocket = new net.Socket()

// something like this to translate to stdout / stderr:
// clientSocket.pipe(STREAM WRITE FUNCTIONALITY(split up stream to stdout and
// stderr))

clientSocket.connect({path: socketName}, function() { 
    console.log('>>> got connection...')
})

clientSocket.pipe(process.stdout)

clientSocket.on('finish', () => {
    console.log('>>> got finish...')
})

clientSocket.on('error', (e) => { // handle error trying to talk to server
    console.error(e)
    process.exit()
})

// clean up on nodemon restart
process.once("SIGUSR2", () => {
    clientSocket.close()
    process.kill(process.pid, "SIGUSR2")
})
