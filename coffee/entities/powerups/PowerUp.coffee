Entity = require '../Entity.coffee'
GLOBALS = require '../../globals.coffee'

module.exports = class Powerup extends Entity
  constructor: (x, y) ->
    super GLOBALS.POWERUP_SIZE, x, y, 0, 0

    @type = 'powerup'
    @trigger = 'nothing'
    @args = {}
    @probability = 1

    @makeBody()

  makeBody: () =>
    @body = new PointText
      point: [50, 50],
      content: 'P',
      fillColor: 'white',
      fontFamily: 'Courier New',
      fontSize: 25

  damage: (type) =>
    if type == 'laser' or type == 'defender'
      $(window).trigger(@trigger, @args)
      @alive = false
