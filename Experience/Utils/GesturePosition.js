import { PoseLandmarker, FilesetResolver } from "@mediapipe/tasks-vision";
import SoundBack from "../World/SoundBack.js";

export default class GesturePosition {
    runningMode = "LIVE_STREAM";
    webcamRunning = false;
    lastVideoTime = -1;
    results = undefined;
    poseLandmarker = null;
    $video = null;
    landmarks = null;

    constructor() {
        this.sound = SoundBack;

        if (this.hasGetUserMedia()) {
            window.addEventListener("click", () => {
                this.enableCam();
                this.sound.play();
            });
        } else {
            console.warn("getUserMedia() n'est pas supporté par votre navigateur");
        }

        (async () => {
            const vision = await FilesetResolver.forVisionTasks(
                "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
            );
            this.poseLandmarker = await PoseLandmarker.createFromOptions(vision, {
                baseOptions: {
                    modelAssetPath:
                        "https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_heavy/float16/1/pose_landmarker_heavy.task",
                    delegate: "GPU",
                },
                numPoses: 1,
                runningMode: this.runningMode,
                outputSegmentationMasks: true,
            });
        })();
    }

    hasGetUserMedia() {
        return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
    }

    enableCam() {
        if (!this.poseLandmarker) {
            alert("Chargement du PoseLandmarker");
            return;
        }

        this.webcamRunning = this.webcamRunning !== true;

        const constraints = {
            video: true
        };

        this.$video = document.getElementById("webcam");

        navigator.mediaDevices.getUserMedia(constraints).then((stream) => {
            this.$video.srcObject = stream;
            this.$video.addEventListener("loadeddata", this.predictWebcam.bind(this));
        });
    }

    async predictWebcam() {
        if (this.webcamRunning !== true) {
            return;
        }

        const nowInMs = performance.now();

        if (this.$video.currentTime !== this.lastVideoTime) {
            this.lastVideoTime = this.$video.currentTime;

            if (this.runningMode !== "LIVE_STREAM") {
                this.runningMode = "LIVE_STREAM";
                await this.poseLandmarker.setOptions({ runningMode: "LIVE_STREAM" });
            }

            this.results = await this.poseLandmarker.detectForVideo(this.$video, nowInMs);

            if (this.results && this.results.landmarks && this.results.landmarks.length > 0) {
                this.landmarks = this.results.landmarks[0];
            } else {
                this.landmarks = null;
            }
        }

        window.requestAnimationFrame(this.predictWebcam.bind(this));
    }

    getPositions() {
        if (!this.landmarks) {
            return null;
        }

        return {
            landmarks: this.landmarks.map((landmark) => ({
                x: landmark.x,
                y: landmark.y,
                z: landmark.z,
                visibility: landmark.visibility,
            })),
        }
    }
}
