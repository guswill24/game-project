import * as THREE from 'three';

export default class Raycaster {
    constructor(experience) {
        this.experience = experience;
        this.camera = this.experience.camera.instance;
        this.renderer = this.experience.renderer.instance;
        this.scene = this.experience.scene;
        this.pointer = new THREE.Vector2();
        this.raycaster = new THREE.Raycaster();

        this.setEvents();
    }

    setEvents() {
        window.addEventListener('click', (event) => {
            this.pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
            this.pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;

            this.raycaster.setFromCamera(this.pointer, this.camera);

            // ajustar esto para intersectar con cualquier objeto
            const intersects = this.raycaster.intersectObject(this.experience.world.floor.mesh);

            if (intersects.length > 0) {
                const point = intersects[0].point;
                console.log('Punto seleccionado:', point);

                // Ejemplo: colocar un bloque en esa posición
                this.placeObject(point);
            }
        });
    }

    placeObject(position) {
        const geometry = new THREE.BoxGeometry(0.5, 0.5, 0.5);
        const material = new THREE.MeshStandardMaterial({ color: 0x00ff00 });
        const cube = new THREE.Mesh(geometry, material);
        cube.position.copy(position);
        cube.position.y += 0.25;
        this.scene.add(cube);
    }
    
}
