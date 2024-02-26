import dgram from 'dgram'

export default function(agent, teamName, version, port) {
  const socket = dgram.createSocket({ type: 'udp4', reuseAddr: true })
  agent.setSocket(socket)
  socket.on('message', (message, info) => {
    agent.messageGot(message)
  })
  socket.sendMessage = function(message) {
    socket.send(Buffer.from(message), port, 'localhost', (err, bytes) => {
      if (err) throw err
    })
  }
  socket.sendMessage(`(init ${teamName} (version ${version}))`)
}