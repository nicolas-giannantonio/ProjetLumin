import * as THREE from 'three';
import { Lerp } from "../Utils/math.js"; // Assurez-vous que Lerp est correctement exporté
import vertexShader from '../shaders/vertex.glsl';
import fragmentShader from '../shaders/fragment.glsl';

export default class Body {
    constructor(experience) {
        this.experience = experience;
        this.originalTotalPoints = 33;

        this.EXCLUDED_INDICES = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 15, 16, 19, 20, 21, 22, 27, 28, 31, 32];

        this.INCLUDED_INDICES = [];
        for (let i = 0; i < this.originalTotalPoints; i++) {
            if (!this.EXCLUDED_INDICES.includes(i)) {
                this.INCLUDED_INDICES.push(i);
            }
        }

        this.totalPoints = this.INCLUDED_INDICES.length;
        this.active = false;
    }

    init() {
        const totalPoints = this.totalPoints;

        this.geometry = new THREE.BufferGeometry();
        this.vertices = new Float32Array(totalPoints * 3);

        const colors = new Float32Array(totalPoints * 3);
        const sizes = new Float32Array(totalPoints);
        const alphas = new Float32Array(totalPoints);

        for (let i = 0; i < totalPoints; i++) {
            this.vertices[i * 3] = 0;
            this.vertices[i * 3 + 1] = 0;
            this.vertices[i * 3 + 2] = 0;

            colors[i * 3] = 1.0;
            colors[i * 3 + 1] = 0.0;
            colors[i * 3 + 2] = 0.0;

            sizes[i] = 1.0;

            alphas[i] = 1.0;
        }

        this.geometry.setAttribute('position', new THREE.BufferAttribute(this.vertices, 3));
        this.geometry.setAttribute('aColor', new THREE.BufferAttribute(colors, 3));
        this.geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
        this.geometry.setAttribute('alpha', new THREE.BufferAttribute(alphas, 1));

        this.material = new THREE.ShaderMaterial({
            vertexShader: vertexShader,
            fragmentShader: fragmentShader,
            blending: THREE.AdditiveBlending,
            depthTest: false,
            transparent: true,
            vertexColors: true,
        });

        this.points = new THREE.Points(this.geometry, this.material);
        this.experience.scene.add(this.points);
        this.active = true;
    }

    update(gesturePositions, time) {
        if (gesturePositions && gesturePositions.landmarks && this.active) {
            const landmarks = gesturePositions.landmarks;
            const positions = this.geometry.attributes.position.array;
            let index = 0;

            for (let i = 0; i < this.INCLUDED_INDICES.length; i++) {
                const originalIndex = this.INCLUDED_INDICES[i];
                const landmark = landmarks[originalIndex];
                if (!landmark) continue;

                const targetX = landmark.x * -0.5;
                const targetY = landmark.y * -0.5 + 0.5;
                const targetZ = landmark.z * 0.5;

                const currentX = this.vertices[index * 3];
                const currentY = this.vertices[index * 3 + 1];
                const currentZ = this.vertices[index * 3 + 2];

                positions[index * 3] = Lerp(currentX, targetX, 0.1);
                positions[index * 3 + 1] = Lerp(currentY, targetY, 0.1);
                positions[index * 3 + 2] = Lerp(currentZ, targetZ, 0.1);

                this.vertices[index * 3] = positions[index * 3];
                this.vertices[index * 3 + 1] = positions[index * 3 + 1];
                this.vertices[index * 3 + 2] = positions[index * 3 + 2];

                index++;
            }

            this.geometry.attributes.position.needsUpdate = true;
        } else {
            // this.moveToCircle(time);
        }
    }

    moveToCircle(time) {
        const positions = this.geometry.attributes.position.array;
        let index = 0;

        for (let i = 0; i < this.totalPoints; i++) {
            const angle = (i / this.totalPoints) * Math.PI * 2;
            const radius = 0.5;

            positions[index * 3] = Math.cos(angle + (time * 0.01)) * radius;
            positions[index * 3 + 1] = Math.sin(angle + (time * 0.01)) * radius;
            positions[index * 3 + 2] = 0;

            index++;
        }

        this.geometry.attributes.position.needsUpdate = true;
    }
}
