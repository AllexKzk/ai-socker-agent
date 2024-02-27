import ObjectPositionWorker from "../helpers/ObjectPositionWorker.js";
import SoccerObject from "../helpers/SoccerObject.js";
import Command from "../command-agent/Command.js"

export default class AgentPositionModule {
  constructor() {
    this.positionWorker = new ObjectPositionWorker()

    this.Flags = {
      "ftl50": { x: -50, y: -39 },
      "ftl40": { x: -40, y: -39 },
      "ftl30": { x: -30, y: -39 },
      "ftl20": { x: -20, y: -39 },
      "ftl10": { x: -10, y: -39 },
      "ft0": { x: 0, y: -39 },
      "ftr10": { x: 10, y: -39 },
      "ftr20": { x: 20, y: -39 },
      "ftr30": { x: 30, y: -39 },
      "ftr40": { x: 40, y: -39 },
      "ftr50": { x: 50, y: -39 },
      "fbl50": { x: -50, y: 39 },
      "fbl40": { x: -40, y: 39 },
      "fbl30": { x: -30, y: 39 },
      "fbl20": { x: -20, y: 39 },
      "fbl10": { x: -10, y: 39 },
      "fb0": { x: 0, y: 39 },
      "fbr10": { x: 10, y: 39 },
      "fbr20": { x: 20, y: 39 },
      "fbr30": { x: 30, y: 39 },
      "fbr40": { x: 40, y: 39 },
      "fbr50": { x: 50, y: 39 },
      "flt30": { x: -57.5, y: -30 },
      "flt20": { x: -57.5, y: -20 },
      "flt10": { x: -57.5, y: -10 },
      "fl0": { x: -57.5, y: 0 },
      "flb10": { x: -57.5, y: 10 },
      "flb20": { x: -57.5, y: 20 },
      "flb30": { x: -57.5, y: 30 },
      "frt30": { x: 57.5, y: -30 },
      "frt20": { x: 57.5, y: -20 },
      "frt10": { x: 57.5, y: -10 },
      "fr0": { x: 57.5, y: 0 },
      "frb10": { x: 57.5, y: 10 },
      "frb20": { x: 57.5, y: 20 },
      "frb30": { x: 57.5, y: 30 },
      "fglt": { x: -52.5, y: -7.01 },
      "fglb": { x: -52.5, y: 7.01 },
      "gl": { x: -52.5, y: 0 },
      "gr": { x: 52.5, y: 0 },
      "fgrt": { x: 52.5, y: -7.01 },
      "fgrb": { x: 52.5, y: 7.01 },
      "fc": { x: 0, y: 0 },
      "fplt": { x: -36, y: -20.15 },
      "fplc": { x: -36, y: 0 },
      "fplb": { x: -36, y: 20.15 },
      "fprt": { x: 36, y: -20.15 },
      "fprc": { x: 36, y: 0 },
      "fprb": { x: 36, y: 20.15 },
      "flt": { x: -52.5, y: -34 },
      "fct": { x: 0, y: -34 },
      "frt": { x: 52.5, y: -34 },
      "flb": { x: -52.5, y: 34 },
      "fcb": { x: 0, y: 34 },
      "frb": { x: 52.5, y: 34 }
    };
    this.flagsMap = new Map(Object.entries(this.Flags));
    this.flagsMap.forEach((point) => point.y * -1)
    this.player = new SoccerObject({ name: 'player' })
    this.objectsPositions = new Map()
    this.counter = 0 //dbg
    this.counterNum = 100 //dbg
    this.numberPositionClarification = 5
    this.calculateNeeded = true; 

    this.commands = {
      see: Command(this.calculatePosition.bind(this)),
    }
  }

  dbgLog(obj){ //dbg
    if (this.counter % this.counterNum === 0) {      
      console.log(obj)
    }
  }

  distance(p1, p2) {
    return Math.sqrt((p1.x - p2.x) ** 2 + (p1.y - p2.y) ** 2)
  }
  /* 
      p2.x != p1.x
      p2.y != p1.y
      p3.x != p1.x
      p3.y != p1.y
  */
  getCoordinateByThreeDots(p1, p2, p3) {
    function alpha(p1, p2) {
      return (p1.y - p2.y) / (p2.x - p1.x);
    }

    function beta(p1, p2) {
      return (
        p2.y * p2.y
        - p1.y * p1.y
        + p2.x * p2.x
        - p1.x * p1.x
        + p1.distance * p1.distance
        - p2.distance * p2.distance
      ) / (2 * (p2.x - p1.x));
    }

    const alpha1 = alpha(p1, p2);
    const beta1 = beta(p1, p2);

    const alpha2 = alpha(p1, p3);
    const beta2 = beta(p1, p3);

    let y = (beta1 - beta2) / (alpha2 - alpha1);
    let x = alpha1 * y + beta1;
    x = Math.abs(x) < Number.EPSILON ? 0 : x;
    y = Math.abs(y) < Number.EPSILON ? 0 : y;
    return { x: x, y: y };
  }

  calculatePlayerPosition(points) {
    // if(that.player.getPosition().x != undefined) return
    for(let i = 0; i < this.numberPositionClarification; ++i){
      let threePoint = this.positionWorker.getValidThreeFlags(points, i);
      if (threePoint) {
        let pos = this.getCoordinateByThreeDots(threePoint.flag1, threePoint.flag2, threePoint.flag3);
        this.player.setNewPosition(pos);
      }
    }
    // else {
    //   console.log("NO DOTS AHTUNG ", JSON.stringify(points));
    //   return undefined
    // }
    return true;
  }

  calculateObjectsPosition(object, flags) {
    function cosTh(alphagr, a, b) {
      return Math.sqrt(Math.abs(a * a + b * b - 2 * a * b * Math.cos(alphagr * Math.PI / 180)))
    }

    const calcObjPos = (obj) => {
      let p1 = this.player.getPosition();
      p1.distance = obj.distance
      let tmpP2 = this.positionWorker.getValidSecondFlags(flags, p1)
      let p2 = this.flagsMap.get(tmpP2.flag.name)
      let tmpP3 = this.positionWorker.getValidSecondFlags(flags, p2, tmpP2.index)
      let p3 = this.flagsMap.get(tmpP3.flag.name)
      p2.distance = cosTh(Math.abs(tmpP2.flag.angle - obj.angle), p1.distance, this.distance(p1, p2))
      p3.distance = cosTh(Math.abs(tmpP3.flag.angle - obj.angle), p1.distance, this.distance(p1, p3))
      let a = this.getCoordinateByThreeDots(p1, p2, p3)
      this.objectsPositions.get(obj.name).setNewPosition(a)
      this.dbgLog(this.objectsPositions.get(obj.name).getPosition())
    }

    for (let obj of object) {
      if (this.objectsPositions.get(obj.name) === undefined) {
        this.objectsPositions.set(obj.name, new SoccerObject({
          name: obj.name,
          x: undefined,
          y: undefined,
          dist: obj.dist,
          angle: obj.angle,
          distChange: obj.distChange,
          angleChange: obj.angleChange
        }))
      }
      calcObjPos(obj)
    }
  }

  calculatePosition(pos) {
    let tmp = this.positionWorker.getPositions(pos, this.flagsMap)
    let flags = tmp.flags
    let objects = tmp.objects
    if (this.calculateNeeded) {
      this.calculatePlayerPosition(flags)
      this.calculateNeeded = false;
    }
    this.calculateObjectsPosition(objects, flags)
    this.dbgLog(this.player.getPosition())
    ++this.counter;                     //dbg
  }
}