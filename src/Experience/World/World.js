import Environment from './Environment.js'
import Floor from './Floor.js'
import Fox from './Fox.js'
import Robot from './Robot.js'


export default class World {
    constructor(experience) {
        this.experience = experience
        this.scene = this.experience.scene
        this.resources = this.experience.resources

        // Wait for resources
        this.resources.on('ready', () => {
            // Setup
            this.floor = new Floor(this.experience)
            this.fox = new Fox(this.experience)
            this.robot = new Robot(this.experience)
            this.environment = new Environment(this.experience)
        })


    }

    update() {
        if (this.fox)
            this.fox.update()
        if (this.robot)
            this.robot.update()
    }
}
