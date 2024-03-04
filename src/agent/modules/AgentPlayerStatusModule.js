import Command from "../command-agent/Command.js";

export default class AgentPlayerStatusModule {
    constructor() {
        this.commands = {
            change_view: Command(this.changeView.bind(this)),
        }
    }

    changeView(p){
        return { command: 'change_view', value: `${p[0]} ${p[1]}` }  
    }
}
