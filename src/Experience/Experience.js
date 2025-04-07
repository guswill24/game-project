import * as THREE from 'three'

import Debug from './Utils/Debug.js'
import Sizes from './Utils/Sizes.js'
import Time from './Utils/Time.js'
import Camera from './Camera.js'
import Renderer from './Renderer.js'
import World from './World/World.js'
import Resources from './Utils/Resources.js'
import sources from './sources.js'
import Sounds from './World/Sounds.js'
import Raycaster from './Utils/Raycaster.js'
import KeyboardControls from './Utils/KeyboardControls.js'
import Physics from './Utils/Physics.js'


let instance = null

export default class Experience {
    constructor(_canvas) {
        if (instance) {
            return instance
        }
        instance = this

        // Global access para depuraciones por consola
        window.experience = this

        // Options
        this.canvas = _canvas

        // Setup
        this.debug = new Debug()
        this.sizes = new Sizes()
        this.time = new Time()
        this.scene = new THREE.Scene()
        this.physics = new Physics()
        this.keyboard = new KeyboardControls()
        //Creando niebla
        this.scene.fog = new THREE.Fog('#fdeac7', 10, 50);
        
        //---------------------------------
        // SkyDome Shader (Gradiente azul cielo)
        const skyGeo = new THREE.SphereGeometry(50, 32, 32);
        const skyMat = new THREE.ShaderMaterial({
            side: THREE.BackSide,
            uniforms: {
                topColor: { value: new THREE.Color('#87ceeb') },
                bottomColor: { value: new THREE.Color('#ffffff') },
            },
            vertexShader: `
    varying vec3 vWorldPosition;
    void main() {
      vec4 worldPosition = modelMatrix * vec4(position, 1.0);
      vWorldPosition = worldPosition.xyz;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
            fragmentShader: `
    uniform vec3 topColor;
    uniform vec3 bottomColor;
    varying vec3 vWorldPosition;
    void main() {
      float h = normalize(vWorldPosition).y;
      gl_FragColor = vec4(mix(bottomColor, topColor, max(h, 0.0)), 1.0);
    }
  `,
        });
        const sky = new THREE.Mesh(skyGeo, skyMat);
        this.scene.add(sky);
        //---------------------------------

        this.resources = new Resources(sources)
        this.camera = new Camera(this)
        this.renderer = new Renderer(this)
        this.world = new World(this)
        /**
         * La siguiente linea envia datos a mongoDB
         */
        this.raycaster = new Raycaster(this); //Para establecer coordenadas

        // Resize event
        this.sizes.on('resize', () => {
            this.resize()
        })

        // Time tick event
        this.time.on('tick', () => {
            this.update()
        })
        // Sounds
        this.sounds = new Sounds({
            time: this.time,
            debug: this.debug
        })
    }

    resize() {
        this.camera.resize()
        this.renderer.resize()
    }

    update() {
        this.camera.update()
        this.world.update()
        this.renderer.update()
        this.physics.update(this.time.delta * 0.001)
    }

    destroy() {
        this.sizes.off('resize')
        this.time.off('tick')

        this.scene.traverse((child) => {
            if (child instanceof THREE.Mesh) {
                child.geometry.dispose()
                for (const key in child.material) {
                    const value = child.material[key]
                    if (value && typeof value.dispose === 'function') {
                        value.dispose()
                    }
                }
            }
        })

        this.camera.controls.dispose()
        this.renderer.instance.dispose()

        if (this.debug.active) this.debug.ui.destroy()
    }
}
