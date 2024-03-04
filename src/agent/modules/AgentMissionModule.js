import Command from "../command-agent/Command.js";

export default class AgentMissionModule {
    constructor(params) {
        this.positionAgent = params.positionModule;
        this.messageModule = params.messageModule;
        this.player = params.positionModule.player;
        this.mission = undefined;
        this.currentActIndex = 0;
        this.dashPower = 100;
        this.destinationDistance = 3
        this.commands = {
            sense_body: Command(this.tick.bind(this)),
        }
        this.prevTurn = 0
        this.minD =  999

    }

    tick(data) {
        if (this.mission) {
            this.doMission();
        }
        // let tickCount = parseInt(data[0]);
    }

    setNarrowView() {
        this.messageModule.messageGot('(change_view narrow high)')
    }

    setNormalView() {
        this.messageModule.messageGot('(change_view normal high)')
    }

    isMissionComplete() {
        if (this.currentActIndex == this.mission?.length - 1 || this.mission == undefined) {
            this.setNormalView()
            return true;
        }
        return false;
    }

    turnPlayer(moment) {
        this.player.setMoment(this.player.moment + moment);
        this.messageModule.messageGot(`(turn ${moment})`);

    }

    turnPlayerToPoint(p) {
        let playerPos = this.player.getPosition();
        let newMoment = Math.atan2(p.y - playerPos.y, p.x - playerPos.x) * 180 / Math.PI - this.player.moment;
        if (Math.abs(newMoment) > 1) {
            this.turnPlayer(newMoment)
            this.prevTurn = newMoment
        }
    }

    isPlayerOnDestination(p) {
        let d1 = this.positionAgent.distance(p, this.player.getPosition())
        if (d1 <= this.destinationDistance * 1.1 || p.distance <= this.destinationDistance * 1.1) {
            return true;
        }
        if(d1 < this.minD) this.minD = d1;
        return false;
    }

    goToPoint(dp) {
        this.turnPlayerToPoint(dp);
        let dashPower = this.dashPower;
        this.messageModule.messageGot(`(dash ${dashPower})`);
    }

    findObjectPositions(objName) {
        if (objName === 'b') { return { x: 0, y: 0 } }
    }

    findBallCoordinates() {
        return this.findObjectPositions('b')
    }

    doMission() {
        if (this.isMissionComplete()) return;
        if (this.mission[this.currentActIndex].act === "flag") {
            let currentDestination = this.positionAgent.flagsMap.get(this.mission[this.currentActIndex].fl);
            if (this.isPlayerOnDestination(currentDestination)) {
                this.currentActIndex += 1
                return
            }
            else {
                this.goToPoint(currentDestination)
            }
        }
        else if (this.mission[this.currentActIndex].act === "kick") {
            ballCoords = this.findBallCoordinates()
            if (this.isPlayerOnDestination(ballCoords)) {
                this.messageModule.messageGot(`(kick ${100})`);
            }
            else {
                this.goToPoint(ballCoords)
            }
        }

    }

    setMission(mission) {
        this.currentActIndex = 0;
        this.mission = mission;
        // this.setNarrowView();
    }
}