/*
  Stabby Skeleton by Dan Ruscoe.
  Twitter: @danruscoe
  Web: http://danruscoe.com
*/

var Menu = {

  /**
   * Preload assets.
   */
  preload: function() {
    game.load.image('background', assetPath + '/images/background.png');
    game.load.image('logo', assetPath + '/images/logo.png');
    game.load.image('player', assetPath + '/images/player_stand.png');
    game.load.image('play_button', assetPath + '/images/play_button.png');
  },

  /**
   * Create game state.
   */
  create: function() {
    game.add.sprite(0, 0, 'background');

    var logo = game.add.sprite(0, 0, 'logo');
    logo.anchor.setTo(0.5, 0);
    logo.x = (game.world.width / 2);
    logo.y = (game.world.height / 8);

    var player = game.add.sprite(0, 0, 'player');
    player.anchor.setTo(0.5, 0.5);
    player.x = (game.world.width / 2);
    player.y = (game.world.height / 2) + 10;

    var playButton = game.add.button(0, 0, 'play_button', this.startGame,
      this);
    playButton.anchor.setTo(0.5, 0.5);
    playButton.x = (game.world.width / 2);
    playButton.y = (game.world.height - (playButton.height * 1.5));
  },

  /**
   * Start the game state.
   */
  startGame: function() {
    this.state.start('Game');
  }

};
