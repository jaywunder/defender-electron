(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var Attacker, Entity, GLOBALS,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

Entity = require('./Entity.coffee');

GLOBALS = require('../globals.coffee');

module.exports = Attacker = (function(superClass) {
  extend(Attacker, superClass);

  function Attacker(size, x, y, target) {
    this.damage = bind(this.damage, this);
    this.rotate = bind(this.rotate, this);
    this.trackTarget = bind(this.trackTarget, this);
    this.update = bind(this.update, this);
    this.makeBody = bind(this.makeBody, this);
    Attacker.__super__.constructor.call(this, size, x, y, _.random(-5, 5), _.random(-5, 5));
    this.rotation = 0;
    this.target = target;
    this.type = 'attacker';
    this.maxVelocity = GLOBALS.ATTACKER.MAX_VELOCITY;
    this.strokeWidth = this.size / 10;
    this.primaryColor = GLOBALS.ATTACKER.COLOR_1;
    this.accel = GLOBALS.ATTACKER.ACCEL;
    this.scoreValue = 1;
    this.makeBody();
  }

  Attacker.prototype.makeBody = function() {
    return this.body = new Path({
      segments: [
        new Segment({
          point: [this.pos.x + this.size, this.pos.y - this.size]
        }), new Segment({
          point: [this.pos.x - this.size, this.pos.y - this.size]
        }), new Segment({
          point: [this.pos.x, this.pos.y + this.size]
        })
      ],
      strokeColor: this.primaryColor,
      strokeWidth: this.strokeWidth,
      closed: true
    });
  };

  Attacker.prototype.update = function() {
    Attacker.__super__.update.call(this);
    return this.trackTarget();
  };

  Attacker.prototype.trackTarget = function() {
    if (this.target.pos.x < this.pos.x) {
      this.v.x -= this.accel;
    }
    if (this.target.pos.y < this.pos.y) {
      this.v.y -= this.accel;
    }
    if (this.target.pos.x > this.pos.x) {
      this.v.x += this.accel;
    }
    if (this.target.pos.y > this.pos.y) {
      return this.v.y += this.accel;
    }
  };

  Attacker.prototype.rotate = function() {};

  Attacker.prototype.damage = function(type) {
    if (type === 'laser') {
      return this.alive = false;
    }
  };

  return Attacker;

})(Entity);



},{"../globals.coffee":10,"./Entity.coffee":3}],2:[function(require,module,exports){
var Defender, Entity, GLOBALS,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

Entity = require('./Entity.coffee');

GLOBALS = require('../globals.coffee');

module.exports = Defender = (function(superClass) {
  extend(Defender, superClass);

  function Defender(x, y) {
    this.onHealthGain = bind(this.onHealthGain, this);
    this.onScore = bind(this.onScore, this);
    this.raiseHealth = bind(this.raiseHealth, this);
    this.setInnerCircle = bind(this.setInnerCircle, this);
    this.canFireMahLazarz = bind(this.canFireMahLazarz, this);
    this.damage = bind(this.damage, this);
    this.rotate = bind(this.rotate, this);
    this.move = bind(this.move, this);
    this.updateLazar = bind(this.updateLazar, this);
    this.updateStats = bind(this.updateStats, this);
    this.update = bind(this.update, this);
    this.makeBindings = bind(this.makeBindings, this);
    this.makeBody = bind(this.makeBody, this);
    Defender.__super__.constructor.call(this, GLOBALS.DEFENDER_SIZE, x, y, 0, 0);
    this.accel = GLOBALS.DEFENDER.ACCEL;
    this.primaryColor = GLOBALS.DEFENDER.COLOR_1;
    this.secondaryColor = GLOBALS.DEFENDER.COLOR_2;
    this.maxVelocity = GLOBALS.DEFENDER.MAX_VELOCITY;
    this.lazarCooldown = GLOBALS.DEFENDER.LAZAR_COOLDOWN;
    this.health = this.healthMax = 12;
    this.score = 0;
    this.type = 'defender';
    this.armSize = 1.5;
    this.strokeWidth = this.size / 7;
    this.timeSinceDamaged = 0;
    this.damageCooldown = 60;
    this.timeSinceLazar = 0;
    this.lazarRate = 1;
    this.makeBody();
    this.makeBindings();
  }

  Defender.prototype.makeBody = function() {
    this.arm0 = new Path.Line({
      from: this.pos + this.size,
      to: this.pos + (this.size * this.armSize),
      strokeColor: this.secondaryColor,
      strokeWidth: this.strokeWidth
    });
    this.arm1 = new Path.Line({
      from: [this.pos.x + this.size, this.pos.y - this.size],
      to: [this.pos.x + (this.size * this.armSize), this.pos.y - (this.size * this.armSize)],
      strokeColor: this.secondaryColor,
      strokeWidth: this.strokeWidth
    });
    this.arm2 = new Path.Line({
      from: this.pos - this.size,
      to: this.pos + (this.size * this.armSize * -1),
      strokeColor: this.secondaryColor,
      strokeWidth: this.strokeWidth
    });
    this.arm3 = new Path.Line({
      from: [this.pos.x - this.size, this.pos.y + this.size],
      to: [this.pos.x - (this.size * this.armSize), this.pos.y + (this.size * this.armSize)],
      strokeColor: this.secondaryColor,
      strokeWidth: this.strokeWidth
    });
    this.outerCircle = new Path.Circle({
      center: this.pos,
      radius: this.size,
      strokeColor: this.primaryColor,
      strokeWidth: this.strokeWidth
    });
    this.innerCircle = new Path.Circle({
      center: this.pos,
      radius: 1,
      strokeColor: this.secondaryColor,
      strokeWidth: this.strokeWidth
    });
    return this.body = new Group([this.arm0, this.arm1, this.arm2, this.arm3, this.outerCircle, this.innerCircle]);
  };

  Defender.prototype.makeBindings = function() {
    $(window).on('attacker-death', (function(_this) {
      return function(event, entity) {
        return _this.onScore(entity);
      };
    })(this));
    return $(window).on(GLOBALS.DEFENDER_HEALTH_GAIN, (function(_this) {
      return function(event, args) {
        return _this.onHealthGain(args.amount);
      };
    })(this));
  };

  Defender.prototype.update = function() {
    Defender.__super__.update.call(this);
    this.updateStats();
    return this.updateLazar();
  };

  Defender.prototype.updateStats = function() {
    if (this.score > 2) {
      return this.healthMax = 14;
    }
  };

  Defender.prototype.updateLazar = function() {
    var radius;
    if (this.timeSinceLazar < this.lazarCooldown) {
      this.timeSinceLazar += this.lazarRate;
    }
    radius = this.size / (this.lazarCooldown / this.timeSinceLazar);
    this.setInnerCircle(radius);
    if (this.timeSinceDamaged < this.damageCooldown) {
      return this.timeSinceDamaged += 1;
    }
  };

  Defender.prototype.move = function() {
    this.pos += this.v;
    return this.body.position = this.pos;
  };

  Defender.prototype.rotate = function() {
    return this.body.rotate(0.6);
  };

  Defender.prototype.damage = function(type) {
    if (type === 'attacker' && this.timeSinceDamaged === this.damageCooldown) {
      this.health--;
      this.timeSinceDamaged = 0;
      return this.timeSinceLazar = 0;
    }
  };

  Defender.prototype.canFireMahLazarz = function() {
    if (this.timeSinceLazar >= this.lazarCooldown) {
      return true;
    } else {
      return false;
    }
  };

  Defender.prototype.setInnerCircle = function(radius) {
    this.innerCircle.remove();
    return this.innerCircle = new Path.Circle({
      center: this.pos,
      radius: radius,
      strokeColor: this.secondaryColor,
      strokeWidth: this.strokeWidth
    });
  };

  Defender.prototype.raiseHealth = function() {
    this.maxHealth += 2;
    return $(window).trigger(GLOBALS.MAX_HEALTH_GAIN);
  };

  Defender.prototype.onScore = function(entity) {
    this.score += entity.scoreValue;
    if (this.score % 10 === 0) {
      return this.raiseHealth();
    }
  };

  Defender.prototype.onHealthGain = function(amount) {
    if (this.health < this.healthMax) {
      return this.health += amount;
    }
  };

  return Defender;

})(Entity);



},{"../globals.coffee":10,"./Entity.coffee":3}],3:[function(require,module,exports){
var Entity, GLOBALS,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

GLOBALS = require('../globals.coffee');

module.exports = Entity = (function() {
  function Entity(size, x, y, vx, vy) {
    this.kill = bind(this.kill, this);
    this.rotate = bind(this.rotate, this);
    this.move = bind(this.move, this);
    this.damage = bind(this.damage, this);
    this.limitVelocity = bind(this.limitVelocity, this);
    this.makeBody = bind(this.makeBody, this);
    this.update = bind(this.update, this);
    this.updateDirection = bind(this.updateDirection, this);
    this.size = size;
    this.pos = new Point(x, y);
    this.v = new Point(vx, vy);
    this.alive = true;
    this.primaryColor = '#bab8b5';
    this.maxVelocity = Infinity;
    this.accel = 0.5;
  }

  Entity.prototype.updateDirection = function() {};

  Entity.prototype.update = function() {
    this.limitVelocity();
    this.move();
    return this.rotate();
  };

  Entity.prototype.makeBody = function() {
    return this.body = new Path.Circle({
      center: [this.pos.x, this.pos.y],
      radius: this.size,
      strokeColor: this.strokeColor
    });
  };

  Entity.prototype.limitVelocity = function() {
    if (this.v.x > this.maxVelocity) {
      this.v.x = this.maxVelocity;
    }
    if (this.v.x < -this.maxVelocity) {
      this.v.x = -this.maxVelocity;
    }
    if (this.v.y > this.maxVelocity) {
      this.v.y = this.maxVelocity;
    }
    if (this.v.y < -this.maxVelocity) {
      return this.v.y = -this.maxVelocity;
    }
  };

  Entity.prototype.damage = function(type) {};

  Entity.prototype.move = function() {
    this.pos += this.v;
    return this.body.position = this.pos;
  };

  Entity.prototype.rotate = function() {};

  Entity.prototype.kill = function() {
    this.body.remove();
    return $(window).trigger(this.type + '-death', this);
  };

  return Entity;

})();



},{"../globals.coffee":10}],4:[function(require,module,exports){
var Entity, GLOBALS, Laser,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

Entity = require('./Entity.coffee');

GLOBALS = require('../globals.coffee');

Laser = (function(superClass) {
  extend(Laser, superClass);

  function Laser(num, defender) {
    var vx, vy;
    this.num = num;
    this.defender = defender;
    this.damage = bind(this.damage, this);
    this.makeBody = bind(this.makeBody, this);
    this.reference = this.defender['arm' + this.num];
    this.from = this.reference.segments[0].point;
    this.to = this.reference.segments[1].point;
    vx = (this.to.x - this.from.x) / 2;
    vy = (this.to.y - this.from.y) / 2;
    Laser.__super__.constructor.call(this, GLOBALS.LASER_SIZE, this.reference.position.x, this.reference.position.y, vx, vy);
    this.primaryColor = '#23e96b';
    this.type = 'laser';
    this.magnitude = 15;
    this.maxVelocity = 8;
    this.makeBody();
  }

  Laser.prototype.makeBody = function() {
    this.pos.x = this.reference.position.x;
    this.pos.y = this.reference.position.y;
    return this.body = new Path.Line({
      from: [this.from.x, this.from.y],
      to: [this.to.x, this.to.y],
      strokeColor: this.primaryColor,
      strokeWidth: GLOBALS.DEFENDER_SIZE / 7
    });
  };

  Laser.prototype.damage = function(type) {
    if (type === 'true') {
      return this.alive = false;
    }
  };

  return Laser;

})(Entity);

module.exports = Laser;



},{"../globals.coffee":10,"./Entity.coffee":3}],5:[function(require,module,exports){
var GLOBALS, HealthUp, Powerup,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

Powerup = require('./Powerup.coffee');

GLOBALS = require('../../globals.coffee');

HealthUp = (function(superClass) {
  extend(HealthUp, superClass);

  function HealthUp(x, y) {
    this.makeBody = bind(this.makeBody, this);
    HealthUp.__super__.constructor.call(this, x, y);
    this.trigger = GLOBALS.DEFENDER_HEALTH_GAIN;
    this.args = {
      amount: 1
    };
    this.probability = GLOBALS.POWERUP.HEALTHUP.PROBABILITY;
  }

  HealthUp.prototype.makeBody = function() {
    return this.body = new PointText({
      point: [this.pos.x, this.pos.y],
      content: '♡',
      fillColor: '#f24e3f',
      fontFamily: 'Courier New',
      fontSize: 25
    });
  };

  return HealthUp;

})(Powerup);

module.exports = HealthUp;



},{"../../globals.coffee":10,"./Powerup.coffee":8}],6:[function(require,module,exports){
var GLOBALS, HealthUpDouble, Powerup,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

Powerup = require('./Powerup.coffee');

GLOBALS = require('../../globals.coffee');

HealthUpDouble = (function(superClass) {
  extend(HealthUpDouble, superClass);

  function HealthUpDouble(x, y) {
    this.makeBody = bind(this.makeBody, this);
    HealthUpDouble.__super__.constructor.call(this, x, y);
    this.trigger = GLOBALS.DEFENDER_HEALTH_GAIN;
    this.args = {
      amount: 2
    };
    this.probability = GLOBALS.POWERUP.HEALTHUPDOUBLE.PROBABILITY;
  }

  HealthUpDouble.prototype.makeBody = function() {
    this.heart1 = new PointText({
      point: [this.pos.x, this.pos.y],
      content: '♡',
      fillColor: '#f24e3f',
      fontFamily: 'Courier New',
      fontSize: 25
    });
    this.heart2 = new PointText({
      point: [this.pos.x + 7, this.pos.y - 7],
      content: '♡',
      fillColor: '#f24e3f',
      fontFamily: 'Courier New',
      fontSize: 25
    });
    return this.body = new Group([this.heart1, this.heart2]);
  };

  return HealthUpDouble;

})(Powerup);

module.exports = HealthUpDouble;



},{"../../globals.coffee":10,"./Powerup.coffee":8}],7:[function(require,module,exports){
var GLOBALS, InvulnerableUp, Powerup,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

Powerup = require('./Powerup.coffee');

GLOBALS = require('../../globals.coffee');

InvulnerableUp = (function(superClass) {
  extend(InvulnerableUp, superClass);

  function InvulnerableUp(x, y) {
    this.makeBody = bind(this.makeBody, this);
    InvulnerableUp.__super__.constructor.call(this, x, y);
    this.trigger = GLOBALS.DEFENDER_INVULNERABLE;
    this.args = {
      updates: 200
    };
    this.probability = GLOBALS.POWERUP.INVULNERABLEUP.PROBABILITY;
  }

  InvulnerableUp.prototype.makeBody = function() {
    return this.body = new PointText({
      point: [this.pos.x + 7, this.pos.y - 7],
      content: '★',
      fillColor: '#f1d317',
      fontFamily: 'Courier New',
      fontSize: 25
    });
  };

  return InvulnerableUp;

})(Powerup);

module.exports = InvulnerableUp;



},{"../../globals.coffee":10,"./Powerup.coffee":8}],8:[function(require,module,exports){
var Entity, GLOBALS, Powerup,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

Entity = require('../Entity.coffee');

GLOBALS = require('../../globals.coffee');

module.exports = Powerup = (function(superClass) {
  extend(Powerup, superClass);

  function Powerup(x, y) {
    this.damage = bind(this.damage, this);
    this.makeBody = bind(this.makeBody, this);
    Powerup.__super__.constructor.call(this, GLOBALS.POWERUP_SIZE, x, y, 0, 0);
    this.type = 'powerup';
    this.trigger = 'nothing';
    this.args = {};
    this.probability = 1;
    this.makeBody();
  }

  Powerup.prototype.makeBody = function() {
    return this.body = new PointText({
      point: [50, 50],
      content: 'P',
      fillColor: 'white',
      fontFamily: 'Courier New',
      fontSize: 25
    });
  };

  Powerup.prototype.damage = function(type) {
    if (type === 'laser' || type === 'defender') {
      $(window).trigger(this.trigger, this.args);
      return this.alive = false;
    }
  };

  return Powerup;

})(Entity);



},{"../../globals.coffee":10,"../Entity.coffee":3}],9:[function(require,module,exports){
var GameLevel, game;

GameLevel = require('./levels/GameLevel.coffee');

game = new GameLevel();



},{"./levels/GameLevel.coffee":11}],10:[function(require,module,exports){
module.exports = {
  ATTACKER_DEATH: 'attacker-death',
  MAX_HEALTH_GAIN: 'maxHealth-gain',
  DEFENDER_HEALTH_GAIN: 'defender-health-gain',
  DEFENDER_INVULNERABLE: 'defender-invulnerable',
  DEFENDER_DAMAGED: 'defender-damaged',
  FRICTION: 1,
  SPRING: 0.8,
  DEFENDER: {
    ACCEL: 0.07,
    MAX_VELOCITY: 3,
    COLOR_1: '#00b3ff',
    COLOR_2: '#23e96b',
    LAZAR_COOLDOWN: 100
  },
  ATTACKER: {
    COLOR_1: '#f24e3f',
    ACCEL: 0.05,
    MAX_VELOCITY: 1.5
  },
  POWERUP: {
    INVULNERABLEUP: {
      PROBABILITY: 8000
    },
    HEALTHUP: {
      PROBABILITY: 500
    },
    HEALTHUPDOUBLE: {
      PROBABILITY: 700
    }
  },
  DEFENDER_SIZE: $(window).width() / 50,
  ATTACKER_SIZE: $(window).width() / 50,
  LASER_SIZE: $(window).width() / 60,
  POWERUP_SIZE: $(window).width() / 65
};



},{}],11:[function(require,module,exports){
var Attacker, Defender, GLOBALS, GameLevel, HealthUp, HealthUpDouble, InvulnerableUp, Laser, Level,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

String.prototype.repeat = function(num) {
  return new Array(num + 1).join(this);
};

Defender = require('../entities/Defender.coffee');

Attacker = require('../entities/Attacker.coffee');

Laser = require('../entities/Laser.coffee');

HealthUp = require('../entities/powerups/HealthUp.coffee');

HealthUpDouble = require('../entities/powerups/HealthUpDouble.coffee');

InvulnerableUp = require('../entities/powerups/InvulnerableUp.coffee');

Level = require('./Level.coffee');

GLOBALS = require('../globals.coffee');

module.exports = GameLevel = (function(superClass) {
  extend(GameLevel, superClass);

  function GameLevel() {
    this.keepInBounds = bind(this.keepInBounds, this);
    this.checkCollisions = bind(this.checkCollisions, this);
    this.fireMahLazarz = bind(this.fireMahLazarz, this);
    this.spawnAttacker = bind(this.spawnAttacker, this);
    this.animateScoreBar = bind(this.animateScoreBar, this);
    this.animateHealthBar = bind(this.animateHealthBar, this);
    this.updateRandomSpawns = bind(this.updateRandomSpawns, this);
    this.updateScoreBar = bind(this.updateScoreBar, this);
    this.updateHealthBar = bind(this.updateHealthBar, this);
    this.updateAttackerAmount = bind(this.updateAttackerAmount, this);
    this.handleInput = bind(this.handleInput, this);
    this.makeBindings = bind(this.makeBindings, this);
    this.makeEntities = bind(this.makeEntities, this);
    this.mainloop = bind(this.mainloop, this);
    GameLevel.__super__.constructor.call(this, {
      autostart: false,
      difficulty: 3
    });
    this.healthFull = $('#healthContainer');
    this.healthBar = $('#health');
    this.injuryBar = $('#injury');
    this.scoreBar = $('#score');
    this.countdownText = $('#countdownText');
    this.makeEntities();
    this.makeBindings();
    this.powerups = {
      healthUp: {
        object: HealthUp,
        probability: GLOBALS.POWERUP.HEALTHUP.PROBABILITY
      },
      healthUpDouble: {
        object: HealthUpDouble,
        probability: GLOBALS.POWERUP.HEALTHUPDOUBLE.PROBABILITY
      },
      invulnerableUp: {
        object: InvulnerableUp,
        probability: GLOBALS.POWERUP.INVULNERABLEUP.PROBABILITY
      }
    };
    setTimeout((function(_this) {
      return function() {
        _this.countdownText.text('');
        return setTimeout(_this.mainloop, 1 / 30);
      };
    })(this), 750);
  }

  GameLevel.prototype.mainloop = function() {
    GameLevel.__super__.mainloop.call(this);
    if (this.running) {
      this.handleInput();
      this.updateEntities();
      this.checkCollisions();
      this.keepInBounds();
      this.updateRandomSpawns();
      this.updateScoreBar();
      this.updateHealthBar();
      this.updateAttackerAmount();
      return view.draw();
    }
  };

  GameLevel.prototype.makeEntities = function() {
    var i, j, ref, results;
    this.defender = new Defender(view.center.x, view.center.y);
    this.entities.push(this.defender);
    results = [];
    for (i = j = 0, ref = this.ATTACKER_AMOUNT; j <= ref; i = j += 1) {
      this.numAttackers++;
      results.push(this.entities.push(new Attacker(GLOBALS.ATTACKER_SIZE, view.center.x + _.random(-500, 500), view.center.y + _.random(-500, 500), this.defender)));
    }
    return results;
  };

  GameLevel.prototype.makeBindings = function() {
    $(window).on('attacker-death', (function(_this) {
      return function(event, entity) {
        _this.spawnAttacker();
        return _this.animateScoreBar();
      };
    })(this));
    return $(window).on(GLOBALS.MAX_HEALTH_GAIN, (function(_this) {
      return function() {
        return _this.animateHealthBar();
      };
    })(this));
  };

  GameLevel.prototype.makeStars = function() {
    var i, j, ref, results, starLayer;
    starLayer = new Layer({
      strokeColor: 'white',
      strokeWidth: 3,
      position: view.center
    });
    results = [];
    for (i = j = 0, ref = $(window).width() / 3; j <= ref; i = j += 1) {
      results.push(starLayer.children.push(new Path.Circle({
        radius: _.random(5, 5),
        point: _.random($(window).width(), $(window).height()),
        strokeColor: 'white',
        strokeWidth: 3
      })));
    }
    return results;
  };

  GameLevel.prototype.handleInput = function() {
    if (Key.isDown('a' || Key.isDown('left'))) {
      this.defender.v.x -= this.defender.accel;
    }
    if (Key.isDown('w' || Key.isDown('up'))) {
      this.defender.v.y -= this.defender.accel;
    }
    if (Key.isDown('d' || Key.isDown('right'))) {
      this.defender.v.x += this.defender.accel;
    }
    if (Key.isDown('s' || Key.isDown('down'))) {
      this.defender.v.y += this.defender.accel;
    }
    if (Key.isDown('shift')) {
      console.log('shiftaki');
    }
    if (Key.isDown('space')) {
      if (this.defender.canFireMahLazarz()) {
        this.fireMahLazarz();
      }
    }
    if (Key.isDown('escape')) {
      return this.defender.v = new Point(0, 0);
    }
  };

  GameLevel.prototype.updateAttackerAmount = function() {
    if (this.numAttackers < this.ATTACKER_AMOUNT) {
      return this.spawnAttacker();
    }
  };

  GameLevel.prototype.updateHealthBar = function() {
    if (this.defender.health >= 0) {
      this.healthBar.text('♡'.repeat(this.defender.health));
      return this.injuryBar.text('♡'.repeat(this.defender.healthMax - this.defender.health));
    }
  };

  GameLevel.prototype.updateScoreBar = function() {
    return this.scoreBar.text(this.defender.score);
  };

  GameLevel.prototype.updateRandomSpawns = function() {
    var name, powerup, ref, results;
    ref = this.powerups;
    results = [];
    for (name in ref) {
      powerup = ref[name];
      if (_.random(powerup.probability) === 1) {
        results.push(this.entities.push(new powerup.object(view.center.x + _.random(-500, 500), view.center.y + _.random(-500, 500))));
      } else {
        results.push(void 0);
      }
    }
    return results;
  };

  GameLevel.prototype.animateHealthBar = function() {
    var animation, animationEnd;
    animation = 'animated rubberBand';
    animationEnd = 'webkitAnimationEnd mozAnimationEnd' + 'MSAnimationEnd oanimationend animationend';
    this.healthBar.addClass(animation);
    this.injuryBar.addClass(animation);
    return this.healthBar.one(animationEnd, function() {
      $(this).removeClass(animation);
      return $('#injury').removeClass(animation);
    });
  };

  GameLevel.prototype.animateScoreBar = function() {
    var animation, animationEnd;
    animation = 'animated rubberBand';
    animationEnd = 'webkitAnimationEnd mozAnimationEnd MSAnimationEnd' + 'oanimationend animationend';
    this.scoreBar.addClass(animation);
    return this.scoreBar.one(animationEnd, function() {
      return $(this).removeClass(animation);
    });
  };

  GameLevel.prototype.spawnAttacker = function() {
    return this.entities.push(new Attacker(GLOBALS.ATTACKER_SIZE, view.center.x + _.random(-500, 500), view.center.y + _.random(-500, 500), this.defender));
  };

  GameLevel.prototype.fireMahLazarz = function() {
    var entity, i, j, k, len, ref, results;
    this.defender.timeSinceLazar = 0;
    ref = this.entities;
    for (j = 0, len = ref.length; j < len; j++) {
      entity = ref[j];
      if (entity.type === 'laser') {
        this.kill(entity);
      }
    }
    results = [];
    for (i = k = 0; k < 4; i = k += 1) {
      results.push(this.entities.push(new Laser(i, this.defender)));
    }
    return results;
  };

  GameLevel.prototype.checkCollisions = function(index) {
    var e, j, ref, ref1, type1, type2;
    if (index == null) {
      index = 0;
    }
    for (e = j = ref = index + 1, ref1 = this.entities.length; j < ref1; e = j += 1) {
      if (this.entities[index].pos.getDistance(this.entities[e].pos) <= this.entities[index].size + this.entities[e].size) {
        this.collide(this.entities[e], this.entities[index]);
        type1 = this.entities[e].type;
        type2 = this.entities[index].type;
        this.entities[e].damage(type2);
        this.entities[index].damage(type1);
      }
    }
    if (index + 1 < this.entities.length) {
      return this.checkCollisions(index + 1);
    }
  };

  GameLevel.prototype.collide = function(e1, e2) {
    var angle1, angle2, ax1, ax2, ay1, ay2, dx1, dx2, dy1, dy2, minDist1, minDist2, targetX1, targetX2, targetY1, targetY2;
    dx1 = e1.pos.x - e2.pos.x;
    dy1 = e1.pos.y - e2.pos.y;
    angle1 = Math.atan2(dy1, dx1);
    minDist1 = e1.size + e2.size;
    targetX1 = e1.pos.x + Math.cos(angle1) * minDist1;
    targetY1 = e2.pos.y + Math.sin(angle1) * minDist1;
    ax1 = (targetX1 - e2.pos.x) * GLOBALS.SPRING / 50;
    ay1 = (targetY1 - e2.pos.y) * GLOBALS.SPRING / 50;
    dx2 = e2.pos.x - e1.pos.x;
    dy2 = e2.pos.y - e1.pos.y;
    angle2 = Math.atan2(dy2, dx2);
    minDist2 = e1.size + e2.size;
    targetX2 = e2.pos.x + Math.cos(angle2) * minDist2;
    targetY2 = e1.pos.y + Math.sin(angle2) * minDist2;
    ax2 = (targetX2 - e1.pos.x) * GLOBALS.SPRING / 50;
    ay2 = (targetY2 - e1.pos.y) * GLOBALS.SPRING / 50;
    e1.v += new Point(ax1, ay1);
    return e2.v += new Point(ax2, ay2);
  };

  GameLevel.prototype.keepInBounds = function() {
    var entity, j, len, ref, results;
    ref = this.entities;
    results = [];
    for (j = 0, len = ref.length; j < len; j++) {
      entity = ref[j];
      if (entity.pos.x < entity.size) {
        entity.v *= new Point(-GLOBALS.SPRING, GLOBALS.SPRING);
        entity.pos.x = entity.size;
        if (entity.type === 'laser') {
          this.kill(entity);
        }
      }
      if (entity.pos.y < entity.size) {
        entity.v *= new Point(GLOBALS.SPRING, -GLOBALS.SPRING);
        entity.pos.y = entity.size;
        if (entity.type === 'laser') {
          this.kill(entity);
        }
      }
      if (entity.pos.x > view.bounds.width - entity.size) {
        entity.v *= new Point(-GLOBALS.SPRING, GLOBALS.SPRING);
        entity.pos.x = view.bounds.width - entity.size;
        if (entity.type === 'laser') {
          this.kill(entity);
        }
      }
      if (entity.pos.y > view.bounds.height - entity.size) {
        entity.v *= new Point(GLOBALS.SPRING, -GLOBALS.SPRING);
        entity.pos.y = view.bounds.height - entity.size;
        if (entity.type === 'laser') {
          results.push(this.kill(entity));
        } else {
          results.push(void 0);
        }
      } else {
        results.push(void 0);
      }
    }
    return results;
  };

  return GameLevel;

})(Level);



},{"../entities/Attacker.coffee":1,"../entities/Defender.coffee":2,"../entities/Laser.coffee":4,"../entities/powerups/HealthUp.coffee":5,"../entities/powerups/HealthUpDouble.coffee":6,"../entities/powerups/InvulnerableUp.coffee":7,"../globals.coffee":10,"./Level.coffee":12}],12:[function(require,module,exports){
var GLOBALS, Level,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

GLOBALS = require('../globals.coffee');

module.exports = Level = (function() {
  function Level(args) {
    this.garbageCollect = bind(this.garbageCollect, this);
    this.updateEntities = bind(this.updateEntities, this);
    this.mainloop = bind(this.mainloop, this);
    this.entities = [];
    this.difficulty = args.difficulty || 0;
    this.ATTACKER_AMOUNT = this.difficulty;
    this.numAttackers = 0;
    if (args.autostart) {
      this.mainloop();
    }
    this.running = true;
  }

  Level.prototype.mainloop = function() {
    setTimeout(this.mainloop, 1 / 60);
    if (Key.isDown('x')) {
      this.running = !this.running;
      return;
    }
    if (!this.running) {
      return;
    }
    return this.garbageCollect();
  };

  Level.prototype.kill = function(entity) {
    return entity.alive = false;
  };

  Level.prototype.updateEntities = function() {
    var entity, i, len, ref, results;
    ref = this.entities;
    results = [];
    for (i = 0, len = ref.length; i < len; i++) {
      entity = ref[i];
      results.push(entity.update());
    }
    return results;
  };

  Level.prototype.garbageCollect = function() {
    var entity, i, index, len, ref, results;
    ref = this.entities;
    results = [];
    for (i = 0, len = ref.length; i < len; i++) {
      entity = ref[i];
      if (entity && entity.alive === false) {
        entity.kill();
        index = this.entities.indexOf(entity);
        if (index > -1) {
          results.push(this.entities.splice(index, 1));
        } else {
          results.push(void 0);
        }
      } else {
        results.push(void 0);
      }
    }
    return results;
  };

  return Level;

})();



},{"../globals.coffee":10}]},{},[9]);
