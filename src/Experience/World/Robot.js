import * as THREE from 'three'
import Sound from './Sounds.js'

export default class Robot {
    constructor(experience) {
        this.experience = experience
        this.scene = this.experience.scene
        this.resources = this.experience.resources
        this.time = this.experience.time
        this.debug = this.experience.debug

        // Estado de teclas
        this.keys = {
            up: false,
            down: false,
            left: false,
            right: false,
            space: false
        }

        // Resource
        this.resource = this.resources.items.robotModel

        // Debug
        if (this.debug.active) {
            this.debugFolder = this.debug.ui.addFolder('robot')
        }

        this.setModel()
        this.setAnimation()
        this.setSounds()
        this.setKeyboardEvents()
    }

    setModel() {
        this.model = this.resource.scene
        this.model.scale.set(0.5, 0.5, 0.5)
        this.model.position.set(2, 0, -3)
        this.scene.add(this.model)

        // Sombra
        this.model.traverse((child) => {
            if (child instanceof THREE.Mesh) {
                child.castShadow = true
            }
        })
    }

    setAnimation() {
        this.animation = {}
        this.animation.mixer = new THREE.AnimationMixer(this.model)

        // Acciones de animación
        this.animation.actions = {}
        this.animation.actions.dance = this.animation.mixer.clipAction(this.resource.animations[0])
        this.animation.actions.death = this.animation.mixer.clipAction(this.resource.animations[1])
        this.animation.actions.idle = this.animation.mixer.clipAction(this.resource.animations[2])
        this.animation.actions.jump = this.animation.mixer.clipAction(this.resource.animations[3])
        this.animation.actions.walking = this.animation.mixer.clipAction(this.resource.animations[10])

        // Acción inicial
        this.animation.actions.current = this.animation.actions.idle
        this.animation.actions.current.play()

        // Configuración de salto (sin loop, vuelve a idle)
        this.animation.actions.jump.setLoop(THREE.LoopOnce)
        this.animation.actions.jump.clampWhenFinished = true
        this.animation.actions.jump.onFinished = () => {
            this.animation.play('idle')
        }

        // Método para cambiar animaciones
        this.animation.play = (name) => {
            const newAction = this.animation.actions[name]
            const oldAction = this.animation.actions.current

            newAction.reset()
            newAction.play()
            newAction.crossFadeFrom(oldAction, 1)

            this.animation.actions.current = newAction

            // Sonido para caminar
            if (name === 'walking') {
                this.walkSound.play()
            } else {
                this.walkSound.stop()
            }

            // Sonido para saltar
            if (name === 'jump') {
                this.jumpSound.play()
            }
        }


        // Debug GUI
        if (this.debug.active) {
            const debugObject = {
                playDance: () => { this.animation.play('dance') },
                playDeath: () => { this.animation.play('death') },
                playIdle: () => { this.animation.play('idle') },
                playJump: () => { this.animation.play('jump') },
                playWalking: () => { this.animation.play('walking') }
            }
            this.debugFolder.add(debugObject, 'playDance')
            this.debugFolder.add(debugObject, 'playDeath')
            this.debugFolder.add(debugObject, 'playIdle')
            this.debugFolder.add(debugObject, 'playJump')
            this.debugFolder.add(debugObject, 'playWalking')
        }
    }

    setKeyboardEvents() {
        window.addEventListener('keydown', (event) => {
            if (event.key === 'ArrowUp') this.keys.up = true
            if (event.key === 'ArrowDown') this.keys.down = true
            if (event.key === 'ArrowLeft') this.keys.left = true
            if (event.key === 'ArrowRight') this.keys.right = true
            if (event.code === 'Space') this.keys.space = true
        })

        window.addEventListener('keyup', (event) => {
            if (event.key === 'ArrowUp') this.keys.up = false
            if (event.key === 'ArrowDown') this.keys.down = false
            if (event.key === 'ArrowLeft') this.keys.left = false
            if (event.key === 'ArrowRight') this.keys.right = false
            if (event.code === 'Space') this.keys.space = false
        })
    }

    setSounds() {
        this.walkSound = new Sound('/sounds/robot/walking.mp3', { loop: true, volume: 0.5 })
        this.jumpSound = new Sound('/sounds/robot/jump.mp3', { volume: 0.8 })
    }

    update() {
        const delta = this.time.delta * 0.001
        this.animation.mixer.update(delta)

        const moveSpeed = 2
        const turnSpeed = 2.5
        let isMoving = false

        // Saltar
        if (this.keys.space) {
            if (this.animation.actions.current !== this.animation.actions.jump) {
                this.animation.play('jump')
            }
            return // No moverse mientras salta
        }

        // Movimiento adelante/atrás
        if (this.keys.up) {
            const forward = new THREE.Vector3(0, 0, 1) // Ajustado a tu modelo
            forward.applyQuaternion(this.model.quaternion)
            this.model.position.addScaledVector(forward, moveSpeed * delta)
            isMoving = true
        }

        if (this.keys.down) {
            const backward = new THREE.Vector3(0, 0, -1)
            backward.applyQuaternion(this.model.quaternion)
            this.model.position.addScaledVector(backward, moveSpeed * delta)
            isMoving = true
        }

        // Rotación izquierda/derecha
        if (this.keys.left) {
            this.model.rotation.y += turnSpeed * delta
        }
        if (this.keys.right) {
            this.model.rotation.y -= turnSpeed * delta
        }

        // Cambiar entre idle y walking
        if (isMoving) {
            if (this.animation.actions.current !== this.animation.actions.walking) {
                this.animation.play('walking')
            }
        } else {
            if (this.animation.actions.current !== this.animation.actions.idle) {
                this.animation.play('idle')
            }
        }
    }
}
