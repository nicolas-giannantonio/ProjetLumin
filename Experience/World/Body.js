import * as THREE from 'three';
import {Lerp} from "../Utils/math.js";
import vertexShader from '../shaders/vertex.glsl';
import fragmentShader from '../shaders/fragment.glsl';

export default class Body {
    INCLUDED_INDICES = [0, 17, 18, 31, 32];

    constructor(experience) {
        this.experience = experience;

        this.CONNECTIONS = [
            // [0, 12], [0, 11],
            //
            // [11, 12],
            //
            // [12, 14], [14, 18],
            // [11, 13], [13, 19],
            //
            // [11, 23], [12, 24],
            //
            // [24, 23],
            //
            // [24, 26], [23, 25],
            // [26, 30], [25, 29],

            [0, 18], [0, 17],
            [18, 32], [17, 31],
            [32, 31]
        ];

        for (let i = 0; i < this.CONNECTIONS.length; i++) {
            const [indexA, indexB] = this.CONNECTIONS[i];

            if (!this.INCLUDED_INDICES.includes(indexA)) {
                this.INCLUDED_INDICES.push(indexA);
            }

            if (!this.INCLUDED_INDICES.includes(indexB)) {
                this.INCLUDED_INDICES.push(indexB);
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
            colors[i * 3 + 1] = 1.0;
            colors[i * 3 + 2] = 1.0;

            sizes[i] = .5;
            alphas[i] = 1.0;
        }

        this.geometry.setAttribute('position', new THREE.BufferAttribute(this.vertices, 3));
        this.geometry.setAttribute('aColor', new THREE.BufferAttribute(colors, 3));
        this.geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
        this.geometry.setAttribute('alpha', new THREE.BufferAttribute(alphas, 1));

        this.material = new THREE.ShaderMaterial({
            vertexShader: vertexShader,
            fragmentShader: fragmentShader,
            depthTest: false,
            transparent: true,
            vertexColors: true,
        });

        this.points = new THREE.Points(this.geometry, this.material);
        this.experience.scene.add(this.points);

        this.active = true;
        this.lineInit();
    }

    lineInit() {
        this.lineMaterial = new THREE.LineBasicMaterial({
            color: 0xffffff,
            opacity: 1,
            linewidth: 1,
        })

        this.lineGeometry = new THREE.BufferGeometry();
        this.linePositions = new Float32Array(this.CONNECTIONS.length * 6); // (3(xyz)X2) points per line

        this.lineGeometry.setAttribute('position', new THREE.BufferAttribute(this.linePositions, 3));
        this.lines = new THREE.LineSegments(this.lineGeometry, this.lineMaterial);
        this.experience.scene.add(this.lines);
    }

    update(gesturePositions) {
        if (gesturePositions && gesturePositions.landmarks && this.active) {
            const landmarks = gesturePositions.landmarks;
            const positions = this.geometry.attributes.position.array;
            const colors = this.geometry.attributes.aColor.array;
            let index = 0;

            let leftWrist = landmarks[15];
            let rightWrist = landmarks[16];
            let head = landmarks[10];

            let distanceBetweenHandsHead = Math.sqrt(
                Math.pow(leftWrist.x - head.x, 2) + Math.pow(leftWrist.y - head.y, 2)
            );

            let distanceHandsX = Math.abs(leftWrist.x - rightWrist.x);
            let distanceHandsY = Math.abs(leftWrist.y - rightWrist.y);

            // console.log(distanceBetweenHandsHead)


            for (let i = 0; i < this.INCLUDED_INDICES.length; i++) {
                const originalIndex = this.INCLUDED_INDICES[i];
                const landmark = landmarks[originalIndex];
                if (!landmark) continue;

                const targetX = landmark.x * -0.5;
                const targetY = landmark.y * -0.5 + 0.5;
                const targetZ = landmark.z * -0.5;

                const currentX = this.vertices[index * 3];
                const currentY = this.vertices[index * 3 + 1];
                const currentZ = this.vertices[index * 3 + 2];


                const spacing = 0.15; // Distance entre chaque point
                const totalPoints = this.INCLUDED_INDICES.length;
                const totalLength = (totalPoints - 1) * spacing; // Longueur totale, en tenant compte des espaces entre les points
                const offset = totalLength / 2;


                if (distanceHandsX < .15) {
                    positions[index * 3] = Lerp(currentX, 0, 0.1);
                    positions[index * 3 + 1] = Lerp(currentY, 0, 0.1);
                    positions[index * 3 + 2] = Lerp(currentZ, 0, 0.1) * 0.15;
                } else if (distanceHandsX > .75) {
                    positions[index * 3] = Lerp(currentX, (i * spacing) - offset, 0.1);
                    positions[index * 3 + 1] = Lerp(currentY, 0, 0.1);
                    positions[index * 3 + 2] = Lerp(currentZ, 0, 0.1) * 0.15;
                } else if (distanceBetweenHandsHead > .5) {
                    console.log("Head star")
                }
                else {
                    positions[index * 3] = Lerp(currentX, targetX, 0.1);
                    positions[index * 3 + 1] = Lerp(currentY, targetY, 0.1);
                    positions[index * 3 + 2] = Lerp(currentZ, targetZ, 0.1) * 0.15;
                }

                colors[index * 3] = 1.0;
                colors[index * 3 + 1] = 1.0;
                colors[index * 3 + 2] = 1.0;

                index++;
            }

            this.geometry.attributes.position.needsUpdate = true;
            this.geometry.attributes.aColor.needsUpdate = true;

            this.updateLines();
        }
    }


    updateLines() {
        const linePositions = this.lineGeometry.attributes.position.array;
        let lineIndex = 0;

        for (let i = 0; i < this.CONNECTIONS.length; i++) {
            const [idxA, idxB] = this.CONNECTIONS[i];

            linePositions[lineIndex * 6] = this.vertices[this.INCLUDED_INDICES.indexOf(idxA) * 3];
            linePositions[lineIndex * 6 + 1] = this.vertices[this.INCLUDED_INDICES.indexOf(idxA) * 3 + 1];
            linePositions[lineIndex * 6 + 2] = 0; // this.vertices[this.INCLUDED_INDICES.indexOf(idxA) * 3 + 2]

            linePositions[lineIndex * 6 + 3] = this.vertices[this.INCLUDED_INDICES.indexOf(idxB) * 3];
            linePositions[lineIndex * 6 + 4] = this.vertices[this.INCLUDED_INDICES.indexOf(idxB) * 3 + 1];
            linePositions[lineIndex * 6 + 5] = 0; // this.vertices[this.INCLUDED_INDICES.indexOf(idxB) * 3 + 2]

            lineIndex++;
        }

        this.lineGeometry.attributes.position.needsUpdate = true;
    }


    mooveToCenter() {
        for (let i = 0; i < this.totalPoints; i++) {
            this.vertices[i * 3] = 0;
            this.vertices[i * 3 + 1] = 0;
            this.vertices[i * 3 + 2] = 0;
        }
    }
}
