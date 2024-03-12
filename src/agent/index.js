import readline from 'readline'

import AgentInitModule from './modules/AgentInitModule.js'
import AgentMoveModule from './modules/AgentMoveModule.js'
import AgentPositionModule from './modules/AgentPositionModule.js'
import CommandsAgent from './command-agent/CommandsAgent.js'
import AgentMissionModule from './modules/AgentMissionModule.js'
import AgentPlayerStatusModule from './modules/AgentPlayerStatusModule.js'

export default class Agent extends CommandsAgent {
  constructor() {
    super()
    this.moment = 0
    this.init = this.connectModule(AgentInitModule)
    this.move = this.connectModule(AgentMoveModule)
    this.positionModule = this.connectModule(AgentPositionModule)
    this.missionModule = this.connectModule(AgentMissionModule,
      {
        positionModule: this.positionModule,
        messageModule: this,
      }
    )
    this.playerStatus = this.connectModule(AgentPlayerStatusModule)
    this.action = null

    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
    this.rl.on('line', function (input) {
      if ("w" == input) {
        this.messageGot("(dash 80)")
      }
      if (input.startsWith("move")) {
        const x = parseInt(input.split(' ')[1]);
        const y = parseInt(input.split(' ')[2]);
        this.messageGot(`(move ${x} ${y})`)
      }
      if (input.startsWith("turn")) {
        const degrees = parseInt(input.split(' ')[1]);
        if (degrees) {
          this.messageGot(`(turn ${degrees})`)
          this.positionModule.player.moment += degrees
        }
        else {
          this.messageGot(`(turn ${30})`)
          this.positionModule.player.moment += 30
        }
      }
      if ("start" == input) {
        this.startMission()
      }
      if ("stop" == input) {
        this.missionModule.setMission(undefined)
      }
    }.bind(this));

    this.moveToStartPoint()
  }

  startMission() {
    let mission = [
      { act: "flag", fl: "gl" },
      { act: "flag", fl: "fc" },
      { act: "kick", fl: "gr", goal: "gr" }
    ]
    this.missionModule.setMission(mission)
  }

  moveToStartPoint() {
    this.rl.question('X: ', (firstNumber) => {
      this.rl.question('Y: ', (secondNumber) => {
        const x = parseFloat(firstNumber)
        const y = parseFloat(secondNumber)
        this.messageGot(`(move ${x} ${y})`)
      })
    });
  }
}
