import * as THREE from 'three';
// CAMERA & ORBIT CONTROLS
import {OrbitControls} from "three/examples/jsm/controls/OrbitControls.js";
import * as dat from 'dat.gui';

export default class Camera {
    constructor(experience) {
        this.experience = experience;
        this.sizes = this.experience.sizes;
        this.scene = this.experience.scene;
        this.canvas = this.experience.canvas;
        this.gui = new dat.GUI();

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

        this.instance.position.set(0, 0, 1);

        this.gui.add(this.instance.position, 'x').min(-100).max(100).step(0.01);
        this.gui.add(this.instance.position, 'y').min(-100).max(100).step(0.01);
        this.gui.add(this.instance.position, 'z').min(-50).max(50).step(0.1);
        this.gui.hide();
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
