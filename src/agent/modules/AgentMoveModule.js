import Command from "../command-agent/Command.js"

export default class AgentMoveModule {
  constructor() {
    this.commands = {
      move: Command(this.moveToPoint),
      turn: Command(this.turnOnMoment),
      dash: Command(this.dash),
      kick: Command(this.kick),
    }
  }
  
  kick(power){
    return { command: 'kick', value: `${power}` }  
  }

  dash(power){
    return { command: 'dash', value: `${power}` }  
  }

  turnOnMoment(moment) {
    return { command: 'turn', value: `${moment}` }
  }

  moveToPoint(point) {
    return { command: 'move', value: `${point[0]} ${point[1]}`}
  }
}