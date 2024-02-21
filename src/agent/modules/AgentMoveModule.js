export default class AgentMoveModule {
  constructor() {
    this.commands = {
      move: this.moveToPoint,
      turn: this.turnOnMoment
    }
  }

  turnOnMoment(moment) {
    return { command: 'turn', value: `${moment.pop()}` }
  }

  moveToPoint(point) {
    return { command: 'move', value: `${point[0]} ${point[1]}`}
  }
}