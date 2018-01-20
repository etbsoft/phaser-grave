export default class Actor {
  constructor (game, sprite) {
    this.game = game
    this.sprite = sprite
    this.weight = 1
  }

  get maxHealth () {
    return this.sprite.maxHealth
  }

  update () {
    if (this.game.config.isDevelopment) {
      this.game.debug.body(this.sprite)
      if (this.hitboxes) {
        for (const hitbox of this.hitboxes.children) {
          this.game.debug.body(hitbox)
        }
      }
    }
  }
}
