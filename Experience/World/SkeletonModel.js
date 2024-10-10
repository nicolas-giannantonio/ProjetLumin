import * as THREE from 'three';
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader.js';

export default class SkeletonModel {
    positions = []
    isModelLoaded = false;

    constructor(experience) {
        this.experience = experience;
        this.loader = new GLTFLoader();
        this.loadModel();

        const light = new THREE.AmbientLight(0xffffff, 1);
        this.experience.scene.add(light);
    }

    loadModel() {
        this.loader.load('./public/assets/body.glb', (gltf) => {
            this.model = gltf.scenes[0];
            this.skinnedMesh = this.model.getObjectByProperty('type', 'SkinnedMesh');
            this.bones = this.skinnedMesh.skeleton.bones;

            for (let i = 0; i < this.bones.length; i++) {
                this.positions.push({
                    positions: this.bones[i].position,
                    name: this.bones[i].name
                })
            }

            // this.experience.scene.add(this.model);
            this.isModelLoaded = true;
        });
    }

    getPositions() {
        return this.positions;
    }

}
