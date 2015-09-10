Entity = require './Entity.coffee'
GLOBALS = require '../globals.coffee'

module.exports = class Defender extends Entity
  constructor: (x, y) ->
    super GLOBALS.DEFENDER_SIZE, x, y, 0, 0

    @accel = GLOBALS.DEFENDER.ACCEL
    @primaryColor = GLOBALS.DEFENDER.COLOR_1
    @secondaryColor = GLOBALS.DEFENDER.COLOR_2
    @maxVelocity = GLOBALS.DEFENDER.MAX_VELOCITY
    @lazarCooldown = GLOBALS.DEFENDER.LAZAR_COOLDOWN
    @health = @healthMax = 12
    @score = 0
    @type = 'defender'
    @armSize = 1.5
    @strokeWidth = @size / 7
    @timeSinceDamaged = 0
    @damageCooldown = 60
    @timeSinceLazar = 0
    @lazarRate = 1

    @makeBody()
    @makeBindings()

  makeBody: () =>
    #Bottom Right
    @arm0 = new Path.Line({
      from: @pos + @size
      to: @pos + (@size * @armSize)
      strokeColor: @secondaryColor
      strokeWidth: @strokeWidth
      })
    #Top Right
    @arm1 = new Path.Line
      from: [@pos.x + @size, @pos.y - @size]
      to: [@pos.x + (@size * @armSize), @pos.y - (@size * @armSize)]
      strokeColor: @secondaryColor
      strokeWidth: @strokeWidth

    #Top Left
    @arm2 = new Path.Line
      from: @pos - @size
      to: @pos + (@size * @armSize * -1)
      strokeColor: @secondaryColor
      strokeWidth: @strokeWidth

    #Bottom Left
    @arm3 = new Path.Line
      from: [@pos.x - @size, @pos.y + @size]
      to: [@pos.x - (@size * @armSize), @pos.y + (@size * @armSize)]
      strokeColor: @secondaryColor
      strokeWidth: @strokeWidth

    @outerCircle = new Path.Circle
      center: @pos
      radius: @size
      strokeColor: @primaryColor
      strokeWidth: @strokeWidth

    @innerCircle = new Path.Circle
      center: @pos
      radius: 1 # @size * 0.6
      strokeColor: @secondaryColor
      strokeWidth: @strokeWidth


    @body = new Group [@arm0, @arm1, @arm2, @arm3, @outerCircle, @innerCircle]

  makeBindings: () =>
    $(window).on 'attacker-death', (event, entity) =>
      @onScore(entity)

    $(window).on GLOBALS.DEFENDER_HEALTH_GAIN, (event, args) =>
      @onHealthGain(args.amount)

  update: () =>
    super()

    @updateStats()
    @updateLazar()

  updateStats: () =>
    if @score > 2
      @healthMax = 14

  updateLazar: () =>
    @timeSinceLazar += @lazarRate if @timeSinceLazar < @lazarCooldown
    radius = (@size) / (@lazarCooldown / @timeSinceLazar)
    @setInnerCircle(radius)
    @timeSinceDamaged += 1 if @timeSinceDamaged < @damageCooldown

  move: () =>
    @pos += @v # add velocity to position
    @body.position = @pos # move @body to @pos

  rotate: () =>
    @body.rotate(0.6)

  damage: (type) =>
    if type == 'attacker' and @timeSinceDamaged == @damageCooldown
      @health--
      @timeSinceDamaged = 0
      @timeSinceLazar = 0

  canFireMahLazarz: ()=>
    return @timeSinceLazar >= @lazarCooldown

  setInnerCircle: (radius) =>
    @innerCircle.remove()
    @innerCircle = new Path.Circle
      center: @pos
      radius: radius
      strokeColor: @secondaryColor
      strokeWidth: @strokeWidth

  raiseHealth: (x) =>
    @maxHealth += x
    $(window).trigger GLOBALS.MAX_HEALTH_GAIN

  onScore: (entity) =>
    @score += entity.scoreValue
    @raiseHealth(2) if @score % 10 is 0

  onHealthGain: (amount) =>
    @health += amount if @health < @healthMax
