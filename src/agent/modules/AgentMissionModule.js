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
            sense_body: Command(this.tick.bind(this), 4),
            // see: Command(this.seeCommand.bind(this)),
        }
        this.clarificationTickCounter = 3;
        this.currentTick = 0;
        this.isActualSee = true;
        this.prevTurn = 0;
        this.positionAgent.eventEmitter.on('flagsUpdated', (flags) => {
            let a = flags;
        });
    }

    seeCommand() {
        this.isActualSee = true;
    }

    tick(data) {
        if (this.mission) {
            this.currentTick += 1;
            this.doMission();
        }
    }

    setNarrowView() {
        this.messageModule.messageGot('(change_view narrow high)')
    }

    setNormalView() {
        this.messageModule.messageGot('(change_view normal high)')
    }

    isMissionComplete() {
        return this.currentActIndex == this.mission?.length;
    }

    turnPlayer(moment, params = { mathmoment: false }) {
        const newm = this.normalizeAngle(this.player.moment + moment);
        if (!params.mathmoment) {
            this.player.setMoment(newm);
        }
        else {
            this.player.setMoment(moment);
        }
        console.log("Δ: ", moment, "  angle: ", !params.mathmoment ? newm : moment);
        this.messageModule.messageGot(`(turn ${moment.toFixed(2)})`);
    }

    normalizeAngle(angle, normAngle = 360) {
        while (angle > normAngle) {
            angle -= 360
        }
        while (angle < -normAngle) {
            angle += 360
        }
        return angle
    }

    turnPlayerToPoint(p, params = { force: false, mathmoment: false }) {
        if (this.currentTick % this.clarificationTickCounter != 0
            && !params.force) return;
        let playerPos = this.player.getPosition();
        let newMoment = this.positionAgent.flagsMap.get(this.mission[this.currentActIndex].fl)?.angle;
        if (Math.abs(this.prevTurn) > 125 && !params.force) return;
        if (newMoment == undefined) {
            // newMoment = ((Math.abs(Math.atan2((p.y - playerPos.y), (p.x - playerPos.x))) * 180 / Math.PI) - Math.abs(this.player.moment));
            let dx = -playerPos.x;
            let dy = -playerPos.y;
            if (Math.abs(dy) < 1 || Math.abs(dx) < 1) newMoment = 170;
            else {
                params.mathmoment = true;
                let angle = Math.atan2(dy, dx) * 180 / Math.PI;
                let p2 = this.positionAgent.distance(p, this.player.getPosition());
                let p1 = this.positionAgent.distance({ x: 0, y: 0 }, this.player.getPosition());
                let p3 = this.positionAgent.distance({ x: 0, y: 0 }, p);
                let cosalpha = (p3 ** 2 - p2 ** 2 - p1 ** 2) / (-2 * p1 * p2);
                newMoment = Math.acos(cosalpha) * 180 / Math.PI + angle;
            }
            newMoment = this.normalizeAngle(newMoment);
        }
        if (Math.abs(newMoment) > 1) {
            this.turnPlayer(newMoment, params);
            this.prevTurn = newMoment;
        }
    }

    isPlayerOnDestination(p) {
        let d1 = this.positionAgent.distance(p, this.player.getPosition());
        return d1 < this.destinationDistance * 0.8 || (p.distance !== null && p.distance < this.destinationDistance * 0.8);
    }

    goToPoint(dp) {
        this.turnPlayerToPoint(dp);
        let dashPower = this.dashPower;
        this.messageModule.messageGot(`(dash ${dashPower})`);
    }

    findObjectPositions(objName) {
        const obj = this.positionAgent.objectsPositions.get(objName);
        if (obj?.position) {
            return obj.position;
        }
        else {
            if (this.currentTick % this.clarificationTickCounter !== 0) {
                this.messageModule.socketSend(
                    `turn`, `-15`
                );
            }
            return null;
        }
    }

    findBallCoordinates() {
        return this.findObjectPositions('b')
    }

    doMission() {
        if (this.isMissionComplete() || this.mission == undefined) return;
        const missionAims = {
            flag: () => {
                let currentDestination = this.positionAgent.flagsMap.get(this.mission[this.currentActIndex].fl);
                if (this.isPlayerOnDestination(currentDestination)) {
                    this.currentActIndex += 1
                    let nextDest = this.positionAgent.flagsMap.get(this.mission[this.currentActIndex].fl);
                    if (nextDest)
                        this.turnPlayerToPoint(nextDest, { force: true });
                }
                else {
                    this.goToPoint(currentDestination)
                }
            },
            kick: () => {
                let ballCoords = this.findBallCoordinates()
                console.log('balls: ', ballCoords)
                if (ballCoords == null) return;
                if (this.isPlayerOnDestination(ballCoords)) {
                    let newMoment = this.positionAgent.flagsMap.get(this.mission[this.currentActIndex].fl)?.angle;
                    if (!newMoment) {
                        const playerPos = this.player.getPosition();
                        const p = this.positionAgent.flagsMap.get(this.mission[this.currentActIndex].fl)
                        newMoment = ((Math.atan((p.y - playerPos.y) / (p.x - playerPos.x)) * 180 / Math.PI) - this.player.moment) % 180;
                        console.log('kick: ', newMoment, p, playerPos, this.player.moment)
                    }
                    this.messageModule.socketSend('kick', `${55} ${newMoment}`);
                }
                else {
                    this.goToPoint(ballCoords)
                }
            },
        };
        missionAims[this.mission[this.currentActIndex].act]?.();
    }

    setMission(mission) {
        this.currentActIndex = 0;
        this.currentTick = 0;
        this.mission = mission;
    }
}