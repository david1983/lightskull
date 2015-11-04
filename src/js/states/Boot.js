GameCtrl = {

    /* Here we've just got some global level vars that persist regardless of State swaps */
    score: 0,

    /* If the music in your game needs to play through-out a few State swaps, then you could reference it here */
    music: null,

    /* Your game can check GameCtrl.orientated in internal loops to know if it should pause or not */
    orientated: false

};

GameCtrl.Boot = function (game) {
};

GameCtrl.Boot.prototype = {

    preload: function () {

        //  Here we load the assets required for our preloader (in this case a background and a loading bar)
        this.load.image('background', 'assets/images/background.png');
        this.load.image('preloaderBackground', 'assets/images/progress_bar_background.png');
        this.load.image('preloaderBar', 'assets/images/progress_bar.png');

    },

    create: function () {

        this.game.input.maxPointers = 1;
        this.game.stage.disableVisibilityChange = true;

        console.log([window.innerHeight,window.innerWidth]);

        window.addEventListener('resize',function(){
            if (this.game.device.desktop)
            {
                this.game.scaleMode = Phaser.ScaleManager.EXACT_FIT;
                this.game.scale.minWidth = 480;
                this.game.scale.minHeight = 260;
                this.game.scale.maxWidth =window.innerWidth;
                this.game.scale.maxHeight = window.innerHeight;
                this.game.scale.pageAlignHorizontally = true;
                this.game.scale.pageAlignVertically = true;
            }
            else
            {
                this.game.scaleMode = Phaser.ScaleManager.EXACT_FIT;
                this.game.scale.minWidth = 480;
                this.game.scale.minHeight = 260;
                this.game.scale.maxWidth = window.innerWidth;
                this.game.scale.maxHeight = window.innerHeight;
                this.game.scale.pageAlignHorizontally = true;
                this.game.scale.pageAlignVertically = true;
            }
        })
        this.game.state.start('Preloader');

    },

    gameResized: function (width, height) {

        //  This could be handy if you need to do any extra processing if the game resizes.
        //  A resize could happen if for example swapping orientation on a device.

    },

    enterIncorrectOrientation: function () {

        GameCtrl.orientated = false;

        document.getElementById('orientation').style.display = 'block';

    },

    leaveIncorrectOrientation: function () {

        GameCtrl.orientated = true;

        document.getElementById('orientation').style.display = 'none';

    }

};