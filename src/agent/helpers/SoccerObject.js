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
            info.angleChange)
        this.xKalman = new KalmanFilter();
        this.yKalman = new KalmanFilter();
    }
    
    setNewPosition(pos){
        this.position.x = this.xKalman.filter(pos.x)
        this.position.y = this.yKalman.filter(pos.y)
    }

    getPosition(){
        return this.position;
    }
    
    getName(){
        return this.position.name
    }
}