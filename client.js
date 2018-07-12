const STDOUT = 'stdout'
const STDERR = 'stderr'
const STDMSG = 'stdmsg'

const io = require('socket.io-client')

const socket = io.connect('http://localhost:3334')

socket.on('connect', () => {
    console.log('connecting')
})
socket.on(STDOUT, (message) => {
    console.log(message)
})
socket.on(STDERR, (message) => {
    console.error(message)
})
socket.on(STDMSG, (messagePacket) => {
    switch (messagePacket.type) {
        case STDOUT:
            console.log(messagePacket.message)
            break;
        case STDERR:
            console.error(messagePacket.message)
            break;
    }
})
socket.on('endOfStream', () => {
    socket.close()
})
socket.on('disconnect', () => {
    console.log('disconnecting...')
})
