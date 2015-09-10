GLOBALS = require '../globals.coffee'

module.exports = class Level
  constructor: (args) ->
    @entities = []
    @difficulty = args.difficulty || 0
    @ATTACKER_AMOUNT = @difficulty
    @numAttackers = 0
    @mainloop() if args.autostart
    @running = true

  mainloop: () =>
    setTimeout @mainloop, 1 / 60
    if Key.isDown 'x'
      @running = !@running
      return
    if !@running then return
    @garbageCollect()

  kill: (entity) ->
    # sets the entity to be garbage collected
    entity.alive = false

  updateEntities: () =>
    for entity in @entities
      entity.update()

  garbageCollect: () =>
    for entity in @entities
      if entity and entity.alive is false
        entity.kill()
        # remove entity from @entities array
        index = @entities.indexOf(entity)
        if index > -1
          @entities.splice(index, 1)
