import Point from './Point.js'

export default class ObjectPositionWorker {
    isPointsValid(p1, p2) {
        return p2.x != p1.x && p2.y != p1.y
    }
    getValidSecondFlags(flags, p, index = 0) {
        for(let i = index; i < flags.length; ++i){
            if(this.isPointsValid(p, flags[i])){
                return {flag: flags[i], index: i};
            }
        }
    }

    getValidThreeFlags(flags, index = 0) {
        if (flags.length < 3) return undefined;
        for(let i = index; i < flags.length; ++i){
            let secondPoint = this.getValidSecondFlags(flags, flags[i], i+1);
            let thirdPoint = this.getValidSecondFlags(flags, flags[i], secondPoint?.index+1);
            if(secondPoint && thirdPoint){
                return {
                    flag1: flags[i],
                    flag2: secondPoint.flag,
                    flag3: thirdPoint.flag
                };
            }
        }
    }


    getPositions(pos, flagsMap) {
        let flags = new Array()
        let objects = new Array()

        for (let i = 1; i < pos.length; ++i) {
            let currentDot = pos[i]
            let currentDotName = currentDot?.command?.p.join('')
            let a = flagsMap.get(currentDotName)
            if (a) {
                let p1 = new Point(
                        currentDotName,
                        a.x, a.y,
                        currentDot.p[0],
                        currentDot.p[1],
                        currentDot.p[2], 
                        currentDot.p[3]
                    )
                flags.push(p1)
            }
            else{
                let p1 = new Point(
                    currentDotName,
                    undefined, undefined,
                    currentDot.p[0],
                    currentDot.p[1],
                    currentDot.p[2], 
                    currentDot.p[3]
                )
                objects.push(p1)
            }
        }
        return {flags: flags, objects: objects}
    }

}