import Command from "../command-agent/Command.js"

export default class AgentMoveModule {
  constructor() {
    this.commands = {
      move: Command(this.moveToPoint),
      turn: Command(this.turnOnMoment)
    }
  }

  turnOnMoment(moment) {
    return { command: 'turn', value: `${moment.pop()}` }
  }

  moveToPoint(point) {
    return { command: 'move', value: `${point[0]} ${point[1]}`}
  }
}