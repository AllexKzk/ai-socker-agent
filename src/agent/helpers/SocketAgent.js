export default class SocketWorker {
  constructor() {
    this.socket = undefined
  }
  setSocket(socket) {
    this.socket = socket
  }
  
  socketSend(command, value) {
    this.socket.sendMessage(`${command} ${value}`)
  }
}