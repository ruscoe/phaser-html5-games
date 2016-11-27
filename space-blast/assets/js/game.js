/*
  Space Blast by Dan Ruscoe.
  Twitter: @danruscoe
  http://danruscoe.com
*/

var Game = {

  cursorKeys: null,
  activeGame: false,
  activePlayer: true,
  score: 0,
  scoreText: null,
  directionText: null,
  directionArrowLeft: null,
  directionArrowRight: null,
  background: null,
  player: null,
  rocketLauncher: null,
  asteroids: null,
  enemies: null,
  enemyEmitter: null,
  playerEmitter: null,
  centerX: 0,
  lastAsteroidSpawnTime: 0,
  asteroidSpawnDelayTime: 1000,
  lastEnemySpawnTime: 0,
  enemySpawnDelayTime: 750,
  enemyPoints: 10,
  playerSpeed: 4,
  enemyHitSound: null,
  playerHitSound: null,

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

    // Load player images.
    game.load.image('ship', assetPath + '/images/ship.png');
    game.load.image('rocket', assetPath + '/images/rocket.png');

    // Load enemy images.
    game.load.image('asteroid', assetPath + '/images/asteroid.png');
    game.load.image('enemy01', assetPath + '/images/enemy01.png');
    game.load.image('enemy02', assetPath + '/images/enemy02.png');
    game.load.image('enemy03', assetPath + '/images/enemy03.png');
    game.load.image('enemy04', assetPath + '/images/enemy04.png');

    // Load destruction particle images from enemy / player images.
    game.load.spritesheet('enemy_particle', assetPath +
      '/images/enemy01.png', 8, 8, 2);
    game.load.spritesheet('ship_particle', assetPath + '/images/ship.png',
      8, 8, 3);
  },

  /**
   * Create game state.
   */
  create: function() {
    // Set up keyboard input.
    this.cursorKeys = game.input.keyboard.createCursorKeys();

    // Define screen center.
    this.centerX = (game.world.width / 2);

    // Create scrolling background.
    this.background = game.add.tileSprite(0, 0, 320, 480, 'background');

    // Create player image.
    this.player = game.add.sprite(0, 0, 'ship');
    this.player.x = (this.centerX - (this.player.width / 2));
    this.player.y = (game.world.height - (this.player.height + 20));

    // Enable game physics.
    game.physics.startSystem(Phaser.Physics.ARCADE);
    game.physics.arcade.enable(this.player);

    this.player.body.collideWorldBounds = true;

    // Create player weapon.
    this.rocketLauncher = game.add.weapon(10, 'rocket');
    this.rocketLauncher.bulletKillType = Phaser.Weapon.KILL_WORLD_BOUNDS;
    this.rocketLauncher.bulletSpeed = 250;
    this.rocketLauncher.fireRate = 225;

    this.rocketLauncher.trackSprite(this.player, 20, -10);

    // Create storage for asteroids.
    this.asteroids = game.add.group();
    this.asteroids.enableBody = true;
    this.asteroids.physicsBodyType = Phaser.Physics.ARCADE;
    this.asteroids.setAll('checkWorldBounds', true);
    this.asteroids.setAll('outOfBoundsKill', true);

    // Create storage for enemies.
    this.enemies = game.add.group();
    this.enemies.enableBody = true;
    this.enemies.physicsBodyType = Phaser.Physics.ARCADE;
    this.enemies.setAll('checkWorldBounds', true);
    this.enemies.setAll('outOfBoundsKill', true);

    // Create enemy destruction particle emitter.
    this.enemyEmitter = game.add.emitter(0, 0, 80);
    this.enemyEmitter.makeParticles('enemy_particle', 1);
    this.enemyEmitter.minParticleSpeed.setTo(-200, -200);
    this.enemyEmitter.maxParticleSpeed.setTo(200, 200);
    this.enemyEmitter.gravity = 0;
    this.enemyEmitter.setRotation(0, 0);

    // Create player destruction particle emitter.
    this.playerEmitter = game.add.emitter(0, 0, 20);
    this.playerEmitter.makeParticles('ship_particle', 2);
    this.playerEmitter.minParticleSpeed.setTo(-200, -200);
    this.playerEmitter.maxParticleSpeed.setTo(200, 200);
    this.playerEmitter.gravity = 0;
    this.playerEmitter.setRotation(0, 0);

    // Create sound effects.
    this.enemyHitSound = game.add.audio('enemy_hit');
    this.playerHitSound = game.add.audio('player_hit');

    // Set default score value.
    this.score = 0;

    // Add score indicator.
    this.scoreText = game.add.text(0, 10, this.score, {
      font: 'bold 24px Exo 2',
      stroke: '#000000',
      strokeThickness: 3,
      fill: '#FFFFFF',
      boundsAlignH: 'center',
      boundsAlignV: 'middle'
    });
    this.scoreText.setTextBounds(0, 0, game.world.width, 20);

    // Add direction arrows (controls.)
    this.directionArrowLeft = game.add.sprite(0, 0, 'direction_arrow');
    this.directionArrowLeft.anchor.setTo(0.5, 0.5);
    this.directionArrowLeft.x = (game.world.width / 4);
    this.directionArrowLeft.y = (game.world.height / 2);

    this.directionArrowRight = game.add.sprite(0, 0, 'direction_arrow');
    this.directionArrowRight.anchor.setTo(0.5, 0.5);
    this.directionArrowRight.scale.x = -1;
    this.directionArrowRight.x = (game.world.width - (game.world.width / 4));
    this.directionArrowRight.y = (game.world.height / 2);

    // Set player state to active.
    this.activePlayer = true;
  },

  /**
   * Game update loop.
   */
  update: function() {
    // Scroll background continuously.
    this.background.tilePosition.y += 2;

    if (this.activePlayer) {
      // Fire rockets continuously.
      this.rocketLauncher.fire();
      // Read input from keyboard or mouse cursorand update player position.
      if (this.cursorKeys.left.isDown || (game.input.activePointer.isDown &&
          game.input.activePointer.x < this.centerX)) {
        this.moveLeft();
      } else if (this.cursorKeys.right.isDown || (game.input.activePointer.isDown &&
          game.input.activePointer.x > this.centerX)) {
        this.moveRight();
      }
    }

    if (this.activeGame) {
      // Spawn enemy if spawn delay tiume has elapsed.
      if ((game.time.now - this.lastEnemySpawnTime) >= this.enemySpawnDelayTime) {
        this.spawnEnemy();
        this.lastEnemySpawnTime = game.time.now;
      }

      // Spawn asteroid if spawn delay tiume has elapsed.
      if ((game.time.now - this.lastAsteroidSpawnTime) >=
        this.asteroidSpawnDelayTime) {
        this.spawnAsteroid();
        this.lastAsteroidSpawnTime = game.time.now;
      }
    }

    // Handle collision between bullet and enemy - Enemy is destroyed.
    game.physics.arcade.overlap(this.rocketLauncher.bullets, this.enemies,
      this.destroyEnemy, null, this);

    // Handle collision between asteroid and player - Player is destroyed.
    game.physics.arcade.overlap(this.player, this.asteroids, this.destroyPlayer,
      null, this);

    // Handle collision between enemy and player - Player is destroyed.
    game.physics.arcade.overlap(this.player, this.enemies, this.destroyPlayer,
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
   * Move player left.
   */
  moveLeft: function() {
    this.startGame();
    this.player.x -= this.playerSpeed;
  },

  /**
   * Move player right.
   */
  moveRight: function() {
    this.startGame();
    this.player.x += this.playerSpeed;
  },

  /**
   * Spawn an asteroid at a random location.
   */
  spawnAsteroid: function() {
    asteroid = this.asteroids.getFirstDead(true, 0, 0, 'asteroid');

    if (asteroid) {
      asteroid.anchor.setTo(0.5, 0.5);
      asteroid.reset(game.rnd.integerInRange(0, (game.world.width - (
        asteroid.width + 10))), -asteroid.height);
      asteroid.body.velocity.y = 200;
      asteroid.body.angularVelocity = 50;
    }
  },

  /**
   * Spawn an enemy at a random location.
   */
  spawnEnemy: function() {
    // Spawn a random enemy. Four to choose from:
    // enemy01 - enemy04.
    enemy = this.enemies.getFirstDead(true, 0, 0, 'enemy0' + game.rnd.integerInRange(
      1, 4));

    if (enemy) {
      enemy.reset(game.rnd.integerInRange(0, (game.world.width - (enemy.width +
        10))), -enemy.height);
      enemy.body.velocity.y = 200;
    }
  },

  /**
   * Destroy an enemy.
   */
  destroyEnemy: function(rocket, enemy) {
    // Player enemy hit sound.
    this.enemyHitSound.play();

    // Trigger destruction particle emitter.
    this.enemyEmitter.x = enemy.x;
    this.enemyEmitter.y = enemy.y;
    this.enemyEmitter.start(true, 300, null, 20);

    // Remove enemy.
    rocket.kill();
    enemy.kill();

    // Increment score.
    this.score += this.enemyPoints;
    this.scoreText.text = this.score;
  },

  /**
   * Destroy the player.
   */
  destroyPlayer: function(player, enemy) {
    // Play player hit sound.
    this.playerHitSound.play();

    // Trigger destruction particle emitter.
    this.playerEmitter.x = player.x;
    this.playerEmitter.y = player.y;
    this.playerEmitter.start(true, 300, null, 20);

    // Remove player.
    this.activePlayer = false;
    this.activeGame = false;
    player.kill();

    // Start game over state after short delay.
    this.game.time.events.add(800, this.gameOver, this);
  },

  /**
   * Start game over state.
   */
  gameOver: function() {
    this.state.start('GameOver');
  }

};
