String::repeat = ( num ) ->
  #I'm sorry for extending a primitive type, but it must be done
  return new Array( num + 1 ).join( this )

Defender = require '../entities/Defender.coffee'
Attacker = require '../entities/Attacker.coffee'
Laser = require '../entities/Laser.coffee'
HealthUp = require '../entities/powerups/HealthUp.coffee'
HealthUpDouble = require '../entities/powerups/HealthUpDouble.coffee'
InvulnerableUp = require '../entities/powerups/InvulnerableUp.coffee'
ShootEmUp = require '../entities/powerups/ShootEmUp.coffee'
Level = require './Level.coffee'
GLOBALS = require '../globals.coffee'

module.exports = class GameLevel extends Level
  constructor: () ->
    super
      autostart: false
      difficulty: 3

    @healthFull    = $('#healthContainer')
    @healthBar     = $('#health')
    @injuryBar     = $('#injury')
    @scoreBar      = $('#score')
    @countdownText = $('#countdownText')

    @makeEntities()
    @makeBindings()

    @powerups =
      healthUp:
        object: HealthUp,
        probability: GLOBALS.POWERUP.HEALTHUP.PROBABILITY
      healthUpDouble:
        object: HealthUpDouble,
        probability: GLOBALS.POWERUP.HEALTHUPDOUBLE.PROBABILITY
      invulnerableUp:
        object: InvulnerableUp,
        probability: GLOBALS.POWERUP.INVULNERABLEUP.PROBABILITY
      shootEmUp:
        object: ShootEmUp
        probability: GLOBALS.POWERUP.SHOOTEMUP.PROBABILITY

    # UNCOMMENT WHEN DONE TESTING
    # setTimeout () =>
    #   @countdownText.text('THREE')
    # , 0
    # setTimeout =>
    #   @countdownText.text('TWO')
    # , 750
    # setTimeout =>
    #   @countdownText.text('ONE')
    # , 750 * 2
    setTimeout =>
      @countdownText.text('')
      setTimeout @mainloop, 1 / 30
      # window.requestAnimationFrame(@mainloop)
    , 750 # * 3

  mainloop: () =>
    super()
    if @running
      @handleInput()
      @updateEntities()
      @checkCollisions()
      @keepInBounds()
      @updateRandomSpawns()
      @updateScoreBar()
      @updateHealthBar()
      @updateAttackerAmount()
      view.draw()

  makeEntities: () =>
    @defender = new Defender view.center.x, view.center.y
    @entities.push @defender

    @entities.push new ShootEmUp(100, 100)

    for i in [0..@ATTACKER_AMOUNT] by 1
      @numAttackers++
      @entities.push new Attacker(
        GLOBALS.ATTACKER_SIZE,
        view.center.x + _.random(-500, 500),
        view.center.y + _.random(-500, 500),
        @defender
      )

  makeBindings: () =>
    $(window).on 'attacker-death', (event, entity) =>
      @spawnAttacker()
      @animateScoreBar()

    $(window).on GLOBALS.MAX_HEALTH_GAIN, =>
      @animateHealthBar()

    $(window).on 'shoot-em-up', (event, args) =>
      @onShootEmUp()

  makeStars: () ->
    starLayer = new Layer
      # children: ,
      strokeColor: 'white'
      strokeWidth: 3
      position: view.center

    for i in [0..$(window).width() / 3] by 1
      starLayer.children.push new Path.Circle
        radius: _.random 5, 5
        point: _.random $(window).width(), $(window).height()
        strokeColor: 'white'
        strokeWidth: 3

  handleInput: () =>
    if Key.isDown 'a' or Key.isDown 'left' # left
      @defender.v.x -= @defender.accel
    if Key.isDown 'w' or Key.isDown 'up' # up
      @defender.v.y -= @defender.accel
    if Key.isDown 'd' or Key.isDown 'right' # right
      @defender.v.x += @defender.accel
    if Key.isDown 's' or Key.isDown 'down' # down
      @defender.v.y += @defender.accel
    if Key.isDown 'shift'
      console.log 'shiftaki'
    if Key.isDown 'space'
      if @defender.canFireMahLazarz()
        @fireMahLazarz()
    if Key.isDown 'escape'
      @defender.v = new Point(0, 0) # set defender velocity to zero

  updateAttackerAmount: () =>
    if @numAttackers < @ATTACKER_AMOUNT
      @spawnAttacker()

  updateHealthBar: () =>
    if @defender.health >= 0
      @healthBar.text('♡'.repeat(@defender.health))
      @injuryBar.text('♡'.repeat(@defender.healthMax - @defender.health))

  updateScoreBar: () =>
    @scoreBar.text(@defender.score)

  updateRandomSpawns: () =>
    for name, powerup of @powerups
      if _.random(powerup.probability) == 1
        @entities.push new powerup.object(
          view.center.x + _.random(-500, 500),
          view.center.y + _.random(-500, 500)
        )

  animateHealthBar: () =>
    # class to add to health and injury bars
    animation = 'animated rubberBand'
    # ton of crap to check when animations end
    animationEnd = 'webkitAnimationEnd mozAnimationEnd' +
                   'MSAnimationEnd oanimationend animationend'

    # add animation to health bar and injury bar
    @healthBar.addClass(animation)
    @injuryBar.addClass(animation)
    @healthBar.one(animationEnd, ->
      # remove animation classes from elements
      $(this).removeClass(animation)
      $('#injury').removeClass(animation)
    )

  animateScoreBar: () =>
    #see comments above in animateHealthBar
    animation = 'animated rubberBand'
    animationEnd = 'webkitAnimationEnd mozAnimationEnd MSAnimationEnd' +
                   'oanimationend animationend'
    @scoreBar.addClass(animation)
    @scoreBar.one(animationEnd, -> $(this).removeClass(animation))

  spawnAttacker: () =>
    # creates a new Attacker
    @entities.push new Attacker(
      GLOBALS.ATTACKER_SIZE,
      view.center.x + _.random(-500, 500),
      view.center.y + _.random(-500, 500),
      @defender
    )

  fireMahLazarz: () =>
    @defender.timeSinceLazar = 0
    for entity in @entities
      # kill all existing lasers... just in case
      if entity.type == 'laser'
        @kill(entity)

    for i in [0...4] by 1
      # spawn four new lasers
      @entities.push new Laser(i, @defender)

  onShootEmUp: () =>
    setTimeout =>
      for i in [0..180] by 5
        setTimeout =>
          @fireMahLazarz()
          @defender.rotate()
          @defender.v = new Point 0, 0
        , i * 25
    , 100

  checkCollisions: (index) =>
    index ?= 0

    for e in [index + 1...@entities.length] by 1
      if @entities[index].pos.getDistance(@entities[e].pos) <= @entities[index].size + @entities[e].size
        #collide each entity with the other entity
        @collide(@entities[e], @entities[index])

        type1 = @entities[e].type
        type2 = @entities[index].type

        @entities[e].damage(type2)
        @entities[index].damage(type1)

    if index + 1 < @entities.length
      return @checkCollisions(index + 1)

  collide: (e1, e2) ->
    #math. I just know it works. I kinda understand it... but not well
    dx1 = e1.pos.x - e2.pos.x
    dy1 = e1.pos.y - e2.pos.y

    angle1 = Math.atan2(dy1, dx1)
    minDist1 = e1.size + e2.size

    targetX1 = e1.pos.x + Math.cos(angle1) * minDist1
    targetY1 = e2.pos.y + Math.sin(angle1) * minDist1

    ax1 = (targetX1 - e2.pos.x) * GLOBALS.SPRING / 50
    ay1 = (targetY1 - e2.pos.y) * GLOBALS.SPRING / 50

    # do the same from the second entity
    dx2 = e2.pos.x - e1.pos.x
    dy2 = e2.pos.y - e1.pos.y

    angle2 = Math.atan2(dy2, dx2)
    minDist2 = e1.size + e2.size

    targetX2 = e2.pos.x + Math.cos(angle2) * minDist2
    targetY2 = e1.pos.y + Math.sin(angle2) * minDist2

    ax2 = (targetX2 - e1.pos.x) * GLOBALS.SPRING / 50
    ay2 = (targetY2 - e1.pos.y) * GLOBALS.SPRING / 50

    # finally change the values
    e1.v += new Point ax1, ay1
    e2.v += new Point ax2, ay2


  keepInBounds: () =>
    for entity in @entities
      if entity.pos.x < entity.size
        #collide on left wall
        entity.v *= new Point -GLOBALS.SPRING, GLOBALS.SPRING
        entity.pos.x = entity.size
        @kill entity if entity.type is 'laser'

      if entity.pos.y < entity.size
        #collide on top wall
        entity.v *= new Point GLOBALS.SPRING, -GLOBALS.SPRING
        entity.pos.y = entity.size
        @kill entity if entity.type is 'laser'

      if entity.pos.x > view.bounds.width - entity.size
        #collide on right wall
        entity.v *= new Point -GLOBALS.SPRING, GLOBALS.SPRING
        entity.pos.x = view.bounds.width - entity.size
        @kill entity if entity.type is 'laser'

      if entity.pos.y > view.bounds.height - entity.size
        #collide on bottom wall
        entity.v *= new Point GLOBALS.SPRING, -GLOBALS.SPRING
        entity.pos.y = view.bounds.height - entity.size
        @kill entity if entity.type is 'laser'
