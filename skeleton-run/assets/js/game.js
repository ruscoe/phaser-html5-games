/*
  Stabby Skeleton by Dan Ruscoe.
  Twitter: @danruscoe
  Web: http://danruscoe.com
*/

var Game = {

  cursorKeys: null,
  activeGame: false,
  activePlayer: true,
  level: 1,
  levelText: null,
  enemiesKilled: 0,
  directionText: null,
  directionArrowLeft: null,
  directionArrowRight: null,
  background: null,
  player: null,
  playerAttackLeft: null,
  playerAttackRight: null,
  enemies: null,
  emitter: null,
  centerX: 0,
  centerY: 0,
  lastEnemySpawnTime: 0,
  enemySpawnDelayTime: 750,
  enemyPoints: 10,
  minEnemySpeed: 200,
  maxEnemySpeed: 400,
  currentEnemySpeed: 0,
  enemySpeedIncrementPerLevel: 10,
  killsPerLevel: 10,
  enemyHitSound: null,
  playerHitSound: null,
  playerAttackState: -1,
  enemyYOffsetRange: 15,

  /**
   * Preload assets.
   */
  preload: function() {
    // Load sound effects.
    game.load.audio('enemy_hit', assetPath + '/audio/enemy_hit.mp3');
    game.load.audio('player_hit', assetPath + '/audio/player_hit.mp3');

    // Load direction, background images.
    game.load.image('direction_arrow', assetPath +
      '/images/direction_arrow.png');
    game.load.image('background', assetPath + '/images/background.png');

    // Load enemy images.
    game.load.image('enemy_left', assetPath + '/images/enemy_left.png');
    game.load.image('enemy_right', assetPath + '/images/enemy_right.png');

    // Load player state spritesheets.
    game.load.spritesheet('player_idle',
      assetPath + '/images/player_idle_sprites.png', 44, 77, 2);
    game.load.spritesheet('player_attack_left', assetPath +
      '/images/player_attack_left_sprites.png', 74, 77, 2);
    game.load.spritesheet('player_attack_right', assetPath +
      '/images/player_attack_right_sprites.png', 74, 77, 2);

    // Load destruction particle image from player image.
    game.load.spritesheet('particle', assetPath +
      '/images/player_stand.png', 8, 8, 3);
  },

  /**
   * Create game state.
   */
  create: function() {
    // Set up keyboard input.
    this.cursorKeys = game.input.keyboard.createCursorKeys();

    // Define screen center.
    this.centerX = (game.world.width / 2);
    this.centerY = (game.world.height / 2);

    // Create scrolling background.
    this.background = game.add.tileSprite(0, 0, 320, 480, 'background');

    // Create player image.
    this.player = game.add.sprite(0, 0, 'player_idle');
    this.player.anchor.setTo(0.5, 0.5);
    this.player.x = this.centerX;
    this.player.y = this.centerY + 10;

    // Add player animations.
    this.player.animations.add('walk');
    this.player.animations.play('walk', 4, true);

    // Create player attack left image.
    this.playerAttackLeft = game.add.sprite(0, 0, 'player_attack_left');
    this.playerAttackLeft.anchor.setTo(0.69, 0.5);
    this.playerAttackLeft.x = this.player.x;
    this.playerAttackLeft.y = this.player.y;

    // Add player attack left animations.
    this.playerAttackLeft.animations.add('walk');
    this.playerAttackLeft.animations.play('walk', 4, true);

    // Craete player attack right image.
    this.playerAttackRight = game.add.sprite(0, 0, 'player_attack_right');
    this.playerAttackRight.anchor.setTo(0.3, 0.5);
    this.playerAttackRight.x = this.player.x;
    this.playerAttackRight.y = this.player.y;

    // Add player attack right animations.
    this.playerAttackRight.animations.add('walk');
    this.playerAttackRight.animations.play('walk', 4, true);

    // Enable game physics.
    game.physics.startSystem(Phaser.Physics.ARCADE);
    game.physics.arcade.enable([this.player, this.playerAttackLeft, this.playerAttackRight]);

    // Create storage for enemies.
    this.enemies = game.add.group();
    this.enemies.enableBody = true;
    this.enemies.physicsBodyType = Phaser.Physics.ARCADE;

    // Create destruction particle emitter.
    this.emitter = game.add.emitter(0, 0, 80);
    this.emitter.makeParticles('particle', 2);
    this.emitter.minParticleSpeed.setTo(-150, -150);
    this.emitter.maxParticleSpeed.setTo(150, 150);
    this.emitter.minParticleScale = 1;
    this.emitter.maxParticleScale = 0.3;
    this.emitter.gravity = 0;
    this.emitter.setRotation(0, 0);

    // Create sound effects.
    this.enemyHitSound = game.add.audio('enemy_hit');
    this.playerHitSound = game.add.audio('player_hit');

    // Set default values.
    this.level = 1;
    this.enemiesKilled = 0;

    // Add level indicator.
    this.levelText = game.add.text(0, 10, 'Level ' + this.level, {
      font: 'bold 24px Exo 2',
      stroke: '#000000',
      strokeThickness: 3,
      fill: '#FFFFFF',
      boundsAlignH: 'center',
      boundsAlignV: 'middle'
    });
    this.levelText.setTextBounds(0, 0, game.world.width, 20);

    // Add direction arrows (controls.)
    this.directionArrowLeft = game.add.sprite(0, 0, 'direction_arrow');
    this.directionArrowLeft.anchor.setTo(0.5, 0.5);
    this.directionArrowLeft.x = (game.world.width / 4);
    this.directionArrowLeft.y = (game.world.height / 2);

    this.directionArrowRight = game.add.sprite(0, 0, 'direction_arrow');
    this.directionArrowRight.anchor.setTo(0.5, 0.5);
    this.directionArrowRight.scale.x = -1;
    this.directionArrowRight.x = (game.world.width - (game.world.width / 4));
    this.directionArrowRight.y = this.centerY;

    // Set enemy speed to minimum speed.
    this.currentEnemySpeed = this.minEnemySpeed;

    // Set player state to idle and start game.
    this.playerAttackState = -1;
    this.idle();
    this.activePlayer = true;
  },

  /**
   * Game update loop.
   */
  update: function() {
    // Scroll background continuously.
    this.background.tilePosition.x -= 2;

    if (this.activePlayer) {
      // Read input from keyboard or mouse cursor.
      if (this.cursorKeys.left.isDown || (game.input.activePointer.isDown &&
          game.input.activePointer.x < this.centerX)) {
        this.attackLeft();
      } else if (this.cursorKeys.right.isDown || (game.input.activePointer.isDown &&
          game.input.activePointer.x > this.centerX)) {
        this.attackRight();
      } else {
        this.idle();
      }
    }

    if (this.activeGame) {
      // Spawn enemies if spawn delay tiume has elapsed.
      if ((game.time.now - this.lastEnemySpawnTime) >= this.enemySpawnDelayTime) {
        this.spawnEnemy();
        this.lastEnemySpawnTime = game.time.now;
      }
    }

    // Handle collision between idle player and enemies - player destroyed.
    game.physics.arcade.overlap(this.player, this.enemies, this.destroyPlayer,
      null, this);

    // Handle collision between left-attack player and enemy - enemy destroyed.
    game.physics.arcade.overlap(this.playerAttackLeft, this.enemies, this.attackEnemyLeft,
      null, this);

    // Handle collision between right-attack player and enemy - enemy destroyed.
    game.physics.arcade.overlap(this.playerAttackRight, this.enemies, this.attackEnemyRight,
      null, this);
  },

  /**
   * Start the game state.
   */
  startGame: function() {
    if (!this.activeGame) {
      // Remove directions when game starts.
      this.directionArrowLeft.kill();
      this.directionArrowRight.kill();

      this.activeGame = true;
    }
  },

  /**
   * Enable left attack player state if not already enabled.
   */
  attackLeft: function() {
    // Start game if not already started.
    this.startGame();

    if (this.playerAttackState != 1) {
      this.resetPlayer();
      this.playerAttackLeft.visible = true;
      this.playerAttackLeft.body.enable = true;

      this.playerAttackState = 1;
    }
  },

  /**
   * Enable right attack player state if not already enabled.
   */
  attackRight: function() {
    // Start game if not already started.
    this.startGame();

    if (this.playerAttackState != 2) {
      this.resetPlayer();
      this.playerAttackRight.visible = true;
      this.playerAttackRight.body.enable = true;

      this.playerAttackState = 2;
    }
  },

  /**
   * Enable idle player state if not already enabled.
   */
  idle: function() {
    if (this.playerAttackState != 0) {
      this.resetPlayer();
      this.player.visible = true;
      this.player.body.enable = true;

      this.playerAttackState = 0;
    }
  },

  /**
   * Reset player state.
   */
  resetPlayer: function() {
    this.player.visible = false;
    this.player.body.enable = false;
    this.playerAttackLeft.visible = false;
    this.playerAttackLeft.body.enable = false;
    this.playerAttackRight.visible = false;
    this.playerAttackRight.body.enable = false;
  },

  /**
   * Spawn an enemy.
   */
  spawnEnemy: function() {
    if (game.rnd.integerInRange(0, 100) <= 50) {
      // Spawn enemy on right side of screen.
      enemy = this.enemies.getFirstDead(true, 0, 0, 'enemy_right');
      enemy.anchor.setTo(0.5, 0.5);
      // Set random vertical position.
      enemy.reset(-enemy.width, game.rnd.integerInRange((this.centerY -
        this.enemyYOffsetRange), this.centerY));
      // Set enemy speed to current speed.
      enemy.body.velocity.x = this.currentEnemySpeed;
    } else {
      // Spawn enemy on left side of screen.
      enemy = this.enemies.getFirstDead(true, 0, 0, 'enemy_left');
      enemy.anchor.setTo(0.5, 0.5);
      // Set random vertical position.
      enemy.reset((game.world.width + enemy.width), game.rnd.integerInRange(
        (this.centerY - this.enemyYOffsetRange), this.centerY));
      // Set enemy speed to current speed.
      enemy.body.velocity.x = -this.currentEnemySpeed;
    }
  },

  /**
   * Collision handler used when enemy meets player attacking left.
   */
  attackEnemyLeft: function(player, enemy) {
    // If enemy is left of player, enemy is destroyed.
    // Otherwise player is destroyed.
    if (enemy.x < player.x) {
      this.destroyEnemy(enemy);
    } else {
      this.destroyPlayer(player, enemy);
    }
  },

  /**
   * Collision handler used when enemy meets player attacking right.
   */
  attackEnemyRight: function(player, enemy) {
    // If enemy is right of player, enemy is destroyed.
    // Otherwise player is destroyed.
    if (enemy.x > player.x) {
      this.destroyEnemy(enemy);
    } else {
      this.destroyPlayer(player, enemy);
    }
  },

  /**
   * Destroy an enemy.
   */
  destroyEnemy: function(enemy) {
    this.enemyHitSound.play();

    // Trigger destruction particle emitter.
    this.emitter.x = enemy.x;
    this.emitter.y = enemy.y;
    this.emitter.start(true, 300, null, 20);

    // Remove enemy.
    enemy.kill();

    // Increment enemy kill count.
    this.enemiesKilled++;

    // Determine if the player has reached the next level.
    var newLevel = (1 + Math.floor(this.enemiesKilled / this.killsPerLevel));

    // If next level reached, increment level number and enemy speed.
    if (newLevel > this.level) {
      this.level = newLevel;

      this.levelText.text = 'Level ' + this.level;

      if (this.currentEnemySpeed < this.maxEnemySpeed) {
        this.currentEnemySpeed += this.enemySpeedIncrementPerLevel;
      }
    }
  },

  /**
   * Destroy the player.
   */
  destroyPlayer: function(player, enemy) {
    this.playerHitSound.play();

    // Trigger destruction particle emitter.
    this.emitter.x = player.x;
    this.emitter.y = player.y;
    this.emitter.start(true, 500, null, 30);

    // Remove player.
    this.activePlayer = false;
    this.activeGame = false;
    player.kill();

    // Start game over state after short delay.
    this.game.time.events.add(1000, this.gameOver, this);
  },

  /**
   * Start game over state.
   */
  gameOver: function() {
    this.state.start('GameOver');
  }

};
