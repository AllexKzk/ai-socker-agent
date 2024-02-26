export default class SocketWorker {
  constructor() {
    this.socket = undefined
  }
  setSocket(socket) {
    this.socket = socket
  }
  
  socketSend(command, value) {
    console.log('send to socket: ', `${command} ${value}`) 
    this.socket.sendMessage(`(${command} ${value})`)
  }
}