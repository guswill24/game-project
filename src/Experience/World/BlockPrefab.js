import * as THREE from 'three';

export default class BlockPrefab {
    constructor() {
        this.group = new THREE.Group();

        const geometry = new THREE.BoxGeometry(0.5, 0.5, 0.5);
        const material = new THREE.MeshStandardMaterial({ color: 0xff0000 });
        const mesh = new THREE.Mesh(geometry, material);
        mesh.castShadow = true;
        mesh.receiveShadow = true;

        this.group.add(mesh);
    }

    getInstance(position = { x: 0, y: 0, z: 0 }) {
        const clone = this.group.clone(true);
        clone.position.set(position.x, position.y, position.z);
        return clone;
    }
}
