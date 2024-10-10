class SoundBack {
    constructor() {
        this.sound = new Audio("public/assets/sounds/musique.mp3");
        this.sound.muted = true;
        this.sound.loop = true;
    }

    play() {
        this.sound.play();
    }

    muted(state) {
        this.sound.muted = state;
    }
}

export default new SoundBack();
