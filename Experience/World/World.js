import Gesture from "../Utils/GesturePosition.js";
import Body from "./Body.js";

export default class World {
    frame = 0;

    constructor(experience) {
        this.experience = experience;
        this.scene = this.experience.scene;
        this.gesture = new Gesture();

        this.body = new Body(this.experience);
        this.body.init();
    }

    update() {
        const gesturePositions = this.gesture.getPositions();
        this.frame++;
        this.body.update(gesturePositions, this.frame)
    }
}
