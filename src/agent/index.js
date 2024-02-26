import readline from 'readline'

import AgentInitModule from './modules/AgentInitModule.js'
import MessageAgent from './helpers/MessageAgent.js'
import AgentMoveModule from './modules/AgentMoveModule.js'
import AgentPositionModule from './modules/AgentPositionModule.js'

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
    this.positionModule = connect(AgentPositionModule)
    this.action = null

    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
    this.rl.on('line', function(input) {
      if ("w" == input) {
        this.messageGot(`(move 
          ${this.positionModule.player.getPosition().x + 1} ${this.positionModule.player.getPosition().y})`
        )
        this.positionModule.player.position.x += 1
      }
      if ("turn" == input) {
        this.messageGot(`(turn ${30})`)
      }
      if("start" == input) {
        this.startTurn()
      }
    }.bind(this));
    
    this.moveToStartPoint()
  }

  moveToStartPoint() {
    this.rl.question('X: ', (firstNumber) => {
      this.rl.question('Y: ', (secondNumber) => {
        this.rl.question('MOMENT: ', (moment) => {
          const x = parseFloat(firstNumber)
          const y = parseFloat(secondNumber)
          this.messageGot(`(move ${x} ${y})`)
          this.messageGot(`(turn ${moment})`)
          this.moment = moment
          this.positionModule.calculateNeeded = true;
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