import readline from 'readline'

import AgentInitModule from './modules/AgentInitModule.js'
import MessageAgent from './helpers/MessageAgent.js'
import AgentMoveModule from './modules/AgentMoveModule.js'

export default class Agent extends MessageAgent {
  constructor() {
    super()
    this.commands = {
      'play_on': this.startTurn
    }
    this.moment = 0
    const connect = (Module) => {
      const module = new Module()
      Object.assign(this.commands, module.commands)
      return module
    }
    this.init = connect(AgentInitModule)
    this.move = connect(AgentMoveModule)
    this.action = null

    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
    this.moveToStartPoint()
  }

  moveToStartPoint() {
    this.rl.question('X: ', (firstNumber) => {
      this.rl.question('Y: ', (secondNumber) => {
        this.rl.question('MOMENT: ', (moment) => {
          const x = parseFloat(firstNumber)
          const y = parseFloat(secondNumber)
          this.messageGot(`(move ${x} ${y})`)
          this.moment = moment
          this.rl.close()
        })
      });
    });
  }

  startTurn() {
    console.log('play on')
    this.messageGot(`(turn ${this.moment})`)
  }

  analyze(message, command, p) {
    if (this.commands?.[command]) {
      return this.commands[command](p)
    }
  }
}