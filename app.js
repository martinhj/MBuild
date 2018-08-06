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

    await sleep(() => {
        console.log(`trying to emit something else later`)
        console.error(`trying to emit an error later`)
    })
}

function timeout(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
}
async function sleep(fn, ...args) {
    await timeout(2000)
    return fn(...args)
}
