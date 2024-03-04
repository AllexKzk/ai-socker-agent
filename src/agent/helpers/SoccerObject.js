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
        this.xKalman = new KalmanFilter();
        this.yKalman = new KalmanFilter();
        this.xKalman.setMeasurementNoise(3)
        this.yKalman.setMeasurementNoise(3)
        this.serverNoise = 0.1;
    }
    
    setNewPosition(pos){
        this.position.x = this.xKalman.filter(pos.x)
        this.position.y = this.yKalman.filter(pos.y)
    }

    setMoment(moment){
        this.moment = moment
    }

    getPosition(){
        return this.position;
    }
    
    getName(){
        return this.position.name
    }
}