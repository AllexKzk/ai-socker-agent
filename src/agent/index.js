import readline from 'readline'

import AgentInitModule from './modules/AgentInitModule.js'
import AgentMoveModule from './modules/AgentMoveModule.js'
import AgentPositionModule from './modules/AgentPositionModule.js'
import CommandsAgent from './command-agent/CommandsAgent.js'

export default class Agent extends CommandsAgent {
  constructor() {
    super()
    this.moment = 0
    this.init = this.connectModule(AgentInitModule)
    this.move = this.connectModule(AgentMoveModule)
    this.positionModule = this.connectModule(AgentPositionModule)

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
}