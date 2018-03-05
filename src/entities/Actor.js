import { States } from './helpers'
import { State, Hit, types as stateTypes } from './states'

export default class Actor {
  constructor (game, sprite, attributes = {}) {
    this.game = game
    this.sprite = sprite

    this.direction = {}
    this.targets = []
    this.controls = {}
    this.states = []
    this.killCount = 0
    this.experiencePoints = 0
    this.lastTargetHit = null
    this.dust = { start: () => {}, stop: () => {} }
    this.spark = { start: () => {}, stop: () => {} }
    this.healthBar = { change: () => {}, update: () => {} }

    this.game.physics.arcade.enable(this.sprite)
    this.hitboxes = this.game.add.group()

    this.name = attributes.name || ''
    this.weight = attributes.weight || 1
    this.experience = attributes.experience || 0
    this.unstoppable = attributes.unstoppable || false
    this.sprite.maxHealth = attributes.health
    this.sprite.setHealth(attributes.health)

    this.states = States.addMultiple(this, attributes)
  }

  _calculateStateTimes () {
    this.states.map(state => {
      if (state.time) {
        state.time--
      } else if (state.cooldown) {
        state.cooldown--
      }
      state.update()
    })
  }

  face (xFactor) {
    this.direction = {
      name: xFactor === 1 ? 'right' : 'left',
      factor: xFactor
    }
    this.sprite.scale.x = xFactor
    for (const h of this.hitboxes.children) {
      h.scale.x = xFactor
    }
    return xFactor
  }

  faceLeft () {
    return this.face(-1)
  }

  faceRight () {
    return this.face(1)
  }

  getHitbox (name) {
    const hitbox =
      this.hitboxes.children.find(hitbox => hitbox.name === name) || {}
    hitbox.actor = this
    return hitbox
  }

  getState () {
    return (
      this.states.find(state => state.time || state.timeless) || new State()
    )
  }

  setState (newStateType, parameters) {
    const current = this.getState()

    if (!this.alive && newStateType !== stateTypes.die) {
      return
    }

    if (newStateType.mandatory) {
      this.states.map(state => state.stop())
    }

    if (
      !current.time ||
      (current.restartable && current.type === newStateType) ||
      (current.timeless && current.type !== newStateType)
    ) {
      if (current.timeless) {
        this.states.filter(state => state.timeless).map(state => state.stop())
      }
      this.states
        .filter(state => state.type === newStateType)
        .map(state => state.start(parameters))
    }
  }

  playAnimation (animationName, archorX = 0.5, archorY = 0.5) {
    this.sprite.anchor.set(archorX, archorY)
    return this.sprite.animations.play(animationName)
  }

  setVelocity (x, y) {
    if (x != null) {
      this.sprite.body.velocity.x = x
    }
    if (y != null) {
      this.sprite.body.velocity.y = y
    }
  }

  knockback (strikerPositionX, distance) {
    let knockToX = this.sprite.x
    if (strikerPositionX < this.sprite.x) {
      knockToX += distance / this.weight
    } else {
      knockToX -= distance / this.weight
    }

    this.game.physics.arcade.moveToXY(
      this.sprite,
      knockToX,
      this.sprite.y,
      110,
      110
    )
  }

  get alive () {
    return this.sprite.alive
  }

  get health () {
    return this.sprite.health
  }

  heal (amount) {
    this.sprite.heal(amount)
    this.healthBar.change()
  }

  setHealth (amount) {
    this.sprite.maxHealth = amount
    this.sprite.setHealth(amount)
    this.healthBar.change()
  }

  damage (amount, striker) {
    if (this.sprite.health - amount <= 0) {
      this.sprite.health = 0
      this.die(striker)
    } else {
      this.sprite.damage(amount)
    }
    this.healthBar.change()
  }

  destroy () {
    this.sprite.kill()
    return this.sprite.destroy()
  }

  hit (hit) {
    if (
      this !== hit.striker &&
      this.getState().type !== stateTypes.roll &&
      this.health > 0
    ) {
      if (!this.unstoppable) {
        this.setState(stateTypes.hit, hit)
      } else {
        Hit.unstoppableDamage(this, hit.attack, hit.striker)
      }
    }
  }

  die (striker) {
    this.setState(stateTypes.die, striker)
  }

  run (speed) {
    let direction = { x: 0, y: 0 }

    if (this.controls.left) {
      direction.x = -1
    } else if (this.controls.right) {
      direction.x = 1
    }

    if (this.controls.up) {
      direction.y = -1
    } else if (this.controls.down) {
      direction.y = 1
    }

    if (direction.x !== 0 || direction.y !== 0) {
      this.setState(stateTypes.run, {
        direction,
        speed: speed
      })
    } else {
      if (this.states.find(state => state.type === stateTypes.idle)) {
        this.setState(stateTypes.idle)
      }
    }
  }

  attack () {
    if (this.controls.attack) {
      this.setState(stateTypes.attack)
    }
  }

  roll () {
    if (this.controls.roll) {
      this.setState(stateTypes.roll)
    }
  }

  update () {
    this.controls.update()
    this.healthBar.update()
    this._calculateStateTimes()
  }

  render () {
    if (this.game.config.isDevelopment) {
      this.game.debug.body(this.sprite)
      if (this.hitboxes) {
        for (const hitbox of this.hitboxes.children) {
          this.game.debug.body(hitbox, 'rgba(255, 0, 0, 0.3)')
        }
      }
    }
  }
}
