import Phaser from 'phaser'
import { Controls } from '../entities/helpers'
import { TextBox } from '../ui'

export default class extends Phaser.State {
  init (killCounter) {
    this.killCounter = killCounter
    this.highscore = killCounter

    this.game.world.setBounds(0, -360, 1280, 540)
    this.game.stage.smoothing = false
    this.controls = new Controls(this.game)
  }

  preload () {
    this.game.add.sprite(0, 0, 'atlas', 'bg_gameover')

    this.kills = new TextBox(this.game, 'Kills: ' + this.killCounter, {
      anchorX: 4,
      anchorY: 4,
      size: 10.1,
      x: 125,
      bgColor: '#222222',
      fontColor: '#FFFFFF'
    })

    this.highscore = new TextBox(this.game, 'Highscore: ' + this.highscore, {
      anchorX: 4,
      anchorY: 4,
      size: 10.1,
      x: 125,
      y: 34,
      bgColor: '#222222',
      fontColor: '#FFFFFF'
    })

    this.resetMessage = new TextBox(this.game, 'Press [R] to Restart', {
      size: 5,
      x: 125,
      y: 54,
      bgColor: null,
      fontColor: '#FFFFFF'
    })
  }

  create () {}

  update () {
    this.controls.update()
  }

  render () {}
}