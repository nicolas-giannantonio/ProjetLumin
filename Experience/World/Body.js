import * as THREE from 'three';
import {Lerp} from "../Utils/math.js";
import vertexShader from '../shaders/vertex.glsl';
import fragmentShader from '../shaders/fragment.glsl';
import AudioCapture from "./AudioCapture.js";

export default class Body {
    INCLUDED_INDICES = [0, 12, 11, 14, 18, 13, 19, 23, 24, 26, 25, 30, 29];
    TRAIL_LENGTH = 25;

    constructor(experience) {
        this.experience = experience;
        this.color = {r: 1.0, g: 1.0, b: 1.0};
        this.audioCapture = new AudioCapture((color) => {
            this.changeSkeletonColor(color);
        });
        this.CONNECTIONS = [
            [0, 12], [0, 11],
            [12, 14], [14, 18],
            [11, 13], [13, 19],
            [11, 23], [12, 24],
            [24, 23],
            [24, 26], [23, 25],
            [26, 30], [25, 29],
        ];
        this.previousPositions = [];
        for (let i = 0; i < this.TRAIL_LENGTH; i++) {
            this.previousPositions.push(new Float32Array(this.INCLUDED_INDICES.length * 3));
        }
        this.totalPoints = this.INCLUDED_INDICES.length;
        this.active = false;
        this.trailMeshes = [];
        this.trailLineMeshes = [];
        this.trailUpdateFrequency = 1;
        this.trailUpdateCounter = 0;
    }

    init() {
        const totalPoints = this.totalPoints;
        this.geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(totalPoints * 3);
        const colors = new Float32Array(totalPoints * 3);
        const sizes = new Float32Array(totalPoints);
        const alphas = new Float32Array(totalPoints);
        for (let i = 0; i < totalPoints; i++) {
            positions[i * 3] = 0;
            positions[i * 3 + 1] = 0;
            positions[i * 3 + 2] = 0;
            colors[i * 3] = this.color.r;
            colors[i * 3 + 1] = this.color.g;
            colors[i * 3 + 2] = this.color.b;
            sizes[i] = 0.05;
            alphas[i] = 1.0;
        }
        this.geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
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
        for (let i = 0; i < this.TRAIL_LENGTH; i++) {
            const trailGeometry = this.geometry.clone();
            const trailMaterial = this.material.clone();
            // const opacityFactor = (1 - (i + 1) / (this.TRAIL_LENGTH + 1)) * 0.5;
            // trailMaterial.uniforms.uOpacity.value = .1;
            const trailPoints = new THREE.Points(trailGeometry, trailMaterial);
            this.experience.scene.add(trailPoints);
            this.trailMeshes.push(trailPoints);
            const trailLineGeometry = this.lineGeometry.clone();
            const trailLineMaterial = this.lineMaterial.clone();
            // trailLineMaterial.opacity = opacityFactor;
            const trailLines = new THREE.LineSegments(trailLineGeometry, trailLineMaterial);
            this.experience.scene.add(trailLines);
            this.trailLineMeshes.push(trailLines);
        }
    }

    lineInit() {
        this.lineMaterial = new THREE.LineBasicMaterial({
            color: new THREE.Color(this.color.r, this.color.g, this.color.b),
            opacity: 1.0,
            linewidth: 1.0,
            transparent: true,
        });
        this.lineGeometry = new THREE.BufferGeometry();
        const linePositions = new Float32Array(this.CONNECTIONS.length * 6);
        this.lineGeometry.setAttribute('position', new THREE.BufferAttribute(linePositions, 3));
        this.lines = new THREE.LineSegments(this.lineGeometry, this.lineMaterial);
        this.experience.scene.add(this.lines);
    }

    update(gesturePositions, frame) {
        // this.material.uniforms.uTime.value = frame;
        this.audioCapture.analyseSound();
        if (gesturePositions && gesturePositions.landmarks && this.active) {
            const landmarks = gesturePositions.landmarks;
            const positions = this.geometry.attributes.position.array;
            const colors = this.geometry.attributes.aColor.array;
            let index = 0;
            this.trailUpdateCounter++;
            if (this.trailUpdateCounter >= this.trailUpdateFrequency) {
                this.previousPositions.pop();
                this.previousPositions.unshift(Float32Array.from(positions));
                this.trailUpdateCounter = 0;
            }
            for (let i = 0; i < this.INCLUDED_INDICES.length; i++) {
                const originalIndex = this.INCLUDED_INDICES[i];
                const landmark = landmarks[originalIndex];
                if (!landmark) continue;
                const targetX = (landmark.x - 0.5) * -1;
                const targetY = (landmark.y - 0.5) * -1;
                const targetZ = (landmark.z - 0.5) * -1;
                const currentX = positions[index * 3];
                const currentY = positions[index * 3 + 1];
                const currentZ = positions[index * 3 + 2];
                positions[index * 3] = Lerp(currentX, targetX, 0.1);
                positions[index * 3 + 1] = Lerp(currentY, targetY, 0.1) + .05;
                positions[index * 3 + 2] = Lerp(currentZ, targetZ, 0.1);
                colors[index * 3] = this.color.r;
                colors[index * 3 + 1] = this.color.g;
                colors[index * 3 + 2] = this.color.b;
                index++;
            }
            this.geometry.attributes.position.needsUpdate = true;
            this.geometry.attributes.aColor.needsUpdate = true;
            this.updateLines();
            this.updateTrails();
        }
    }

