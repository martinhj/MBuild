const io = require('socket.io')()
const intercept = require('intercept-stdout')
const client_io = require('socket.io-client')

const connectClient = () => {

    io.on('connection', (socket) => {
        socket.on('stdout', (msg) => {
            msg = removeTrailingNewLine(msg)
            io.sockets.emit(`stdout`, msg)
        })
        socket.on('stderr', (msg) => {
            msg = removeTrailingNewLine(msg)
            io.sockets.emit(`stderr`, msg)
        })
    })

    io.listen(3334)

    /* client_socket.on('disconnect', () => {
        // console.log('disconnecting...')
    }) */

    const client_socket = client_io.connect('http://localhost:3334')
    // console.log(`got here...`)

    const unhook_intercept = intercept((txt) => {
        // Gather data until connect?
        client_socket.emit('stdout', txt)
        return ''
        // return txt
    }, (error_txt) => {
        client_socket.emit('stderr', error_txt)
        return ''
        // return error_txt
    })

    // client_socket.emit('stdout', 'trying to emit something')

    return new Promise((resolve, reject) => {
        client_socket.on('connect', () => {
            // TODO: what do we do with reconnects? Collect output until
            // connection is reetablished (per socket that was connected
            // earlier) and rerelease the messages on reconnect?
            // How is this compatible to do a single-run to check if the last
            // build was ok?
            resolve(client_socket)
        })
    })
}

exports.connectClient = connectClient

const removeTrailingNewLine = (str) => {
    str = str.replace(/^\s+|\s+$/g, '');
    return str
}
