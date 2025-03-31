import { Howl } from 'howler'

export default class Sound {
    constructor(src, options = {}) {
        this.sound = new Howl({
            src: [src],
            ...options
        })
    }

    play() {
        this.sound.play()
    }

    stop() {
        this.sound.stop()
    }
}
