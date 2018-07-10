const io = require("socket.io")()
const intercept = require("intercept-stdout")
const client_io = require("socket.io-client")
const { removeTrailingNewLine } = require("./lib/remove-trailing-new-line.js")
const messageQueue = []
const errorQueue = []

io.on("connection", socket => {
  const connectionMessageQueue = messageQueue.slice(0)
  while (connectionMessageQueue.length) {
    socket.emit(`stdout`, connectionMessageQueue.shift())
  }
  const connectionErrorQueue = errorQueue.slice(0)
  while (connectionErrorQueue.length) {
    socket.emit(`stdout`, connectionErrorQueue.shift())
  }
  socket.on("stdout", msg => {
    msg = removeTrailingNewLine(msg)
    messageQueue.push(msg)
    connectionMessageQueue.push(msg)
    socket.broadcast.emit(`stdout`, connectionMessageQueue.shift())
    // io.sockets.emit(`stdout`, msg)
  })
  socket.on("stderr", msg => {
    msg = removeTrailingNewLine(msg)
    errorQueue.push(msg)
    connectionErrorQueue.push(msg)
    socket.broadcast.emit(`stderr`, connectionErrorQueue.shift())
    // io.sockets.emit(`stderr`, msg)
  })
})

io.listen(3334)

const connectClient = () => {
  const client_socket = client_io.connect("http://localhost:3334")

  const unhook_intercept = intercept(
    txt => {
      client_socket.emit("stdout", txt)
      return txt
    },
    error_txt => {
      client_socket.emit("stderr", error_txt)
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
