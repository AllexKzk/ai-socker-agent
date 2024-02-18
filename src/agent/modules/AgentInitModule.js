export default class AgentInitModule {
  constructor() {
    /* сторона на поле */
    this.position = 'l'
    /* статус игры */
    this.run = false
    this.id = undefined

    this.commands = {
      init: this.initAgent,
      hear: () => this.setGameStatus(true)
    }
  }
  initAgent(p) {
    this.position = p[0]
    this.id = p[1]
  }
  setGameStatus(status) {
    this.run = status
  }
}