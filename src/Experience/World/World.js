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
        this.blocksLoaded = false // ⬅ bandera para saber si se cargaron

        // Wait for resources
        this.resources.on('ready', () => {
            // Setup
            this.floor = new Floor(this.experience)
            this.fox = new Fox(this.experience)
            this.robot = new Robot(this.experience)
            this.environment = new Environment(this.experience)

            //Cargando prefab
            this.prefab = new BlockPrefab(this.experience);

            /**
             * Esta parte del codigo se reemplazara por la informacion que 
             * viene del backend.
             */
            /*    const positions = [
                    { x: 3.97, y: 0.5, z: 1.93 },
                    { x: -0.25, y: 0.5, z: -2.79 },
                    { x: -3.47, y: 0.5, z: 2.50 },
                    { x: -3.95, y: 0.5, z: -2.59 },
                    { x: 2.07, y: 0.5, z: -4.06 },
                    { x: 4.67, y: 0.5, z: -0.14 },
                    { x: 1.57, y: 0.5, z: -0.47 }
                ];
    */
            // ⚠️ Cargar bloques desde backend
            fetch('http://localhost:3001/blocks')
                .then(res => {
                    if (!res.ok) throw new Error('Respuesta no válida del backend')
                    return res.json()
                })
                .then(data => {
                    data.forEach(block => {
                        this.prefab.getInstance({ x: block.x, y: block.y, z: block.z })
                    })
                    this.blocksLoaded = true
                })
                .catch(err => {
                    console.error('❌ Error al cargar bloques:', err)
                    this.blocksLoaded = false
                    alert('⚠️ No se pudo conectar al servidor. Los bloques no se cargaron.')
                })
            /**
             * Fin de la transmision de datos del backend
             */
            //positions.forEach((pos) => {
            //    this.prefab.getInstance(pos);
            //});

        })
        //finalizando carga prefab

    }

    update() {
        if (this.fox)
            this.fox.update()
        if (this.robot)
            this.robot.update()
        if (this.prefab)
            this.prefab.update();
    }
}
