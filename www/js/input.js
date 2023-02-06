
(function() {
    var ALIASES = T.input.KEY_ALIASES = {
        87: 'forward',
        83: 'back',
        65: 'left',
        68: 'right',
        38: 'arrowForward',
        40: 'arrowBack',
        39: 'arrowRight',
        37: 'arrowLeft',
        32: 'space'
    };

    var captureRequested = false;

    T.captureInput = function() {
        $('BODY')
            .on('keydown', function(e) {
                if (e.which in ALIASES && !e.ctrlKey && !e.metaKey) {
                    T.input.keyState[ALIASES[e.which]] = true;

                    e.preventDefault();
                    e.stopPropagation();
                }

                if (e.which === 27) {
                    T.stopGame = true;

                    T.toggleMenu(true);
                }
            })
            .on('keyup', function(e) {
                if (e.which in ALIASES) {
                    T.input.keyState[ALIASES[e.which]] = false;

                    e.preventDefault();
                    e.stopPropagation();
                }
            })
            .on('click', function() {
                this.requestPointerLock();

                captureRequested = true;
            })
            .on('mousemove', function(e) {
                e = e.originalEvent;

                if (captureRequested) {
                    T.rotateCamera({
                        x: e.movementX / 100,
                        y: e.movementY / 100
                    });
                }
            })
            .on('click', '#game-reset', function() {
                T.toggleMenu(false);

                T.player.camera.pos = [0, 0, 0];
                T.player.camera.rot = [0, 0, 0];

                T.player.camera.dirty = true;

                T.stopGame = false;
            });
    };
})();
