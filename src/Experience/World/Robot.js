import * as THREE from 'three'
import * as CANNON from 'cannon-es'
import Sound from './Sounds.js'

export default class Robot {
    constructor(experience) {
        this.experience = experience
        this.scene = this.experience.scene
        this.resources = this.experience.resources
        this.time = this.experience.time
        this.physics = this.experience.physics
        this.keyboard = this.experience.keyboard
        this.debug = this.experience.debug

        this.setModel()
        this.setSounds()
        this.setPhysics()
        this.setAnimation()
    }

    setModel() {
        this.model = this.resources.items.robotModel.scene
        this.model.scale.set(0.5, 0.5, 0.5)
        this.model.position.set(0, -0.5, 0) // Centrar respecto al cuerpo físico

        this.group = new THREE.Group()
        this.group.add(this.model)
        this.scene.add(this.group)

        this.model.traverse((child) => {
            if (child instanceof THREE.Mesh) {
                child.castShadow = true
            }
        })
    }

    setPhysics() {
        const shape = new CANNON.Box(new CANNON.Vec3(0.3, 0.5, 0.3)) // Más estable que esfera
        this.body = new CANNON.Body({
            mass: 1,
            shape: shape,
            position: new CANNON.Vec3(2, 2, -3),
            linearDamping: 0.9,
            angularDamping: 0.9
        })

        // ❗️ Restringir rotación: solo girar sobre eje Y
        this.body.angularFactor.set(0, 1, 0)

        this.physics.world.addBody(this.body)
    }

    setSounds() {
        this.walkSound = new Sound('/sounds/robot/walking.mp3', { loop: true, volume: 0.5 })
        this.jumpSound = new Sound('/sounds/robot/jump.mp3', { volume: 0.8 })
    }

    setAnimation() {
        this.animation = {}
        this.animation.mixer = new THREE.AnimationMixer(this.model)

        this.animation.actions = {}
        this.animation.actions.dance = this.animation.mixer.clipAction(this.resources.items.robotModel.animations[0])
        this.animation.actions.death = this.animation.mixer.clipAction(this.resources.items.robotModel.animations[1])
        this.animation.actions.idle = this.animation.mixer.clipAction(this.resources.items.robotModel.animations[2])
        this.animation.actions.jump = this.animation.mixer.clipAction(this.resources.items.robotModel.animations[3])
        this.animation.actions.walking = this.animation.mixer.clipAction(this.resources.items.robotModel.animations[10])

        this.animation.actions.current = this.animation.actions.idle
        this.animation.actions.current.play()

        this.animation.actions.jump.setLoop(THREE.LoopOnce)
        this.animation.actions.jump.clampWhenFinished = true
        this.animation.actions.jump.onFinished = () => {
            this.animation.play('idle')
        }

        this.animation.play = (name) => {
            const newAction = this.animation.actions[name]
            const oldAction = this.animation.actions.current

            newAction.reset()
            newAction.play()
            newAction.crossFadeFrom(oldAction, 1)
            this.animation.actions.current = newAction

            if (name === 'walking') {
                this.walkSound.play()
            } else {
                this.walkSound.stop()
            }

            if (name === 'jump') {
                this.jumpSound.play()
            }
        }
    }

    update() {
        const delta = this.time.delta * 0.001
        this.animation.mixer.update(delta)

        const keys = this.keyboard.getState()
        const moveForce = 12
        const turnSpeed = 2.5
        let isMoving = false

        // Salto
        if (keys.space && this.body.position.y <= 0.51) {
            this.body.applyImpulse(new CANNON.Vec3(0, 3, 0))
            this.animation.play('jump')
            return
        }

        // Movimiento hacia adelante
        if (keys.up) {
            const forward = new THREE.Vector3(0, 0, 1)
            forward.applyQuaternion(this.group.quaternion)
            this.body.applyForce(
                new CANNON.Vec3(forward.x * moveForce, 0, forward.z * moveForce),
                this.body.position
            )
            isMoving = true
        }

        // Movimiento hacia atrás
        if (keys.down) {
            const backward = new THREE.Vector3(0, 0, -1)
            backward.applyQuaternion(this.group.quaternion)
            this.body.applyForce(
                new CANNON.Vec3(backward.x * moveForce, 0, backward.z * moveForce),
                this.body.position
            )
            isMoving = true
        }

        // Rotación
        if (keys.left) {
            this.group.rotation.y += turnSpeed * delta
            this.body.quaternion.setFromEuler(0, this.group.rotation.y, 0)
        }
        if (keys.right) {
            this.group.rotation.y -= turnSpeed * delta
            this.body.quaternion.setFromEuler(0, this.group.rotation.y, 0)
        }


        // Animaciones según movimiento
        if (isMoving) {
            if (this.animation.actions.current !== this.animation.actions.walking) {
                this.animation.play('walking')
            }
        } else {
            if (this.animation.actions.current !== this.animation.actions.idle) {
                this.animation.play('idle')
            }
        }

        // Sincronización física → visual
        this.group.position.copy(this.body.position)
 
    }
}
