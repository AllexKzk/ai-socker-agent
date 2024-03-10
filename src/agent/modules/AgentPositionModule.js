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
    this.flagsMap.forEach((point) => point.y * -1);
    this.player = new SoccerObject({ name: 'player' });
    this.playerPrevPosition = undefined;
    this.objectsPositions = new Map();
    this.counter = 0; //dbg
    this.counterNum = 60; //dbg
    this.numberPositionClarification = 2;
    this.serverError = 0.1;
    this.commands = {
      see: Command(this.calculatePosition.bind(this)),
    };
  }

  inverseCoordinates() {
    this.flagsMap.forEach((point) => {
      point.y *= -1
      point.x *= -1
    })
  }

  playerWasMovedTo(point) {
    this.player.position.x = point.x;
    this.player.position.y = point.y;
    this.playerPrevPosition = { ...this.player.getPosition() };

  }

  dbgLog(obj) { //dbg
    if (this.counter % this.counterNum === 0) {
      console.log(obj)
    }
  }

  distance(p1, p2) {
    return Math.sqrt((p1.x - p2.x) ** 2 + (p1.y - p2.y) ** 2)
  }

  alpha(p1, p2) {
    return (p1.y - p2.y) / (p2.x - p1.x);
  }

  beta(p1, p2) {
    return (
      p2.y * p2.y
      - p1.y * p1.y
      + p2.x * p2.x
      - p1.x * p1.x
      + p1.distance * p1.distance
      - p2.distance * p2.distance
    ) / (2 * (p2.x - p1.x));
  }

  /* 
      p2.x != p1.x
      p2.y != p1.y
      p3.x != p1.x
      p3.y != p1.y
  */
  getCoordinateByThreeDots(p1, p2, p3) {

    const alpha1 = this.alpha(p1, p2);
    const beta1 = this.beta(p1, p2);

    const alpha2 = this.alpha(p1, p3);
    const beta2 = this.beta(p1, p3);

    let y = (beta1 - beta2) / (alpha2 - alpha1);
    let x = alpha1 * y + beta1;
    x = Math.abs(x) < Number.EPSILON ? 0 : x;
    y = Math.abs(y) < Number.EPSILON ? 0 : y;
    return { x: x, y: y };
  }

  getPlayerCoordsByOneFlag(flag) {
    // На всякий случай оставить это подсчёт позиции игрока через 
    // пересчение прямой y=kx+b и окружности с радиусом равным расстоянию до флага
    // const borders = { x_min: -54, x_max: 54, y_min: -32, y_max: 32 }
    // y = kx + b
    // const k = -Math.tan(flag.angle * Math.PI / 180);
    // const b = flag.y - flag.x * k;

    // // (x-x0)^ + (y-y0)^2 = d^2
    // const d = flag.distance;
    // const tmp = b - flag.y;
    // const ak = 1 + k;
    // const bk = flag.x + k * tmp;
    // const ck = tmp ** 2 + flag.x ** 2 - d ** 2;
    // const sign = [-1, 1]
    // let x = null;
    // for (let s of sign) {
    //   const try_x = bk + s * Math.sqrt(bk ** 2 - ak * ck)
    //   if (try_x && borders.x_min <= try_x <= borders.x_max) {
    //     x = try_x
    //     break
    //   }
    // }
    // let y = k * x + b;
    let x = flag.x + flag.distance * Math.cos((flag.angle + this.player.moment) * Math.PI / 180);
    let y = flag.y + flag.distance * Math.sin((flag.angle + this.player.moment) * Math.PI / 180);
    return { x: x, y: y };
  }

  getPlayerCoordsByTwoFlags(f1, f2) {
    const borders = { x_min: -54, x_max: 54, y_min: -32, y_max: 32 }
    const d1 = f1.distance;
    const d2 = f2.distance
    let x = null
    let y = null
    if (f1.x == f2.x) {
      y = (f2.y ** 2 - f1.y ** 2 + d1 ** 2 - d2 ** 2) / (2 * (f2.y - f1.y))
      x = Math.sqrt(d1 ** 2 - (y - f1.y) ** 2) + f1.x
    }
    else if (f1.y == f2.y) {
      x = (f2.x ** 2 - f1.x ** 2 + d1 ** 2 - d2 ** 2) / (2 * (f2.x - f1.x))
      y = Math.sqrt(d1 ** 2 - (x - f1.x) ** 2) + f1.y
    }
    else {
      const sign = [-1, 1]
      const alpha = (f1.y - f2.y) / (f2.x - f1.x)
      const beta = (f2.y ** 2 - f1.y ** 2 + f2.x ** 2 - f1.x ** 2 + d1 ** 2 - d2 ** 2) / (2 * (f2.x - f1.x))
      const a = alpha ** 2 + 1
      const b = -2 * (alpha * (f1.x - beta) + f1.y)
      const c = (f1.x - beta) ** 2 + f1.y ** 2 - d1 ** 2
      const D = Math.sqrt(b ** 2 - 4 * a * c)
      if (y === null) {
        for (let y_sign of sign) {
          const try_y = (-b + y_sign * D) / 2 / a
          if (borders.y_min <= try_y <= borders.y_max) {
            y = try_y
            break
          }
        }
      }
      if (x === null) {
        for (let x_sign of sign) {
          const try_x = f1.x + x_sign * Math.sqrt(d1 ** 2 - (y - f1.y) ** 2)
          if (borders.x_min <= try_x <= borders.x_max) {
            x = try_x
            break
          }
        }
      }
    }
    return { x: x, y: y };
  }


  calculatePlayerPosition(flags) {
    if (flags.length == 1) {
      // 
      const flag = flags[0];
      let newCoords = this.getPlayerCoordsByOneFlag(flag)
      this.player.setNewPosition(newCoords);
    }
    // -50.88 -32.81 turn -133
    if (flags.length == 2) {
      const f1 = flags[0];
      const f2 = flags[1];
      let newCoords = this.getPlayerCoordsByTwoFlags(f1, f2)
      this.player.setNewPosition(newCoords);
    }
    if (flags.length >= 3) {
      let maxI = 1
      let threePoint = this.positionWorker.getValidThreeFlags(flags, 0);
      if (threePoint) {
        let pos = this.getCoordinateByThreeDots(threePoint.flag1, threePoint.flag2, threePoint.flag3);
        this.player.setNewPosition(pos);
      }
    }
    this.playerPrevPosition = { ...this.player.getPosition() }
  }

  calculateObjectsPosition(object, flags) {
    function cosTh(alphagr, a, b) {
      return Math.sqrt(Math.abs(a * a + b * b - 2 * a * b * Math.cos(alphagr * Math.PI / 180)))
    }

    const calcObjPos = (obj) => {
      let p1 = { ... this.player.getPosition() };
      p1.distance = obj.distance
      let tmpP2 = this.positionWorker.getValidSecondFlags(flags, p1)
      if (tmpP2?.flag.name == undefined) {
        return false
      }
      let p2 = this.flagsMap.get(tmpP2.flag.name)
      let tmpP3 = this.positionWorker.getValidSecondFlags(flags, p2, tmpP2.index + 1)
      if (tmpP3?.flag.name == undefined) {
        return false
      }
      let p3 = this.flagsMap.get(tmpP3?.flag.name)
      // TODO: если плохо определяются координаты объектов, то можно пересчитывать
      // угол флага относительно позиции игрока используя координаты и поворот игрока
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
    flags.sort((a, b) => a.distance - b.distance);
    let objects = tmp.objects
    this.calculatePlayerPosition(flags)
    this.calculateObjectsPosition(objects, flags)
    this.dbgLog(this.player.getPosition())
    ++this.counter;                     //dbg
  }
}