import Environment from './Environment.js'
import Floor from './Floor.js'
import Fox from './Fox.js'
import Robot from './Robot.js'
import BlockPrefab from './BlockPrefab.js'


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

            //Cargando prefab
            const prefab = new BlockPrefab();
            const positions = [
                { x: 3.97, y: 0.5, z: 1.93 },
                { x: -0.25, y: 0.5, z: -2.79 },
                { x: -3.47, y: 0.5, z: 2.50 },
                { x: -3.95, y: 0.5, z: -2.59 },
                { x: 2.07, y: 0.5, z: -4.06 },
                { x: 4.67, y: 0.5, z: -0.14 },
                { x: 1.57, y: 0.5, z: -0.47 }
            ];
            

            positions.forEach((pos) => {
                const block = prefab.getInstance(pos);
                this.scene.add(block);
            });
        })
        //finalizando carga prefab

    }

    update() {
        if (this.fox)
            this.fox.update()
        if (this.robot)
            this.robot.update()
    }
}
