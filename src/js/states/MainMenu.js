GameCtrl.MainMenu = function (game) {

        this.music = null;
        this.playButton = null;

};

GameCtrl.MainMenu.prototype = {

        create: function () {

                //        We've already preloaded our assets, so let's kick right into the Main Menu itself.
                //        Here all we're doing is playing some music and adding a picture and button
                //        Naturally I expect you to do something significantly better :)

                this.music = this.add.audio('titleMusic');
                this.music.play();

                this.game.stage.backgroundColor = '#333555';

                this.playButton = this.add.button(this.game.width / 2 - 160, this.game.height / 2 - 120, 'playButton', this.startGame, this, 'buttonOver', 'buttonOut', 'buttonOver');

        },

        update: function () {

                //        Do some nice funky main menu effect here

        },

        startGame: function (pointer) {

                //        Ok, the Play Button has been clicked or touched, so let's stop the music (otherwise it'll carry on playing)
                this.music.stop();

                //        And start the actual game
                this.game.state.start('Game');

        }

};