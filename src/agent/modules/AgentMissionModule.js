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
        this.currentTick = this.clarificationTickCounter;
        this.isActualSee = true;
        this.prevTurn = 0;
        this.goalTurnAngle = 0;
        this.server_inertia_moment = 5.0;
        this.turnBorderValue = 180;
        this.isDashing = false;
    }

    seeCommand() {
        this.isActualSee = true;
    }

    tick(data) {
        if (this.mission) {
            this.doMission();
            this.currentTick += 1;
        }
    }

    isMissionComplete() {
        return this.currentActIndex == this.mission?.length;
    }

    getServerModelTurn(moment, params = { inverse: false, dash: 0 }) {
        const dash = params.dash ? params.dash : this.dashPower;
        if (params.inverse) {
            return moment * (1.0 + this.server_inertia_moment * Math.abs(dash) / 100);
        }
        return moment / (1.0 + this.server_inertia_moment * Math.abs(dash) / 100);
    }

    turnPlayer(moment, params = { mathmoment: false }) {
        let resTurn = 0;
        if (!this.isDashing) {// если игрок не бежит, инерции нет, можно поворачивать по полной
            resTurn = moment
            this.player.setMoment(this.normalizeAngle(this.player.moment + moment));
            this.nullifyTurnGoal()
        }
        else if (!this.isTurnGoal()) { // игок бежит, точку видно, учитываем инерцию
            resTurn = (this.getServerModelTurn(moment, { inverse: true }) - moment) * 0.4 + moment;
            let realAngle = moment;
            if (Math.abs(resTurn) > this.turnBorderValue) {
                realAngle = this.getServerModelTurn(this.turnBorderValue, { inverse: true }) * 0.7;
                realAngle *= moment > 0 ? 1 : -1;
                resTurn = this.turnBorderValue
                resTurn *= moment > 0 ? 1 : -1;
            }
            const newm = this.normalizeAngle(this.player.moment + realAngle);
            this.player.setMoment(newm);
        }
        else {// игрок бежит, точку не видно, учитываем инерцию
            const actualMaxTurn = this.getServerModelTurn(this.turnBorderValue);
            let newMathMoment = 0;
            if (Math.abs(this.goalTurnAngle) > actualMaxTurn) {
                resTurn = this.turnBorderValue
                resTurn *= this.goalTurnAngle > 0 ? 1 : -1;
                this.goalTurnAngle -= this.goalTurnAngle > 0 ? actualMaxTurn : -actualMaxTurn;
                let tmpTurn = actualMaxTurn;
                tmpTurn *= this.goalTurnAngle > 0 ? 1 : -1;
                this.player.setMoment(this.normalizeAngle(this.player.moment + tmpTurn));
            }
            else {
                resTurn = this.getServerModelTurn(this.goalTurnAngle, { inverse: true });
                this.player.setMoment(this.normalizeAngle(this.player.moment + this.goalTurnAngle));
                this.nullifyTurnGoal()
            }

        }
        console.log("Δ: ", parseFloat(resTurn), "origin Δ: ", moment, "angle: ", this.player.moment, (!params.mathmoment ? "server" : "math"));
        this.messageModule.socketSend(
            `turn`, `${resTurn}`
        );
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

    isTurnGoal() {
        if (this.goalTurnAngle !== 0) return true;
        return false;
    }

    nullifyTurnGoal() {
        this.goalTurnAngle = 0;
    }

    turnPlayerToobject(object) {
        if (this.currentTick % this.clarificationTickCounter != 0) return false;
        if (!object) {
            this.turnPlayer(20)
            return true;
        }
        const newMoment = object.angle;
        console.log("ball moment: ", newMoment);
        if (Math.abs(newMoment) > 1 && Math.abs(this.prevTurn - newMoment) != 0) {
            this.turnPlayer(newMoment*0.6);
            this.prevTurn = newMoment;
            return true;
        }
        return false;
    }

    turnPlayerToPoint(p, params = { force: false, mathmoment: false }) {
        if (this.currentTick % this.clarificationTickCounter != 0
            && !params.force
            && !this.isTurnGoal()) return;
        if (this.isTurnGoal()) {
            console.log(this.goalTurnAngle)
        }
        let playerPos = this.player.getPosition();
        let newMoment = this.positionAgent.flagsMap.get(this.mission[this.currentActIndex].fl)?.angle;
        if (newMoment)
            this.nullifyTurnGoal()
        if (newMoment == undefined && !this.isTurnGoal()) {

            // newMoment = ((Math.abs(Math.atan2((p.y - playerPos.y), (p.x - playerPos.x))) * 180 / Math.PI) - Math.abs(this.player.moment));
            // Оставим на всякий случай старый код
            // params.mathmoment = true;
            // let dx = -playerPos.x;
            // let dy = -playerPos.y;
            // let angle = Math.atan2(dy, dx) * 180 / Math.PI - this.player.moment;
            // let p2 = this.positionAgent.distance(p, this.player.getPosition());
            // let p1 = this.positionAgent.distance({ x: 0, y: 0 }, this.player.getPosition());
            // let p3 = this.positionAgent.distance({ x: 0, y: 0 }, p);
            // let cosalpha = (p3 ** 2 - p2 ** 2 - p1 ** 2) / (-2 * p1 * p2);
            // newMoment = Math.acos(cosalpha) * 180 / Math.PI + angle;
            // newMoment = this.normalizeAngle(newMoment);
            // this.goalTurnAngle = newMoment;
            if (this.isDashing) {
                newMoment = 180;
                this.goalTurnAngle = 50;
            }
            else newMoment = 45;
        }
        if (Math.abs(this.prevTurn - newMoment) < 12.5)
            return;
        if (Math.abs(newMoment) > 1 || this.isTurnGoal()) {
            this.turnPlayer(newMoment, params);
            this.prevTurn = newMoment;
            return true;
        }
        return false;
    }

    isPlayerOnDestination(p) {
        let d1 = this.positionAgent.distance(p, this.player.getPosition());
        return d1 < this.destinationDistance * 0.8 || (p.distance !== null && p.distance < this.destinationDistance * 0.8);
    }

    goToObject(dp) {
        if (this.turnPlayerToobject(dp)) {
            this.isDashing = false;
        }
        else
            this.isDashing = true;
        if (this.isDashing) {
            let dashPower = this.dashPower;
            this.messageModule.socketSend(
                `dash`, `${dashPower}`
            );
        }

    }

    goToPoint(dp, params = { flag: '' }) {

        if (this.turnPlayerToPoint(dp)) {
            this.isDashing = false;
        }
        else this.isDashing = true;

        if (this.isDashing) {
            let dashPower = this.dashPower;
            this.messageModule.socketSend(
                `dash`, `${dashPower}`
            );
            this.isDashing = true;
        }
    }

    findObjectPositions(objName) {
        const obj = this.positionAgent.objectsPositions.get(objName);
        if (obj?.position) {
            return obj.position;
        }
        else {
            return null;
        }
    }

    findBallPosition() {
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
                // TODO: сделать так чтобы игрок шел к мячу
                let ballObject = this.findBallPosition()
                if (ballObject && this.isPlayerOnDestination(ballObject)) {
                    // let newMoment = ballObject.angle;
                    // if (!newMoment) {
                    const playerPos = this.player.getPosition();
                    const p = this.positionAgent.flagsMap.get(this.mission[this.currentActIndex].fl)
                    let newMoment = ((Math.atan((p.y - playerPos.y) / (p.x - playerPos.x)) * 180 / Math.PI) - this.player.moment) % 180;
                    // console.log('kick: ', newMoment, p, playerPos, this.player.moment)
                    // }
                    this.messageModule.socketSend('kick', `${85} ${-ballObject.angle}`);
                }
                else {
                    this.goToObject(ballObject)
                }
            },
        };
        missionAims[this.mission[this.currentActIndex].act]?.();
    }

    setMission(mission) {
        this.currentActIndex = 0;
        this.currentTick = this.clarificationTickCounter;
        this.mission = mission;
    }
}