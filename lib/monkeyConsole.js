const { Transform, PassThrough } = require('stream');

class MonkeyConsole {
    constructor() {
        this._originalProperties = {}
        this._newProperties = {}
        this._originalFunctions = {}
        this.newStream = new Transform({
            transform(chunk, encoding, callback) {
                this.push(chunk);
                callback()
            }
        })
    }
    _defineProperty(obj, prop, newProp) {
        const origPropDescriptor = Object.getOwnPropertyDescriptor(obj, prop)
        Object.defineProperty(obj, prop, {
            configurable: true,
            enumerable: origPropDescriptor.enumerable,
            writable: origPropDescriptor.writable || Boolean(origPropDescriptor.set),
            value: newProp
        })
        return origPropDescriptor
    }
    _generateConsole(stdout, stderr) {
        const Console = console.Console
        const newConsole = new Console(stdout, stderr)
        newConsole.console = Console
        return newConsole
    }
    restoreOriginalProperty(obj, prop) {
      Object.defineProperty(global, 'console', beforeEnter.console)
    }
    hijack() {
        console.log(`hijacking`)
        this._originalFunctions['stdout'] = process.stdout
        this._originalProperties['stdout'] = this._defineProperty(process, 'stdout', new PassThrough())
        this._newProperties['stdout'] = Object.getOwnPropertyDescriptor(process, 'stdout')
        this._originalFunctions['stderr'] = process.stderr
        // this._originalProperties['stderr'] = this._defineProperty(process, 'stderr', this.newStream) // use PassThrough stream?
        // this._originalProperties['stderr'] = this._defineProperty(process, 'stderr', new stream.PassThrough())
        // this._newProperties['stderr'] = Object.getOwnPropertyDescriptor(process, 'stderr')
        this._originalFunctions['console'] = global.console
        this._originalProperties['console'] =
            this._defineProperty(
                global,
                'console',
                this._generateConsole(process.stdout, process.stderr)
            )
        // this._newProperties['console'] = Object.getOwnPropertyDescriptor(global, 'console')

        //process.stdout.pipe // Can I do this here, and If I do how to end it?
        // process.stdout.pipe(this.origStdout)
        console.log(`last hijack test`)
    }
    release() {
        console.log(`releasing...`)
        // console.log(this._originalProperties['console'])
        this._defineProperty(process, 'stdout', this._originalFunctions['stdout'])
        console.log(`releasing... test`)
        this._defineProperty(global, 'console', this._originalFunctions['console'])
        console.log(`released!`)
        // Do we need to push null to socket stream to mark end of it?
    }
    get stdout() {
        return this._newProperties['stdout'].value
    }
    get stderr() {
        return this._newProperties['stderr'].value
    }
    get origStdout() {
        return this._originalFunctions['stdout']
    }
    get origStderr() {
        return this._originalFunctions['stderr']
    }
}
module.exports = MonkeyConsole