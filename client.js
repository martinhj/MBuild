const io = require('socket.io-client')

const socket = io.connect('http://localhost:3334')

socket.on('connect', () => {
    console.log('connecting')
});
socket.on('stdout', (message) => {
    console.log(message)
})
socket.on('stderr', (message) => {
    console.error(message)
})
socket.on('disconnect', () => {
    console.log('disconnecting...')
})
