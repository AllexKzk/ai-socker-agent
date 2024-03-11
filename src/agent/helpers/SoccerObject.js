import Point from './Point.js'
import KalmanFilter from 'kalmanjs';

export default class SoccerObject {
    constructor(info){
        this.position = new Point(
            info.name, 
            info.x, 
            info.y, 
            info.dist, 
            info.angle, 
            info.distChange,
            info.angleChange);
        this.moment = 0;
        this.momentKalman = new KalmanFilter({Q:0.5});;
        this.xKalman = new KalmanFilter({Q:3.2});
        this.yKalman = new KalmanFilter({Q:3.4});
        this.serverNoise = 0.1;
    }
    //-9 - 37
    setNewPosition(pos){
        this.position.x = this.xKalman.filter(pos.x)
        this.position.y = this.yKalman.filter(pos.y)
    }

    setMoment(moment){
        this.moment = this.momentKalman.filter(((moment + 360) % 360) - 180)
    }

    getPosition(){
        return this.position;
    }
    
    getName(){
        return this.position.name
    }
}