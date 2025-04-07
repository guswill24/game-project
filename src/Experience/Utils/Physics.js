// Experience/Utils/Physics.js
import * as CANNON from 'cannon-es'

export default class Physics {
    constructor() {
        this.world = new CANNON.World()
        this.world.gravity.set(0, -9.82, 0)

        // Puedes ajustar la precisión
        this.world.broadphase = new CANNON.SAPBroadphase(this.world)
        this.world.allowSleep = true
    }

    update(delta) {
        this.world.step(1 / 60, delta, 3)
    }
}
