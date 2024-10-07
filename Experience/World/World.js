import * as THREE from 'three';

import VertexShader from '../shaders/vertex.glsl'
import FragmentShader from '../shaders/fragment.glsl'

export default class World {

    constructor(experience) {
        this.experience = experience;
        this.scene = this.experience.scene;

        //     MESH
        const geometry = new THREE.BoxGeometry(1, 1, 1);

        const material = new THREE.ShaderMaterial({
            vertexShader: VertexShader,
            fragmentShader: FragmentShader,
            uniforms:
            {
                uTime: { value: 0 }
            },


        })


        this.mesh = new THREE.Mesh(geometry, material);
        this.scene.add(this.mesh);
    }

    update() {
        // this.mesh.rotation.y = Math.cos(this.experience.time.elapsed * 0.001);
    }
}
