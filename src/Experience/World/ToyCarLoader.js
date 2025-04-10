export default class ToyCarLoader {
    constructor(experience) {
        this.experience = experience;
        this.scene = experience.scene;
        this.resources = experience.resources;
    }

    async loadFromAPI() {
        try {
            const res = await fetch('http://localhost:3001/api/blocks');
            const blocks = await res.json();
            console.log("📦 Bloques recibidos desde API:", blocks);

            blocks.forEach(block => {
                if (!block.name) {
                    console.warn('🛑 Bloque sin nombre:', block);
                    return;
                }

                // Usar directamente el nombre como se exportó (sin limpiar)
                const resourceKey = block.name;

                const glb = this.resources.items[resourceKey];

                if (!glb) {
                    console.warn(`🛑 Modelo no encontrado: ${resourceKey}`);
                    return;
                }

                const model = glb.scene.clone();
                model.position.set(block.x, block.y, block.z);
                model.updateMatrixWorld();

                this.scene.add(model);
            });
        } catch (err) {
            console.error('❌ Error al cargar bloques desde API:', err);
        }
    }
}
