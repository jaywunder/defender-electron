Powerup = require './Powerup.coffee'
GLOBALS = require '../../globals.coffee'


module.exports = class ShootEmUp extends Powerup
  constructor: (x, y) ->
    super x, y

    @trigger = 'shoot-em-up'
    @args = {}
    @probability = GLOBALS.POWERUP.SHOOTEMUP.PROBABILITY

  makeBody: () =>
    @body = new Path.Circle
      center: [@pos.x, @pos.y],
      radius: @size
      fillColor: GLOBALS.POWERUP.SHOOTEMUP.COLOR_1,

  onCollect: () =>
    
