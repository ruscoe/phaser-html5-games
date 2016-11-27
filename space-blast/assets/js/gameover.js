/*
  Space Blast by Dan Ruscoe.
  Twitter: @danruscoe
  http://danruscoe.com
*/

var GameOver = {

  /**
   * Preload assets.
   */
  preload: function() {
    game.load.image('background', assetPath + '/images/background.png');
    game.load.image('header', assetPath + '/images/game_over.png');
    game.load.image('play_button', assetPath + '/images/play_button.png');
  },

  /**
   * Create game state.
   */
  create: function() {
    game.add.sprite(0, 0, 'background');

    var header = game.add.sprite(0, 0, 'header');
    header.anchor.setTo(0.5, 0);
    header.x = (game.world.width / 2);
    header.y = (game.world.height / 12);

    var scoreText = game.add.text(0, ((game.world.height / 2) - (game.world
        .height / 24)),
      "Score: " +
      Game.score, {
        align: 'center',
        font: 'bold 28px Exo 2',
        stroke: '#000000',
        strokeThickness: 3,
        fill: '#FFFFFF',
        boundsAlignH: 'center',
        boundsAlignV: 'middle'
      });

    scoreText.setTextBounds(0, 0, game.world.width, 20);

    var playButton = game.add.button(0, 0, 'play_button', this.startGame,
      this);
    playButton.anchor.setTo(0.5, 0.5);
    playButton.x = (game.world.width / 2);
    playButton.y = (game.world.height - (playButton.height + (game.world.height /
      8)));
  },

  /**
   * Start the game state.
   */
  startGame: function() {
    this.state.start('Game');
  }

};
