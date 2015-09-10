Powerup = require './Powerup.coffee'
GLOBALS = require '../../globals.coffee'


class HealthUp extends Powerup
  constructor: (x, y) ->
    super x, y

    @trigger = GLOBALS.DEFENDER_HEALTH_GAIN
    @args =
      amount: 1
    @probability = GLOBALS.POWERUP.HEALTHUP.PROBABILITY

  makeBody: () =>
    @body = new PointText
      point: [@pos.x, @pos.y],
      content: '♡',
      fillColor: '#f24e3f',
      fontFamily: 'Courier New',
      fontSize: 25

module.exports = HealthUp
