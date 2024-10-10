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
            new THREE.PlaneGeometry(2.5, 1.5, 1, 1),
            new THREE.MeshBasicMaterial(
                {
                    color: "white",
                    side: THREE.DoubleSide,
                    opacity: 1,
                    transparent: true,
                    wireframe: true
                }
            )
        )

        this.floor.rotation.x = Math.PI / 2;
        this.floor.position.y = -1;
        this.floor.position.z = -2;
        this.floor.scale.y = 4.5;
        this.scene.add(this.floor);
    }

    update() {
        const gesturePositions = this.gesture.getPositions();
        this.frame++;
        this.body.update(gesturePositions, this.frame)
    }
}
