import AgentInitModule from './modules/AgentInitModule.js'
import MessageAgent from './helpers/MessageAgent.js'
import readline from 'readline'

export default class Agent extends MessageAgent {
  constructor() {
    super()
    this.commands = {}
    const connect = (Module) => {
      const module = new Module()
      Object.assign(this.commands, module.commands)
      return module
    }
    this.init = connect(AgentInitModule)
    console.log(this.commands)
    this.action = null
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    })
  }

  analyze(message, command, p) {
    if (this.commands?.[command]) {
      console.log(message, command)
      this.commands[command](p)
    }
  }
}