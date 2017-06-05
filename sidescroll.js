(function() {

  Number.prototype.toFixedDown = function(digits) {
    var re = new RegExp("(\\d+\\.\\d{" + digits + "})(\\d)"),
        m = this.toString().match(re);
    console.log(m);
    return m ? parseFloat(m[1]) : this.valueOf();
  };

  Number.prototype.increaseDecimal = function() {
    var re = new RegExp("(\\d+)(\\.)(\\d)"),
        m = this.toString().match(re);
    if (m) {
      if (m[3] === "9") {
        return parseFloat((parseInt(m[1]) + 1).toString() + ".0");
      }
      return parseFloat(m[1] + m[2] + (parseInt(m[3]) + 1).toString());
    }
    return parseFloat(this.valueOf().toString() + ".1");
  }

  Number.prototype.decreaseDecimal = function() {
    var re = new RegExp("(\\d+)(\\.)(\\d)"),
        m = this.toString().match(re);
    if (m) {
      return parseFloat(m[1] + m[2] + (parseInt(m[3]) - 1).toString());
    }
    return parseFloat((this.valueOf() - 1).toString() + ".9");
  }

  Number.prototype.getDecimal = function() {
    var re = new RegExp("(\\d+)(\\.)(\\d)"),
        m = this.toString().match(re);
    return m ? parseInt(m[3]) : 0;
  }

  Game_CharacterBase.prototype.updateGravity = function() {
    if (this._gravity && !$gameMap.isEventRunning()) {
      var thisx = this._x;
      var thisy = this._y;
      var left = Input.isPressed('left');
      var right = Input.isPressed('right');
      var up = Input.isPressed('up');
      if (this._gravityJumping > 0) {
        if (!up) this._gravityJumping = 0;
        if (left && !right) {
          this.gravityJump(4);
        } else if (!left && right) {
          this.gravityJump(6);
        } else {
          this.gravityJump();
        }
        this._gravityJumping--;
      } else {
        if (left && !right) {
          this.gravityFall(4);
        } else if (!left && right) {
          this.gravityFall(6);
        } else {
          this.gravityFall();
        }
      }
    }
  }

  var _Game_CharacterBase_setPosition = Game_CharacterBase.prototype.setPosition;
  Game_CharacterBase.prototype.setPosition = function(x, y) {
      this._x = x;
      this._y = y;
      this._realX = x;
      this._realY = y;
  };


  var _Game_CharacterBase_update = Game_CharacterBase.prototype.update;
  Game_CharacterBase.prototype.update = function() {
    _Game_CharacterBase_update.call(this);
    this.updateGravity();
  }

  var _Game_CharacterBase_initMembers = Game_CharacterBase.prototype.initMembers;
  Game_CharacterBase.prototype.initMembers = function() {
    _Game_CharacterBase_initMembers.call(this);
    this._gravity = false;
  }

  var _Game_Player_initMembers = Game_Player.prototype.initMembers;
  Game_Player.prototype.initMembers = function() {
    _Game_Player_initMembers.call(this);
    this._gravity = true;
    this._gravityJumping = 0;
  }

  Game_CharacterBase.prototype.stepStraight = function(d) {
    this.setMovementSuccess(this.canPass(this._x, this._y, d));
    if (this.isMovementSucceeded()) {
        this.setDirection(d);
        this._x = $gameMap.roundXStep(this._x, d);
        this._y = $gameMap.roundYStep(this._y, d);
        this._realX = $gameMap.xStep(this._x, this.reverseDir(d));
        this._realY = $gameMap.yStep(this._y, this.reverseDir(d));
        this.increaseSteps();
    } else {
        this.setDirection(d);
        this.checkEventTriggerTouchFront(d);
    }
  }

  Game_CharacterBase.prototype.gravityFall = function(horz) {
    var dec = this._x.getDecimal();
    if (dec === 0) {
      this.setMovementSuccess(this.canPass(this._x, this._y, 2));
    } else {
      this.setMovementSuccess(this.canPass(this._x, this._y, 2) && this.canPass(this._x + 1, this._y, 2));
    }
    if (this.isMovementSucceeded()) {
        this._y = $gameMap.roundYStep(this._y, 2);
        this._realY = $gameMap.yStep(this._y, this.reverseDir(2));
        if (horz) {
          this.setDirection(horz);
          var sideMovementSuccess = this.canPass(this._x, this._y, horz) && this.canPass(this._x, this._y + 1, horz);
          if (sideMovementSuccess) {
            this._x = $gameMap.roundXStep(this._x, horz);
            this._realX = $gameMap.xStep(this._x, this.reverseDir(horz));
          } else {
            this.checkEventTriggerTouchFront(horz);
          }
        }
        this.increaseSteps();
        this.checkEventTriggerTouch(Math.floor(this._x), Math.floor(this._y));
    } else {
        this.checkEventTriggerTouchFront(2);
    }
  }

  Game_CharacterBase.prototype.gravityJump = function(horz) {
    var dec = this._x.getDecimal();
    if (dec === 0) {
      this.setMovementSuccess(this.canPass(this._x, this._y, 8));
    } else {
      this.setMovementSuccess(this.canPass(this._x, this._y, 8)) && this.setMovementSuccess(this.canPass(this._x + 1, this._y, 8));
    }
    if (this.isMovementSucceeded()) {
        this._y = $gameMap.roundYStep(this._y, 8);
        this._realY = $gameMap.yStep(this._y, this.reverseDir(8));
        if (horz) {
          this.setDirection(horz);
          var sideMovementSuccess = this.canPass(this._x, this._y, horz) && this.canPass(this._x, this._y + 1, horz);
          if (sideMovementSuccess) {
            this._x = $gameMap.roundXStep(this._x, horz);
            this._realX = $gameMap.xStep(this._x, this.reverseDir(horz));
          } else {
            this.checkEventTriggerTouchFront(horz);
          }
        }
        this.increaseSteps();
        this._gravityJumping--;
        this.checkEventTriggerTouch(Math.floor(this._x), Math.floor(this._y));
    } else {
        this.checkEventTriggerTouchFront(8);
        this._gravityJumping = 0;
    }
  }

  var _Game_CharacterBase_canPass = Game_CharacterBase.prototype.canPass;
  Game_CharacterBase.prototype.canPass = function(x, y, d) {
      var x1 = Math.floor(x), y1 = Math.floor(y);
      var x2 = $gameMap.xWithDirection(x1, d);
      var y2 = $gameMap.yWithDirection(y1, d);
      if (!$gameMap.isValid(x2, y2) && !((d === 4 && x !== x1) || (d === 8 && y !== y1))) {
        return false;
      }
      if (this.isThrough() || this.isDebugThrough()) {
        return true;
      }
      if ((d === 4 && x !== x1) || (d === 8 && y != y1)){
        return true;
      }
      if (!this.isMapPassable(x1, y1, d)) {
        return false;
      }
      if (this.isCollidedWithCharacters(x2, y2)) {
        return false;
      }
      return true;
  };

  Game_Map.prototype.xStep = function(x, d) {
    return d === 6 ? x.increaseDecimal() : d === 4 ? x.decreaseDecimal() : x;
  };

  Game_Map.prototype.yStep = function(y, d) {
    return d === 2 ? y.increaseDecimal() : d === 8 ? y.decreaseDecimal() : y;
  };

  Game_Map.prototype.roundXStep = function(x, d) {
    return this.roundX(d === 6 ? x.increaseDecimal() : d === 4 ? x.decreaseDecimal() : x);
  };

  Game_Map.prototype.roundYStep = function(y, d) {
    return this.roundY(d === 2 ? y.increaseDecimal() : d === 8 ? y.decreaseDecimal() : y);
  };

  var _Game_Player_moveByInput = Game_Player.prototype.moveByInput;
  Game_Player.prototype.moveByInput = function() {
      if (!this.isMoving() && this.canMove()) {
          var direction = this.getInputDirection();
          if (direction > 0) {
              $gameTemp.clearDestination();
          } else if ($gameTemp.isDestinationValid()){
              var x = $gameTemp.destinationX();
              var y = $gameTemp.destinationY();
              direction = this.findDirectionTo(x, y);
          }
          if (direction === 8) {
            this._gravityJumping = 120;
          } else if (direction > 0 && direction < 8) {
              this.executeMove(direction);
          }
      }
  };

  var _Game_Player_executeMove = Game_Player.prototype.executeMove;
  Game_Player.prototype.executeMove = function(direction) {
      this.stepStraight(direction);
  };


})();
