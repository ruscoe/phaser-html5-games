/*
  Stabby Skeleton by Dan Ruscoe.
  Twitter: @danruscoe
  Web: http://danruscoe.com
*/

var game = new Phaser.Game(320, 480, Phaser.CANVAS, 'game');

game.state.add('Menu', Menu);
game.state.add('Game', Game);
game.state.add('GameOver', GameOver);

game.state.start('Menu');
