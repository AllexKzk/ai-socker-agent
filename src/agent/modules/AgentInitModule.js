import Command from "../command-agent/Command.js"

export default class AgentInitModule {
  constructor() {
    /* сторона на поле */
    this.position = 'l'
    /* статус игры */
    this.run = false
    this.id = undefined

    this.commands = {
      init: Command(this.initAgent),
      hear: Command(() => this.setGameStatus(true))
    }
  }
  initAgent(params) {
    this.position = params[0]
    this.id = params[1]
  }
  setGameStatus(status) {
    this.run = status
  }
}