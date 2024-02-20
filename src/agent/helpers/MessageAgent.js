import SocketWorker from './SocketAgent.js'
import MessageWorker from './MessageWorker.js'

export default class MessageAgent extends SocketWorker {
  constructor() {
    super()
    this.messageWorker = new MessageWorker()
  }

  processMessage(message) {
    let data = this.messageWorker.parseMessage(message)
    if (!data)
      throw new Error('parse err')
    return this.analyze(data.message, data.command, data.p)
  }

  sendCommand(action) {
    if (action?.n && action?.v)
      this.socketSend(action.n, action.v)
  }

  messageGot(message) {
    let data = message.toString('utf8')
    this.sendCommand(
      this.processMessage(data)
    )
  }
}