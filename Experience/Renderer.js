import * as THREE from 'three';

import {EffectComposer} from 'three/addons/postprocessing/EffectComposer.js';
import {RenderPass} from 'three/addons/postprocessing/RenderPass.js';
import {OutputPass} from 'three/addons/postprocessing/OutputPass.js';
import {UnrealBloomPass} from "three/addons/postprocessing/UnrealBloomPass.js";
import {ShaderPass} from "three/addons/postprocessing/ShaderPass.js";
import DuplicateShader from './shaders/postprocessing/duplicate.glsl'
import { SobelOperatorShader } from 'three/addons/shaders/SobelOperatorShader.js';

export default class Renderer {
    constructor(experience) {
        this.experience = experience;
        this.canvas = this.experience.canvas;
        this.sizes = this.experience.sizes;
        this.scene = this.experience.scene;
        this.camera = this.experience.camera.instance;

        this.setInstance();
        this.setPostProcessing();
    }

    setInstance() {
        this.instance = new THREE.WebGLRenderer({
            canvas: this.canvas,
            alpha: true
        });

        this.instance.setClearColor("#000000");
        this.instance.setSize(this.sizes.width, this.sizes.height);
        this.instance.setPixelRatio(Math.min(window.devicePixelRatio, 2));

        this.composer = new EffectComposer(this.instance);
    }

    setPostProcessing() {
        this.renderPass = new RenderPass(this.scene, this.camera);
        this.composer.addPass(this.renderPass);

        const params = {
            threshold: .25,
            strength: .35,
            radius: 0,
            exposure: 2
        };

        const bloomPass = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 1.5, 0.4, 0.85);
        bloomPass.threshold = params.threshold;
        bloomPass.strength = params.strength;
        bloomPass.radius = params.radius;


        this.composer.addPass(bloomPass);

        const duplicatePass = new ShaderPass({
            uniforms: {
                tDiffuse: {value: null}
            },
            vertexShader: `
            varying vec2 vUv;            
            void main() {
                vUv = uv;
                vec4 newPosition = modelViewMatrix * vec4(position, 1.0);
                gl_Position = projectionMatrix * newPosition;
            }
            `,
            fragmentShader: DuplicateShader
        });
        this.composer.addPass(duplicatePass);

        this.outputPass = new OutputPass();
        this.composer.addPass(this.outputPass);
    }

    resize() {
        this.instance.setSize(this.sizes.width, this.sizes.height);
        this.instance.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.composer.setSize(this.sizes.width, this.sizes.height);
    }

    update() {
        this.composer.render();
    }
}
