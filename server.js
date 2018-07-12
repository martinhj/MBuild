const io = require("socket.io")()
const intercept = require("intercept-stdout")
const client_io = require("socket.io-client")
const { removeTrailingNewLine } = require("./lib/remove-trailing-new-line.js")
const messageQueue = []

const STDOUT = 'stdout'
const STDERR = 'stderr'
const STDMSG = 'stdmsg'

io.on("connection", socket => {
  const connectionMessageQueue = messageQueue.slice(0)
  const emitMessage = (message) => {
    socket.emit(STDMSG, connectionMessageQueue.shift())
  }
  // find the last end-of-message-stream-token
    // start at the position before the last and traverse queue backwards
    // @ the first found end-of-message-stream-token, find pos in array and
    // return array of elems from this pos to end
  while (connectionMessageQueue.length) { // while (not reached end-of-message-stream-token)
    connectionMessageQueue.length &&
      emitMessage(connectionMessageQueue.shift())
      // socket.emit(STDMSG, connectionMessageQueue.shift())
  }
})

io.of('/supplier-channel')
  .on('connection', socket => {
    socket.on(STDOUT, msg => {
      messageQueue.push({type: STDOUT, message: removeTrailingNewLine(msg)})
      // socket.broadcast.emit(STDMSG, {type: STDOUT, message: removeTrailingNewLine(msg)})
    })
    socket.on(STDERR, msg => {
      messageQueue.push({type: STDERR, message: removeTrailingNewLine(msg)})
    })

  })


io.listen(3334)

const connectClient = () => {
  const client_socket = client_io.connect("http://localhost:3334/supplier-channel")

  // TODO add possibility for middleware translating, filtering etc. output of
  // build application
  const unhook_intercept = intercept(
    txt => {
      client_socket.emit(STDOUT, txt)
      return txt
    },
    error_txt => {
      client_socket.emit(STDERR, error_txt)
      return error_txt
    }
  )

  client_socket.on("disconnect", () => {
    console.log("disconnecting...")
  })

  return new Promise((resolve, reject) => {
    client_socket.on("connect", () => {
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
