import dgram from 'dgram'

export default function(agent, teamName, version) {
  const socket = dgram.createSocket({ type: 'udp4', reuseAddr: true })
  agent.setSocket(socket)
  socket.on('message', (message, info) => {
    agent.messageGot(message)
  })
  socket.sendMsg = function(message) {
    socket.send(Buffer.from(message), 6000, 'localhost', (err, bytes) => {
      if (err) throw err
    })
  }
  socket.sendMsg(`(init ${teamName} (version ${version}))`)
}