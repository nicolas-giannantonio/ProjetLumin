

export default class AudioCapture {
    clapSoundLimit = 0.1;

    constructor(onClapCallback) {
        this.previousTime = 0;
        this.onClapCallback = onClapCallback;
        this.initAudio();


    }


    initAudio() {
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
            navigator.mediaDevices.getUserMedia({audio: true})
                .then((stream) => {
                    this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
                    const source = this.audioContext.createMediaStreamSource(stream);
                    this.analyser = this.audioContext.createAnalyser();
                    this.analyser.fftSize = 2048;
                    this.bufferLength = this.analyser.frequencyBinCount;
                    this.dataArray = new Uint8Array(this.bufferLength);
                    source.connect(this.analyser);
                })
                .catch((err) => {
                    console.error("Erreur lors de l'accès au microphone:", err);
                });
        } else {
            console.error('getUserMedia non supporté dans ce navigateur.');
        }
    }

    analyseSound() {
        if (this.analyser) {
            this.analyser.getByteFrequencyData(this.dataArray);
            let sum = 0;
            for (let i = 0; i < this.bufferLength; i++) {
                sum += this.dataArray[i];
            }
            const average = sum / this.bufferLength;
            const normalizedAverage = average / 255;

            if (normalizedAverage > this.clapSoundLimit && (Date.now() - this.previousTime) > 250) {
                this.previousTime = Date.now();
                if (this.onClapCallback) {
                    const color = this.generateRandomColor();
                    this.onClapCallback(color);
                }
            }
        }
    }

    generateRandomColor() {
        return {
            r: Math.random(),
            g: Math.random(),
            b: Math.random()
        };
    }
}
