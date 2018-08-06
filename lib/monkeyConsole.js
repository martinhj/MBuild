// inspired by https://github.com/kevinoid/stdio-context/
const { Transform, PassThrough } = require('stream');

const STDOUT = "stdout"
const STDERR = "stderr"
const CONSOLE = "console"

class MonkeyConsole {
    constructor() {
        this._originalProperties = {}
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
    hijack() {
        console.log(`hijacking...`)
        this._originalProperties[STDOUT] = this._defineProperty(process, STDOUT, new PassThrough())
        this._originalProperties[STDERR] = this._defineProperty(process, STDERR, new PassThrough())
        this._originalProperties[CONSOLE] =
            this._defineProperty(
                global,
                CONSOLE,
                this._generateConsole(this.stdout, this.stderr)
            )

        this.stdout.pipe(this.origStdout)
        this.stderr.pipe(this.origStderr)
        console.log(`last hijack test`)
    }
    release() {
        console.log(`releasing...`)
        this._defineProperty(process, STDOUT, this.origStdout)
        console.log(`releasing... test`)
        this._defineProperty(global, CONSOLE, this.origConsole)
        console.log(`released!`)
        // Do we need to push null to socket stream to mark end of it?
    }
    get stdout() {
        return Object.getOwnPropertyDescriptor(process, STDOUT).value
    }
    get stderr() {
        return Object.getOwnPropertyDescriptor(process, STDERR).value
    }
    get origStdout() {
        return this._originalProperties[STDOUT].get() || this._originalProperties[STDOUT].value
    }
    get origStderr() {
        return this._originalProperties[STDERR].get() || this._originalProperties[STDERR].value
    }
    get origConsole() {
        return this._originalProperties['console'].get() || this._originalProperties['console'].value
    }
}
module.exports = MonkeyConsole
