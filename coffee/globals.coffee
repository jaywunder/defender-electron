module.exports =
  ATTACKER_DEATH: 'attacker-death'
  MAX_HEALTH_GAIN: 'maxHealth-gain'
  DEFENDER_HEALTH_GAIN: 'defender-health-gain'
  DEFENDER_INVULNERABLE: 'defender-invulnerable'
  DEFENDER_DAMAGED: 'defender-damaged'

  FRICTION: 1
  SPRING: 0.8

  DEFENDER:
    ACCEL: 0.07
    MAX_VELOCITY: 3
    COLOR_1: '#00b3ff'
    COLOR_2: '#23e96b'
    LAZAR_COOLDOWN: 200

  ATTACKER:
    COLOR_1: '#f24e3f'
    ACCEL: 0.05
    MAX_VELOCITY: 1.5

  POWERUP:
    INVULNERABLEUP:
      PROBABILITY: 8000

    HEALTHUP:
      PROBABILITY: 500

    HEALTHUPDOUBLE:
      PROBABILITY: 700

    SHOOTEMUP:
      PROBABILITY: 10000
      COLOR_1: '#23e96b'

  DEFENDER_SIZE: $(window).width() / 50
  ATTACKER_SIZE: $(window).width() / 50
  LASER_SIZE   : $(window).width() / 60
  POWERUP_SIZE : $(window).width() / 65
