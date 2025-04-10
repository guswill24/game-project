import Environment from './Environment.js'
import Floor from './Floor.js'
import Fox from './Fox.js'
import Robot from './Robot.js'
import BlockPrefab from './BlockPrefab.js'
import ToyCarLoader from './ToyCarLoader.js' // Importa la clase ToyCarLoader


export default class World {
    constructor(experience) {
        this.experience = experience
        this.scene = this.experience.scene
        this.resources = this.experience.resources
        this.blocksLoaded = false // ⬅ bandera para saber si se cargaron

        // Wait for resources
        this.resources.on('ready', async () => {
            // Setup
            this.floor = new Floor(this.experience)
            this.fox = new Fox(this.experience)
            this.robot = new Robot(this.experience)
            this.environment = new Environment(this.experience)

 
            // Nueva clase para cargar dinámicamente desde base de datos
            this.loader = new ToyCarLoader(this.experience);
            await this.loader.loadFromAPI(); // Carga desde backend

        })
        //finalizando carga prefab

    }

    update() {
        if (this.fox) this.fox.update();
        if (this.robot) this.robot.update();
        if (this.prefab) this.prefab.update();
    }
}