    changeSkeletonColor(color) {
        this.color = color;

        if (this.experience.world.floor) {
            const floorMaterial = this.experience.world.floor.material;

            if (floorMaterial && floorMaterial.color) {
                floorMaterial.color.setRGB(color.r, color.g, color.b);
                floorMaterial.needsUpdate = true;
            }
        }

        // Mise à jour des couleurs du squelette et des traînées
        const colors = this.geometry.attributes.aColor.array;
        for (let i = 0; i < colors.length; i += 3) {
            colors[i] = color.r;
            colors[i + 1] = color.g;
            colors[i + 2] = color.b;
        }
        this.geometry.attributes.aColor.needsUpdate = true;

        this.trailMeshes.forEach(trailMesh => {
            const trailColors = trailMesh.geometry.attributes.aColor.array;
            for (let i = 0; i < trailColors.length; i += 3) {
                trailColors[i] = color.r;
                trailColors[i + 1] = color.g;
                trailColors[i + 2] = color.b;
            }
            trailMesh.geometry.attributes.aColor.needsUpdate = true;
        });

        this.lineMaterial.color.setRGB(color.r, color.g, color.b);
        this.lineMaterial.needsUpdate = true;

        this.trailLineMeshes.forEach(trailLineMesh => {
            trailLineMesh.material.color.setRGB(color.r, color.g, color.b);
            trailLineMesh.material.needsUpdate = true;
        });
    }

    updateLines() {
        const positions = this.geometry.attributes.position.array;
        const linePositions = this.lineGeometry.attributes.position.array;
        let lineIndex = 0;
        for (let i = 0; i < this.CONNECTIONS.length; i++) {
            const [idxA, idxB] = this.CONNECTIONS[i];
            linePositions[lineIndex * 6] = positions[this.INCLUDED_INDICES.indexOf(idxA) * 3];
            linePositions[lineIndex * 6 + 1] = positions[this.INCLUDED_INDICES.indexOf(idxA) * 3 + 1];
            linePositions[lineIndex * 6 + 2] = positions[this.INCLUDED_INDICES.indexOf(idxA) * 3 + 2];
            linePositions[lineIndex * 6 + 3] = positions[this.INCLUDED_INDICES.indexOf(idxB) * 3];
            linePositions[lineIndex * 6 + 4] = positions[this.INCLUDED_INDICES.indexOf(idxB) * 3 + 1];
            linePositions[lineIndex * 6 + 5] = positions[this.INCLUDED_INDICES.indexOf(idxB) * 3 + 2];
            lineIndex++;
        }
        this.lineGeometry.attributes.position.needsUpdate = true;
    }

    updateTrails() {
        for (let i = 0; i < this.TRAIL_LENGTH; i++) {
            const trailPositions = this.previousPositions[i];
            if (!trailPositions) continue;
            const trailMesh = this.trailMeshes[i];
            trailMesh.geometry.attributes.position.array.set(trailPositions);
            trailMesh.geometry.attributes.position.needsUpdate = true;
            const trailLineMesh = this.trailLineMeshes[i];
            const linePositions = trailLineMesh.geometry.attributes.position.array;
            let lineIndex = 0;
            for (let j = 0; j < this.CONNECTIONS.length; j++) {
                const [idxA, idxB] = this.CONNECTIONS[j];
                linePositions[lineIndex * 6] = trailPositions[this.INCLUDED_INDICES.indexOf(idxA) * 3];
                linePositions[lineIndex * 6 + 1] = trailPositions[this.INCLUDED_INDICES.indexOf(idxA) * 3 + 1];
                linePositions[lineIndex * 6 + 2] = trailPositions[this.INCLUDED_INDICES.indexOf(idxA) * 3 + 2];
                linePositions[lineIndex * 6 + 3] = trailPositions[this.INCLUDED_INDICES.indexOf(idxB) * 3];
                linePositions[lineIndex * 6 + 4] = trailPositions[this.INCLUDED_INDICES.indexOf(idxB) * 3 + 1];
                linePositions[lineIndex * 6 + 5] = trailPositions[this.INCLUDED_INDICES.indexOf(idxB) * 3 + 2];
                lineIndex++;
            }
            trailLineMesh.geometry.attributes.position.needsUpdate = true;
        }
    }
}
