import MessageAgent from "../message-agent/MessageAgent.js";
import PriorityQueue from "../../helpers/priority-queue.js"


export default class CommandsAgent extends MessageAgent {
  constructor() {
    super()
    this.commands = new Map()
  }

  connectModule(Module, params) {
    const module = new Module(params)
    Object.entries(module.commands).forEach(([name, command]) => {
      if (this.commands.has(name)) {
        //push to commands PriorityQueue
        this.commands.get(name).push(command.callback, command.priority)
      } else {
        //create new PriorityQueue
        const commandsQueue = new PriorityQueue((fCommand, sCommand) => fCommand.priority > sCommand.priority)
        commandsQueue.push(command)
        this.commands.set(name, commandsQueue)
      }
    });
    return module
  }

  analyze(message, commandName, params) {
    if (this.commands.has(commandName)) {
      const workedComamnds = new PriorityQueue()
      const commandsQueue = this.commands.get(commandName)
      while(commandsQueue.size()) {
        //get most priority command:
        const command = commandsQueue.pop()
        //potential we can use results of prev commands callback for new callback:
        this.sendCommand(
          command.callback(params)
        )
        workedComamnds.push(command)
      }
      //restore queue
      this.commands.set(commandName, workedComamnds)
    }
  }
}