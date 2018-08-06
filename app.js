const chalk = require('chalk')
const { Mbuild } = require('./server')

const mbuild = new Mbuild(async () => {
    console.log('I\'m the callback')
    await logging()
})

async function logging() {
    console.log(chalk.blue('stuff happening...'))
    console.log('more stuff happening...')

    console.error(chalk.red('error happening...'))

    console.log('and then some stuff...')

    await setTimeout(async () => {
        await console.log(`trying to emit something else later`)
        await console.error(`trying to emit an error later`)
    }, 3000)
}