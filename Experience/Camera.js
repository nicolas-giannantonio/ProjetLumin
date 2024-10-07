import * as THREE from 'three';
// CAMERA & ORBIT CONTROLS
import {OrbitControls} from "three/examples/jsm/controls/OrbitControls.js";


export default class Camera {
    constructor(experience) {
        this.experience = experience;
        this.sizes = this.experience.sizes;
        this.scene = this.experience.scene;
        this.canvas = this.experience.canvas;

        this.setInstance();
        this.setOrbitControls();
    }

    setInstance() {
        this.instance = new THREE.PerspectiveCamera(
            75,
            this.sizes.width / this.sizes.height,
            0.1,
            100
        );

        this.instance.position.set(0, 0, 3);
    }

    setOrbitControls() {
        this.controls = new OrbitControls(
            this.instance,
            this.canvas
        );

        this.controls.enableDamping = true;

    }

    resize() {
        this.instance.aspect = this.sizes.width / this.sizes.height;
        this.instance.updateProjectionMatrix();
    }

    update() {
        this.controls.update();
    }
}