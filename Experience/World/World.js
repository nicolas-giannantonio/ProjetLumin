import Gesture from "../Utils/GesturePosition.js";
import Body from "./Body.js";
import * as THREE from 'three';
import {Mesh} from "three";

export default class World {
    frame = 0;

    constructor(experience) {
        this.experience = experience;
        this.scene = this.experience.scene;
        this.gesture = new Gesture();

        this.body = new Body(this.experience);
        this.body.init();

        this.floor = new Mesh(
            new THREE.PlaneGeometry(2, 2),
            new THREE.MeshBasicMaterial(
                {color: "white", side: THREE.DoubleSide, wireframe: true}
            )
        )

        this.floor.rotation.x = Math.PI / 2;
        this.floor.position.y = -1;
        this.scene.add(this.floor);
    }

    update() {
        const gesturePositions = this.gesture.getPositions();
        this.frame++;
        this.body.update(gesturePositions, this.frame)
    }
}
