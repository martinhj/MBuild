const io = require("socket.io")()
const intercept = require("intercept-stdout")
const client_io = require("socket.io-client")
const { removeTrailingNewLine } = require("./lib/remove-trailing-new-line.js")

io.on("connection", socket => {
  socket.on("stdout", msg => {
    msg = removeTrailingNewLine(msg)
    io.sockets.emit(`stdout`, msg)
  })
  socket.on("stderr", msg => {
    msg = removeTrailingNewLine(msg)
    io.sockets.emit(`stderr`, msg)
  })
})

io.listen(3334)

const connectClient = () => {
  const client_socket = client_io.connect("http://localhost:3334")

  const unhook_intercept = intercept(
    txt => {
      client_socket.emit("stdout", txt)
      return ""
    },
    error_txt => {
      client_socket.emit("stderr", error_txt)
      return ""
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
