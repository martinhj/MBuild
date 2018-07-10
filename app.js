const chalk = require('chalk')
const connection = require('./server')

const socket = async () => {
    await connection.connectClient()

    console.log('I got connection')

    console.log(chalk.blue('stuff happening...'))
    console.log('more stuff happening...')

    console.error(chalk.red('error happening...'))

    console.log('and then some stuff...')

    setTimeout(() => {
        console.log(`trying to emit something else later`)
        console.error(`trying to emit an error later`)
        // client_socket.emit('stdout', 'trying to emit something else later')
    }, 3000)
}
socket()