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
          ${this.positionModule.player.getPosition().x + Math.cos(this.positionModule.player.moment * Math.PI / 180)}
           ${this.positionModule.player.getPosition().y + Math.sin(this.positionModule.player.moment * Math.PI / 180)})`
        )
        this.positionModule.recalculatePlayerPosition()
      }
      if (input.startsWith("move")) {
        const x = parseInt(input.split(' ')[1]);
        const y = parseInt(input.split(' ')[2]);
        this.messageGot(`(move ${x} ${y})`)
        this.positionModule.recalculatePlayerPosition()
      }
      if (input.startsWith("turn")) {
        const degrees = parseInt(input.split(' ')[1]);
        if(degrees){
          this.messageGot(`(turn ${degrees})`)
          this.positionModule.player.moment = degrees
        }
        else{ 
          this.messageGot(`(turn ${30})`)
          this.positionModule.player.moment += 30
        }
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
          this.positionModule.recalculatePlayerPosition()
        })
      });
    });
  }
}